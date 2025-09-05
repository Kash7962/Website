const path = require('path');
const fs = require('fs');
const fsp = require('fs').promises;
const CourseMaterial = require('../models/course');
const Assignment = require('../models/assignment');
const { Student } = require('../models/student');
const { StaffAccess } = require('../models/permissions');
const mongoose = require('mongoose')
const bcryptjs = require('bcryptjs');
// const { body, validationResult } = require('express-validator');
const Document = require('../models/documents')
const {Staff} = require('../models/staff');
const ActivityLog = require('../models/activityLog');
const StaffAttendance = require('../models/staffAttendance');
// const jwt = require('jsonwebtoken');


const uploadCourse = async (req, res) => {
  try {
    const { courseName, userId, name, email } = req.body;

    if (!req.file) return res.status(400).render('error/error', {message: 'File not found'});

    const newMaterial = new CourseMaterial({
      courseName,
      filename: req.file.filename,
      uploadedBy: {
        id: userId,
        name: name,
        email
      }
    });

    await newMaterial.save();
    const user = await Staff.findById(req.user._id);
    await ActivityLog.create({
      userId : user._id,
      userModel: 'Staff',
      name: user.name,
      email: user.email,
      action: `Uploaded course material: ${courseName}`
    });

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
    const user = await Staff.findById(req.user._id);
    await ActivityLog.create({
      userId : user._id,
      userModel: 'Staff',
      name: user.name,
      email: user.email,
      action: `Course material deleted : ${file.courseName}`,
      // targetModel: 'Student',
      // targetId: student._id,
      // targetname: `${student.firstName} ${student.middleName} ${student.lastName}`,
      // targetEmail: student.studentEmail,
      // registrationNumber: student.registration_number,
      // classAssigned: student.classAssigned
    });
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
    const user = await Staff.findById(req.user._id);; // Assumed to be added via auth middleware
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
    // const user = await Staff.findById(req.user._id);
    await ActivityLog.create({
      userId : user._id,
      userModel: 'Staff',
      name: user.name,
      email: user.email,
      action: `Assignment uploaded: ${title}`,
      // targetModel: 'Student',
      // targetId: student._id,
      // targetname: `${student.firstName} ${student.middleName} ${student.lastName}`,
      // targetEmail: student.studentEmail,
      // registrationNumber: student.registration_number,
      // classAssigned: student.classAssigned
    });
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
    const user = await Staff.findById(req.user._id);
    await ActivityLog.create({
      userId : user._id,
      userModel: 'Staff',
      name: user.name,
      email: user.email,
      action: `Assignment deleted : ${assignment.title}`,
      // targetModel: 'Student',
      // targetId: student._id,
      // targetname: `${student.firstName} ${student.middleName} ${student.lastName}`,
      // targetEmail: student.studentEmail,
      // registrationNumber: student.registration_number,
      // classAssigned: student.classAssigned
    });
    res.redirect('/Staff/Teaching/assignments');
    
  } catch (err) {
    return res.status(500).render('error/error', {message: 'Server error'});
  }
};

const getStaffPermissions = async (req, res) => {
  try {
    const { staffId } = req.body;
    if (!staffId) {
      return res.status(400).render('error/error', {message: 'Staff ID not provided'});
    }

    const staffAccess = await StaffAccess.findOne({ staffId }).select('permissions -_id');

    if (!staffAccess) {
      return res.json({ permissions: [] }); // No permissions set yet
    }

    return res.json({ permissions: staffAccess.permissions });
  } catch (err) {
    console.error('Error fetching permissions:', err);
    return res.status(500).render('error/error', {message: 'Server error'});
  }
};

const getPendingEnrollment = async (req, res) => {
  try {
    const students = await Student.find({ isEnrolled: false }).lean();
    res.render('Staff/enroll', { students }); // pendingEnrollment.ejs
  } catch (err) {
    console.error('Error fetching pending students:', err);
    return res.status(500).render('error/error', {message: 'Server error'});
  }
};

