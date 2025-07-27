const LeaveRequest = require('../models/leave');
const { validationResult } = require('express-validator');

// Submit leave
const createLeave = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { reason, fromDate, toDate } = req.body;
  const { username, email, phone } = req.user;

  try {
    const leave = new LeaveRequest({ username, email, phone, reason, fromDate, toDate });
    await leave.save();
    res.status(201).json({ message: 'Leave request submitted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// View all leave requests
const getAllLeaves = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find().sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Approve or deny leave
const updateLeaveStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['Approved', 'Denied'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const leave = await LeaveRequest.findByIdAndUpdate(id, { status }, { new: true });
    res.json(leave);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete by user
const deleteLeaveByUser = async (req, res) => {
  const { id } = req.params;
  const userEmail = req.user.email;

  try {
    const leave = await LeaveRequest.findById(id);
    if (!leave) return res.status(404).json({ error: 'Leave not found' });

    if (leave.email !== userEmail) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await LeaveRequest.findByIdAndDelete(id);
    res.json({ message: 'Leave deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Auto delete expired leaves (CRON-based or scheduled call)
const deleteExpiredLeaves = async () => {
  const today = new Date();
  try {
    await LeaveRequest.deleteMany({ toDate: { $lt: today } });
  } catch (err) {
    console.error('Error deleting expired leaves:', err.message);
  }
};

module.exports = {
  createLeave,
  updateLeaveStatus,
  deleteLeaveByUser,
  deleteExpiredLeaves,
  getAllLeaves
};
