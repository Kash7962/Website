const mongoose = require('mongoose');

const staffAccessSchema = new mongoose.Schema({
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true,
    unique: true,
  },

  permissions: {
    type: [String], // Directly store permission strings like ['create_exam', 'view_library']
    default: [],
  },

  // assignedBy: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'Admin',
  // },

  assignedAt: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true,
});

const StaffAccess = mongoose.model('StaffAccess', staffAccessSchema);
module.exports = { StaffAccess };
