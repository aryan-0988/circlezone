document.addEventListener("DOMContentLoaded", function () {
  console.log("✅ script.js loaded");

  const form = document.getElementById("loginForm");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(form);
    const username = formData.get("username").trim();
    const password = formData.get("password").trim();

    // Log submitted values for debugging
    console.log("📨 Submitting login:");
    console.log("Username:", username);
    console.log("Password:", password);

    try {
      const res = await fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ username, password }),
      });

      const text = await res.text();
      console.log("📩 Server response received");

      if (text.includes("<!DOCTYPE html>")) {
        // If response is HTML (dashboard), load it
        document.open();
        document.write(text);
        document.close();
      } else {
        // Show error message if not HTML
        const msg = document.getElementById("message");
        msg.innerText = text;
        msg.style.color = "red";
      }
    } catch (err) {
      console.error("❌ Fetch error:", err);
      const msg = document.getElementById("message");
      msg.innerText = "Server error. Please try again.";
      msg.style.color = "red";
    }
  });

  // Toggle password visibility
  const toggle = document.getElementById("togglePassword");
  if (toggle) {
    toggle.addEventListener("click", function () {
      const passwordField = document.querySelector("input[name='password']");
      const type =
        passwordField.getAttribute("type") === "password" ? "text" : "password";
      passwordField.setAttribute("type", type);
      toggle.nextElementSibling.innerText =
        type === "password" ? "Show Password" : "Hide Password";
    });
  }
});
