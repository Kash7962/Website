// routes/payments.js
const express = require('express');
const router = express.Router();
const paymentCtrl = require('../Controllers/PaymentController');
const { verifyCookieToken } = require('../middlewares/middleware');
// Render/manage page (server-side render)
router.get('/manage/:studentId', verifyCookieToken, paymentCtrl.getPaymentsForStudent);

// API to return payments JSON (AJAX)
router.get('/api/student/:studentId', verifyCookieToken, paymentCtrl.apiGetPayments);

// Create payment (receipt optional)
router.post('/create', paymentCtrl.uploadReceipt, verifyCookieToken, paymentCtrl.createPayment);

// Update payment (receipt optional)
router.put('/:id', paymentCtrl.uploadReceipt, verifyCookieToken, paymentCtrl.updatePayment);

// Delete payment
router.delete('/:id', verifyCookieToken, paymentCtrl.deletePayment);

// GET form to set fees due for a student
router.get('/set-due/:studentId', verifyCookieToken, paymentCtrl.showSetFeesDueForm);

// POST update fees due
router.post('/set-due/:studentId', verifyCookieToken, paymentCtrl.updateFeesDue);

module.exports = router;
