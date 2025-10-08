import multer from "multer";
import sharp from "sharp";
import Cors from "cors";
import { buffer } from "micro";

const cors = Cors({ origin: true });

// Memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Helper to run middleware
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

export const config = {
  api: {
    bodyParser: false, // needed for multer
  },
};

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);

  if (req.method === "POST") {
    upload.single("image")(req, res, async function (err) {
      if (err) return res.status(500).json({ error: err.message });

      const { width, height } = req.body;
      try {
        const data = await sharp(req.file.buffer)
          .resize(parseInt(width), parseInt(height))
          .toBuffer();

        const base64Image = data.toString("base64");
        res.status(200).json({ image: `data:image/png;base64,${base64Image}` });
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
