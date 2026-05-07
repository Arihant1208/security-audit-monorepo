/**
 * Steve — Dashboard JS
 * Handles: auth gate, tabs, reports, API keys, usage
 */

document.addEventListener("DOMContentLoaded", () => {
  const authGate = document.getElementById("auth-gate");
  const dashContent = document.getElementById("dash-content");

  // Auth check
  if (!isLoggedIn()) {
    authGate.classList.remove("hidden");
    return;
  }
  dashContent.classList.remove("hidden");

  // Greeting
  const user = getUser();
  const greeting = document.getElementById("user-greeting");
  if (greeting && user) {
    greeting.textContent = "Welcome back, " + (user.name || user.email);
  }

  // Logout
  document.getElementById("logout-btn").addEventListener("click", async (e) => {
    e.preventDefault();
    try { await apiFetch("/api/auth/logout", { method: "POST" }); } catch {}
    clearAuth();
    window.location.href = "/";
  });

  // ── Tabs ──────────────────────────────────────────────────────────────
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".tab-pane").forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("tab-" + btn.dataset.tab).classList.add("active");
    });
  });

  // ── Load data ─────────────────────────────────────────────────────────
  loadReports();
  loadKeys();
  loadUsage();

  // ── Upload Report ─────────────────────────────────────────────────────
  const uploadBtn = document.getElementById("upload-report-btn");
  const uploadModal = document.getElementById("upload-modal");
  const uploadCancelBtn = document.getElementById("upload-cancel-btn");
  const uploadSubmitBtn = document.getElementById("upload-submit-btn");
  const uploadDropzone = document.getElementById("upload-dropzone");
  const uploadFileInput = document.getElementById("upload-file-input");
  const uploadPreview = document.getElementById("upload-preview");
  const uploadError = document.getElementById("upload-error");

  let pendingReport = null;

  uploadBtn.addEventListener("click", () => {
    uploadModal.classList.remove("hidden");
    uploadModal.style.display = "flex";
    resetUpload();
  });

  uploadCancelBtn.addEventListener("click", () => {
    uploadModal.classList.add("hidden");
    uploadModal.style.display = "none";
    resetUpload();
  });

  // Click outside modal to close
  uploadModal.addEventListener("click", (e) => {
    if (e.target === uploadModal) {
      uploadModal.classList.add("hidden");
      uploadModal.style.display = "none";
      resetUpload();
    }
  });

  uploadDropzone.addEventListener("click", () => uploadFileInput.click());
  uploadDropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadDropzone.style.borderColor = "var(--accent)";
  });
  uploadDropzone.addEventListener("dragleave", () => {
    uploadDropzone.style.borderColor = "var(--border)";
  });
  uploadDropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadDropzone.style.borderColor = "var(--border)";
    const file = e.dataTransfer.files[0];
    if (file) handleUploadFile(file);
  });
  uploadFileInput.addEventListener("change", () => {
    const file = uploadFileInput.files[0];
    if (file) handleUploadFile(file);
  });

  function handleUploadFile(file) {
    uploadError.classList.add("hidden");
    uploadPreview.classList.add("hidden");
    pendingReport = null;

    if (!file.name.endsWith(".json")) {
      showUploadError("Please select a .json file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showUploadError("File too large (max 10 MB).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data.project_name) {
          showUploadError('Invalid report: missing "project_name" field.');
          return;
        }
        pendingReport = data;
        showUploadPreview(data);
        uploadSubmitBtn.disabled = false;
      } catch (err) {
        showUploadError("Invalid JSON: " + err.message);
      }
    };
    reader.readAsText(file);
  }

  function showUploadPreview(data) {
    document.getElementById("upload-project-name").textContent = data.project_name;
    const badge = document.getElementById("upload-risk-badge");
    if (data.risk_score != null) {
      badge.textContent = "Risk: " + data.risk_score;
      badge.className = "severity-badge " + (data.risk_score >= 9 ? "critical" : data.risk_score >= 7 ? "high" : data.risk_score >= 4 ? "medium" : "low");
    } else {
      badge.textContent = "No score";
      badge.className = "severity-badge";
    }
    const summary = data.summary || {};
    const findings = Array.isArray(data.findings) ? data.findings.length : 0;
    document.getElementById("upload-summary-text").textContent =
      `${findings} findings — Critical: ${summary.critical || 0}, High: ${summary.high || 0}, Medium: ${summary.medium || 0}, Low: ${summary.low || 0}`;
    uploadPreview.classList.remove("hidden");
  }

  function showUploadError(msg) {
    document.getElementById("upload-error-text").textContent = msg;
    uploadError.classList.remove("hidden");
  }

  function resetUpload() {
    pendingReport = null;
    uploadPreview.classList.add("hidden");
    uploadError.classList.add("hidden");
    uploadSubmitBtn.disabled = true;
    uploadFileInput.value = "";
  }

  uploadSubmitBtn.addEventListener("click", async () => {
    if (!pendingReport) return;
    uploadSubmitBtn.disabled = true;
    uploadSubmitBtn.textContent = "Uploading...";

    try {
      const res = await apiFetch("/api/reports", {
        method: "POST",
        body: JSON.stringify(pendingReport),
      });
      const data = await res.json();
      if (!res.ok) {
        showUploadError(data.error || "Upload failed.");
        uploadSubmitBtn.disabled = false;
        uploadSubmitBtn.textContent = "Upload";
        return;
      }
      // Success
      uploadModal.classList.add("hidden");
      uploadModal.style.display = "none";
      resetUpload();
      uploadSubmitBtn.textContent = "Upload";
      loadReports(); // Refresh report list
    } catch (err) {
      showUploadError("Network error: " + err.message);
      uploadSubmitBtn.disabled = false;
      uploadSubmitBtn.textContent = "Upload";
    }
  });

  // ── API Keys ──────────────────────────────────────────────────────────
  const createKeyBtn = document.getElementById("create-key-btn");
  const newKeyForm = document.getElementById("new-key-form");
  const cancelKeyBtn = document.getElementById("cancel-key-btn");

  createKeyBtn.addEventListener("click", () => {
    newKeyForm.classList.remove("hidden");
    createKeyBtn.classList.add("hidden");
  });

  cancelKeyBtn.addEventListener("click", () => {
    newKeyForm.classList.add("hidden");
    createKeyBtn.classList.remove("hidden");
  });

  document.getElementById("create-key-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("key-name").value.trim() || "API Key";
    try {
      const res = await apiFetch("/api/keys", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (res.ok && data.key) {
        newKeyForm.classList.add("hidden");
        createKeyBtn.classList.remove("hidden");
        // Show revealed key
        const revealBox = document.getElementById("key-reveal-box");
        revealBox.classList.remove("hidden");
        document.getElementById("revealed-key").textContent = data.key.raw_key;

        document.getElementById("copy-new-key").onclick = () => {
          navigator.clipboard.writeText(data.key.raw_key).then(() => {
            document.getElementById("copy-new-key").textContent = "Copied!";
            setTimeout(() => { document.getElementById("copy-new-key").textContent = "Copy Key"; }, 2000);
          });
        };

        document.getElementById("dismiss-key-reveal").onclick = () => {
          revealBox.classList.add("hidden");
        };

        loadKeys();
      }
    } catch (err) {
      console.error("Create key error:", err);
    }
  });
});

