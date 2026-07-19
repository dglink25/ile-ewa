const jwt = require('jsonwebtoken');

function signAccessToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role_name },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' }
  );
}

function signRefreshToken(user) {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' }
  );
}

module.exports = { signAccessToken, signRefreshToken };
