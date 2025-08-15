const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create upload folders if not exist
const uploadPath = path.join(__dirname, '../uploads/students');
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const studentId = req.params.id || req.params.studentId; // taken from route /finalize-student/:id
    const studentFolder = path.join(__dirname, '../uploads/students', studentId);

    // Create if doesn't exist
    if (!fs.existsSync(studentFolder)) {
      fs.mkdirSync(studentFolder, { recursive: true });
    }

    cb(null, studentFolder);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeName = `${file.fieldname}-${Date.now()}${ext}`;
    cb(null, safeName);
  }
});


const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'profileImage') {
    // Allow only images for profile
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for profile photo!'));
    }
  } else if (file.fieldname === 'documents') {
    // Allow pdf or images for documents
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF or image files allowed for documents!'));
    }
  } else {
    cb(null, true);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
