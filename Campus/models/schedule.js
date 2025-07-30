const mongoose = require('mongoose');

const classScheduleSchema = new mongoose.Schema({
  classAssigned: { type: String, required: true, trim: true },
  filePath: { type: String, required: true },
  fileType: { type: String, enum: ['image', 'pdf'], required: true },
  uploadedAt: { type: Date, default: Date.now }
});

const ClassSchedule = mongoose.model('ClassSchedule', classScheduleSchema);
module.exports = {ClassSchedule};
