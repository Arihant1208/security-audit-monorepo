import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { readDataFile, listDataFiles } from "../data.js";

/** Map vulnerability type keywords to remediation guide filenames */
const REMEDIATION_MAP: Record<string, string> = {
  injection: "injection-prevention",
  "sql-injection": "injection-prevention",
  "command-injection": "injection-prevention",
  "template-injection": "injection-prevention",
  xss: "injection-prevention",
  authentication: "authentication-hardening",
  "brute-force": "authentication-hardening",
  "credential-stuffing": "authentication-hardening",
  session: "authentication-hardening",
  mfa: "authentication-hardening",
  "access-control": "access-control",
  authorization: "access-control",
  idor: "access-control",
  "privilege-escalation": "access-control",
  rbac: "access-control",
  cryptography: "cryptographic-best-practices",
  encryption: "cryptographic-best-practices",
  hashing: "cryptographic-best-practices",
  tls: "cryptographic-best-practices",
  certificates: "cryptographic-best-practices",
  infrastructure: "infrastructure-hardening",
  cloud: "infrastructure-hardening",
  container: "infrastructure-hardening",
  docker: "infrastructure-hardening",
  kubernetes: "infrastructure-hardening",
  secrets: "infrastructure-hardening",
  iam: "infrastructure-hardening",
  "supply-chain": "supply-chain-security",
  dependencies: "supply-chain-security",
  sbom: "supply-chain-security",
  "ci-cd": "supply-chain-security",
  pipeline: "supply-chain-security",
  logging: "logging-and-monitoring",
  monitoring: "logging-and-monitoring",
  alerting: "logging-and-monitoring",
  "incident-response": "logging-and-monitoring",
};

export function registerRemediationTools(server: McpServer): void {
  server.tool(
    "get-remediation",
    "Get detailed remediation guidance for a specific vulnerability type. Returns fix recommendations with code examples in multiple languages, step-by-step implementation, and defense-in-depth controls.",
    {
      vulnerability_type: z
        .string()
        .describe(
          "Vulnerability type keyword, e.g. 'sql-injection', 'authentication', 'access-control', " +
            "'cryptography', 'infrastructure', 'supply-chain', 'logging'. " +
            "Use a descriptive keyword to match the appropriate remediation guide."
        ),
      language: z
        .string()
        .optional()
        .describe(
          "Target programming language for code examples (e.g. 'python', 'javascript', 'java', 'csharp'). " +
            "The guide includes multi-language examples; this helps highlight the most relevant ones."
        ),
    },
    async ({ vulnerability_type, language }) => {
      // Find the best matching remediation guide
      const normalised = vulnerability_type.toLowerCase().replace(/\s+/g, "-");
      let guideFile = REMEDIATION_MAP[normalised];

      // Fuzzy fallback: try partial match
      if (!guideFile) {
        for (const [keyword, file] of Object.entries(REMEDIATION_MAP)) {
          if (normalised.includes(keyword) || keyword.includes(normalised)) {
            guideFile = file;
            break;
          }
        }
      }

      if (!guideFile) {
        const available = listDataFiles("remediation-guides");
        return {
          content: [
            {
              type: "text" as const,
              text:
                `No remediation guide found for "${vulnerability_type}". ` +
                `Available guides: ${available.join(", ")}. ` +
                `Try keywords like: injection, authentication, access-control, cryptography, ` +
                `infrastructure, supply-chain, logging.`,
            },
          ],
          isError: true,
        };
      }

      let content = readDataFile("remediation-guides", `${guideFile}.md`);

      // If a language is specified, add a note at the top
      if (language) {
        content =
          `> **Target language: ${language}** — Focus on ${language}-specific examples below.\n\n` +
          content;
      }

      return {
        content: [{ type: "text" as const, text: content }],
      };
    }
  );
}
