const express = require('express');
const router = express.Router();
const {  getAllCourses, uploadCourse, deleteCourse, viewAssignments, uploadAssignment, deleteAssignment, getStaffPermissions, getPendingEnrollment, deleteEnrollment, postFinalizeForm, getFinalizeForm, getEditForm, getStudents, getPaymentPage, getDocument, getDocumentsByStudent, uploadDocument, deleteDocument, getResult, getStaffList, getAttendanceByStaff, markAttendance, manualAttendance, renderStaffAttendancePage, } = require('../Controllers/StaffManageController');
const upload = require('../config/multer_course');
const upload2 = require('../config/multer_assignment');
const { validateCourseUpload, staffValidator, assignmentValidator, studentValidator, documentValidator, staffAttendanceValidator,  } = require('../validators/schema')
const upload3 = require('../config/multer_joining'); 
const { verifyCookieToken } = require('../middlewares/middleware');

router.get('/manage-courses',verifyCookieToken, getAllCourses);

// Upload a course material
router.post('/upload-course', verifyCookieToken, validateCourseUpload, upload.single('file'), uploadCourse);

// Delete a course material
router.post('/manage-courses/delete', verifyCookieToken, deleteCourse);

// Route: View all assignments uploaded by the logged-in teacher
router.get('/assignments', verifyCookieToken, viewAssignments);

// Route: Upload new assignment
router.post('/assignments', verifyCookieToken,(req, res, next) => {
    req.uploadContext = 'assignment'; // This sets destination to uploads/teaching/assignment
    next();
  },
  upload2.single('file'),
  assignmentValidator,
  uploadAssignment
);

// Route: Delete an assignment by ID (if uploaded by the current user)
router.post('/assignments/delete/:id', verifyCookieToken, deleteAssignment);

router.post('/get-permissions', verifyCookieToken, getStaffPermissions);

// View all students pending enrollment
router.get('/pending-enrollment', verifyCookieToken, getPendingEnrollment);

// Delete a student
router.delete('/delete/:id', verifyCookieToken, deleteEnrollment);

router.get('/join/:id', verifyCookieToken, getFinalizeForm);

router.post(
  '/join/:id',
  upload3.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'documents', maxCount: 10 }
  ]),
  verifyCookieToken,
  documentValidator,
  studentValidator,
  postFinalizeForm
);

router.get('/studentsEnrolled', verifyCookieToken, getStudents)

router.get('/editStudents/:id', verifyCookieToken, getEditForm);

router.get('/payment', verifyCookieToken, getPaymentPage)
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

router.get('/documents', verifyCookieToken, getDocument);

// GET /documents/:studentId
router.get('/documents/:studentId', verifyCookieToken, getDocumentsByStudent);

// Upload new document
// POST /documents/:studentId/upload
// Multer field name must match "documents" from the EJS form
router.post(
  '/:studentId/upload',
   upload3.single('documents'),
   verifyCookieToken,
  documentValidator,
  uploadDocument
);

// Delete a document
// POST /documents/:studentId/delete/:docId
router.post('/documents/:studentId/delete/:docId', verifyCookieToken, deleteDocument);

router.get('/results', verifyCookieToken, getResult);

router.get('/stafflist', verifyCookieToken, getStaffList);

// Face or auto system attendance
router.post('/attendance/mark', verifyCookieToken, staffAttendanceValidator, markAttendance);

// Manual bypass attendance
router.post('/attendance/manual', verifyCookieToken, staffAttendanceValidator, manualAttendance);

// Fetch staff’s attendance
router.get('/attendance/get/:staffId', verifyCookieToken, getAttendanceByStaff);

router.get('/attendance/get', verifyCookieToken, renderStaffAttendancePage);

module.exports = router;
