import { Router } from 'express';
import mongoose from 'mongoose';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

// Shape sent to the client; products deleted since being added are dropped.
const format = (cart) => (cart?.items || []).filter((i) => i.product).map((i) => ({
  _id: i.product._id, name: i.product.name, price: i.product.price,
  image: i.product.image, stock: i.product.stock, qty: i.qty,
}));

router.get('/', async (req, res, next) => {
  try {
    res.json(format(await Cart.findOne({ user: req.user._id }).populate('items.product')));
  } catch (e) { next(e); }
});

// Replaces the whole cart. Body: { items: [{ productId, qty }] }
router.put('/', async (req, res, next) => {
  try {
    const wanted = (Array.isArray(req.body.items) ? req.body.items : [])
      .filter((i) => mongoose.isValidObjectId(i.productId));
    const products = await Product.find({ _id: { $in: wanted.map((i) => i.productId) } });
    const byId = new Map(products.map((p) => [String(p._id), p]));

    const items = [];
    for (const { productId, qty } of wanted) {
      const p = byId.get(String(productId));
      if (!p || p.stock < 1) continue;
      items.push({ product: p._id, qty: Math.min(Math.max(1, parseInt(qty) || 1), p.stock) });
    }
    const cart = await Cart.findOneAndUpdate(
      { user: req.user._id }, { items },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate('items.product');
    res.json(format(cart));
  } catch (e) { next(e); }
});

router.delete('/', async (req, res, next) => {
  try {
    await Cart.findOneAndDelete({ user: req.user._id });
    res.json([]);
  } catch (e) { next(e); }
});

export default router;
