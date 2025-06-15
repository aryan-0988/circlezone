document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ script.js loaded");

  const form = document.getElementById("loginForm");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const username = formData.get("username").trim();
      const password = formData.get("password").trim();

      console.log("📨 Login attempt:", username);

      try {
        const res = await fetch("/login", {
          method: "POST",
          body: new URLSearchParams(formData),
          credentials: "include"
        });

        const text = await res.text();

        if (text.includes("<!DOCTYPE html>")) {
          window.location.href = "/dashboard";
        } else {
          const msg = document.getElementById("message");
          msg.innerText = text;
          msg.style.color = "red";
        }

      } catch (err) {
        console.error("❌ Error:", err);
      }
    });
  }

  // Dashboard logic
  const linkForm = document.getElementById("linkForm");
  const linksContainer = document.getElementById("links");

  async function loadLinks() {
    try {
      const res = await fetch("/api/links", { credentials: "include" });
      if (!res.ok) throw new Error("User not logged in.");
      const links = await res.json();
      linksContainer.innerHTML = links
        .map(
          (link, i) => `
          <div>
            <a href="${link.url}" target="_blank">${link.title}</a>
            <button data-index="${i}" class="delete-btn">❌</button>
          </div>`
        )
        .join("");
    } catch (err) {
      linksContainer.innerHTML = "<p>⚠️ You must log in first.</p>";
    }
  }

  if (linksContainer) loadLinks();

  if (linkForm) {
    linkForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const title = linkForm.title.value.trim();
      const url = linkForm.url.value.trim();

      if (!title || !url) return alert("Both fields required!");

      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title, url }),
      });

      const data = await res.json();
      alert(data.message);
      loadLinks();
      linkForm.reset();
    });
  }

  document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("delete-btn")) {
      const index = e.target.getAttribute("data-index");
      await fetch(`/api/links/${index}`, {
        method: "DELETE",
        credentials: "include",
      });
      loadLinks();
    }
  });
});
