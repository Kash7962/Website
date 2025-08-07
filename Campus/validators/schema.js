const { body, validationResult } = require('express-validator');

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

  // --- Education History ---
  body('lastSchoolAttended').optional({ checkFalsy: true }).trim().escape(),
  body('matricBoard').optional({ checkFalsy: true }).trim().escape(),
  body('matricRollNo').optional({ checkFalsy: true }).trim().escape(),
  body('matricYear').optional({ checkFalsy: true }).isInt({ min: 1950, max: new Date().getFullYear() }),
  body('matricMarks').optional({ checkFalsy: true }).isObject(),
  body('matricMarks.MIL').optional({ checkFalsy: true }).isNumeric(),
  body('matricMarks.English').optional({ checkFalsy: true }).isNumeric(),
  body('matricMarks.TLH').optional({ checkFalsy: true }).isNumeric(),
  body('matricMarks.Science').optional({ checkFalsy: true }).isNumeric(),
  body('matricMarks.Math').optional({ checkFalsy: true }).isNumeric(),
  body('matricMarks.Physics').optional({ checkFalsy: true }).isNumeric(),
  body('matricMarks.Chemistry').optional({ checkFalsy: true }).isNumeric(),
  body('matricMarks.total').optional({ checkFalsy: true }).isNumeric(),
  body('matricMarks.percentage').optional({ checkFalsy: true }).isFloat({ min: 0, max: 100 }),

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
  body('isGraduated').optional({ checkFalsy: true }).isBoolean(),

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
    .notEmpty()
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
    .notEmpty()
    .isIn(['photo', 'pdf'])
    .withMessage('Type must be either photo or pdf'),

  // --- Document URL ---
  body('url')
    .trim()
    .escape()
    .notEmpty()
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

module.exports = { studentValidator, attendanceValidator, documentValidator, resultValidator, staffValidator, validateStaffAccess, validateLogin, adminValidator, validateCourseUpload, leaveValidator, assignmentValidator, validateNotice, validateClassSchedule };
