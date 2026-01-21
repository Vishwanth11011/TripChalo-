import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api';
import { Globe, User, Check, AlertCircle, MapPin, Calendar, IndianRupee } from 'lucide-react';

const VIBES = ["Relaxed 😌", "Adventure 🧗", "Party 🎉", "Cultural 🏛️", "Foodie 🍕"];
const PACES = ["Chill (1 city/week)", "Balanced", "Fast (Everything everywhere)"];
const DIETS = ["No Restrictions", "Vegetarian", "Vegan", "Halal", "Gluten Free"];

export default function TravelTribe() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [publicTrips, setPublicTrips] = useState([]);
  
  // Survey State
  const [surveyData, setSurveyData] = useState({
    vibe: VIBES[0],
    pace: PACES[1],
    budget_tier: "Mid-Range",
    diet: DIETS[0],
    interests: [],
    bio: ""
  });

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user'));
    if (!u) { navigate('/'); return; }
    
    // Check backend if profile is actually complete (don't rely just on localstorage)
    const checkProfile = async () => {
        try {
            // We can reuse the profile endpoint or rely on the user object if updated
            // For now, let's fetch user details or assume logic based on a specific fetch
            // Simulating fetch logic:
            if (u.profile_completed) {
                setIsProfileComplete(true);
                fetchPublicTrips();
            } else {
                setIsProfileComplete(false);
            }
            setUser(u);
        } catch(e) { console.error(e); } 
        finally { setLoading(false); }
    };
    checkProfile();
  }, []);

  const fetchPublicTrips = async () => {
      try {
          const res = await api.get('/trips/public');
          setPublicTrips(res.data);
      } catch (e) { console.error("Failed to load tribe", e); }
  };

  const handleSurveySubmit = async (e) => {
      e.preventDefault();
      try {
          await api.put(`/users/${user.user_id}/complete-profile`, surveyData);
          
          // Update local storage
          const updatedUser = { ...user, profile_completed: true };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setUser(updatedUser);
          
          setIsProfileComplete(true);
          fetchPublicTrips();
      } catch (e) {
          alert("Failed to save profile.");
      }
  };

  if (loading) return <div className="min-h-screen bg-[#141414] text-white flex justify-center items-center">Checking Visa...</div>;

  return (
    <div className="min-h-screen bg-[#141414] text-white font-sans">
      <Navbar user={user} onLogout={() => { localStorage.removeItem('user'); navigate('/'); }} activeSection="tribe"/>

      {/* --- SCENARIO 1: PROFILE INCOMPLETE (SHOW SURVEY) --- */}
      {!isProfileComplete && (
        <div className="max-w-3xl mx-auto px-6 py-28 animate-fade-in-up">
            <div className="text-center mb-10">
                <div className="inline-block p-4 rounded-full bg-blue-900/30 text-blue-400 mb-4 border border-blue-500/30">
                    <Globe size={48} />
                </div>
                <h1 className="text-4xl font-extrabold mb-4">Welcome to TravelTribe</h1>
                <p className="text-xl text-gray-400">
                    To join the community, we need to know your travel style. 
                    <br/> This helps us match you with the right squad.
                </p>
            </div>

            <form onSubmit={handleSurveySubmit} className="bg-[#1f1f1f] border border-gray-800 p-8 rounded-3xl shadow-2xl space-y-8">
                {/* Vibe & Pace */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-gray-400 text-sm font-bold mb-2">Travel Vibe</label>
                        <select className="w-full bg-[#141414] border border-gray-700 p-3 rounded-xl text-white outline-none"
                            value={surveyData.vibe} onChange={e => setSurveyData({...surveyData, vibe: e.target.value})}>
                            {VIBES.map(v => <option key={v}>{v}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-400 text-sm font-bold mb-2">Pace</label>
                        <select className="w-full bg-[#141414] border border-gray-700 p-3 rounded-xl text-white outline-none"
                            value={surveyData.pace} onChange={e => setSurveyData({...surveyData, pace: e.target.value})}>
                            {PACES.map(p => <option key={p}>{p}</option>)}
                        </select>
                    </div>
                </div>

                {/* Diet & Bio */}
                <div>
                     <label className="block text-gray-400 text-sm font-bold mb-2">Dietary Restrictions</label>
                     <select className="w-full bg-[#141414] border border-gray-700 p-3 rounded-xl text-white outline-none"
                            value={surveyData.diet} onChange={e => setSurveyData({...surveyData, diet: e.target.value})}>
                            {DIETS.map(d => <option key={d}>{d}</option>)}
                     </select>
                </div>

                <div>
                    <label className="block text-gray-400 text-sm font-bold mb-2">Quick Bio (What makes you a good travel buddy?)</label>
                    <textarea 
                        className="w-full bg-[#141414] border border-gray-700 p-4 rounded-xl text-white outline-none h-24 placeholder-gray-600"
                        placeholder="I take great photos and I'm never late for flights..."
                        value={surveyData.bio}
                        onChange={e => setSurveyData({...surveyData, bio: e.target.value})}
                    />
                </div>

                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-blue-900/20">
                    Unlock Community 🔓
                </button>
            </form>
        </div>
      )}

      {/* --- SCENARIO 2: FEED (SHOW TRIPS) --- */}
      {isProfileComplete && (
          <div className="max-w-6xl mx-auto px-6 py-28">
              <div className="flex justify-between items-end mb-10 border-b border-gray-800 pb-6">
                  <div>
                    <h1 className="text-4xl font-extrabold mb-2 flex items-center gap-3">
                        <Globe className="text-blue-500" /> TravelTribe
                    </h1>
                    <p className="text-gray-400">Find open trips and join new adventures.</p>
                  </div>
                  <button onClick={() => navigate('/create-trip')} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-bold text-sm transition">
                      + Post a Trip
                  </button>
              </div>

              {publicTrips.length === 0 ? (
                  <div className="text-center py-20 bg-[#1f1f1f] rounded-2xl border border-dashed border-gray-800">
                      <p className="text-gray-500 text-xl">No public trips active right now.</p>
                      <p className="text-gray-600 text-sm mt-2">Be the first to create one!</p>
                  </div>
              ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {publicTrips.map(trip => (
                          <div key={trip.id} className="bg-[#1f1f1f] rounded-2xl overflow-hidden border border-gray-800 hover:border-blue-500 transition group relative">
                              <div className="h-24 bg-gradient-to-r from-blue-900 to-purple-900"></div>
                              <div className="p-6 relative">
                                  {/* Avatar overlap */}
                                  <div className="absolute -top-10 left-6 w-16 h-16 bg-[#1f1f1f] rounded-full p-1">
                                      <div className="w-full h-full bg-gray-700 rounded-full flex items-center justify-center text-xl font-bold">
                                          {trip.leader_name[0]}
                                      </div>
                                  </div>
                                  
                                  <div className="mt-6">
                                      <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition">{trip.trip_name}</h3>
                                      <p className="text-xs text-blue-400 font-bold uppercase tracking-wider mb-4">By {trip.leader_name}</p>
                                      
                                      <div className="space-y-2 text-sm text-gray-300 mb-6">
                                          <div className="flex items-center gap-2"><MapPin size={14} className="text-gray-500"/> {trip.home_town}</div>
                                          <div className="flex items-center gap-2"><Calendar size={14} className="text-gray-500"/> {trip.start_date}</div>
                                          <div className="flex items-center gap-2"><IndianRupee size={14} className="text-gray-500"/> {trip.budget_range}</div>
                                      </div>

                                      <div className="flex flex-wrap gap-2 mb-6">
                                          {trip.preference_tags.slice(0,3).map((tag, i) => (
                                              <span key={i} className="text-[10px] bg-white/5 px-2 py-1 rounded border border-white/10 text-gray-400">
                                                  {tag}
                                              </span>
                                          ))}
                                      </div>

                                      <button 
                                        onClick={() => {
                                            alert(`Use code ${trip.trip_code} to join!`);
                                            navigate('/join-trip');
                                        }}
                                        className="w-full bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white py-3 rounded-lg font-bold text-sm transition border border-blue-900"
                                      >
                                          Join Trip
                                      </button>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      )}
    </div>
  );
}