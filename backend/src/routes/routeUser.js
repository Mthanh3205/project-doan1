//Users
import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware
const authMiddleware = async (req, res, next) => {
  //Token header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token missing or invalid' });
  }
  const token = authHeader.split(' ')[1];

  try {
    //verify

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'YOUR_JWT_SECRET');

    //userId -> request
    req.userId = decoded.id;
    next();
  } catch (err) {
    //Token no valid or expired
    console.error('JWT verification failed:', err.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Get /api/me - get info user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      id: user.id, // add id user debug
      name: user.name || `${user.firstName} ${user.lastName}`,
      email: user.email,
      picture: user.picture, //Get URL from DB
      firstName: user.firstName,
      lastName: user.lastName,
      schoolName: user.schoolName,
      companyName: user.companyName,
      bio: user.bio,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Post /api/update-profile - update info user
router.post('/update-profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { firstName, lastName, email, schoolName, companyName, bio } = req.body;

    await user.update({ firstName, lastName, email, schoolName, companyName, bio });

    res.json({
      id: user.id,
      name: user.name || `${user.firstName} ${user.lastName}`,
      email: user.email,
      picture: user.picture,
      schoolName: user.schoolName,
      companyName: user.companyName,
      bio: user.bio,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
