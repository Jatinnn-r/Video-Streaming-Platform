// server/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require("socket.io");
const path = require("path");
require('dotenv').config();

const authRoute = require('./routes/auth');
const videoRoute = require('./routes/video');

const app = express();
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Frontend URL
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// --- SOCKET INJECTOR (IMPORTANT) ---
// This allows any route (like video upload) to send real-time messages
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Serve the uploaded video files publicly
// This allows the browser to play the video using a URL
app.use("/files", express.static(path.join(__dirname, "files")));

// Routes
app.use('/api/auth', authRoute);
app.use('/api/videos', videoRoute);

// Database Connection
mongoose.connect("mongodb+srv://Admin:password%40123@videoapp.ols14b7.mongodb.net/?appName=VideoApp")
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.log("❌ MongoDB Connection Error:", err));

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});