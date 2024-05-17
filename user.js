const User = require("./model/user.model.js");
const express = require("express");
const router = express.Router();

// Basic start page info
router.get("/", (req, res) => {
  res.send("Users & Location Temperature");
});

// Route to get all user (with or without search query)
router.get("/weather/user", async (req, res) => {
  try {
    const query = req.query.q;
    let user;
    if (query) {
      user = await User.find({
        $or: [
          { name: { $regex: query, $options: "i" } },
          { locn: query.match(/^[0-9a-fA-F]{24}$/) ? query : null }, // Check if query is ObjectId
          { locn_name: { $regex: query, $options: "i" } }, // Fallback to locn_name search
        ].filter(Boolean), // Filter out null values
      }).populate("locn");
    } else {
      user = await User.find({}).populate("locn");
    }
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// Route to get a specific user by ID
router.get("/weather/user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).populate("locn");
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// Route to add a new user in users
router.post("/weather/user", async (req, res) => {
  try {
    const existingUser = await User.find({
      name: req.body.name,
      locn: req.body.locn,
    });
    if (existingUser.length === 0) {
      const user = await User.create(req.body);
      return res.status(200).json(user);
    }
    return res.status(400).send("User already exists.");
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// Route to update a user
router.patch("/weather/user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, {
      name: req.body.name,
      desg: req.body.desg,
      dtjoin: req.body.dtjoin,
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const updatedUser = await User.findById(id).populate("locn");
    res.status(200).json(updatedUser);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// Route to delete an user
router.delete("/weather/user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(404).json({ message: "User not found" });
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
