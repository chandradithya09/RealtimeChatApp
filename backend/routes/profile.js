const express = require("express");
const User = require("../models/User");

const router = express.Router();

router.put("/update/:id", async (req, res) => {
  const { profilePic } = req.body;

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    { profilePic },
    { new: true }
  ).select("-password");

  res.json(updatedUser);
});

module.exports = router;
