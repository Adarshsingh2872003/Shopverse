import { Router } from 'express';
import { createHmac, timingSafeEqual } from 'node:crypto';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import { protect, admin } from '../middleware/auth.js';

const router = Router();

// Prices are re-read from the DB so the client can't tamper with totals.
router.post('/', protect, async (req, res) => {
  const { items, shipping, paymentMethod = 'cod' } = req.body;
  if (paymentMethod !== 'cod') return res.status(400).json({ message: 'Choose a supported payment method.' });
  if (!Array.isArray(items) || !items.length) return res.status(400).json({ message: 'Your cart is empty.' });
  if (!validShipping(shipping)) return res.status(400).json({ message: 'Enter a valid delivery address, city, PIN code and phone number.' });

  const lines = await getOrderLines(items, res);
  if (!lines) return;
  for (const l of lines) {
    const updated = await Product.findOneAndUpdate(
      { _id: l.product, stock: { $gte: l.qty } },
      { $inc: { stock: -l.qty } },
    );
    if (!updated) {
      for (const reserved of lines.slice(0, lines.indexOf(l))) {
        await Product.findByIdAndUpdate(reserved.product, { $inc: { stock: reserved.qty } });
      }
      return res.status(409).json({ message: `Not enough stock for ${l.name}.` });
    }
  }

  await Cart.findOneAndDelete({ user: req.user._id });

  const total = lines.reduce((s, l) => s + l.price * l.qty, 0);
  res.status(201).json(await Order.create({ user: req.user._id, items: lines, shipping, total, paymentMethod: 'cod' }));
});

router.post('/razorpay/order', protect, async (req, res) => {
  const { items, shipping } = req.body;
  if (!Array.isArray(items) || !items.length) return res.status(400).json({ message: 'Your cart is empty.' });
  if (!validShipping(shipping)) return res.status(400).json({ message: 'Enter a valid delivery address, city, PIN code and phone number.' });
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return res.status(503).json({ message: 'Online payments are not configured. Please choose cash on delivery.' });
  }

  const lines = await getOrderLines(items, res);
  if (!lines) return;
  const total = lines.reduce((sum, line) => sum + line.price * line.qty, 0);
  if (!Number.isSafeInteger(Math.round(total * 100)) || total <= 0) {
    return res.status(400).json({ message: 'The order total is not valid for online payment.' });
  }

  let gatewayResponse;
  try {
    gatewayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount: Math.round(total * 100), currency: 'INR', receipt: `shop_${Date.now()}` }),
    });
  } catch {
    return res.status(502).json({ message: 'Could not connect to Razorpay. Please try again or choose cash on delivery.' });
  }
  let gatewayOrder;
  try {
    gatewayOrder = await gatewayResponse.json();
  } catch {
    return res.status(502).json({ message: 'Razorpay returned an invalid response. Please try again.' });
  }
  if (!gatewayResponse.ok) {
    console.error('Razorpay order creation failed:', gatewayOrder.error?.description || gatewayResponse.status);
    return res.status(502).json({ message: 'Could not start online payment. Please try again or choose cash on delivery.' });
  }

  const order = await Order.create({
    user: req.user._id, items: lines, shipping, total, paymentMethod: 'razorpay',
    paymentStatus: 'pending', razorpayOrderId: gatewayOrder.id,
  });
  res.status(201).json({
    keyId: process.env.RAZORPAY_KEY_ID,
    razorpayOrderId: gatewayOrder.id,
    amount: gatewayOrder.amount,
    currency: gatewayOrder.currency,
    name: 'ShopVerse',
    description: `Order ${order._id.toString().slice(-8).toUpperCase()}`,
    prefill: { name: req.user.name, email: req.user.email },
  });
});