// ── Reports ───────────────────────────────────────────────────────────────

async function loadReports() {
  try {
    const res = await apiFetch("/api/reports");
    const data = await res.json();
    const reports = data.reports || [];

    const listEl = document.getElementById("report-list");
    const emptyEl = document.getElementById("reports-empty");
    const pipelineEl = document.getElementById("pipeline-status");
    const pipelineEmpty = document.getElementById("pipeline-empty");
    const findingsEl = document.getElementById("top-findings");
    const findingsEmpty = document.getElementById("findings-empty");

    if (reports.length === 0) {
      emptyEl.style.display = "";
      return;
    }
    emptyEl.style.display = "none";

    // Score cards from latest report
    const latest = reports[0];
    if (latest.summary) {
      const s = typeof latest.summary === "string" ? JSON.parse(latest.summary) : latest.summary;
      document.getElementById("sc-critical").textContent = s.critical || 0;
      document.getElementById("sc-high").textContent = s.high || 0;
      document.getElementById("sc-medium").textContent = s.medium || 0;
      document.getElementById("sc-low").textContent = s.low || 0;
    }

    // Pipeline status from latest
    if (latest.pipeline_state) {
      const state = typeof latest.pipeline_state === "string" ? JSON.parse(latest.pipeline_state) : latest.pipeline_state;
      if (state.phaseResults) {
        pipelineEmpty.style.display = "none";
        const phases = [
          "Business Discovery", "System Discovery", "Architecture Mapping",
          "Threat Modeling", "Security Audit", "License Compliance",
          "AI Opportunities", "Risk & Remediation", "Report Generation"
        ];
        pipelineEl.innerHTML = state.phaseResults.map((pr, i) => `
          <li>
            <span class="phase-dot ${pr.status}"></span>
            <span>${phases[i] || "Phase " + i}</span>
            <span style="margin-left:auto;font-size:0.8rem;color:var(--text-dim);">${pr.status}</span>
          </li>
        `).join("");
      }
    }

    // Findings from latest
    if (latest.findings) {
      const findings = typeof latest.findings === "string" ? JSON.parse(latest.findings) : latest.findings;
      if (Array.isArray(findings) && findings.length > 0) {
        findingsEmpty.style.display = "none";
        findingsEl.innerHTML = findings.slice(0, 8).map((f) => `
          <li>
            <span class="severity-badge ${(f.severity || "medium").toLowerCase()}">${f.severity || "Medium"}</span>
            <span>${escapeHtml(f.title || f.description || "Finding")}</span>
          </li>
        `).join("");
      }
    }

    // Report list
    listEl.innerHTML = reports.map((r) => `
      <li class="report-item" data-id="${r.id}">
        <div>
          <strong>${escapeHtml(r.project_name)}</strong>
          <div class="report-meta">
            <span>${r.status}</span>
            <span>${r.risk_score != null ? "Risk: " + r.risk_score : ""}</span>
            <span>${new Date(r.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        <span style="color:var(--text-dim);">&#8250;</span>
      </li>
    `).join("");

  } catch (err) {
    console.error("Load reports error:", err);
  }
}

