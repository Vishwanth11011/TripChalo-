import { useState } from 'react';
import { X } from 'lucide-react';
import api from '../api';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true); // Toggle between Login/Signup
  const [formData, setFormData] = useState({
    email: '', 
    password: '', 
    first_name: '', 
    last_name: '', 
    age: 18, 
    gender: 'Male', 
    security_question: 'What is the name of your first pet?', 
    security_answer: ''
  });
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        const res = await api.post('/login', { email: formData.email, password: formData.password });
        localStorage.setItem('user', JSON.stringify(res.data)); // Save user session
        onLoginSuccess(res.data);
        onClose();
      } else {
        // Signup logic
        await api.post('/signup', formData);
        alert("Signup Successful! Please Login.");
        setIsLogin(true); // Switch to login view
      }
    } catch (err) {
      // Safely access the error message from FastAPI
      setError(err.response?.data?.detail || "Something went wrong");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#181818] p-8 rounded-lg w-full max-w-md relative animate-fade-in text-white shadow-2xl border border-gray-800">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition">
          <X size={24} />
        </button>
        
        <h2 className="text-3xl font-bold mb-6 text-center">
          {isLogin ? 'Sign In' : 'Sign Up'}
        </h2>
        
        {error && (
          <div className="bg-orange-500/20 text-orange-400 p-3 rounded text-sm mb-4 text-center border border-orange-500/50">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <input 
                  name="first_name" 
                  placeholder="First Name" 
                  onChange={handleChange} 
                  className="bg-[#333] border-none p-3 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-red-600 outline-none w-full"
                  required 
                />
                <input 
                  name="last_name" 
                  placeholder="Last Name" 
                  onChange={handleChange} 
                  className="bg-[#333] border-none p-3 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-red-600 outline-none w-full"
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="number" 
                  name="age" 
                  placeholder="Age" 
                  min="18" 
                  onChange={handleChange} 
                  className="bg-[#333] border-none p-3 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-red-600 outline-none w-full"
                  required 
                />
                <select 
                  name="gender" 
                  onChange={handleChange} 
                  className="bg-[#333] border-none p-3 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-red-600 outline-none w-full"
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <select 
                name="security_question" 
                onChange={handleChange} 
                className="bg-[#333] border-none p-3 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-red-600 outline-none w-full text-sm"
              >
                <option>What is the name of your first pet?</option>
                <option>What is your mother's maiden name?</option>
                <option>What was the name of your elementary school?</option>
                <option>What city were you born in?</option>
                <option>What is your favorite food?</option>
              </select>
              <input 
                name="security_answer" 
                placeholder="Security Answer" 
                onChange={handleChange} 
                className="bg-[#333] border-none p-3 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-red-600 outline-none w-full"
                required 
              />
            </>
          )}

          <input 
            type="email" 
            name="email" 
            placeholder="Email" 
            onChange={handleChange} 
            className="bg-[#333] border-none p-3 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-red-600 outline-none w-full"
            required 
          />
          <input 
            type="password" 
            name="password" 
            placeholder="Password" 
            onChange={handleChange} 
            className="bg-[#333] border-none p-3 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-red-600 outline-none w-full"
            required 
          />
          
          <button 
            type="submit" 
            className="w-full bg-red-600 text-white py-3 rounded font-bold hover:bg-red-700 transition duration-200"
          >
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          {isLogin ? "New to TripChalo? " : "Already have an account? "}
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-white font-medium hover:underline ml-1"
          >
            {isLogin ? 'Sign up now.' : 'Sign in.'}
          </button>
        </div>
      </div>
    </div>
  );
}