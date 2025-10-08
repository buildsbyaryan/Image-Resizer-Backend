import express from "express";
import multer from "multer";
import sharp from "sharp";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

app.get('/', (req, res) => {
  res.send('Hello World')
})

app.post("/resize", upload.single("image"), async (req, res) => {
  const { width, height } = req.body;
  try {
    const buffer = await sharp(req.file.buffer)
      .resize(parseInt(width), parseInt(height))
      .toBuffer();
    const base64 = buffer.toString("base64");
    res.json({ image: `data:image/png;base64,${base64}` });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});