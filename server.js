const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // <--- ADD THIS LINE for JSON body parsing!
app.use(express.static(path.join(__dirname)));

// Session setup
app.use(session({
    secret: "circlezone_secret_key", // CHANGE THIS TO AN ENV VARIABLE IN PROD!
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true, // Requires HTTPS (good for Render.com)
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
}));

// User data loading (your existing fixed code)
const rawUsers = JSON.parse(fs.readFileSync("users.json", "utf-8"));
const users = rawUsers.reduce((acc, user) => {
    acc[user.username] = user.password;
    return acc;
}, {});
console.log("✅ Users loaded successfully and mapped for lookup.");

// Link data loading and saving
const LINKS_FILE = path.join(__dirname, 'links.json');

function loadLinksData() {
    try {
        if (fs.existsSync(LINKS_FILE)) {
            const data = fs.readFileSync(LINKS_FILE, 'utf-8');
            return JSON.parse(data);
        }
        return [];
    } catch (error) {
        console.error("Error loading links data:", error);
        return [];
    }
}

function saveLinksData(links) {
    try {
        fs.writeFileSync(LINKS_FILE, JSON.stringify(links, null, 2), 'utf-8');
    } catch (error) {
        console.error("Error saving links data:", error);
    }
}

let links = loadLinksData(); // Load links when the server starts
console.log("✅ Links loaded successfully.");

// Middleware to ensure user is logged in
function ensureLoggedIn(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.status(401).send("Unauthorized. Please log in.");
    }
}

// Serve index.html
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
app.get("/dashboard", ensureLoggedIn, (req, res) => { // Use ensureLoggedIn here too
    res.sendFile(path.join(__dirname, "dashboard.html"));
});

// --- NEW LINK API ROUTES ---
// GET /links - Retrieve all links
app.get("/links", ensureLoggedIn, (req, res) => {
    res.json({ links: links });
});

// POST /links - Add a new link
app.post("/links", ensureLoggedIn, (req, res) => {
    const { name, url } = req.body;
    if (!name || !url) {
        return res.status(400).send("Name and URL are required.");
    }
    const newLink = { name, url, owner: req.session.user };
    links.push(newLink);
    saveLinksData(links);
    res.status(201).send("Link added successfully!");
});

// PUT /links/:index - Edit an existing link
app.put("/links/:index", ensureLoggedIn, (req, res) => {
    const index = parseInt(req.params.index);
    const { name, url } = req.body;

    if (isNaN(index) || index < 0 || index >= links.length) {
        return res.status(400).send("Invalid link index.");
    }
    if (!name || !url) {
        return res.status(400).send("Name and URL are required.");
    }

    links[index].name = name;
    links[index].url = url;
    saveLinksData(links);
    res.status(200).send("Link updated successfully!");
});

// DELETE /links/:index - Delete a link
app.delete("/links/:index", ensureLoggedIn, (req, res) => {
    const index = parseInt(req.params.index);

    if (isNaN(index) || index < 0 || index >= links.length) {
        return res.status(400).send("Invalid link index.");
    }

    links.splice(index, 1);
    saveLinksData(links);
    res.status(200).send("Link deleted successfully!");
});
// --- END NEW LINK API ROUTES ---


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