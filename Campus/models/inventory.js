const mongoose = require('mongoose');

// Schema for each individual inventory item row
const ItemSchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, trim: true },
    pricePerUnit: { type: Number, required: true, min: 0 },
    lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' } // allow populate
  },
  { _id: true } // each item row gets its own unique id
);

// Main Inventory schema for each procurement
const InventorySchema = new mongoose.Schema(
  {
    procurementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Procurement',
      required: true
    },
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
      required: true
    },
    items: [ItemSchema] // store multiple items linked to procurement
  },
  { timestamps: true }
);

module.exports = mongoose.model('InventoryItem', InventorySchema);
