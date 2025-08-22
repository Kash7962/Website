// controllers/resultController.js
const mongoose = require('mongoose');
const Result = require('../models/result');
const { Student } = require('../models/student');
const {Staff} = require('../models/staff');
const ActivityLog = require('../models/activityLog');

const EXAM_TYPES = [
  'Monthly Achievement Test (MAT)',
  'Cumulative Achievement Test (CAT)',
  'Test Examination',
  'Practice Test Series (PTS)',
  'Very Similar Test (VST)',
  'Annual Examination'
];

const DEFAULT_SUBJECTS = [
  'MIL English',
  'MIL Odiya',
  'Maths',
  'Physics',
  'Chemistry',
  'Botany',
  'Zoology',
  'IT'
];

/**
 * Normalize incoming subject data from the form
 */
function parseSubjects(raw) {
  let arr = [];

  try {
    if (!raw) return [];
    if (typeof raw === 'string') {
      raw = raw.trim();
      arr = raw ? JSON.parse(raw) : [];
    } else if (Array.isArray(raw)) {
      arr = raw;
    } else {
      arr = [raw];
    }
  } catch (e) {
    arr = [];
  }

  return arr
    .map(s => {
      const name = (s.name ?? '').toString().trim();
      const theoryMarks = Number(s.theoryMarks || 0);
      const theoryMaxMarks = Number(s.theoryMaxMarks || 0);
      const theoryPercentage =
        theoryMaxMarks > 0
          ? Number(((theoryMarks / theoryMaxMarks) * 100).toFixed(2))
          : undefined;

      const hasLab =
        s.hasLab === true ||
        s.hasLab === 'true' ||
        s.hasLab === 'on' ||
        s.hasLab === 1 ||
        s.hasLab === '1';

      const labMarks = hasLab ? Number(s.labMarks || 0) : undefined;
      const labMaxMarks = hasLab ? Number(s.labMaxMarks || 0) : undefined;
      const labPercentage =
        hasLab && labMaxMarks > 0
          ? Number(((labMarks / labMaxMarks) * 100).toFixed(2))
          : undefined;

      // Lab grades removed — only marks and percentage now
      return {
        name,
        theoryMarks,
        theoryMaxMarks: theoryMaxMarks || undefined,
        theoryPercentage,
        hasLab,
        labMarks,
        labMaxMarks: labMaxMarks || undefined,
        labPercentage
      };
    })
    .filter(s => s.name);
}

/**
 * Compute total theory/lab marks and percentage
 */
function computeTotals(subjects) {
  let totalTheoryMarks = 0;
  let totalTheoryMaxMarks = 0;
  let totalLabMarks = 0;
  let totalLabMaxMarks = 0;

  subjects.forEach(s => {
    if (typeof s.theoryMarks === 'number') totalTheoryMarks += s.theoryMarks || 0;
    if (typeof s.theoryMaxMarks === 'number') totalTheoryMaxMarks += s.theoryMaxMarks || 0;

    if (s.hasLab) {
      if (typeof s.labMarks === 'number') totalLabMarks += s.labMarks || 0;
      if (typeof s.labMaxMarks === 'number') totalLabMaxMarks += s.labMaxMarks || 0;
    }
  });

  const overallObtained = totalTheoryMarks + totalLabMarks;
  const overallMax = totalTheoryMaxMarks + totalLabMaxMarks;
  const totalPercentage =
    overallMax > 0 ? Number(((overallObtained / overallMax) * 100).toFixed(2)) : undefined;

  return {
    totalTheoryMarks: totalTheoryMarks || undefined,
    totalTheoryMaxMarks: totalTheoryMaxMarks || undefined,
    totalLabMarks: totalLabMarks || undefined,
    totalLabMaxMarks: totalLabMaxMarks || undefined,
    totalPercentage
  };
}

exports.renderResultsPage = async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).render('error/error', { message: 'Invalid student ID' });
    }

    const student = await Student.findById(studentId).lean();
    if (!student) {
      return res.status(404).render('error/error', { message: 'Student not found' });
    }

    const results = await Result.find({ student: studentId }).sort({ dateRecorded: -1 }).lean();

    res.render('Staff/manageResults', {
      student,
      results,
      defaultSubjects: DEFAULT_SUBJECTS,
      examTypes: EXAM_TYPES,
      nonceAttr: res.locals.nonceAttr
    });
  } catch (err) {
    console.error('Error rendering results page:', err);
    res.status(500).render('error/error', { message: 'Server error' });
  }
};

