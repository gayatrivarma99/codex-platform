const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_codex_jwt_key_2026_dev_env_987654321';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
  });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id, user.role);

  const userData = {
    _id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    bio: user.bio,
    rating: user.rating,
    streak: user.streak,
    solvedProblemsCount: user.solvedProblems ? user.solvedProblems.length : 0,
    status: user.status,
  };

  res.status(statusCode).json({
    success: true,
    token,
    user: userData,
  });
};

module.exports = {
  generateToken,
  sendTokenResponse,
};
