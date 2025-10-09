import express from "express";
import multer from "multer";
import sharp from "sharp";
import fs from "fs";
import cors from "cors";

//Backend is live now !!!!

const app = express();
app.use(cors()); // allow all origins

const upload = multer({ dest: "/tmp" });

app.get('/', (req, res) => {
  res.send('Hello World')
})

app.post("/resize", upload.single("image"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ success: false, message: "No file uploaded" });

    const width = parseInt(req.body.width) || 300;
    const height = parseInt(req.body.height) || 300;
    const outputPath = `/tmp/resized-${file.originalname}`;

    await sharp(file.path)
      .resize(width, height)
      .toFile(outputPath);

    const imageBuffer = fs.readFileSync(outputPath);
    const base64Image = `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;

    res.status(200).json({ success: true, image: base64Image });

    fs.unlinkSync(file.path);
    fs.unlinkSync(outputPath);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Image processing failed" });
  }
});

// Listen on Render/Vercel port
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
