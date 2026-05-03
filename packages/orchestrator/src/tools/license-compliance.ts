import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { LicenseCategory, LicenseRisk } from "@steve/core";

/**
 * License compliance tools — Phase 5 of Steve's pipeline.
 * Analyzes dependency licenses, detects conflicts, and recommends alternatives.
 */

/** Known license classifications */
const LICENSE_CATEGORIES: Record<string, LicenseCategory> = {
  "MIT": "permissive",
  "ISC": "permissive",
  "BSD-2-Clause": "permissive",
  "BSD-3-Clause": "permissive",
  "Apache-2.0": "permissive",
  "Unlicense": "public-domain",
  "CC0-1.0": "public-domain",
  "0BSD": "public-domain",
  "LGPL-2.1": "weak-copyleft",
  "LGPL-3.0": "weak-copyleft",
  "MPL-2.0": "weak-copyleft",
  "EPL-2.0": "weak-copyleft",
  "GPL-2.0": "strong-copyleft",
  "GPL-3.0": "strong-copyleft",
  "AGPL-3.0": "strong-copyleft",
};

/** Risk assessment per category for typical SaaS/proprietary projects */
const CATEGORY_RISK: Record<LicenseCategory, LicenseRisk> = {
  permissive: "none",
  "public-domain": "none",
  "weak-copyleft": "medium",
  "strong-copyleft": "high",
  proprietary: "medium",
  unknown: "critical",
};

/** Common alternatives for copyleft-licensed packages */
const ALTERNATIVES_DB: Record<string, Array<{ package: string; license: string; description: string }>> = {
  "readline-sync": [
    { package: "prompts", license: "MIT", description: "Lightweight interactive prompts" },
    { package: "inquirer", license: "MIT", description: "Full-featured interactive CLI prompts" },
  ],
  "ghostscript": [
    { package: "pdf-lib", license: "MIT", description: "PDF creation and modification" },
    { package: "pdfkit", license: "MIT", description: "PDF generation toolkit" },
  ],
};

export function registerLicenseComplianceTools(server: McpServer): void {
  server.tool(
    "analyze-licenses",
    "Analyze dependency licenses from a package manifest. Provide the content of package.json (or lock file) and project license. Returns license classification, risk assessment, conflicts, and alternatives for each dependency.",
    {
      manifest_content: z.string().describe("Content of package.json, Cargo.toml, requirements.txt, or similar"),
      manifest_type: z.enum([
        "npm", "cargo", "pip", "go", "maven", "gem", "composer",
      ]).describe("Type of package manifest"),
      project_license: z.string().optional().describe("The project's own license (e.g. 'MIT', 'Apache-2.0', 'proprietary')"),
      lock_file_content: z.string().optional().describe("Content of lock file for transitive dependency analysis"),
    },
    async ({ manifest_content, manifest_type, project_license, lock_file_content }) => {
      const instructions = [
        `# License Compliance Analysis`,
        `\n## Project License: ${project_license ?? "Not specified (treat as proprietary)"}`,
        `## Manifest Type: ${manifest_type}`,
        `\n## Manifest Content\n\`\`\`\n${manifest_content}\n\`\`\``,
        lock_file_content ? `\n## Lock File (transitive deps)\n\`\`\`\n${lock_file_content.slice(0, 5000)}\n\`\`\`` : "",
        `\n## Known License Classifications`,
        `\`\`\`json\n${JSON.stringify(LICENSE_CATEGORIES, null, 2)}\n\`\`\``,
        `\n## Risk Matrix`,
        `\`\`\`json\n${JSON.stringify(CATEGORY_RISK, null, 2)}\n\`\`\``,
        `\n## Analysis Instructions`,
        `For each dependency found in the manifest:`,
        `1. Identify its SPDX license identifier`,
        `2. Classify: permissive, weak-copyleft, strong-copyleft, proprietary, public-domain, unknown`,
        `3. Assess risk level based on the project license (${project_license ?? "proprietary"})`,
        `4. Flag conflicts (e.g., GPL dependency in proprietary project)`,
        `5. For conflicts, suggest alternative packages with compatible licenses`,
        `\n## Output Format`,
        `Return a JSON object matching this structure:`,
        `\`\`\`json`,
        `{`,
        `  "projectLicense": "...",`,
        `  "totalDependencies": N,`,
        `  "directDependencies": N,`,
        `  "transitiveDependencies": N,`,
        `  "dependencies": [{"name": "...", "version": "...", "license": "SPDX", "licenseCategory": "...", "risk": "...", "isDirect": true}],`,
        `  "conflicts": [{"dependency": "...", "dependencyLicense": "...", "projectLicense": "...", "conflict": "...", "risk": "...", "recommendation": "...", "alternatives": [{"package": "...", "license": "...", "description": "...", "migrationEffort": "low|medium|high"}]}],`,
        `  "summary": {"byCategory": {...}, "byRisk": {...}, "compliant": true/false, "topIssues": ["..."]}`,
        `}`,
        `\`\`\``,
      ].join("\n");

      return {
        content: [{ type: "text" as const, text: instructions }],
      };
    }
  );

  server.tool(
    "get-license-policy",
    "Get the default license policy rules for a given project type. Returns which license categories and specific licenses are blocked.",
    {
      project_type: z.enum([
        "proprietary", "open-source-permissive", "open-source-copyleft", "saas", "internal",
      ]).describe("The type of project for policy selection"),
    },
    async ({ project_type }) => {
      const policies: Record<string, object> = {
        proprietary: {
          rules: [
            { id: "no-strong-copyleft", description: "No strong copyleft in proprietary projects", blocked: ["strong-copyleft"], severity: "critical" },
            { id: "no-agpl-saas", description: "AGPL triggers for SaaS/network use", blockedLicenses: ["AGPL-3.0"], severity: "critical" },
            { id: "flag-weak-copyleft", description: "Review weak copyleft for linking requirements", blocked: ["weak-copyleft"], severity: "medium" },
            { id: "flag-unknown", description: "Unknown licenses require legal review", blocked: ["unknown"], severity: "high" },
          ],
        },
        saas: {
          rules: [
            { id: "no-agpl", description: "AGPL requires source disclosure for network use", blockedLicenses: ["AGPL-3.0"], severity: "critical" },
            { id: "no-strong-copyleft", description: "GPL may require source disclosure", blocked: ["strong-copyleft"], severity: "high" },
            { id: "flag-unknown", description: "Unknown licenses need review", blocked: ["unknown"], severity: "high" },
          ],
        },
        "open-source-permissive": {
          rules: [
            { id: "flag-strong-copyleft", description: "Strong copyleft may be incompatible", blocked: ["strong-copyleft"], severity: "medium" },
            { id: "flag-unknown", description: "Unknown licenses need review", blocked: ["unknown"], severity: "medium" },
          ],
        },
        "open-source-copyleft": {
          rules: [
            { id: "flag-proprietary", description: "Proprietary deps incompatible", blocked: ["proprietary"], severity: "high" },
            { id: "flag-unknown", description: "Unknown licenses need review", blocked: ["unknown"], severity: "medium" },
          ],
        },
        internal: {
          rules: [
            { id: "flag-unknown", description: "Unknown licenses need review", blocked: ["unknown"], severity: "low" },
          ],
        },
      };

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({ project_type, policy: policies[project_type] }, null, 2),
        }],
      };
    }
  );
}
