// controllers/inventoryRecordController.js
const InventoryRecord = require('../models/inventoryRecord');
const ActivityLog = require('../models/activityLog')
const escapeRegex = (s = '') => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const { Staff } = require('../models/staff')
const { Admin } = require('../models/admin')
exports.getInventoryRecordsPage = async (req, res) => {
  // render EJS that will call the API to populate data
  return res.render('Admin/inventory-records', {
    pageTitle: 'Inventory Records',
    user: req.user
  });
};

exports.fetchInventoryRecords = async (req, res) => {
  try {
    let { page = 1, perPage = 25, action, q, dateFrom, dateTo } = req.query;
    page = Number(page) || 1;
    perPage = Math.min(Number(perPage) || 25, 200);

    const filter = {};
    if (action) filter.action = action;
    if (q) filter['items.itemName'] = new RegExp(escapeRegex(q), 'i');
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = to;
      }
    }

    const total = await InventoryRecord.countDocuments(filter);
    const records = await InventoryRecord.find(filter)
      .populate('performedBy', 'name email')
      .populate('inventoryId', '_id')
      .populate('procurementId', '_id')
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .lean();

    // compute simple summary for returned page
    const summary = {
      totalSpent: 0,
      addedCount: 0,
      consumedCount: 0
    };
    for (const r of records) {
      summary.totalSpent += Number(r.totalCost || 0);
      if (r.action === 'added') summary.addedCount++;
      if (r.action === 'consumed') summary.consumedCount++;
    }

    return res.json({ ok: true, records, total, page, perPage, summary });
  } catch (err) {
    console.error('fetchInventoryRecords err', err);
    return res.status(500).render('error/error',{ message: 'Server error' });
  }
};

exports.deleteAllRecords = async (req, res) => {
  try {
    const result = await InventoryRecord.deleteMany({});
     const user = await Admin.findById(req.user._id);
                    await ActivityLog.create({
                      userId : user._id,
                      userModel: 'Admin',
                      name: user.name,
                      email: user.email,
                      action: `Kitchen inventory records deleted`,
                      // targetModel: 'Admin',
                      // targetId: newAdmin._id,
                      // targetname: newAdmin.name,
                      // targetEmail: newAdmin.email ,
                      // registrationNumber: student.registration_number,
                      // classAssigned: student.classAssigned
                    });
    return res.json({
      success: true,
      message: `Deleted ${result.deletedCount} records`
    });
  } catch (err) {
    console.error('Error deleting all inventory records:', err);
    return res.status(500).render('error/error',{ message: 'Failed to delete all records' });
  }
};