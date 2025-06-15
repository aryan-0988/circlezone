const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Load users from JSON
function loadUsers() {
  const data = fs.readFileSync(path.join(__dirname, "users.json"), "utf-8");
  return JSON.parse(data);
}

// Login route
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const users = loadUsers();

  const user = users.find(u => u.username === username);
  if (!user) {
    console.log("❌ User not found");
    return res.status(401).send("Invalid username or password");
  }

  const match = await bcrypt.compare(password, user.password);
  if (match) {
    console.log("✅ Password match");
    return res.sendFile(path.join(__dirname, "dashboard.html"));
  } else {
    console.log("❌ Password incorrect");
    return res.status(401).send("Invalid username or password");
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
