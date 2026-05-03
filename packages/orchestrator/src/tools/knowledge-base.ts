import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { readDataFile, listDataFiles } from "../data.js";

const CATEGORY_DIRS: Record<string, string> = {
  identity: "identity-attacks",
  application: "application-attacks",
  infrastructure: "infrastructure-attacks",
  network: "network-attacks",
  "supply-chain": "supply-chain-attacks",
  data: "data-attacks",
  "client-side": "client-side-attacks",
};

export function registerKnowledgeBaseTools(server: McpServer): void {
  server.tool(
    "list-attack-patterns",
    "List known attack patterns from the security knowledge base, optionally filtered by category.",
    {
      category: z.string().optional().describe(
        "Filter: identity, application, infrastructure, network, supply-chain, data, client-side"
      ),
    },
    async ({ category }) => {
      const results: Array<{ category: string; name: string; slug: string }> = [];
      const categoriesToList = category
        ? { [category]: CATEGORY_DIRS[category] }
        : CATEGORY_DIRS;

      for (const [catId, dirName] of Object.entries(categoriesToList)) {
        if (!dirName) continue;
        const files = listDataFiles("knowledge-base", dirName);
        for (const slug of files) {
          results.push({
            category: catId,
            name: slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
            slug,
          });
        }
      }
      return {
        content: [{ type: "text" as const, text: JSON.stringify(results, null, 2) }],
      };
    }
  );

  server.tool(
    "get-attack-pattern",
    "Get full details of a specific attack pattern including description, mechanism, detection, and mitigation.",
    {
      category: z.string().describe("Attack category"),
      name: z.string().describe("Attack pattern slug, e.g. 'sql-injection'"),
    },
    async ({ category, name }) => {
      const dirName = CATEGORY_DIRS[category];
      if (!dirName) {
        return {
          content: [{
            type: "text" as const,
            text: `Unknown category "${category}". Valid: ${Object.keys(CATEGORY_DIRS).join(", ")}`,
          }],
          isError: true,
        };
      }
      try {
        const content = readDataFile("knowledge-base", dirName, `${name}.md`);
        return { content: [{ type: "text" as const, text: content }] };
      } catch {
        const available = listDataFiles("knowledge-base", dirName);
        return {
          content: [{
            type: "text" as const,
            text: `Attack pattern "${name}" not found in ${category}. Available: ${available.join(", ")}`,
          }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "match-vulnerabilities",
    "Analyze code context against the knowledge base to identify potential vulnerabilities.",
    {
      code_context: z.string().describe("Source code or config snippet to analyze"),
      language: z.string().describe("Programming language or technology"),
      layer: z.string().describe("Audit layer to focus on"),
    },
    async ({ code_context, language, layer }) => {
      const relevantPatterns: string[] = [];

      const layerToCategories: Record<string, string[]> = {
        "identity-access": ["identity"],
        "application-security": ["application"],
        "api-security": ["application"],
        "data-security": ["data"],
        "network-security": ["network"],
        "infrastructure-cloud": ["infrastructure"],
        "devops-cicd": ["supply-chain"],
        "supply-chain": ["supply-chain"],
        "client-side": ["client-side"],
        "monitoring-logging": [],
        "business-logic": ["application"],
        architecture: ["application", "infrastructure"],
      };

      const categories = layerToCategories[layer] ?? ["application"];

      for (const cat of categories) {
        const dirName = CATEGORY_DIRS[cat];
        if (!dirName) continue;
        const files = listDataFiles("knowledge-base", dirName);
        for (const slug of files) {
          try {
            const content = readDataFile("knowledge-base", dirName, `${slug}.md`);
            const detectionMatch = content.match(/## Detection[\s\S]*?(?=\n## |$)/i);
            const mitigationMatch = content.match(/## (?:Mitigation|Prevention|Remediation)[\s\S]*?(?=\n## |$)/i);
            if (detectionMatch || mitigationMatch) {
              relevantPatterns.push(
                `### ${slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}\n` +
                (detectionMatch?.[0] ?? "") + "\n" +
                (mitigationMatch?.[0] ?? "")
              );
            }
          } catch { /* skip missing files */ }
        }
      }

      const response = [
        `# Vulnerability Matching Context`,
        `**Language:** ${language}`,
        `**Audit Layer:** ${layer}`,
        `**Code Under Analysis:**\n\`\`\`${language}\n${code_context}\n\`\`\``,
        `\n---\n## Relevant Attack Patterns & Detection Rules\n`,
        ...relevantPatterns,
        `\n---\n> Cross-reference the code above against these detection rules to identify vulnerabilities.`,
      ].join("\n\n");

      return { content: [{ type: "text" as const, text: response }] };
    }
  );
}
