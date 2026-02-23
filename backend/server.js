const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;


require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Routes
const authRoutes = require("./routes/auth");
const chatRoutes = require("./routes/chat");
const messageRoutes = require("./routes/message");
const userRoutes = require("./routes/user");
const profileRoutes = require("./routes/profile");

// Models
const Message = require("./models/Message");

const app = express();
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/user", userRoutes);
app.use("/api/profile", profileRoutes);

// Static folder for uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Create Server
const server = http.createServer(app);

// Socket Setup
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Store online users
let onlineUsers = {};

// Socket Connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Add user online
  socket.on("addUser", (userId) => {
    onlineUsers[userId] = socket.id;
    io.emit("getOnlineUsers", Object.keys(onlineUsers));
  });

  // Join private chat room
  socket.on("joinChat", (chatId) => {
    socket.join(chatId);
    console.log("User joined chat:", chatId);
  });

  // Typing indicator
  socket.on("typing", (data) => {
    socket.to(data.chatId).emit("typing", data);
  });

  socket.on("stopTyping", (data) => {
    socket.to(data.chatId).emit("stopTyping", data);
  });

  // Send message
  socket.on("sendMessage", async (data) => {
    try {
      const newMsg = new Message({
        chatId: data.chatId,
        senderId: data.senderId,
        text: data.text,
        image: data.image,
      });

      await newMsg.save();

      io.to(data.chatId).emit("receiveMessage", newMsg);
    } catch (err) {
      console.log("Message Error:", err);
    }
  });

  // Disconnect user
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    for (let key in onlineUsers) {
      if (onlineUsers[key] === socket.id) {
        delete onlineUsers[key];
      }
    }

    io.emit("getOnlineUsers", Object.keys(onlineUsers));
  });
});

// Multer Memory Storage for Cloudinary
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload API
app.post("/upload", upload.single("photo"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image provided" });
  }

  try {
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: "realtime_chat_app",
    });

    res.json({
      imageUrl: result.secure_url,
    });
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    res.status(500).json({ error: "Image upload failed" });
  }
});

// Default API
app.get("/", (req, res) => {
  res.send("Backend running...");
});

// Start Server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
