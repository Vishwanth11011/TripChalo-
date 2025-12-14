import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api';
import { Map, Calendar, Copy, Check } from 'lucide-react';

// trip card

const TripCard = ({ trip, role, onClick }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation(); 
    navigator.clipboard.writeText(trip.trip_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      onClick={() => onClick(trip.id)} 
      className="bg-[#1f1f1f] min-w-[280px] p-5 rounded-lg cursor-pointer hover:bg-[#2a2a2a] transition border border-gray-800 hover:border-gray-600 group shrink-0 relative"
    >
      <div className="flex justify-between items-center mb-3">
        {/* Status Badge */}
        <div className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide ${trip.is_trip_confirmed ? "bg-green-900/50 text-green-400 border border-green-900" : "bg-red-900/30 text-red-500 border border-red-900/50"}`}>
          {trip.is_trip_confirmed ? "Confirmed" : "Voting"}
        </div>
        
        {/* Copy Code Button */}
        <button 
            onClick={handleCopy}
            className="flex items-center gap-2 bg-black/40 px-2 py-1 rounded border border-gray-700 hover:border-gray-500 hover:bg-gray-800 transition group/copy"
            title="Copy Join Code"
        >
           <span className="text-gray-400 text-xs font-mono tracking-wider group-hover/copy:text-white">{trip.trip_code}</span>
           {copied ? (
             <Check size={12} className="text-green-500" />
           ) : (
             <Copy size={12} className="text-gray-500 group-hover/copy:text-white" />
           )}
        </button>
      </div>
      
      {/* --- THIS IS THE TRIP NAME --- */}
      <h4 className="text-white font-bold text-lg mb-2 group-hover:text-red-500 transition truncate">
        {trip.trip_name || `Trip #${trip.id}`}  {/* Shows Name, or falls back to ID if empty */}
      </h4>
      
      <p className="text-gray-400 text-sm flex items-center gap-2">
        <Map size={14} className="text-blue-500" /> 
        {role === 'Leader' ? 'You are the Leader' : 'Participant'}
      </p>
    </div>
  );
};

// --- Main Component ---
export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check Login Status
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    // 2. Fetch Profile Data
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/users/${parsedUser.user_id}/profile`);
        setProfileData(res.data);
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] text-white flex items-center justify-center">
        <div className="animate-pulse">Loading Profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white font-sans">
      <Navbar user={user} onLogout={handleLogout} />

      <div className="max-w-6xl mx-auto px-6 py-24">
        
        {/* --- SECTION 1: HEADER & AVATAR --- */}
        <div className="flex flex-col md:flex-row items-center gap-8 mb-16 border-b border-gray-800 pb-12">
          {/* Avatar Circle */}
          <div className="w-32 h-32 bg-gradient-to-br from-red-600 to-black rounded-full flex items-center justify-center text-5xl font-bold shadow-2xl border-4 border-[#1f1f1f] text-white">
            {profileData?.first_name ? profileData.first_name[0].toUpperCase() : "U"}
          </div>
          
          {/* User Details */}
          <div className="text-center md:text-left space-y-2">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              {profileData?.first_name} {profileData?.last_name}
            </h1>
            <p className="text-gray-400 text-lg">{profileData?.email}</p>
            
            <div className="flex gap-4 justify-center md:justify-start mt-4 pt-2">
              <span className="bg-[#222] px-4 py-1.5 rounded-full text-sm text-gray-300 border border-gray-700">
                Age: {profileData?.age}
              </span>
              <span className="bg-[#222] px-4 py-1.5 rounded-full text-sm text-gray-300 border border-gray-700">
                {profileData?.gender}
              </span>
            </div>
          </div>
        </div>

        {/* --- SECTION 2: CREATED TRIPS --- */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
            <Calendar className="text-red-600" size={28} /> 
            Trips Created by You
          </h2>
          
          {profileData?.created_trips?.length > 0 ? (
            <div className="flex overflow-x-auto gap-6 pb-6 scrollbar-hide">
              {profileData.created_trips.map(trip => (
                <TripCard 
                  key={trip.id} 
                  trip={trip} 
                  role="Leader" 
                  onClick={(id) => navigate(`/trip/${id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-[#1a1a1a] p-10 rounded-xl text-center border border-dashed border-gray-800">
              <p className="text-gray-500 mb-4">You haven't led any trips yet.</p>
              <button 
                onClick={() => navigate('/create-trip')}
                className="bg-red-600 text-white px-6 py-2 rounded font-bold hover:bg-red-700 transition"
              >
                Create New Trip
              </button>
            </div>
          )}
        </div>

        {/* --- SECTION 3: JOINED TRIPS --- */}
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
            <Map className="text-blue-500" size={28} /> 
            Trips Joined
          </h2>
          
          {profileData?.joined_trips?.length > 0 ? (
            <div className="flex overflow-x-auto gap-6 pb-6 scrollbar-hide">
              {profileData.joined_trips.map(trip => (
                <TripCard 
                  key={trip.id} 
                  trip={trip} 
                  role="Participant" 
                  onClick={(id) => navigate(`/trip/${id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-[#1a1a1a] p-10 rounded-xl text-center border border-dashed border-gray-800">
              <p className="text-gray-500">You haven't joined any other trips yet.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}