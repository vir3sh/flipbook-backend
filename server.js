const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(express.json());
var corsOptions = {
  origin: "http://localhost:5173",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));
// Serve uploads folder statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/flipbooks", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

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
