import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Cart({ cart, setCart, user }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); 

  // Address State
  const [fullName, setFullName] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Gift Setup State
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');

  // Payment Selection Architecture State
  const [paymentMode, setPaymentMode] = useState('card'); // 'card' or 'cod'
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardType, setCardType] = useState('Visa');

  const subtotal = cart.reduce((acc, curr) => acc + (curr.product.price * curr.quantity), 0);
  const giftCharge = isGift ? 5 : 0; // Flat presentation configuration premium charge
  const estimatedTax = Math.round((subtotal + giftCharge) * 0.05); 
  const finalTotal = subtotal + giftCharge + estimatedTax;

  const handleCardChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setCardNumber(value.slice(0, 16));
    if (value.startsWith('4')) setCardType('Visa');
    else if (value.startsWith('5')) setCardType('Mastercard');
    else if (value.startsWith('3')) setCardType('Amex');
    else setCardType('Card');
  };

  const handlePlaceOrder = async () => {
    if (!fullName || !street || !city || !state || !zipCode || !phoneNumber) {
      alert('Please fill out all operational address details.');
      return;
    }
    if (paymentMode === 'card' && (cardNumber.length < 12 || !expiry || !cvv)) {
      alert('Please fill secure credit processing parameters completely.');
      return;
    }

    const orderItems = cart.map(item => ({
      product: item.product._id,
      quantity: item.quantity
    }));

    const payload = {
      items: orderItems,
      totalAmount: finalTotal,
      shippingAddress: { fullName, street, city, state, zipCode, phoneNumber },
      paymentDetails: {
        cardType: paymentMode === 'cod' ? 'Cash On Delivery' : cardType,
        lastFour: paymentMode === 'cod' ? '0000' : cardNumber.slice(-4)
      },
      isGift,
      giftMessage: isGift ? giftMessage : ''
    };

    try {
      const res = await fetch('import.meta.env.VITE_API_URL/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setCart([]);
        navigate('/orders');
      } else {
        const errData = await res.json();
        alert(errData.message || 'Verification Error.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-8 px-4">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        <div className="lg:col-span-2 space-y-4">
          
          {/* STEP 1: ITEM LIST */}
          <div className="bg-white rounded-2xl border border-[#EFEAE0] p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-black text-[#2B2927] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black bg-[#E05A36] text-white">1</span>
                Review Operational Cart Items
              </h3>
              {step > 1 && <button onClick={() => setStep(1)} className="text-xs font-bold text-[#E05A36] hover:underline">Edit</button>}
            </div>

            {step === 1 && (
              <div className="space-y-4">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b border-[#F6F0E5] pb-3 last:border-none">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#F6F0E5] rounded-xl p-1 flex items-center justify-center border border-[#EFEAE0]">
                        <img src={item.product.image || 'https://via.placeholder.com/150'} alt="" className="object-contain max-h-full mix-blend-multiply" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#2B2927]">{item.product.name}</h4>
                        <p className="text-xs text-stone-500 font-medium">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-extrabold text-[#2B2927] text-sm">${item.product.price * item.quantity}</span>
                  </div>
                ))}
                
                {/* Gift Option Integration */}
                <div className="bg-[#FFF9F5] border border-[#EFEAE0] p-4 rounded-xl mt-4">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input type="checkbox" checked={isGift} onChange={e => setIsGift(e.target.checked)} className="accent-[#E05A36] w-4 h-4 rounded" />
                    <div>
                      <span className="font-bold text-sm text-[#2B2927]">Make this a gift container</span>
                      <p className="text-xs text-stone-500">Premium presentation layout wrapping wrapper (+ $5.00)</p>
                    </div>
                  </label>
                  {isGift && (
                    <textarea 
                      placeholder="Add an optional custom illustrated gift message to print inside..." 
                      value={giftMessage} 
                      onChange={e => setGiftMessage(e.target.value)}
                      className="w-full mt-3 border border-[#EFEAE0] bg-white p-3 rounded-xl text-xs focus:outline-[#E05A36] h-20 resize-none"
                    />
                  )}
                </div>

                <button onClick={() => setStep(2)} className="w-full mt-2 bg-[#E05A36] hover:bg-[#C54A28] text-white py-3 rounded-xl font-bold transition-all text-xs uppercase tracking-wider">
                  Proceed to Fulfillment Address
                </button>
              </div>
            )}
          </div>

          {/* STEP 2: SHIPPING ADDRESS */}
          <div className="bg-white rounded-2xl border border-[#EFEAE0] p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-black text-[#2B2927] flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${step >= 2 ? 'bg-[#E05A36] text-white' : 'bg-stone-200 text-stone-500'}`}>2</span>
                Fulfillment Address Logistics
              </h3>
              {step > 2 && <button onClick={() => setStep(2)} className="text-xs font-bold text-[#E05A36] hover:underline">Edit</button>}
            </div>

            {step === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Full Recipient Name" value={fullName} onChange={e=>setFullName(e.target.value)} className="md:col-span-2 w-full border border-[#EFEAE0] bg-[#FFF9F5] p-3 rounded-xl text-sm focus:outline-[#E05A36]" />
                <input type="text" placeholder="Street Address" value={street} onChange={e=>setStreet(e.target.value)} className="md:col-span-2 w-full border border-[#EFEAE0] bg-[#FFF9F5] p-3 rounded-xl text-sm focus:outline-[#E05A36]" />
                <input type="text" placeholder="City" value={city} onChange={e=>setCity(e.target.value)} className="w-full border border-[#EFEAE0] bg-[#FFF9F5] p-3 rounded-xl text-sm focus:outline-[#E05A36]" />
                <input type="text" placeholder="State" value={state} onChange={e=>setState(e.target.value)} className="w-full border border-[#EFEAE0] bg-[#FFF9F5] p-3 rounded-xl text-sm focus:outline-[#E05A36]" />
                <input type="text" placeholder="Zip / Postal Code" value={zipCode} onChange={e=>setZipCode(e.target.value)} className="w-full border border-[#EFEAE0] bg-[#FFF9F5] p-3 rounded-xl text-sm focus:outline-[#E05A36]" />
                <input type="text" placeholder="Direct Contact Phone Number" value={phoneNumber} onChange={e=>setPhoneNumber(e.target.value)} className="w-full border border-[#EFEAE0] bg-[#FFF9F5] p-3 rounded-xl text-sm focus:outline-[#E05A36]" />
                <button onClick={() => { if(fullName && street && city && state && zipCode && phoneNumber) setStep(3); else alert("Please complete address parameters."); }} className="md:col-span-2 w-full bg-[#E05A36] hover:bg-[#C54A28] text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider">
                  Continue to Secured Settlement
                </button>
              </div>
            )}
          </div>

          {/* STEP 3: DYNAMIC SETTLEMENT CHANNELS */}
          <div className="bg-white rounded-2xl border border-[#EFEAE0] p-6 shadow-sm">
            <h3 className="text-lg font-black text-[#2B2927] flex items-center gap-2 mb-4">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${step === 3 ? 'bg-[#E05A36] text-white' : 'bg-stone-200 text-stone-500'}`}>3</span>
              Secured Settlement Gateway
            </h3>

            {step === 3 && (
              <div className="space-y-6">
                {/* Mode Selector Option System */}
                <div className="grid grid-cols-2 gap-4">
                  <div 
                    onClick={() => setPaymentMode('card')}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all text-center ${paymentMode === 'card' ? 'border-[#E05A36] bg-[#FFF9F5]' : 'border-[#EFEAE0] bg-white hover:bg-stone-50'}`}
                  >
                    <span className="font-bold text-sm text-[#2B2927] block">Credit / Debit Card</span>
                    <span className="text-[11px] text-stone-500">Secure Processing</span>
                  </div>
                  <div 
                    onClick={() => setPaymentMode('cod')}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all text-center ${paymentMode === 'cod' ? 'border-[#E05A36] bg-[#FFF9F5]' : 'border-[#EFEAE0] bg-white hover:bg-stone-50'}`}
                  >
                    <span className="font-bold text-sm text-[#2B2927] block">Pay On Delivery</span>
                    <span className="text-[11px] text-stone-500">Settlement at Doorstep</span>
                  </div>
                </div>

                {paymentMode === 'card' ? (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="relative">
                      <input type="text" placeholder="Credit Card Number (16 Digits)" value={cardNumber} onChange={handleCardChange} className="w-full border border-[#EFEAE0] bg-[#FFF9F5] p-3 rounded-xl text-sm focus:outline-[#E05A36] pr-16" />
                      <span className="absolute right-3 top-3 text-xs bg-[#F6F0E5] text-[#E05A36] font-black px-2 py-1 rounded border border-[#EAE1D4]">{cardType}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" placeholder="MM/YY" value={expiry} onChange={e=>setExpiry(e.target.value)} className="w-full border border-[#EFEAE0] bg-[#FFF9F5] p-3 rounded-xl text-sm focus:outline-[#E05A36]" />
                      <input type="password" placeholder="CVV Security Code" value={cvv} onChange={e=>setCvv(e.target.value)} className="w-full border border-[#EFEAE0] bg-[#FFF9F5] p-3 rounded-xl text-sm focus:outline-[#E05A36]" />
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#F6F0E5]/50 border border-[#EAE1D4] p-4 rounded-xl text-xs text-stone-600 font-medium leading-relaxed">
                    💡 <span className="font-bold text-[#2B2927]">Notice:</span> A standard system delivery representative will handle cash or digital processing configuration options manually upon immediate dropoff. No instant credentials required.
                  </div>
                )}

                <button onClick={handlePlaceOrder} className="w-full bg-[#2B2927] hover:bg-stone-800 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-md">
                  Authorize System Order (${finalTotal})
                </button>
              </div>
            )}
          </div>

        </div>

        {/* PRICE SUMMARY SIDEBAR */}
        <div className="bg-[#F6F0E5] border border-[#EAE1D4] rounded-2xl p-6 lg:sticky lg:top-24 space-y-4">
          <h3 className="text-sm font-black text-[#2B2927] uppercase tracking-wider border-b border-[#EAE1D4] pb-2">Pricing Breakdown Summary</h3>
          <div className="space-y-2 text-sm font-medium text-stone-600">
            <div className="flex justify-between">
              <span>Hardware Assets Queue:</span>
              <span className="font-bold text-[#2B2927]">${subtotal}</span>
            </div>
            {isGift && (
              <div className="flex justify-between text-amber-800">
                <span>Gift Wrap Wrapping:</span>
                <span className="font-bold">${giftCharge}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Standard Regulatory Tax (5%):</span>
              <span className="font-bold text-[#2B2927]">${estimatedTax}</span>
            </div>
            <div className="flex justify-between border-b border-[#EAE1D4] pb-3">
              <span>Premium Dispatched Freight:</span>
              <span className="text-green-700 font-bold uppercase text-xs tracking-wider bg-green-50 px-2 py-0.5 rounded">Complimentary</span>
            </div>
            <div className="flex justify-between items-baseline pt-2">
              <span className="text-base font-black text-[#2B2927]">Aggregated Total:</span>
              <span className="text-3xl font-black text-[#E05A36]">${finalTotal}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}