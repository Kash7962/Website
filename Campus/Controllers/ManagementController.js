const { Student } = require('../models/student');
const { Staff } = require('../models/staff');
const {Notice, Event, Program} = require('../models/notice');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');
const { ClassSchedule } = require('../models/schedule');

// Get all non-enrolled students
const getApplications = async (req, res) => {
  try {
    const students = await Student.find({ isEnrolled: false });
    res.render('Management/enrollment', { students });
  } catch (err) {
    res.status(500).send('Error loading applications');
  }
};

// Enroll a student (set isEnrolled to true)
const enrollStudent = async (req, res) => {
  try {
    await Student.findByIdAndUpdate(req.params.id, { isEnrolled: true });
    res.status(200).json({ message: 'Student enrolled' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to enroll student' });
  }
};

// Delete a student application
const deleteStudent = async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Application deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete application' });
  }
};

const getEnrolledStudents = async (req, res) => {
  try {
    const students = await Student.find({ isEnrolled: true });
    res.render('Management/students', { students });
  } catch (err) {
    res.status(500).send('Error fetching students');
  }
};

const getEditStudentPage = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).send('Student not found');
    res.render('Management/manage-students', { student });
  } catch (err) {
    res.status(500).send('Error loading student data');
  }
};

// Handle update
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;

    fields.isHostelResident = !!fields.isHostelResident;
    fields.isTransportResident = !!fields.isTransportResident;
    fields.isPromoted = !!fields.isPromoted;
    fields.isGraduated = !!fields.isGraduated;
    fields.isEnrolled = !!fields.isEnrolled;

    // Optional: subjects[] from string (if still string input)
    if (typeof fields.subjects === 'string') {
      fields.subjects = fields.subjects.split(',').map(s => s.trim());
    }

    await Student.findByIdAndUpdate(id, fields, { new: true });
    res.redirect('/Staff/Management/students/get');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating student');
  }
};


// Handle deletion
const deleteStudent2 = async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.redirect('/Staff/Management/students/get');
  } catch (err) {
    res.status(500).send('Error deleting student');
  }
};

const getAllStaff = async (req, res) => {
  try {
    const staffs = await Staff.find();
    res.render('Management/staff-list', { staffs });
  } catch (err) {
    res.status(500).send('Error fetching staff');
  }
};

// GET single staff for editing
const getEditStaff = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).send('Staff not found');
    res.render('Management/edit-staff', { staff });
  } catch (err) {
    res.status(500).send('Error fetching staff for edit');
  }
};

// POST edit staff
const updateStaff = async (req, res) => {
  try {
    const body = req.body;

    // Utility: Convert comma-separated strings to arrays
    const toArray = (field) =>
      field ? field.split(',').map(s => s.trim()).filter(Boolean) : [];

    // Convert to arrays
    body.qualifications = toArray(body.qualifications);
    body.subjects = toArray(body.subjects);
    body.classAssigned = toArray(body.classAssigned);
    body.skills = toArray(body.skills);
    body.achievements = toArray(body.achievements);
    body.certifications = toArray(body.certifications);
    body.responsibilities = toArray(body.responsibilities);

    // Convert booleans
    body.isAuthorized = body.isAuthorized === 'true';
    body.foodSafetyCertified = body.foodSafetyCertified === 'true';
    body.isCatalogManager = body.isCatalogManager === 'true';
    body.managesPayroll = body.managesPayroll === 'true';

    // Convert empty enums to undefined (Mongoose will allow it)
    const nullableEnums = ['financeLevel', 'role', 'section', 'shiftTiming', 'employmentType'];
    nullableEnums.forEach(field => {
      if (body[field] === '') {
        body[field] = undefined;
      }
    });

    await Staff.findByIdAndUpdate(req.params.id, body, { runValidators: true });
    res.redirect('/Staff/Management/staffs');
  } catch (err) {
    res.status(400).send('Update failed: ' + err.message);
  }
};



// DELETE staff
const deleteStaff = async (req, res) => {
  try {
    await Staff.findByIdAndDelete(req.params.id);
    res.status(200).send('Deleted successfully');
  } catch (err) {
    res.status(500).send('Error deleting staff');
  }
};

const getNotices = async (req, res) => {
  const notices = await Notice.find().sort({ postedOn: -1 });
  res.render('Home/notices', { notices });
};

const getAdminNotices = async (req, res) => {
  const notices = await Notice.find().sort({ postedOn: -1 });
  res.render('Management/notices', { notices });
};

const createNotice = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const notices = await Notice.find();
    return res.status(400).render('Management/notices', {
      notices,
      errors: errors.array()
    });
  }

  const { description } = req.body;
  const file = req.file ? req.file.filename : '';

  const newNotice = new Notice({ description, file });
  await newNotice.save();
  res.redirect('/Staff/Management/notices');
};

