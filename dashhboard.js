const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3001; // Run this on a different port if needed

app.use(bodyParser.json());
app.use(express.static("public")); // Serve static files like dashboard.html

const linksPath = path.join(__dirname, "links.json");

// Helper: Read links
function getLinks() {
  try {
    const data = fs.readFileSync(linksPath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading links.json:", err);
    return {};
  }
}

// Helper: Save links
function saveLinks(data) {
  fs.writeFileSync(linksPath, JSON.stringify(data, null, 2), "utf-8");
}

// GET user links
app.get("/api/links/:username", (req, res) => {
  const { username } = req.params;
  const allLinks = getLinks();
  const userLinks = allLinks[username] || [];
  res.json(userLinks);
});

// POST add new link
app.post("/api/links/:username", (req, res) => {
  const { username } = req.params;
  const { title, url } = req.body;

  if (!title || !url) return res.status(400).send("Missing title or url");

  const allLinks = getLinks();
  if (!allLinks[username]) allLinks[username] = [];

  allLinks[username].push({ title, url });
  saveLinks(allLinks);
  res.sendStatus(200);
});

// Start server
app.listen(PORT, () => {
  console.log(`Dashboard server running at http://localhost:${PORT}`);
});
