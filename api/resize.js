import multer from "multer";
import sharp from "sharp";
import fs from "fs";

const upload = multer({ dest: "/tmp" });

export const config = {
  api: {
    bodyParser: false, // disable Vercel body parsing for multer
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  upload.single("image")(req, res, async (err) => {
    if (err) return res.status(500).send(err.message);

    const filePath = req.file.path;
    const outputPath = `/tmp/resized-${req.file.originalname}`;

    try {
      // Resize the image
      await sharp(filePath)
        .resize(parseInt(req.body.width), parseInt(req.body.height))
        .toFile(outputPath);

      // Convert to base64 so frontend can use it directly
      const imageBuffer = fs.readFileSync(outputPath);
      const base64Image = `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;

      res.status(200).json({ success: true, image: base64Image });
    } catch (error) {
      res.status(500).send(error.message);
    } finally {
      fs.unlinkSync(filePath);
      fs.unlinkSync(outputPath);
    }
  });
}
