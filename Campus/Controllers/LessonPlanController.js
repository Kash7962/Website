// Controllers/LessonPlanController.js
const { CurriculumItem } = require('../models/lessonPlan');
const {Staff} = require('../models/staff'); // Teachers live here

/* =====================================================
   Create Curriculum Item
   ===================================================== */
async function createCurriculumItem(req, res) {
  try {
    const teacherId = req.body.teacher; // comes from <select> in EJS

    const payload = {
      subject: req.body.subject?.trim(),
      unit: req.body.unit?.trim(),
      chapter: req.body.chapter?.trim(),
      topic: req.body.topic?.trim(),
      subtopic: req.body.subtopic?.trim(),
      numberOfDays: Number(req.body.numberOfDays) || 1,
      createdBy: req.user?.id,

      teacherProgress: [{
        teacher: teacherId,
        percentComplete: 0,
        completed: false,
        notes: '',
        updatedBy: req.user?.id
      }]
    };

    const doc = new CurriculumItem(payload);
    await doc.save();

    return res.status(201).json({ success: true, item: doc });
  } catch (err) {
    console.error('createCurriculumItem:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

/* =====================================================
   Get Curriculum Items (by subject + teacher)
   ===================================================== */
async function getCurriculumBySubjectAndTeacher(req, res) {
  try {
    const { subject, teacherId } = req.params;

    const items = await CurriculumItem.find({
      subject,
      'teacherProgress.teacher': teacherId
    })
      .populate('teacherProgress.teacher', 'name')
      .lean();

    return res.json({ success: true, items });
  } catch (err) {
    console.error('getCurriculumBySubjectAndTeacher:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

/* =====================================================
   Update Teacher Progress
   ===================================================== */
async function updateTeacherProgress(req, res) {
  try {
    const { id } = req.params;
    const { percentComplete, completed, notes } = req.body;
    const teacherId = req.user?._id;
    // console.log('Updating progress for item:', id, 'by teacher:', teacherId);
    const item = await CurriculumItem.findOneAndUpdate(
      { _id: id, 'teacherProgress.teacher': teacherId },
      {
        $set: {
          'teacherProgress.$.percentComplete': percentComplete,
          'teacherProgress.$.completed': completed,
          'teacherProgress.$.notes': notes,
          'teacherProgress.$.updatedAt': new Date(),
          'teacherProgress.$.updatedBy': teacherId
        }
      },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ error: 'Item not found or teacher not assigned' });
    }

    return res.json({ success: true, item });
  } catch (err) {
    console.error('updateTeacherProgress:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

/* =====================================================
   Update Principal Review
   ===================================================== */
async function updatePrincipalReview(req, res) {
  try {
    const { id } = req.params;
    const { approved, comment } = req.body;

    const item = await CurriculumItem.findByIdAndUpdate(
      id,
      {
        $set: {
          'principalReview.approved': approved,
          'principalReview.comment': comment?.trim(),
          'principalReview.reviewedAt': new Date(),
          'principalReview.reviewedBy': req.user?.id
        }
      },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    return res.json({ success: true, item });
  } catch (err) {
    console.error('updatePrincipalReview:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

/* =====================================================
   Delete Curriculum Item
   ===================================================== */
async function deleteCurriculumItem(req, res) {
  try {
    const { id } = req.params;
    const deleted = await CurriculumItem.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Item not found' });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('deleteCurriculumItem:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

/* =====================================================
   RENDER FUNCTIONS (EJS Pages)
   ===================================================== */

// Principal page: shows curriculum + dropdown of all academic teachers
async function renderPrincipalPage(req, res) {
  try {
    const { subject } = req.params;
    const query = subject ? { subject } : {};

    const items = await CurriculumItem.find(query)
      .populate('teacherProgress.teacher', 'name')
      .lean();

    const teachers = await Staff.find({ department: 'Academic' })
      .select('name _id')
      .lean();

    return res.render('Staff/principal_curriculum', {
      user: req.user,
      pageTitle: 'Curriculum Manager - Principal',
      subject: subject || null,
      items,
      teachers // 👈 so you can loop in EJS for dropdown/select
    });
  } catch (err) {
    console.error('renderPrincipalPage:', err);
    return res.status(500).render('error/error', { message: 'Server error' });
  }
}

// Teacher page: scoped to logged-in teacher
async function renderTeacherPage(req, res) {
  try {
    const teacherId = req.user?._id;
    const { subject } = req.params;

    const query = { 'teacherProgress.teacher': teacherId };
    if (subject) query.subject = subject;

    const items = await CurriculumItem.find(query)
      .populate('teacherProgress.teacher', 'name department')
      .lean();

    return res.render('Staff/teacher_progress', {
      user: req.user,
      pageTitle: 'Curriculum Progress - Teacher',
      subject: subject || null,
      items,
      teacherId // inject for frontend use
    });
  } catch (err) {
    console.error('renderTeacherPage:', err);
    return res.status(500).render('error/error', { message: 'Server error' });
  }
}

module.exports = {
  createCurriculumItem,
  getCurriculumBySubjectAndTeacher,
  updateTeacherProgress,
  updatePrincipalReview,
  deleteCurriculumItem,
  renderPrincipalPage,
  renderTeacherPage
};
