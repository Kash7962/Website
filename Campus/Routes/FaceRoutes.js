const express = require('express');
const router = express.Router();
const { saveFace, matchFace, renderFaceRegister, renderAttendancePage } = require('../Controllers/FaceController');
const { staffFaceValidator } = require('../validators/schema');
const { verifyCookieToken } = require('../middlewares/middleware');
// API routes
router.post('/save-face', verifyCookieToken, staffFaceValidator, saveFace);

router.post('/match-face', verifyCookieToken, matchFace);

router.get('/register', verifyCookieToken, renderFaceRegister);

router.get("/faceAttendance", verifyCookieToken, renderAttendancePage);

module.exports = router;
