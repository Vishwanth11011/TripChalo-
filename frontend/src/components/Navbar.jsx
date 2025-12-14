import { useState, useEffect } from 'react';
import { User, LogOut, Search, Bell } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar({ user, onLogout, onOpenAuth }) {
  const navigate = useNavigate();
  const location = useLocation(); // To check current page
  const [isScrolled, setIsScrolled] = useState(false);

  // Detect Scroll to darken navbar
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path ? "font-bold text-white" : "text-gray-300 hover:text-white transition";

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 px-8 py-4 flex items-center justify-between ${isScrolled ? 'bg-[#141414]' : 'bg-gradient-to-b from-black/80 to-transparent'}`}>
      
      {/* Left: Logo & Links */}
      <div className="flex items-center gap-8">
        <h1 className="text-3xl font-extrabold text-red-600 tracking-tighter cursor-pointer uppercase" onClick={() => navigate('/')}>
          TripChalo
        </h1>
        <ul className="hidden md:flex gap-6 text-xl">
          <li className={`cursor-pointer ${isActive('/')}`} onClick={() => navigate('/')}>Home</li>
          <li className={`cursor-pointer ${isActive('/my-trips')}`}>My Trips</li>
          <li className={`cursor-pointer ${isActive('/trending')}`}>Trending</li>
        </ul>
      </div>

      {/* Right: Profile & Actions */}
      <div className="flex items-center gap-6">
        <Search className="w-5 h-5 text-white cursor-pointer hover:text-gray-300" />
        <Bell className="w-5 h-5 text-white cursor-pointer hover:text-gray-300" />
        
        {user ? (
          <div className="flex items-center gap-3 group relative cursor-pointer">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png" 
              alt="Profile" 
              className="w-8 h-8 rounded" 
            />
            {/* Dropdown on Hover */}
            <div className="absolute top-8 right-0 bg-black border border-gray-700 p-2 rounded shadow-xl hidden group-hover:block w-32">
              <p className="text-m text-gray-400 mb-2 px-2">Hi, {user.first_name}</p>
              <button onClick={() => navigate('/profile')} className="block w-full text-left text-xl hover:text-white px-2 py-1">Account</button>
              <button onClick={onLogout} className="block w-full text-left text-xl text-red-500 hover:underline px-2 py-1">Sign out</button>
            </div>
          </div>
        ) : (
          <button 
            onClick={onOpenAuth} 
            className="bg-red-600 text-white px-4 py-1.5 rounded text-xl font-semibold hover:bg-red-700 transition"
          >
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
}