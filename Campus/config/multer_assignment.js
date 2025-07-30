const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Allowed MIME types
const allowedMimeTypes = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp'
];

// Dynamic storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let targetFolder = 'uploads/teaching/courses'; // default

    // Detect route or custom context
    if (req.uploadContext === 'assignment') {
      targetFolder = 'uploads/teaching/assignment';
    }

    // Ensure the directory exists
    fs.mkdirSync(targetFolder, { recursive: true });
    cb(null, targetFolder);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = `${file.fieldname}-${Date.now()}${ext}`;
    cb(null, uniqueName);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and image files are allowed!'), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
