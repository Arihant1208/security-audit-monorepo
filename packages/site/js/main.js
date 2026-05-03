/**
 * Steve — Main JS (shared across all pages)
 * Handles: copy buttons, nav auth state, API base URL
 */

const API_BASE = window.location.origin;

// ── Auth helpers ────────────────────────────────────────────────────────────

function getToken() {
  return localStorage.getItem("steve_token");
}

function getUser() {
  const raw = localStorage.getItem("steve_user");
  return raw ? JSON.parse(raw) : null;
}

function setAuth(token, user) {
  localStorage.setItem("steve_token", token);
  localStorage.setItem("steve_user", JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem("steve_token");
  localStorage.removeItem("steve_user");
}

function isLoggedIn() {
  return !!getToken();
}

async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers["Authorization"] = "Bearer " + token;

  const res = await fetch(API_BASE + path, { ...options, headers });
  if (res.status === 401) {
    clearAuth();
    window.location.href = "/login.html";
    throw new Error("Session expired");
  }
  return res;
}

// ── Nav auth state ──────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  // Update nav based on login state
  const navDash = document.getElementById("nav-dashboard");
  const navCta = document.getElementById("nav-cta");
  if (isLoggedIn()) {
    if (navDash) navDash.classList.remove("hidden");
    if (navCta) {
      navCta.textContent = "Dashboard";
      navCta.href = "dashboard.html";
    }
  }

  // Copy buttons
  document.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const code = btn.parentElement.querySelector("code");
      if (!code) return;
      navigator.clipboard.writeText(code.textContent.trim()).then(() => {
        const orig = btn.textContent;
        btn.textContent = "Copied!";
        setTimeout(() => { btn.textContent = orig; }, 2000);
      });
    });
  });
});
