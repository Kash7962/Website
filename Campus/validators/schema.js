const { body, validationResult, param } = require('express-validator');
const { check } = require('express-validator');
const { SUBJECTS } = require('../models/lessonPlan');

const matricValidators = [
  body('lastSchoolAttended').optional({ checkFalsy: true }).trim().escape(),
  body('matricBoard').optional({ checkFalsy: true }).trim().escape(),
  body('matricRollNo').optional({ checkFalsy: true }).trim().escape(),
  body('matricYear')
    .optional({ checkFalsy: true })
    .isInt({ min: 1950, max: new Date().getFullYear() })
    .withMessage('Matric year must be valid.')
    .toInt(),

  body('matricMarks')
    .optional({ checkFalsy: true })
    .custom(val => {
      if (typeof val !== 'object' || val === null || Array.isArray(val)) {
        throw new Error('matricMarks must be an object');
      }
      return true;
    }),

  body('matricMarks.*')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage('Each subject mark must be >= 0')
    .toFloat(),

  body('matricTotal')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .toFloat(),

  body('matricPercentage')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0, max: 100 })
    .toFloat(),

  // Optional total consistency check
  body().custom(bodyValue => {
    const marksObj = bodyValue.matricMarks;
    const providedTotal = bodyValue.matricTotal;

    if (marksObj && Object.keys(marksObj).length && providedTotal !== undefined && providedTotal !== '') {
      const marks = Object.values(marksObj).map(Number);
      const sum = marks.reduce((a, b) => a + b, 0);
      if (Math.abs(sum - Number(providedTotal)) > 0.01) {
        throw new Error('Matric total does not match sum of subject marks');
      }
    }
    return true;
  })
];