const deleteEnrollment = async (req, res) => {
  try {
    const { id } = req.params;

    // --- Validate ID ---
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).render('error/error', { message: 'Invalid ID' });
    }

    // --- Check if student exists ---
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).render('error/error', { message: 'Student not found' });
    }

    // --- Path to student's uploads folder ---
    const studentFolderPath = path.join(__dirname, '..', 'uploads', 'students', String(id));

    // --- Delete student folder if exists ---
    try {
      await fsp.rm(studentFolderPath, { recursive: true, force: true });
      // console.log(`Deleted uploads folder for student ${id}`);
    } catch (fspErr) {
      console.warn(`No uploads folder found for student ${id} or error deleting:`, fspErr.message);
    }

    // --- Delete student from DB ---
    await Student.findByIdAndDelete(id);
    const user = await Staff.findById(req.user._id);
    await ActivityLog.create({
      userId : user._id,
      userModel: 'Staff',
      name: user.name,
      email: user.email,
      action: `Enrollment deleted`,
      targetModel: 'Student',
      targetId: student._id,
      targetname: `${student.firstName} ${student.middleName} ${student.lastName}`,
      targetEmail: student.studentEmail,
      // registrationNumber: student.registration_number,
      // classAssigned: student.classAssigned
    });
    return res.status(200).json({ message: 'Deleted successfully' });

  } catch (err) {
    console.error('Error deleting student:', err);
    return res.status(500).render('error/error', { message: 'Server error' });
  }
};

const getFinalizeForm = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    // console.log(req.params.id);
    if (!student|| student.isEnrolled) {
      return res.status(404).render('error/error', {message: 'Student not found or already enrolled'});
    }

    res.render('Staff/joiningForm', { student });
  } catch (err) {
    console.error(err);
    res.status(500).render('error/error', {message: 'Server error'});
  }
};

