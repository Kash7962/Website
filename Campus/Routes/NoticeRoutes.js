const express = require('express');
const router = express.Router();
const { getNotices, getEvents, getPrograms } = require('../Controllers/ManagementController');

// Public route
router.get('/getNotices', getNotices);

router.get('/getEvents', getEvents);

router.get('/getPrograms', getPrograms);

module.exports = router;