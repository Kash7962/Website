const { OAuth2Client } = require('google-auth-library');
const bcrypt = require('bcryptjs');
const { Staff } = require('../models/staff'); // Adjust path if needed
const Session_Staff = require('../models/session_staff'); // Adjust path if needed
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const { Admin } = require('../models/admin')
const Session_Admin = require('../models/session_admin')
// const {Staff} = require('../models/staff');
const ActivityLog = require('../models/activityLog');
dotenv.config();

// const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
 const client = new OAuth2Client({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET, // ✅ Required
      redirectUri: 'postmessage',
    });
// const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret';
// const CLIENT_URL = process.env.CLIENT_URL 

const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      department,
      isAuthorized = false,
    } = req.body;

    // Check if email or phone already exists
    const existingUser = await Staff.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).render('error/error', {
      message: 'Email or phone already in use.'});
    }

    let hashedPassword = '';
    const salt = await bcrypt.genSalt(10);
    hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new Staff({
      name,
      email,
      phone,
      password: hashedPassword || '', // Store empty if Google user without password
      department,
      isAuthorized,
    });

    await newUser.save();
    // const user = await Staff.findById(req.user._id);
        await ActivityLog.create({
          // userId : newUser._id,
          userModel: 'Staff',
          name: newUser.name,
          email: newUser.email,
          action: `Registered new user: ${newUser.name}`,
          // targetModel: 'Student',
          // targetId: student._id,
          // targetname: `${student.firstName} ${student.middleName} ${student.lastName}`,
          // targetEmail: student.studentEmail,
          // registrationNumber: student.registration_number,
          // classAssigned: student.classAssigned
        });
    res.status(201).json({
      message: 'User registered successfully.',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        department: newUser.department,
        isAuthorized: newUser.isAuthorized,
      },
    });

  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).render('error/error', {
      message: 'Server error. Please try again later.'
    });

  }
};


const loginUser = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).render('error/error', {
      message: 'Email and password are required.'
    });
    }
    // console.log(identifier, password);
    // Convert email to lowercase and find user
     const email = identifier.toLowerCase();

    // Try finding in Staff first
    let user = await Staff.findOne({ email });
    let role = 'Staff';

    if (!user) {
      user = await Admin.findOne({ email });
      role = 'Admin';
    }

    if (!user) {
      return res.status(404).render('error/error', {
        message: 'User not found.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).render('error/error', {
        message: 'Invalid credentials.'
      });
    }

    // Authorization check
    if (role === 'Staff' && !user.isAuthorized) {
      return res.status(401).render('error/error', {
        message: 'User not authorized.'
      });
    }

    if (role === 'Admin' && !user.isActive) {
      return res.status(401).render('error/error', {
        message: 'Admin is not active.'
      });
    }

    let token;

    if (role === 'Staff'){
    // Generate JWT
    token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        department: user.department,
        isAuthorized: user.isAuthorized,
      },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    await Session_Staff.create({
    userId: user._id,
    name: user.name,
    email: user.email,
    department: user.department,
    loginTime: new Date(),
    method: 'email', // or 'email'
    token,
    ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress || '',
    userAgent: req.headers['user-agent'],
    });
    } 

    if (role === 'Admin') {
       token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
      },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    await Session_Admin.create({
    userId: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    loginTime: new Date(),
    method: 'email', // or 'email'
    token,
    ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress || '',
    userAgent: req.headers['user-agent'],
    });

    }
     res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
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
    return res.status(500).render('error/error', {
       message: 'Server error. Please try again.'
    });
  }
};

const logout = async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(400).json({ message: 'Token missing.' });
    }

    // Decode token to identify role
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded?.department) {
      // Staff logout
      await Session_Staff.findOneAndUpdate(
        { token },
        { logoutTime: new Date(), isActive: false }
      );
    } else if (decoded?.role) {
      // Admin logout
      await Session_Admin.findOneAndUpdate(
        { token },
        { logoutTime: new Date(), isActive: false }
      );
    }

    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return res.status(200).json({ message: 'Logged out successfully.' });

  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ message: 'Logout failed.' });
  }
};


