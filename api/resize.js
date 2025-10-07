import multer from "multer";
import sharp from "sharp";
import nc from "next-connect";

// Use Multer in memory
const upload = multer({ storage: multer.memoryStorage() });

const handler = nc()
  .use(upload.single("image"))
  .post(async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: "No image uploaded" });
      }

      const { width, height } = req.body;

      const resizedImage = await sharp(req.file.buffer)
        .resize({
          width: parseInt(width) || undefined,
          height: parseInt(height) || undefined,
          fit: "inside",
        })
        .png()
        .toBuffer();

      const base64Image = resizedImage.toString("base64");
      res.status(200).json({
        success: true,
        image: `data:image/png;base64,${base64Image}`,
      });
    } catch (error) {
      console.error("Resize error:", error);
      res.status(500).json({ success: false, message: "Image processing failed" });
    }
  });

export default handler;

// Disable default body parser for file upload
export const config = {
  api: {
    bodyParser: false,
  },
};
