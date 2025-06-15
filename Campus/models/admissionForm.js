const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
  course: { type: String, required: true },
  firstName: { type: String, required: true },
  middleName: { type: String },
  lastName: { type: String, required: true },
  gender: { type: String, enum: ['male', 'female'], required: true },
  dob: { type: Date, required: true },
  studentPhone: { type: String, required: true },

  guardian1Name: { type: String, required: true },
  guardian1Relation: { type: String, enum: ['Father', 'Mother', 'Brother', 'Sister', 'Other'], required: true },
  guardian1Email: { type: String },
  guardian1Phone: { type: String, required: true },

  guardian2Name: { type: String },
  guardian2Relation: { type: String },

  address1: { type: String, required: true },
  address2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipcode: { type: String, required: true },
  country: { type: String, required: true }
});

module.exports = mongoose.model('Admission', admissionSchema);
