const express = require("express");
const Message = require("../models/Message");

const router = express.Router();

// get messages of a chat
router.get("/:chatId", async (req, res) => {
  const messages = await Message.find({ chatId: req.params.chatId }).sort({
    createdAt: 1,
  });
  res.json(messages);
});
router.delete("/clear/:chatId", async (req, res) => {
  await Message.deleteMany({ chatId: req.params.chatId });
  res.json({ msg: "Chat cleared successfully" });
});


module.exports = router;
// clear all messages of a chat
router.delete("/clear/:chatId", async (req, res) => {
  await Message.deleteMany({ chatId: req.params.chatId });
  res.json({ msg: "Chat cleared successfully" });
});
