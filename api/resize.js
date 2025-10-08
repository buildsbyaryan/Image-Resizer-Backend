import multer from "multer";
import sharp from "sharp";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false, // we use multer
  },
};

const upload = multer({ dest: "/tmp" }); // temporary folder in serverless

export default async function handler(req, res) {
  if (req.method === "POST") {
    upload.single("image")(req, res, async (err) => {
      if (err) return res.status(500).json({ error: err.message });

      const filePath = req.file.path;
      const outputPath = `/tmp/resized-${req.file.originalname}`;

      await sharp(filePath)
        .resize(300, 300)
        .toFile(outputPath);

      const imageBuffer = fs.readFileSync(outputPath);

      res.setHeader("Content-Type", "image/jpeg");
      res.send(imageBuffer);

      // clean up
      fs.unlinkSync(filePath);
      fs.unlinkSync(outputPath);
    });
  } else {
    res.status(405).send("Method Not Allowed");
  }
}
