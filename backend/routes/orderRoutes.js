import express from 'express';
import { placeOrder, getMyOrders, getAllOrdersAdmin, updateOrderStatus, getDashboardStats } from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
const router = express.Router();

router.post('/', protect, placeOrder);
router.get('/myorders', protect, getMyOrders);
router.get('/admin/all', protect, adminOnly, getAllOrdersAdmin);
router.put('/admin/status/:id', protect, adminOnly, updateOrderStatus);
router.get('/admin/stats', protect, adminOnly, getDashboardStats);

export default router;