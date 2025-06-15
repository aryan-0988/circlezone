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

        if (res.ok && contentType && contentType.includes("text/html")) {
          const html = await res.text();
          console.log("📩 Login success. Redirecting to dashboard...");
          document.open();
          document.write(html);
          document.close();
        } else {
          const message = await res.text();
          console.error("❌ Login failed:", message);
          const msg = document.getElementById("message");
          if (msg) {
            msg.innerText = message;
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

  // Toggle password visibility
  const toggleCheckbox = document.getElementById("togglePassword"); // ✅ Match your HTML ID
  if (toggleCheckbox) {
    toggleCheckbox.addEventListener("change", function () {
      const passwordField = document.querySelector("input[name='password']");
      if (passwordField) {
        passwordField.type = toggleCheckbox.checked ? "text" : "password";
      }
    });
  }
});
