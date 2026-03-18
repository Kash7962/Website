const express = require('express');
const router = express.Router();
const { saveFace, matchFace, renderFaceRegister, renderAttendancePage } = require('../controllers/faceController');
const { staffFaceValidator } = require('../validators/schema');
const { verifyCookieToken } = require('../middlewares/middleware');
// API routes
router.post('/save-face', verifyCookieToken, staffFaceValidator, saveFace);

router.post('/match-face', verifyCookieToken, matchFace);

router.get('/register', verifyCookieToken, renderFaceRegister);

router.get("/faceattendance", verifyCookieToken, renderAttendancePage);

module.exports = router;
