const mongoose = require('mongoose');
const { Schema } = mongoose;

const adminSchema = new Schema({
  adminID: {
    type: String,
    unique: true,
    trim: true,
    uppercase: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    match: [/^\d{10,15}$/, 'Invalid phone number'],
  },
  role: {
    type: String,
    enum: ['Super Admin', 'Admin'],
    default: 'Admin',
  },
  password: {
    type: String,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const Admin = mongoose.model('Admin', adminSchema);
module.exports = {Admin}