const postFinalizeForm = [
  async (req, res) => {
    try {
      const student = await Student.findById(req.params.id);
      if (!student) {
        return res.status(404).render('error/error', { message: 'Student not found or already enrolled' });
      }

      // ---------- helpers ----------
      const toNumber = (v) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : undefined;
      };

      const sanitizeSubjectKey = (s) => {
        if (!s && s !== 0) return '';
        return String(s).trim().replace(/[.\$]/g, '_').slice(0, 100);
      };

      const normalizeMember = (m = {}) => ({
        name: (m.name || '').toString().trim() || undefined,
        age: toNumber(m.age) ?? undefined,
        relation: (m.relation || '').toString().trim() || undefined,
        education: (m.education || '').toString().trim() || undefined,
        otherInfo: (m.otherInfo || '').toString().trim() || undefined,
      });

      const normalizeFamilyMembersInput = (input) => {
        if (!input) return [];
        if (Array.isArray(input)) return input.map(normalizeMember);

        if (typeof input === 'object') {
          const keys = Object.keys(input);
          const numericKeys = keys.every(k => String(Number(k)) === k);
          if (numericKeys) {
            return keys
              .map(k => ({ index: Number(k), value: input[k] }))
              .sort((a, b) => a.index - b.index)
              .map(x => normalizeMember(x.value));
          }
          return [normalizeMember(input)];
        }
        return [];
      };

      // ---------- parse matricMarks ----------
      const matricMarksRaw = req.body.matricMarks || {};
      const matricSubjectsObj = {};

      if (typeof matricMarksRaw === 'object') {
        for (const rawKey of Object.keys(matricMarksRaw)) {
          const cleanedKey = sanitizeSubjectKey(rawKey);
          if (!cleanedKey) continue;

          const rawVal = matricMarksRaw[rawKey];
          const mark = parseFloat(Array.isArray(rawVal) ? rawVal[0] : rawVal);
          matricSubjectsObj[cleanedKey] = Number.isFinite(mark) ? mark : 0;
        }
      }

      let matricTotal = 0;
      let matricPercentage = 0;
      const subjectCount = Object.keys(matricSubjectsObj).length;
      if (subjectCount > 0) {
        matricTotal = Object.values(matricSubjectsObj).reduce((s, v) => s + (Number(v) || 0), 0);
        matricPercentage = Number((matricTotal / subjectCount).toFixed(2));
      } else {
        matricTotal = toNumber(req.body.matricTotal) ?? 0;
        matricPercentage = toNumber(req.body.matricPercentage) ?? 0;
      }

      // ---------- family members ----------
      const familyMembers = normalizeFamilyMembersInput(req.body.familyMembers);

      const parsedMembers = Number(req.body.totalFamilyMembers);
      const totalFamilyMembers = (
        !isNaN(parsedMembers) && req.body.totalFamilyMembers !== '' && req.body.totalFamilyMembers != null
      ) ? parsedMembers : (familyMembers?.length ?? 0);

      // ---------- ensure password ----------
      let hashedPasswordForUpdate;
      if (!student.password) {
        const toHash = (student.studentEmail || req.body.studentEmail || `student-${Date.now()}`);
        hashedPasswordForUpdate = await bcryptjs.hash(toHash, 10);
      }
      let enrolled;
      if(req.body.isEnrolled === 'false'){
        enrolled = false
      }else{
        enrolled = true
      }
      // console.log(req.body.isEnrolled)
      // ---------- prepare updateData ----------
      const updateData = {
        firstName: req.body.firstName?.trim(),
        middleName: req.body.middleName?.trim(),
        lastName: req.body.lastName?.trim(),
        gender: req.body.gender,
        dob: req.body.dob ? new Date(req.body.dob) : student.dob,
        studentEmail: req.body.studentEmail?.trim(),
        studentPhone: req.body.studentPhone?.trim(),
        aadhaarNumber: req.body.aadhaarNumber?.trim(),
        caste: req.body.caste?.trim(),
        subCaste: req.body.subCaste?.trim(),
        religion: req.body.religion?.trim(),
        bloodGroup: req.body.bloodGroup?.trim(),
        hobby: req.body.hobby?.trim(),
        interest: req.body.interest?.trim(), 
        bplAplStatus: req.body.bplAplStatus,

        guardian1Name: req.body.guardian1Name?.trim(),
        guardian1Relation: req.body.guardian1Relation,
        guardian1Phone: req.body.guardian1Phone?.trim(),
        guardian1Email: req.body.guardian1Email?.trim(),
        guardian1Occupation: req.body.guardian1Occupation?.trim(),
        guardian1Income: toNumber(req.body.guardian1Income) ?? undefined,

        guardian2Name: req.body.guardian2Name?.trim(),
        guardian2Relation: req.body.guardian2Relation?.trim(),
        guardian2Occupation: req.body.guardian2Occupation?.trim(),
        guardian2Income: toNumber(req.body.guardian2Income) ?? undefined,

        address1: req.body.address1?.trim(),
        address2: req.body.address2?.trim(),
        city: req.body.city?.trim(),
        block: req.body.block?.trim(),
        district: req.body.district?.trim(),
        state: req.body.state?.trim(),
        zipcode: req.body.zipcode?.trim(),
        country: req.body.country?.trim(),

        registration_number: req.body.registration_number?.trim(),
        enrollmentNumber: req.body.enrollmentNumber?.trim(),
        classAssigned: req.body.classAssigned?.trim(),
        course: req.body.course?.trim(),
        academicYear: req.body.academicYear?.trim(),
        academicSession: req.body.academicSession?.trim(),
        batch: req.body.batch?.trim(),
        joiningDate: req.body.joiningDate ? new Date(req.body.joiningDate) : student.joiningDate,
        currentSemester: req.body.currentSemester?.trim(),
        subjects: req.body.subjects ? req.body.subjects.split(',').map(s => s.trim()).filter(Boolean) : [],
        lastSchoolAttended: req.body.lastSchoolAttended?.trim(),
        matricBoard: req.body.matricBoard?.trim(),
        matricRollNo: req.body.matricRollNo?.trim(),
        matricYear: toNumber(req.body.matricYear),
        matricMarks: {
          subjects: matricSubjectsObj,
          total: matricTotal,
          percentage: matricPercentage
        },

        totalFamilyMembers,
        familyMembers,

        isHostelResident: req.body.isHostelResident === 'true',
        hostelJoiningDate: req.body.hostelJoiningDate ? new Date(req.body.hostelJoiningDate) : student.hostelJoiningDate,
        hostelDurationMonths: toNumber(req.body.hostelDurationMonths) ?? undefined,
        hostelWithinCampus: req.body.hostelWithinCampus === 'true',
        isTransportResident: req.body.isTransportResident === 'true',

        bankAccountNumber: req.body.bankAccountNumber?.trim(),
        ifscCode: req.body.ifscCode?.trim(),
        bankName: req.body.bankName?.trim(),
        bankBranch: req.body.bankBranch?.trim(),
        isAadhaarLinkedToBank: req.body.isAadhaarLinkedToBank === 'true',

        isEnrolled: enrolled,
        // isEnrolled: req.body.isEnrolled === 'true' || true,
        isPromoted: req.body.isPromoted === 'true' || false,
        isAlumni: req.body.isAlumni === 'true' || false, 
        enrollmentDate: new Date(),
        isActive: req.body.isActive === 'true' || false,
        // doc_name: req.body.doc_name?.trim(),
        
      };

      if (!student.password && hashedPasswordForUpdate) {
        updateData.password = hashedPasswordForUpdate;
      }

      // ---------- files ----------
      if (req.files && req.files['profileImage'] && req.files['profileImage'][0]) {
        const f = req.files['profileImage'][0];
        const profilePath = `/uploads/students/${req.params.id}/${f.filename}`;
        updateData.profileImage = profilePath;
      }

      const updatedStudent = await Student.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );

      try {
        if (req.files && req.files['profileImage'] && req.files['profileImage'][0]) {
          const f = req.files['profileImage'][0];
          await Document.create({
            student: req.params.id,
            name: `${req.body.firstName +" "+ req.body.middleName +" "+ req.body.lastName} profile pic`,
            type: f.mimetype === 'application/pdf' ? 'pdf' : 'photo',
            url: `/uploads/students/${req.params.id}/${f.filename}`
          });
        }

        if (req.files && req.files['documents']) {
          for (const f of req.files['documents']) {
            await Document.create({
              student: req.params.id,
              name: req.body.doc_name || f.originalname || f.filename,
              type: f.mimetype === 'application/pdf' ? 'pdf' : 'photo',
              url: `/uploads/students/${req.params.id}/${f.filename}`
            });
          }
        }
      } catch (docErr) {
        console.error('Document save error (student enrolled):', docErr);
      }
     
    // await doc.save();
    const user = await Staff.findById(req.user._id);
    await ActivityLog.create({
      userId : user._id,
      userModel: 'Staff',
      name: user.name,
      email: user.email,
      action: `Enrolled/Edited student`,
      targetModel: 'Student',
      targetId: student._id,
      targetname: `${student.firstName} ${student.middleName} ${student.lastName}`,
      targetEmail: student.studentEmail,
      registrationNumber: student.registration_number,
      classAssigned: student.classAssigned
    });

      return res.status(200).json({ success: true, message: 'Student enrolled successfully', student: updatedStudent });
    } catch (err) {
      console.error(err);
      return res.status(500).render('error/error', { message: 'Server error' });
    }
  }
];



