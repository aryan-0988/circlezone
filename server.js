const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname))); // Serve static files like index.html, css, js

// Load users from users.json
let users;
try {
  const data = fs.readFileSync(path.join(__dirname, "users.json"), "utf-8");
  users = JSON.parse(data);
  console.log("✅ Users loaded successfully");
} catch (err) {
  console.error("❌ Error reading users.json:", err.message);
  users = [];
}

// Login route
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  console.log("⬇️ Login Attempt");
  console.log("👉 Received Username:", username);
  console.log("👉 Received Password:", password);

  const trimmedUsername = username.trim();
  const trimmedPassword = password.trim();

  const user = users.find((u) => u.username === trimmedUsername);

  if (!user) {
    console.log("❌ User not found");
    return res.send("❌ Invalid username or password.");
  }

  const match = await bcrypt.compare(trimmedPassword, user.password);

  if (match) {
    console.log("✅ Login successful for:", trimmedUsername);
    return res.sendFile(path.join(__dirname, "dashboard.html"));
  } else {
    console.log("❌ Incorrect password for:", trimmedUsername);
    return res.send("❌ Invalid username or password.");
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
