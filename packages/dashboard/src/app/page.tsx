export default function Dashboard() {
  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem" }}>
      <header style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", margin: 0 }}>🕵️ Steve — Security Dashboard</h1>
        <p style={{ color: "#666", marginTop: "0.5rem" }}>
          End-to-End Autonomous Security Agent — Results Overview
        </p>
      </header>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        <ScoreCard title="Overall Risk" value="—" color="#e74c3c" />
        <ScoreCard title="Critical" value="0" color="#e74c3c" />
        <ScoreCard title="High" value="0" color="#f39c12" />
        <ScoreCard title="Medium" value="0" color="#f1c40f" />
        <ScoreCard title="Low" value="0" color="#27ae60" />
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        <div>
          <h2>Pipeline Status</h2>
          <PipelineStatus />
        </div>
        <div>
          <h2>Top Findings</h2>
          <p style={{ color: "#666" }}>Run a Steve audit to see results here.</p>
        </div>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>Architecture Diagrams</h2>
        <p style={{ color: "#666" }}>
          Mermaid diagrams will render here after running <code>/steve-audit</code> or <code>/steve-diagram</code>.
        </p>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>License Compliance</h2>
        <p style={{ color: "#666" }}>Dependency license status will appear after a license scan.</p>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>AI Opportunities</h2>
        <p style={{ color: "#666" }}>AI/ML improvement recommendations will appear after analysis.</p>
      </section>
    </main>
  );
}

function ScoreCard({ title, value, color }: { title: string; value: string; color: string }) {
  return (
    <div style={{
      border: "1px solid #e0e0e0",
      borderRadius: "8px",
      padding: "1.5rem",
      textAlign: "center",
      borderTop: `4px solid ${color}`,
    }}>
      <div style={{ fontSize: "2rem", fontWeight: "bold", color }}>{value}</div>
      <div style={{ color: "#666", marginTop: "0.5rem" }}>{title}</div>
    </div>
  );
}

function PipelineStatus() {
  const phases = [
    { name: "Business Discovery", status: "pending" },
    { name: "System Discovery", status: "pending" },
    { name: "Architecture Mapping", status: "pending" },
    { name: "Threat Modeling", status: "pending" },
    { name: "Layered Security Audit", status: "pending" },
    { name: "License Compliance", status: "pending" },
    { name: "AI Opportunity Analysis", status: "pending" },
    { name: "Risk & Remediation", status: "pending" },
    { name: "Report Generation", status: "pending" },
  ];

  return (
    <ul style={{ listStyle: "none", padding: 0 }}>
      {phases.map((phase, i) => (
        <li key={i} style={{ padding: "0.5rem 0", borderBottom: "1px solid #eee" }}>
          <span style={{ marginRight: "0.5rem" }}>⏳</span>
          Phase {i}: {phase.name}
        </li>
      ))}
    </ul>
  );
}
