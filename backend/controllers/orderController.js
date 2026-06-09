import Order from '../models/Order.js';
import Product from '../models/Product.js';

export const placeOrder = async (req, res) => {
  const { items, totalAmount, shippingAddress, paymentDetails, isGift, giftMessage } = req.body;
  try {
    if (!items || items.length === 0) return res.status(400).json({ message: 'No items in order' });
    if (!shippingAddress || !paymentDetails) {
      return res.status(400).json({ message: 'Missing delivery address or payment attributes' });
    }

    const order = new Order({ 
      user: req.user._id, 
      items, 
      totalAmount,
      shippingAddress,
      paymentDetails,
      // Added flexible gift metadata parameters
      isGift: isGift || false,
      giftMessage: giftMessage || ''
    });
    
    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    // Solved: Added sort option to force descending order profile logs
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllOrdersAdmin = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .populate('items.product')
      .sort({ createdAt: -1 }); // Sorted admin list as well
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (status === 'Approved' && order.status !== 'Approved') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity, salesCount: item.quantity }
        });
      }
    }
    
    order.status = status;
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const totalSalesData = await Order.aggregate([
      { $match: { status: 'Approved' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);

    const productsCount = await Product.countDocuments();
    const totalRevenue = totalSalesData[0]?.totalRevenue || 0;

    res.json({ totalRevenue, productsCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};