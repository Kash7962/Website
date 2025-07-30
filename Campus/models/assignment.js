const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  classAssigned: {
    type: String,
    required: true,
  },
  submissionDate: {
    type: Date,
    required: true,
  },
  file: {
    type: String,
    required: true,
  },
  uploadedBy: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
    name: String,
    email: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Assignment', assignmentSchema);
