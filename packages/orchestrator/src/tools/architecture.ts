import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { DiagramType, DiagramFormat } from "@steve/core";

/**
 * Architecture mapping tools — Phase 2 of Steve's pipeline.
 * Generates architecture diagrams and provides multi-level architecture analysis.
 */
export function registerArchitectureTools(server: McpServer): void {
  server.tool(
    "generate-architecture-diagram",
    "Generate a Mermaid architecture diagram from system description. Provide components, connections, and diagram type. Steve will produce Mermaid source code you can render.",
    {
      diagram_type: z.enum([
        "system-context", "container", "component",
        "data-flow", "deployment", "threat-surface",
      ]).describe("Type of diagram to generate"),
      system_description: z.string().describe("Description of the system architecture, components, and their relationships"),
      components: z.string().optional().describe("JSON array of components with {id, name, type, technology}"),
      connections: z.string().optional().describe("JSON array of connections with {from, to, protocol, description}"),
      trust_boundaries: z.string().optional().describe("JSON array of trust boundaries with {name, level, components[]}"),
    },
    async ({ diagram_type, system_description, components, connections, trust_boundaries }) => {
      const instructions: string[] = [
        `# Generate ${diagram_type} Diagram`,
        `\n## System Description\n${system_description}`,
      ];

      if (components) instructions.push(`## Components\n\`\`\`json\n${components}\n\`\`\``);
      if (connections) instructions.push(`## Connections\n\`\`\`json\n${connections}\n\`\`\``);
      if (trust_boundaries) instructions.push(`## Trust Boundaries\n\`\`\`json\n${trust_boundaries}\n\`\`\``);

      const diagramGuide: Record<string, string> = {
        "system-context": `Generate a C4 Level 1 System Context diagram in Mermaid.
Use \`C4Context\` diagram type. Show:
- The main system as a container
- External users/actors
- External systems it integrates with
- Direction of data flow`,

        "container": `Generate a C4 Level 2 Container diagram in Mermaid.
Use \`C4Container\` or \`graph TB\` diagram type. Show:
- Each service/database/queue/cache as a separate node
- Communication protocols on edges (HTTP, gRPC, AMQP, etc.)
- Group containers by deployment boundary`,

        "component": `Generate a C4 Level 3 Component diagram in Mermaid.
Use \`graph TB\` diagram type. Show:
- Internal modules/classes within a specific service
- Dependencies between components
- External interfaces`,

        "data-flow": `Generate a Data Flow Diagram (DFD) in Mermaid.
Use \`flowchart LR\` diagram type. Show:
- Data sources and sinks
- Processes that transform data
- Data stores
- Trust boundaries as subgraph boxes
- Label flows with data types (PII, credentials, etc.)`,

        "deployment": `Generate a Deployment diagram in Mermaid.
Use \`graph TB\` diagram type. Show:
- Cloud regions/zones as subgraphs
- Compute instances, containers, serverless functions
- Load balancers, CDNs, DNS
- Network boundaries
- Ports and protocols`,

        "threat-surface": `Generate a Threat Surface diagram in Mermaid.
Use \`graph TB\` diagram type. Show:
- All system components
- Attack vectors as red dashed arrows pointing to entry points
- Trust boundaries as subgraph boxes
- Label each attack vector with threat type (STRIDE category)
- Color-code: green=secure, yellow=needs attention, red=vulnerable`,
      };

      instructions.push(`\n## Diagram Instructions\n${diagramGuide[diagram_type]}`);
      instructions.push(`\n## Output Format\nReturn ONLY valid Mermaid diagram source code wrapped in a \`\`\`mermaid code block. Include a brief description before the diagram.`);

      return {
        content: [{ type: "text" as const, text: instructions.join("\n\n") }],
      };
    }
  );

  server.tool(
    "analyze-architecture",
    "Perform multi-level architecture analysis for security implications. Returns findings with recommendations and alternatives for each architectural decision.",
    {
      architecture_json: z.string().describe("JSON representation of the system architecture (components, connections, trust boundaries)"),
      business_context_json: z.string().optional().describe("JSON of BusinessContext from Phase 0"),
    },
    async ({ architecture_json, business_context_json }) => {
      const prompt = [
        `# Architecture Security Analysis`,
        `\n## System Architecture\n\`\`\`json\n${architecture_json}\n\`\`\``,
        business_context_json ? `\n## Business Context\n\`\`\`json\n${business_context_json}\n\`\`\`` : "",
        `\n## Analysis Instructions`,
        `Analyze the architecture at these levels and for each finding provide:`,
        `1. **System Level** — Overall topology, redundancy, single points of failure`,
        `2. **Service Level** — Service boundaries, coupling, authentication between services`,
        `3. **Component Level** — Internal patterns, dependency injection, error handling`,
        `4. **Infrastructure Level** — Cloud config, container security, secrets management`,
        `5. **Data Level** — Data stores, encryption, data flow across trust boundaries`,
        `6. **Network Level** — Network segmentation, TLS, firewall rules`,
        `\nFor each finding, return JSON objects:`,
        `\`\`\`json`,
        `{`,
        `  "id": "ARCH-001",`,
        `  "component": "affected component",`,
        `  "finding": "what was found",`,
        `  "securityImplication": "why it matters",`,
        `  "recommendation": "what to do",`,
        `  "alternatives": [{"approach": "...", "pros": [...], "cons": [...], "effort": "low|medium|high"}],`,
        `  "priority": "critical|high|medium|low|info"`,
        `}`,
        `\`\`\``,
      ].join("\n");

      return {
        content: [{ type: "text" as const, text: prompt }],
      };
    }
  );
}
