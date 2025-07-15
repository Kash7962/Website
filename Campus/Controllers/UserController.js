const bcrypt = require('bcryptjs');
const User = require('../models/user'); // Adjust path if needed
const jwt = require('jsonwebtoken');

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
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
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

    const newUser = new User({
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

    // Convert email to lowercase and find user
    const user = await User.findOne({ email: identifier.toLowerCase() });

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


module.exports = { registerUser, loginUser};
