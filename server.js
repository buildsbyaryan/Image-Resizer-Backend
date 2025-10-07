import express from "express";
import multer from "multer";
import sharp from "sharp";
import cors from "cors";

const app = express();
app.use(cors()); // Allow frontend requests

const upload = multer({ storage: multer.memoryStorage() });

// POST /api/resize
app.post("/api/resize", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: "No image uploaded" });

    const width = parseInt(req.body.width) || null;
    const height = parseInt(req.body.height) || null;

    const buffer = await sharp(req.file.buffer)
      .resize(width, height)
      .png()
      .toBuffer();

    const base64Image = buffer.toString("base64");
    res.json({ success: true, image: `data:image/png;base64,${base64Image}` });
  } catch (err) {
    console.error("Resize error:", err);
    res.status(500).json({ success: false, error: "Image processing failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
