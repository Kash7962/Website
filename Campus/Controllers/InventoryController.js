const { validationResult } = require('express-validator');
const InventoryItem = require('../models/inventory');
const Procurement = require('../models/procurement');
const { Admin } = require('../models/admin');
const { Staff } = require('../models/staff');
const Budget = require('../models/budget'); // ✅ import budget model
const InventoryRecord = require('../models/inventoryRecord');

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
    return res.status(500).render('error/error', { message: 'Server error' });
  }
};

exports.getAdminInventory = async (req, res) => {
  try {
    const inventoryDocs = await InventoryItem.find()
      .populate('procurementId', 'originalName')
      .populate('uploader', 'name')
      .populate('items.lastUpdatedBy', 'name')
      .lean();

    res.render('Admin/adminInventory', {
      pageTitle: 'Admin Inventory View',
      inventory: inventoryDocs
    });
  } catch (err) {
    console.error('Error fetching inventory:', err);
    res.status(500).render('error/error', {
      message: 'Failed to load inventory records.'
    });
  }
};

/**
 * Add multiple items for a procurement
 * Body: { procurementId, items: [{itemName, quantity, pricePerUnit}, ...] }
 */
exports.postAddItems = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).render('error/error', { message: errors.array()[0].msg });

    const { procurementId, items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).render('error/error', { message: 'No items provided' });
    }

    const procurement = await Procurement.findById(procurementId);
    if (!procurement) return res.status(400).json({ error: 'Procurement not found' });
    if (procurement.status !== 'accepted') return res.status(400).render('error/error',{ message: 'Procurement not accepted' });
    if (procurement.uploader.toString() !== req.user._id.toString()) {
      return res.status(403).render('error/error',{ message: 'Not allowed to add items for this procurement' });
    }
    if (procurement.itemsAdded) return res.status(400).render('error/error',{ message: 'Items already added from this procurement' });

    // Get Kitchen budget
    const budget = await Budget.findOne({ department: 'Kitchen' });
    if (!budget) return res.status(400).render('error/error',{ message: "Kitchen budget not found" });

    // NOTE: your original code used findOne() (global inventory doc). Keeping same behavior.
    let inventory = await InventoryItem.findOne();
    if (!inventory) {
      inventory = new InventoryItem({
        procurementId,
        uploader: req.user._id,
        items: []
      });
    }

    let totalSpentNow = 0;
    // 1) compute total
    for (const item of items) {
      const { itemName, quantity, pricePerUnit } = item;
      if (!itemName?.trim() || quantity == null || pricePerUnit == null) continue;
      const q = Number(quantity);
      const p = Number(pricePerUnit);
      totalSpentNow += q * p;
    }

    const remainingBudget = (budget.allocatedAmount || 0) - (budget.spentAmount || 0);
    if (totalSpentNow > remainingBudget) {
      return res.status(400).render('error/error',{ message: `Budget exceeded. Remaining budget is ${remainingBudget}`
      });
    }

    // Prepare record items to save to InventoryRecord
    const recordItems = [];

    // 2) Add/update inventory items
    for (const item of items) {
      const { itemName, quantity, pricePerUnit, unit } = item;
      if (!itemName?.trim() || quantity == null || pricePerUnit == null) continue;

      const regex = new RegExp(`^${escapeRegex(itemName.trim())}$`, 'i');
      const existingItem = inventory.items.find(i => regex.test(i.itemName));

      const q = Number(quantity);
      const p = Number(pricePerUnit);

      if (existingItem) {
        const prevQty = Number(existingItem.quantity || 0);
        existingItem.quantity = prevQty + q;
        existingItem.pricePerUnit = p;
        existingItem.lastUpdatedBy = req.user._id;

        recordItems.push({
          itemId: existingItem._id,
          itemName: existingItem.itemName,
          quantity: q,
          unit: unit?.trim() || existingItem.unit || '',
          pricePerUnit: p,
          total: q * p,
          prevQuantity: prevQty,
          newQuantity: existingItem.quantity
        });
      } else {
        const newItem = {
          itemName: itemName.trim(),
          quantity: q,
          unit: unit?.trim() || '',
          pricePerUnit: p,
          lastUpdatedBy: req.user._id
        };
        inventory.items.push(newItem);

        // the new item will have an _id after save; but we can still store itemName and quantities
        recordItems.push({
          itemId: null, // will remain null; you can backfill later if needed
          itemName: itemName.trim(),
          quantity: q,
          unit: unit?.trim() || '',
          pricePerUnit: p,
          total: q * p,
          prevQuantity: 0,
          newQuantity: q
        });
      }
    }

    await inventory.save();

    // mark procurement done
    procurement.itemsAdded = true;
    await procurement.save();

    // Update budget
    budget.spentAmount = (budget.spentAmount || 0) + totalSpentNow;
    budget.transactions = budget.transactions || [];
    budget.transactions.push({
      procurementId,
      inventoryId: inventory._id,
      items: items.map(i => ({
        itemName: i.itemName.trim(),
        quantity: Number(i.quantity),
        unit: (i.unit || '').trim(),
        pricePerUnit: Number(i.pricePerUnit),
        total: Number(i.quantity) * Number(i.pricePerUnit)
      })),
      totalCost: totalSpentNow,
      addedBy: req.user._id,
      date: new Date()
    });
    await budget.save();

    // Create InventoryRecord
    try {
      await InventoryRecord.create({
        inventoryId: inventory._id,
        procurementId,
        action: 'added',
        items: recordItems,
        totalCost: totalSpentNow,
        performedBy: req.user._id,
        note: `Added from procurement ${procurementId}`
      });
    } catch (recErr) {
      // Log but don't block final response; record creation failure shouldn't roll back everything here
      console.error('Failed saving InventoryRecord for add:', recErr);
    }

    return res.json({ ok: true, msg: 'Items added successfully & budget updated' });
  } catch (err) {
    console.error('postAddItems Error:', err);
    return res.status(500).render('error/error',{ message: 'Server error' });
  }
};


