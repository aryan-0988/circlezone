document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ dashboard.js loaded");

  const linkContainer = document.getElementById("linkContainer");
  const addForm = document.getElementById("addLinkForm");

  // Load links
  async function loadLinks() {
    try {
      const res = await fetch("/api/links", { credentials: "include" });
      if (!res.ok) throw new Error("User not logged in.");
      const links = await res.json();

      linkContainer.innerHTML = "";

      if (links.length === 0) {
        linkContainer.innerHTML = "<p>No links yet.</p>";
      } else {
        links.forEach((link) => {
          const a = document.createElement("a");
          a.href = link.url;
          a.target = "_blank";
          a.rel = "noopener noreferrer";
          a.innerHTML = `<i class="fa fa-link"></i> ${link.title}`;
          a.className = "link-item";
          linkContainer.appendChild(a);
        });
      }
    } catch (err) {
      console.error("❌ Error loading links:", err);
      linkContainer.innerHTML = "<p style='color: red;'>⚠️ You must log in first.</p>";
    }
  }

  // Add new link
  if (addForm) {
    addForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const title = addForm.elements["title"].value.trim();
      const url = addForm.elements["url"].value.trim();

      if (!title || !url) {
        alert("Please enter both title and URL.");
        return;
      }

      try {
        const res = await fetch("/api/links", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify({ title, url })
        });

        const data = await res.json();
        if (res.ok) {
          console.log("✅ Link added:", data);
          addForm.reset();
          loadLinks();
        } else {
          alert("❌ Failed to add link: " + data.message);
        }
      } catch (err) {
        console.error("❌ Error adding link:", err);
      }
    });
  }

  loadLinks(); // Load on page load
});