const googleLogin = async (req, res) => {
   try {
    const { tokenId } = req.body;
    if (!tokenId) {
      return res.status(400).json({ success: false, message: 'Access token not provided.' });
    }

    // Fetch user info from Google using access token
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenId}`,
      },
    });

    if (!userInfoRes.ok) {
      return res.status(401).json({ success: false, message: 'Invalid Google token.' });
    }

    const userInfo = await userInfoRes.json();

    const { email, name, sub: googleId } = userInfo;

    if (!email) {
      return res.status(404).render('error/error', {
        message: 'Google email not found. Please try again.'
      });
    }

    // Check for Staff
    let user = await Staff.findOne({ email });
    let role = 'Staff';

    if (!user) {
      // Optional: Support Admin Google login if needed
      user = await Admin.findOne({ email });
      role = 'Admin';
    }

    if (!user) {
      return res.status(404).render('error/error', {
        message: 'User not found. Please register first.'
      });
    }

    // Authorization checks
    if (role === 'Staff' && !user.isAuthorized) {
      return res.status(401).render('error/error', {
        message: 'User not authorized.'
      });
    }

    if (role === 'Admin' && !user.isActive) {
      return res.status(401).render('error/error', {
        message: 'Admin is not active.'
      });
    }

    let token;

    if (role === 'Staff') {
      token = jwt.sign(
        {
          _id: user._id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          department: user.department,
          isAuthorized: user.isAuthorized,
        },
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
      );

      await Session_Staff.create({
        userId: user._id,
        name: user.name,
        email: user.email,
        department: user.department,
        loginTime: new Date(),
        method: 'google',
        token,
        ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress || '',
        userAgent: req.headers['user-agent'],
      });

    } else if (role === 'Admin') {
      token = jwt.sign(
        {
          _id: user._id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive,
        },
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
      );

      await Session_Admin.create({
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        loginTime: new Date(),
        method: 'google',
        token,
        ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress || '',
        userAgent: req.headers['user-agent'],
      });
    }

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
    });

    return res.status(200).json({
      message: 'Google login successful.',
      token,
    });

  } catch (err) {
    console.error('Google login error:', err);
    return res.status(500).render('error/error', {
      message: 'Google login failed. Please try again later.'
    });
  }
};


const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).render('error/error', {
        message: 'Email is required.'
      });
    }

    // Check if user exists in Staff
    let user = await Staff.findOne({ email: email.toLowerCase().trim() });
    let role = 'Staff';

    if (!user) {
      // If not in Staff, check Admin
      user = await Admin.findOne({ email: email.toLowerCase().trim() });
      role = 'Admin';
    }

    if (!user) {
      return res.status(404).render('error/error', {
        message: 'No account found with that email.'
      });
    }

    // Create JWT token valid for 15 minutes
    const token = jwt.sign(
      { id: user._id, role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Create reset URL (route depends on role)
    const resetUrl = `${process.env.CLIENT_URL}/Staff/reset-password?token=${token}`;

    // Email content
    const html = `
      <h2>Password Reset Request</h2>
      <p>Click the link below to reset your ${role} password. This link is valid for 15 minutes.</p>
      <a href="${resetUrl}" target="_blank">${resetUrl}</a>
      <p>If you didn't request this, you can ignore this email.</p>
    `;

    // Nodemailer config
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Send email
    await transporter.sendMail({
      to: user.email,
      from: `"Support Team" <${process.env.EMAIL_USER}>`,
      subject: 'Reset Your Password',
      html
    });

    return res.status(200).json({ message: 'Password reset link sent to your email.' });

  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).render('error/error', {
      message: 'Server error. Try again later.'
    });
  }
};


const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token) {
    return res.status(400).render('error/error', {
      message: 'Missing reset token.'
    });
  }

  try {
    // Verify token and extract payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const role = decoded.role;

    // Validate role
    if (!role || !['Staff', 'Admin'].includes(role)) {
      return res.status(400).render('error/error', {
        message: 'Invalid role provided in token.'
      });
    }

    // Find user by role
    const Model = role === 'Staff' ? Staff : Admin;
    const user = await Model.findById(userId);

    if (!user) {
      return res.status(404).render('error/error', {
        message: 'User not found. Please try again.'
      });
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      message: 'Password reset successful. Please login with your new password.'
    });

  } catch (err) {
    console.error('Reset password error:', err);

    if (err.name === 'TokenExpiredError') {
      return res.status(400).render('error/error', {
        message: 'Reset token has expired. Please request a new one.'
      });
    }

    return res.status(400).render('error/error', {
      message: 'Invalid or expired token.'
    });
  }
};


const changePassword = async (req, res) => {
  const { _id, currentPassword, newPassword, role, department } = req.body;

  try {
    let Model;
    let userModelName;
    if (role === 'Admin' || role === 'Super Admin') {
      Model = Admin;
      userModelName = 'Admin';
    } else if (role === 'Staff' || department) {
      Model = Staff;
      userModelName = 'Staff';
    } else {
      return res.status(400).render('error/error', {
        message: 'Invalid role or department. Please try again.'
      });
    }

    const user = await Model.findById(_id);
    if (!user) {
      return res.status(401).render('error/error', {
        message: 'User not found. Please try again.'
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).render('error/error', {
        message: 'Incorrect current password. Please try again.'
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    // const user = await Staff.findById(req.user._id);
        await ActivityLog.create({
          userId : user._id,
          userModel: userModelName,
          name: user.name,
          email: user.email,
          action: `Password changed`,
          // targetModel: 'Student',
          // targetId: student._id,
          // targetname: `${student.firstName} ${student.middleName} ${student.lastName}`,
          // targetEmail: student.studentEmail,
          // registrationNumber: student.registration_number,
          // classAssigned: student.classAssigned
        });
    return res.status(200).json({ message: 'Password changed successfully.' });

  } catch (err) {
    console.error('Change password error:', err);
    return res.status(500).render('error/error', {
      message: 'Error changing password. Please try again later.'
    });
  }
};

const getStaffProfile = async (req, res) => {
  try {
    const staffId = req.user._id; // comes from verifyToken middleware
    const staff = await Staff.findById(staffId);

    if (!staff) {
      return res.status(404).render('error/error', { message: 'Staff not found' });
    }

    res.render('Staff/profile', { staff });
  } catch (err) {
    console.error('Error fetching staff profile:', err);
    res.status(500).render('error/error', { message: 'Unable to load profile' });
  }
};

module.exports = { registerUser, loginUser, logout, googleLogin, forgotPassword, resetPassword, changePassword, getStaffProfile };