const studentValidator = [
  // --- Course ---
  body('course')
    .trim()
    .escape()
    .notEmpty()
    .isIn(['+2 (Science)', '+3 (Science)', 'Vocational Skill Development'])
    .withMessage('Invalid course selection'),

  // --- Personal Info ---
  body('firstName').trim().escape().notEmpty().isLength({ max: 100 }),
  body('middleName').optional({ checkFalsy: true }).trim().escape().isLength({ max: 100 }),
  body('lastName').trim().escape().notEmpty().isLength({ max: 100 }),
  body('gender').trim().escape().isIn(['male', 'female']),
  body('studentEmail').trim().escape().notEmpty().isEmail().normalizeEmail({
      gmail_remove_subaddress: false, // keep subaddressing for Gmail
      gmail_remove_dots: false, // keep dots in Gmail addresses
    }),
  body('dob').trim().escape().notEmpty().isISO8601().toDate(),
  body('studentPhone').trim().escape().notEmpty().isMobilePhone('any'),
  body('aadhaarNumber').optional({ checkFalsy: true }).trim().escape().isLength({ min: 12, max: 12 }),
  body('caste').optional({ checkFalsy: true }).trim().escape(),
  body('subCaste').optional({ checkFalsy: true }).trim().escape(),
  body('religion').optional({ checkFalsy: true }).trim().escape(),
  body('bplAplStatus').optional({ checkFalsy: true }).trim().escape(),
  body('profileImage').optional({ checkFalsy: true }).trim().escape().isURL(),

  // --- Guardian 1 ---
  body('guardian1Name').trim().escape().notEmpty(),
  body('guardian1Relation').trim().escape().isIn(['Father', 'Mother', 'Brother', 'Sister', 'Other']),
  body('guardian1Occupation').optional({ checkFalsy: true }).trim().escape(),
  body('guardian1Income').optional({ checkFalsy: true }).isNumeric(),
  body('guardian1Phone').trim().escape().notEmpty().isMobilePhone('any'),
  body('guardian1Email').optional({ checkFalsy: true }).trim().escape().isEmail().normalizeEmail({
      gmail_remove_subaddress: false, // keep subaddressing for Gmail
      gmail_remove_dots: false, // keep dots in Gmail addresses
    }),

  // --- Guardian 2 ---
  body('guardian2Name').optional({ checkFalsy: true }).trim().escape(),
  body('guardian2Relation').optional({ checkFalsy: true }).trim().escape().isIn(['Father', 'Mother', 'Brother', 'Sister', 'Other']),
  body('guardian2Occupation').optional({ checkFalsy: true }).trim().escape(),
  body('guardian2Income').optional({ checkFalsy: true }).isNumeric(),

  // --- Family Info ---
  body('totalFamilyMembers').optional({ checkFalsy: true }).isInt({ min: 1 }),
  body('familyMembers').optional({ checkFalsy: true }).isArray(),
  body('familyMembers.*.name').optional({ checkFalsy: true }).trim().escape(),
  body('familyMembers.*.age').optional({ checkFalsy: true }).isInt({ min: 0 }),
  body('familyMembers.*.relation').optional({ checkFalsy: true }).trim().escape(),
  body('familyMembers.*.education').optional({ checkFalsy: true }).trim().escape(),
  body('familyMembers.*.otherInfo').optional({ checkFalsy: true }).trim().escape(),

  // --- Address ---
  body('address1').trim().escape().notEmpty(),
  body('address2').optional({ checkFalsy: true }).trim().escape(),
  body('city').optional({ checkFalsy: true }).trim().escape(),
  body('block').optional({ checkFalsy: true }).trim().escape(),
  body('district').optional({ checkFalsy: true }).trim().escape(),
  body('state').trim().escape().notEmpty(),
  body('zipcode').trim().escape().matches(/^\d{5,10}$/).withMessage('Zipcode must be 5-10 digits'),
  body('country').optional({ checkFalsy: true }).trim().escape(),

  // --- Education History (matricValidators inserted here) ---
  ...matricValidators,

  // --- Institutional Details ---
  body('registration_number').optional({ checkFalsy: true }).trim().escape(),
  body('enrollmentNumber').optional({ checkFalsy: true }).trim().escape(),
  body('classAssigned').optional({ checkFalsy: true }).trim().escape(),
  body('subjects').optional({ checkFalsy: true }).isArray(),
  body('joiningDate').optional({ checkFalsy: true }).trim().escape().isISO8601().toDate(),
  body('academicYear').optional({ checkFalsy: true }).trim().escape(),
  body('academicSession').optional({ checkFalsy: true }).trim().escape(),
  body('batch').optional({ checkFalsy: true }).trim().escape(),
  body('currentSemester').optional({ checkFalsy: true }).trim().escape(),

  // --- Status Booleans ---
  body('isEnrolled').optional({ checkFalsy: true }).isBoolean(),
  body('isPromoted').optional({ checkFalsy: true }).isBoolean(),
  body('isAlumni').optional({ checkFalsy: true }).isBoolean(),

  // --- Hostel / Transport ---
  body('isHostelResident').optional({ checkFalsy: true }).isBoolean(),
  body('hostelJoiningDate').optional({ checkFalsy: true }).trim().escape().isISO8601().toDate(),
  body('hostelWithinCampus').optional({ checkFalsy: true }).isBoolean(),
  body('hostelDurationMonths').optional({ checkFalsy: true }).isInt({ min: 0 }),
  body('isTransportResident').optional({ checkFalsy: true }).isBoolean(),

  // --- Hobbies & Interests ---
  body('hobby').optional({ checkFalsy: true }).trim().escape(),
  body('interest').optional({ checkFalsy: true }).trim().escape(),

  // --- Fees ---
  body('feesDue').optional({ checkFalsy: true }).isNumeric(),

  // --- Bank Details ---
  body('bankAccountNumber').optional({ checkFalsy: true }).trim().escape(),
  body('ifscCode').optional({ checkFalsy: true }).trim().escape(),
  body('bankName').optional({ checkFalsy: true }).trim().escape(),
  body('bankBranch').optional({ checkFalsy: true }).trim().escape(),
  body('isAadhaarLinkedToBank').optional({ checkFalsy: true }).isBoolean(),

  // --- Login ---
  body('password')
    .optional({ checkFalsy: true })
    .trim()
    .escape()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

const attendanceValidator = [
  // --- Student Reference ---
  body('student')
    .trim()
    .escape()
    .notEmpty()
    .isMongoId()
    .withMessage('Invalid student ID'),

  // --- Subject Name ---
  body('subject')
    .trim()
    .escape()
    .notEmpty()
    .isLength({ min: 2, max: 100 }),

  // --- Attendance Counts ---
  body('attended')
    .optional({ checkFalsy: true })
    .isInt({ min: 0 })
    .withMessage('Attended classes must be a non-negative integer'),

  body('totalClasses')
    .optional({ checkFalsy: true })
    .isInt({ min: 0 })
    .withMessage('Total classes must be a non-negative integer'),

  // --- Daily Records ---
  body('dailyRecords')
    .optional({ checkFalsy: true })
    .isArray()
    .withMessage('Daily records must be an array'),

  body('dailyRecords.*.date')
    .notEmpty()
    .isISO8601()
    .toDate()
    .withMessage('Each record must have a valid date'),

  body('dailyRecords.*.status')
    .trim()
    .escape()
    .notEmpty()
    .isIn(['Present', 'Absent'])
    .withMessage('Each record status must be either Present or Absent'),
];


const documentValidator = [
  // --- Student Reference ---
  body('student')
    .trim()
    .escape()
    .isMongoId()
    .withMessage('Invalid student ID'),

  // --- Document Name (optional) ---
  body('name')
    .optional({ checkFalsy: true })
    .trim()
    .escape()
    .isLength({ max: 255 }),

  // --- Document Type ---
  body('type')
    .trim()
    .escape()
    .isIn(['photo', 'pdf'])
    .withMessage('Type must be either photo or pdf'),

  // --- Document URL ---
  body('url')
    .trim()
    .escape()
    .isURL()
    .withMessage('URL must be a valid link'),

  // --- Uploaded At (optional override) ---
  body('uploadedAt')
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate()
];

const resultValidator = [
  // --- Student Reference ---
  body('student')
    .trim()
    .escape()
    .notEmpty()
    .isMongoId()
    .withMessage('Invalid student ID'),

  // --- Exam Type ---
  body('examType')
    .trim()
    .escape()
    .notEmpty()
    .isIn([
      'Monthly Achievement Test (MAT)',
      'Cumulative Achievement Test (CAT)',
      'Test Examination',
      'Practice Test Series (PTS)',
      'Very Similar Test (VST)',
      'Annual Examination'
    ])
    .withMessage('Invalid exam type'),

  // --- Year & Month ---
  body('year')
    .notEmpty()
    .isInt({ min: 2000, max: new Date().getFullYear() + 1 }),
    
  body('month')
    .trim()
    .escape()
    .notEmpty()
    .isLength({ min: 3, max: 15 }),

  // --- Subjects (Array of subjectScoreSchema) ---
  body('subjects')
    .isArray({ min: 1 })
    .withMessage('Subjects must be a non-empty array'),

  body('subjects.*.name')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Subject name is required'),

  body('subjects.*.theoryMarks')
    .notEmpty()
    .isFloat({ min: 0 })
    .withMessage('Theory marks must be a number'),

  body('subjects.*.theoryMaxMarks')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 }),

  body('subjects.*.theoryPercentage')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0, max: 100 }),

  body('subjects.*.hasLab')
    .optional({ checkFalsy: true })
    .isBoolean(),

  body('subjects.*.labMarks')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 }),

  body('subjects.*.labMaxMarks')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 }),

  body('subjects.*.labPercentage')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0, max: 100 }),

  body('subjects.*.grade')
    .optional({ checkFalsy: true })
    .trim()
    .escape()
    .isLength({ max: 5 }),

  // --- Totals & Grading (Optional) ---
  body('totalTheoryMarks')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 }),

  body('totalTheoryMaxMarks')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 }),

  body('totalLabMarks')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 }),

  body('totalLabMaxMarks')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 }),

  body('totalPercentage')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0, max: 100 }),

  body('sgpa')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0, max: 10 }),

  body('cgpa')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0, max: 10 }),

  // --- Date Recorded (optional override) ---
  body('dateRecorded')
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate()
];

