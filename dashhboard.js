document.addEventListener("DOMContentLoaded", () => {
  console.log("📂 dashboard.js loaded");

  const linkContainer = document.getElementById("linkContainer");
  const addForm = document.getElementById("addLinkForm");

  // Load links on page load
  loadLinks();

  async function loadLinks() {
    try {
      const res = await fetch("/links", { credentials: "include" });
      const data = await res.json();

      linkContainer.innerHTML = ""; // Clear existing links

      data.links.forEach((link, index) => {
        const div = document.createElement("div");
        div.className = "link-item";

        div.innerHTML = `
          <a href="${link.url}" target="_blank">${link.name}</a>
          <button data-action="edit" data-index="${index}">✏️</button>
          <button data-action="delete" data-index="${index}">🗑️</button>
        `;

        linkContainer.appendChild(div);
      });
    } catch (err) {
      console.error("❌ Failed to load links:", err);
      linkContainer.innerHTML = "<p>⚠️ Could not load links.</p>";
    }
  }

  // Add new link
  if (addForm) {
    addForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = addForm.elements["name"].value.trim();
      const url = addForm.elements["url"].value.trim();

      if (!name || !url) return alert("Please fill in both fields.");

      try {
        const res = await fetch("/links", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name, url }),
        });

        if (res.ok) {
          addForm.reset();
          loadLinks();
        } else {
          alert("Failed to add link");
        }
      } catch (err) {
        console.error("❌ Add link error:", err);
      }
    });
  }

  // Edit or delete (event delegation)
  linkContainer.addEventListener("click", async (e) => {
    const action = e.target.dataset.action;
    const index = e.target.dataset.index;

    if (!action || index === undefined) return;

    if (action === "delete") {
      if (!confirm("Delete this link?")) return;

      await fetch(`/links/${index}`, {
        method: "DELETE",
        credentials: "include"
      });

      loadLinks();
    }

    if (action === "edit") {
      const newName = prompt("Enter new name:");
      const newUrl = prompt("Enter new URL:");

      if (!newName || !newUrl) return;

      await fetch(`/links/${index}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: newName, url: newUrl }),
      });

      loadLinks();
    }
  });

  // Logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await fetch("/logout", { credentials: "include" });
      window.location.href = "/";
    });
  }
});
