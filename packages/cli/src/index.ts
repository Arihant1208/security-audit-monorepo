#!/usr/bin/env node

/**
 * Steve CLI — run security audits from the command line.
 *
 * Usage:
 *   steve audit ./my-project          Full autonomous audit
 *   steve scan ./my-project           Quick security scan
 *   steve license ./my-project        License compliance only
 *   steve diagram ./my-project        Architecture diagrams only
 *   steve report ./my-project         Generate from previous audit
 *   steve dashboard                   Launch web dashboard
 */

import { Command } from "commander";
import { PipelinePhase, PHASE_LABELS } from "@steve/core";

const program = new Command();

program
  .name("steve")
  .description("Steve — End-to-End Autonomous Security Agent")
  .version("2.0.0");

// ── Full audit ──────────────────────────────────────────────────────────────
program
  .command("audit")
  .description("Run a full end-to-end security audit (all 9 phases)")
  .argument("[target]", "Path to the project to audit", ".")
  .option("-o, --output <dir>", "Output directory for reports", "audit-results")
  .option("--ai-engine <url>", "URL of the Steve AI engine", "http://localhost:8100")
  .option("--no-dashboard", "Skip dashboard generation")
  .action(async (target: string, opts: Record<string, string | boolean>) => {
    console.log("\n🕵️  Steve — Full Security Audit\n");
    console.log(`Target:  ${target}`);
    console.log(`Output:  ${opts.output}`);
    console.log(`Phases:  All 9 phases`);
    console.log("");

    for (const [phase, label] of Object.entries(PHASE_LABELS)) {
      console.log(`  Phase ${phase}: ${label}`);
    }

    console.log("\n⏳ Starting audit pipeline...\n");
    console.log("🔌 Connect Steve to an LLM agent (VS Code Copilot or external) to execute.");
    console.log("   The CLI orchestrates; the LLM agent performs analysis.\n");
    console.log("   For autonomous mode, run: steve audit --auto (requires AI engine)\n");
  });

// ── Quick scan ──────────────────────────────────────────────────────────────
program
  .command("scan")
  .description("Quick security scan (Phases 0-1-4 only — discovery + audit)")
  .argument("[target]", "Path to the project to scan", ".")
  .option("-o, --output <dir>", "Output directory", "audit-results")
  .action(async (target: string, opts: Record<string, string>) => {
    console.log("\n🔍 Steve — Quick Security Scan\n");
    console.log(`Target:  ${target}`);
    console.log(`Phases:  Business Discovery → System Discovery → Security Audit`);
    console.log("\n⏳ Starting scan...\n");
  });

// ── License compliance ──────────────────────────────────────────────────────
program
  .command("license")
  .description("Run license compliance analysis only (Phase 5)")
  .argument("[target]", "Path to the project", ".")
  .option("-o, --output <dir>", "Output directory", "audit-results")
  .option("--policy <type>", "License policy: proprietary, saas, open-source-permissive, open-source-copyleft, internal", "proprietary")
  .action(async (target: string, opts: Record<string, string>) => {
    console.log("\n📜 Steve — License Compliance Scan\n");
    console.log(`Target:  ${target}`);
    console.log(`Policy:  ${opts.policy}`);
    console.log("\n⏳ Scanning dependencies...\n");
  });

// ── Diagram generation ──────────────────────────────────────────────────────
program
  .command("diagram")
  .description("Generate architecture diagrams (Phase 2)")
  .argument("[target]", "Path to the project", ".")
  .option("-o, --output <dir>", "Output directory", "audit-results")
  .option("--type <type>", "Diagram type: system-context, container, component, data-flow, deployment, threat-surface", "container")
  .action(async (target: string, opts: Record<string, string>) => {
    console.log("\n📐 Steve — Architecture Diagram Generation\n");
    console.log(`Target:  ${target}`);
    console.log(`Type:    ${opts.type}`);
    console.log("\n⏳ Analyzing architecture...\n");
  });

// ── Report generation ───────────────────────────────────────────────────────
program
  .command("report")
  .description("Generate reports from a previous audit")
  .argument("[target]", "Path to audit-results directory", "audit-results")
  .option("--format <fmt>", "Output format: markdown, html, pdf", "markdown")
  .action(async (target: string, opts: Record<string, string>) => {
    console.log("\n📊 Steve — Report Generation\n");
    console.log(`Source:  ${target}`);
    console.log(`Format:  ${opts.format}`);
    console.log("\n⏳ Generating reports...\n");
  });

// ── Dashboard ───────────────────────────────────────────────────────────────
program
  .command("dashboard")
  .description("Launch the Steve web dashboard")
  .option("-p, --port <port>", "Dashboard port", "4000")
  .action(async (opts: Record<string, string>) => {
    console.log("\n🖥️  Steve — Web Dashboard\n");
    console.log(`Starting dashboard on http://localhost:${opts.port}...`);
    console.log("(Dashboard package: packages/dashboard)\n");
  });

program.parse();
