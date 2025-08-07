const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  name: { type: String },
  type: { type: String, enum: ['photo', 'pdf'], required: true },
  url: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Document', documentSchema);
