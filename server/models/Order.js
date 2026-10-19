import mongoose from 'mongoose';
export default mongoose.model('Order', new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String, price: Number, qty: Number, image: String,
  }],
  shipping: { address: String, city: String, pincode: String, phone: String },
  total: { type: Number, required: true },
  status: { type: String, enum: ['placed', 'shipped', 'delivered'], default: 'placed' },
}, { timestamps: true }));
