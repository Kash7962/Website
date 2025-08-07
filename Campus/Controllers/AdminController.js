const { Student } = require('../models/student');
const { Staff } = require('../models/staff');
const {Notice, Event, Program} = require('../models/notice');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');
const { ClassSchedule } = require('../models/schedule');
const { Admin } = require('../models/admin')
const jwt = require('jsonwebtoken');
const { StaffAccess } = require('../models/permissions');
const mongoose = require('mongoose');

// Get all non-enrolled students

const getNotices = async (req, res) => {
  try {
  const notices = await Notice.find().sort({ postedOn: -1 });
  res.render('Home/notices', { notices });
} catch (err){
   return res.status(500).render('error/error', {message: 'Server error' });
}
}

const getAdminNotices = async (req, res) => {
  try {
  const notices = await Notice.find().sort({ postedOn: -1 });
  res.render('Management/notices', { notices });
} catch (err) {
   return res.status(500).render('error/error', {message: 'Server error' });
}
}

const createNotice = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
     return res.status(500).render('error/error', {message: 'Server error' });
  }

  const { description } = req.body;
  const file = req.file ? req.file.filename : '';

  const newNotice = new Notice({ description, file });
  await newNotice.save();
  res.redirect('/Staff/Management/notices');
};

const deleteNotice = async (req, res) => {
  try {
  const notice = await Notice.findById(req.params.id);
  if (notice.file) {
    fs.unlink(path.join(__dirname, '../uploads/notices/', notice.file), () => {});
  }
  await Notice.findByIdAndDelete(req.params.id);
  res.redirect('/Staff/Management/notices');
} catch (err) {
   return res.status(500).render('error/error', {message: 'Server error' });
}
}

const getPrograms = async (req, res) => {
  try {
  const programs = await Program.find().sort({ postedOn: -1 });
  res.render('Home/programs', { programs });
} catch (err){
   return res.status(500).render('error/error', {message: 'Server error' });
}
}

const getAdminPrograms = async (req, res) => {
  try {
  const programs = await Program.find().sort({ postedOn: -1 });
  res.render('Management/programs', { programs });
}catch (err) {
   return res.status(500).render('error/error', {message: 'Server error' });
}
}

const createPrograms = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(500).render('error/error', {message: 'Server error' });
  }

  const { description } = req.body;
  const file = req.file ? req.file.filename : '';

  const newProgram = new Program({ description, file });
  await newProgram.save();
  res.redirect('/Staff/Management/programs');
};

const deletePrograms = async (req, res) => {
  try {
  const program = await Program.findById(req.params.id);
  if (program.file) {
    fs.unlink(path.join(__dirname, '../uploads/programs/', program.file), () => {});
  }
  await Program.findByIdAndDelete(req.params.id);
  res.redirect('/Staff/Management/programs');
} catch (error) {
  return res.status(500).render('error/error', {message: 'Server error' });
} 

}

const getEvents = async (req, res) => {
  try {
  const events = await Event.find().sort({ postedOn: -1 });
  res.render('Home/events', { events });
} catch (error) {
  return res.status(500).render('error/error', {message: 'Server error' });
} 
}

const getAdminEvents = async (req, res) => {
  try {
  const events = await Event.find().sort({ postedOn: -1 });
  res.render('Management/events', { events });
} catch (error) {
  return res.status(500).render('error/error', {message: 'Server error' });
}
}

const createEvents = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
     return res.status(500).render('error/error', {message: 'Server error' });
  }

  const { description } = req.body;
  const file = req.file ? req.file.filename : '';

  const newEvent = new Event({ description, file });
  await newEvent.save();
  res.redirect('/Staff/Management/events');
};

const deleteEvents = async (req, res) => {
  try{
  const event = await Event.findById(req.params.id);
  if (event.file) {
    fs.unlink(path.join(__dirname, '../uploads/events/', event.file), () => {});
  }
  await Notice.findByIdAndDelete(req.params.id);
  res.redirect('/Staff/Management/events');
} catch (err){
   return res.status(500).render('error/error', {message: 'Server error' });
}
}


const getStudentSchedules = async (req, res) => {
  try {
    const userClass = req.user?.classAssigned; // Assumes middleware sets req.user
    const schedules = await ClassSchedule.find({ classAssigned: userClass });
    res.render('schedules/studentView', { schedules, userClass });
  } catch (err) {
     return res.status(500).render('error/error', {message: 'Server error' });
  }
};

// View for management
const getManagementSchedules = async (req, res) => {
  try {
    const schedules = await ClassSchedule.find().sort({ uploadedAt: -1 });
    res.render('Management/schedules', { schedules });
  } catch (err) {
     return res.status(500).render('error/error', {message: 'Server error' });
  }
};

// Upload
const uploadSchedule = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty() || !req.file) {
     return res.status(400).render('error/error', {message: 'Invalid input or missing file' });
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
     return res.status(500).render('error/error', {message: 'Server error' });
  }
};

