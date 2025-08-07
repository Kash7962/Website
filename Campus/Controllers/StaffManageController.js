const { Staff } = require('../models/staff');
const path = require('path');
const fs = require('fs');
const CourseMaterial = require('../models/course');
const Assignment = require('../models/assignment');
const { Student } = require('../models/student');


const uploadCourse = async (req, res) => {
  try {
    const { courseName, userId, username, email } = req.body;

    if (!req.file) return res.status(400).render('error/error', {message: 'File not found'});

    const newMaterial = new CourseMaterial({
      courseName,
      filename: req.file.filename,
      uploadedBy: {
        id: userId,
        name: username,
        email
      }
    });

    await newMaterial.save();
    res.status(200).send("File uploaded successfully");
  } catch (err) {
    console.error(err);
    return res.status(500).render('error/error', {message: 'Server error'});
  }
};

const getAllCourses = async (req, res) => {
  try {
    const files = await CourseMaterial.find().sort({ uploadedAt: -1 });
    res.render('Teaching/manage-courses', { files });
  } catch (err) {
    console.error(err);
    return res.status(500).render('error/error', {message: 'Server error'});
  }
};

const deleteCourse = async (req, res) => {
  const { id, email } = req.body;

  try {
    const file = await CourseMaterial.findById(id);
    if (!file) return res.status(404).render('error/error', {message: 'File not found'});

    if (file.uploadedBy.email !== email) {
      return res.status(403).render('error/error', {message: 'Action not allowed'});
    }

    // Delete file from disk
    const filePath = path.join(__dirname, '../uploads/teaching/courses/', file.filename);
    fs.unlink(filePath, (err) => {
      if (err) console.error("File deletion error:", err);
    });

    await CourseMaterial.findByIdAndDelete(id);
    res.status(200).send("Deleted successfully");
  } catch (err) {
    console.error(err);
    return res.status(500).render('error/error', {message: 'Server error'});
  }
};

const uploadAssignment = async (req, res) => {
  const { title, classAssigned, submissionDate } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).render('error/error', {message: 'File not provided'});
  }

  try {
    const user = req.user; // Assumed to be added via auth middleware
    const assignment = new Assignment({
      title,
      classAssigned,
      submissionDate,
      file: file.filename,
      uploadedBy: {
        id: user._id,
        name: user.username,
        email: user.email,
      },
    });

    await assignment.save();
    res.redirect('/Staff/Teaching/assignments');
  } catch (err) {
    return res.status(500).render('error/error', {message: 'Server error'});
  }
};

const viewAssignments = async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.email) {
      return res.status(404).render('error/error', {message: 'User info not found'});
    }

    const assignments = await Assignment.find({
      'uploadedBy.email': user.email
    }).sort({ createdAt: -1 });

    res.render('Teaching/assignment', {
      user,
      assignments // could be empty array
    });
  } catch (err) {
    console.error('Error fetching assignments:', err.message);
    return res.status(500).render('error/error', {message: 'Server error'});
  }
};

const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment || assignment.uploadedBy.email !== req.user.email) {
      return res.status(403).render('error/error', {message: 'Unauthorized access'});
    }

    const filePath = path.join(__dirname, '..', 'uploads', 'teaching', 'assignment', assignment.file);
    fs.unlinkSync(filePath);

    await Assignment.findByIdAndDelete(req.params.id);
    res.redirect('/Staff/Teaching/assignments');
  } catch (err) {
    return res.status(500).render('error/error', {message: 'Server error'});
  }
};



module.exports = {
  uploadCourse, getAllCourses, deleteCourse, 
  uploadAssignment, viewAssignments, deleteAssignment, 
};
