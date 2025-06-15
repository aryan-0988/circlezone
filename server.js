const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public"))); // Serve script.js, style.css

// Session setup
app.use(session({
  secret: "circlezone_secret_key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true if using HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

// Load user data
const users = JSON.parse(fs.readFileSync("users.json", "utf-8")); // { "username": "hashed_password", ... }

// Serve index.html
app.get("/", (req, res) => {
  if (req.session.user) {
    return res.redirect("/dashboard");
  }
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Handle login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = users[username];

  if (!hashedPassword) {
    return res.status(401).send("❌ Invalid username or password");
  }

  const match = await bcrypt.compare(password, hashedPassword);

  if (match) {
    req.session.user = username;
    console.log(`✅ ${username} logged in`);
    return res.sendFile(path.join(__dirname, "public", "dashboard.html"));
  } else {
    return res.status(401).send("❌ Invalid username or password");
  }
});

// Serve dashboard (only for logged-in users)
app.get("/dashboard", (req, res) => {
  if (!req.session.user) {
    return res.send("⚠️ You must log in first.");
  }
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
