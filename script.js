document.addEventListener("DOMContentLoaded", function () {
  console.log("✅ script.js loaded");

  const form = document.getElementById("loginForm");

  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      const formData = new FormData(form);
      const username = formData.get("username").trim();
      const password = formData.get("password").trim();

      console.log("📨 Submitting login:", username);

      try {
        const res = await fetch("/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: new URLSearchParams(formData),
          credentials: "include"
        });

        const contentType = res.headers.get("content-type");

        if (res.ok && contentType && contentType.includes("application/json")) {
          const data = await res.json();
          if (data.success) {
            console.log("📩 Login success. Redirecting...");
            window.location.href = "/dashboard"; // ✅ Correct redirection
          } else {
            throw new Error(data.error || "Login failed");
          }
        } else {
          const msg = document.getElementById("message");
          const errorText = await res.text();
          if (msg) {
            msg.innerText = errorText || "Login failed.";
            msg.style.color = "red";
          }
        }
      } catch (err) {
        console.error("❌ Network/server error:", err);
        const msg = document.getElementById("message");
        if (msg) {
          msg.innerText = "⚠️ Server error. Please try again.";
          msg.style.color = "red";
        }
      }
    });
  }

  // Toggle password visibility (optional)
  const toggle = document.getElementById("togglePassword");
  if (toggle) {
    toggle.addEventListener("click", function () {
      const passwordField = document.querySelector("input[name='password']");
      if (!passwordField) return;

      const type = passwordField.getAttribute("type") === "password" ? "text" : "password";
      passwordField.setAttribute("type", type);
      toggle.innerText = type === "password" ? "Show Password" : "Hide Password";
    });
  }
});
