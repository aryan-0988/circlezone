document.addEventListener("DOMContentLoaded", () => {
  const linksContainer = document.getElementById("links");
  const addForm = document.getElementById("addForm");

  // Fetch and display links
  fetch("/api/links")
    .then(res => res.json())
    .then(data => {
      data.forEach(link => {
        const a = document.createElement("a");
        a.href = link.url;
        a.target = "_blank";
        a.innerHTML = `🔗 ${link.title}`;
        linksContainer.appendChild(a);
      });
    });

  // Add new link
  addForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(addForm);
    const newLink = {
      title: formData.get("title"),
      url: formData.get("url"),
    };

    const res = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newLink)
    });

    if (res.ok) {
      // Add new link to UI
      const a = document.createElement("a");
      a.href = newLink.url;
      a.target = "_blank";
      a.innerHTML = `🔗 ${newLink.title}`;
      linksContainer.appendChild(a);
      addForm.reset();
    } else {
      alert("Failed to add link.");
    }
  });
});
