import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

/**
 * AI/Agentic Opportunity Analysis tools — Phase 6 of Steve's pipeline.
 * Identifies where AI/ML can improve the target system (security + general).
 */
export function registerAIOpportunityTools(server: McpServer): void {
  server.tool(
    "analyze-ai-opportunities",
    "Analyze a system for AI/ML improvement opportunities. Examines architecture and codebase patterns to identify where AI could enhance security, automate processes, or improve features.",
    {
      architecture_json: z.string().describe("JSON representation of system architecture"),
      business_context_json: z.string().describe("JSON of BusinessContext from Phase 0"),
      tech_stack: z.string().describe("Comma-separated list of technologies in use"),
      code_patterns: z.string().optional().describe("Description of key code patterns found (auth flows, data processing, APIs, etc.)"),
    },
    async ({ architecture_json, business_context_json, tech_stack, code_patterns }) => {
      const prompt = [
        `# AI/ML Opportunity Analysis`,
        `\n## System Architecture\n\`\`\`json\n${architecture_json}\n\`\`\``,
        `\n## Business Context\n\`\`\`json\n${business_context_json}\n\`\`\``,
        `\n## Tech Stack: ${tech_stack}`,
        code_patterns ? `\n## Code Patterns\n${code_patterns}` : "",
        `\n## Analysis Instructions`,
        `Identify AI/ML opportunities in two categories:`,
        ``,
        `### Category 1: Security AI Opportunities`,
        `Look for areas where AI can improve security:`,
        `- **Anomaly detection** — unusual login patterns, API usage spikes, data access anomalies`,
        `- **Threat detection** — real-time threat intelligence integration, AI WAF rules`,
        `- **Automated response** — auto-blocking, circuit breakers, dynamic rate limiting`,
        `- **Code analysis** — AI-powered vulnerability scanning, secret detection`,
        `- **Log analysis** — intelligent alerting, pattern recognition in logs`,
        `- **Access patterns** — smart RBAC suggestions based on actual usage`,
        ``,
        `### Category 2: General AI Opportunities`,
        `Look for areas where AI can improve the system:`,
        `- **Feature enhancement** — recommendation engines, search improvement, personalization`,
        `- **Process automation** — workflow automation, agentic task handling`,
        `- **Data processing** — NLP for text, OCR, classification, extraction`,
        `- **Predictive analytics** — forecasting, churn prediction, resource optimization`,
        `- **Developer experience** — code generation, testing, documentation`,
        ``,
        `### For Each Opportunity, Return:`,
        `\`\`\`json`,
        `{`,
        `  "id": "AI-001",`,
        `  "title": "Anomaly Detection for Auth",`,
        `  "category": "security-monitoring|anomaly-detection|threat-detection|automated-response|code-analysis|user-experience|data-processing|recommendation|automation|predictive",`,
        `  "component": "affected component",`,
        `  "description": "what the AI would do",`,
        `  "benefits": ["benefit 1", "benefit 2"],`,
        `  "implementationApproach": "high-level how",`,
        `  "complexity": "low|medium|high|very-high",`,
        `  "estimatedImpact": "low|medium|high",`,
        `  "privacyImplications": ["concern 1"],`,
        `  "aiSecurityRisks": ["risk 1"],`,
        `  "prerequisites": ["what's needed first"]`,
        `}`,
        `\`\`\``,
        ``,
        `### Also provide a risk assessment for each:`,
        `\`\`\`json`,
        `{`,
        `  "opportunity": "AI-001",`,
        `  "dataPrivacyRisk": "low|medium|high",`,
        `  "modelSecurityRisk": "low|medium|high",`,
        `  "ethicalConcerns": ["concern 1"],`,
        `  "costEstimate": "low|medium|high",`,
        `  "recommendation": "proceed|proceed-with-caution|defer|avoid",`,
        `  "rationale": "why"`,
        `}`,
        `\`\`\``,
      ].join("\n");

      return {
        content: [{ type: "text" as const, text: prompt }],
      };
    }
  );
}