const deleteNotice = async (req, res) => {
  const notice = await Notice.findById(req.params.id);
  if (notice.file) {
    fs.unlink(path.join(__dirname, '../uploads/notices/', notice.file), () => {});
  }
  await Notice.findByIdAndDelete(req.params.id);
  res.redirect('/Staff/Management/notices');
};

const getPrograms = async (req, res) => {
  const programs = await Program.find().sort({ postedOn: -1 });
  res.render('Home/programs', { programs });
};

const getAdminPrograms = async (req, res) => {
  const programs = await Program.find().sort({ postedOn: -1 });
  res.render('Management/programs', { programs });
};

const createPrograms = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const programs = await Program.find();
    return res.status(400).render('Management/programs', {
      programs,
      errors: errors.array()
    });
  }

  const { description } = req.body;
  const file = req.file ? req.file.filename : '';

  const newProgram = new Program({ description, file });
  await newProgram.save();
  res.redirect('/Staff/Management/programs');
};

const deletePrograms = async (req, res) => {
  const program = await Program.findById(req.params.id);
  if (program.file) {
    fs.unlink(path.join(__dirname, '../uploads/programs/', program.file), () => {});
  }
  await Program.findByIdAndDelete(req.params.id);
  res.redirect('/Staff/Management/programs');
};

const getEvents = async (req, res) => {
  const events = await Event.find().sort({ postedOn: -1 });
  res.render('Home/events', { events });
};

const getAdminEvents = async (req, res) => {
  const events = await Event.find().sort({ postedOn: -1 });
  res.render('Management/events', { events });
};

const createEvents = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const events = await Event.find();
    return res.status(400).render('Management/events', {
      events,
      errors: errors.array()
    });
  }

  const { description } = req.body;
  const file = req.file ? req.file.filename : '';

  const newEvent = new Event({ description, file });
  await newEvent.save();
  res.redirect('/Staff/Management/events');
};

const deleteEvents = async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (event.file) {
    fs.unlink(path.join(__dirname, '../uploads/events/', event.file), () => {});
  }
  await Notice.findByIdAndDelete(req.params.id);
  res.redirect('/Staff/Management/events');
};

const getStudentSchedules = async (req, res) => {
  try {
    const userClass = req.user?.classAssigned; // Assumes middleware sets req.user
    const schedules = await ClassSchedule.find({ classAssigned: userClass });
    res.render('schedules/studentView', { schedules, userClass });
  } catch (err) {
    res.status(500).send('Server error');
  }
};

// View for management
const getManagementSchedules = async (req, res) => {
  try {
    const schedules = await ClassSchedule.find().sort({ uploadedAt: -1 });
    res.render('Management/schedules', { schedules });
  } catch (err) {
    res.status(500).send('Server error');
  }
};

// Upload
const uploadSchedule = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty() || !req.file) {
    return res.status(400).send('Invalid input or file missing');
  }

  const fileType = req.file.mimetype.includes('pdf') ? 'pdf' : 'image';

  try {
    const newSchedule = new ClassSchedule({
      classAssigned: req.body.classAssigned,
      filePath: req.file.path,
      fileType
    });
    await newSchedule.save();
    res.redirect('/Staff/Management/schedules');
  } catch (err) {
    res.status(500).send('Server error');
  }
};

// Delete
const deleteSchedule = async (req, res) => {
  try {
    const schedule = await ClassSchedule.findById(req.params.id);
    
    if (!schedule) {
      console.error('Schedule not found');
      return res.status(404).send('Schedule not found');
    }

    // Ensure file exists before trying to delete
    const absolutePath = path.resolve(schedule.filePath);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    } else {
      console.warn(`File not found: ${absolutePath}`);
    }

    await schedule.deleteOne(); // Use deleteOne() instead of deprecated remove()
    res.redirect('/Staff/Management/schedules');

  } catch (err) {
    console.error('Error deleting schedule:', err.message);
    res.status(500).send('Server error');
  }
};


module.exports = {
  getApplications,
  enrollStudent,
  deleteStudent,
  getEnrolledStudents,
  updateStudent,
  deleteStudent2,
  getEditStudentPage,
  getAllStaff,
  getEditStaff,
  updateStaff,
  deleteStaff,
  getNotices,
  getAdminNotices,
  createNotice,
  deleteNotice,
  getPrograms,
  getAdminPrograms,
  createPrograms,
  deletePrograms,
  getEvents,
  getAdminEvents,
  createEvents,
  deleteEvents,
  getStudentSchedules,
  getManagementSchedules,
  uploadSchedule,
  deleteSchedule,
};
