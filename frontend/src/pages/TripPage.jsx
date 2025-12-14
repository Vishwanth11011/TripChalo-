import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { Users, Copy, Check, Clock, Lock, Sparkles, AlertTriangle, Trash2, LogOut, Home, Map } from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../api';

// --- SUB-COMPONENT: COOL AI LOADING SCREEN ---
const AILoadingScreen = () => {
  const [msgIndex, setMsgIndex] = useState(0);
  const messages = [
    "Analyzing group preferences...",
    "Scanning specifically for Indian hidden gems...",
    "Checking budget constraints...",
    "Filtering for best vacation vibes...",
    "Finalizing two perfect options..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % messages.length);
    }, 1500); // Change message every 1.5s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-6 text-center">
      {/* Pulsing Orb */}
      <div className="relative w-32 h-32 mb-8">
        <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl animate-pulse opacity-50"></div>
        <div className="absolute inset-2 bg-purple-600 rounded-full blur-lg animate-ping opacity-30"></div>
        <div className="relative z-10 w-full h-full bg-[#111] rounded-full border-2 border-blue-500 flex items-center justify-center">
          <Sparkles size={48} className="text-blue-400 animate-spin-slow" />
        </div>
      </div>
      
      {/* Dynamic Text */}
      <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2 animate-fade-in">
        AI Travel Agent is Working
      </h2>
      <p className="text-gray-400 text-lg h-6 transition-all duration-500 ease-in-out">
        {messages[msgIndex]}
      </p>
    </div>
  );
};

