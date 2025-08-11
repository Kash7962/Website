// routes/payments.js
const express = require('express');
const router = express.Router();
const paymentCtrl = require('../Controllers/PaymentController');

// Render/manage page (server-side render)
router.get('/manage/:studentId', paymentCtrl.getPaymentsForStudent);

// API to return payments JSON (AJAX)
router.get('/api/student/:studentId', paymentCtrl.apiGetPayments);

// Create payment (receipt optional)
router.post('/create', paymentCtrl.uploadReceipt, paymentCtrl.createPayment);

// Update payment (receipt optional)
router.put('/:id', paymentCtrl.uploadReceipt, paymentCtrl.updatePayment);

// Delete payment
router.delete('/:id', paymentCtrl.deletePayment);

// GET form to set fees due for a student
router.get('/set-due/:studentId', paymentCtrl.showSetFeesDueForm);

// POST update fees due
router.post('/set-due/:studentId', paymentCtrl.updateFeesDue);

module.exports = router;
