import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, IndianRupee, MapPin, Hash, Check } from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../api';

const TAGS = ["Adventure", "Relaxation", "Nature", "Culture", "Food", "Nightlife", "Shopping", "History"];
const BUDGETS = ["₹5,000 - ₹10,000", "₹10,000 - ₹20,000", "₹20,000 - ₹50,000", "₹50,000+"];

export default function JoinTrip() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    trip_code: '',
    home_town: '',
    start_date: '',
    end_date: '',
    budget_range: '₹10,000 - ₹20,000',
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
        user_id: user.user_id,
        trip_code: formData.trip_code.toUpperCase() // Ensure code is uppercase
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
    <div className="min-h-screen bg-[#141414] text-white font-sans">
      <Navbar user={user} onLogout={() => { localStorage.removeItem('user'); navigate('/'); }} />

      <div className="max-w-3xl mx-auto px-6 py-24">
        <h1 className="text-4xl font-extrabold mb-2 text-blue-500">Join an Adventure</h1>
        <p className="text-gray-400 mb-8">Enter the unique code shared by your Trip Leader.</p>

        <form onSubmit={handleSubmit} className="space-y-8 bg-[#1f1f1f] p-8 rounded-xl border border-gray-800 shadow-2xl">
          
          {/* 1. The Trip Code (Most Important) */}
          <div className="bg-blue-900/20 p-6 rounded-lg border border-blue-900/50">
            <label className="block text-blue-400 text-sm mb-2 flex items-center gap-2 font-bold uppercase tracking-wider">
              <Hash size={16} /> Enter Trip Code
            </label>
            <input 
              required
              maxLength={6}
              placeholder="e.g. XY782B"
              className="w-full bg-[#141414] border border-blue-800 p-4 rounded text-white focus:border-blue-500 outline-none text-3xl font-mono tracking-[0.5em] text-center uppercase"
              value={formData.trip_code}
              onChange={(e) => setFormData({...formData, trip_code: e.target.value.toUpperCase()})}
            />
            {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
          </div>

          <div className="border-t border-gray-800 pt-6">
             <h3 className="text-xl font-bold mb-4 text-gray-300">Your Preferences for this Trip</h3>
             
             {/* 2. Logistics */}
             <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-gray-400 text-sm mb-2 flex items-center gap-2">
                    <MapPin size={16} /> Your Starting City
                  </label>
                  <input 
                    required
                    placeholder="e.g. Mumbai"
                    className="w-full bg-[#141414] border border-gray-700 p-3 rounded text-white focus:border-blue-500 outline-none"
                    value={formData.home_town}
                    onChange={(e) => setFormData({...formData, home_town: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2 flex items-center gap-2">
                    <IndianRupee size={16} /> Your Budget Range
                  </label>
                  <select 
                    className="w-full bg-[#141414] border border-gray-700 p-3 rounded text-white focus:border-blue-500 outline-none"
                    value={formData.budget_range}
                    onChange={(e) => setFormData({...formData, budget_range: e.target.value})}
                  >
                    {BUDGETS.map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
             </div>

             {/* 3. Availability */}
             <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-gray-400 text-sm mb-2 flex items-center gap-2">
                    <Calendar size={16} /> I'm Free From
                  </label>
                  <input 
                    type="date" 
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-[#141414] border border-gray-700 p-3 rounded text-white focus:border-blue-500 outline-none"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2 flex items-center gap-2">
                    <Calendar size={16} /> Until
                  </label>
                  <input 
                    type="date" 
                    required
                    min={formData.start_date || new Date().toISOString().split('T')[0]}
                    className="w-full bg-[#141414] border border-gray-700 p-3 rounded text-white focus:border-blue-500 outline-none"
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                  />
                </div>
             </div>

             {/* 4. Tags */}
             <div>
                <label className="block text-gray-400 text-sm mb-3">Your Interest Tags</label>
                <div className="flex flex-wrap gap-3">
                  {TAGS.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-4 py-2 rounded-full border transition flex items-center gap-2 ${
                        formData.preference_tags.includes(tag) 
                        ? 'bg-blue-600 text-white border-blue-600 font-bold' 
                        : 'bg-transparent text-gray-400 border-gray-600 hover:border-white'
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
            className="w-full bg-blue-600 text-white py-4 rounded font-bold text-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Joining..." : "Join Trip 🚀"}
          </button>

        </form>
      </div>
    </div>
  );
}