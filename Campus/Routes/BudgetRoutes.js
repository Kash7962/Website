const express = require('express');
const { body } = require('express-validator');
const budgetController = require('../Controllers/BudgetController');
const { verifyCookieToken } = require('../middlewares/middleware');
const router = express.Router();
const { budgetValidator } = require('../validators/schema');

router.get('/budget', verifyCookieToken, budgetController.getBudgetPage);

router.post(
  '/budget',
  verifyCookieToken,
  budgetValidator,
  budgetController.postBudget
);

router.post(
  '/budget/edit/:id',
  verifyCookieToken,
  budgetValidator,
  budgetController.updateBudget
);

// Delete budget
router.post('/budget/delete/:id', verifyCookieToken, budgetController.deleteBudget);

module.exports = router;
