import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Users, Play } from 'lucide-react';
import Navbar from '../components/Navbar';
import AuthModal from '../components/AuthModal';

const HERO_IMAGE = "https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=2668&auto=format&fit=crop";

const TRENDING_DESTINATIONS = [
  { title: "Manali Escape", image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=500&auto=format&fit=crop", rating: "98% Match" },
  { title: "Goa Beach Party", image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=500&auto=format&fit=crop", rating: "95% Match" },
  { title: "Jaipur Royals", image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=500&auto=format&fit=crop", rating: "92% Match" },
  { title: "Kerala Backwaters", image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=500&auto=format&fit=crop", rating: "90% Match" },
  { title: "Ladakh Bike Trip", image: "https://images.unsplash.com/photo-1581793434119-9449555812a7?w=500&auto=format&fit=crop", rating: "99% Match" },
];

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleAction = (path) => {
    if (!user) setIsAuthOpen(true);
    else navigate(path);
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      <Navbar user={user} onLogout={() => { localStorage.removeItem('user'); setUser(null); }} onOpenAuth={() => setIsAuthOpen(true)} />

      {/* --- HERO SECTION (The "Featured Movie") --- */}
      <div className="relative h-[85vh] w-full">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        >
          {/* Gradient Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-black/60" />
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-32 left-8 md:left-16 max-w-2xl space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="text-6xl font-extrabold drop-shadow-lg"
          >
            Plan The <br /> Impossible.
          </motion.h1>
          <p className="text-lg text-gray-200 drop-shadow-md">
            Collaborate with friends, vote on stays, and let AI build your perfect itinerary. No more group chat chaos.
          </p>
          
          <div className="flex gap-4 pt-4">
            <button 
              onClick={() => handleAction('/create-trip')}
              className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded font-bold hover:bg-opacity-80 transition"
            >
              <PlusCircle size={24} /> Create Trip
            </button>
            <button 
              onClick={() => handleAction('/join-trip')}
              className="flex items-center gap-2 bg-gray-500/50 backdrop-blur-md text-white px-6 py-3 rounded font-bold hover:bg-gray-500/70 transition"
            >
              <Users size={24} /> Join Trip
            </button>
          </div>
        </div>
      </div>

      {/* --- ROW 1: TRENDING NOW (Horizontal Scroll) --- */}
      <div className="pl-8 md:pl-16 pb-12 -mt-20 relative z-10 space-y-4">
        <h3 className="text-xl font-semibold text-gray-200">Trending Now</h3>
        
        <div className="flex overflow-x-scroll scrollbar-hide gap-4 py-4 pr-8">
          {TRENDING_DESTINATIONS.map((dest, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ scale: 1.05 }}
              className="min-w-[250px] h-[150px] relative rounded-md overflow-hidden cursor-pointer group"
            >
              <img src={dest.image} className="w-full h-full object-cover" alt={dest.title} />
              
              {/* Hover Details */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex flex-col justify-end p-4">
                <h4 className="font-bold text-sm">{dest.title}</h4>
                <p className="text-green-400 text-xs font-bold">{dest.rating}</p>
                <div className="flex gap-2 mt-2">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black">
                    <Play size={12} fill="black" />
                  </div>
                  <div className="w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center">
                    <PlusCircle size={16} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* --- ROW 2: YOUR TRIPS --- */}
      {user && (
        <div className="pl-8 md:pl-16 pb-20 space-y-4">
          <h3 className="text-xl font-semibold text-gray-200">Your Trips</h3>
          <div className="bg-[#1a1a1a] h-40 w-full md:w-96 rounded flex items-center justify-center border border-gray-700 text-gray-500">
            <p>No upcoming trips. Create one above!</p>
          </div>
        </div>
      )}

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onLoginSuccess={(userData) => setUser(userData)} 
      />
    </div>
  );
}