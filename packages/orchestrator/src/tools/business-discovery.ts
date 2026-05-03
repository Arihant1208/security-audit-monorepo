import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { BusinessContext, ClarifyingQuestion } from "@steve/core";

/**
 * Business Discovery tools — Phase 0 of Steve's pipeline.
 * Auto-infers business context from a project, then generates
 * clarifying questions to fill gaps.
 */
export function registerBusinessDiscoveryTools(server: McpServer): void {
  server.tool(
    "infer-business-context",
    "Analyze project files to auto-infer business context: industry, data sensitivity, compliance needs, scale, and critical functions. Provide the contents of key files (README, package.json, config, etc.) and Steve will infer the business context with confidence scores.",
    {
      project_name: z.string().describe("Name of the project being audited"),
      readme_content: z.string().optional().describe("Contents of the project's README"),
      package_manifest: z.string().optional().describe("Contents of package.json / Cargo.toml / requirements.txt etc."),
      config_files: z.string().optional().describe("Concatenated contents of key config files (docker-compose, .env.example, CI config)"),
      file_tree: z.string().optional().describe("Project file tree listing"),
      additional_docs: z.string().optional().describe("Any additional documentation content"),
    },
    async ({ project_name, readme_content, package_manifest, config_files, file_tree, additional_docs }) => {
      // Build inference context for the LLM agent
      const sections: string[] = [
        `# Business Context Inference for: ${project_name}`,
        `\nAnalyze the following project artifacts to infer the business context.\n`,
      ];

      if (readme_content) sections.push(`## README\n\`\`\`\n${readme_content}\n\`\`\``);
      if (package_manifest) sections.push(`## Package Manifest\n\`\`\`\n${package_manifest}\n\`\`\``);
      if (config_files) sections.push(`## Configuration Files\n\`\`\`\n${config_files}\n\`\`\``);
      if (file_tree) sections.push(`## File Tree\n\`\`\`\n${file_tree}\n\`\`\``);
      if (additional_docs) sections.push(`## Additional Documentation\n${additional_docs}`);

      sections.push(`
## Instructions

Based on the above artifacts, infer and return a JSON object with this structure:

\`\`\`json
{
  "description": "What the project does (1-2 sentences)",
  "industry": "healthcare | finance | education | government | ecommerce | saas | media | gaming | iot | infrastructure | other",
  "userTypes": ["end-users", "admins", "developers", ...],
  "revenueModel": "freemium | enterprise | marketplace | open-source | ...",
  "dataTypes": ["PII", "financial", "health records", "credentials", ...],
  "dataSensitivity": "public | internal | confidential | restricted",
  "complianceRequirements": ["hipaa", "pci-dss", "gdpr", "soc2", ...],
  "riskTolerance": "aggressive | moderate | conservative | regulated",
  "scale": "description of scale",
  "criticalFunctions": ["user authentication", "payment processing", ...],
  "confidence": {
    "description": 0.9,
    "industry": 0.7,
    ...
  }
}
\`\`\`

Be conservative with confidence scores. If you're uncertain, use lower scores.`);

      return {
        content: [{ type: "text" as const, text: sections.join("\n\n") }],
      };
    }
  );

  server.tool(
    "get-clarifying-questions",
    "Generate targeted clarifying questions based on auto-inferred business context. Call this after infer-business-context to fill in low-confidence fields.",
    {
      inferred_context: z.string().describe("JSON string of the inferred BusinessContext from infer-business-context"),
    },
    async ({ inferred_context }) => {
      let context: Partial<BusinessContext>;
      try {
        context = JSON.parse(inferred_context);
      } catch {
        return {
          content: [{ type: "text" as const, text: "Invalid JSON for inferred context." }],
          isError: true,
        };
      }

      const questions: ClarifyingQuestion[] = [];
      const confidence = context.confidence ?? {};

      if (!confidence.industry || confidence.industry < 0.7) {
        questions.push({
          id: "q-industry",
          question: `I inferred this is a "${context.industry ?? "unknown"}" project. What industry does this serve?`,
          context: "Industry determines which compliance frameworks and security priorities apply.",
          options: ["healthcare", "finance", "education", "government", "ecommerce", "saas", "media", "gaming", "iot", "infrastructure", "other"],
          field: "industry",
        });
      }

      if (!confidence.dataSensitivity || confidence.dataSensitivity < 0.7) {
        questions.push({
          id: "q-data-sensitivity",
          question: "What is the highest sensitivity level of data this system handles?",
          context: "Data sensitivity drives encryption requirements, access controls, and audit depth.",
          options: ["public", "internal", "confidential", "restricted"],
          field: "dataSensitivity",
        });
      }

      if (!confidence.complianceRequirements || confidence.complianceRequirements < 0.6) {
        questions.push({
          id: "q-compliance",
          question: "Which compliance frameworks apply to this project?",
          context: "Compliance requirements affect which audit checks are mandatory vs advisory.",
          options: ["hipaa", "pci-dss", "gdpr", "soc2", "iso27001", "fedramp", "ccpa", "none"],
          field: "complianceRequirements",
        });
      }

      if (!confidence.riskTolerance || confidence.riskTolerance < 0.5) {
        questions.push({
          id: "q-risk-tolerance",
          question: "What is the organization's risk tolerance?",
          context: "This determines how aggressively Steve prioritizes findings.",
          options: ["aggressive (startup-fast, accept more risk)", "moderate (balanced)", "conservative (enterprise, minimize risk)", "regulated (compliance-driven)"],
          field: "riskTolerance",
        });
      }

      if (!context.criticalFunctions || context.criticalFunctions.length === 0) {
        questions.push({
          id: "q-critical",
          question: "What are the most critical business functions that must NOT go down?",
          context: "Critical functions get higher risk scores and priority remediation.",
          field: "criticalFunctions",
        });
      }

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            questions_count: questions.length,
            questions,
            message: questions.length === 0
              ? "Business context is well-understood. No clarifying questions needed."
              : `${questions.length} clarifying questions to improve audit accuracy.`,
          }, null, 2),
        }],
      };
    }
  );
}
