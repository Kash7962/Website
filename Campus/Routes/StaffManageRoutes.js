const express = require('express');
const router = express.Router();
const {  getAllCourses, uploadCourse, deleteCourse, viewAssignments, uploadAssignment, deleteAssignment, } = require('../Controllers/StaffManageController');
const {verifyToken} = require('../middlewares/middleware');
const upload = require('../config/multer_course');
const upload2 = require('../config/multer_assignment');
const { validateCourseUpload, staffValidator, assignmentValidator } = require('../validators/schema')

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


module.exports = router;
