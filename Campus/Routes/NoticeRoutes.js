const express = require('express');
const router = express.Router();
const { getNotices, getEvents, getPrograms } = require('../controllers/adminController');

// Public route
router.get('/getnotices', getNotices);

router.get('/getevents', getEvents);

router.get('/getprograms', getPrograms);

module.exports = router;