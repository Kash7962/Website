const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, refPath: 'userModel' }, // student or staff
  userModel: { type: String, enum: ['Staff', 'Admin'], required: true },
  name: { type: String, required: true, trim: true }, // e.g., 'John Doe'
  email: { type: String, required: true, trim: true }, // e.g
  action: { type: String, required: true, trim: true }, // e.g., 'CREATE_STUDENT', 'DELETE_FEE', 'LOGIN'
  targetModel: { type: String, trim: true }, // which model was affected, e.g., 'Student', 'Result'
  targetId: { type: mongoose.Schema.Types.ObjectId, refPath: 'targetModel' },
  targetname: { type: String, trim: true }, // e.g., 'Jane Doe'
  targetEmail: { type: String, trim: true }, // e.g., '
  registrationNumber: { type: String, trim: true }, // e.g., '2023-001'
  classAssigned: { type: String, trim: true }, // e.g., '10th Grade'
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
