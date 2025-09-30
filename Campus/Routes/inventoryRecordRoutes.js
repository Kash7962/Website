// routes/inventoryRoutes.js
const express = require('express');
const router = express.Router();
const inventoryRecordController = require('../Controllers/inventoryRecordController');
const { verifyCookieToken } = require('../middlewares/middleware'); // your auth middleware

// page view
router.get('/inventory/records', verifyCookieToken, inventoryRecordController.getInventoryRecordsPage);

// api (json)
router.get('/api/inventory/records', verifyCookieToken, inventoryRecordController.fetchInventoryRecords);

router.delete('/api/inventory/delete-all', verifyCookieToken, inventoryRecordController.deleteAllRecords);

module.exports = router;
