import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import Product from './models/Product.js';

const img = (id) => `https://picsum.photos/seed/${id}/600/600`;
const products = [
  ['Cotton Kurta', 'Breathable everyday kurta in soft cotton.', 1299, 'Clothing', 25],
  ['Denim Jacket', 'Classic mid-wash jacket with a relaxed fit.', 2999, 'Clothing', 12],
  ['Running Shoes', 'Lightweight shoes with a cushioned sole.', 3499, 'Footwear', 30],
  ['Leather Sandals', 'Hand-stitched sandals that soften with wear.', 1799, 'Footwear', 18],
  ['Wireless Earbuds', 'Up to 24 hours of playtime with the case.', 2499, 'Electronics', 40],
  ['Smart Watch', 'Tracks steps, sleep and heart rate.', 4999, 'Electronics', 15],
  ['Steel Water Bottle', 'Keeps drinks cold for 24 hours.', 699, 'Home', 60],
  ['Ceramic Mug Set', 'Set of four hand-glazed mugs.', 899, 'Home', 22],
  ['Canvas Backpack', 'Roomy 20 L pack with a laptop sleeve.', 1999, 'Accessories', 20],
  ['Sunglasses', 'UV400 lenses in a lightweight frame.', 999, 'Accessories', 35],
].map(([name, description, price, category, stock], i) => ({ name, description, price, category, stock, image: img(i + 11) }));

await mongoose.connect(process.env.MONGO_URI);
await Promise.all([User.deleteMany(), Product.deleteMany()]);
await User.create({ name: 'Admin', email: 'admin@shop.com', password: 'admin123', isAdmin: true });
await Product.insertMany(products);
console.log('Seeded. Admin login: admin@shop.com / admin123');
process.exit();
