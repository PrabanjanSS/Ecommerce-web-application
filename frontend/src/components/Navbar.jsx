import { Link, useLocation } from 'react-router-dom';

export default function Navbar({ user, logout, cartCount }) {
  const location = useLocation();

  // Fine helper logic to match canvas style on active page tracking
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-[#F6F0E5] border-b border-[#EAE1D4] px-6 py-4 sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* Brand Typography Architecture */}
        <Link to="/" className="text-2xl font-black text-[#2B2927] tracking-tighter hover:text-[#E05A36] transition-colors uppercase">
          E-Commerce<span className="text-[#E05A36]">.</span>
        </Link>

        {/* Action Link Control Clusters */}
        <div className="flex gap-8 items-center">
          <Link 
            to="/" 
            className={`font-bold text-sm tracking-tight transition-colors ${
              isActive('/') ? 'text-[#E05A36]' : 'text-[#2B2927] hover:text-[#E05A36]'
            }`}
          >
            Products
          </Link>

          {user && user.role === 'customer' && (
            <>
              <Link 
                to="/cart" 
                className={`font-bold text-sm tracking-tight flex items-center gap-1.5 transition-colors ${
                  isActive('/cart') ? 'text-[#E05A36]' : 'text-[#2B2927] hover:text-[#E05A36]'
                }`}
              >
                Cart 
                <span className="bg-[#E05A36] text-white font-black text-xs px-2 py-0.5 rounded-full min-w-[20px] text-center shadow-sm">
                  {cartCount}
                </span>
              </Link>
              <Link 
                to="/orders" 
                className={`font-bold text-sm tracking-tight transition-colors ${
                  isActive('/orders') ? 'text-[#E05A36]' : 'text-[#2B2927] hover:text-[#E05A36]'
                }`}
              >
                My Orders
              </Link>
            </>
          )}

          {user && user.role === 'admin' && (
            <Link 
              to="/admin-dashboard" 
              className={`font-extrabold text-sm tracking-tight uppercase transition-colors ${
                isActive('/admin-dashboard') ? 'text-[#E05A36]' : 'text-[#E05A36] hover:text-[#C54A28]'
              }`}
            >
              Admin Panel
            </Link>
          )}

          {/* User Profile Hook Frame */}
          {user ? (
            <div className="flex items-center gap-4 border-l border-[#EAE1D4] pl-4">
              <span className="text-xs bg-white text-[#2B2927] border border-[#EFEAE0] px-4 py-2 rounded-xl font-bold uppercase tracking-wider shadow-sm">
                {user.name} <span className="text-stone-400 font-medium lowercase">({user.role})</span>
              </span>
              <button 
                onClick={logout} 
                className="bg-[#2B2927] hover:bg-stone-800 text-white font-bold py-2 px-4 rounded-xl text-xs uppercase tracking-wider shadow-sm transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link 
              to="/login" 
              className="bg-[#E05A36] hover:bg-[#C54A28] text-white font-bold py-2 px-5 rounded-xl text-xs uppercase tracking-wider shadow-sm transition-all"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}