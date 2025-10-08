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
      await sharp(filePath)
        .resize(300, 300)
        .toFile(outputPath);

      const imageBuffer = fs.readFileSync(outputPath);
      res.setHeader("Content-Type", "image/jpeg");
      res.send(imageBuffer);
    } catch (error) {
      res.status(500).send(error.message);
    } finally {
      fs.unlinkSync(filePath);
      fs.unlinkSync(outputPath);
    }
  });
}
