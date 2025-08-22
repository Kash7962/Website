const express = require('express');
const router = express.Router();

const { registerUser, loginUser, logout, googleLogin, forgotPassword, resetPassword, changePassword, getStaffProfile, } = require('../Controllers/StaffController');
const { validateLogin, staffValidator } = require('../validators/schema');
const { validationResult } = require('express-validator');
const { verifyCookieToken } = require('../middlewares/middleware');

// Registration route
router.post('/register', staffValidator, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}, registerUser);

// Login route
router.post('/login', validateLogin, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}, loginUser);

router.get('/register', (req, res) => {
  res.render('Register_Login/registerForm', { title: 'Register' });
});

router.get('/login', (req, res) => {
  res.render('Register_Login/loginForm', { title: 'Login' });
});

router.get('/dashboard', verifyCookieToken, (req, res) => {
  // Assuming you have a dashboard view
  res.render('Dashboards/staff', { title: 'Dashboard Staff' });
});

router.post('/google-login', googleLogin);

router.get('/forgot-password', (req, res) => {
  res.render('Register_Login/forgotPassword', { title: 'Forgot Password' });
});

router.get('/reset-password', (req, res) => {
  res.render('Register_Login/resetPassword', { title: 'Reset Password' });
});


// Send reset link to email
router.post('/forgot-password', forgotPassword);

// Handle password reset using token
router.post('/reset-password', resetPassword);

router.put('/change-password', verifyCookieToken, changePassword);

router.get('/change-password', verifyCookieToken, (req, res) => {
  res.render('Register_Login/changePassword', { title: 'Change Password' });
});

router.get('/profile', verifyCookieToken, getStaffProfile);

router.post('/logout', logout)
  // Clear session or token logic here
module.exports = router;
