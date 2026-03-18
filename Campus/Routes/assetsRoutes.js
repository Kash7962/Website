// routes/assetApi.js
const express = require('express');
const router = express.Router();
const assetCtrl = require('../controllers/assetController');
const { createOrUpdateAsset, idParam, adjustQuantity } = require('../validators/schema');
const { verifyCookieToken } = require('../middlewares/middleware');
const Asset = require('../models/assets');


router.get('/api/assets/', verifyCookieToken, assetCtrl.listAssets); // GET /api/assets
router.get('/api/assets/:id', verifyCookieToken, idParam, assetCtrl.getAsset); // GET /api/assets/:id

router.post('/api/assets/', verifyCookieToken, createOrUpdateAsset, assetCtrl.createAsset); // create
router.put('/api/assets/:id', verifyCookieToken, idParam, createOrUpdateAsset, assetCtrl.updateAsset); // update
router.post('/api/assets:id/adjust', verifyCookieToken, adjustQuantity, assetCtrl.adjustQuantity); // adjust qty
router.delete('/api/assets/:id', verifyCookieToken, idParam, assetCtrl.deleteAsset); // delete

router.get('/control', async (req, res) => {
  // server can render initial assets or let client fetch
  const assets = await Asset.find().sort({ name: 1 }).lean();
  res.render('Assets/assets_control', { pageTitle: 'Assets - Control', assets });
});

// view-only page
router.get('/view', async (req, res) => {
  const assets = await Asset.find().sort({ name: 1 }).lean();
  res.render('Assets/assets_view', { pageTitle: 'Assets - View', assets });
});

module.exports = router;
