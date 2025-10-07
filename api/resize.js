import multer from "multer";
import sharp from "sharp";
import nc from "next-connect";

// Multer memory storage
const upload = multer({ storage: multer.memoryStorage() });

const handler = nc()
  .use(upload.single("image"))
  .post(async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ success: false, error: "No image uploaded" });

      const width = parseInt(req.body.width) || null;
      const height = parseInt(req.body.height) || null;

      const buffer = await sharp(req.file.buffer)
        .resize(width, height)
        .png()
        .toBuffer();

      const base64Image = buffer.toString("base64");

      res.status(200).json({ success: true, image: `data:image/png;base64,${base64Image}` });
    } catch (err) {
      console.error("Resize error:", err);
      res.status(500).json({ success: false, error: "Image processing failed" });
    }
  });

export default handler;
export const config = { api: { bodyParser: false } };