exports.postConsumeItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0)
      return res.status(400).render('error/error',{ message: 'Quantity must be greater than zero' });

    const inventoryDoc = await InventoryItem.findOne({ "items._id": itemId });
    if (!inventoryDoc) return res.status(404).render('error/error',{ message: 'Item not found' });

    const item = inventoryDoc.items.id(itemId);
    if (!item) return res.status(404).render('error/error',{ message: 'Item not found' });

    if (req.user.role !== 'admin' && item.lastUpdatedBy?.toString() !== req.user._id.toString()) {
      return res.status(403).render('error/error',{ message: 'Forbidden' });
    }

    if (Number(quantity) > item.quantity)
      return res.status(400).render('error/error',{ message: 'Cannot consume more than available quantity' });

    const prevQty = Number(item.quantity || 0);
    item.quantity = prevQty - Number(quantity);
    item.lastUpdatedBy = req.user._id;

    // For record
    const consumedQty = Number(quantity);
    const recordItem = {
      itemId: item._id,
      itemName: item.itemName,
      quantity: consumedQty,
      unit: item.unit || '',
      pricePerUnit: item.pricePerUnit || 0,
      total: consumedQty * (item.pricePerUnit || 0),
      prevQuantity: prevQty,
      newQuantity: Math.max(0, item.quantity)
    };

    if (item.quantity <= 0) {
      item.deleteOne();
    }

    await inventoryDoc.save();

    // Create InventoryRecord for consumption
    try {
      await InventoryRecord.create({
        inventoryId: inventoryDoc._id,
        action: 'consumed',
        items: [recordItem],
        totalCost: recordItem.total || 0,
        performedBy: req.user._id,
        note: `Consumed ${consumedQty} of ${item.itemName}`
      });
    } catch (recErr) {
      console.error('Failed saving InventoryRecord for consume:', recErr);
      // don't block final response
    }

    return res.json({ ok: true, msg: 'Inventory updated' });
  } catch (err) {
    console.error('postConsumeItem error:', err);
    return res.status(500).render('error/error',{ message: 'Server error' });
  }
};
