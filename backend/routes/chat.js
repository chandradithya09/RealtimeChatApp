const express = require("express");
const Chat = require("../models/chat");

const router = express.Router();

// create chat between 2 users
router.post("/create", async (req, res) => {
  const { userId1, userId2 } = req.body;

  let chat = await Chat.findOne({
    members: { $all: [userId1, userId2] },
  });

  if (!chat) {
    chat = new Chat({ members: [userId1, userId2] });
    await chat.save();
  }

  res.json(chat);
});

// get chats of a user
router.get("/:userId", async (req, res) => {
  const chats = await Chat.find({
    members: { $in: [req.params.userId] },
  });

  res.json(chats);
});

module.exports = router;
