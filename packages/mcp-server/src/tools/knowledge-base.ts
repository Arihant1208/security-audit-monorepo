import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { readDataFile, listDataFiles, listDataDirs } from "../data.js";

/** Map category IDs to directory names */
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
    "List known attack patterns from the security knowledge base. Optionally filter by category (identity, application, infrastructure, network, supply-chain, data, client-side).",
    {
      category: z
        .string()
        .optional()
        .describe(
          "Filter by category: identity, application, infrastructure, network, supply-chain, data, client-side"
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
            name: slug
              .replace(/-/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase()),
            slug,
          });
        }
      }

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(results, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    "get-attack-pattern",
    "Get the full details of a specific attack pattern including description, attack mechanism, detection checks, impact assessment, and mitigation guidance.",
    {
      category: z
        .string()
        .describe(
          "Attack category: identity, application, infrastructure, network, supply-chain, data, client-side"
        ),
      name: z
        .string()
        .describe(
          "Attack pattern slug, e.g. 'sql-injection', 'brute-force', 'cloud-misconfiguration'"
        ),
    },
    async ({ category, name }) => {
      const dirName = CATEGORY_DIRS[category];
      if (!dirName) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Unknown category "${category}". Valid: ${Object.keys(CATEGORY_DIRS).join(", ")}`,
            },
          ],
          isError: true,
        };
      }
      try {
        const content = readDataFile("knowledge-base", dirName, `${name}.md`);
        return {
          content: [{ type: "text" as const, text: content }],
        };
      } catch {
        const available = listDataFiles("knowledge-base", dirName);
        return {
          content: [
            {
              type: "text" as const,
              text: `Attack pattern "${name}" not found in ${category}. Available: ${available.join(", ")}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "match-vulnerabilities",
    "Analyze code context against the security knowledge base to identify potential vulnerabilities. Provide source code or configuration snippets and the server will match against known attack patterns, returning relevant detection checks and risk indicators.",
    {
      code_context: z
        .string()
        .describe(
          "Source code snippet, configuration, or description of the code pattern to analyze"
        ),
      language: z
        .string()
        .describe(
          "Programming language or technology (e.g. 'python', 'javascript', 'terraform', 'dockerfile')"
        ),
      layer: z
        .string()
        .describe(
          "Audit layer to focus on: architecture, identity-access, application-security, api-security, data-security, network-security, infrastructure-cloud, devops-cicd, supply-chain, client-side, monitoring-logging, business-logic"
        ),
    },
    async ({ code_context, language, layer }) => {
      // Build the vulnerability matching context by loading relevant
      // attack patterns and checklists for the specified layer.
      // The LLM agent will use this context to identify matches.
      const relevantPatterns: string[] = [];

      // Map audit layers to KB categories
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
            const content = readDataFile(
              "knowledge-base",
              dirName,
              `${slug}.md`
            );
            // Extract detection checks and mitigation sections
            const detectionMatch = content.match(
              /## Detection Checks\n([\s\S]*?)(?=\n##|$)/
            );
            const mitigationMatch = content.match(
              /## Mitigation\n([\s\S]*?)(?=\n##|$)/
            );
            const titleMatch = content.match(/^# (.+)/m);

            if (detectionMatch) {
              relevantPatterns.push(
                `### ${titleMatch?.[1] ?? slug}\n` +
                  `**Detection Checks:**\n${detectionMatch[1].trim()}\n` +
                  (mitigationMatch
                    ? `**Mitigation:**\n${mitigationMatch[1].trim()}`
                    : "")
              );
            }
          } catch {
            // Skip unreadable files
          }
        }
      }

      const response = [
        `# Vulnerability Matching Context`,
        ``,
        `**Language:** ${language}`,
        `**Layer:** ${layer}`,
        `**Code to analyze:**`,
        "```",
        code_context,
        "```",
        ``,
        `## Relevant Attack Patterns and Detection Checks`,
        ``,
        `Use the following detection checks against the code above. For each check that FAILS, report it as a potential vulnerability with the attack pattern name, severity, and recommended mitigation.`,
        ``,
        ...relevantPatterns,
      ].join("\n");

      return {
        content: [{ type: "text" as const, text: response }],
      };
    }
  );
}
