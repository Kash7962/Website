const jwt = require('jsonwebtoken');
const Session_Staff = require('../models/session_staff'); // Adjust path as needed
const Session_Admin = require('../models/session_admin'); // Adjust path as needed

const verifyToken = async (req, res, next) => {
  const cookieToken = req.cookies.token;
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  // If one or both tokens are missing, deny access
  if (!cookieToken || !bearerToken) {
    return res.status(401).render('error/error', { message: 'Access denied!' });
  }
  // console.log("cookieToken:", cookieToken);
  // Function to verify token and handle expiry
  const tryVerify = async (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // console.log(decoded?.role)
      return { success: true, decoded };
      
    } catch (err) {
      console.error('Token verification failed:', err);
      
      if (err.name === 'TokenExpiredError') {
        try {
          const decoded2 = jwt.verify(token, process.env.JWT_SECRET);
          if (decoded2?.role == 'Super Admin' || decoded2?.role == 'Admin'){
             await Session_Admin.findOneAndUpdate(
              { token },
            {
              logoutTime: new Date(),
              isActive: false
            }
          );
          }
          else {
          await Session_Staff.findOneAndUpdate(
            { token },
            {
              logoutTime: new Date(),
              isActive: false
            }
          );
        }
        } catch (dbErr) {
          console.error('Failed to update session on token expiry:', dbErr);
        }
      }

      return { success: false };
    }
  };

  // Verify both tokens
  const cookieResult = await tryVerify(cookieToken);
  const bearerResult = await tryVerify(bearerToken);

  if (!cookieResult.success || !bearerResult.success) {
    return res.status(403).render('error/error', {
      message: 'Invalid or expired token(s). Please login again.'
    });
  }

  // If both tokens are valid, proceed
  req.user = cookieResult.decoded; // You can also merge both if needed
  next();
};

module.exports = { verifyToken };
