import { useState, useEffect } from 'react';

export default function Orders({ user }) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/orders/myorders`, {
      headers: { 'Authorization': `Bearer ${user.token}` }
    })
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(err => console.error(err));
  }, [user.token]);

  return (
    <div className="max-w-4xl mx-auto mt-6 px-2">
      <div className="mb-8 bg-[#F6F0E5] p-6 rounded-2xl border border-[#EAE1D4]">
        <h2 className="text-3xl font-black text-[#2B2927] tracking-tight">Deployment Manifest</h2>
        <p className="text-xs font-semibold text-stone-500 mt-1 uppercase tracking-wider">
          Chronological Tracked Purchases Logged (Newest First)
        </p>
      </div>

      <div className="space-y-6">
        {orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-[#DCD5C9]">
            <p className="text-stone-400 text-sm font-medium">No order historical manifests found.</p>
          </div>
        ) : (
          orders.map(order => (
            <div key={order._id} className="bg-white p-6 rounded-2xl border border-[#EFEAE0] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              
              <div className="space-y-3 flex-1 w-full">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono bg-[#F6F0E5] text-stone-600 px-2 py-0.5 rounded border border-[#EAE1D4]">ID: {order._id}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">
                    {new Date(order.createdAt).toLocaleString()}
                  </span>
                  <span className="text-[10px] font-bold tracking-wide bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded">
                    Channel: {order.paymentDetails?.cardType || 'Standard'}
                  </span>
                </div>

                <div className="bg-[#FDFBF7] p-3 rounded-xl border border-[#F6F0E5] text-xs space-y-1">
                  {order.items.map((i, idx) => (
                    <div key={idx} className="text-stone-700 font-medium">
                      • {i.product?.name || 'Unallocated Resource'} <span className="font-bold text-[#2B2927]">(x{i.quantity})</span>
                    </div>
                  ))}
                </div>

                {/* Illustrated Gift Flag Banner UI Block */}
                {order.isGift && (
                  <div className="bg-amber-50/60 border border-amber-200/70 rounded-xl p-3 text-xs text-amber-900">
                    💝 <span className="font-black">Gift Package Wrapped Payload:</span> 
                    <span className="italic text-stone-600 ml-1">"{order.giftMessage || 'No visible note card text write-in.'}"</span>
                  </div>
                )}

                {order.shippingAddress && (
                  <div className="text-xs text-stone-500 font-medium border-l-2 border-[#E05A36] pl-2.5 py-0.5">
                    <span className="font-bold text-[#2B2927]">Destination:</span> {order.shippingAddress.fullName} — {order.shippingAddress.street}, {order.shippingAddress.city}
                  </div>
                )}
              </div>

              <div className="flex md:flex-col items-baseline md:items-end justify-between w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-[#F6F0E5]">
                <div className="mb-2">
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Settled Amount</p>
                  <p className="text-2xl font-black text-[#2B2927]">${order.totalAmount}</p>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold tracking-wider uppercase shadow-sm ${
                  order.status === 'Approved' ? 'bg-[#EAF4EC] text-[#2A6F40]' :
                  order.status === 'Rejected' ? 'bg-[#FCECEB] text-[#AF231C]' : 'bg-[#FEF5ED] text-[#B26A1A]'
                }`}>
                  {order.status}
                </span>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}