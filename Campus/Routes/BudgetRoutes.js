const express = require('express');
const { body } = require('express-validator');
const budgetController = require('../controllers/budgetController');
const { verifyCookieToken } = require('../middlewares/middleware');
const router = express.Router();
const { budgetValidator } = require('../validators/schema');

router.get('/kitchen', verifyCookieToken, budgetController.getBudgetPage);

router.post(
  '/kitchen',
  verifyCookieToken,
  budgetValidator,
  budgetController.postBudget
);

router.post(
  '/kitchen/edit/:id',
  verifyCookieToken,
  budgetValidator,
  budgetController.updateBudget
);

// Delete budget
router.post('/kitchen/delete/:id', verifyCookieToken, budgetController.deleteBudget);

module.exports = router;
