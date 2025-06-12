const express = require('express');
const router = express.Router();
const FormController = require('../Controllers/FormController.js');

router.get('/RegistrationForm', FormController.registrationForm);

module.exports = router;