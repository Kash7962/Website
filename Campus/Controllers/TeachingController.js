const { Staff } = require('../models/staff');
const path = require('path');
const fs = require('fs');
const CourseMaterial = require('../models/course');

const updateOrCreateTeachingProfile = async (req, res) => {
  try {
    const staffId = req.user.id; // ID from JWT
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
    const user = await Staff.findById(req.user.id);

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


module.exports = {
  updateOrCreateTeachingProfile, getStaffProfile, uploadCourse, getAllCourses, deleteCourse
};
