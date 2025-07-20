const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    match: /^\+[1-9]\d{6,14}$/, // E.164 format
  },
  password: {
    type: String,
    minlength: 6,
    validate: {
      validator: function (value) {
        // If user is not using Google, password must be present
        if (!this.isGoogle && (!value || value.trim().length < 6)) {
          return false;
        }
        return true;
      },
      message: 'Password is required and must be at least 6 characters for non-Google users.',
    },
  },
  isGoogle: {
    type: Boolean,
    default: false,
  },
  isAuthorized: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Staff', staffSchema);
