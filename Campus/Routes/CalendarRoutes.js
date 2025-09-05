// routes/calendar.js
const express = require('express');
const router = express.Router();
const calendarController = require('../Controllers/CalendarController');
const { addEventValidator } = require('../validators/schema');
const { verifyCookieToken } = require('../middlewares/middleware');
// Page (staff-only) to create calendar
router.get('/create', /* authMiddleware, role check if needed */ calendarController.renderCalendarPage);

// API
router.get('/events', verifyCookieToken, calendarController.apiGetEvents);
router.post('/add', verifyCookieToken, addEventValidator, calendarController.apiAddEvent);
router.delete('/delete/:id', verifyCookieToken, calendarController.apiDeleteEvent);

// Page route — render EJS
router.get('/view', verifyCookieToken, calendarController.renderCalendarViewPage);

// API route — return events (read-only)
router.get('/view-events', verifyCookieToken, calendarController.apiViewEvents);

module.exports = router;
