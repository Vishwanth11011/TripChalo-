import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, ArrowRight, CheckCircle, Loader, Plane } from 'lucide-react';
import Navbar from '../components/Navbar';
import AuthModal from '../components/AuthModal'; 
import api from '../api';

const SLIDES = [
  {
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop",
    title: "Plan The Impossible.",
    quote: "Collect moments, not things."
  },
  {
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop",
    title: "Adventure Awaits.",
    quote: "Life begins at the end of your comfort zone."
  },
  {
    image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2144&auto=format&fit=crop",
    title: "Discover Together.",
    quote: "Traveling in the company of those we love is home in motion."
  }
];

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  // Confirmed Trips State
  const [myTrips, setMyTrips] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(false);
  
  // Auth Modal State (Local to Home)
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  // Slider & Scroll State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeSection, setActiveSection] = useState('home');
  const homeRef = useRef(null);
  const tripsRef = useRef(null);

  useEffect(() => {
    // 1. Check User & Fetch Trips
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchConfirmedTrips(parsedUser.user_id);
    }

    // 2. Slider Timer
    const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);

    // 3. Scroll Listener
    const handleScroll = () => {
        if (window.scrollY < window.innerHeight * 0.8) {
            setActiveSection('home');
        } else {
            setActiveSection('my-trips');
        }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
        clearInterval(timer);
        window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  const fetchConfirmedTrips = async (userId) => {
    setLoadingTrips(true);
    try {
      const res = await api.get(`/users/${userId}/profile`);
      
      // Combine created and joined trips
      const allTrips = [...(res.data.created_trips || []), ...(res.data.joined_trips || [])];
      
      // Remove duplicates (by ID)
      const uniqueTrips = Array.from(new Map(allTrips.map(item => [item.id, item])).values());
      
      // Filter ONLY confirmed trips
      const confirmed = uniqueTrips.filter(t => t.is_trip_confirmed);
      
      setMyTrips(confirmed);
    } catch (err) {
      console.error("Failed to load trips", err);
    } finally {
      setLoadingTrips(false);
    }
  };

  const handleNavClick = (section) => {
    setActiveSection(section);
    if (section === 'home') homeRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (section === 'my-trips') tripsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auth Handler
  const openAuth = (mode) => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white font-sans">
      
      {/* Navbar with Local Auth Handlers */}
      <Navbar 
        user={user} 
        onLogout={() => { localStorage.removeItem('user'); window.location.reload(); }} 
        activeSection={activeSection}
        onNavigate={handleNavClick}
        onOpenAuth={openAuth} 
      />

      {/* --- HERO SLIDER --- */}
      <div ref={homeRef} className="relative h-screen w-full overflow-hidden">
        {SLIDES.map((slide, index) => (
            <div key={index} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
                <img src={slide.image} alt="Travel" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-black/40 to-black/60"></div>
            </div>
        ))}

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10 pt-20">
            <h1 className="text-5xl md:text-8xl font-extrabold tracking-tighter mb-4 drop-shadow-2xl">
                {SLIDES[currentSlide].title}
            </h1>
            <p className="text-lg md:text-2xl font-light text-gray-200 italic mb-10 drop-shadow-lg max-w-2xl">
                "{SLIDES[currentSlide].quote}"
            </p>

            <div className="flex flex-col md:flex-row gap-6 w-full max-w-lg">
                <button 
                    onClick={() => user ? navigate('/create-trip') : openAuth('login')}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-4 rounded-full font-bold text-lg shadow-xl flex items-center justify-center gap-2"
                >
                    <MapPin size={22} /> Create Trip
                </button>
                <button 
                    onClick={() => user ? navigate('/join-trip') : openAuth('login')}
                    className="flex-1 bg-white/10 backdrop-blur-md border border-white/30 hover:bg-white/20 text-white py-4 rounded-full font-bold text-lg shadow-xl flex items-center justify-center gap-2"
                >
                    <Calendar size={22} /> Join Trip
                </button>
            </div>
        </div>
        
        {/* Scroll Arrow */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer" onClick={() => handleNavClick('my-trips')}>
             <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
                <div className="w-1 h-2 bg-white rounded-full mt-2"></div>
             </div>
        </div>
      </div>

      {/* --- CONFIRMED TRIPS SECTION (PART 5 UI) --- */}
      <div ref={tripsRef} id="my-trips-section" className="relative min-h-[80vh] bg-[#141414] py-24 px-6">
         
         <div className="max-w-6xl mx-auto mb-12">
             <h2 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
                 <CheckCircle className="text-green-500" size={36} /> 
                 Your Confirmed Trips
             </h2>
             <p className="text-gray-400">Your upcoming itineraries, fully planned and ready to go.</p>
         </div>

         <div className="max-w-6xl mx-auto">
             {loadingTrips ? (
               <div className="flex justify-center p-20"><Loader className="animate-spin text-gray-500" size={48}/></div>
             ) : user && myTrips.length > 0 ? (
               <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myTrips.map(trip => (
                      <div 
                        key={trip.id}
                        onClick={() => navigate(`/trip/${trip.id}/confirmed`)}
                        className="bg-[#1f1f1f] rounded-2xl overflow-hidden border border-gray-800 hover:border-green-500 cursor-pointer transition-all duration-300 hover:shadow-[0_0_30px_rgba(34,197,94,0.1)] group relative"
                      >
                          {/* Card Gradient Overlay */}
                          <div className="h-32 bg-gradient-to-r from-blue-900 to-green-900 relative">
                             <div className="absolute inset-0 bg-black/20"></div>
                             <div className="absolute bottom-4 left-4">
                                <span className="bg-green-500 text-black text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">
                                    Confirmed
                                </span>
                             </div>
                          </div>
                          
                          <div className="p-6">
                              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-green-400 transition">{trip.trip_name}</h3>
                              <div className="flex items-center justify-between text-gray-400 text-sm mt-4">
                                 <span className="font-mono bg-[#111] px-2 py-1 rounded">#{trip.trip_code}</span>
                                 <div className="flex items-center gap-1 text-white group-hover:translate-x-1 transition">
                                    View Details <ArrowRight size={16} />
                                 </div>
                              </div>
                          </div>
                      </div>
                  ))}
               </div>
             ) : (
                <div className="text-center py-20 bg-[#1f1f1f] rounded-2xl border border-dashed border-gray-800">
                    <Plane className="mx-auto text-gray-600 mb-4" size={48} />
                    <h3 className="text-xl font-bold text-gray-300 mb-2">No Upcoming Trips</h3>
                    <p className="text-gray-500 mb-6">You haven't joined or finalized any trips yet.</p>
                    <button onClick={() => homeRef.current?.scrollIntoView({behavior: 'smooth'})} className="text-red-500 hover:text-red-400 font-bold">
                        Start Planning Now
                    </button>
                </div>
             )}
         </div>
      </div>

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        initialMode={authMode} 
      />
    </div>
  );
}