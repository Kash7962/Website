const express = require('express');
const router = express.Router();
const WhoWeAreController = require('../controllers/whoWeAreController.js');

router.get('/aboutKASH_Logo', WhoWeAreController.about_KASH_Logo);
router.get('/aboutSOLID_KASH', WhoWeAreController.about_SOLID_KASH);
router.get('/aboutus', WhoWeAreController.about_us);
router.get('/faculty', WhoWeAreController.faculty);
router.get('/government', WhoWeAreController.government);
router.get('/KASH_Executive', WhoWeAreController.KASH_Executive);
router.get('/principalsdesk', WhoWeAreController.principals_desk);
router.get('/vision_mission', WhoWeAreController.vision_mission);
router.get('/about-campus', WhoWeAreController.aboutCampus);
router.get('/photogallery', WhoWeAreController.PhotoGallery);
    
module.exports = router;