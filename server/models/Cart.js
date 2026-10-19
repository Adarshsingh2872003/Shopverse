import mongoose from 'mongoose';

// One cart per user. Only product id + qty are stored; name/price/stock are read live from Product.
export default mongoose.model('Cart', new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [{
    _id: false,
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    qty: { type: Number, min: 1, default: 1 },
  }],
}, { timestamps: true }));
