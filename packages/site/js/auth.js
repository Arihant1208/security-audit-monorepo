/**
 * Steve — Auth JS (signup + login pages)
 */

document.addEventListener("DOMContentLoaded", () => {
  // Redirect if already logged in
  if (isLoggedIn() && !window.location.pathname.includes("dashboard")) {
    // Don't redirect from signup success state
  }

  // ── Signup ──────────────────────────────────────────────────────────────
  const signupForm = document.getElementById("signup-form");
  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const errEl = document.getElementById("signup-error");
      errEl.classList.remove("visible");

      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;

      if (password.length < 8) {
        errEl.textContent = "Password must be at least 8 characters.";
        errEl.classList.add("visible");
        return;
      }

      const btn = signupForm.querySelector("button[type=submit]");
      btn.disabled = true;
      btn.textContent = "Creating account...";

      try {
        const res = await fetch(API_BASE + "/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          errEl.textContent = data.error || "Something went wrong.";
          errEl.classList.add("visible");
          btn.disabled = false;
          btn.textContent = "Create Account";
          return;
        }

        // Success! Store auth and show API key
        setAuth(data.token, data.user);

        // Show success card
        signupForm.parentElement.classList.add("hidden");
        const successCard = document.getElementById("signup-success");
        successCard.classList.remove("hidden");
        document.getElementById("new-api-key").textContent = data.apiKey;

      } catch (err) {
        errEl.textContent = "Network error. Please try again.";
        errEl.classList.add("visible");
        btn.disabled = false;
        btn.textContent = "Create Account";
      }
    });
  }

  // ── Login ───────────────────────────────────────────────────────────────
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const errEl = document.getElementById("login-error");
      errEl.classList.remove("visible");

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;

      const btn = loginForm.querySelector("button[type=submit]");
      btn.disabled = true;
      btn.textContent = "Logging in...";

      try {
        const res = await fetch(API_BASE + "/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          errEl.textContent = data.error || "Invalid credentials.";
          errEl.classList.add("visible");
          btn.disabled = false;
          btn.textContent = "Log In";
          return;
        }

        setAuth(data.token, data.user);
        window.location.href = "/dashboard.html";

      } catch (err) {
        errEl.textContent = "Network error. Please try again.";
        errEl.classList.add("visible");
        btn.disabled = false;
        btn.textContent = "Log In";
      }
    });
  }
});
