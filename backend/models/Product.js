import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  image: { type: String, required: true },
  salesCount: { type: Number, default: 0 },
  // Advanced architecture metadata attributes
  category: { type: String, required: true, default: 'Computing' },
  rating: { type: Number, default: 5 },
  numReviews: { type: Number, default:0 }
}, { timestamps: true });

// Create a combined text index to support rapid database fuzzy matching searches
productSchema.index({ name: 'text', description: 'text' });

const Product = mongoose.model('Product', productSchema);
export default Product;