import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api';
import { MapPin, IndianRupee, Sparkles, CheckCircle, Crown } from 'lucide-react';

export default function ItineraryPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [itinerary, setItinerary] = useState(null);
  const [votes, setVotes] = useState({ 1: 0, 2: 0 });
  const [userVote, setUserVote] = useState(null);
  const [finalChoice, setFinalChoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) navigate('/');
    setCurrentUser(JSON.parse(storedUser));
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Need user_id for vote status
      const u = JSON.parse(localStorage.getItem('user')); 
      const res = await api.get(`/trips/${tripId}/itinerary?user_id=${u.user_id}`);
      
      if (res.data.has_generated) {
        setItinerary(res.data.data);
        setVotes(res.data.votes);
        setUserVote(res.data.user_vote);
        setFinalChoice(res.data.final_choice);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (optionId) => {
    try {
      await api.post(`/trips/${tripId}/vote?user_id=${currentUser.user_id}&option_id=${optionId}`);
      setUserVote(optionId);
      fetchData(); // Refresh counts
    } catch (err) {
      alert("Failed to vote");
    }
  };

  const handleFinalize = async (optionId) => {
    if(!window.confirm("Finalize this plan? This closes voting.")) return;
    try {
      await api.post(`/trips/${tripId}/finalize?user_id=${currentUser.user_id}&option_id=${optionId}`);
      setFinalChoice(optionId);
    } catch (err) {
      alert("Failed to finalize");
    }
  };

  if (loading) return <div className="min-h-screen bg-[#141414] text-white flex items-center justify-center">Loading Itinerary...</div>;

  if (!itinerary) return (
    <div className="min-h-screen bg-[#141414] text-white flex items-center justify-center">
        <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">No Itinerary Yet</h2>
            <p className="text-gray-400">The leader hasn't generated the plan yet.</p>
            <button onClick={() => navigate(`/trip/${tripId}`)} className="mt-4 text-blue-500 underline">Back to Dashboard</button>
        </div>
    </div>
  );

  const isLeader = currentUser?.user_id === itinerary.leader_id; // Pass this from backend ideally, or assume true if generating logic worked

  return (
    <div className="min-h-screen bg-[#141414] text-white font-sans pb-20">
      <Navbar user={currentUser} onLogout={() => navigate('/')} />

      <div className="max-w-7xl mx-auto px-6 py-24">
        
        {/* Header */}
        <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Recommended Trip Plans
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto italic border-l-4 border-blue-500 pl-4 bg-[#1f1f1f] p-3 rounded">
                "AI Analysis: {itinerary.analysis_summary}"
            </p>
        </div>

        {/* The Two Options Grid */}
        <div className="grid md:grid-cols-2 gap-8">
            {itinerary.options.map((option) => {
                const isSelected = userVote === option.id;
                const isWinner = finalChoice === option.id;
                const voteCount = votes[option.id] || 0;
                
                return (
                    <div key={option.id} className={`relative bg-[#1f1f1f] rounded-2xl overflow-hidden border-2 transition-all duration-300 ${isWinner ? 'border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)] scale-105 z-10' : 'border-gray-800 hover:border-gray-600'}`}>
                        
                        {/* Winner Badge */}
                        {isWinner && (
                            <div className="absolute top-0 right-0 bg-green-600 text-white px-4 py-1 rounded-bl-xl font-bold flex items-center gap-2">
                                <Crown size={18} fill="white" /> FINALIZED PLAN
                            </div>
                        )}

                        <div className="p-8">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-2xl font-bold text-white">{option.title}</h2>
                                <span className="bg-blue-900/30 text-blue-400 px-3 py-1 rounded text-xs font-bold uppercase">
                                    {option.id === 1 ? "Crowd Pleaser" : "Underrated Gem"}
                                </span>
                            </div>

                            <div className="space-y-3 mb-6">
                                <p className="flex items-center gap-2 text-gray-300">
                                    <MapPin size={18} className="text-red-500"/> {option.location}
                                </p>
                                <p className="flex items-center gap-2 text-gray-300">
                                    <IndianRupee size={18} className="text-green-500"/> {option.total_estimated_cost}
                                </p>
                                <p className="flex items-center gap-2 text-gray-300">
                                    <Sparkles size={18} className="text-yellow-500"/> {option.vibe_match}
                                </p>
                            </div>

                            <div className="bg-[#141414] p-4 rounded-lg mb-6 border border-gray-800">
                                <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Why this fits your group</h3>
                                <p className="text-gray-300 text-sm">{option.why_its_perfect}</p>
                            </div>

                            <div className="space-y-4 mb-8">
                                <h3 className="font-bold border-b border-gray-800 pb-2">Itinerary Preview</h3>
                                {option.itinerary.map((day, idx) => (
                                    <div key={idx} className="flex gap-4">
                                        <span className="text-gray-500 font-mono text-sm whitespace-nowrap">Day {day.day}</span>
                                        <span className="text-gray-300 text-sm">{day.activity}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="mt-auto border-t border-gray-800 pt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="text-sm text-gray-400">
                                        <span className="text-2xl font-bold text-white block">{voteCount}</span> Votes
                                    </div>
                                    {!finalChoice && (
                                        <button 
                                            onClick={() => handleVote(option.id)}
                                            className={`px-6 py-2 rounded-full font-bold transition flex items-center gap-2 ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                                        >
                                            {isSelected && <CheckCircle size={16} />}
                                            {isSelected ? 'Voted' : 'Vote for this'}
                                        </button>
                                    )}
                                </div>
                                
                                {/* Finalize Button (Leader Only) - FIX: Added isLeader check */}
                                {!finalChoice && isLeader && (
                                    <button 
                                        onClick={() => handleFinalize(option.id)}
                                        className="w-full border border-green-900 text-green-600 hover:bg-green-900/20 py-3 rounded-lg font-bold text-sm transition"
                                    >
                                        Finalize "{option.title}"
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>

      </div>
    </div>
  );
}