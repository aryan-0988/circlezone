document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ script.js loaded");

  const form = document.getElementById("loginForm");
  const toggle = document.getElementById("togglePassword");

  // Handle login form submit
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const username = formData.get("username").trim();
      const password = formData.get("password").trim();

      console.log("📨 Logging in:", username);

      try {
        const res = await fetch("/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({ username, password }),
          credentials: "include",
        });

        const contentType = res.headers.get("content-type");

        if (res.ok && contentType && contentType.includes("text/html")) {
          const html = await res.text();
          document.open();
          document.write(html);
          document.close();
        } else {
          const msg = await res.text();
          showMessage(msg, "red");
        }
      } catch (err) {
        console.error("❌ Server/network error:", err);
        showMessage("⚠️ Server error. Try again.", "red");
      }
    });
  }

  // Password visibility toggle
  if (toggle) {
    toggle.addEventListener("click", () => {
      const passwordInput = document.querySelector("input[name='password']");
      if (!passwordInput) return;

      const isPassword = passwordInput.getAttribute("type") === "password";
      passwordInput.setAttribute("type", isPassword ? "text" : "password");
      toggle.textContent = isPassword ? "Hide Password" : "Show Password";
    });
  }

  // Helper: show error message
  function showMessage(message, color = "red") {
    const msg = document.getElementById("message");
    if (msg) {
      msg.innerText = message;
      msg.style.color = color;
    }
  }
});