const staffValidator = [
  // Required Fields
  body('name')
    .trim()
    .escape()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('email')
    .trim()
    .normalizeEmail({
      gmail_remove_subaddress: false, // keep subaddressing for Gmail
      gmail_remove_dots: false, // keep dots in Gmail addresses
    })
    .isEmail()
    .withMessage('Invalid email'),

  body('phone')
    .trim()
    .matches(/^\+[1-9]\d{6,14}$/)
    .withMessage('Phone must be in valid international E.164 format'),

  body('password')
    .trim()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),

  body('department')
    .trim()
    .escape()
    .isIn(['Academic', 'Residential', 'Kitchen', 'Library', 'Sports'])
    .withMessage('Invalid department'),

  // Optional Fields
  body('salary')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Salary must be a positive number'),

  body('qualifications.*')
    .optional()
    .trim()
    .escape()
    .isString(),

  body('yearsOfExperience')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Years of experience must be a non-negative number'),

  body('subjects.*')
    .optional()
    .trim()
    .escape()
    .isString(),
  body('aadharNumber')
    .optional()
    .trim()
    .escape()
    .isLength({ min: 12, max: 12 }),
  body('panNumber')
    .optional()
    .trim()
    .escape()
    .isLength({ min: 10, max: 10 }),
  body('designation')
    .optional()
    .trim()
    .escape()
    .isString(),

  body('classAssigned.*')
    .optional()
    .trim()
    .escape()
    .isString(),

  body('joiningDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid joining date'),

  body('employmentType')
    .optional()
    .trim()
    .escape()
    .isIn(['Permanent', 'Contract', 'Part-Time'])
    .withMessage('Invalid employment type'),

  body('skills.*')
    .optional()
    .trim()
    .escape()
    .isString(),

  body('certifications.*')
    .optional()
    .trim()
    .escape()
    .isString(),

  body('achievements.*')
    .optional()
    .trim()
    .escape()
    .isString(),

  body('academicDetails.*.examination')
    .optional()
    .trim()
    .escape()
    .isString(),

  body('academicDetails.*.boardOrUniversity')
    .optional()
    .trim()
    .escape()
    .isString(),

  body('academicDetails.*.yearOfPassing')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() }),

  body('academicDetails.*.divisionOrGrade')
    .optional()
    .trim()
    .escape()
    .isString(),

  body('researchProjectsCompleted.*')
    .optional()
    .trim()
    .escape()
    .isString(),

  body('ongoingProjects.*')
    .optional()
    .trim()
    .escape()
    .isString(),

  body('researchScholars.completedPhD')
    .optional()
    .isInt({ min: 0 }),

  body('researchScholars.continuingPhD')
    .optional()
    .isInt({ min: 0 }),

  body('researchScholars.completedMPhil')
    .optional()
    .isInt({ min: 0 }),

  body('researchScholars.continuingMPhil')
    .optional()
    .isInt({ min: 0 }),

  body('awardsReceived.*')
    .optional()
    .trim()
    .escape()
    .isString(),

  body('booksPublished')
    .optional()
    .isInt({ min: 0 }),

  body('researchPapers.published')
    .optional()
    .isInt({ min: 0 }),

  body('researchPapers.communicated')
    .optional()
    .isInt({ min: 0 }),

  body('presentAddress')
    .optional()
    .trim()
    .escape()
    .isString(),

  body('contactInfo.altPhone')
    .optional()
    .trim()
    .matches(/^\+[1-9]\d{6,14}$/)
    .withMessage('Alternate phone must be in valid E.164 format'),

  body('contactInfo.emailAlt')
    .optional()
    .trim()
    .isEmail()
    .normalizeEmail({
      gmail_remove_subaddress: false, // keep subaddressing for Gmail
      gmail_remove_dots: false, // keep dots in Gmail addresses
    })
    .withMessage('Invalid alternate email'),
];

