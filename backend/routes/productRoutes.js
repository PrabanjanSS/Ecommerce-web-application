// backend/routes/productRoutes.js
import express from 'express';
import { 
  getProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  addReview, 
  getProductReviews, 
  getAiSummary 
} from '../controllers/productController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Inventory standard mappings
router.get('/', getProducts);
router.post('/', protect, adminOnly, createProduct);

// FIXED LINE BELOW: Changed '/:id, to '/:id'
router.put('/:id', protect, adminOnly, updateProduct); 

router.delete('/:id', protect, adminOnly, deleteProduct);

// User reviews and live web research summary pipeline
router.get('/:id/reviews', getProductReviews);

// REMOVED "protect" here to allow instantaneous submissions from any front-end tester/guest user
router.post('/:id/reviews', addReview); 

router.get('/:id/ai-summary', getAiSummary);

export default router;