import multer from "multer";
import sharp from "sharp";
import fs from "fs";

const upload = multer({ dest: "/tmp" });

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  // Use upload.any() to parse file + fields
  upload.any()(req, res, async (err) => {
    if (err) return res.status(500).send(err.message);

    try {
      const file = req.files.find(f => f.fieldname === "image");
      if (!file) return res.status(400).json({ success: false, message: "No file uploaded" });

      // width & height come as strings in req.body
      const width = parseInt(req.body.width) || 300;
      const height = parseInt(req.body.height) || 300;

      const outputPath = `/tmp/resized-${file.originalname}`;

      await sharp(file.path)
        .resize(width, height)
        .toFile(outputPath);

      const imageBuffer = fs.readFileSync(outputPath);
      const base64Image = `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;

      res.status(200).json({ success: true, image: base64Image });

      // cleanup
      fs.unlinkSync(file.path);
      fs.unlinkSync(outputPath);
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Image processing failed" });
    }
  });
}
