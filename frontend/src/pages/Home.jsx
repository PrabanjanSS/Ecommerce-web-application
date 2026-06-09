// frontend/src/pages/Home.jsx
import { useState, useEffect } from 'react';

export default function Home({ cart, setCart, user }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOption, setSortOption] = useState('default');

  // Interactive Review & Grounded Web-AI Hooks
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [aiSummary, setAiSummary] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [reviewerName, setReviewerName] = useState(''); 
  const [reviewError, setReviewError] = useState('');

  const categories = ['All', 'Computing', 'Mobile', 'Audio', 'Wearables', 'Accessories'];

  // LOCK BACKGROUND SCROLL WHEN MODAL IS ACTIVE
  useEffect(() => {
    if (selectedProduct) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedProduct]);

  const fetchProductsDataset = () => {
    let url = `http://localhost:5001/api/products?search=${search}&category=${selectedCategory}&sort=${sortOption}`;
    fetch(url)
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProductsDataset();
    }, 200);
    return () => clearTimeout(delayDebounceFn);
  }, [search, selectedCategory, sortOption]);

  const openProductDetails = async (product) => {
    setSelectedProduct(product);
    setReviews([]);
    setAiSummary('');
    setReviewError('');
    setUserComment('');
    setUserRating(5);
    setReviewerName(user?.name || ''); 
    setLoadingAi(true);

    try {
      const resReviews = await fetch(`http://localhost:5001/api/products/${product._id}/reviews`);
      if (resReviews.ok) {
        const dataReviews = await resReviews.json();
        setReviews(dataReviews);
      }
    } catch (e) { console.error(e); }

    try {
      const resAi = await fetch(`http://localhost:5001/api/products/${product._id}/ai-summary`);
      if (resAi.ok) {
        const dataAi = await resAi.json();
        setAiSummary(dataAi.summary);
      }
    } catch (e) { console.error(e); }
    setLoadingAi(false);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (!userComment.trim()) {
      setReviewError('Review feedback text cannot be submitted empty.');
      return;
    }
    
    const operationalName = user ? user.name : reviewerName;
    if (!operationalName || !operationalName.trim()) {
      setReviewError('Please provide your name to submit a rating.');
      return;
    }

    try {
      const headersConfig = { 'Content-Type': 'application/json' };
      if (user?.token) {
        headersConfig['Authorization'] = `Bearer ${user.token}`;
      }

      const response = await fetch(`http://localhost:5001/api/products/${selectedProduct._id}/reviews`, {
        method: 'POST',
        headers: headersConfig,
        body: JSON.stringify({ 
          rating: userRating, 
          comment: userComment,
          name: operationalName.trim()
        })
      });

      const resData = await response.json();
      if (response.ok) {
        setUserComment('');
        setReviewError('');
        
        // Instant isolated review data array synchronization refresh
        const resReviews = await fetch(`http://localhost:5001/api/products/${selectedProduct._id}/reviews`);
        if (resReviews.ok) {
          const updatedReviews = await resReviews.json();
          setReviews(updatedReviews);
        }

        fetchProductsDataset();
      } else {
        setReviewError(resData.message || 'Error processing rating dataset.');
      }
    } catch (err) {
      setReviewError('Server sync connection timed out.');
    }
  };

  const addToCart = (product) => {
    const exist = cart.find(x => x.product._id === product._id);
    if (exist) {
      if (exist.quantity >= product.stock) return;
      setCart(cart.map(x => x.product._id === product._id ? { ...exist, quantity: exist.quantity + 1 } : x));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const removeFromCart = (product) => {
    const exist = cart.find(x => x.product._id === product._id);
    if (!exist) return;
    if (exist.quantity === 1) {
      setCart(cart.filter(x => x.product._id !== product._id));
    } else {
      setCart(cart.map(x => x.product._id === product._id ? { ...exist, quantity: exist.quantity - 1 } : x));
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-6 px-2 relative">
      
      {/* Banner Plate */}
      <div className="mb-8 bg-[#F6F0E5] p-8 rounded-2xl border border-[#EAE1D4] relative overflow-hidden">
        <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-[#E05A36] opacity-10 rounded-full"></div>
        <h2 className="text-4xl font-black text-[#2B2927] tracking-tight mb-2 uppercase">
          Hardware Ecosystem<span className="text-[#E05A36]">.</span>
        </h2>
        <p className="text-stone-600 font-medium text-sm">
          Inspect assets, configure local evaluation metrics, or read crowdsourced system specifications.
        </p>
      </div>

      {/* FILTER CONTROL HUB */}
      <div className="mb-8 space-y-4 bg-white p-5 rounded-2xl border border-[#EFEAE0] shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-1/2">
            <input 
              type="text" 
              placeholder="Search assets..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-[#EFEAE0] bg-[#FFF9F5] pl-4 pr-10 py-3 rounded-xl text-sm focus:outline-[#E05A36] font-medium"
            />
            <span className="absolute right-3 top-3.5 text-stone-400 text-xs">🔍</span>
          </div>
          <div className="w-full md:w-auto flex items-center gap-2 self-stretch md:self-auto">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider whitespace-nowrap">Sort By:</span>
            <select 
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full md:w-48 border border-[#EFEAE0] bg-[#FFF9F5] p-3 rounded-xl text-xs font-bold text-[#2B2927] focus:outline-[#E05A36]"
            >
              <option value="default">Release Timeline</option>
              <option value="low-high">Price: Low to High</option>
              <option value="high-low">Price: High to Low</option>
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 pt-2 border-t border-[#F6F0E5]">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                selectedCategory === cat ? 'bg-[#E05A36] text-white border-[#E05A36] shadow-sm' : 'bg-[#FDFBF7] text-[#2B2927] border-[#EFEAE0] hover:bg-[#F6F0E5]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* PRODUCTS DISPLAY GRID */}
      {products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-[#DCD5C9]">
          <p className="text-stone-400 text-sm font-semibold">No active assets match your query constraints.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map(product => {
            const cartItem = cart.find(x => x.product._id === product._id);
            return (
              <div key={product._id} className="bg-white rounded-2xl border border-[#EFEAE0] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden group">
                <div 
                  onClick={() => openProductDetails(product)}
                  className="w-full h-56 bg-[#F6F0E5] p-4 flex items-center justify-center border-b border-[#EFEAE0] overflow-hidden relative cursor-pointer"
                >
                  <span className="absolute top-3 left-3 bg-[#2B2927] text-white font-bold text-[9px] uppercase tracking-widest px-2 py-0.5 rounded">
                    {product.category || 'Computing'}
                  </span>
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                    <span className="bg-white text-[#2B2927] font-black text-xs px-3 py-1.5 rounded-xl border border-[#EFEAE0] shadow-md uppercase tracking-wider">Inspect Web & Local Reviews</span>
                  </div>
                  <img src={product.image || 'https://via.placeholder.com/300'} alt="" className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105" />
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between bg-white">
                  <div>
                    <h3 onClick={() => openProductDetails(product)} className="text-xl font-black text-[#2B2927] mb-1 tracking-tight group-hover:text-[#E05A36] transition-colors uppercase cursor-pointer">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-1 mb-3">
                      <span className="text-amber-500 text-sm font-black">
                        {'★'.repeat(Math.round(product.rating || 5)) + '☆'.repeat(5 - Math.round(product.rating || 5))}
                      </span>
                      <span className="text-[10px] text-stone-400 font-bold mt-0.5">({product.rating || 5.0})</span>
                    </div>
                    <p className="text-stone-500 text-xs leading-relaxed mb-4 line-clamp-2 font-medium">{product.description}</p>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-2xl font-black text-[#2B2927]">${product.price}</span>
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-black tracking-wide uppercase ${product.stock > 0 ? 'bg-[#EAF4EC] text-[#2A6F40]' : 'bg-[#FCECEB] text-[#AF231C]'}`}>
                        {product.stock > 0 ? `${product.stock} Ready` : 'Sold Out'}
                      </span>
                    </div>

                    {product.stock <= 0 ? (
                      <button disabled className="w-full bg-stone-100 text-stone-400 font-bold py-3 rounded-xl cursor-not-allowed text-xs uppercase tracking-wider border border-stone-200">Out of Stock</button>
                    ) : !cartItem ? (
                      <button onClick={() => addToCart(product)} className="w-full bg-[#E05A36] hover:bg-[#C54A28] text-white font-bold py-3 rounded-xl shadow-sm transition-all duration-200 text-xs tracking-wider uppercase">Add to Cart</button>
                    ) : (
                      <div className="flex items-center justify-between border-2 border-[#E05A36] rounded-xl overflow-hidden h-11 bg-[#FFF9F5]">
                        <button onClick={() => removeFromCart(product)} className="w-12 h-full bg-[#E05A36] hover:bg-[#C54A28] text-white font-black text-lg flex items-center justify-center">−</button>
                        <span className="font-black text-[#2B2927] text-sm">{cartItem.quantity}</span>
                        <button onClick={() => addToCart(product)} disabled={cartItem.quantity >= product.stock} className="w-12 h-full bg-[#E05A36] hover:bg-[#C54A28] disabled:bg-stone-200 disabled:text-stone-400 text-white font-black text-lg flex items-center justify-center">+</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ISO-SCROLL OVERLAY MODAL WINDOW CONTAINER */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-5xl rounded-3xl border border-[#EFEAE0] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 max-h-[90vh]">
            
            {/* Left Column: Specs Frame Section */}
            <div className="lg:col-span-5 bg-[#F6F0E5] p-6 border-b lg:border-b-0 lg:border-r border-[#EFEAE0] flex flex-col justify-between overflow-y-auto max-h-[35vh] lg:max-h-[90vh]">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-black bg-[#E05A36] text-white px-3 py-1 rounded-full uppercase tracking-wider">{selectedProduct.category}</span>
                  <button onClick={() => setSelectedProduct(null)} className="lg:hidden text-stone-700 text-xl font-bold bg-white w-8 h-8 rounded-full border border-[#EFEAE0] flex items-center justify-center">×</button>
                </div>
                <div className="w-full h-48 flex items-center justify-center p-2 mb-4">
                  <img src={selectedProduct.image} alt="" className="max-h-full object-contain mix-blend-multiply" />
                </div>
                <h3 className="text-2xl font-black text-[#2B2927] tracking-tight uppercase mb-1">{selectedProduct.name}</h3>
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="text-amber-500 text-base font-black">{'★'.repeat(Math.round(selectedProduct.rating || 5))}</span>
                  <span className="text-xs text-stone-500 font-extrabold mt-0.5">({selectedProduct.rating || 5.0} Score)</span>
                </div>
                <p className="text-stone-600 text-xs font-medium leading-relaxed mb-4 whitespace-pre-wrap">{selectedProduct.description}</p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#EFEAE0] mt-auto">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xl font-black text-[#2B2927]">${selectedProduct.price}</span>
                  <span className="text-[10px] font-mono text-stone-400">STOCK: {selectedProduct.stock}</span>
                </div>
                <button onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }} disabled={selectedProduct.stock <= 0} className="w-full bg-[#2B2927] hover:bg-stone-800 disabled:bg-stone-200 text-white font-black py-3 rounded-xl text-xs uppercase tracking-widest transition-all">
                  {selectedProduct.stock > 0 ? "Add To Cart" : "Out of Stock"}
                </button>
              </div>
            </div>

            {/* Right Column: AI Analysis & Isolated Scroll Review Panel */}
            <div className="lg:col-span-7 p-6 flex flex-col justify-between overflow-y-auto bg-[#FDFBF7] max-h-[55vh] lg:max-h-[90vh]">
              
              <div className="flex justify-between items-center pb-3 border-b border-[#F6F0E5] mb-4 flex-shrink-0">
                <h4 className="text-md font-black text-[#2B2927] uppercase tracking-wider">Live Evaluation Matrix</h4>
                <button onClick={() => setSelectedProduct(null)} className="hidden lg:flex text-stone-500 text-2xl hover:text-black font-black">×</button>
              </div>

              {/* AI SEARCH RESULT INTERFACE CONTAINER */}
              <div className="mb-4 bg-[#2B2927] text-white p-4 rounded-2xl border border-stone-800 shadow-inner relative flex-shrink-0">
                <span className="absolute top-3 right-3 bg-[#E05A36] text-white font-black text-[8px] uppercase tracking-widest px-2 py-0.5 rounded">LIVE SEARCH GROUNDING</span>
                <h5 className="text-xs font-black uppercase tracking-widest text-[#E05A36] mb-2 flex items-center gap-1">🌐 Real-Time Internet Research Overview</h5>
                
                {loadingAi ? (
                  <div className="space-y-2 py-2">
                    <p className="text-xs text-stone-400 italic animate-pulse">Gemini is searching the web for live global review insights...</p>
                    <div className="h-1.5 bg-stone-700 rounded full w-3/4 animate-pulse"></div>
                  </div>
                ) : aiSummary ? (
                  <div className="text-xs text-stone-300 leading-relaxed whitespace-pre-line font-medium max-h-[120px] overflow-y-auto pr-1">
                    {aiSummary}
                  </div>
                ) : (
                  <p className="text-xs text-stone-400 italic">Could not compile live evaluation variables.</p>
                )}
              </div>

              {/* LOCAL REVIEWS RENDER CONTAINER FEED (Mapped to rev.name) */}
              <div className="flex-1 overflow-y-auto min-h-[120px] max-h-[180px] mb-4 border border-[#EFEAE0] bg-white rounded-2xl p-4 shadow-inner">
                <h5 className="text-xs font-black uppercase text-stone-400 tracking-wider mb-2 sticky top-0 bg-white pb-1">Local Reviews ({reviews.length})</h5>
                {reviews.length === 0 ? (
                  <p className="text-xs italic text-stone-400 py-4 text-center">No standard user evaluations logged for this item yet.</p>
                ) : (
                  <div className="space-y-2">
                    {reviews.map((rev) => (
                      <div key={rev._id} className="bg-[#FFF9F5] border border-[#EFEAE0] p-3 rounded-xl text-xs space-y-1">
                        <div className="flex justify-between items-center">
                          {/* FIXED: Reading "rev.name" directly from your review schema fields */}
                          <span className="font-black text-[#2B2927]">{rev.name}</span>
                          <span className="text-amber-500 font-bold">{'★'.repeat(rev.rating)}</span>
                        </div>
                        <p className="text-stone-600 font-medium">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* INPUT FORM PIPELINE ENTRY HUB */}
              <form onSubmit={handleReviewSubmit} className="border-t border-[#F6F0E5] pt-4 space-y-3 flex-shrink-0">
                <h5 className="text-xs font-black uppercase text-[#2B2927] tracking-wider">File Local Assessment</h5>
                {reviewError && <p className="text-[11px] bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-xl font-bold">{reviewError}</p>}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase text-stone-400">Your Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Liam K." 
                      disabled={!!user}
                      value={user ? user.name : reviewerName} 
                      onChange={(e) => setReviewerName(e.target.value)} 
                      className="border border-[#EFEAE0] bg-white disabled:bg-stone-100 p-2 rounded-xl font-medium text-xs focus:outline-[#E05A36]" 
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase text-stone-400">Score</label>
                    <select value={userRating} onChange={(e)=>setUserRating(Number(e.target.value))} className="border border-[#EFEAE0] bg-white p-2 rounded-xl font-bold text-xs focus:outline-[#E05A36]">
                      <option value="5">5 ★★★★★ Perfect</option>
                      <option value="4">4 ★★★★ Good</option>
                      <option value="3">3 ★★★ Average</option>
                      <option value="2">2 ★★ Poor</option>
                      <option value="1">1 ★ Critical</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase text-stone-400">Comment</label>
                    <input type="text" placeholder="Observations..." value={userComment} onChange={(e)=>setUserComment(e.target.value)} className="w-full border border-[#EFEAE0] bg-white p-2 rounded-xl text-xs focus:outline-[#E05A36] font-medium" />
                  </div>
                </div>
                <button type="submit" className="w-full bg-[#E05A36] hover:bg-[#C54A28] text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all">Submit Score Metric</button>
              </form>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}