import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return res.status(401).json({ message: 'Please sign in.' });
  try {
    const { id } = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    req.user = await User.findById(id);
    if (!req.user) throw new Error();
    next();
  } catch {
    res.status(401).json({ message: 'Session expired. Sign in again.' });
  }
};

export const admin = (req, res, next) =>
  req.user?.isAdmin ? next() : res.status(403).json({ message: 'Admins only.' });
