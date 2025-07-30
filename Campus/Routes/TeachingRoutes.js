const express = require('express');
const router = express.Router();
const { updateOrCreateTeachingProfile, getStaffProfile, getAllCourses, uploadCourse, deleteCourse, viewAssignments, uploadAssignment, deleteAssignment, getStudentsByClass, getStudentMarksPage, addMarks, deleteMarks, editMarks, getAttendancePage, addAttendance, editAttendance, deleteAttendance } = require('../Controllers/TeachingController');
const {verifyToken} = require('../middlewares/middleware');
const upload = require('../config/multer_course');
const upload2 = require('../config/multer_assignment');
const { validateCourseUpload, validateRegister, assignmentValidator } = require('../validators/schema')

router.put('/update-profile', verifyToken, validateRegister, updateOrCreateTeachingProfile);

router.get('/profile', (req, res) => {
  res.render('Teaching/profile', { title: 'Teaching Profile' });
});

router.get('/update-profile', verifyToken, getStaffProfile);

router.get('/manage-courses',verifyToken, getAllCourses);

// Upload a course material
router.post('/upload-course', verifyToken, validateCourseUpload, upload.single('file'), uploadCourse);

// Delete a course material
router.post('/manage-courses/delete', verifyToken, deleteCourse);

// Route: View all assignments uploaded by the logged-in teacher
router.get('/assignments', verifyToken, viewAssignments);

// Route: Upload new assignment
router.post('/assignments', verifyToken,(req, res, next) => {
    req.uploadContext = 'assignment'; // This sets destination to uploads/teaching/assignment
    next();
  },
  upload2.single('file'),
  assignmentValidator,
  uploadAssignment
);

// Route: Delete an assignment by ID (if uploaded by the current user)
router.post('/assignments/delete/:id', verifyToken, deleteAssignment);

// Get students of same classAssigned
router.post('/students', verifyToken, getStudentsByClass);

// Student detail page
router.get('/student/:studentId', verifyToken, getStudentMarksPage);

// Add marks
router.post('/student/:studentId/marks', verifyToken, addMarks);

// Delete marks
router.post('/student/:studentId/marks/delete', verifyToken, deleteMarks);

router.post('/student/:studentId/marks/edit', verifyToken, editMarks);
router.get('/students', verifyToken, (req, res) => {
  res.render('Teaching/students', { title: 'Students List' });
});

router.get('/attendance/:id', verifyToken, getAttendancePage);

router.post('/attendance/:id/add', verifyToken, addAttendance);

router.post('/attendance/:id/edit/:index', verifyToken, editAttendance);

router.post('/attendance/:id/delete/:index', verifyToken, deleteAttendance);

module.exports = router;
