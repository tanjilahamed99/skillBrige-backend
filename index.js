const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const path = require("path");
const connectDB = require("./src/config/db");
dotenv.config();

const PORT = process.env.PORT || 5005;
const app = express();

const server = http.createServer(app);

require("dotenv").config();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: [process.env.FRONTEND_URL || "http://localhost:3000"],
    credentials: true,
  }),
);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/instructor", require("./src/routes/instructor"));
app.use("/api/superAdmin", require("./src/routes/superAdminRoutes"));

// Health check route
app.get("/", (req, res) => {
  res.send("SkillBrige is running ✅");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something broke!" });
});

server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
