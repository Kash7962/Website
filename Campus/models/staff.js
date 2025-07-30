const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  // Basic Info
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
  required: true,
  minlength: 6,
  trim: true,
  validate: {
    validator: function (value) {
      return value && value.trim().length >= 6;
    },
    message: 'Password must be at least 6 characters.',
  },
},

  department: {
    type: String,
    required: true,
    enum: ['Teaching', 'Kitchen', 'Library', 'Management', 'Accounts'],
  },
  isAuthorized: {
    type: Boolean,
    default: false,
  },
    salary: Number,
  // ================================
  // Optional Fields: Teaching Staff
  // ================================
  qualifications: {
    type: [String],
  }, 
  yearsOfExperience: Number,
  subjects: [String],
  designation: String,
  classAssigned: [String],

  joiningDate: Date,
  employmentType: {
    type: String,
    enum: ['Permanent', 'Contract', 'Part-Time'],
    default: 'Permanent',
  },
  skills: [String],
  achievements: [String],

  // ================================
  // Optional Fields: Kitchen Staff
  // ================================
  shiftTiming: {
    type: String,
    enum: ['Morning', 'Evening', 'Night'],
  },
  areaAssigned: String,
  foodSafetyCertified: {
    type: Boolean,
    default: false,
  },

  // ================================
  // Optional Fields: Library Staff
  // ================================
  section: {
    type: String,
    enum: ['Reference', 'Circulation', 'Digital', 'Periodicals'],
  },
  issuedBooksCount: {
    type: Number,
    default: 0,
  },
  isCatalogManager: {
    type: Boolean,
    default: false,
  },

  // ================================
  // Optional Fields: Management
  // ================================
  role: {
    type: String,
    enum: ['Principal', 'Vice Principal', 'Director', 'Admin Officer'],
  },
  responsibilities: [String],

  // ================================
  // Optional Fields: Accounts
  // ================================
  financeLevel: {
    type: String,
    enum: ['Junior Accountant', 'Senior Accountant', 'Finance Manager'],
  },
  certifications: [String],
  managesPayroll: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

const Staff = mongoose.model('Staff', staffSchema);
module.exports = {Staff};
