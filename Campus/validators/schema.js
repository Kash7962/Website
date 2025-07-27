const { body, validationResult } = require('express-validator');

const studentValidator = [
  // Course
  body('course')
    .trim()
    .isIn(['+2 (Science)', '+3 (Science)', 'Vocational Skill Development'])
    .withMessage('Invalid course selection'),

  // Personal Info
  body('firstName')
    .trim()
    .notEmpty()
    .escape()
    .isLength({ max: 100 }),

  body('middleName')
    .trim()
    .escape()
    .optional({ checkFalsy: true })
    .isLength({ max: 100 }),

  body('lastName')
    .trim()
    .notEmpty()
    .escape()
    .isLength({ max: 100 }),

  body('gender')
    .trim()
    .escape()
    .isIn(['male', 'female']),

  body('studentEmail')
    .trim()
    .escape()
    .notEmpty()
    .isEmail()
    .normalizeEmail({
      gmail_remove_subaddress: false,
      gmail_remove_dots: false,
    }),

  body('dob')
    .trim()
    .escape()
    .isISO8601()
    .toDate(),

  body('studentPhone')
    .trim()
    .notEmpty()
    .isMobilePhone('any'),

  // Guardian Info
  body('guardian1Name')
    .trim()
    .escape()
    .notEmpty(),

  body('guardian1Relation')
    .trim()
    .escape()
    .isIn(['Father', 'Mother', 'Brother', 'Sister', 'Other']),

  body('guardian1Email')
    .trim()
    .escape()
    .optional({ checkFalsy: true })
    .isEmail()
    .normalizeEmail({
      gmail_remove_subaddress: false,
      gmail_remove_dots: false,
    }),

  body('guardian1Phone')
    .trim()
    .notEmpty()
    .isMobilePhone('any'),

  body('guardian2Name')
    .trim()
    .escape()
    .optional({ checkFalsy: true }),

  body('guardian2Relation')
    .trim()
    .escape()
    .optional({ checkFalsy: true })
    .isIn(['Father', 'Mother', 'Brother', 'Sister', 'Other']),

  // Address
  body('address1')
    .trim()
    .escape()
    .notEmpty(),

  body('address2')
    .trim()
    .escape()
    .optional({ checkFalsy: true }),

  body('city')
    .trim()
    .escape()
    .notEmpty(),

  body('state')
    .trim()
    .escape()
    .notEmpty(),

  body('zipcode')
    .trim()
    .matches(/^\d{5,10}$/)
    .withMessage('Zipcode must be between 5 to 10 digits'),

  body('country')
    .trim()
    .escape()
    .notEmpty(),

  // ====== Optional Organizational Fields ======
  body('registration_number')
    .trim()
    .escape()
    .optional({ checkFalsy: true }),

  body('classAssigned')
    .trim()
    .escape()
    .optional({ checkFalsy: true }),

  body('joiningDate')
    .trim()
    .escape()
    .optional({ checkFalsy: true }),

  body('academicYear')
    .trim()
    .escape()
    .optional({ checkFalsy: true }),

  body('batch')
    .trim()
    .escape()
    .optional({ checkFalsy: true }),

  body('academicSession')
    .trim()
    .escape()
    .optional({ checkFalsy: true }),

  body('feesDue')
    .optional({ checkFalsy: true })
    .isNumeric()
    .withMessage('Fees due must be a number'),

  body('currentSemester')
    .trim()
    .escape()
    .optional({ checkFalsy: true }),

  body('password')
    .trim()
    .escape()
    .optional({ checkFalsy: true }),

  body('isEnrolled')
    .optional({ checkFalsy: true })
    .isBoolean()
    .withMessage('isEnrolled must be true or false'),

  body('isPromoted')
    .optional({ checkFalsy: true })
    .isBoolean()
    .withMessage('isPromoted must be true or false'),

  body('isGraduated')
    .optional({ checkFalsy: true })
    .isBoolean()
    .withMessage('isGraduated must be true or false'),
];


const validateRegister = [
  // Basic Info
  body('username')
    .trim()
    .escape()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 2, max: 100 }).withMessage('Username must be between 2 and 100 characters'),

  body('email')
    .trim()
    .normalizeEmail({
      gmail_remove_subaddress: false, // keep subaddressing for Gmail
      gmail_remove_dots: false, // keep dots in Gmail addresses
    })
    .isEmail().withMessage('Invalid email address'),

  body('phone')
    .trim()
    .matches(/^\+[1-9]\d{6,14}$/).withMessage('Phone number must be in E.164 format (e.g., +1234567890)'),

  body('password')
    .notEmpty().withMessage('Password is required')
    .escape()
    .trim()
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),

  body('department')
    .trim()
    .isIn(['Teaching', 'Kitchen', 'Library', 'Management', 'Accounts']).withMessage('Invalid department'),

  // Optional: Sanitize and escape optional fields
  body('qualifications.*').optional().trim().escape(),
  body('subjects.*').optional().trim().escape(),
  body('designation').optional().trim().escape(),
  body('classAssigned.*').optional().trim().escape(),
  body('employmentType').optional().isIn(['Permanent', 'Contract', 'Part-Time']),
  body('skills.*').optional().trim().escape(),
  body('achievements.*').optional().trim().escape(),

  body('shiftTiming').optional().isIn(['Morning', 'Evening', 'Night']),
  body('areaAssigned').optional().trim().escape(),

  body('section').optional().isIn(['Reference', 'Circulation', 'Digital', 'Periodicals']),
  body('issuedBooksCount').optional().isNumeric(),
  body('isCatalogManager').optional().isBoolean(),

  body('role').optional().isIn(['Principal', 'Vice Principal', 'Director', 'Admin Officer']),
  body('responsibilities.*').optional().trim().escape(),

  body('financeLevel').optional().isIn(['Junior Accountant', 'Senior Accountant', 'Finance Manager']),
  body('certifications.*').optional().trim().escape(),
  body('managesPayroll').optional().isBoolean(),
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

module.exports = { studentValidator, validateRegister, validateLogin, validateCourseUpload, leaveValidator };
