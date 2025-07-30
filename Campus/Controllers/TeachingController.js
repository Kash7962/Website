const { Staff } = require('../models/staff');
const path = require('path');
const fs = require('fs');
const CourseMaterial = require('../models/course');
const Assignment = require('../models/assignment');
const { Student } = require('../models/student');

const updateOrCreateTeachingProfile = async (req, res) => {
  try {
    const staffId = req.user._id; // ID from JWT
    const staff = await Staff.findById(staffId);

    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    const {
      username,
      phone,
      email,
      department,
      subjects,
      yearsOfExperience,
      qualifications,
      skills,
      achievements,
    } = req.body;

    // Update the staff fields directly
    staff.username = username || staff.username;
    staff.phone = phone || staff.phone;
    staff.email = email || staff.email;
    staff.department = department || staff.department;
    staff.subjects = subjects || staff.subjects;
    staff.yearsOfExperience = yearsOfExperience || staff.yearsOfExperience;
    staff.qualifications = qualifications || staff.qualifications;
    staff.skills = skills || staff.skills;
    staff.achievements = achievements || staff.achievements;

    // Save updated document
    const updatedStaff = await staff.save();

    res.status(200).json({
      message: 'Teaching profile updated successfully',
      // user: updatedStaff, // ✅ This key will be used in frontend to update localStorage
    });

  } catch (error) {
    console.error('Error in profile update/create:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getStaffProfile = async (req, res) => {
  try {
    const user = await Staff.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Error fetching staff profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const uploadCourse = async (req, res) => {
  try {
    const { courseName, userId, username, email } = req.body;

    if (!req.file) return res.status(400).send("No file uploaded");

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
    res.status(500).send("Server error while uploading");
  }
};

const getAllCourses = async (req, res) => {
  try {
    const files = await CourseMaterial.find().sort({ uploadedAt: -1 });
    res.render('Teaching/manage-courses', { files });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error while fetching materials");
  }
};

const deleteCourse = async (req, res) => {
  const { id, email } = req.body;

  try {
    const file = await CourseMaterial.findById(id);
    if (!file) return res.status(404).send("File not found");

    if (file.uploadedBy.email !== email) {
      return res.status(403).send("You are not authorized to delete this file");
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
    res.status(500).send("Server error while deleting");
  }
};

const uploadAssignment = async (req, res) => {
  const { title, classAssigned, submissionDate } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: 'File is required' });
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
    res.status(500).send('Server error');
  }
};

const viewAssignments = async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.email) {
      return res.status(401).send('User info not found');
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
    res.status(500).send('Error fetching assignments');
  }
};

const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment || assignment.uploadedBy.email !== req.user.email) {
      return res.status(403).send('Unauthorized');
    }

    const filePath = path.join(__dirname, '..', 'uploads', 'teaching', 'assignment', assignment.file);
    fs.unlinkSync(filePath);

    await Assignment.findByIdAndDelete(req.params.id);
    res.redirect('/Staff/Teaching/assignments');
  } catch (err) {
    res.status(500).send('Error deleting assignment');
  }
};

const getStudentsByClass = async (req, res) => {
  try {
    const { classAssigned } = req.body;
    // console.log('Fetching students for class:', classAssigned);
    const students = await Student.find({ classAssigned });
    res.json({ students });
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ error: 'Error fetching students' });
  }
};

const getStudentMarksPage = async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student) return res.status(404).send('Student not found');
    res.render('Teaching/addMarks', { student });
  } catch (err) {
    res.status(500).send('Error loading student data');
  }
};

const addMarks = async (req, res) => {
  const { examType, subjects, sgpa, cgpa } = req.body;
  const { studentId } = req.params;

  try {
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).send('Student not found');

    const existingExam = student.result.find(r => r.examType === examType);
    if (existingExam) return res.status(400).send('Marks for this exam type already exist');

    student.result.push({
      examType,
      subjects,
      sgpa: sgpa ? parseFloat(sgpa) : undefined,
      cgpa: cgpa ? parseFloat(cgpa) : undefined
    });

    await student.save();
    res.redirect(`/Staff/Teaching/student/${studentId}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error adding marks');
  }
};


// DELETE MARKS
const deleteMarks = async (req, res) => {
  const { examType } = req.body;
  try {
    await Student.findByIdAndUpdate(req.params.studentId, {
      $pull: { result: { examType } }
    });
    res.redirect(`/Staff/Teaching/student/${req.params.studentId}`);
  } catch (err) {
    res.status(500).send('Error deleting marks');
  }
};

// EDIT MARKS
const editMarks = async (req, res) => {
  try {
    const { examType, sgpa, cgpa } = req.body;
    let { subjects } = req.body;

    const student = await Student.findById(req.params.studentId);
    if (!student) return res.status(404).send('Student not found');

    const resultIndex = student.result.findIndex(r => r.examType === examType);
    if (resultIndex === -1) return res.status(404).send('Exam type not found');

    // Normalize subjects to array of objects
    if (Array.isArray(subjects?.name)) {
      subjects = subjects.name.map((_, i) => ({
        name: subjects.name[i],
        marks: parseFloat(subjects.marks[i]),
        grade: subjects.grade?.[i] || ''
      }));
    } else {
      // Single subject
      subjects = [{
        name: subjects?.name,
        marks: parseFloat(subjects?.marks),
        grade: subjects?.grade || ''
      }];
    }

    // Update the marks
    student.result[resultIndex].subjects = subjects;
    student.result[resultIndex].sgpa = sgpa ? parseFloat(sgpa) : undefined;
    student.result[resultIndex].cgpa = cgpa ? parseFloat(cgpa) : undefined;

    await student.save();
    res.redirect(`/Staff/Teaching/student/${req.params.studentId}`);
  } catch (err) {
    console.error('Edit marks error:', err);
    res.status(500).send('Error editing marks');
  }
};

const getAttendancePage = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).send('Student not found');
    res.render('Teaching/attendance', { student });
  } catch (err) {
    res.status(500).send('Server error');
  }
};

// POST add attendance
const addAttendance = async (req, res) => {
  const { subject, attended, totalClasses } = req.body;
  try {
    await Student.findByIdAndUpdate(req.params.id, {
      $push: { attendance: { subject, attended, totalClasses } }
    });
    res.redirect(`/Staff/Teaching/attendance/${req.params.id}`);
  } catch (err) {
    res.status(500).send('Error adding attendance');
  }
};

// POST edit attendance
const editAttendance = async (req, res) => {
  const { subject, attended, totalClasses } = req.body;
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).send('Student not found');
    student.attendance[req.params.index] = { subject, attended, totalClasses };
    await student.save();
    res.redirect(`/Staff/Teaching/attendance/${req.params.id}`);
  } catch (err) {
    res.status(500).send('Error editing attendance');
  }
};

// POST delete attendance
const deleteAttendance = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).send('Student not found');
    student.attendance.splice(req.params.index, 1);
    await student.save();
    res.redirect(`/Staff/Teaching/attendance/${req.params.id}`);
  } catch (err) {
    res.status(500).send('Error deleting attendance');
  }
};

module.exports = {
  updateOrCreateTeachingProfile, getStaffProfile, uploadCourse, getAllCourses, deleteCourse, 
  uploadAssignment, viewAssignments, deleteAssignment, addMarks, deleteMarks, getStudentMarksPage,
  getStudentsByClass, editMarks, getAttendancePage, addAttendance, editAttendance, deleteAttendance,
};
