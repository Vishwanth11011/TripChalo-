import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, Send, Bot, Clock, ArrowLeft, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../api';

export default function ConfirmedTrip() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  // Chat State
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "Hi! I'm your Trip Assistant. Ask me about the itinerary, budget, or who is coming!" }
  ]);
  const [inputMsg, setInputMsg] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user'));
    if (!u) {
        navigate('/');
        return;
    }
    setUser(u);
    fetchTripDetails();
  }, []);

  const fetchTripDetails = async () => {
    try {
      const res = await api.get(`/trips/${tripId}/confirmed-details`);
      console.log("✅ FULL TRIP DATA:", res.data); 
      setTrip(res.data);
    } catch (err) {
      console.error("Error fetching trip:", err);
      setError("Could not load trip details.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const newMsgs = [...messages, { sender: 'user', text: inputMsg }];
    setMessages(newMsgs);
    setInputMsg("");
    setChatLoading(true);

    try {
      const res = await api.post(`/trips/${tripId}/chat`, { message: inputMsg });
      setMessages([...newMsgs, { sender: 'bot', text: res.data.response }]);
    } catch (error) {
      setMessages([...newMsgs, { sender: 'bot', text: "Sorry, I'm having trouble connecting to the trip data." }]);
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- FIX: HANDLE STRING vs ARRAY and 'activity' vs 'activities' ---
  const getActivities = (dayObj) => {
      // 1. Grab data from any possible key
      const raw = dayObj.activities || dayObj.Activities || dayObj.activity || dayObj.Activity || dayObj.plan || [];
      
      // 2. If it's a string (like in your screenshot), wrap it in an array to make it a list
      if (typeof raw === 'string') {
          return [raw];
      }
      return raw;
  };

  const getDayLabel = (dayObj, index) => {
      return dayObj.day || dayObj.Day || index + 1;
  };

  if (loading) return (
      <div className="min-h-screen bg-[#141414] text-white flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
  );

  if (error || !trip) return (
      <div className="min-h-screen bg-[#141414] text-white flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-2">Oops! Trip Not Found</h2>
          <p className="text-gray-400 mb-6">{error || "This trip data is missing."}</p>
          <button onClick={() => navigate('/')} className="bg-white/10 px-6 py-2 rounded-lg hover:bg-white/20">Back to Home</button>
      </div>
  );

  // Parse Itinerary if it's a string (Safety Check)
  let itineraryList = [];
  if (Array.isArray(trip.itinerary)) {
      itineraryList = trip.itinerary;
  } else if (typeof trip.itinerary === 'string') {
      try { itineraryList = JSON.parse(trip.itinerary); } catch(e) { itineraryList = []; }
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white font-sans">
      <Navbar user={user} onLogout={() => { localStorage.removeItem('user'); navigate('/'); }} />
      
      <div className="pt-24 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
        
        {/* --- LEFT COLUMN: DETAILS --- */}
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-[#1f1f1f] rounded-2xl p-8 border border-gray-800 shadow-2xl relative overflow-hidden animate-fade-in-up">
                <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition">
                    <ArrowLeft size={16} /> Back to Home
                </button>
                <h1 className="text-4xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                    {trip.trip_name}
                </h1>
                <div className="flex flex-wrap gap-4 text-gray-300 mt-4">
                    <span className="flex items-center gap-2 bg-black/30 px-3 py-1 rounded-full border border-gray-700">
                        <MapPin size={16} className="text-red-500"/> {trip.location || "Location TBD"}
                    </span>
                    <span className="flex items-center gap-2 bg-black/30 px-3 py-1 rounded-full border border-gray-700">
                        <Users size={16} className="text-blue-500"/> {trip.participants?.length || 0} Travelers
                    </span>
                    <span className="flex items-center gap-2 bg-black/30 px-3 py-1 rounded-full border border-gray-700">
                        <Calendar size={16} className="text-yellow-500"/> {trip.start_date || "Date TBD"}
                    </span>
                </div>
            </div>

            <div className="space-y-6 animate-fade-in-up delay-100">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Clock className="text-green-500"/> Itinerary Timeline
                </h2>
                
                {itineraryList.length > 0 ? (
                    itineraryList.map((day, index) => {
                        const activities = getActivities(day);
                        return (
                            <div key={index} className="bg-[#1f1f1f] p-6 rounded-xl border border-gray-800 hover:border-gray-600 transition group">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="bg-blue-900/30 text-blue-400 font-bold px-4 py-2 rounded-lg border border-blue-500/30">
                                        Day {getDayLabel(day, index)}
                                    </div>
                                    <div className="h-px bg-gray-800 flex-1"></div>
                                </div>
                                <ul className="space-y-3">
                                    {Array.isArray(activities) && activities.length > 0 ? (
                                        activities.map((act, i) => (
                                            <li key={i} className="flex gap-3 text-gray-300">
                                                <span className="mt-1.5 w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></span>
                                                <span>{act}</span>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="text-gray-500 italic flex items-center gap-2">
                                            <AlertCircle size={14}/> No specific activities listed.
                                        </li>
                                    )}
                                </ul>
                            </div>
                        );
                    })
                ) : (
                    <div className="bg-[#1f1f1f] p-8 rounded-xl border border-gray-800 text-center text-gray-500">
                        <p>No itinerary details available yet.</p>
                        <p className="text-xs mt-2 text-gray-600">(Check browser console for raw data structure)</p>
                    </div>
                )}
            </div>
        </div>

        {/* --- RIGHT COLUMN: CHAT --- */}
        <div className="lg:col-span-1 animate-fade-in-up delay-200">
            <div className="bg-[#1f1f1f] rounded-2xl border border-gray-800 shadow-2xl h-[600px] flex flex-col sticky top-28">
                <div className="p-4 border-b border-gray-800 bg-black/20 rounded-t-2xl flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                        <Bot size={20} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white">Trip Assistant</h3>
                        <p className="text-xs text-green-400 flex items-center gap-1">Online</p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-800 text-gray-200 rounded-bl-none'}`}>
                                <span dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') }} />
                            </div>
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800 bg-black/20 rounded-b-2xl">
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Ask about Day 1, budget..."
                            className="w-full bg-[#141414] border border-gray-700 text-white rounded-xl py-3 pl-4 pr-12 focus:border-blue-500 outline-none"
                            value={inputMsg}
                            onChange={(e) => setInputMsg(e.target.value)}
                        />
                        <button type="submit" disabled={!inputMsg.trim() || chatLoading} className="absolute right-2 top-2 bg-blue-600 p-1.5 rounded-lg text-white hover:bg-blue-500 disabled:opacity-50">
                            <Send size={18} />
                        </button>
                    </div>
                </form>
            </div>
        </div>

      </div>
    </div>
  );
}