// --- GET form for direct join (fresh join) ---
const getEditForm = async (req, res) => {
  try {
      const student = await Student.findById(req.params.id);
      // console.log(req.params.id);
      if (!student) {
        return res.status(404).render('error/error', {message: 'Student not found'});
      }

    // reuse the same view you use for finalize but no student data
    return res.render('Staff/studentEdit', { student: student });
  } catch (err) {
    console.error('getJoinForm error:', err);
    return res.status(500).render('error/error', { message: 'Server error' });
  }
};

const getStudents = async (req, res) => {
  try {
    const students = await Student.find({ isEnrolled: true }).lean();
    res.render('Staff/students', { students }); 
  } catch (err) {
    console.error('Error fetching students:', err);
    return res.status(500).render('error/error', {message: 'Server error'});
  }
};

const getPaymentPage = async (req, res) => {
  try {
    const students = await Student.find({ isEnrolled: true }).lean();
    res.render('Staff/studentPayment', { students }); 
  } catch (err) {
    console.error('Error fetching pending students:', err);
    return res.status(500).render('error/error', {message: 'Server error'});
  }
};

const getDocument = async (req, res) => {
  try {
    const students = await Student.find({ isEnrolled: true }).lean();
    res.render('Staff/studentDocuments', { students }); 
  } catch (err) {
    console.error('Error fetching pending students:', err);
    return res.status(500).render('error/error', {message: 'Server error'});
  }
};


