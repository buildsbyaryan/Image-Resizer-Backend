import multer from "multer";
import sharp from "sharp";
import fs from "fs";

const upload = multer({ dest: "/tmp" });

export const config = {
  api: {
    bodyParser: false, // Disable Vercel body parsing for multer
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  upload.single("image")(req, res, async (err) => {
    if (err) return res.status(500).send(err.message);

    try {
      const { file } = req;
      const { width, height } = req.body;

      if (!file) return res.status(400).json({ success: false, message: "No file uploaded" });

      const outputPath = `/tmp/resized-${file.originalname}`;

      // Resize image with proper width and height
      await sharp(file.path)
        .resize(parseInt(width), parseInt(height))
        .toFile(outputPath);

      const imageBuffer = fs.readFileSync(outputPath);
      const base64Image = `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;

      res.status(200).json({ success: true, image: base64Image });

      // Cleanup
      fs.unlinkSync(file.path);
      fs.unlinkSync(outputPath);
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Image processing failed" });
    }
  });
}
