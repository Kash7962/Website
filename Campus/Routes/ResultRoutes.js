// routes/resultRoutes.js
const express = require('express');
const router = express.Router();
const resultController = require('../Controllers/ResultController');
const { verifyCookieToken } = require('../middlewares/middleware');

// Show results management page for a student
router.get('/:studentId', verifyCookieToken, resultController.renderResultsPage);

// Add result for student
router.post('/:studentId/add', verifyCookieToken, resultController.addResult);

// Edit an existing result (studentId + resultId for safety)
router.put('/:studentId/edit/:resultId', verifyCookieToken, resultController.editResult);

// Delete a result
router.delete('/:studentId/delete/:resultId', verifyCookieToken, resultController.deleteResult);

module.exports = router;
