const express = require('express');
const router = express.Router();
const AcademicController = require('../Controllers/AcademicController.js');

router.get('/Achievements', AcademicController.achievements);
router.get('/CampusLife', AcademicController.campusLife);
router.get('/Convocation', AcademicController.convocation);
router.get('/Courses', AcademicController.courses);
router.get('/Examination', AcademicController.examination);
router.get('/Facilities', AcademicController.facilities);
    
module.exports = router;