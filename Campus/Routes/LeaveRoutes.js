const express = require('express');
const router = express.Router();
const { getAllLeaves, createLeave, deleteLeaveByUser, updateLeaveStatus } = require('../Controllers/LeaveController');
const { leaveValidator } = require('../validators/schema');
const { verifyToken } = require('../middlewares/middleware');

// Staff routes
router.post('/request', verifyToken, leaveValidator, createLeave);
router.delete('/:id', verifyToken, deleteLeaveByUser);

// Management routes
router.get('/', verifyToken, getAllLeaves);
router.patch('/status/:id', verifyToken, updateLeaveStatus);
router.get('/dashboard', verifyToken, (req, res) => {
  res.render('Leave/staffLeave', { title: 'Staff Leave Dashboard' });
});

module.exports = router;
