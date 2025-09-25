const path = require('path');
const fs = require('fs');
const Procurement = require('../models/procurement');
const { UPLOAD_DIR } = require('../config/multer_procurement');

/** safely delete file on disk if present */
function deleteProcurementFile(proc) {
  if (!proc || !proc.filename) return;
  const p = path.join(UPLOAD_DIR, proc.filename);
  try { if (fs.existsSync(p)) fs.unlinkSync(p); } 
  catch (err) { console.error('Could not delete file', p, err); }
}

/** STAFF: show their own submissions */
exports.getStaffProcurementPage = async (req, res) => {
  try {
    const myProcurements = await Procurement.find({ uploader: req.user._id })
      .sort({ uploadDate: -1 })
      .lean();
    return res.render('Staff/procurement', { myProcurements, user: req.user });
  } catch (err) {
    console.error(err);
    return res.status(500).send('Server error');
  }
};

/** ADMIN: show all pending/accepted/denied */
exports.getAdminProcurementPage = async (req, res) => {
  try {
    const pending = await Procurement.find({ status: 'pending' })
      .populate('uploader', 'name email')
      .sort({ uploadDate: -1 })
      .lean();
    const accepted = await Procurement.find({ status: 'accepted' })
      .populate('uploader', 'name email')
      .sort({ uploadDate: -1 })
      .lean();
    const denied = await Procurement.find({ status: 'denied' })
      .populate('uploader', 'name email')
      .sort({ uploadDate: -1 })
      .lean();

    return res.render('Admin/procurements', { pending, accepted, denied, user: req.user });
  } catch (err) {
    console.error(err);
    return res.status(500).send('Server error');
  }
};

exports.postUploadProcurement = async (req, res) => {
  try {
    const file = req.file;
    const doc = new Procurement({
      uploader: req.user._id,
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      status: 'pending'
    });
    await doc.save();
    return res.json({ ok: true, msg: 'File uploaded' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Admin accepts an array of procurement ids to accept.
 * All pending procurements not accepted will be deleted (file + DB).
 */
exports.postAcceptProcurements = async (req, res) => {
  try {
    let acceptIds = req.body.acceptIds || [];
    if (!Array.isArray(acceptIds)) acceptIds = [acceptIds].filter(Boolean);

    // set chosen ones to accepted
    if (acceptIds.length > 0) {
      await Procurement.updateMany(
        { _id: { $in: acceptIds } },
        { $set: { status: 'accepted', itemsAdded: false } }
      );
    }

    // remove all pending that are not in acceptIds
    const toDelete = await Procurement.find({ status: 'pending', _id: { $nin: acceptIds } });
    for (const p of toDelete) {
      deleteProcurementFile(p);
      await p.deleteOne();
    }

    return res.json({ ok: true, accepted: acceptIds.length });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/** Admin denies (removes) a single procurement */
exports.postDenyProcurement = async (req, res) => {
  try {
    const id = req.params.id;
    const p = await Procurement.findById(id);
    if (!p) return res.status(404).json({ error: 'Not found' });
    deleteProcurementFile(p);
    await p.deleteOne();
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/** delete procurement (uploader or admin) */
exports.deleteProcurement = async (req, res) => {
  try {
    const id = req.params.id;
    const p = await Procurement.findById(id);
    if (!p) return res.status(404).json({ error: 'Not found' });

    if (req.user.role !== 'admin' && p.uploader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    deleteProcurementFile(p);
    await p.deleteOne();
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};
