const mongoose = require('mongoose');

const staffAttendanceSchema = new mongoose.Schema({
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff', // Reference to your main Staff model
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late', 'Half-Day'],
    default: 'Present'
  },
  checkInTime: {
    type: Date
  },
  checkOutTime: {
    type: Date
  },
  markedBy: {
    type: String,
    enum: ['FaceSystem', 'Manual'],
    default: 'FaceSystem'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure one attendance record per staff per date
staffAttendanceSchema.index({ staff: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('StaffAttendance', staffAttendanceSchema);
