import express from "express";
import multer from "multer";
import sharp from "sharp";
import cors from "cors";

const app = express();
app.use(cors());

const upload = multer({ storage: multer.memoryStorage() });

app.post("/resize", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send("No image uploaded");

    const width = parseInt(req.body.width) || null;
    const height = parseInt(req.body.height) || null;

    const buffer = await sharp(req.file.buffer)
      .resize(width, height)
      .png()
      .toBuffer();

    res.type("image/png").send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error resizing image");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
