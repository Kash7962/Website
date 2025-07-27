const express = require('express');
const router = express.Router();

const { registerUser, loginUser, logout, googleLogin, forgotPassword, resetPassword, changePassword } = require('../Controllers/StaffController');
const { validateLogin, validateRegister } = require('../validators/schema');
const { validationResult } = require('express-validator');

// Registration route
router.post('/register', validateRegister, (req, res, next) => {
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

router.get('/dashboard', (req, res) => {
  // Assuming you have a dashboard view
  res.render('Dashboards/d', { title: 'Dashboard Staff' });
});

router.post('/google-login', googleLogin);

router.get('/forgot-password', (req, res) => {
  res.render('Register_Login/forgotPassword', { title: 'Forgot Password' });
});

router.get('/reset-password', (req, res) => {
  res.render('Register_Login/resetPassword', { title: 'Reset Password' });
});

router.get('/dashboard/accounts', (req, res) => {
  // Assuming you have a dashboard view
  res.render('Dashboards/accounts', { title: 'Dashboard Account' });
});

router.get('/dashboard/kitchen', (req, res) => {
  // Assuming you have a dashboard view
  res.render('Dashboards/kitchen', { title: 'Dashboard Kitchen' });
});

router.get('/dashboard/library', (req, res) => {
  // Assuming you have a dashboard view
  res.render('Dashboards/library', { title: 'Dashboard Library' });
});

router.get('/dashboard/management', (req, res) => {
  // Assuming you have a dashboard view
  res.render('Dashboards/management', { title: 'Dashboard Management' });
});

router.get('/dashboard/teaching', (req, res) => {
  // Assuming you have a dashboard view
  res.render('Dashboards/teaching', { title: 'Dashboard Teaching' });
});

// Send reset link to email
router.post('/forgot-password', forgotPassword);

// Handle password reset using token
router.post('/reset-password', resetPassword);

router.put('/change-password', changePassword);

router.get('/change-password', (req, res) => {
  res.render('Register_Login/changePassword', { title: 'Change Password' });
});

router.post('/logout', logout)
  // Clear session or token logic here
module.exports = router;
