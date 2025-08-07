const express = require('express');
const router = express.Router();
const multer = require('../config/multer_notice');
const multer_event = require('../config/multer_event');
const multer_program = require('../config/multer_program');
const multer_schedule = require('../config/multer_schedule');
const { adminValidator, staffValidator } = require('../validators/schema');
const { verifyToken } = require('../middlewares/middleware');
const {Admin} = require('../models/admin');
const {
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
    createAdmin,
    updateAdmin,
    showAllAdmins,
    deleteAdmin,
    getAdminProfile,
    updateAdminProfile,
    getAdminById,
    getAllStaffs,
    getEditStaff,
    updateStaff,
    deleteStaff,
    renderAssignPermissionsPage,
    assignOrUpdatePermissions,
} = require('../Controllers/AdminController');



// Admin routes
// router.get('/notices', verifyToken, getAdminNotices);

// router.post('/notices', verifyToken, multer.single('file'), validateNotice, createNotice);

// router.post('/notices/delete/:id', verifyToken, deleteNotice);

// router.get('/programs', verifyToken, getAdminPrograms);

// router.post('/programs', verifyToken, multer_program.single('file'), validateNotice, createPrograms);

// router.post('/programs/delete/:id', verifyToken, deletePrograms);

// router.get('/events', verifyToken, getAdminEvents);

// router.post('/events', verifyToken, multer_event.single('file'), validateNotice, createEvents);

// router.post('/events/delete/:id', verifyToken, deleteEvents);

// router.get('/student', getStudentSchedules);

// // Management view
// router.get('/schedules', getManagementSchedules);

// // Upload schedule
// router.post('/schedules/upload', verifyToken, multer_schedule.single('scheduleFile'), validateClassSchedule, uploadSchedule);

// // Delete schedule
// router.post('/schedules/delete/:id', verifyToken, deleteSchedule);

// Create new admin
router.get('/register', (req, res) => {
  res.render('Admin/admin_register', { title: 'Register Admin' });
});
router.post('/register', adminValidator, createAdmin);

router.get('/dashboard', (req, res) => {
  res.render('Dashboards/admin', { title: 'Dashboard Admin' });
});


// ====================================
// Admin Profile
// ====================================
router.get('/profile', getAdminProfile);
router.post('/profile', adminValidator, updateAdminProfile);



// ====================================
// Admin Management
// ====================================
router.get('/get', showAllAdmins);                     // List all admins
router.get('/update/:id', (req, res) => {              // Render update form
  res.render('Admin/update', { title: 'Update Admin' });
});
router.put('/update/:id', adminValidator, updateAdmin);
router.delete('/delete/:id', deleteAdmin);



// ====================================
// Staff Routes (Must be before dynamic :id)
// ====================================
router.get('/staff/get', getAllStaffs);                // List all staff
router.get('/staff/edit/:id', getEditStaff);
router.put('/staff/update/:id', staffValidator, updateStaff);
router.delete('/staff/delete/:id', deleteStaff);
router.get('/staff/permissions/:staffId', renderAssignPermissionsPage);
router.post('/staff/staff-access', assignOrUpdatePermissions);


// ====================================
// Dynamic Route (Keep at the bottom)
// ====================================
router.get('/:id', getAdminById);   


module.exports = router;
