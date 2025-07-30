const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/curriculum'),
  filename: (req, file, cb) =>
    cb(null, Date.now() + '-' + file.originalname)
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.pdf' || ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and image files are allowed.'));
  }
};

module.exports = multer({ storage, fileFilter });
