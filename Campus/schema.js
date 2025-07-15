const { body } = require('express-validator');

const admissionValidator = [
  body('course').isIn(['+2 (Science)', '+3 (Science)', 'Vocational Skill Development']),

  body('firstName').trim().notEmpty().isLength({ max: 100 }),
  body('middleName').trim().optional({ checkFalsy: true }).isLength({ max: 100 }),
  body('lastName').trim().notEmpty().isLength({ max: 100 }),
  body('gender').isIn(['male', 'female']),
  body('dob').isISO8601().toDate(),
  // body('studentCountryCode').notEmpty().isLength({ min: 2, max: 5 }),
  body('studentPhone').notEmpty().isMobilePhone('any').withMessage('Invalid student phone number'),

  body('guardian1Name').notEmpty(),
  body('guardian1Relation').isIn(['Father', 'Mother', 'Brother', 'Sister', 'Other']),
  body('guardian1Email').optional({ checkFalsy: true }).isEmail(),
  body('guardian1Phone').notEmpty().isMobilePhone('any').withMessage('Invalid guardian phone number'),

  body('guardian2Name').optional({ checkFalsy: true }),
  body('guardian2Relation').optional({ checkFalsy: true }).isIn(['Father', 'Mother', 'Brother', 'Sister', 'Other']),

  body('address1').notEmpty(),
  body('address2').optional({ checkFalsy: true }),
  body('city').notEmpty(),
  body('state').notEmpty(),
  body('zipcode').matches(/^\d{5,10}$/),
  body('country').notEmpty()
];

const validateRegister = [
  // Username: required, trimmed, escaped
  body('username')
    .trim()
    .escape()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 2, max: 100 }).withMessage('Username must be between 2 and 100 characters'),

  // Email: required, valid format
  body('email')
    .trim()
    .normalizeEmail({
      gmail_remove_subaddress: false, // keep subaddressing for Gmail
      gmail_remove_dots: false, // keep dots in Gmail addresses
    })
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email address'),

  // Phone: required, must match E.164 format
  body('phone')
    .trim()
    .matches(/^\+[1-9]\d{6,14}$/).withMessage('Phone number must be in E.164 format (e.g., +919876543210)'),

  // isGoogle: optional boolean
  body('isGoogle')
    .optional()
    .isBoolean().withMessage('isGoogle must be a boolean'),

  // isAuthorized: optional boolean
  body('isAuthorized')
    .optional()
    .isBoolean().withMessage('isAuthorized must be a boolean'),

  // Password: conditionally required
  body('password')
    .if((value, { req }) => !req.body.isGoogle || req.body.isGoogle === 'false') // not using Google
    .notEmpty().withMessage('Password is required for email/password signup')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

  // Always trim and escape password if it exists
  body('password')
    .optional()
    .trim()
    .escape(),

  // Confirm password: should match password (optional but recommended)
  body('confirmPassword')
    .optional()
    .trim()
    .custom((value, { req }) => {
      if (req.body.password && value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
];

const validateLogin = [
  body('identifier')
    .trim()
    .notEmpty().withMessage('Email or phone is required.'),

  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
];

module.exports = { admissionValidator, validateRegister, validateLogin };