// ── API Keys ──────────────────────────────────────────────────────────────

async function loadKeys() {
  try {
    const res = await apiFetch("/api/keys");
    const data = await res.json();
    const keys = data.keys || [];

    const listEl = document.getElementById("key-list");
    listEl.innerHTML = keys.map((k) => `
      <li class="key-item ${k.revoked_at ? "revoked" : ""}">
        <div class="key-info">
          <span class="key-name">${escapeHtml(k.name)}</span>
          <span class="key-prefix">${escapeHtml(k.key_prefix)}••••••••</span>
          <span class="key-meta">
            Created ${new Date(k.created_at).toLocaleDateString()}
            ${k.last_used_at ? " · Last used " + new Date(k.last_used_at).toLocaleDateString() : ""}
            ${k.revoked_at ? " · Revoked" : ""}
          </span>
        </div>
        ${k.revoked_at ? "" : `<button class="btn btn-sm btn-danger" onclick="revokeKey('${k.id}')">Revoke</button>`}
      </li>
    `).join("");

  } catch (err) {
    console.error("Load keys error:", err);
  }
}

async function revokeKey(keyId) {
  if (!confirm("Revoke this API key? This cannot be undone.")) return;
  try {
    await apiFetch("/api/keys/" + keyId, { method: "DELETE" });
    loadKeys();
  } catch (err) {
    console.error("Revoke key error:", err);
  }
}

// ── Usage ─────────────────────────────────────────────────────────────────

async function loadUsage() {
  try {
    const res = await apiFetch("/api/usage");
    const data = await res.json();

    document.getElementById("usage-total").textContent = data.total?.total || 0;
    document.getElementById("usage-days").textContent = data.total?.active_days || 0;

    const tbody = document.getElementById("usage-tbody");
    const emptyEl = document.getElementById("usage-empty");
    const tools = data.by_tool || [];

    if (tools.length === 0) {
      emptyEl.style.display = "";
      return;
    }
    emptyEl.style.display = "none";

    tbody.innerHTML = tools.map((t) => `
      <tr>
        <td><code>${escapeHtml(t.tool_name)}</code></td>
        <td>${t.calls}</td>
        <td>${t.avg_ms ? t.avg_ms + "ms" : "—"}</td>
      </tr>
    `).join("");

  } catch (err) {
    console.error("Load usage error:", err);
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────

function escapeHtml(str) {
  if (!str) return "";
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
