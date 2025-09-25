const { validationResult } = require('express-validator');
const InventoryItem = require('../models/inventory');
const Procurement = require('../models/procurement');
const { Admin } = require('../models/admin');
const { Staff } = require('../models/staff');
const Budget = require('../models/budget'); // ✅ import budget model

/** Escape regex special chars for case-insensitive exact match */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

exports.getInventoryPage = async (req, res) => {
  try {
    const inventoryDocs = await InventoryItem.find()
      .populate('procurementId', 'originalName')
      .populate('uploader', 'name')
      .lean();

    const allUserIds = inventoryDocs.flatMap(doc =>
      doc.items.map(item => item.lastUpdatedBy).filter(Boolean)
    );
    const uniqueIds = [...new Set(allUserIds.map(id => id.toString()))];

    const [admins, staff] = await Promise.all([
      Admin.find({ _id: { $in: uniqueIds } }, 'name').lean(),
      Staff.find({ _id: { $in: uniqueIds } }, 'name').lean()
    ]);

    const userMap = {};
    admins.forEach(a => { userMap[a._id.toString()] = a.name; });
    staff.forEach(s => { userMap[s._id.toString()] = s.name; });

    const items = inventoryDocs.flatMap(doc =>
      doc.items.map(item => ({
        _id: item._id,
        itemName: item.itemName,
        quantity: item.quantity,
        unit: item.unit,
        pricePerUnit: item.pricePerUnit,
        lastUpdatedBy: item.lastUpdatedBy ? (userMap[item.lastUpdatedBy.toString()] || 'Unknown') : '—',
        procurementId: doc.procurementId._id,
        procurementName: doc.procurementId.originalName,
        uploader: doc.uploader.name
      }))
    );

    const userAccepted = await Procurement.findOne({
      uploader: req.user._id,
      status: 'accepted',
      itemsAdded: false
    }).lean();

    const anyAccepted = await Procurement.findOne({ status: 'accepted' }).lean();

    // ✅ Fetch Kitchen department budget
    const kitchenBudget = await Budget.findOne({ department: 'Kitchen' }).lean();

    return res.render('Staff/inventory', {
      items,
      user: req.user,
      canAddForThisUser: !!userAccepted,
      procurementForUser: userAccepted,
      anyAccepted: !!anyAccepted,
      budget: kitchenBudget || { allocatedAmount: 0, spentAmount: 0 } // safe fallback
    });

  } catch (err) {
    console.error('getInventoryPage error:', err);
    return res.status(500).send('Server error');
  }
};


/**
 * Add multiple items for a procurement
 * Body: { procurementId, items: [{itemName, quantity, pricePerUnit}, ...] }
 */
exports.postAddItems = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { procurementId, items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'No items provided' });
    }

    const procurement = await Procurement.findById(procurementId);
    if (!procurement) {
      return res.status(400).json({ error: 'Procurement not found' });
    }
    if (procurement.status !== 'accepted') {
      return res.status(400).json({ error: 'Procurement not accepted' });
    }
    if (procurement.uploader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not allowed to add items for this procurement' });
    }
    if (procurement.itemsAdded) {
      return res.status(400).json({ error: 'Items already added from this procurement' });
    }

    // Get Kitchen budget
    const budget = await Budget.findOne({ department: 'Kitchen' });
    if (!budget) {
      return res.status(400).json({ error: "Kitchen budget not found" });
    }

    let inventory = await InventoryItem.findOne();
    if (!inventory) {
      inventory = new InventoryItem({
        procurementId,
        uploader: req.user._id,
        items: []
      });
    }

    let totalSpentNow = 0;

    for (const item of items) {
      const { itemName, quantity, pricePerUnit } = item;
      if (!itemName?.trim() || quantity == null || pricePerUnit == null) continue;

      const q = Number(quantity);
      const p = Number(pricePerUnit);

      totalSpentNow += q * p;
    }

    // ✅ Check if budget allows this purchase
    const remainingBudget = budget.allocatedAmount - budget.spentAmount;
    if (totalSpentNow > remainingBudget) {
      return res.status(400).json({
        error: `Budget exceeded. Remaining budget is ${remainingBudget}`
      });
    }

    // Add/update inventory items
    for (const item of items) {
      const { itemName, quantity, pricePerUnit, unit } = item;
      if (!itemName?.trim() || quantity == null || pricePerUnit == null) continue;

      const regex = new RegExp(`^${escapeRegex(itemName.trim())}$`, 'i');
      const existingItem = inventory.items.find(i => regex.test(i.itemName));

      const q = Number(quantity);
      const p = Number(pricePerUnit);

      if (existingItem) {
        existingItem.quantity += q;
        existingItem.pricePerUnit = p;
        existingItem.lastUpdatedBy = req.user._id;
      } else {
        inventory.items.push({
          itemName: itemName.trim(),
          quantity: q,
          unit: unit.trim(),
          pricePerUnit: p,
          lastUpdatedBy: req.user._id
        });
      }
    }

    await inventory.save();

    procurement.itemsAdded = true;
    await procurement.save();

    // ✅ Update budget
    budget.spentAmount = (budget.spentAmount || 0) + totalSpentNow;
    budget.transactions = budget.transactions || [];
    budget.transactions.push({
      procurementId,
      inventoryId: inventory._id,
      items: items.map(i => ({
        itemName: i.itemName.trim(),
        quantity: Number(i.quantity),
        unit: i.unit.trim(),
        pricePerUnit: Number(i.pricePerUnit),
        total: Number(i.quantity) * Number(i.pricePerUnit)
      })),
      totalCost: totalSpentNow,
      addedBy: req.user._id,
      date: new Date()
    });
    await budget.save();

    return res.json({ ok: true, msg: 'Items added successfully & budget updated' });
  } catch (err) {
    console.error('postAddItems Error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};



/**
 * Consume inventory item quantity
 */
exports.postConsumeItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0)
      return res.status(400).json({ error: 'Quantity must be greater than zero' });

    const inventoryDoc = await InventoryItem.findOne({ "items._id": itemId });
    if (!inventoryDoc) return res.status(404).json({ error: 'Item not found' });

    const item = inventoryDoc.items.id(itemId);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    if (req.user.role !== 'admin' && item.lastUpdatedBy?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (Number(quantity) > item.quantity)
      return res.status(400).json({ error: 'Cannot consume more than available quantity' });

    item.quantity -= Number(quantity);
    item.lastUpdatedBy = req.user._id;

    if (item.quantity <= 0) {
      item.deleteOne();
    }

    await inventoryDoc.save();

    return res.json({ ok: true, msg: 'Inventory updated' });
  } catch (err) {
    console.error('postConsumeItem error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
