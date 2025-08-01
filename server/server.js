import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import users from "./users.js";
import path from "path";
import { fileURLToPath } from "url";

// Required for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

// Serve a custom login
server.get("/", (req, res) => {
  return app.render(req, res, "/login");
});

// Serve the homepage
app.get("/homepage", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "homepage"));
});

// Serve simulation page
app.get("/simulation", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "simulation"));
});

// Login endpoint (if you still want to keep the login logic)
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = users.find((u) => u.username === username);
  if (!user) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (isMatch) {
    res.json({ success: true, message: "Login successful" });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});
