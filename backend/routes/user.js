const express = require("express");
const User = require("../models/User");
const Chat = require("../models/Chat");
const Message = require("../models/Message");

const router = express.Router();

// get all users
router.get("/", async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

// delete user
router.delete("/delete/:id", async (req, res) => {
  const userId = req.params.id;

  await Message.deleteMany({ senderId: userId });
  await Chat.deleteMany({ members: { $in: [userId] } });
  await User.findByIdAndDelete(userId);

  res.json({ msg: "User deleted successfully" });
});

module.exports = router;
