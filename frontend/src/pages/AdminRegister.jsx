import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminRegister({ setUser }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAdminRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role: 'admin', secretKey })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      localStorage.setItem('userInfo', JSON.stringify(data));
      setUser(data);
      navigate('/admin-dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-slate-900 text-white p-8 border border-slate-700 rounded-lg shadow-xl mt-16">
      <h2 className="text-2xl font-bold mb-2 text-center text-yellow-400">Admin Registration Portal</h2>
      <p className="text-xs text-slate-400 text-center mb-6">Authorized clearance credentials required</p>
      {error && <p className="bg-red-900 border border-red-500 text-red-200 p-2 rounded mb-4 text-sm">{error}</p>}
      <form onSubmit={handleAdminRegister} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-300">Admin Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-800 border border-slate-700 p-2 rounded text-white focus:outline-yellow-500" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-300">Security Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-800 border border-slate-700 p-2 rounded text-white focus:outline-yellow-500" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-300">Master Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-800 border border-slate-700 p-2 rounded text-white focus:outline-yellow-500" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-yellow-400 font-semibold">Super Secret Key</label>
          <input type="password" value={secretKey} onChange={e => setSecretKey(e.target.value)} className="w-full bg-slate-800 border border-yellow-600 p-2 rounded text-white focus:outline-yellow-500" required />
        </div>
        <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-950 p-2 rounded font-bold transition mt-6">Initialize Admin Account</button>
      </form>
    </div>
  );
}