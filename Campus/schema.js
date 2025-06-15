const { body } = require('express-validator');

const admissionValidator = [
  body('course').isIn(['+2 (Science)', '+3 (Science)', 'Vocational Skill Development']),

  body('firstName').trim().notEmpty().isLength({ max: 100 }),
  body('middleName').trim().optional({ checkFalsy: true }).isLength({ max: 100 }),
  body('lastName').trim().notEmpty().isLength({ max: 100 }),
  body('gender').isIn(['male', 'female']),
  body('dob').isISO8601().toDate(),

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

module.exports = { admissionValidator };
