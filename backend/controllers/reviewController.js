import Review from '../models/Review.js';
import Product from '../models/Product.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Controller POST: Add a rating and feedback comment
export const addReview = async (req, res) => {
  const { rating, comment, name } = req.body;
  const targetId = req.params.id;

  try {
    // We REMOVED the check that looks for an existing review by this user
    // This allows the same user/guest to submit multiple reviews freely
    
    const review = new Review({
      productId: targetId,
      name: name || 'Anonymous',
      rating: Number(rating),
      comment
    });

    await review.save();

    // Recalculate global product rating based on all entries
    const reviews = await Review.find({ productId: targetId });
    const computedAverage = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
    
    const product = await Product.findById(targetId);
    product.rating = Math.round(computedAverage * 10) / 10;
    product.numReviews = reviews.length;
    await product.save();

    res.status(201).json({ message: 'Review added successfully!', review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller GET: Fetch all reviews for a specific product
export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ productID: req.params.id }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller GET: Compile review strings and ping Gemini-2.5-Flash for an automated analysis synthesis
export const getAiSummary = async (req, res) => {
  try {
    const reviews = await Review.find({ productID: req.params.id });
    
    if (reviews.length === 0) {
      return res.json({ summary: "No consumer evaluation metrics exist yet to process analytical AI evaluation passes." });
    }

    // Isolate pure feedback commentary text arrays
    const rawComments = reviews.map(r => `[Rating: ${r.rating}/5]: "${r.comment}"`).join('\n');

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ summary: "Backend operational warning: GEMINI_API_KEY variable is not assigned within server environment profiles." });
    }

    // Initialize Google Generative AI with SDK pattern
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const systemPrompt = `You are an elite, objective product evaluation engine assistant. Summarize the following customer feedback statements in exactly 2-3 bullet points. Focus on identified hardware pros and performance cons. Do not introduce pleasantries:\n\n${rawComments}`;

    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text();

    res.json({ summary: responseText });
  } catch (error) {
    res.status(500).json({ message: `Gemini Engine Error Matrix: ${error.message}` });
  }
};