const validateStaffAccess = [
  body('staffId')
    .notEmpty().withMessage('Staff ID is required.')
    .isMongoId().withMessage('Invalid Staff ID.'),

  body('roles')
    .isArray({ min: 1 }).withMessage('At least one role must be provided.'),

  body('roles.*.name')
    .trim().escape()
    .notEmpty().withMessage('Role name is required.')
    .isLength({ min: 2, max: 50 }).withMessage('Role name must be between 2 and 50 characters.'),

  body('roles.*.description')
    .optional()
    .trim().escape()
    .isLength({ max: 300 }).withMessage('Description too long.'),

  body('roles.*.permissions')
    .isArray().withMessage('Permissions must be an array.'),

  body('roles.*.permissions.*')
    .trim().escape()
    .notEmpty().withMessage('Permission string cannot be empty.'),

  body('assignedBy')
    .optional()
    .isMongoId().withMessage('Invalid assigning staff ID.'),
];


const validateLogin = [
  body('identifier')
    .normalizeEmail({
      gmail_remove_subaddress: false, // keep subaddressing for Gmail
      gmail_remove_dots: false, // keep dots in Gmail addresses
    })
    .isEmail().withMessage('Invalid email format')
    .escape()
    .trim()
    .notEmpty().withMessage('Email is required.'),

  body('password')
    .escape()
    .trim()
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
];


