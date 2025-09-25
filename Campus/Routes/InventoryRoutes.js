const express = require('express');
const router = express.Router();
const { verifyCookieToken } = require('../middlewares/middleware');
const inventoryController = require('../Controllers/InventoryController');
const { addInventoryValidators } = require('../validators/schema');

// Inventory main page
router.get('/', verifyCookieToken, inventoryController.getInventoryPage);

// Add multiple items in batch for a procurement
router.post('/add', verifyCookieToken, addInventoryValidators, inventoryController.postAddItems);

// Consume a certain quantity of an inventory item
router.post('/consume/:itemId', verifyCookieToken, inventoryController.postConsumeItem);

module.exports = router;
