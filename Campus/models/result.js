const mongoose = require('mongoose');

const subjectScoreSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., Physics
  theoryMarks: { type: Number, required: true }, // main paper marks
  theoryMaxMarks: { type: Number }, // optional
  theoryPercentage: { type: Number }, // optional

  // Optional lab details (if applicable)
  hasLab: { type: Boolean, default: false },
  labMarks: { type: Number },
  labMaxMarks: { type: Number },
  labPercentage: { type: Number },

  grade: { type: String }
}, { _id: false });

const resultSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },

  examType: {
    type: String,
    enum: [
      'Monthly Achievement Test (MAT)',
      'Cumulative Achievement Test (CAT)',
      'Test Examination',
      'Practice Test Series (PTS)',
      'Very Similar Test (VST)',
      'Annual Examination'
    ],
    required: true
  },

  year: { type: Number, required: true },     // e.g., 2025
  month: { type: String, required: true },    // e.g., 'July'

  subjects: [subjectScoreSchema],

  // Optional totals & grading
  totalTheoryMarks: { type: Number },
  totalTheoryMaxMarks: { type: Number },
  totalLabMarks: { type: Number },
  totalLabMaxMarks: { type: Number },
  totalPercentage: { type: Number },

  sgpa: { type: Number },
  cgpa: { type: Number },

  dateRecorded: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Result', resultSchema);
