const mongoose = require("mongoose");

const flipbookSchema = new mongoose.Schema({
  title: String,
  publicId: String,
  pdfUrl: String,
  images: [String],
  createdAt: { type: Date, default: Date.now },
});

// This prevents OverwriteModelError on hot reload or multiple imports
module.exports =
  mongoose.models.Flipbook || mongoose.model("Flipbook", flipbookSchema);
