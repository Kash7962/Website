const express = require('express');
const router = express.Router();
const leaveController = require('../Controllers/LeaveController');
const  {leaveValidator}  = require('../validators/schema');
const { verifyCookieToken } = require('../middlewares/middleware');

// Staff routes
router.get('/apply', verifyCookieToken, leaveController.getApplyPage);

// Apply for leave
router.post('/apply', verifyCookieToken, leaveValidator, leaveController.applyLeave);

// Get all leave requests
router.get('/all', verifyCookieToken, leaveController.getAllLeaves);

// Update leave status
router.post('/:id/status', verifyCookieToken, leaveController.updateLeaveStatus);

router.delete('/:id/delete', leaveController.deleteLeave);

module.exports = router;
