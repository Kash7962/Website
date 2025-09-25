// middleware/multerConfig.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'procurements');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random()*1e9)}${ext}`;
    cb(null, name);
  }
});

function fileFilter(req, file, cb) {
  // allow pdf and images
  const allowed = /pdf|jpeg|jpg|png|gif/;
  const ext = (path.extname(file.originalname) || '').toLowerCase();
  const mimetypeOk = !!file.mimetype && allowed.test(file.mimetype);
  const extOk = allowed.test(ext);
  if (mimetypeOk && extOk) cb(null, true);
  else cb(new Error('Only PDF and image files are allowed'));
}

const uploadProcurement = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

module.exports = { uploadProcurement, UPLOAD_DIR };
