const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  description: { type: String, required: true, trim: true },
  file: { type: String, default: '' },
  postedOn: { type: Date, default: Date.now }
});

const Notice = mongoose.model('Notice', noticeSchema);
const Event = mongoose.model('Event', noticeSchema);
const Program = mongoose.model('Program', noticeSchema);
module.exports = { Notice, Event, Program };
