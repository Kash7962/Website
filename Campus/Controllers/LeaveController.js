const LeaveRequest = require('../models/leave');
const { Staff } = require('../models/staff');
// const {Staff} = require('../models/staff');
const ActivityLog = require('../models/activityLog');
// Apply for leave
// Apply Leave (No deduction here)
exports.applyLeave = async (req, res) => {
  try {
    const { reason, fromDate, toDate } = req.body;
    const staffId = req.user._id; // From auth middleware/session

    const staff = await Staff.findById(staffId);
    if (!staff) return res.status(404).render('error/error', { message: 'Staff not found' });

    // Validate dates
    const from = new Date(fromDate);
    const to = new Date(toDate);
    if (from > to) return res.status(400).render('error/error', { message: 'From date cannot be after To date' });

    // Calculate leave days
    const totalDays = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;

    // Decide how many could be paid/unpaid (but don't deduct yet!)
    let paidLeaves = Math.min(totalDays, staff.numberOfLeaves);
    let unpaidLeaves = totalDays - paidLeaves;

    const leaveRequest = new LeaveRequest({
      staffId: staff._id,
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      reason,
      fromDate,
      toDate,
      totalDays,
      paidLeaves,
      unpaidLeaves,
      status: 'Pending' // default
    });

    await leaveRequest.save();
    res.status(200).json({ message: 'Leave request submitted successfully', leaveRequest });

  } catch (err) {
    console.error('Error in applyLeave:', err);
    res.status(500).render('error/error',{ message: 'Server error' });
  }
};

// Approve or Deny leave (deduction/refund happens here)
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const leaveRequest = await LeaveRequest.findById(id).populate('staffId');
    if (!leaveRequest) return res.status(404).render('error/error',{ message: 'Leave request not found' });

    const staff = await Staff.findById(leaveRequest.staffId);
    if (!staff) return res.status(404).render('error/error', { message: 'Staff not found' });

    // ✅ Check previous status
    const previousStatus = leaveRequest.status;

    if (status === 'Approved') {
      // Only deduct if it was not already approved before
      if (previousStatus !== 'Approved') {
        staff.numberOfLeaves = Math.max(0, staff.numberOfLeaves - leaveRequest.paidLeaves);
        await staff.save();
      }
    } else if (status === 'Denied') {
      // If it was previously approved and now denied → return leaves back
      if (previousStatus === 'Approved') {
        staff.numberOfLeaves += leaveRequest.paidLeaves;
        await staff.save();
      }
    } 
    // If Pending → no change needed

    leaveRequest.status = status;
    await leaveRequest.save();
        const user = await Staff.findById(req.user._id);
            await ActivityLog.create({
              userId : user._id,
              userModel: 'Staff',
              name: user.name,
              email: user.email,
              action: `Leave status updated from ${previousStatus} → ${status}`,
              targetModel: 'Staff',
              targetId: staff._id,
              targetname: staff.name,
              targetEmail: staff.email,
              // registrationNumber: student.registration_number,
              // classAssigned: student.classAssigned
            });
    res.status(200).json({
      message: `Leave status updated from ${previousStatus} → ${status}`,
      leaveRequest
    });

  } catch (err) {
    console.error('Error updating leave:', err);
    res.status(500).render('error/error', { message: 'Server error' });
  }
};


// Get all leave requests
exports.getAllLeaves = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find()
      .populate('staffId')
      .sort({ createdAt: -1 });

    res.render('Staff/manageLeave', { leaves });
  } catch (err) {
    console.error(err);
    res.status(500).render('error/error', { message: 'Unable to fetch leaves' });
  }
};

// Render apply leave page
exports.getApplyPage = async (req, res) => {
  try {
    const staffId = req.user._id; // from token/session
    const staff = await Staff.findById(staffId);
    const staffLeaves = await LeaveRequest.find({ staffId }).sort({ createdAt: -1 });

    res.render('Staff/applyLeave', { staff, staffLeaves });
  } catch (err) {
    console.error(err);
    res.status(500).render('error/error', { message: 'Unable to load leave form' });
  }
};

// Delete leave request
exports.deleteLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const leaveRequest = await LeaveRequest.findById(id);
    if (!leaveRequest) return res.status(404).render('error/error',{ message: 'Leave request not found' });

    if (leaveRequest.status !== 'Pending') {
      return res.status(400).render('error/error',{ message: 'Only pending leave requests can be deleted' });
    }

    // Return deducted paid leaves
    if (leaveRequest.paidLeaves > 0) {
      const staff = await Staff.findById(leaveRequest.staffId);
      if (staff) {
        staff.numberOfLeaves += leaveRequest.paidLeaves;
        await staff.save();
      }
    }

    await LeaveRequest.findByIdAndDelete(id);
    res.status(200).json({ message: 'Leave request deleted successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).render('error/error', { message: 'Server error' });
  }
};