// --- MAIN COMPONENT ---
export default function TripPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState(null); 
  const [copied, setCopied] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // UI States
  const [processing, setProcessing] = useState(false); // For lock/delete
  const [generating, setGenerating] = useState(false); // For AI Animation

  const COLORS = ['#dc2626', '#2563eb', '#16a34a', '#d97706', '#9333ea'];

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/');
      return;
    }
    setCurrentUser(JSON.parse(storedUser));

    const fetchTrip = async () => {
      try {
        const res = await api.get(`/trips/${tripId}`);
        setTrip(res.data);
      } catch (err) {
        if (err.response && err.response.status === 404) setErrorStatus(404);
        else setErrorStatus(500);
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [tripId, navigate]);

  const handleCopy = () => {
    if (trip?.trip_code) {
        navigator.clipboard.writeText(trip.trip_code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLockTrip = async () => {
    if (!window.confirm("Are you sure? This will stop new members from joining.")) return;
    setProcessing(true);
    try {
        await api.post(`/trips/${tripId}/lock?user_id=${currentUser.user_id}`);
        setTrip(prev => ({...prev, is_trip_confirmed: true}));
    } catch (err) {
        alert("Failed to lock trip.");
    } finally {
        setProcessing(false);
    }
  };

  const handleDeleteTrip = async () => {
      if (!window.confirm("⚠️ DANGER: Delete trip permanently?")) return;
      setProcessing(true);
      try {
          await api.delete(`/trips/${tripId}?user_id=${currentUser.user_id}`);
          navigate('/profile');
      } catch (err) {
          alert("Failed to delete.");
          setProcessing(false);
      }
  };

  const handleLeaveTrip = async () => {
      if (!window.confirm("Leave this trip?")) return;
      setProcessing(true);
      try {
          await api.delete(`/trips/${tripId}/leave?user_id=${currentUser.user_id}`);
          navigate('/profile');
      } catch (err) {
          alert("Failed to leave.");
          setProcessing(false);
      }
  };

  const handleGenerateItinerary = async () => {
      setGenerating(true); // <--- Starts the Animation
      try {
          await api.post(`/trips/${tripId}/generate?user_id=${currentUser.user_id}`);
          // Slight delay so user can enjoy the animation :)
          setTimeout(() => {
              navigate(`/trip/${tripId}/itinerary`);
          }, 2000);
      } catch (err) {
          setGenerating(false);
          alert("Failed to generate itinerary. Check API Key.");
      }
  };

  if (loading) return <div className="min-h-screen bg-[#141414] text-white flex items-center justify-center animate-pulse">Loading Dashboard...</div>;
  if (errorStatus === 404) return <div className="min-h-screen bg-[#141414] text-white flex items-center justify-center">Trip Cancelled or Not Found.</div>;
  if (errorStatus || !trip) return <div className="min-h-screen bg-[#141414] text-white flex items-center justify-center">Something went wrong.</div>;

  const isLeader = currentUser?.user_id === trip.leader_id;

  return (
    <div className="min-h-screen bg-[#141414] text-white font-sans">
      
      {/* --- SHOW ANIMATION IF GENERATING --- */}
      {generating && <AILoadingScreen />}

      <Navbar user={currentUser} onLogout={() => navigate('/')} />

      <div className="max-w-6xl mx-auto px-6 py-24">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 border-b border-gray-800 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
               <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-widest border ${trip.is_trip_confirmed ? "bg-green-900/20 text-green-500 border-green-900" : "bg-blue-600/20 text-blue-400 border-blue-900"}`}>
                 {trip.is_trip_confirmed ? "Trip Locked" : "Voting Open"}
               </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-2">{trip.trip_name}</h1>
            <p className="text-gray-400">Trip ID: <span className="font-mono">#{trip.trip_code}</span></p>
          </div>
          
          {/* Show Join Code ONLY if not locked */}
          {!trip.is_trip_confirmed && (
            <div className="mt-6 md:mt-0 bg-[#1f1f1f] p-5 rounded-xl border border-gray-700 flex flex-col items-center">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 font-bold">Share Code</span>
                <div className="flex items-center gap-3">
                    <span className="text-3xl font-mono font-bold tracking-wider text-white">{trip.trip_code}</span>
                    <button onClick={handleCopy} className="bg-gray-800 p-2 rounded hover:bg-gray-700 transition text-gray-300">
                        {copied ? <Check size={18} className="text-green-500"/> : <Copy size={18}/>}
                    </button>
                </div>
            </div>
          )}
        </div>

        {/* --- ITINERARY READY BANNER (VISIBLE TO EVERYONE) --- */}
        {trip.has_itinerary && (
            <div className="mb-12 bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-500/30 p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg shadow-blue-900/20">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-500 p-3 rounded-full text-white shadow-lg shadow-blue-500/50">
                        <Map size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Itinerary Ready!</h2>
                        <p className="text-blue-200">The AI has generated 2 perfect plans for your group.</p>
                    </div>
                </div>
                <button 
                    onClick={() => navigate(`/trip/${tripId}/itinerary`)}
                    className="bg-white text-blue-900 px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition shadow-xl transform hover:scale-105"
                >
                    View & Vote Now
                </button>
            </div>
        )}

        {/* STATS & CHARTS */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-[#1f1f1f] p-6 rounded-xl border border-gray-800 flex items-center gap-4">
                <div className="bg-blue-900/30 p-3 rounded-full text-blue-500"><Users size={24} /></div>
                <div><h3 className="text-2xl font-bold">{trip.participants.length}</h3><p className="text-gray-400 text-sm">Joined</p></div>
            </div>
            <div className="bg-[#1f1f1f] p-6 rounded-xl border border-gray-800 flex items-center gap-4">
                <div className="bg-green-900/30 p-3 rounded-full text-green-500"><Check size={24} /></div>
                <div><h3 className="text-2xl font-bold">{trip.participants.length}</h3><p className="text-gray-400 text-sm">Voted</p></div>
            </div>
            <div className="bg-[#1f1f1f] p-6 rounded-xl border border-gray-800 flex items-center gap-4">
                <div className="bg-purple-900/30 p-3 rounded-full text-purple-500"><Clock size={24} /></div>
                <div><h3 className="text-2xl font-bold">{trip.is_trip_confirmed ? "Closed" : "Active"}</h3><p className="text-gray-400 text-sm">Status</p></div>
            </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
           <div className="bg-[#1f1f1f] p-8 rounded-2xl border border-gray-800 shadow-xl h-64">
              <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trip.budget_stats}>
                      <XAxis dataKey="name" stroke="#666" fontSize={10} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {trip.budget_stats.map((entry, index) => <Cell key={`c-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Bar>
                    </BarChart>
              </ResponsiveContainer>
           </div>
           <div className="bg-[#1f1f1f] p-8 rounded-2xl border border-gray-800 shadow-xl h-64">
             <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={trip.tag_stats}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" stroke="#999" fontSize={12} width={80}/>
                      <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }} />
                      <Bar dataKey="value" barSize={20} radius={[0, 4, 4, 0]}>
                        {trip.tag_stats.map((entry, index) => <Cell key={`c-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Bar>
                    </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* ACTIONS */}
        <div className="border-t border-gray-800 pt-10">
            {isLeader ? (
                <div>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><AlertTriangle className="text-yellow-500" /> Leader Zone</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-[#1f1f1f] p-6 rounded-xl border border-gray-700">
                            <h3 className="font-bold mb-2 flex items-center gap-2"><Lock size={18}/> Lock Voting</h3>
                            {!trip.is_trip_confirmed ? (
                                <button onClick={handleLockTrip} disabled={processing} className="mt-4 w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded font-bold text-sm">Lock Trip</button>
                            ) : <span className="text-green-500 text-sm">Already Locked</span>}
                        </div>

                        {/* GENERATE BUTTON (Only show if not already generated) */}
                        <div className="bg-gradient-to-br from-gray-800 to-black p-6 rounded-xl border border-gray-700">
                            <h3 className="font-bold mb-2 flex items-center gap-2 text-blue-400"><Sparkles size={18}/> AI Plan</h3>
                            {trip.has_itinerary ? (
                                <button onClick={() => navigate(`/trip/${tripId}/itinerary`)} className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-bold text-sm">View Plan</button>
                            ) : (
                                <button onClick={handleGenerateItinerary} className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-bold text-sm">Generate</button>
                            )}
                        </div>

                        <div className="bg-red-900/10 p-6 rounded-xl border border-red-900/30">
                            <h3 className="font-bold mb-2 flex items-center gap-2 text-red-500"><Trash2 size={18}/> Delete</h3>
                            <button onClick={handleDeleteTrip} disabled={processing} className="mt-4 w-full border border-red-800 text-red-500 hover:bg-red-900/20 py-2 rounded font-bold text-sm">Delete Forever</button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-[#1f1f1f] p-6 rounded-xl border border-gray-700 flex items-center justify-between max-w-md">
                    <div><h3 className="font-bold text-white mb-1">Leave Trip?</h3><p className="text-gray-400 text-sm">Remove yourself from this plan.</p></div>
                    <button onClick={handleLeaveTrip} disabled={processing} className="flex items-center gap-2 px-4 py-2 border border-red-800 text-red-500 rounded hover:bg-red-900/20 font-bold text-sm"><LogOut size={16} /> Leave</button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}