const mongoose = require('mongoose');

const purchaseRecordSchema = new mongoose.Schema({
  inventoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InventoryItem',
    required: true,
  },
  procurementId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Procurement',
    required: true,
  },
  items: [
    {
      itemId: { type: mongoose.Schema.Types.ObjectId, required: true }, // reference _id from InventoryItem.items
      itemName: { type: String, required: true },
      quantity: { type: Number, required: true, min: 0 },
      unit: { type: String, required: true },
      pricePerUnit: { type: Number, required: true, min: 0 },
      totalCost: { type: Number, required: true, min: 0 }, // quantity * pricePerUnit
    },
  ],
  totalPurchaseAmount: {
    type: Number,
    required: true, // sum of all item totalCost
    min: 0,
  },
  purchasedAt: {
    type: Date,
    default: Date.now,
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true,
  },
});

const budgetSchema = new mongoose.Schema({
  department: {
    type: String,
    required: true,
    trim: true,
    unique: true, // one budget per department
  },
  allocatedAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  spentAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  purchases: [purchaseRecordSchema], // ✅ track purchase history
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Budget', budgetSchema);
