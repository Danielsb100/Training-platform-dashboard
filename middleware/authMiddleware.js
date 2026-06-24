const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { sendError } = require('../utils/http');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1];

  if (!token && req.headers.cookie) {
    const match = req.headers.cookie.match(/(?:^|; )token=([^;]*)/);
    if (match) token = match[1];
  }

  if (!token) {
    return sendError(res, {
      status: 401,
      code: 'AUTH_TOKEN_MISSING',
      message: 'Access denied. No token provided.'
    });
  }

  jwt.verify(token, env.auth.jwtSecret, (err, user) => {
    if (err) {
      return sendError(res, {
        status: 401,
        code: 'AUTH_TOKEN_INVALID',
        message: 'Invalid or expired token.'
      });
    }

    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
