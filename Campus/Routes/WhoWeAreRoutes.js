const express = require('express');
const router = express.Router();
const WhoWeAreController = require('../Controllers/WhoWeAreController.js');

router.get('/AboutKASH_Logo', WhoWeAreController.about_KASH_Logo);
router.get('/AboutSOLID_KASH', WhoWeAreController.about_SOLID_KASH);
router.get('/AboutUs', WhoWeAreController.about_us);
router.get('/Faculty', WhoWeAreController.faculty);
router.get('/Government', WhoWeAreController.government);
router.get('/KASH_Executive', WhoWeAreController.KASH_Executive);
router.get('/PrincipalsDesk', WhoWeAreController.principals_desk);
router.get('/Vision_Mission', WhoWeAreController.vision_mission);
router.get('/about-campus', WhoWeAreController.aboutCampus);
    
module.exports = router;