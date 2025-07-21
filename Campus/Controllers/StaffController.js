const { OAuth2Client } = require('google-auth-library');
const bcrypt = require('bcryptjs');
const Staff = require('../models/staff'); // Adjust path if needed
const Session = require('../models/session'); // Adjust path if needed
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret';
const CLIENT_URL = process.env.CLIENT_URL 

const registerUser = async (req, res) => {
  try {
    const {
      username,
      email,
      phone,
      password,
      isGoogle = false,
      isAuthorized = false,
    } = req.body;

    // Check if email or phone already exists
    const existingUser = await Staff.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Email or phone already in use.' });
    }

    let hashedPassword = '';
    if (!isGoogle && password) {
      // Hash password for email/password users
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    } else if (isGoogle && password) {
      // Optionally hash password for Google users if provided
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    const newUser = new Staff({
      username,
      email,
      phone,
      password: hashedPassword || '', // Store empty if Google user without password
      isGoogle,
      isAuthorized,
    });

    await newUser.save();

    res.status(201).json({
      message: 'User registered successfully.',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        phone: newUser.phone,
        isGoogle: newUser.isGoogle,
        isAuthorized: newUser.isAuthorized,
      },
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error. Please try again later.' });
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
    const user = await Staff.findOne({ email: identifier.toLowerCase() });
    // console.log(user)
    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    // For Google-based users with no password, block login via form
    if (user.isGoogle && !user.password) {
      return res.status(403).json({
        message: 'This account is linked with Google. Please log in with Google.',
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        phone: user.phone,
        username: user.username,
        isGoogle: user.isGoogle,
        isAuthorized: user.isAuthorized,
      },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    await Session.create({
    userId: user._id,
    name: user.username,
    email: user.email,
    loginTime: new Date(),
    method: 'email', // or 'email'
    token,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
});


    res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        isGoogle: user.isGoogle,
        isAuthorized: user.isAuthorized,
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

const logout = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  await Session.findOneAndUpdate(
    { token },
    { logoutTime: new Date(), isActive: false }
  );

  res.clearCookie('token');
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
    let user = await Staff.findOne({ email });

    if (!user) {
      // Auto-register Google user
      user = new Staff({
        username: name || email.split('@')[0],
        email,
        phone: '',
        password: '', // No password for Google user
        isGoogle: true,
        isAuthorized: false, // Can be true if you want to auto-authorize Google users
      });
      await user.save();
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        username: user.username,
        phone: user.phone,
        isGoogle: true,
        isAuthorized: user.isAuthorized,
      },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    // Save session
    await Session.create({
      userId: user._id,
      name: user.username,
      email: user.email,
      loginTime: new Date(),
      method: 'google',
      token,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return res.status(200).json({
      message: 'Google login successful.',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        isGoogle: user.isGoogle,
        isAuthorized: user.isAuthorized,
      },
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
    const user = await Staff.findOne({ email });
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
    const resetUrl = `${CLIENT_URL}/Staff/reset-password?token=${token}`;

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
    const user = await Staff.findById(userId);
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

module.exports = { registerUser, loginUser, logout, googleLogin, forgotPassword, resetPassword };
