import { useState, useEffect } from 'react';

export default function AdminDashboard({ user }) {
  const [stats, setStats] = useState({ totalRevenue: 0, productsCount: 0 });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState('');
  // Fixed: Added category selection form configuration state
  const [category, setCategory] = useState('Computing');

  // Inline dynamic specific item restock count storage trackers
  const [restockAmounts, setRestockAmounts] = useState({});

  const categoryOptions = ['Computing', 'Mobile', 'Audio', 'Wearables', 'Accessories'];

  const fetchDashboardData = async () => {
    const headers = { 'Authorization': `Bearer ${user.token}`, 'Content-Type': 'application/json' };
    
    const statsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/admin/stats`, { headers });
    setStats(await statsRes.json());

    const prodRes = await fetch(`${import.meta.env.VITE_API_URL}/api/products`);
    setProducts(await prodRes.json());

    const ordRes = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/admin/all`, { headers });
    setOrders(await ordRes.json());
  };

  useEffect(() => { fetchDashboardData(); }, []);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    // Fixed: Transmitting category and a random realistic baseline star rating to the database
    const randomRating = Math.floor(Math.random() * 2) + 4; // Generates a realistic 4 or 5 star rating

    await fetch(`${import.meta.env.VITE_API_URL}/api/products`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${user.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name, 
        description, 
        price: Number(price), 
        stock: Number(stock), 
        image,
        category, // Fixed: Linked explicitly to state
        rating: randomRating
      })
    });
    
    setName(''); setDescription(''); setPrice(''); setStock(''); setImage(''); setCategory('Computing');
    fetchDashboardData();
  };

  const handleRestock = async (product, amount) => {
    if (!amount || amount <= 0) return;
    const computedNewStock = product.stock + Number(amount);
    
    await fetch(`${import.meta.env.VITE_API_URL}/api/products/${product._id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${user.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock: computedNewStock })
    });
    
    setRestockAmounts({ ...restockAmounts, [product._id]: '' });
    fetchDashboardData();
  };

  const handleDeleteProduct = async (id) => {
    await fetch(`${import.meta.env.VITE_API_URL}/api/products/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${user.token}` }
    });
    fetchDashboardData();
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    await fetch(`${import.meta.env.VITE_API_URL}/api/orders/admin/status/${orderId}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${user.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    fetchDashboardData();
  };

  return (
    <div className="space-y-8 bg-[#FDFBF7] min-h-screen p-2">
      <h2 className="text-3xl font-black text-[#2B2927] border-b border-[#EAE1D4] pb-2 uppercase tracking-tight">Admin Operational Panel</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#2B2927] text-white p-6 rounded-2xl shadow-sm">
          <p className="text-stone-400 uppercase tracking-wider text-xs font-bold">Approved Gross Revenue</p>
          <p className="text-4xl font-extrabold mt-2 text-[#E05A36]">${stats.totalRevenue}</p>
        </div>
        <div className="bg-[#F6F0E5] border border-[#EAE1D4] text-[#2B2927] p-6 rounded-2xl shadow-sm">
          <p className="text-stone-500 uppercase tracking-wider text-xs font-bold">Total Distinct Products Available</p>
          <p className="text-4xl font-extrabold mt-2 text-stone-800">{stats.productsCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ADD PRODUCT FORM (UPDATED TO SUPPORT CATEGORY SELECTION DROPDOWN) */}
        <form onSubmit={handleCreateProduct} className="bg-white p-6 rounded-2xl border border-[#EFEAE0] space-y-4 h-fit">
          <h3 className="text-xl font-bold text-[#2B2927]">Inventory Deployment</h3>
          
          <input type="text" placeholder="Product Name" value={name} onChange={e=>setName(e.target.value)} className="w-full border border-[#EFEAE0] bg-[#FFF9F5] p-2.5 rounded-xl text-sm" required />
          <textarea placeholder="Product Description" value={description} onChange={e=>setDescription(e.target.value)} className="w-full border border-[#EFEAE0] bg-[#FFF9F5] p-2.5 rounded-xl text-sm" required />
          <input type="number" placeholder="Price ($)" value={price} onChange={e=>setPrice(e.target.value)} className="w-full border border-[#EFEAE0] bg-[#FFF9F5] p-2.5 rounded-xl text-sm" required />
          <input type="number" placeholder="Stock Units" value={stock} onChange={e=>setStock(e.target.value)} className="w-full border border-[#EFEAE0] bg-[#FFF9F5] p-2.5 rounded-xl text-sm" required />
          <input type="text" placeholder="Image Path (e.g. /images/iphone.jpg)" value={image} onChange={e=>setImage(e.target.value)} className="w-full border border-[#EFEAE0] bg-[#FFF9F5] p-2.5 rounded-xl text-sm" required />
          
          {/* Fixed: Category Dropdown integration layout */}
          <div className="space-y-1">
            <label className="text-[11px] font-black uppercase text-stone-400 tracking-wider">Classification Category</label>
            <select 
              value={category} 
              onChange={e => setCategory(e.target.value)}
              className="w-full border border-[#EFEAE0] bg-[#FFF9F5] p-2.5 rounded-xl text-sm font-bold text-[#2B2927] focus:outline-[#E05A36]"
            >
              {categoryOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="w-full bg-[#E05A36] hover:bg-[#C54A28] text-white py-2.5 font-bold rounded-xl text-xs uppercase tracking-wider transition-all">Add Product</button>
        </form>

        {/* STOCK REGISTRY */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#EFEAE0]">
          <h3 className="text-xl font-bold text-[#2B2927] mb-4">Stock Registry</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#F6F0E5] bg-[#F6F0E5]/50 text-stone-600 uppercase text-xs font-bold">
                  <th className="p-3">Item Details</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Status / Units</th>
                  <th className="p-3">Supply Management</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p._id} className="border-b border-[#F6F0E5] hover:bg-stone-50">
                    <td className="p-3">
                      <p className="font-bold text-[#2B2927]">{p.name}</p>
                      <p className="text-xs text-stone-400">${p.price}</p>
                    </td>
                    {/* Fixed: Display the actual model category inside table column rows */}
                    <td className="p-3">
                      <span className="text-xs font-bold bg-[#F6F0E5] px-2 py-1 rounded text-stone-700">
                        {p.category || 'Computing'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`text-[10px] px-2 py-0.5 font-black uppercase rounded ${p.stock > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {p.stock} units
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <input 
                          type="number" 
                          placeholder="+" 
                          value={restockAmounts[p._id] || ''} 
                          onChange={e => setRestockAmounts({ ...restockAmounts, [p._id]: e.target.value })}
                          className="w-14 border border-[#EFEAE0] p-1 rounded-lg text-center text-xs font-bold" 
                        />
                        <button 
                          onClick={() => handleRestock(p, restockAmounts[p._id])}
                          className="bg-[#2B2927] hover:bg-stone-800 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1.5 rounded-lg"
                        >
                          Restock
                        </button>
                      </div>
                    </td>
                    <td className="p-3">
                      <button onClick={() => handleDeleteProduct(p._id)} className="text-red-500 hover:text-red-700 font-bold text-xs uppercase tracking-wider">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ORDERS APPROVAL BOARD */}
      <div className="bg-white p-6 rounded-2xl border border-[#EFEAE0]">
        <h3 className="text-xl font-bold text-[#2B2927] mb-4">Awaiting Order Manifests</h3>
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order._id} className="border border-[#EFEAE0] p-4 rounded-xl bg-[#FDFBF7] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-[10px] font-mono bg-stone-100 px-2 py-0.5 rounded text-stone-500">ID: {order._id}</span>
                <p className="text-sm font-bold text-[#2B2927] mt-1">Client: {order.user?.name} ({order.user?.email})</p>
                <div className="text-xs text-stone-500 mt-1">
                  <span className="font-bold">Allocated Items:</span> {order.items.map(i => `${i.product?.name || 'Deleted Product'} (x${i.quantity})`).join(', ')}
                </div>
                {order.isGift && <p className="text-xs text-amber-800 font-bold mt-1">💝 Configured as Custom Gift Wrap Parcel</p>}
                <p className="text-sm font-black text-[#E05A36] mt-1">Value: ${order.totalAmount}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${order.status === 'Approved' ? 'bg-green-100 text-green-700' : order.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.status}</span>
                {order.status === 'Pending' && (
                  <div className="flex gap-2">
                    <button onClick={() => handleUpdateStatus(order._id, 'Approved')} className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-1 rounded-lg">Approve</button>
                    <button onClick={() => handleUpdateStatus(order._id, 'Rejected')} className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1 rounded-lg">Reject</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}