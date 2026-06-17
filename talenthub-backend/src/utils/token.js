// src/utils/token.js
const jwt = require('jsonwebtoken');

const signToken = (userId, role) =>
  jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id, user.role);

  res.status(statusCode).json({
    success: true,
    token,
    user,
  });
};

module.exports = { signToken, sendTokenResponse };