exports.addResult = async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).render('error/error', { message: 'Invalid student ID' });
    }

    const { examType, year, month, subjects: rawSubjects, sgpa, cgpa } = req.body;

    if (!EXAM_TYPES.includes(examType)) {
      return res.status(400).render('error/error', { message: 'Invalid exam type' });
    }

    const parsedSubjects = parseSubjects(rawSubjects);
    const totals = computeTotals(parsedSubjects);

    const newResult = await Result.create({
      student: studentId,
      examType,
      year: Number(year),
      month: (month || '').toString().trim(),
      subjects: parsedSubjects,
      ...totals,
      sgpa: sgpa ? Number(sgpa) : undefined,
      cgpa: cgpa ? Number(cgpa) : undefined
    });
    const student = await Student.findById(studentId);
    const user = await Staff.findById(req.user._id);
        await ActivityLog.create({
          userId : user._id,
          userModel: 'Staff',
          name: user.name,
          email: user.email,
          action: `Result added ${examType} - ${year} ${month}`,
          targetModel: 'Student',
          targetId: student._id,
          targetname: `${student.firstName} ${student.middleName} ${student.lastName}`,
          targetEmail: student.studentEmail,
          registrationNumber: student.registration_number,
          classAssigned: student.classAssigned
        });
    res.json({ type: 'success', message: 'Result added', resultId: newResult._id });
  } catch (err) {
    console.error('Error adding result:', err);
    res.status(500).render('error/error', { message: 'Server error' });
  }
};

exports.editResult = async (req, res) => {
  try {
    const { studentId, resultId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(studentId) || !mongoose.Types.ObjectId.isValid(resultId)) {
      return res.status(400).render('error/error', { message: 'Invalid student ID or result ID' });
    }

    const { examType, year, month, subjects: rawSubjects, sgpa, cgpa } = req.body;

    if (!EXAM_TYPES.includes(examType)) {
      return res.status(400).render('error/error', { message: 'Invalid exam type' });
    }

    const parsedSubjects = parseSubjects(rawSubjects);
    const totals = computeTotals(parsedSubjects);

    await Result.findOneAndUpdate(
      { _id: resultId, student: studentId },
      {
        examType,
        year: Number(year),
        month: (month || '').toString().trim(),
        subjects: parsedSubjects,
        ...totals,
        sgpa: sgpa ? Number(sgpa) : undefined,
        cgpa: cgpa ? Number(cgpa) : undefined
      },
      { new: true }
    );
    const student = await Student.findById(studentId);
    const user = await Staff.findById(req.user._id);
        await ActivityLog.create({
          userId : user._id,
          userModel: 'Staff',
          name: user.name,
          email: user.email,
          action: `Result edited ${examType} - ${year} ${month}`,
          targetModel: 'Student',
          targetId: student._id,
          targetname: `${student.firstName} ${student.middleName} ${student.lastName}`,
          targetEmail: student.studentEmail,
          registrationNumber: student.registration_number,
          classAssigned: student.classAssigned
        });
    res.json({ type: 'success', message: 'Result updated' });
  } catch (err) {
    console.error('Error editing result:', err);
    res.status(500).render('error/error', { message: 'Server error' });
  }
};

exports.deleteResult = async (req, res) => {
  try {
    const { studentId, resultId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(studentId) || !mongoose.Types.ObjectId.isValid(resultId)) {
      return res.status(400).render('error/error', { message: 'Invalid student ID or result ID' });
    }
    const result = await Result.findById(resultId);
    await Result.findOneAndDelete({ _id: resultId, student: studentId });
    const student = await Student.findById(studentId);
    const user = await Staff.findById(req.user._id);
        await ActivityLog.create({
          userId : user._id,
          userModel: 'Staff',
          name: user.name,
          email: user.email,
          action: `Result deleted: ${result.examType} - ${result.year} ${result.month}`,
          targetModel: 'Student',
          targetId: student._id,
          targetname: `${student.firstName} ${student.middleName} ${student.lastName}`,
          targetEmail: student.studentEmail,
          registrationNumber: student.registration_number,
          classAssigned: student.classAssigned
        });
    res.json({ type: 'success', message: 'Result deleted' });
  } catch (err) {
    console.error('Error deleting result:', err);
    res.status(500).render('error/error', { message: 'Server error' });
  }
};
