// routes/curriculumRoutes.js
const express = require('express');
const router = express.Router();

const controller = require('../Controllers/LessonPlanController');
const {
  createCurriculumValidator,
  updatePrincipalReviewValidator,
  updateTeacherProgressValidator
} = require('../validators/schema');
const { verifyCookieToken } = require('../middlewares/middleware');

/* =====================================================
   RENDER ROUTES (EJS Pages)
   ===================================================== */

// Principal curriculum manager page
router.get(
  '/principal',
  verifyCookieToken,
  controller.renderPrincipalPage
);

// Teacher progress page
router.get(
  '/teacher',
  verifyCookieToken,
  controller.renderTeacherPage
);

/* =====================================================
   API ROUTES (Fetch from EJS pages)
   ===================================================== */

// Create a curriculum row (Principal / Admin)
router.post(
  '/create',
  verifyCookieToken,
  createCurriculumValidator,
  controller.createCurriculumItem
);

// Get all rows for a subject + specific teacher
router.get(
  '/subject/:subject/teacher/:teacherId',
  verifyCookieToken,
  controller.getCurriculumBySubjectAndTeacher
);

// Teacher updates progress
router.put(
  '/:id/progress',
  verifyCookieToken,
  updateTeacherProgressValidator,
  controller.updateTeacherProgress
);

// Principal reviews a row
router.put(
  '/:id/review',
  verifyCookieToken,
  updatePrincipalReviewValidator,
  controller.updatePrincipalReview
);

// Principal can delete a row
router.delete(
  '/:id',
  verifyCookieToken,
  controller.deleteCurriculumItem
);

module.exports = router;
