const express = require('express');
const router = express.Router();

const { showRegistrationForm, submitAdmissionForm, loginUser, googleLogin, forgotPassword, resetPassword, changePassword, logout, getAllCourses } = require('../Controllers/StudentController.js');
const { studentValidator } = require('../validators/schema.js');
const { verifyToken } = require('../middlewares/middleware.js');

// Admission form routes (with optional verifyToken if needed)
router
  .route('/admissionForm')
  .get(showRegistrationForm)
  .post(studentValidator, submitAdmissionForm);

router.get('/login', (req, res) => {
  res.render('Student/login', { title: 'Login' });
});

router.get('/forgot-password', (req, res) => {
  res.render('Student/forgotPassword', { title: 'Forgot Password' });
});

router.get('/reset-password', (req, res) => {
  res.render('Student/resetPassword', { title: 'Reset Password' });
});

router.get('/change-password', verifyToken, (req, res) => {
  res.render('Student/changePassword', { title: 'Change Password' });
});

router.get('/dashboard', verifyToken, (req, res) => {
  res.render('Dashboards/student', { title: 'Dashboard Student' });
});

router.get('/get-courses', verifyToken, getAllCourses);

router.post('/login', studentValidator, loginUser);

router.post('/google-login', googleLogin);

router.post('/forgot-password', forgotPassword);

router.post('/reset-password', resetPassword);

router.post('/change-password', changePassword);

router.post('/logout', logout);

module.exports = router;
