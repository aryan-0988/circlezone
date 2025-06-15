const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Session setup
app.use(session({
    secret: "circlezone_secret_key", // In production, use an environment variable
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true, // Set to true for HTTPS (e.g., Render.com)
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
}));

// Load user credentials
const rawUsers = JSON.parse(fs.readFileSync("users.json", "utf-8"));
const users = rawUsers.reduce((acc, user) => {
    acc[user.username] = user.password;
    return acc;
}, {});
console.log("✅ Users loaded successfully.");

// Middleware to check login
function ensureLoggedIn(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.status(401).send("⚠️ Unauthorized. Please log in.");
    }
}

// Serve login page
app.get("/", (req, res) => {
    if (req.session.user) {
        return res.redirect("/dashboard");
    }
    res.sendFile(path.join(__dirname, "index.html"));
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
        return res.sendFile(path.join(__dirname, "dashboard.html"));
    } else {
        return res.status(401).send("❌ Invalid username or password");
    }
});

// Serve dashboard (only for logged-in users)
app.get("/dashboard", ensureLoggedIn, (req, res) => {
    res.sendFile(path.join(__dirname, "dashboard.html"));
});

// Logout route
app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
