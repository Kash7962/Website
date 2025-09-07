// controllers/CalendarController.js
const CalendarEvent = require('../models/calendarEvents');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const { Staff } = require('../models/staff');
const ActivityLog = require('../models/activityLog');
/* ---------- Helpers ---------- */
function parseDateSafe(v) {
  if (!v && v !== 0) return null;
  let str = String(v).trim();
  if (/ \d{2}:\d{2}$/.test(str) || / \d{2}:\d{2}:\d{2}$/.test(str)) {
    str = str.replace(' ', '+');
  }
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

function buildFilter(start, end, batch) {
  const s = parseDateSafe(start);
  const e = parseDateSafe(end);
  const q = {};

  if (s && e) {
    q.$and = [
      { start: { $lte: e } },
      { $or: [{ end: { $gte: s } }, { end: { $exists: false } }] }
    ];
  }

  if (batch && String(batch) !== 'All') {
    (q.$and = q.$and || []).push({
      $or: [
        { batches: batch },
        { batches: 'All' },
        { batches: { $exists: false } }
      ]
    });
  }

  return q;
}

function computeWorkingDays(startDate, endDate, events) {
  const s = parseDateSafe(startDate), e = parseDateSafe(endDate);
  if (!s || !e) return null;
  const start = new Date(s); start.setHours(0,0,0,0);
  const end = new Date(e); end.setHours(0,0,0,0);

  const holidaySet = new Set();
  (events || []).forEach(ev => {
    if (!['holiday','observance'].includes(ev.type)) return;
    const evS = parseDateSafe(ev.start); if (!evS) return;
    const evE = ev.end ? (parseDateSafe(ev.end) || evS) : evS;
    for (let d = new Date(evS); d <= evE; d.setDate(d.getDate() + 1)) {
      holidaySet.add(d.toISOString().slice(0,10));
    }
  });

  let count = 0;
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    if (d.getDay() === 0) continue; // skip Sundays
    if (holidaySet.has(d.toISOString().slice(0,10))) continue;
    count++;
  }
  return count;
}

/* ---------- API ---------- */
const apiGetEvents = async (req, res) => {
  try {
    const { start, end, batch } = req.query;
    const s = parseDateSafe(start), e = parseDateSafe(end);
    if (!s || !e) {
      return res.status(400).render('error/error', { message: 'Invalid or missing start/end' });
    }

    const q = buildFilter(start, end, batch);
    const events = await CalendarEvent.find(q).lean().exec();

    const fcEvents = events.map(ev => {
      // Merge start/end with times if provided
      const startIso = ev.startTime
        ? new Date(`${ev.start.toISOString().slice(0,10)}T${ev.startTime}`)
        : ev.start;
      const endIso = ev.end
        ? (ev.endTime
          ? new Date(`${ev.end.toISOString().slice(0,10)}T${ev.endTime}`)
          : ev.end)
        : null;

      return {
        id: ev._id,
        title: ev.title,
        start: startIso,
        end: endIso,
        allDay: !!ev.allDay,
        color: ev.color,
        extendedProps: {
          description: ev.description,
          type: ev.type,
          batches: ev.batches
        }
      };
    });

    return res.json(fcEvents);
  } catch (err) {
    console.error('[apiGetEvents] ERROR', err.stack || err);
    return res.status(500).render('error/error', { message: 'Server error fetching events' });
  }
};

const renderCalendarPage = (req, res) => {
  const batches = [
    'All',
    '+2 First Year',
    '+2 Second Year',
    '+3 First Year',
    '+3 Second Year',
    '+3 Third Year'
  ];
  res.render('Staff/academicCalendar', { batches });
};

const apiAddEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).render('error/error', { message: errors.array()[0].msg });

    const {
      title, description, start, end, allDay = true, type = 'other',
      startTime, endTime, color, batches = ['All']
    } = req.body;

    const s = parseDateSafe(start);
    if (!s) return res.status(400).render('error/error', { message: 'Invalid start date' });

    let e = null;
    if (end) {
      e = parseDateSafe(end);
      if (!e) return res.status(400).render('error/error', { message: 'Invalid end date' });
    } else if (!allDay) {
      e = s;
    }

    const ev = new CalendarEvent({
      title: String(title || '').trim(),
      description: description ? String(description).trim() : '',
      start: s,
      end: e || undefined,
      allDay: !!allDay,
      startTime: !allDay && startTime ? String(startTime).trim() : undefined,
      endTime: !allDay && endTime ? String(endTime).trim() : undefined,
      type,
      color: color ? String(color).trim() : undefined,
      batches: Array.isArray(batches) && batches.length ? batches.map(b => String(b).trim()) : ['All'],
      createdBy: req.user?._id || undefined,
      createdByModel: req.user?._roleModel || 'Staff',
      approved: true
    });

    await ev.save();
     const user = await Staff.findById(req.user._id);
            await ActivityLog.create({
              userId : user._id,
              userModel: 'Staff',
              name: user.name,
              email: user.email,
              action: `${ev.title} event created `,
              // targetModel: 'Student',
              // targetId: student._id,
              // targetname: `${student.firstName} ${student.middleName} ${student.lastName}`,
              // targetEmail: student.studentEmail,
              // registrationNumber: student.registration_number,
              // classAssigned: student.classAssigned
            });
    return res.status(201).json({ id: ev._id });
  } catch (err) {
    console.error('apiAddEvent err:', err.stack || err);
    return res.status(500).render('error/error', { message: 'Unable to save event' });
  }
};

