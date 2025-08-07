const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  // ============================
  // Core Required Fields
  // ============================
  name: {
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
    match: /^\+[1-9]\d{6,14}$/, // E.164 international format
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
    enum: ['Academic', 'Residential', 'Kitchen', 'Library', 'Sports'],
  },
  isAuthorized: {
    type: Boolean,
    default: false,
  },
  salary: {
    type: Number,
    min: 0,
  },

  // ============================
  // Optional Academic Info
  // ============================
  qualifications: {
    type: [String], // e.g., ['M.Sc', 'Ph.D']
    trim: true,
  },
  yearsOfExperience: {
    type: Number,
    min: 0,
  },
  subjects: [String],
  designation: {
    type: String,
    trim: true,
  },
  classAssigned: [String],
  joiningDate: Date,
  employmentType: {
    type: String,
    enum: ['Permanent', 'Contract', 'Part-Time'],
    default: 'Permanent',
  },
  skills: [String],
  certifications: [String],
  achievements: [String],

  // ============================
  // Biodata-Specific Additions
  // ============================
  academicDetails: [
    {
      examination: { type: String, trim: true },
      boardOrUniversity: { type: String, trim: true },
      yearOfPassing: Number,
      divisionOrGrade: { type: String, trim: true }
    }
  ],
  researchProjectsCompleted: {
    type: [String],
  },
  ongoingProjects: {
    type: [String],
  },
  researchScholars: {
    completedPhD: { type: Number, default: 0 },
    continuingPhD: { type: Number, default: 0 },
    completedMPhil: { type: Number, default: 0 },
    continuingMPhil: { type: Number, default: 0 },
  },
  awardsReceived: [String],
  booksPublished: {
    type: Number,
    min: 0,
  },
  researchPapers: {
    published: { type: Number, default: 0 },
    communicated: { type: Number, default: 0 },
  },
  presentAddress: {
    type: String,
    trim: true,
  },
  contactInfo: {
    altPhone: {
      type: String,
      match: /^\+[1-9]\d{6,14}$/,
    },
    emailAlt: {
      type: String,
      trim: true,
      lowercase: true,
    },
  }

}, {
  timestamps: true,
});

const Staff = mongoose.model('Staff', staffSchema);
module.exports = { Staff };
