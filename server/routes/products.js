import { Router } from 'express';
import Product from '../models/Product.js';
import { protect, admin } from '../middleware/auth.js';

const router = Router();

// GET /api/products?search=&category=&sort=price_asc|price_desc|newest&page=1&limit=12
router.get('/', async (req, res) => {
  const { search, category, sort = 'newest', page = 1, limit = 12 } = req.query;
  const filter = {};
  if (search) filter.name = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
  if (category && category !== 'all') filter.category = category;
  const sorts = { price_asc: { price: 1 }, price_desc: { price: -1 }, newest: { createdAt: -1 } };
  const [products, total, categories] = await Promise.all([
    Product.find(filter).sort(sorts[sort] || sorts.newest).skip((page - 1) * limit).limit(+limit),
    Product.countDocuments(filter),
    Product.distinct('category'),
  ]);
  res.json({ products, total, pages: Math.ceil(total / limit), categories });
});

router.get('/:id', async (req, res) => {
  const p = await Product.findById(req.params.id).catch(() => null);
  p ? res.json(p) : res.status(404).json({ message: 'Product not found.' });
});

router.post('/', protect, admin, async (req, res) => res.status(201).json(await Product.create(req.body)));
router.put('/:id', protect, admin, async (req, res) =>
  res.json(await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })));
router.delete('/:id', protect, admin, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: 'Product deleted.' });
});

export default router;
