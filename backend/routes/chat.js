const express = require("express");
const Chat = require("../models/chat");
const Message = require("../models/Message");

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

// get last message for all chats of a user
router.get("/last-messages/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const chats = await Chat.find({ members: { $in: [userId] } });

    // For each chat, get the opposing user's ID and the latest message
    const lastMessages = await Promise.all(
      chats.map(async (chat) => {
        // Find the other member in this chat
        const otherUserId = chat.members.find((m) => m.toString() !== userId);

        // Find the most recent message in this chat
        const lastMsg = await Message.findOne({ chatId: chat._id }).sort({ createdAt: -1 });

        return {
          userId: otherUserId,
          lastMessage: lastMsg ? {
            text: lastMsg.text,
            image: lastMsg.image,
            senderId: lastMsg.senderId,
            createdAt: lastMsg.createdAt
          } : null
        };
      })
    );

    res.json(lastMessages);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
