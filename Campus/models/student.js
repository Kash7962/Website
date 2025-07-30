const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  examType: { type: String, required: true }, // e.g., 'Mid Term', 'Final'
  subjects: [{
    name: { type: String, required: true },
    marks: { type: Number, required: true },
    grade: { type: String }
  }],
  sgpa: { type: Number },
  cgpa: { type: Number }
}, { _id: false });

const attendanceSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  attended: { type: Number, required: true },
  totalClasses: { type: Number, required: true }
}, { _id: false });

const documentSchema = new mongoose.Schema({
  name: { type: String },
  url: { type: String },
  uploadedAt: { type: Date, default: Date.now }
}, { _id: false });

const paymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  mode: { type: String }, // e.g., "Online", "Cash"
  receiptNumber: { type: String }
}, { _id: false });

const studentSchema = new mongoose.Schema({
  // Student Personal Info
  course: { type: String, required: true },
  firstName: { type: String, required: true },
  middleName: { type: String },
  lastName: { type: String, required: true },
  gender: { type: String, enum: ['male', 'female'], required: true },
  studentEmail: { type: String, lowercase: true, trim: true, required: true, unique: true },
  dob: { type: Date, required: true },
  studentPhone: { type: String, required: true },

  // Guardian Info
  guardian1Name: { type: String, required: true },
  guardian1Relation: { type: String, enum: ['Father', 'Mother', 'Brother', 'Sister', 'Other'], required: true },
  guardian1Email: { type: String },
  guardian1Phone: { type: String, required: true },

  guardian2Name: { type: String },
  guardian2Relation: { type: String },

  // Address
  address1: { type: String, required: true },
  address2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipcode: { type: String, required: true },
  country: { type: String, required: true },

  // Institutional Fields
  registration_number: { type: String, unique: true, sparse: true },
  subjects: [{ type: String }],
  classAssigned: { type: String },
  joiningDate: { type: Date },
  academicYear: { type: String },
  batch: { type: String },
  academicSession: { type: String },
  feesDue: { type: Number, default: 0 },

  // Academic Details
  result: [resultSchema],
  attendance: [attendanceSchema],

  // Login & Auth
  password: { type: String }, // Hashed password
  isEnrolled: { type: Boolean, default: false },
  isHostelResident: { type: Boolean, default: false },
  isTransportResident: { type: Boolean, default: false },

  // Optional Enhancements
  documents: [documentSchema],
  paymentHistory: [paymentSchema],
  currentSemester: { type: String },
  isPromoted: { type: Boolean, default: false },
  isGraduated: { type: Boolean, default: false }

}, { timestamps: true }); // includes createdAt and updatedAt

const Student = mongoose.model('Student', studentSchema);
module.exports = { Student };
