const mongoose = require('mongoose');

const familyMemberSchema = new mongoose.Schema({
  name: { type: String },
  age: { type: Number },
  relation: { type: String },
  education: { type: String },
  otherInfo: { type: String }
}, { _id: false });

const studentSchema = new mongoose.Schema({
  // Student Personal Info
  course: { type: String },
  firstName: { type: String, required: true },
  middleName: { type: String },
  lastName: { type: String, required: true },
  gender: { type: String, enum: ['male', 'female'], required: true },
  studentEmail: { type: String, lowercase: true, trim: true, required: true, unique: true },
  dob: { type: Date, required: true },
  studentPhone: { type: String, required: true },
  aadhaarNumber: { type: String },
  caste: { type: String },
  subCaste: { type: String },
  religion: { type: String },
  bplAplStatus: { type: String },
  profileImage: { type: String }, // URL to student photo

  // Guardian / Family Info
  guardian1Name: { type: String, required: true },
  guardian1Relation: { type: String, enum: ['Father', 'Mother', 'Brother', 'Sister', 'Other'], required: true },
  guardian1Occupation: { type: String },
  guardian1Income: { type: Number },
  guardian1Phone: { type: String, required: true },
  guardian1Email: { type: String },
  guardian2Name: { type: String },
  guardian2Relation: { type: String },
  guardian2Occupation: { type: String },
  guardian2Income: { type: Number },
  totalFamilyMembers: { type: Number },
  familyMembers: [familyMemberSchema],

  // Address
  address1: { type: String, required: true },
  address2: { type: String },
  city: { type: String },
  block: { type: String },
  district: { type: String },
  state: { type: String, required: true },
  zipcode: { type: String, required: true },
  country: { type: String, default: "India" },

  // Education History
  lastSchoolAttended: { type: String },
  matricBoard: { type: String },
  matricRollNo: { type: String },
  matricYear: { type: Number },
  matricMarks: {
    MIL: Number,
    English: Number,
    TLH: Number,
    Science: Number,
    Math: Number,
    Physics: Number,
    Chemistry: Number,
    total: Number,
    percentage: Number
  },

  // Institutional Details
  registration_number: { type: String, unique: true, sparse: true },
  enrollmentNumber: { type: String },
  classAssigned: { type: String },
  subjects: [{ type: String }],
  joiningDate: { type: Date },
  academicYear: { type: String },
  academicSession: { type: String },
  batch: { type: String },
  currentSemester: { type: String },
  isEnrolled: { type: Boolean, default: false },
  isPromoted: { type: Boolean, default: false },
  isGraduated: { type: Boolean, default: false },

  // Scholarship / Hostel / Transport
  isHostelResident: { type: Boolean, default: false },
  hostelJoiningDate: { type: Date },
  hostelWithinCampus: { type: Boolean },
  hostelDurationMonths: { type: Number },
  isTransportResident: { type: Boolean, default: false },

  // Hobbies & Interests
  hobby: { type: String },
  interest: { type: String },

  // Fees
  feesDue: { type: Number, default: 0 },

  // Bank Details
  bankAccountNumber: { type: String },
  ifscCode: { type: String },
  bankName: { type: String },
  bankBranch: { type: String },
  isAadhaarLinkedToBank: { type: Boolean },

  // Login
  password: { type: String }

}, { timestamps: true });

const Student = mongoose.model('Student', studentSchema);
module.exports = { Student };
