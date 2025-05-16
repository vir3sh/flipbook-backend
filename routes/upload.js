const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const Flipbook = require("../models/Flipbook");
const pdf = require("pdf-poppler"); // Add this package for PDF rendering

const router = express.Router();

// Setup multer storage for PDFs
const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/pdfs");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage: pdfStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files allowed"));
    }
    cb(null, true);
  },
});

// Make sure directories exist
const ensureDirectoriesExist = () => {
  const dirs = [
    path.join(__dirname, "..", "uploads"),
    path.join(__dirname, "..", "uploads", "pdfs"),
    path.join(__dirname, "..", "uploads", "images"),
  ];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Convert PDF to images using pdf-poppler
const convertPdfToImages = async (pdfPath, outputDir) => {
  // PDF conversion options
  const options = {
    format: "png",
    out_dir: outputDir,
    out_prefix: "page",
    page: null, // Convert all pages
    scale: 1024, // Increase scale for better quality
  };

  try {
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Convert PDF to images
    await pdf.convert(pdfPath, options);

    // Get list of generated image files and sort them
    const files = fs
      .readdirSync(outputDir)
      .filter((file) => file.startsWith("page") && file.endsWith(".png"))
      .sort((a, b) => {
        const numA = parseInt(a.match(/page-(\d+)\.png/)[1]);
        const numB = parseInt(b.match(/page-(\d+)\.png/)[1]);
        return numA - numB;
      });

    // Return image paths
    return files.map(
      (file) => `/uploads/images/${path.basename(outputDir)}/${file}`
    );
  } catch (error) {
    console.error("Error converting PDF to images:", error);
    throw error;
  }
};

router.post("/upload", upload.single("pdf"), async (req, res) => {
  try {
    ensureDirectoriesExist();

    if (!req.file) {
      return res.status(400).json({ message: "PDF file required" });
    }

    const pdfPath = req.file.path;
    const publicId = uuidv4();

    // Create directory for this flipbook's images
    const imagesDir = path.join(__dirname, "..", "uploads", "images", publicId);

    // Convert PDF to images
    const images = await convertPdfToImages(pdfPath, imagesDir);

    // If no images were generated, return an error
    if (!images || images.length === 0) {
      return res.status(500).json({ message: "Failed to process PDF" });
    }

    // Save flipbook metadata to DB
    const flipbook = new Flipbook({
      title: req.file.originalname,
      publicId,
      pdfUrl: `/uploads/pdfs/${path.basename(pdfPath)}`,
      images,
    });

    await flipbook.save();

    res.json({ id: publicId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
});

module.exports = router;
