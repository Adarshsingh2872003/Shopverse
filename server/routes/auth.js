import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = Router();
const sign = (u) => ({
  token: jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: '7d' }),
  user: { id: u._id, name: u.name, email: u.email, isAdmin: u.isAdmin },
});

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Fill in name, email and password.' });
  if (await User.findOne({ email })) return res.status(409).json({ message: 'That email is already registered.' });
  res.status(201).json(sign(await User.create({ name, email, password })));
});

router.post('/login', async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select('+password');
  if (!user || !(await user.matchPassword(req.body.password || '')))
    return res.status(401).json({ message: 'Email or password is incorrect.' });
  res.json(sign(user));
});

router.get('/me', protect, (req, res) => res.json(sign(req.user).user));
export default router;
