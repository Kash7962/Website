const express = require('express');
const router = express.Router();
const AcademicController = require('../controllers/academicController.js');

router.get('/achievements', AcademicController.achievements);
router.get('/campuslife', AcademicController.campusLife);
router.get('/convocation', AcademicController.convocation);
router.get('/courses', AcademicController.courses);
router.get('/examination', AcademicController.examination);
router.get('/facilities', AcademicController.facilities);
    
module.exports = router;