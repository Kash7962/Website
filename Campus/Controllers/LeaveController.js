const LeaveRequest = require('../models/leave');

// Submit leave
const createLeave = async (req, res) => {

  const { reason, fromDate, toDate } = req.body;
  const { username, email, phone } = req.user;

  try {
    const leave = new LeaveRequest({ username, email, phone, reason, fromDate, toDate });
    await leave.save();
    res.status(201).json({ message: 'Leave request submitted' });
  } catch (err) {
    console.error(err);
    return res.status(500).render('error/error', {message: 'Server error'});
  }
};

// View all leave requests
const getAllLeaves = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find().sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    return res.status(500).render('error/error', {message: 'Server error'});
  }
};

// Approve or deny leave
const updateLeaveStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['Approved', 'Denied'].includes(status)) {
    return res.status(400).render('error/error', {message: 'Invalid status'});
  }

  try {
    const leave = await LeaveRequest.findByIdAndUpdate(id, { status }, { new: true });
    res.json(leave);
  } catch (err) {
    return res.status(404).render('error/error', {message: 'Server error'});
  }
};

// Delete by user
const deleteLeaveByUser = async (req, res) => {
  const { id } = req.params;
  const userEmail = req.user.email;

  try {
    const leave = await LeaveRequest.findById(id);
    if (!leave) return res.status(404).render('error/error', {message: 'Leave not found.'});

    if (leave.email !== userEmail) {
      return res.status(403).render('error/error', {
      message: 'You are not authorized to delete this leave.'});
    }

    await LeaveRequest.findByIdAndDelete(id);
    res.status(200).json({ message: 'Leave deleted' });
  } catch (err) {
    return res.status(500).render('error/error', {
      message: 'Server error' });;
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
