const mongoose = require('mongoose');

const dailyAttendanceSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  status: { type: String, enum: ['Present', 'Absent'], required: true }
}, { _id: false });

const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  subject: { type: String, required: true },
  attended: { type: Number, default: 0 },     // Total Present count
  totalClasses: { type: Number, default: 0 }, // Total classes conducted
  dailyRecords: [dailyAttendanceSchema]       // Each class day entry
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
