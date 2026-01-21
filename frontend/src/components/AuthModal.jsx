import { useState } from 'react';
import { X, LogIn, UserPlus } from 'lucide-react';
import api from '../api';

const QUESTIONS = [
    "What is the name of your first pet?",
    "What is your mother's maiden name?",
    "What was the name of your elementary school?",
    "What city were you born in?",
    "What is your favorite food?"
];

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
    const [mode, setMode] = useState(initialMode);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [formData, setFormData] = useState({
        first_name: '', last_name: '', email: '', password: '', 
        age: '', gender: 'Male', 
        security_question: QUESTIONS[0], security_answer: ''
    });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            if (mode === 'login') {
                // FIX 1: Changed route from '/users/login' to '/login'
                const res = await api.post('/login', {
                    email: formData.email,
                    password: formData.password
                });
                
                // 1. Save User Data
                localStorage.setItem('user', JSON.stringify(res.data));
                
                // 2. Close Modal
                onClose();

                // FIX 2: Force Redirect to Home to update Navbar immediately
                window.location.href = '/'; 

            } else {
                // FIX 1: Changed route from '/users/signup' to '/signup'
                await api.post('/signup', formData);
                alert("Account created! Please login.");
                setMode('login'); 
                setLoading(false); 
            }
        } catch (err) {
            console.error("Auth Error:", err);
            const msg = err.response?.data?.detail 
            ? (Array.isArray(err.response.data.detail) ? err.response.data.detail[0].msg : err.response.data.detail)
            : "Login failed. Check your email/password.";
            setError(msg);
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
            
            <div className="relative bg-[#1f1f1f] w-full max-w-md rounded-2xl border border-gray-700 shadow-2xl p-6 animate-fade-in-up">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <X size={24} />
                </button>

                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-white mb-1">
                        {mode === 'login' ? 'Welcome Back' : 'Join TripChalo'}
                    </h2>
                    <p className="text-gray-400 text-sm">
                        {mode === 'login' ? 'Login to continue your journey' : 'Create an account to start planning'}
                    </p>
                </div>

                {error && <div className="bg-red-900/20 text-red-400 p-3 rounded mb-4 text-sm text-center border border-red-900/50">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === 'signup' && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <input required placeholder="First Name" className="bg-[#141414] border border-gray-700 p-3 rounded text-white outline-none focus:border-red-600 transition"
                                    value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} />
                                <input required placeholder="Last Name" className="bg-[#141414] border border-gray-700 p-3 rounded text-white outline-none focus:border-red-600 transition"
                                    value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input required type="number" placeholder="Age" className="bg-[#141414] border border-gray-700 p-3 rounded text-white outline-none focus:border-red-600 transition"
                                    value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
                                <select className="bg-[#141414] border border-gray-700 p-3 rounded text-white outline-none focus:border-red-600 transition"
                                    value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                                    <option>Male</option><option>Female</option><option>Other</option>
                                </select>
                            </div>
                        </>
                    )}

                    <input required type="email" placeholder="Email" className="w-full bg-[#141414] border border-gray-700 p-3 rounded text-white outline-none focus:border-red-600 transition"
                        value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    
                    <input required type="password" placeholder="Password" className="w-full bg-[#141414] border border-gray-700 p-3 rounded text-white outline-none focus:border-red-600 transition"
                        value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />

                    {mode === 'signup' && (
                        <div className="space-y-2">
                             <select className="w-full bg-[#1f1f1f] border border-gray-700 p-2 rounded text-white text-sm outline-none"
                                value={formData.security_question} onChange={e => setFormData({...formData, security_question: e.target.value})}>
                                {QUESTIONS.map(q => <option key={q} value={q}>{q}</option>)}
                            </select>
                            <input required placeholder="Security Answer" className="w-full bg-[#1f1f1f] border border-gray-700 p-2 rounded text-white text-sm outline-none focus:border-red-600 transition"
                                value={formData.security_answer} onChange={e => setFormData({...formData, security_answer: e.target.value})} />
                        </div>
                    )}

                    <button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded font-bold mt-4 flex justify-center items-center gap-2 transition transform active:scale-95">
                        {loading ? "Processing..." : (mode === 'login' ? <>Login <LogIn size={18}/></> : <>Sign Up <UserPlus size={18}/></>)}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-400">
                    <button 
                        onClick={() => { setError(''); setMode(mode === 'login' ? 'signup' : 'login'); }}
                        className="text-white font-bold hover:underline"
                    >
                        {mode === 'login' ? 'Create an account' : 'Back to Login'}
                    </button>
                </div>
            </div>
        </div>
    );
}