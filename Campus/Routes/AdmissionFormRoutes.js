const express = require('express');
const router = express.Router();
// const FormController = require('../Controllers/AdmissionController.js');
const { registrationForm } = require('../Controllers/AdmissionController.js');
const { submitAdmissionForm } = require('../Controllers/AdmissionController.js');
const { admissionValidator } = require('../schema.js');

router.route('/admissionForm')
.get(registrationForm)
.post(admissionValidator,submitAdmissionForm);

module.exports = router;

