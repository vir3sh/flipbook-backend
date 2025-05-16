const express = require("express");
const Flipbook = require("../models/Flipbook");
const router = express.Router();

// Get recent flipbooks, limit 10
router.get("/recent", async (req, res) => {
  try {
    const flipbooks = await Flipbook.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .select("title publicId pdfUrl createdAt");
    res.json(flipbooks);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get flipbook details by ID
router.get("/:id", async (req, res) => {
  try {
    console.log("Requested publicId:", req.params.id);
    const flipbook = await Flipbook.findOne({ publicId: req.params.id });
    console.log("Found flipbook:", flipbook);
    if (!flipbook) return res.status(404).json({ message: "Not found" });
    res.json(flipbook);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
