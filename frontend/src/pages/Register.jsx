import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register({ setUser }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('import.meta.env.VITE_API_URL/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role: 'customer' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      localStorage.setItem('userInfo', JSON.stringify(data));
      setUser(data);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 border rounded-lg shadow-md mt-16">
      <h2 className="text-2xl font-bold mb-6 text-center text-slate-800">Customer Registration</h2>
      {error && <p className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</p>}
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border p-2 rounded focus:outline-blue-500" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border p-2 rounded focus:outline-blue-500" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border p-2 rounded focus:outline-blue-500" required />
        </div>
        <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white p-2 rounded font-semibold transition">Register</button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-600">
        Already have an account? <Link to="/login" className="text-blue-500 hover:underline">Login Here</Link>
      </p>
    </div>
  );
}