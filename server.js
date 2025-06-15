const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
// --- CHANGE THIS LINE ---
app.use(express.static(path.join(__dirname))); // Serve static files from the root directory
// ------------------------

// Session setup
app.use(session({
  secret: "circlezone_secret_key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, // ✅ Safe to use on Render because it uses HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

// Load user data
// Load user data
const rawUsers = JSON.parse(fs.readFileSync("users.json", "utf-8"));
// Transform the array of user objects into a map/dictionary for easy lookup
const users = rawUsers.reduce((acc, user) => {
    acc[user.username] = user.password;
    return acc;
}, {});
console.log("✅ Users loaded successfully and mapped for lookup.");
// console.log("Mapped users:", users); // Optional: uncomment for debugging
console.log("✅ Users loaded successfully"); // Add this to confirm users.json is read

// Serve index.html
app.get("/", (req, res) => {
  if (req.session.user) {
    return res.redirect("/dashboard");
  }
  // --- CHANGE THIS LINE ---
  res.sendFile(path.join(__dirname, "index.html"));
  // ------------------------
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
    // --- CHANGE THIS LINE ---
    return res.sendFile(path.join(__dirname, "dashboard.html"));
    // ------------------------
  } else {
    return res.status(401).send("❌ Invalid username or password");
  }
});

// Serve dashboard (only for logged-in users)
app.get("/dashboard", (req, res) => {
  if (!req.session.user) {
    return res.send("⚠️ You must log in first.");
  }
  // --- CHANGE THIS LINE ---
  res.sendFile(path.join(__dirname, "dashboard.html"));
  // ------------------------
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});