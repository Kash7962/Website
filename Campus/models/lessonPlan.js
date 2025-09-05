// models/Curriculum.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const SUBJECTS = [
  'MIL English', 'MIL Odiya', 'Maths',
  'Physics', 'Chemistry', 'Botany', 'Zoology', 'IT'
];

/* ---------- Principal Review ---------- */
const PrincipalReviewSchema = new Schema({
  approved: { type: Boolean, default: null }, // null = not reviewed yet
  comment: { type: String, default: '' },
  reviewedAt: { type: Date },
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'Staff' }
}, { _id: false });

/* ---------- Teacher Progress ---------- */
const TeacherProgressSchema = new Schema({
  teacher: { type: Schema.Types.ObjectId, ref: 'Staff', required: true }, // link to teacher
  percentComplete: { type: Number, default: 0, min: 0, max: 100 },
  completed: { type: Boolean, default: false },
  notes: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'Staff' }
}, { _id: false });

/* ---------- Curriculum Item ---------- */
const CurriculumItemSchema = new Schema({
  subject: { type: String, enum: SUBJECTS, required: true },
  unit: { type: String, required: true, trim: true },
  chapter: { type: String, required: true, trim: true },
  topic: { type: String, required: true, trim: true },
  subtopic: { type: String, required: true, trim: true },
  numberOfDays: { type: Number, min: 0, default: 1 },

  // Multiple teachers can have their own copy of progress
  teacherProgress: { type: [TeacherProgressSchema], default: [] },

  // Principal/admin can review the curriculum item (shared)
  principalReview: { type: PrincipalReviewSchema, default: () => ({}) },

  createdBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

/* ---------- Hooks ---------- */
CurriculumItemSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = {
  CurriculumItem: mongoose.model('CurriculumItem', CurriculumItemSchema),
  SUBJECTS
};