const adminValidator = [
  body('adminID')
    .trim()
    .escape()
    .optional()
    .isLength({ min: 3, max: 20 }).withMessage('Admin ID must be between 3 and 20 characters.'),

  body('name')
    .trim()
    .escape()
    .notEmpty().withMessage('Name is required.')
    .isLength({ min: 3, max: 50 }).withMessage('Name must be between 3 and 50 characters.'),

  body('email')
    .trim()
    .normalizeEmail({
      gmail_remove_subaddress: false, // keep subaddressing for Gmail
      gmail_remove_dots: false, // keep dots in Gmail addresses
    })
    .isEmail().withMessage('Invalid email format.'),

  body('phone')
    .trim()
    .escape()
    .notEmpty().withMessage('Phone number is required.')
    .matches(/^\d{10,15}$/).withMessage('Phone number must be between 10 and 15 digits.'),

  body('role')
    .trim()
    .escape()
    .optional()
    .isIn(['Super Admin', 'Admin']).withMessage('Invalid role selected.'),

  body('password')
    .trim()
    .optional()
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),

  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be true or false.'),
];



const validateCourseUpload = [
  body('courseName')
    .trim()
    .escape()
    .notEmpty().withMessage('Course name is required')
    .isLength({ max: 100 }).withMessage('Course name too long'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.validationErrors = errors.array();
    }
    next();
  }
];

const leaveValidator = [
  body('reason').trim().escape().notEmpty().withMessage('Reason is required'),
  body('fromDate').notEmpty().withMessage('Start date is required').isISO8601(),
  body('toDate').notEmpty().withMessage('End date is required').isISO8601()
];

const assignmentValidator = [
  body('title').trim().escape().notEmpty().withMessage('Title is required'),
  body('classAssigned').trim().escape().notEmpty().withMessage('Class is required'),
  body('submissionDate').isISO8601().withMessage('Valid submission date required'),
];

const validateNotice = [
  body('description')
    .trim()
    .escape()
    .notEmpty().withMessage('Description is required.')
];

const validateClassSchedule = [
  body('classAssigned')
    .trim()
    .escape()
    .notEmpty().withMessage('Class Assigned is required'),

  // You can optionally validate file uploads by multer separately
];


const staffFaceValidator = [
  body('name')
    .trim().escape()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),

  body('email')
    .trim().normalizeEmail({
      gmail_remove_subaddress: false, // keep subaddressing for Gmail
      gmail_remove_dots: false, // keep dots in Gmail addresses
    })
    .isEmail().withMessage('Please provide a valid email'),

  body('encoding')
    .custom((value) => {
      if (!Array.isArray(value)) {
        throw new Error('Encoding must be an array');
      }
      if (value.length !== 128) {
        throw new Error('Encoding must be exactly 128 numbers');
      }
      if (!value.every(n => typeof n === 'number')) {
        throw new Error('Encoding must contain only numbers');
      }
      return true;
    })
];

const staffAttendanceValidator = [
  body('staff')
    .notEmpty().withMessage('Staff ID is required')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid Staff ID'),

  body('date')
    .notEmpty().withMessage('Date is required')
    .isISO8601().withMessage('Date must be in a valid ISO8601 format (YYYY-MM-DD)')
    .toDate(),

  body('status')
    .optional()
    .isIn(['Present', 'Absent', 'Late', 'Half-Day'])
    .withMessage('Invalid status'),

  body('checkInTime')
    .optional()
    .isISO8601().withMessage('Check-in time must be a valid date-time')
    .toDate(),

  body('checkOutTime')
    .optional()
    .isISO8601().withMessage('Check-out time must be a valid date-time')
    .toDate(),

  body('markedBy')
    .optional()
    .isIn(['FaceSystem', 'Manual'])
    .withMessage('markedBy must be FaceSystem or Manual')
    .default('Manual') // For manual attendance override
];