// Delete
const deleteSchedule = async (req, res) => {
  try {
    const schedule = await ClassSchedule.findById(req.params.id);
    
    if (!schedule) {
      console.error('Schedule not found');
      return res.status(404).render('error/error', {message: 'Schedule not found' });
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
    return res.status(500).render('error/error', {message: 'Server error' });
  }
};

// Create Admin
const createAdmin = async (req, res) => {
  try {
    const newAdmin = new Admin(req.body);
    await newAdmin.save();
    res.status(201).json({ message: 'Admin registered successfully.' });
  } catch (err) {
    console.error(err);
    const message = err.code === 11000
      ? 'Admin ID or email already exists.'
      : err.message;
    return res.status(400).render('error/error', {message: 'Admin already exists' });
  }
};

// Get All Admins
const showAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select('-password');
    res.status(200).render('Admin/admins', {
      title: 'Admins',
      admins, // pass list of admins to EJS
    });
  } catch (err) {
    console.error('Error fetching admins:', err);
    res.status(500).render('error/error', {
      message: 'Failed to fetch admins',
    });
  }
};

// Update Admin by ID
const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedAdmin = await Admin.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedAdmin) {
      return res.status(404).render('error/error', {message: 'Admin not found' });
    }

    res.status(200).json({ message: 'Admin updated successfully', admin: updatedAdmin });
  } catch (err) {
    console.error(err);
     return res.status(400).render('error/error', {message: 'Server error'});
  }
};

// Delete Admin by ID
const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAdmin = await Admin.findByIdAndDelete(id);

    if (!deletedAdmin) {
       return res.status(404).render('error/error', {message: 'Admin not found' });
    }

    res.status(200).json({ message: 'Admin deleted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).render('error/error', {message: 'Failed to delete admin' });
  }
};

const getAdminProfile = async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).render('error/error', {message: 'Unauthorized: Token missing' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded._id).select('-password'); // exclude password for security

    if (!admin) return res.status(404).render('error/error', {message: 'Admin not found' });

    res.render('admin/profile', { admin });
  } catch (err) {
    console.error('Error in getAdminProfile:', err);
    // res.status(500).send('Internal Server Error');
    return res.status(500).render('error/error', {message: 'Server error' });
  }
};

const updateAdminProfile = async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).render('error/error', {message: 'Unauthorized: Token missing' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { name, email, phone } = req.body;

    const updatedAdmin = await Admin.findByIdAndUpdate(
      decoded._id,
      {
        $set: {
          name: name?.trim(),
          email: email?.trim().toLowerCase(),
          phone: phone?.trim()
        }
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedAdmin) return res.status(404).send('Admin not found');

    res.status(200).send('Profile updated successfully');
  } catch (err) {
    console.error('Error in updateAdminProfile:', err);
    // res.status(500).send('Failed to update profile');
    return res.status(500).render('error/error', {message: 'Failed to update profile' });
  }
};

const getAdminById = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await Admin.findById(id).select('-password'); // exclude password

    if (!admin) {
      // return res.status(404).json({ error: 'Admin not found' });
      return res.status(404).render('error/error', {message: 'Admin not found' });
    }

    res.status(200).json({ admin });
  } catch (err) {
    console.error('Error fetching admin:', err);
    // res.status(500).json({ error: 'Server error' });
    return res.status(500).render('error/error', {message: 'Server error' });
  }
};

const getAllStaffs = async (req, res) => {
  try {
    const staffs = await Staff.find().sort({ createdAt: -1 }).lean();
    res.render('Admin/staffs', { staffs });
  } catch (err) {
     return res.status(500).render('error/error', {message: 'Failed to fetch staffs' });
  }
};

// GET controller to render edit page
const getEditStaff = async (req, res) => {
  try {
    const staffId = req.params.id;
    const staff = await Staff.findById(staffId).lean();

    if (!staff) {
      return res.status(404).render('error/error', { message: 'Staff not found.' });
    }

    res.render('Admin/editStaff', { staff }); // Path should match your EJS folder structure
  } catch (err) {
    console.error('GET Edit Staff Error:', err);
    return res.status(500).render('error/error', {message: 'Failed to fetch staff' });
  }
};

