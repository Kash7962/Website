const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.cookies.token; // Read token from cookie

  if (!token) {
    return res.status(401).json({ message: 'Access denied!!!' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify JWT
    req.user = decoded; // Attach decoded user info to request
    next(); // Proceed
  } catch (err) {
    console.error('Token verification failed:', err);
    return res.status(403).json({ message: 'Session expired!!!' });
  }
};

module.exports = { verifyToken };
