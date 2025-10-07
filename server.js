import multer from "multer";
import sharp from "sharp";
import nc from "next-connect"; // works for Vercel serverless
import { Readable } from "stream";

const upload = multer();

// Helper to convert buffer to stream
const bufferToStream = (buffer) => {
  const readable = new Readable();
  readable._read = () => {}; 
  readable.push(buffer);
  readable.push(null);
  return readable;
};

const handler = nc()
  .use(upload.single("image"))
  .post(async (req, res) => {
    try {
      const { width, height } = req.body;
      const w = parseInt(width);
      const h = parseInt(height);

      if (!req.file) return res.status(400).json({ error: "No file uploaded" });

      const outputBuffer = await sharp(req.file.buffer)
        .resize(w, h)
        .png()
        .toBuffer();

      const base64Image = outputBuffer.toString("base64");
      res.status(200).json({
        success: true,
        image: `data:image/png;base64,${base64Image}`
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: "Image processing failed" });
    }
  });

export default handler;
export const config = {
  api: {
    bodyParser: false, // Multer handles parsing
  },
};