const addEventValidator = [
  body('title')
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage('Title required'),

  body('description')
    .optional()
    .trim()
    .escape(),

  body('start')
    .trim()
    .isISO8601({ strict: false })
    .withMessage('Invalid start date'),

  body('end')
    .optional()
    .trim()
    .isISO8601({ strict: false })
    .withMessage('Invalid end date'),

  body('allDay')
    .optional()
    .toBoolean(),

  body('startTime')
    .optional()
    .trim()
    .matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/) // "HH:mm"
    .withMessage('Invalid start time'),

  body('endTime')
    .optional()
    .trim()
    .matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Invalid end time'),

  body('type')
    .optional()
    .trim()
    .escape()
    .isIn(['holiday','exam','program','meeting','webinar','observance','practical','other'])
    .withMessage('Invalid event type'),

  body('color')
    .optional()
    .trim()
    .escape()
    .isString(),

  body('batches')
    .optional()
    .isArray()
    .withMessage('batches must be array'),

  body('batches.*')
    .optional()
    .trim()
    .escape()
];

/* ---------- Create Curriculum (Principal) ---------- */
const createCurriculumValidator = [
  check('subject')
    .trim()
    .escape()
    .isIn(SUBJECTS)
    .withMessage('Invalid subject'),
  check('unit')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Unit required'),
  check('chapter')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Chapter required'),
  check('topic')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Topic required'),
  check('subtopic')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Subtopic required'),
  check('numberOfDays')
    .optional()
    .toInt()
    .isInt({ min: 0 })
    .withMessage('numberOfDays must be a non-negative integer'),
  (req, res, next) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) {
      return res.status(422).json({ errors: errs.array() });
    }
    next();
  }
];

/* ---------- Teacher Progress Update ---------- */
const updateTeacherProgressValidator = [
  check('percentComplete')
    .optional()
    .toInt()
    .isInt({ min: 0, max: 100 })
    .withMessage('percentComplete must be between 0–100'),
  check('completed')
    .optional()
    .isBoolean()
    .withMessage('completed must be true/false'),
  check('notes')
    .optional()
    .trim()
    .escape(),
  (req, res, next) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) {
      return res.status(422).json({ errors: errs.array() });
    }
    next();
  }
];

/* ---------- Principal Review Update ---------- */
const updatePrincipalReviewValidator = [
  check('approved')
    .isBoolean()
    .withMessage('approved must be true/false'),
  check('comment')
    .optional()
    .trim()
    .escape(),
  (req, res, next) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) {
      return res.status(422).json({ errors: errs.array() });
    }
    next();
  }
];

const addInventoryValidators = [
  body('procurementId')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Procurement id is required'),

  // Validate array of items
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),

  body('items.*.itemName')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Item name is required'),

  body('items.*.unit')
    .trim()
    .escape()
    .optional()
    .isLength({ max: 50 })
    .withMessage('Unit too long'),

  body('items.*.quantity')
    .notEmpty()
    .withMessage('Quantity required')
    .isInt({ min: 0 })
    .withMessage('Quantity must be an integer >= 0'),

  body('items.*.pricePerUnit')
    .notEmpty()
    .withMessage('Price required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a number >= 0'),
];

const removeItemValidators = [
  param('inventoryId')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Inventory id is required'),

  param('itemId')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Item id is required')
];

function uploadFilePresent(req, res, next) {
  if (!req.file) {
    return res.status(400).json({ errors: [{ msg: 'File is required' }] });
  }
  next();
}

const budgetValidator = [
    body('department').notEmpty().trim().escape(),
    body('allocatedAmount').isNumeric().withMessage('Must be a number'),
  ]


module.exports = { studentValidator, attendanceValidator, documentValidator, resultValidator, staffValidator, validateStaffAccess, validateLogin, adminValidator, validateCourseUpload, leaveValidator, assignmentValidator, validateNotice, validateClassSchedule, staffFaceValidator, staffAttendanceValidator, addEventValidator, createCurriculumValidator, updateTeacherProgressValidator, updatePrincipalReviewValidator, addInventoryValidators, removeItemValidators, uploadFilePresent, budgetValidator };
