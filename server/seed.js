import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import Product from './models/Product.js';

// Curated Unsplash photos — each one actually matches the product
const products = [
  {
    name: 'Cotton Kurta',
    description: 'Breathable everyday kurta in soft cotton. Perfect for casual and semi-formal occasions.',
    price: 1299,
    category: 'Clothing',
    stock: 25,
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Denim Jacket',
    description: 'Classic mid-wash jacket with a relaxed fit. A wardrobe staple for every season.',
    price: 2999,
    category: 'Clothing',
    stock: 12,
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Running Shoes',
    description: 'Lightweight shoes with a cushioned sole designed for long-distance running.',
    price: 3499,
    category: 'Footwear',
    stock: 30,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Leather Sandals',
    description: 'Hand-stitched genuine leather sandals that soften and mould with wear.',
    price: 1799,
    category: 'Footwear',
    stock: 18,
    image: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Wireless Earbuds',
    description: 'True wireless earbuds with active noise cancellation and up to 24 hours of playtime with the case.',
    price: 2499,
    category: 'Electronics',
    stock: 40,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Smart Watch',
    description: 'Tracks steps, sleep and heart rate. Receive notifications and calls right on your wrist.',
    price: 4999,
    category: 'Electronics',
    stock: 15,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Steel Water Bottle',
    description: 'Double-wall insulated stainless steel bottle. Keeps drinks cold for 24 hours, hot for 12.',
    price: 699,
    category: 'Home',
    stock: 60,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Ceramic Mug Set',
    description: 'Set of four hand-glazed ceramic mugs in earthy tones. Microwave and dishwasher safe.',
    price: 899,
    category: 'Home',
    stock: 22,
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Canvas Backpack',
    description: 'Roomy 20 L waxed canvas pack with a padded laptop sleeve and organiser pockets.',
    price: 1999,
    category: 'Accessories',
    stock: 20,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Sunglasses',
    description: 'UV400 polarised lenses in a lightweight acetate frame. Protects against UVA and UVB rays.',
    price: 999,
    category: 'Accessories',
    stock: 35,
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80',
  },
];

await mongoose.connect(process.env.MONGO_URI);
await Promise.all([User.deleteMany(), Product.deleteMany()]);
await User.create({ name: 'Admin', email: 'admin@shop.com', password: 'admin123', isAdmin: true });
await Product.insertMany(products);
console.log('✅ Seeded successfully with matched product images.');
console.log('   Admin login: admin@shop.com / admin123');
process.exit();
