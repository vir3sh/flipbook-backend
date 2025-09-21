const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();
const app = express();
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));
var corsOptions = {
  origin: "https://flipbook-frontend-pi.vercel.app/",
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
// Serve uploads folder statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

connectDB();
// Flipbook schema
const flipbookSchema = new mongoose.Schema({
  title: String,
  publicId: String,
  pdfUrl: String,
  images: [String],
  createdAt: { type: Date, default: Date.now },
});

const Flipbook = mongoose.model("Flipbook", flipbookSchema);

// Routes
const uploadRouter = require("./routes/upload");
app.use("/api", uploadRouter);

const flipbooksRouter = require("./routes/flipbooks");
app.use("/api/flipbooks", flipbooksRouter);

// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
