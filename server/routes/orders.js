import { Router } from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import { protect, admin } from '../middleware/auth.js';

const router = Router();

// Prices are re-read from the DB so the client can't tamper with totals.
router.post('/', protect, async (req, res) => {
  const { items, shipping } = req.body;
  if (!items?.length) return res.status(400).json({ message: 'Your cart is empty.' });

  const lines = [];
  for (const { productId, qty } of items) {
    const p = await Product.findById(productId).catch(() => null);
    if (!p) return res.status(404).json({ message: 'A product in your cart no longer exists.' });
    if (p.stock < qty) return res.status(409).json({ message: `Only ${p.stock} left of ${p.name}.` });
    lines.push({ product: p._id, name: p.name, price: p.price, qty, image: p.image });
  }
  for (const l of lines) await Product.findByIdAndUpdate(l.product, { $inc: { stock: -l.qty } });

  await Cart.findOneAndDelete({ user: req.user._id });

  const total = lines.reduce((s, l) => s + l.price * l.qty, 0);
  res.status(201).json(await Order.create({ user: req.user._id, items: lines, shipping, total }));
});

router.get('/mine', protect, async (req, res) =>
  res.json(await Order.find({ user: req.user._id }).sort({ createdAt: -1 })));

router.get('/', protect, admin, async (req, res) =>
  res.json(await Order.find().populate('user', 'name email').sort({ createdAt: -1 })));

router.put('/:id/status', protect, admin, async (req, res) =>
  res.json(await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true })));

export default router;