const apiUpdateEvent = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).render('error/error', { message: 'Invalid event id' });

    const payload = {};
    const allowed = ['title','description','start','end','allDay','type','startTime','endTime','color','batches','approved'];
    for (const k of allowed) {
      if (Object.prototype.hasOwnProperty.call(req.body, k)) payload[k] = req.body[k];
    }

    if (payload.start) {
      const s = parseDateSafe(payload.start);
      if (!s) return res.status(400).render('error/error', { message: 'Invalid start date' });
      payload.start = s;
    }
    if (payload.end) {
      const e = parseDateSafe(payload.end);
      if (!e) return res.status(400).render('error/error', { message: 'Invalid end date' });
      payload.end = e;
    }

    if (payload.batches && Array.isArray(payload.batches)) {
      payload.batches = payload.batches.map(b => String(b).trim());
    }

    payload.updatedAt = new Date();

    const updated = await CalendarEvent.findByIdAndUpdate(id, payload, { new: true }).lean().exec();
    if (!updated) return res.status(404).render('error/error',{ message: 'Event not found' });
    return res.json({ ok: true, event: updated });
  } catch (err) {
    console.error('apiUpdateEvent err:', err.stack || err);
    return res.status(500).render('error/error',{ message: 'Server error updating event' });
  }
};

const apiDeleteEvent = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).render('error/error',{ message: 'Invalid id' });
    const event = await CalendarEvent.findById(id);
    await CalendarEvent.findByIdAndDelete(id);
    const user = await Staff.findById(req.user._id);
            await ActivityLog.create({
              userId : user._id,
              userModel: 'Staff',
              name: user.name,
              email: user.email,
              action: `${event.title} event deleted `,
              // targetModel: 'Student',
              // targetId: student._id,
              // targetname: `${student.firstName} ${student.middleName} ${student.lastName}`,
              // targetEmail: student.studentEmail,
              // registrationNumber: student.registration_number,
              // classAssigned: student.classAssigned
            });
    return res.json({ ok: true });
  } catch (err) {
    console.error('apiDeleteEvent err:', err.stack || err);
    return res.status(500).render('error/error', { message: 'Server error deleting event' });
  }
};


// Render view-only calendar page
const renderCalendarViewPage = (req, res) => {
  const batches = [
    'All',
    '+2 First Year',
    '+2 Second Year',
    '+3 First Year',
    '+3 Second Year',
    '+3 Third Year'
  ];
  res.render('Staff/academicCalendarView', { batches });
};

// Fetch events for viewing (read-only)
const apiViewEvents = async (req, res) => {
  try {
    const { start, end, batch } = req.query;
    const s = parseDateSafe(start), e = parseDateSafe(end);
    if (!s || !e) {
      return res.status(400).render('error/error', { message: 'Invalid or missing start/end' });
    }

    const q = buildFilter(start, end, batch);
    const events = await CalendarEvent.find(q).lean().exec();

    const fcEvents = events.map(ev => {
      const startIso = ev.startTime
        ? new Date(`${ev.start.toISOString().slice(0,10)}T${ev.startTime}`)
        : ev.start;
      const endIso = ev.end
        ? (ev.endTime
          ? new Date(`${ev.end.toISOString().slice(0,10)}T${ev.endTime}`)
          : ev.end)
        : null;

      return {
        id: ev._id,
        title: ev.title,
        start: startIso,
        end: endIso,
        allDay: !!ev.allDay,
        color: ev.color,
        extendedProps: {
          description: ev.description,
          type: ev.type,
          batches: ev.batches
        }
      };
    });

    const workingDays = computeWorkingDays(s, e, events);
    return res.json({ events: fcEvents, workingDays });
  } catch (err) {
    console.error('[apiViewEvents] ERROR', err.stack || err);
    return res.status(500).render('error/error', { message: 'Server error fetching events' });
  }
};



module.exports = {
  renderCalendarPage,
  apiGetEvents,
  apiAddEvent,
  apiUpdateEvent,
  apiDeleteEvent,
  computeWorkingDays,
  renderCalendarViewPage,
  apiViewEvents
};
