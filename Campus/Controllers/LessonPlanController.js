// Controllers/LessonPlanController.js
const { CurriculumItem } = require('../models/lessonPlan');
const {Staff} = require('../models/staff'); // Teachers live here
const ActivityLog = require('../models/activityLog');
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
    const teacher = await Staff.findById(teacherId);
    const user = await Staff.findById(req.user._id);
                await ActivityLog.create({
                  userId : user._id,
                  userModel: 'Staff',
                  name: user.name,
                  email: user.email,
                  action: `Created new curriculum item — Subject: ${doc.subject}, Unit: ${doc.unit}, Chapter: ${doc.chapter}, Topic: ${doc.topic}, Subtopic: ${doc.subtopic}, Number of Days: ${doc.numberOfDays}, Assigned Teacher: ${teacher?.name || 'N/A'}`,
                  // targetModel: 'Student',
                  // targetId: student._id,
                  // targetname: `${student.firstName} ${student.middleName} ${student.lastName}`,
                  // targetEmail: student.studentEmail,
                  // registrationNumber: student.registration_number,
                  // classAssigned: student.classAssigned
                });
    return res.status(201).json({ success: true, item: doc });
  } catch (err) {
    console.error('createCurriculumItem:', err);
    return res.status(500).render('error/error', { message: 'Server error' });
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
    return res.status(500).render('error/error', { message: 'Server error' });
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
      return res.status(404).render('error/error', { message: 'Item not found or teacher not assigned' });
    }
     const user = await Staff.findById(req.user._id);
                await ActivityLog.create({
                  userId : user._id,
                  userModel: 'Staff',
                  name: user.name,
                  email: user.email,
                  action: `Teacher updated progress — Subject: ${item.subject}, Unit: ${item.unit}, Chapter: ${item.chapter}, Topic: ${item.topic}, Subtopic: ${item.subtopic}, Progress: ${percentComplete}%, Completed: ${completed ? 'Yes' : 'No'}, Notes: "${notes?.trim() || 'No notes'}"`

                  // targetModel: 'Student',
                  // targetId: student._id,
                  // targetname: `${student.firstName} ${student.middleName} ${student.lastName}`,
                  // targetEmail: student.studentEmail,
                  // registrationNumber: student.registration_number,
                  // classAssigned: student.classAssigned
                });
    return res.json({ success: true, item });
  } catch (err) {
    console.error('updateTeacherProgress:', err);
    return res.status(500).render('error/error', { message: 'Server error' });
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
      return res.status(404).render('error/error',{ message: 'Item not found' });
    }
     const user = await Staff.findById(req.user._id);
                await ActivityLog.create({
                  userId : user._id,
                  userModel: 'Staff',
                  name: user.name,
                  email: user.email,
                  action: `Principal ${approved ? 'approved' : 'rejected'} curriculum item — Subject: ${item.subject}, Unit: ${item.unit}, Chapter: ${item.chapter}, Topic: ${item.topic}, Subtopic: ${item.subtopic}, Comment: "${comment?.trim() || 'No comment'}"`
                  // targetModel: 'Student',
                  // targetId: student._id,
                  // targetname: `${student.firstName} ${student.middleName} ${student.lastName}`,
                  // targetEmail: student.studentEmail,
                  // registrationNumber: student.registration_number,
                  // classAssigned: student.classAssigned
                });
    return res.json({ success: true, item });
  } catch (err) {
    console.error('updatePrincipalReview:', err);
    return res.status(500).render('error/error', { message: 'Server error' });
  }
}

/* =====================================================
   Delete Curriculum Item
   ===================================================== */
async function deleteCurriculumItem(req, res) {
  try {
    const { id } = req.params;
    const item = await CurriculumItem.findById(id)
    const deleted = await CurriculumItem.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).render('error/error', { message: 'Item not found' });
    }
     const user = await Staff.findById(req.user._id);
                await ActivityLog.create({
                  userId : user._id,
                  userModel: 'Staff',
                  name: user.name,
                  email: user.email,
                  action: `Curriculum item deleted with subject - ${item.subject}, unit - ${item.unit}, chapter - ${item.chapter}, topic - ${item.topic}, subtopic - ${item.subtopic}`,
                  // targetModel: 'Student',
                  // targetId: student._id,
                  // targetname: `${student.firstName} ${student.middleName} ${student.lastName}`,
                  // targetEmail: student.studentEmail,
                  // registrationNumber: student.registration_number,
                  // classAssigned: student.classAssigned
                });
    return res.json({ success: true });
  } catch (err) {
    console.error('deleteCurriculumItem:', err);
    return res.status(500).render('error/error', { message: 'Server error' });
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

    // base query: only items where this teacher has progress
    const query = { 'teacherProgress.teacher': teacherId };
    if (subject) query.subject = subject;

    let items = await CurriculumItem.find(query)
      .populate('teacherProgress.teacher', 'name department')
      .lean();

    // attach only the current teacher's progress as a flat object
    items = items.map(item => {
      let progressForThisTeacher = {};

      if (Array.isArray(item.teacherProgress)) {
        const progress = item.teacherProgress.find(tp =>
          tp.teacher && tp.teacher._id.toString() === teacherId.toString()
        );
        progressForThisTeacher = progress || {};
      } else if (item.teacherProgress) {
        // in case schema is not an array
        progressForThisTeacher = item.teacherProgress;
      }

      return {
        ...item,
        teacherProgressForThisTeacher: progressForThisTeacher
      };
    });

    return res.render('Staff/teacher_progress', {
      user: req.user,
      pageTitle: 'Curriculum Progress - Teacher',
      subject: subject || null,
      items,
      teacherId
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
