import mongoose from 'mongoose';
export default mongoose.model('Product', new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true },
  image: { type: String, default: '' },
  stock: { type: Number, default: 0, min: 0 },
}, { timestamps: true }));
