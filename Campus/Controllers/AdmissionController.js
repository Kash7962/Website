const Admission = require('../models/admissionForm');
const { validationResult } = require('express-validator');

module.exports = {
  registrationForm: (req, res) => {
    res.render('Forms/admissionForm');
  },

submitAdmissionForm : async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Log or handle error response
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const admission = new Admission(req.body);
    await admission.save();
    res.status(200).send('Admission form submitted successfully!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
},
};

