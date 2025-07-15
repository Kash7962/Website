const express = require('express');
const router = express.Router();

const { registerUser, loginUser } = require('../Controllers/UserController');
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


module.exports = router;
