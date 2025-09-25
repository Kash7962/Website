const express = require('express');
const router = express.Router();
const { uploadProcurement } = require('../config/multer_procurement');
const procurementController = require('../Controllers/ProcurementController');
const { uploadFilePresent } = require('../validators/schema');
const { verifyCookieToken } = require('../middlewares/middleware');

// STAFF routes
router.get('/staff', verifyCookieToken, procurementController.getStaffProcurementPage);
router.post(
  '/upload',
  verifyCookieToken,
  uploadProcurement.single('file'),
  uploadFilePresent,
  procurementController.postUploadProcurement
);

// ADMIN routes
router.get('/admin', verifyCookieToken, procurementController.getAdminProcurementPage);
router.post('/accept', verifyCookieToken, procurementController.postAcceptProcurements);
router.post('/:id/deny', verifyCookieToken, procurementController.postDenyProcurement);

// Shared delete (staff can delete their own, admin can delete any)
router.delete('/:id', verifyCookieToken, procurementController.deleteProcurement);

module.exports = router;
