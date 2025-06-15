const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public")); // Make sure your static files (HTML, CSS, JS) are in /public

// ✅ Session Middleware
app.use(session({
    secret: "circlezone_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true,           // true for HTTPS (Render uses HTTPS)
        httpOnly: true,
        sameSite: "none",       // Required for cross-origin cookies
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
}));

// ✅ Allow CORS with credentials (if frontend hosted separately)
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "https://circlezone.onrender.com");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET,POST");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
});

// ✅ Login Endpoint
app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    const users = JSON.parse(fs.readFileSync("users.json", "utf-8"));
    const user = users.find(u => u.username === username);

    if (!user) {
        return res.status(401).json({ error: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        return res.status(401).json({ error: "Incorrect password" });
    }

    req.session.user = username; // ✅ Set session
    res.json({ success: true });
});

// ✅ Dashboard Page (Protected)
app.get("/dashboard", (req, res) => {
    if (!req.session.user) {
        return res.send("<!DOCTYPE html><h1>⚠️ You must log in first.</h1>");
    }

    res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// ✅ Logout
app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});

// ✅ Homepage
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