const getDocumentsByStudent = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const documents = await Document.find({ student: studentId }).sort({ uploadedAt: -1 });
    res.render('Staff/manageDocuments', { studentId, documents });
  } catch (err) {
    console.error(err);
    res.status(500).render('error/error', {message: 'Server error'});
  }
};

// Upload document handler
const uploadDocument = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    if (!req.file) return res.status(400).render('error/error', {message: 'File not found'});

    const { name, type } = req.body;
    if (!name || !type || !['photo', 'pdf'].includes(type)) {
      return res.status(400).render('error/error', {message: 'Invalid file type or name'});
    }

    // Save document record
    const doc = new Document({
      student: studentId,
      name,
      type,
      url: `/uploads/students/${studentId}/${req.file.filename}`,
    });
    const student = await Student.findById(studentId);
    await doc.save();
    const user = await Staff.findById(req.user._id);
    await ActivityLog.create({
      userId : user._id,
      userModel: 'Staff',
      name: user.name,
      email: user.email,
      action: `Uploaded document: ${doc.name}`,
      targetModel: 'Student',
      targetId: studentId,
      targetname: `${student.firstName} ${student.middleName} ${student.lastName}`,
      targetEmail: student.studentEmail,
      registrationNumber: student.registration_number,
      classAssigned: student.classAssigned
    });
    res.status(200).json({ message: 'Document uploaded successfully'});
    // res.redirect(`/Manage/documents/${studentId}`);
  } catch (err) {
    console.error(err);
    res.status(500).render('error/error', {message: 'Server error'});
  }
};

// Delete document handler
const deleteDocument = async (req, res) => {
  try {
    const { studentId, docId } = req.params;
    const student = await Student.findById(studentId);
    const doc = await Document.findById(docId);
    if (!doc) {
      return res.status(404).render('error/error', { message: 'Document not found' });
    }

    // Convert stored URL to actual absolute file path
    let filePath;
    if (doc.url.startsWith('/uploads/')) {
      filePath = path.join(__dirname, '..', doc.url); 
    } else {
      filePath = path.isAbsolute(doc.url)
        ? doc.url
        : path.join(__dirname, '..', doc.url);
    }

    // console.log('Deleting file:', filePath);

    // Delete file if exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      // console.log('File deleted successfully');
    } else {
      console.warn('File not found on disk:', filePath);
    }

    // Remove DB record
    await Document.deleteOne({ _id: docId });
    const user = await Staff.findById(req.user._id);
    await ActivityLog.create({
      userId : user._id,
      userModel: 'Staff',
      name: user.name,
      email: user.email,
      action: `Deleted document: ${doc.name}`,
      targetModel: 'Student',
      targetId: studentId,
      targetname: `${student.firstName} ${student.middleName} ${student.lastName}`,
      targetEmail: student.studentEmail,
      registrationNumber: student.registration_number,
      classAssigned: student.classAssigned
    });
    res.status(200).json({ message: 'Document deleted successfully' });
    // res.redirect(`/Manage/documents/${studentId}`);
  } catch (err) {
    console.error('Error deleting document:', err);
    res.status(500).render('error/error', { message: 'Server error' });
  }
};

const getResult = async (req, res) => {
  try {
    const students = await Student.find({ isEnrolled: true }).lean();
    res.render('Staff/studentResults', { students }); 
  } catch (err) {
    console.error('Error fetching students:', err);
    return res.status(500).render('error/error', {message: 'Server error'});
  }
};

