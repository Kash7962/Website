const mongoose = require('mongoose');
const path = require('path');

const paymentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },

  amountPaid: {
    type: Number,
    required: true,
    min: 0
  },

  paymentDate: {
    type: Date,
    default: Date.now
  },

  receiptFile: {
    type: String, // path or URL to uploaded file
    validate: {
      validator: function (v) {
        if (!v) return true; // optional
        const ext = path.extname(v).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.pdf'].includes(ext);
      },
      message: 'Receipt must be JPG, JPEG, PNG, or PDF'
    }
  }
});

// --- Post-save hook to update student's feesDue ---
paymentSchema.post('save', async function (doc) {
  const Student = mongoose.model('Student');
  const student = await Student.findById(doc.studentId);

  if (student) {
    student.feesDue = Math.max(0, (student.feesDue || 0) - doc.amountPaid);
    await student.save();
  }
});

module.exports = mongoose.model('Payment', paymentSchema);
