const express = require('express');
const router = express.Router();
const { updateOrCreateTeachingProfile, getStaffProfile, getAllCourses, uploadCourse, deleteCourse } = require('../Controllers/TeachingController');
const {verifyToken} = require('../middlewares/middleware');
const upload = require('../config/multer');
const { validateCourseUpload, validateRegister } = require('../validators/schema')

router.put('/update-profile', verifyToken, updateOrCreateTeachingProfile);

router.get('/profile', (req, res) => {
  res.render('Teaching/profile', { title: 'Teaching Profile' });
});

router.get('/update-profile', verifyToken, validateRegister, getStaffProfile);

router.get('/manage-courses',verifyToken, getAllCourses);

// Upload a course material
router.post('/upload-course', verifyToken, validateCourseUpload, upload.single('file'), uploadCourse);

// Delete a course material
router.post('/manage-courses/delete', verifyToken, deleteCourse);

module.exports = router;
