// models/inventoryRecord.js
const mongoose = require('mongoose');

const RecordItemSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, required: false }, // reference to inventory item's subdoc _id (optional)
  itemName: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 0 }, // amount added or consumed
  unit: { type: String, trim: true },
  pricePerUnit: { type: Number, min: 0, default: 0 },
  total: { type: Number, min: 0, default: 0 }, // pricePerUnit * quantity
  prevQuantity: { type: Number, min: 0, default: 0 },
  newQuantity: { type: Number, min: 0, default: 0 }
}, { _id: false });

const InventoryRecordSchema = new mongoose.Schema({
  inventoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem', required: false },
  procurementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Procurement', required: false },
  action: { type: String, enum: ['added', 'consumed'], required: true },
  items: [RecordItemSchema],
  totalCost: { type: Number, min: 0, default: 0 }, // sum of items.total for this record (useful for 'added')
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  note: { type: String, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('InventoryRecord', InventoryRecordSchema);
