import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, IndianRupee, MapPin, Hash, Check } from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../api';

const TAGS = ["Adventure", "Relaxation", "Nature", "Culture", "Food", "Nightlife", "Shopping", "History"];
const BUDGETS = ["₹5,000 - ₹10,000", "₹10,000 - ₹20,000", "₹20,000 - ₹50,000", "₹50,000+"];

const BG_IMAGE = "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2144&auto=format&fit=crop";

export default function JoinTrip({ onOpenAuth }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    trip_code: '',
    home_town: '',
    start_date: '',
    end_date: '',
    budget_range: BUDGETS[0],
    preference_tags: []
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) navigate('/');
    else setUser(JSON.parse(storedUser));
  }, [navigate]);

  const toggleTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      preference_tags: prev.preference_tags.includes(tag)
        ? prev.preference_tags.filter(t => t !== tag)
        : [...prev.preference_tags, tag]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = { 
        ...formData, 
        user_id: user.user_id || user.id,
        trip_code: formData.trip_code.toUpperCase() 
      };
      const res = await api.post('/trips/join', payload);
      alert(`Success! You joined "${res.data.trip_name}"`);
      navigate('/profile'); 
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to join trip. Check the code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen text-white font-sans bg-cover bg-center bg-fixed relative"
      style={{ backgroundImage: `url(${BG_IMAGE})` }}
    >
      {/* FIXED OVERLAY: Covers full screen always */}
      <div className="fixed inset-0 bg-black/60 z-0 pointer-events-none"></div>

      <div className="relative z-10">
        <Navbar 
            user={user} 
            onLogout={() => { localStorage.removeItem('user'); navigate('/'); }} 
            onOpenAuth={onOpenAuth} 
        />

        <div className="max-w-3xl mx-auto px-6 py-28">
          <div className="text-center mb-10 animate-fade-in-up">
             <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 drop-shadow-lg">
                Join an Adventure
             </h1>
             <p className="text-xl text-gray-200">Enter the unique code shared by your Trip Leader.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 bg-black/40 backdrop-blur-xl p-8 md:p-10 rounded-3xl border border-white/10 shadow-2xl animate-fade-in-up delay-100">
            
            {/* 1. Trip Code (Highlighted Glass) */}
            <div className="bg-blue-900/20 backdrop-blur-md p-6 rounded-2xl border border-blue-500/30 shadow-[0_0_20px_rgba(37,99,235,0.2)]">
              <label className="block text-blue-300 text-sm mb-2 flex items-center gap-2 font-bold uppercase tracking-wider justify-center">
                <Hash size={16} /> Enter Trip Code
              </label>
              <input 
                required
                maxLength={6}
                placeholder="XY782B"
                className="w-full bg-black/30 border border-blue-500/50 p-4 rounded-xl text-white focus:bg-black/50 focus:border-blue-400 outline-none text-4xl font-mono tracking-[0.5em] text-center uppercase placeholder-gray-600 transition"
                value={formData.trip_code}
                onChange={(e) => setFormData({...formData, trip_code: e.target.value.toUpperCase()})}
              />
              {error && <p className="text-red-400 text-sm mt-3 text-center bg-red-900/20 py-1 rounded border border-red-900/50">{error}</p>}
            </div>

            <div className="border-t border-white/10 pt-6">
               <h3 className="text-xl font-bold mb-6 text-gray-200 flex items-center gap-2">
                 Your Preferences <span className="text-sm font-normal text-gray-400">(How you want to travel)</span>
               </h3>
               
               {/* 2. Logistics */}
               <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-gray-300 text-sm mb-2 flex items-center gap-2">
                      <MapPin size={16} /> Starting City
                    </label>
                    <input 
                      required
                      placeholder="e.g. Mumbai"
                      className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white focus:border-blue-500 outline-none transition"
                      value={formData.home_town}
                      onChange={(e) => setFormData({...formData, home_town: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm mb-2 flex items-center gap-2">
                      <IndianRupee size={16} /> Budget Range
                    </label>
                    <select 
                      className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white focus:border-blue-500 outline-none transition [&>option]:bg-[#141414]"
                      value={formData.budget_range}
                      onChange={(e) => setFormData({...formData, budget_range: e.target.value})}
                    >
                      {BUDGETS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
               </div>

               {/* 3. Availability */}
               <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-gray-300 text-sm mb-2 flex items-center gap-2">
                      <Calendar size={16} /> Free From
                    </label>
                    <input 
                      type="date" 
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white focus:border-blue-500 outline-none transition [color-scheme:dark]"
                      value={formData.start_date}
                      onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm mb-2 flex items-center gap-2">
                      <Calendar size={16} /> Until
                    </label>
                    <input 
                      type="date" 
                      required
                      min={formData.start_date || new Date().toISOString().split('T')[0]}
                      className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white focus:border-blue-500 outline-none transition [color-scheme:dark]"
                      value={formData.end_date}
                      onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    />
                  </div>
               </div>

               {/* 4. Tags */}
               <div>
                  <label className="block text-gray-300 text-sm mb-3 font-bold">Your Interests</label>
                  <div className="flex flex-wrap gap-3">
                    {TAGS.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-5 py-2 rounded-full border transition flex items-center gap-2 backdrop-blur-sm ${
                          formData.preference_tags.includes(tag) 
                          ? 'bg-blue-600 text-white border-blue-500 font-bold shadow-lg shadow-blue-600/30' 
                          : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/50 hover:bg-white/10'
                        }`}
                      >
                        {tag}
                        {formData.preference_tags.includes(tag) && <Check size={14} />}
                      </button>
                    ))}
                  </div>
               </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-500 hover:to-blue-600 transition transform hover:scale-[1.02] shadow-xl shadow-blue-900/40 disabled:opacity-50 disabled:scale-100"
            >
              {loading ? "Joining..." : "Join Trip 🚀"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}