const express = require('express');
const router = express.Router();

const { registerUser, loginUser, logout, googleLogin } = require('../Controllers/StaffController');
const { validateLogin, validateRegister } = require('../schema');
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

router.post('/logout', logout)
  // Clear session or token logic here
module.exports = router;
