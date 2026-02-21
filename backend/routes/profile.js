const express = require("express");
const User = require("../models/User");

const router = express.Router();

router.put("/update/:id", async (req, res) => {
  try {
    const { profilePic } = req.body;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile picture required" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { profilePic },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;