const getStaffList = async (req, res) => {
  try {
    const staffList = await Staff.find().lean();
    res.render('Staff/staffList', { staffList });
  } catch (err) {
    console.error(err);
    res.status(500).render('error/error', { message: 'Failed to load staff list.' });
  }
};

const markAttendance = async (req, res) => {
  try {
    const { staff } = req.body; 
    // method = "FaceSystem" or "Manual"
    if (!staff) {
      return res.status(400).render('error/error' ,{ message: 'Staff ID is required' });
    }

    const today = new Date();
    const todayStart = new Date(today.setHours(0, 0, 0, 0));
    const todayEnd = new Date(today.setHours(23, 59, 59, 999));

    let record = await StaffAttendance.findOne({
      staff: staff,
      date: { $gte: todayStart, $lte: todayEnd }
    });

    if (!record) {
      // First punch → Check-In
      record = new StaffAttendance({
        staff: staff,
        date: todayStart,
        checkInTime: new Date(),
        status: 'Present',
        markedBy: 'FaceSystem'
      });
      await record.save();
      return res.status(201).json({ message: 'Check-in recorded', record });
    } else if (!record.checkOutTime) {
      // Second punch → Check-Out
      record.checkOutTime = new Date();
      await record.save();
      return res.status(200).json({ message: 'Check-out recorded', record });
    } else {
      return res.status(400).render('error/error', { message: 'Attendance already completed for today' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).render('error/error', { message: 'Server Error' });
  }
};

// ===============================
// Mark manual attendance (bypass system)
// ===============================
const manualAttendance = async (req, res) => {
  try {
    const { staffId, date, status, checkInTime } = req.body;

    if (!staffId || !date) {
      return res.status(400).json({ error: 'Staff ID and Date are required' });
    }

    const dayStart = new Date(new Date(date).setHours(0, 0, 0, 0));
    const dayEnd = new Date(new Date(date).setHours(23, 59, 59, 999));

    let record = await StaffAttendance.findOne({
      staff: staffId,
      date: { $gte: dayStart, $lte: dayEnd }
    });

    if (!record) {
      record = new StaffAttendance({
        staff: staffId,
        date: dayStart,
        status: status || 'Present',
        checkInTime: checkInTime ? new Date(checkInTime) : null,
        checkOutTime: checkOutTime ? new Date(checkOutTime) : null,
        markedBy: 'Manual'
      });
    } else {
      // Update existing record manually
      record.status = status || record.status;
      record.checkInTime = checkInTime ? new Date(checkInTime) : record.checkInTime;
      record.checkOutTime = checkOutTime ? new Date(checkOutTime) : record.checkOutTime;
      record.markedBy = 'Manual';
    }

    await record.save();
    res.status(200).json({ message: 'Manual attendance recorded/updated', record });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
};

// ===============================
// Get attendance by staff
// ===============================
const getAttendanceByStaff = async (req, res) => {
  try {
    const { staffId } = req.params;

    if (!staffId || !mongoose.Types.ObjectId.isValid(staffId)) {
      return res.status(400).render('error/error', { message: 'Invalid staff ID' });
    }
    // console.log(staffId)
    // Match all records regardless of time
    const records = await StaffAttendance.find({ staff: staffId }).sort({ date: -1 });

    // console.log('Attendance records:', records);

    res.status(200).json(records);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).render('error/error', { message: 'Server Error' });
  }
};


const renderStaffAttendancePage = (req, res) => {
  try {
    // ✅ No need to pass staffId from backend
    res.render('Staff/attendanceRecords');
  } catch (error) {
    console.error(error);
    res.status(500).render('error/error', { message: 'Failed to load attendance page' });
  }
};

module.exports = {
  uploadCourse, getAllCourses, deleteCourse, getStaffPermissions, getFinalizeForm,
  uploadAssignment, viewAssignments, deleteAssignment, getPendingEnrollment, deleteEnrollment,
   postFinalizeForm, getEditForm, getStudents, getPaymentPage, getDocument, getDocumentsByStudent, 
   uploadDocument, deleteDocument, getResult, getStaffList, markAttendance, manualAttendance,
   getAttendanceByStaff, renderStaffAttendancePage,
}; 
