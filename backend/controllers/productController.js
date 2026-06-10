// backend/controllers/productController.js
import Product from '../models/Product.js';
import Review from '../models/Review.js'; 
import { GoogleGenerativeAI } from '@google/generative-ai';

// 1. Get products with dynamic search, category filters, and sorting
export const getProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;
    let queryObj = {};

    if (search) {
      queryObj.name = { $regex: search, $options: 'i' };
    }

    if (category && category !== 'All') {
      queryObj.category = category;
    }

    let queryBuilder = Product.find(queryObj);

    if (sort === 'low-high') {
      queryBuilder = queryBuilder.sort({ price: 1 });
    } else if (sort === 'high-low') {
      queryBuilder = queryBuilder.sort({ price: -1 });
    } else {
      queryBuilder = queryBuilder.sort({ createdAt: -1 });
    }

    const products = await queryBuilder;
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Create Product
export const createProduct = async (req, res) => {
  const { name, description, price, stock, image, category } = req.body;
  try {
    const product = new Product({ 
      name, 
      description, 
      price, 
      stock, 
      image, 
      category: category || 'Computing',
      rating: 5
    });
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Update Product
export const updateProduct = async (req, res) => {
  const { name, description, price, stock, image, category } = req.body;
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      product.name = name || product.name;
      product.description = description || product.description;
      product.price = price !== undefined ? price : product.price;
      product.stock = stock !== undefined ? stock : product.stock;
      product.image = image || product.image;
      product.category = category || product.category;
      
      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Delete Product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (product) {
      res.json({ message: 'Product removed successfully' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5. FIXED: Submit Review (Mapped directly to your Review Schema attributes)
export const addReview = async (req, res) => {
  const { rating, comment, name } = req.body;
  const targetId = req.params.id;

  try {
    const product = await Product.findById(targetId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Build review document using your exact model keys: productId and name
    const review = new Review({
      productId: targetId, // 👈 Fixed from 'product' to 'productId'
      name: name || 'Anonymous Guest', // 👈 Fixed from 'userName' to 'name'
      rating: Number(rating),
      comment
    });

    await review.save();

    // Query using productId to recalculate live averages
    const reviews = await Review.find({ productId: targetId });
    const computedAverage = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
    
    product.rating = Math.round(computedAverage * 10) / 10;
    product.numReviews = reviews.length; // Syncs seamlessly with product schema counter

    await product.save();

    res.status(201).json({ message: 'Review saved successfully!', review });
  } catch (error) {
    console.error("Database Schema Sync Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// 6. FIXED: Get Local Reviews for a specific item (Querying by productId)
export const getProductReviews = async (req, res) => {
  try {
    // 👈 Changed query hook from { product: ... } to { productId: ... }
    const reviews = await Review.find({ productId: req.params.id }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 7. Live Internet Web Research with Resilient Error Fallback Mechanisms
// 7. Live Internet Web Research with Resilient Error Fallback Mechanisms
export const getAiSummary = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      if (res) return res.status(404).json({ message: "Product not found" });
      return "Product not found";
    }

    if (!process.env.GEMINI_API_KEY) {
      const errorMsg = "System Error: Backend GEMINI_API_KEY is missing from environment profiles.";
      if (res) return res.status(500).json({ summary: errorMsg });
      return errorMsg;
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const internetResearchPrompt = `Perform active internet research on the product named "${product.name}". 
    Using current web results, global tech articles, and community reviews from across the internet, compile a comprehensive live summary:
    - Key product technical specifications and unique capabilities.
    - Real-world consumer pros and performance cons found online.
    - The general online market consensus rating for this device.
    Format your answer cleanly with bullet points and bold header labels. Do not use casual conversational intros or outros.`;

    let responseText = "";

    try {
      // Primary Attempt: Grounded Search
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: internetResearchPrompt }] }],
        tools: [{ googleSearchRetrieval: { dynamicRetrievalConfig: { mode: "MODE_DYNAMIC", dynamicThreshold: 0.3 } } }]
      });
      responseText = result.response.text();
    } catch (searchError) {
      console.warn("⚠️ Gemini Grounded Search tool unavailable. Executing native fallback generation pass...");
      
      try {
        // Secondary Fallback: Native LLM Generation
        const fallbackPrompt = `Provide a comprehensive expert overview, key technical specifications, typical real-world advantages, limitations, and general market consensus for the following hardware asset based on your comprehensive knowledge base: "${product.name}". Format cleanly using bullet points and prominent bold headers.`;
        const fallbackResult = await model.generateContent(fallbackPrompt);
        responseText = fallbackResult.response.text();
      } catch (fallbackError) {
        // Tertiary Fallback: Check if it's an API quota limit block
        if (fallbackError.message?.includes("429") || fallbackError.message?.includes("quota")) {
          responseText = "### AI Summary Temporarily Unavailable\nOur automated product analysis module is currently resting due to daily API rate limits. Please check back later!";
        } else {
          throw new Error(`Both Search-grounded generation and core native AI pipelines failed: ${fallbackError.message}`);
        }
      }
    }

    if (res) {
      return res.json({ summary: responseText });
    }
    return responseText;

  } catch (error) {
    console.error("❌ Critical Final Failure in getAiSummary pipeline:", error.message);
    
    const fallbackFailureString = "Internal Assistant Error: Core AI synthesis pipelines are offline.";
    if (res) {
      return res.status(500).json({ message: fallbackFailureString });
    }
    return fallbackFailureString;
  }
};