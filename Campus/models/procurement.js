// models/procurement.js
const mongoose = require('mongoose');

const ProcurementSchema = new mongoose.Schema({
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  filename: { type: String, required: true },      // stored filename on disk
  originalName: { type: String },                   // original file name
  mimeType: { type: String },
  status: { type: String, enum: ['pending','accepted','denied'], default: 'pending' },
  itemsAdded: { type: Boolean, default: false },    // whether uploader already added items for this accepted procurement
  uploadDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Procurement', ProcurementSchema);