// POST controller to update staff
const updateStaff = async (req, res) => {
  try {
    const staffId = req.params.id;
    const {
      name,
      email,
      phone,
      department,
      isAuthorized,
      salary,
      qualifications,
      subjects,
      designation,
      classAssigned,
      joiningDate,
      employmentType,
      skills,
      certifications,
      achievements,
      booksPublished,
      presentAddress,
      contactInfo,
      researchPapers,
      researchScholars,
      researchProjectsCompleted,
      ongoingProjects,
      academicDetails,
      awardsReceived,
    } = req.body;

    const updatedStaff = {
      name: name?.trim(),
      email: email?.trim(),
      phone: phone?.trim(),
      department,
      isAuthorized: isAuthorized === 'true',
      salary: parseFloat(salary) || 0,
      qualifications: Array.isArray(qualifications) ? qualifications.map(q => q.trim()) : [],
      subjects: Array.isArray(subjects) ? subjects.map(s => s.trim()) : [],
      designation: designation?.trim() || '',
      classAssigned: Array.isArray(classAssigned) ? classAssigned.map(c => c.trim()) : [],
      joiningDate: joiningDate ? new Date(joiningDate) : null,
      employmentType,
      skills: Array.isArray(skills) ? skills.map(s => s.trim()) : [],
      certifications: Array.isArray(certifications) ? certifications.map(c => c.trim()) : [],
      achievements: Array.isArray(achievements) ? achievements.map(a => a.trim()) : [],
      researchProjectsCompleted: Array.isArray(researchProjectsCompleted) ? researchProjectsCompleted.map(r => r.trim()) : [],
      ongoingProjects: Array.isArray(ongoingProjects) ? ongoingProjects.map(p => p.trim()) : [],
      awardsReceived: Array.isArray(awardsReceived) ? awardsReceived.map(a => a.trim()) : [],
      booksPublished: parseInt(booksPublished) || 0,
      researchPapers: {
        published: parseInt(researchPapers?.published) || 0,
        communicated: parseInt(researchPapers?.communicated) || 0,
      },
      presentAddress: presentAddress?.trim() || '',
      contactInfo: {
        altPhone: contactInfo?.altPhone?.trim() || '',
        emailAlt: contactInfo?.emailAlt?.trim().toLowerCase() || '',
      },
      academicDetails: Array.isArray(academicDetails)
        ? academicDetails.map(detail => ({
            examination: detail.examination?.trim() || '',
            boardOrUniversity: detail.boardOrUniversity?.trim() || '',
            yearOfPassing: parseInt(detail.yearOfPassing) || null,
            divisionOrGrade: detail.divisionOrGrade?.trim() || '',
          }))
        : [],
      researchScholars: {
        completedPhD: parseInt(researchScholars?.completedPhD) || 0,
        continuingPhD: parseInt(researchScholars?.continuingPhD) || 0,
        completedMPhil: parseInt(researchScholars?.completedMPhil) || 0,
        continuingMPhil: parseInt(researchScholars?.continuingMPhil) || 0,
      },
    };

    const result = await Staff.findByIdAndUpdate(staffId, updatedStaff, { new: true });

    if (!result) {
      return res.status(404).render('error/error', { message: 'Staff not found' });
    }

    res.status(200).json({ message: 'Staff updated successfully.' });

  } catch (err) {
    console.error('PUT Update Staff Error:', err);
    return res.status(500).render('error/error', { message: 'Failed to update staff' });
  }
};


// DELETE controller
const deleteStaff = async (req, res) => {
  try {
    const staffId = req.params.id;
    const deleted = await Staff.findByIdAndDelete(staffId);

    if (!deleted) {
      return res.status(404).render('error/error', {message: 'Staff not found' });
    }

    res.status(200).json({ message: 'Staff deleted successfully.' });
  } catch (err) {
    console.error('DELETE Staff Error:', err);
     return res.status(500).render('error/error', {message: 'Failed to delete staff' });
  }
};

const renderAssignPermissionsPage = async (req, res) => {
  try {
    const { staffId } = req.params;

    // Fetch existing permissions for this staff (if any)
    const accessDoc = await StaffAccess.findOne({ staffId }).lean();

    // If no document found, fallback to empty permissions array
    const permissions = accessDoc ? accessDoc.permissions : [];

    res.render('Admin/assignPermissions', {
      staffId,
      permissions
    });
  } catch (err) {
    console.error(err);
    return res.status(500).render('error/error', {
      message: 'Failed to load permissions for staff.'
    });
  }
};

const assignOrUpdatePermissions = async (req, res) => {
  try {
    const { staffId, permissions } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(staffId)) {
      return res.status(400).render('error/error', { message: 'Invalid staff ID.' });
    }

    // Ensure staff exists
    const staffExists = await Staff.findById(staffId);
    if (!staffExists) {
      return res.status(404).render('error/error', { message: 'Staff not found.' });
    }

    // Normalize and sanitize permissions
    const cleanedPermissions = Array.isArray(permissions)
      ? permissions.map(p => p.trim())
      : [];

    // Check if access entry exists
    const existingAccess = await StaffAccess.findOne({ staffId });

    if (existingAccess) {
      // Update only the permissions
      existingAccess.permissions = cleanedPermissions;
      existingAccess.assignedAt = new Date();
      await existingAccess.save();
    } else {
      // Create new access document
      const newAccess = new StaffAccess({
        staffId,
        permissions: cleanedPermissions,
        assignedBy: req.user?.id || null, // Only if available from auth
      });
      await newAccess.save();
    }

    return res.status(200).json({ success: true, message: 'Permissions saved successfully.' });
  } catch (error) {
    console.error('Error assigning permissions:', error);
    return res.status(500).render('error/error', { message: 'Server error' });
  }
};

module.exports = {
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
  createAdmin,
  showAllAdmins,
  updateAdmin,
  deleteAdmin,
  getAdminProfile,
  updateAdminProfile,
  getAdminById,
  getAllStaffs,
  getEditStaff,
  updateStaff,
  deleteStaff,
  renderAssignPermissionsPage,
  assignOrUpdatePermissions,
};