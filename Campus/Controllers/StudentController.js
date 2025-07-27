const { validationResult } = require('express-validator');
const { Student } = require('../models/student');
const { OAuth2Client } = require('google-auth-library');
const bcrypt = require('bcryptjs');
const { StudentSession } = require('../models/session_student'); // Adjust path if needed
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret';
const CLIENT_URL = process.env.CLIENT_URL 


// Controller to render the admission form
const showRegistrationForm = (req, res) => {
  res.render('Student/admissionForm');
};

// Controller to handle form submission
const submitAdmissionForm = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const student = new Student(req.body);
    await student.save();
    res.status(200).json({ message: 'Admission form submitted successfully!' });
  } catch (err) {
    console.error('Error saving student:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const loginUser = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    // console.log(identifier, password);
    // Convert email to lowercase and find user
    const user = await Student.findOne({ studentEmail: identifier.toLowerCase() });
    // console.log(user)
    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    // For Google-based users with no password, block login via form
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (!user.isEnrolled) {
      return res.status(401).json({ message: 'User not enrolled.' });
    }
    // Generate JWT
    const token = jwt.sign(
      {
        _id: user._id,
        email: user.studentEmail,
        phone: user.studentPhone,
        username: user.firstName,
        isEnrolled: user.isEnrolled,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    await StudentSession.create({
    userId: user._id,
    name: user.firstName,
    registration_number: user.registration_number,
    email: user.studentEmail,
    loginTime: new Date(),
    isStudent: true,
    method: 'email', // or 'google'
    token,
    ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress || '',
    userAgent: req.headers['user-agent'] || '',
});
     res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1 * 60 * 60 * 1000, // 1 hours
    });

    res.status(200).json({
      message: 'Login successful.',
      token,
      // user: {
      //   id: user._id,
      //   username: user.username,
      //   email: user.email,
      //   phone: user.phone,
      //   department: user.department,
      //   isAuthorized: user.isAuthorized,
      // }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

const logout = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  await StudentSession.findOneAndUpdate(
    { token },
    { logoutTime: new Date(), isActive: false }
  );

  res.clearCookie('token', {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  });
  res.json({ message: 'Logged out successfully' });
};


const googleLogin = async (req, res) => {
  try {
    const { tokenId } = req.body;
    if (!tokenId) {
      return res.status(400).json({ message: 'Google token missing.' });
    }

    // Verify token with Google
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;

    if (!email) {
      return res.status(400).json({ message: 'Google email not found.' });
    }

    // Check if user already exists
    let user = await Student.findOne({ studentEmail: email });

    if (!user) {
      // Auto-register Google user
      res.status(201).json({ message: 'User not found. Please register first.' });
    }

    // Generate JWT
    if (!user.isEnrolled) {
      return res.status(401).json({ message: 'User not enrolled.' });
    }
    // Generate JWT
    const token = jwt.sign(
      {
        _id: user._id,
        email: user.studentEmail,
        phone: user.studentPhone,
        username: user.firstName,
        isEnrolled: user.isEnrolled,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

   await StudentSession.create({
    userId: user._id,
    name: user.firstName,
    registration_number: user.registration_number,
    email: user.studentEmail,
    loginTime: new Date(),
    isStudent: true,
    method: 'email', // or 'google'
    token,
    ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress || '',
    userAgent: req.headers['user-agent'] || '',
});

     res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1 * 60 * 60 * 1000, // 1 hours
    });

    return res.status(200).json({
      message: 'Google login successful.',
      token,
      // user: {
      //   id: user._id,
      //   username: user.username,
      //   email: user.email,
      //   phone: user.phone,
      //   department: user.department,
      //   isAuthorized: user.isAuthorized,
      // },
    });

  } catch (err) {
    console.error('Google login error:', err);
    res.status(500).json({ message: 'Google login failed.' });
  }
};


const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user exists
    const user = await Student.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found with that email.' });
    }

    // Create JWT token valid for 15 minutes
    const token = jwt.sign(
      { id: user._id },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Create reset URL
    const resetUrl = `${CLIENT_URL}/Student/reset-password?token=${token}`;

    // Email content
    const html = `
      <h2>Password Reset Request</h2>
      <p>Click the link below to reset your password. This link is valid for 15 minutes.</p>
      <a href="${resetUrl}" target="_blank">${resetUrl}</a>
      <p>If you didn't request this, you can ignore this email.</p>
    `;

    // Nodemailer config
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,      // your email
        pass: process.env.EMAIL_PASS       // app password or email password
      }
    });

    // Send email
    await transporter.sendMail({
      to: user.email,
      from: `"Support Team" <${process.env.EMAIL_USER}>`,
      subject: 'Reset Your Password',
      html
    });

    res.status(200).json({ message: 'Password reset link sent to your email.' });

  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error. Try again later.' });
  }
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Missing reset token.' });
  }

  try {
    // Verify token and extract user ID
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    // Find user
    const user = await Student.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password reset successful. Please login with your new password.' });

  } catch (err) {
    console.error('Reset password error:', err);

    if (err.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Reset token has expired. Please request a new one.' });
    }

    res.status(400).json({ message: 'Invalid or expired token.' });
  }
};

const changePassword = async (req, res) => {
  const { _id, currentPassword, newPassword } = req.body;

  try {
    const user = await Student.findById(_id); // or User.findById
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Password change error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  showRegistrationForm,
  submitAdmissionForm,
  loginUser,
  changePassword,
  googleLogin,
  forgotPassword,
  resetPassword,
  logout,
};
