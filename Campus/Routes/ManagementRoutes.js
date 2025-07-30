const express = require('express');
const router = express.Router();
const multer = require('../config/multer_notice');
const multer_event = require('../config/multer_event');
const multer_program = require('../config/multer_program');
const multer_schedule = require('../config/multer_schedule');
const { validateNotice, validateRegister, studentValidator, validateClassSchedule } = require('../validators/schema');
const { verifyToken } = require('../middlewares/middleware');
const {
  getApplications,
  enrollStudent,
  deleteStudent,
  getEnrolledStudents,
    updateStudent,
    deleteStudent2,
    getEditStudentPage,
    getAllStaff,
    getEditStaff,
    updateStaff,
    deleteStaff,
    getAdminNotices,
    createNotice,
    deleteNotice,
  getAdminPrograms,
  createPrograms,
  deletePrograms,
  getAdminEvents,
  createEvents,
  deleteEvents,
  getStudentSchedules,
  getManagementSchedules,
  uploadSchedule,
  deleteSchedule,
} = require('../Controllers/ManagementController');


// View all non-enrolled applications
router.get('/applications', verifyToken, getApplications);

// Enroll student
router.put('/enroll/:id', verifyToken, enrollStudent);

// Delete student
router.delete('/delete/:id', verifyToken, deleteStudent);

router.get('/students/get', verifyToken, getEnrolledStudents);

// Route to render edit form
router.get('/students/edit/:id', verifyToken, getEditStudentPage);

// Route to handle update
router.post('/students/edit/:id', verifyToken, studentValidator, updateStudent);

// Route to handle delete
router.post('/students/delete/:id', verifyToken, deleteStudent2);

router.get('/staffs', verifyToken, getAllStaff);

router.get('/staffs/edit/:id', verifyToken, getEditStaff);

router.post('/staffs/edit/:id', verifyToken, validateRegister, updateStaff);

router.delete('/staffs/delete/:id', verifyToken,deleteStaff);

// Admin routes
router.get('/notices', verifyToken, getAdminNotices);

router.post('/notices', verifyToken, multer.single('file'), validateNotice, createNotice);

router.post('/notices/delete/:id', verifyToken, deleteNotice);

router.get('/programs', verifyToken, getAdminPrograms);

router.post('/programs', verifyToken, multer_program.single('file'), validateNotice, createPrograms);

router.post('/programs/delete/:id', verifyToken, deletePrograms);

router.get('/events', verifyToken, getAdminEvents);

router.post('/events', verifyToken, multer_event.single('file'), validateNotice, createEvents);

router.post('/events/delete/:id', verifyToken, deleteEvents);

// router.get('/student', getStudentSchedules);

// Management view
router.get('/schedules', getManagementSchedules);

// Upload schedule
router.post('/schedules/upload', verifyToken, multer_schedule.single('scheduleFile'), validateClassSchedule, uploadSchedule);

// Delete schedule
router.post('/schedules/delete/:id', verifyToken, deleteSchedule);

module.exports = router;