router.post('/razorpay/verify', protect, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  if ([razorpay_order_id, razorpay_payment_id, razorpay_signature].some((value) => typeof value !== 'string' || !value)) {
    return res.status(400).json({ message: 'Payment verification details are incomplete.' });
  }
  if (!process.env.RAZORPAY_KEY_SECRET) {
    return res.status(503).json({ message: 'Online payments are not configured.' });
  }

  const expected = createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest();
  let supplied;
  try {
    supplied = Buffer.from(razorpay_signature, 'hex');
  } catch {
    return res.status(400).json({ message: 'Payment signature is invalid.' });
  }
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    return res.status(400).json({ message: 'Payment signature is invalid.' });
  }

  const order = await Order.findOne({ razorpayOrderId: razorpay_order_id, user: req.user._id });
  if (!order) return res.status(404).json({ message: 'The order for this payment could not be found.' });
  if (order.paymentStatus === 'paid') return res.json({ orderId: order._id });

  let paymentResponse;
  try {
    paymentResponse = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(razorpay_payment_id)}`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64')}`,
      },
    });
  } catch {
    return res.status(502).json({ message: 'Could not confirm payment with Razorpay. Please contact support before retrying.' });
  }
  let payment;
  try {
    payment = await paymentResponse.json();
  } catch {
    return res.status(502).json({ message: 'Razorpay returned an invalid payment response. Contact support before retrying.' });
  }
  if (!paymentResponse.ok || payment.order_id !== razorpay_order_id
    || payment.status !== 'captured' || payment.amount !== Math.round(order.total * 100) || payment.currency !== 'INR') {
    return res.status(400).json({ message: 'Payment could not be confirmed. Contact support before retrying.' });
  }

  const claimed = await Order.findOneAndUpdate(
    { _id: order._id, paymentStatus: 'pending' },
    { $set: { paymentStatus: 'verifying' } },
    { new: true },
  );
  if (!claimed) {
    const latest = await Order.findById(order._id);
    if (latest?.paymentStatus === 'paid') return res.json({ orderId: latest._id });
    return res.status(409).json({ message: 'This payment is already being verified. Please refresh your orders shortly.' });
  }

  const reserved = [];
  for (const line of order.items) {
    const product = await Product.findOneAndUpdate(
      { _id: line.product, stock: { $gte: line.qty } },
      { $inc: { stock: -line.qty } },
    );
    if (!product) {
      for (const item of reserved) await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.qty } });
      await Order.findByIdAndUpdate(order._id, { $set: { paymentStatus: 'pending' } });
      return res.status(409).json({ message: `Not enough stock for ${line.name}. Contact support for a refund.` });
    }
    reserved.push(line);
  }

  await Order.findByIdAndUpdate(order._id, { $set: { paymentStatus: 'paid', status: 'placed' } });
  await Cart.findOneAndDelete({ user: req.user._id });
  res.json({ orderId: order._id });
});

router.get('/mine', protect, async (req, res) =>
  res.json(await Order.find({ user: req.user._id }).sort({ createdAt: -1 })));

router.get('/', protect, admin, async (req, res) =>
  res.json(await Order.find().populate('user', 'name email').sort({ createdAt: -1 })));

router.put('/:id/status', protect, admin, async (req, res) => {
  const { status } = req.body;
  if (!['placed', 'shipped', 'delivered'].includes(status)) {
    return res.status(400).json({ message: 'Choose a valid order status.' });
  }
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found.' });
  if (order.paymentMethod === 'razorpay' && order.paymentStatus !== 'paid' && status !== 'placed') {
    return res.status(409).json({ message: 'This order cannot be fulfilled until its payment is confirmed.' });
  }
  order.status = status;
  res.json(await order.save());
});

async function getOrderLines(items, res) {
  const lines = [];
  for (const item of items) {
    const { productId, qty } = item;
    if (!Number.isSafeInteger(qty) || qty < 1) {
      res.status(400).json({ message: 'Order quantities must be positive whole numbers.' });
      return null;
    }
    const p = await Product.findById(productId).catch(() => null);
    if (!p) {
      res.status(404).json({ message: 'A product in your cart no longer exists.' });
      return null;
    }
    if (p.stock < qty) {
      res.status(409).json({ message: `Only ${p.stock} left of ${p.name}.` });
      return null;
    }
    lines.push({ product: p._id, name: p.name, price: p.price, qty, image: p.image });
  }
  return lines;
}

function validShipping(shipping) {
  return typeof shipping?.address === 'string' && shipping.address.trim().length > 0
    && typeof shipping?.city === 'string' && shipping.city.trim().length > 0
    && /^[0-9]{6}$/.test(shipping.pincode)
    && /^[0-9]{10}$/.test(shipping.phone);
}

export default router;
