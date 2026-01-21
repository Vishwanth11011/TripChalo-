import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api';
import { Calendar, IndianRupee, MapPin, Clock, Check, Sparkles } from 'lucide-react';

const TAGS = ["Adventure", "Relaxation", "Nature", "Culture", "Food", "Nightlife", "Shopping", "History"];
const BUDGETS = ["₹5,000 - ₹10,000", "₹10,000 - ₹20,000", "₹20,000 - ₹50,000", "₹50,000+"];

// Background Image
const BG_IMAGE = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop";

export default function CreateTrip({ onOpenAuth }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    trip_name: '',
    home_town: '',
    start_date: '',
    end_date: '',
    budget_range: BUDGETS[0], 
    voting_days: 2,
    preference_tags: [],
    is_public: false 
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
    try {
      const payload = { ...formData, user_id: user.user_id || user.id }; 
      const res = await api.post('/trips/create', payload);
      alert(`Trip Created! Code: ${res.data.trip_code}`);
      navigate('/profile'); 
    } catch (err) {
      alert("Failed to create trip. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen text-white font-sans bg-cover bg-center bg-fixed relative" // Added 'relative'
      style={{ backgroundImage: `url(${BG_IMAGE})` }}
    >
      {/* FIX: Changed from 'absolute' to 'fixed inset-0'.
         This forces the black tint to stick to the screen window 
         even when you scroll down.
      */}
      <div className="fixed inset-0 bg-black/60 z-0 pointer-events-none"></div>

      {/* Content Wrapper (z-10 ensures it sits ON TOP of the overlay) */}
      <div className="relative z-10">
        <Navbar 
            user={user} 
            onLogout={() => { localStorage.removeItem('user'); navigate('/'); }} 
            onOpenAuth={onOpenAuth} 
        />

        <div className="max-w-3xl mx-auto px-6 py-28">
          <div className="text-center mb-10 animate-fade-in-up">
              <h1 className="text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400 drop-shadow-lg">
                Create New Trip
              </h1>
              <p className="text-xl text-gray-200 font-light">
                Set the rules, invite friends, and let AI plan the rest.
              </p>
          </div>

          <form 
            onSubmit={handleSubmit} 
            className="space-y-8 bg-black/40 backdrop-blur-xl p-8 md:p-10 rounded-3xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] animate-fade-in-up delay-100"
          >

            <div className="mb-6">
              <label className="block text-gray-300 text-sm mb-2 font-bold uppercase tracking-wider">Trip Name</label>
              <input 
                required
                placeholder="e.g. Goa 2025 Bachelors Trip"
                className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white placeholder-gray-500 focus:border-red-500 focus:bg-white/10 outline-none text-xl font-bold transition"
                value={formData.trip_name}
                onChange={(e) => setFormData({...formData, trip_name: e.target.value})}
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 text-sm mb-2 flex items-center gap-2">
                  <MapPin size={16} /> Starting City
                </label>
                <input 
                  required
                  className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white focus:border-red-500 outline-none transition"
                  placeholder="e.g. Hyderabad"
                  value={formData.home_town}
                  onChange={(e) => setFormData({...formData, home_town: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2 flex items-center gap-2">
                  <IndianRupee size={16} /> Budget Per Person
                </label>
                <select 
                  className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white focus:border-red-500 outline-none transition [&>option]:bg-[#141414]"
                  value={formData.budget_range}
                  onChange={(e) => setFormData({...formData, budget_range: e.target.value})}
                >
                  {BUDGETS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 text-sm mb-2 flex items-center gap-2">
                  <Calendar size={16} /> Start Date
                </label>
                <input 
                  type="date" 
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white focus:border-red-500 outline-none transition [color-scheme:dark]"
                  value={formData.start_date}
                  onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm mb-2 flex items-center gap-2">
                  <Calendar size={16} /> End Date
                </label>
                <input 
                  type="date" 
                  required
                  min={formData.start_date || new Date().toISOString().split('T')[0]}
                  className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white focus:border-red-500 outline-none transition [color-scheme:dark]"
                  value={formData.end_date}
                  onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                />
              </div>
            </div>

            <div className="bg-white/5 p-5 rounded-xl border border-white/10">
               <label className="block text-gray-300 text-sm mb-3 flex items-center gap-2 font-bold">
                  <Clock size={16} /> Voting Duration (Deadline)
                </label>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 5, 7].map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setFormData({...formData, voting_days: day})}
                      className={`px-4 py-2 rounded-lg font-bold transition ${formData.voting_days === day ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}
                    >
                      {day} Days
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
                   <Sparkles size={12} className="text-yellow-500"/> AI will generate the plan automatically after {formData.voting_days} days.
                </p>
            </div>

            <div>
              <label className="block text-gray-300 text-sm mb-3 font-bold">What's the vibe? (Select multiple)</label>
              <div className="flex flex-wrap gap-3">
                {TAGS.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-5 py-2 rounded-full border transition flex items-center gap-2 backdrop-blur-sm ${
                      formData.preference_tags.includes(tag) 
                      ? 'bg-white text-black border-white font-bold shadow-[0_0_15px_rgba(255,255,255,0.4)]' 
                      : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/50 hover:bg-white/10'
                    }`}
                  >
                    {tag}
                    {formData.preference_tags.includes(tag) && <Check size={14} />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                <input 
                  type="checkbox"
                  id="isPublic"
                  className="w-5 h-5 accent-red-600 cursor-pointer"
                  checked={formData.is_public || false}
                  onChange={(e) => setFormData({...formData, is_public: e.target.checked})}
                />
                <label htmlFor="isPublic" className="cursor-pointer">
                    <span className="block font-bold text-white">Post to TravelTribe?</span>
                    <span className="text-xs text-gray-400">Allow other travelers in the community to find and join this trip.</span>
                </label>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 rounded-xl font-bold text-lg hover:from-red-500 hover:to-red-600 transition transform hover:scale-[1.02] shadow-xl shadow-red-900/40 disabled:opacity-50 disabled:scale-100"
            >
              {loading ? "Creating..." : "Launch Trip 🚀"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}