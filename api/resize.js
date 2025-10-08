import { IncomingMessage, ServerResponse } from 'http';
import sharp from 'sharp';
import multer from 'multer';
import Cors from 'cors';

const cors = Cors({ origin: true });
const upload = multer({ storage: multer.memoryStorage() });

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req = IncomingMessage, res = ServerResponse) {
  await runMiddleware(req, res, cors);

  if (req.method === 'POST') {
    upload.single('image')(req, res, async function (err) {
      if (err) return res.status(500).json({ error: err.message });

      const { width, height } = req.body;
      try {
        const buffer = await sharp(req.file.buffer)
          .resize(parseInt(width), parseInt(height))
          .toBuffer();
        const base64 = buffer.toString('base64');
        res.status(200).json({ image: `data:image/png;base64,${base64}` });
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}
