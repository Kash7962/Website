const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  reason: { type: String, required: true },
  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },
  totalDays: { type: Number, required: true },
  paidLeaves: { type: Number, default: 0 },
  unpaidLeaves: { type: Number, default: 0 },
  status: { type: String, enum: ['Pending', 'Approved', 'Denied'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);
