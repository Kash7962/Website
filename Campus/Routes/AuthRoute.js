const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/middleware');

router.post('/verify-token', verifyToken, (req, res) => {
  res.status(200).json({
    message: 'Token is valid',
    // user: req.user // decoded token payload
  });
});

module.exports = router;