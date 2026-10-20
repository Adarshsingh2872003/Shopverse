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
  const accountType = req.body.accountType || 'user';
  if (!['user', 'admin'].includes(accountType))
    return res.status(400).json({ message: 'Choose a valid account type.' });

  const user = await User.findOne({ email: req.body.email }).select('+password');
  if (!user || !(await user.matchPassword(req.body.password || '')))
    return res.status(401).json({ message: 'Email or password is incorrect.' });
  if ((accountType === 'admin') !== user.isAdmin)
    return res.status(403).json({
      message: accountType === 'admin'
        ? 'This account does not have admin access.'
        : 'This is an admin account. Choose Admin to sign in.',
    });
  res.json(sign(user));
});

router.get('/me', protect, (req, res) => res.json(sign(req.user).user));
export default router;
