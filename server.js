const express = require("express");
const fs = require("fs");
const bcrypt = require("bcrypt");
const path = require("path");
const session = require("express-session");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname));

app.use(
  session({
    secret: "circlezone-secret",
    resave: false,
    saveUninitialized: false, // Prevents saving empty sessions
    cookie: {
      sameSite: "none", // or "lax" if not using HTTPS
      secure: true      // must be true on HTTPS (e.g., Render)
    }
  })
);

// File paths
const USERS_FILE = path.join(__dirname, "users.json");
const LINKS_FILE = path.join(__dirname, "links.json");

// Routes

// Login Page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Handle login
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));

  const user = users.find((u) => u.username === username);
  if (!user) return res.send("❌ Invalid username");

  bcrypt.compare(password, user.password, (err, result) => {
    if (result) {
      req.session.user = username;
      res.sendFile(path.join(__dirname, "dashboard.html"));
    } else {
      res.send("❌ Incorrect password");
    }
  });
});

// Dashboard (must be logged in)
app.get("/dashboard", (req, res) => {
  if (!req.session.user) return res.redirect("/");
  res.sendFile(path.join(__dirname, "dashboard.html"));
});

// API: Get links (must be logged in)
app.get("/api/links", (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: "Unauthorized" });

  const links = JSON.parse(fs.readFileSync(LINKS_FILE, "utf-8"));
  res.json(links);
});

// API: Add new link (must be logged in)
app.post("/api/links", (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: "Unauthorized" });

  const { title, url } = req.body;
  if (!title || !url) {
    return res.status(400).json({ message: "Title and URL are required." });
  }

  const links = JSON.parse(fs.readFileSync(LINKS_FILE, "utf-8"));
  links.push({ title, url });
  fs.writeFileSync(LINKS_FILE, JSON.stringify(links, null, 2));
  res.status(200).json({ message: "✅ Link added successfully" });
});
// API: Delete a link by index
app.delete("/api/links/:index", (req, res) => {
  const index = parseInt(req.params.index);
  const links = JSON.parse(fs.readFileSync(LINKS_FILE, "utf-8"));
  if (index >= 0 && index < links.length) {
    links.splice(index, 1);
    fs.writeFileSync(LINKS_FILE, JSON.stringify(links, null, 2));
    return res.status(200).json({ message: "✅ Link deleted" });
  }
  res.status(400).json({ message: "❌ Invalid index" });
});


// Start server
app.listen(PORT, () => {
  console.log(`🚀 CircleZone server running at http://localhost:${PORT}`);
});
