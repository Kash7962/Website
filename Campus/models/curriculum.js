const mongoose = require('mongoose');

const curriculumSchema = new mongoose.Schema({
  courseType: { type: String, required: true, trim: true },
  filePath: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
});

const Curriculum = mongoose.model('Curriculum', curriculumSchema);
module.exports = { Curriculum };