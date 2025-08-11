// controllers/paymentController.js
// controllers/paymentController.js
const path = require('path');
const fs = require('fs'); // <-- sync and callback API
const fsp = require('fs/promises'); // <-- promise based for async use
const multer = require('multer');
const Payment = require('../models/payment');
const { Student } = require('../models/student');

// ----------------- Multer (per-student receipts) -----------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const studentId = req.body.studentId || req.params.studentId;
      if (!studentId) return cb(new Error('Student ID required for file upload'));

      const studentDir = path.join(__dirname, '..', 'uploads', 'students', studentId, 'payments');
      // Use sync mkdir here as multer expects sync or callback
      fs.mkdirSync(studentDir, { recursive: true });
      cb(null, studentDir);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  const accepted = allowed.includes(file.mimetype);
//   console.log(`File filter: mimetype=${file.mimetype}, accepted=${accepted}`);
  cb(null, accepted);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

exports.uploadReceipt = upload.single('receiptFile');

// ----------------- Controllers -----------------

// Create Payment
exports.createPayment = async (req, res) => {
  try {
    const { studentId, amountPaid, paymentDate } = req.body;
    // console.log('Received file:', req.file);
    if (!studentId || !amountPaid) {
      if (req.file) await fsp.unlink(req.file.path).catch(() => {});
      return res.status(400).render('error/error', { message: 'Student ID and amount paid are required' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      if (req.file) await fsp.unlink(req.file.path).catch(() => {});
      return res.status(404).render('error/error', { message: 'Student not found' });
    }

    const paymentData = {
      studentId,
      amountPaid: Number(amountPaid),
      paymentDate: paymentDate ? new Date(paymentDate) : undefined
    };

    if (req.file) {
      paymentData.receiptFile = `/uploads/students/${studentId}/payments/${path.basename(req.file.path)}`;
    }

    const payment = await Payment.create(paymentData); // post-save hook will deduct feesDue
    return res.status(201).json({ message: 'Payment recorded', payment });
  } catch (err) {
    console.error('createPayment err:', err);
    if (req.file) await fsp.unlink(req.file.path).catch(() => {});
    return res.status(500).render('error/error', { message: 'Server error' });
  }
};

// Get payments for student (EJS or JSON)
exports.getPaymentsForStudent = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const student = await Student.findById(studentId).lean();
    if (!student) return res.status(404).render('error/error', { message: 'Student not found' });

    const payments = await Payment.find({ studentId }).sort({ paymentDate: -1 }).lean();

    if (req.accepts('html')) {
      return res.render('Staff/managePayment', { student, payments });
    }

    return res.json({ student, payments });
  } catch (err) {
    console.error('getPaymentsForStudent err:', err);
    return res.status(500).render('error/error', { message: 'Server error' });
  }
};

// API: JSON payments list
exports.apiGetPayments = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const payments = await Payment.find({ studentId }).sort({ paymentDate: -1 }).lean();
    return res.json({ payments });
  } catch (err) {
    console.error('apiGetPayments err:', err);
    return res.status(500).render('error/error', { message: 'Server error' });
  }
};

// Update Payment
exports.updatePayment = async (req, res) => {
  try {
    const paymentId = req.params.id;
    const existing = await Payment.findById(paymentId);
    if (!existing) {
      if (req.file) await fsp.unlink(req.file.path).catch(() => {});
      return res.status(404).render('error/error', { message: 'Payment not found' });
    }

    const oldAmount = existing.amountPaid;
    const updates = {};
    if (req.body.amountPaid !== undefined) updates.amountPaid = Number(req.body.amountPaid);
    if (req.body.paymentDate) updates.paymentDate = new Date(req.body.paymentDate);

    if (req.file) {
      updates.receiptFile = `/uploads/students/${existing.studentId}/payments/${path.basename(req.file.path)}`;
      if (existing.receiptFile) {
        const oldPath = path.join(__dirname, '..', 'public', existing.receiptFile);
        try {
          await fsp.unlink(oldPath);
        } catch {}
      }
    }

    const updated = await Payment.findByIdAndUpdate(paymentId, updates, { new: true, runValidators: true }).lean();

    if (updates.amountPaid !== undefined) {
      const delta = updated.amountPaid - oldAmount;
      const student = await Student.findById(updated.studentId);
      if (student) {
        student.feesDue = Math.max(0, (student.feesDue || 0) - delta);
        await student.save();
      }
    }

    return res.json({ message: 'Payment updated', payment: updated });
  } catch (err) {
    console.error('updatePayment err:', err);
    if (req.file) await fsp.unlink(req.file.path).catch(() => {});
    return res.status(500).render('error/error', { message: 'Server error' });
  }
};

// Delete Payment
exports.deletePayment = async (req, res) => {
  try {
    const paymentId = req.params.id;
    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).render('error/error', { message: 'Payment not found' });

    if (payment.receiptFile) {
      const filePath = path.join(__dirname, '..', payment.receiptFile);
      try {
        await fsp.unlink(filePath);
      } catch {}
    }

    await Payment.findByIdAndDelete(paymentId);

    const student = await Student.findById(payment.studentId);
    if (student) {
      student.feesDue = (student.feesDue || 0) + payment.amountPaid;
      await student.save();
    }

    return res.json({ message: 'Payment deleted' });
  } catch (err) {
    console.error('deletePayment err:', err);
    return res.status(500).render('error/error', { message: 'Server error' });
  }
};



exports.showSetFeesDueForm = async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId).lean();
    if (!student) return res.status(404).render('error/error', { message: 'Student not found' });

    return res.render('Staff/setFeesDue', { student });
  } catch (err) {
    console.error('showSetFeesDueForm error:', err);
    return res.status(500).render('error/error', { message: 'Server error' });
  }
};

// Handle update feesDue POST request
exports.updateFeesDue = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const { feesDue } = req.body;

    if (feesDue === undefined || isNaN(feesDue) || feesDue < 0) {
      return res.status(400).json({ error: 'Invalid feesDue amount' });
    }

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).render('error/error', { message: 'Student not found' });

    student.feesDue = Number(feesDue);
    await student.save();

    return res.json({ message: 'Fees Due updated successfully' });
  } catch (err) {
    console.error('updateFeesDue error:', err);
    return res.status(500).render('error/error', { message: 'Server error' });
  }
};