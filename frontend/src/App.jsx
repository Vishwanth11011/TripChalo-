import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Profile from './pages/Profile';
import CreateTrip from './pages/CreateTrip';
import JoinTrip from './pages/JoinTrip';
import TripPage from './pages/TripPage'; // <--- 1. MAKE SURE THIS IMPORT EXISTS
import ItineraryPage from './pages/ItineraryPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Main Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        
        {/* Action Pages */}
        <Route path="/create-trip" element={<CreateTrip />} />
        <Route path="/join-trip" element={<JoinTrip />} />
        
        {/* Dynamic Trip Page (The one that was missing) */}
        <Route path="/trip/:tripId" element={<TripPage />} />  {/* <--- 2. THIS LINE IS CRITICAL */}

        <Route path="/trip/:tripId/itinerary" element={<ItineraryPage />} />
      </Routes>
    </Router>
  );
}

export default App;