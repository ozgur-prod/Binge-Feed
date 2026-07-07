import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import FeedPage from './pages/FeedPage';
import SearchPage from './pages/SearchPage';
import ProfilePage from './pages/ProfilePage';
import ShowDetailPage from './pages/ShowDetailPage';
import PremiumPage from './pages/PremiumPage';
import PremiumSuccessPage from './pages/PremiumSuccessPage';
import CancelPremiumPage from './pages/CancelPremiumPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/feed" element={<FeedPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/show/:id" element={<ShowDetailPage />} />
      <Route path="/premium" element={<PremiumPage />} />
      <Route path="/premium/success" element={<PremiumSuccessPage />} />
      <Route path="/premium/cancel" element={<CancelPremiumPage />} />
    </Routes>
  );
}

export default App;
