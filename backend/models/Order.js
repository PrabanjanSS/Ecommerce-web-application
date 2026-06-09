import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true }
    }
  ],
  shippingAddress: {
    fullName: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    phoneNumber: { type: String, required: true }
  },
  paymentDetails: {
    cardType: { type: String, required: true, default: 'Standard' },
    lastFour: { type: String, required: true }
  },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  isGift: { type: Boolean, default: false },
  giftMessage: { type: String, default: '' }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
export default Order;