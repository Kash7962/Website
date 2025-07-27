const mongoose = require('mongoose');

const studentSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  registration_number: {
    type: String,
    default: null,
  },
  email: {
    type: String,
    required: true,
  },
  loginTime: {
    type: Date,
    default: Date.now,
  },
  logoutTime: {
    type: Date,
    default: null,
  },
  isStudent: {
    type: Boolean,
    default: true,
  },
  method: {
    type: String,
    enum: ['email', 'google'],
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  ipAddress: {
    type: String,
    default: '',
  },
  userAgent: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

const StudentSession = mongoose.model('StudentSession', studentSessionSchema);
module.exports = { StudentSession };
