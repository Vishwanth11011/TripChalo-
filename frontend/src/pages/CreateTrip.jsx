import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api';
import { Calendar, IndianRupee, MapPin, Clock, Check } from 'lucide-react';

const TAGS = ["Adventure", "Relaxation", "Nature", "Culture", "Food", "Nightlife", "Shopping", "History"];
//const BUDGETS = ["$500 - $1000", "$1000 - $2000", "$2000 - $5000", "$5000+"];
// UPDATED BUDGET OPTIONS (IN RUPEES)
const BUDGETS = ["₹5,000 - ₹10,000", "₹10,000 - ₹20,000", "₹20,000 - ₹50,000", "₹50,000+"];

export default function CreateTrip() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    trip_name: '',
    home_town: '',
    start_date: '',
    end_date: '',
    budget_range: '$1000 - $2000',
    voting_days: 2,
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
    try {
      const payload = { ...formData, user_id: user.user_id };
      
      const res = await api.post('/trips/create', payload);
      
      // Success: Redirect to the new Trip Page (We will build this next)
      // For now, go to profile to see it in the list
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
    <div className="min-h-screen bg-[#141414] text-white font-sans">
      <Navbar user={user} onLogout={() => { localStorage.removeItem('user'); navigate('/'); }} />

      <div className="max-w-3xl mx-auto px-6 py-24">
        <h1 className="text-4xl font-extrabold mb-2 text-red-600">Create New Trip</h1>
        <p className="text-gray-400 mb-8">Set the rules, invite friends, and let AI plan the rest.</p>

        <form onSubmit={handleSubmit} className="space-y-8 bg-[#1f1f1f] p-8 rounded-xl border border-gray-800 shadow-2xl">

         {/* --- NEW TRIP NAME INPUT --- */}
          <div className="mb-6">
            <label className="block text-gray-400 text-sm mb-2 font-bold">Trip Name</label>
            <input 
              required
              placeholder="e.g. Goa 2025 Bachelors Trip"
              className="w-full bg-[#141414] border border-gray-700 p-4 rounded text-white focus:border-red-600 outline-none text-xl font-bold"
              value={formData.trip_name}
              onChange={(e) => setFormData({...formData, trip_name: e.target.value})}
            />
          </div>
          
          {/* 1. Trip Logistics */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-400 text-sm mb-2 flex items-center gap-2">
                <MapPin size={16} /> Starting City (Home Town)
              </label>
              <input 
                required
                className="w-full bg-[#141414] border border-gray-700 p-3 rounded text-white focus:border-red-600 outline-none"
                placeholder="e.g. Hyderabad"
                value={formData.home_town}
                onChange={(e) => setFormData({...formData, home_town: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2 flex items-center gap-2">
                <IndianRupee size={16} /> Budget Per Person
              </label>
              <select 
                className="w-full bg-[#141414] border border-gray-700 p-3 rounded text-white focus:border-red-600 outline-none"
                value={formData.budget_range}
                onChange={(e) => setFormData({...formData, budget_range: e.target.value})}
              >
                {BUDGETS.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
          </div>

         {/* ... inside the return statement ... */}

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-400 text-sm mb-2 flex items-center gap-2">
                <Calendar size={16} /> Start Date
              </label>
              <input 
                type="date" 
                required
                min={new Date().toISOString().split('T')[0]} // Block past dates
                className="w-full bg-[#141414] border border-gray-700 p-3 rounded text-white focus:border-red-600 outline-none"
                value={formData.start_date}
                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm mb-2 flex items-center gap-2">
                <Calendar size={16} /> End Date
              </label>
              <input 
                type="date" 
                required
                min={formData.start_date || new Date().toISOString().split('T')[0]} // Cannot be before Start Date
                className="w-full bg-[#141414] border border-gray-700 p-3 rounded text-white focus:border-red-600 outline-none"
                value={formData.end_date}
                onChange={(e) => setFormData({...formData, end_date: e.target.value})}
              />
            </div>
          </div>

          {/* 2. Voting Deadline */}
          <div>
             <label className="block text-gray-400 text-sm mb-2 flex items-center gap-2">
                <Clock size={16} /> Voting Duration (Deadline)
              </label>
              <div className="bg-[#141414] p-4 rounded border border-gray-700 flex justify-between items-center">
                <span className="text-gray-300">Allow voting for:</span>
                <div className="flex gap-2">
                  {[1, 2, 3, 5, 7].map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setFormData({...formData, voting_days: day})}
                      className={`px-4 py-2 rounded font-bold transition ${formData.voting_days === day ? 'bg-red-600 text-white' : 'bg-[#222] text-gray-500 hover:bg-[#333]'}`}
                    >
                      {day} Days
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">After {formData.voting_days} days, AI will automatically generate the plan.</p>
          </div>

          {/* 3. Vibe / Tags */}
          <div>
            <label className="block text-gray-400 text-sm mb-3">What's your vibe? (Select multiple)</label>
            <div className="flex flex-wrap gap-3">
              {TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-4 py-2 rounded-full border transition flex items-center gap-2 ${
                    formData.preference_tags.includes(tag) 
                    ? 'bg-white text-black border-white font-bold' 
                    : 'bg-transparent text-gray-400 border-gray-600 hover:border-white'
                  }`}
                >
                  {tag}
                  {formData.preference_tags.includes(tag) && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-red-600 text-white py-4 rounded font-bold text-lg hover:bg-red-700 transition disabled:opacity-50"
          >
            {loading ? "Creating..." : "Launch Trip 🚀"}
          </button>

        </form>
      </div>
    </div>
  );
}