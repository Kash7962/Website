const express = require('express');
const router = express.Router();
const {  getAllCourses, uploadCourse, deleteCourse, viewAssignments, uploadAssignment, deleteAssignment, getStaffPermissions, getPendingEnrollment, deleteEnrollment, postFinalizeForm, getFinalizeForm, getEditForm, getStudents, getPaymentPage, } = require('../Controllers/StaffManageController');
const {verifyToken} = require('../middlewares/middleware');
const upload = require('../config/multer_course');
const upload2 = require('../config/multer_assignment');
const { validateCourseUpload, staffValidator, assignmentValidator, studentValidator,  } = require('../validators/schema')
const upload3 = require('../config/multer_joining'); 


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

router.post('/get-permissions', getStaffPermissions);

// View all students pending enrollment
router.get('/pending-enrollment', getPendingEnrollment);

// Delete a student
router.delete('/delete/:id', deleteEnrollment);

router.get('/join/:id', getFinalizeForm);

router.post(
  '/join/:id',
  upload3.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'documents', maxCount: 10 }
  ]),
  studentValidator,
  postFinalizeForm
);

router.get('/studentsEnrolled', getStudents)

router.get('/editStudents/:id', getEditForm);

router.get('/payment', getPaymentPage)
// // GET direct join form
// router.get('/join', getJoinForm);

// // POST direct join
// // order: create id -> multer (saves files into uploads/students/:id) -> validators (if any) -> handler
// router.post(
//   '/join',
//   createStudentId,
//   upload3.fields([{ name: 'profileImage', maxCount: 1 }, { name: 'documents', maxCount: 10 }]),
//   studentValidator,
//   postDirectJoin
// );


module.exports = router;
