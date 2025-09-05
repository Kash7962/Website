// models/CalendarEvent.js
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: '' },

  // Dates
  start: { type: Date, required: true },
  end: { type: Date }, // optional for multi-day

  // Time fields for partial-day events
  startTime: { type: String, trim: true }, // e.g. "09:00"
  endTime: { type: String, trim: true },   // e.g. "11:30"

  allDay: { type: Boolean, default: true },

  type: {
    type: String,
    enum: ['holiday','exam','program','meeting','webinar','observance','practical','other'],
    default: 'other'
  },
  color: { type: String, trim: true },

  batches: [{ type: String, trim: true }],

  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});

eventSchema.index({ start: 1, end: 1, type: 1 });
eventSchema.index({ batches: 1 });

// Default color assignment
eventSchema.pre('save', function(next) {
  const typeColor = {
    holiday: '#e74c3c',
    exam: '#e67e22',
    program: '#3498db',
    meeting: '#2ecc71',
    webinar: '#9b59b6',
    observance: '#f1c40f',
    practical: '#16a085',
    other: '#7f8c8d'
  };
  if (!this.color || this.color.trim() === '') {
    this.color = typeColor[this.type] || typeColor.other;
  }
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('CalendarEvent', eventSchema);
