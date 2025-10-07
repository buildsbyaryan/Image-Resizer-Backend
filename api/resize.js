import multer from "multer";
import sharp from "sharp";
import nc from "next-connect";

const upload = multer({ storage: multer.memoryStorage() });

const handler = nc()
  .use(upload.single("image"))
  
  // POST endpoint (upload file)
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
      console.error(err);
      res.status(500).json({ success: false, error: "Image processing failed" });
    }
  })

  // GET endpoint (resize image from URL)
  .get(async (req, res) => {
    try {
      const imageUrl = req.query.url;
      const width = parseInt(req.query.width) || null;
      const height = parseInt(req.query.height) || null;

      if (!imageUrl) return res.status(400).send("Please provide an image URL as ?url=");

      // dynamic import for node-fetch
      const fetch = (await import("node-fetch")).default;
      const response = await fetch(imageUrl);
      const arrayBuffer = await response.arrayBuffer();

      const buffer = await sharp(Buffer.from(arrayBuffer))
        .resize(width, height)
        .png()
        .toBuffer();

      res.setHeader("Content-Type", "image/png");
      res.send(buffer);
    } catch (err) {
      console.error("GET Resize error:", err);
      res.status(500).send("Error processing image");
    }
  });

export default handler;
export const config = { api: { bodyParser: false } };
