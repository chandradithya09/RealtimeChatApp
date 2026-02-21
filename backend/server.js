const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");


require("dotenv").config();

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

// Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Upload API
app.post("/upload", upload.single("photo"), (req, res) => {
  res.json({
    app.post("/upload", upload.single("photo"), (req, res) => {
  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

  res.json({
    imageUrl,
  });
});
  });
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
