// controllers/assetController.js
const Asset = require('../models/assets');
const { validationResult } = require('express-validator');

/**
 * Helper to return validation errors as formatted JSON
 */
function checkValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return { ok: false, errors: errors.array() };
  }
  return { ok: true, errors: [] };
}

/* List all assets (paginated optional) */
async function listAssets(req, res) {
  try {
    const q = {};
    // optional query filters: search, tag, location
    if (req.query.search) {
      q.name = { $regex: req.query.search, $options: 'i' };
    }
    if (req.query.tag) q.tags = req.query.tag;
    if (req.query.location) q.location = req.query.location;

    const assets = await Asset.find(q).sort({ name: 1 }).lean();
    return res.json({ success: true, assets });
  } catch (err) {
    console.error('listAssets', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

/* Get single asset */
async function getAsset(req, res) {
  try {
    const a = await Asset.findById(req.params.id).lean();
    if (!a) return res.status(404).json({ success: false, message: 'Asset not found' });
    return res.json({ success: true, asset: a });
  } catch (err) {
    console.error('getAsset', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

/* Create asset */
async function createAsset(req, res) {
  const v = checkValidation(req, res);
  if (!v.ok) return res.status(422).json({ success: false, errors: v.errors });

  try {
    const data = {
      name: req.body.name,
      description: req.body.description || '',
      quantity: typeof req.body.quantity === 'number' ? req.body.quantity : (req.body.quantity ? parseInt(req.body.quantity, 10) : 0),
      location: req.body.location || '',
      tags: Array.isArray(req.body.tags) ? req.body.tags : []
    };
    // optional createdBy from auth: req.user?.id
    if (req.user && req.user.id) data.createdBy = req.user.id;

    const asset = new Asset(data);
    await asset.save();
    return res.status(201).json({ success: true, asset });
  } catch (err) {
    console.error('createAsset', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

/* Update asset */
async function updateAsset(req, res) {
  const v = checkValidation(req, res);
  if (!v.ok) return res.status(422).json({ success: false, errors: v.errors });

  try {
    const updates = {};
    ['name', 'description', 'location'].forEach(k => {
      if (typeof req.body[k] !== 'undefined') updates[k] = req.body[k];
    });
    if (typeof req.body.quantity !== 'undefined') updates.quantity = parseInt(req.body.quantity, 10);
    if (Array.isArray(req.body.tags)) updates.tags = req.body.tags;

    const asset = await Asset.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });
    return res.json({ success: true, asset });
  } catch (err) {
    console.error('updateAsset', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

/* Adjust quantity by delta (positive or negative) */
async function adjustQuantity(req, res) {
  const v = validationResult(req);
  if (!v.isEmpty()) return res.status(422).json({ success: false, errors: v.array() });

  try {
    const delta = parseInt(req.body.quantityDelta, 10);
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    const newQty = asset.quantity + delta;
    if (newQty < 0) return res.status(400).json({ success: false, message: 'Quantity would become negative' });

    asset.quantity = newQty;
    await asset.save();
    return res.json({ success: true, asset });
  } catch (err) {
    console.error('adjustQuantity', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

/* Delete asset */
async function deleteAsset(req, res) {
  try {
    const asset = await Asset.findByIdAndDelete(req.params.id);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });
    return res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    console.error('deleteAsset', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = {
  listAssets,
  getAsset,
  createAsset,
  updateAsset,
  adjustQuantity,
  deleteAsset
};
