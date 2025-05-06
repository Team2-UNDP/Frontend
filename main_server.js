const express = require("express");
const path = require("path");
const app = express();
const port = 3000;

// Serve static files from the "public" folder
app.use(express.static("public"));

// Home route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "homepage.html"));
});

// Start the server
app.listen(port, () => {
  console.log(`Website is running at http://localhost:${port}`);
});
