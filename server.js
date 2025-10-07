import express from "express";
import multer from "multer";
import sharp from "sharp";
import cors from "cors";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("processed")); // serve processed images

// Configure multer (upload destination)
const upload = multer({ dest: "uploads/" });

// POST route: upload and process image
app.post("/resize", upload.single("image"), async (req, res) => {
  try {
    const { width, height, rotation, flipH, flipV, grayscale, brightness, contrast } = req.body;

    // Convert form data to usable types
    const w = parseInt(width);
    const h = parseInt(height);
    const rotate = parseInt(rotation) || 0;
    const isFlipH = flipH === "true";
    const isFlipV = flipV === "true";
    const isGray = grayscale === "true";

    // Input/output paths
    const inputPath = req.file.path;
    const outputPath = `processed/resized-${Date.now()}.png`;

    // Process image with sharp
    let image = sharp(inputPath)
      .resize(w, h)
      .rotate(rotate)
      .modulate({
        brightness: parseFloat(brightness) / 100 || 1,
        contrast: parseFloat(contrast) / 100 || 1,
      });

    if (isGray) image = image.grayscale();
    if (isFlipH) image = image.flip();
    if (isFlipV) image = image.flop();

    await image.toFile(outputPath);

    // Remove original uploaded file
    fs.unlinkSync(inputPath);

    // Send processed file URL back to frontend
    res.json({ success: true, imageUrl: `/${outputPath}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Image processing failed" });
  }
});

app.listen(5000, () => console.log("✅ Server running on http://localhost:5000"));
