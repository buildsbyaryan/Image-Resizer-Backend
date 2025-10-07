import multer from "multer";
import sharp from "sharp";
import nc from "next-connect";
import fetch from "node-fetch"; // For fetching images from URL

const upload = multer({ storage: multer.memoryStorage() });

const handler = nc()
  // POST endpoint (file upload)
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
  })

  // GET endpoint (URL query)
  .get(async (req, res) => {
    try {
      const imageUrl = req.query.url;
      const width = parseInt(req.query.width) || null;
      const height = parseInt(req.query.height) || null;

      if (!imageUrl) return res.status(400).send("Please provide an image URL as ?url=");

      const response = await fetch(imageUrl);
      const buffer = await response.buffer();

      const resizedBuffer = await sharp(buffer)
        .resize(width, height)
        .png()
        .toBuffer();

      res.setHeader("Content-Type", "image/png");
      res.send(resizedBuffer);
    } catch (err) {
      console.error("GET Resize error:", err);
      res.status(500).send("Error processing image");
    }
  });

export default handler;
export const config = { api: { bodyParser: false } };
