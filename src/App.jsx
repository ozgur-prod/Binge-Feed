import { Routes, Route } from 'react-router-dom';
import { RequireAuth, RedirectIfAuthed } from './components/RouteGuards';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import FeedPage from './pages/FeedPage';
import SearchPage from './pages/SearchPage';
import ProfilePage from './pages/ProfilePage';
import UserProfilePage from './pages/UserProfilePage';
import ShowDetailPage from './pages/ShowDetailPage';
import EpisodePage from './pages/EpisodePage';
import LiveCommentsPage from './pages/LiveCommentsPage';
import ReviewsPage from './pages/ReviewsPage';
import PremiumPage from './pages/PremiumPage';
import PremiumSuccessPage from './pages/PremiumSuccessPage';
import CancelPremiumPage from './pages/CancelPremiumPage';
import WeeklyFixPage from './pages/WeeklyFixPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<RedirectIfAuthed><LandingPage /></RedirectIfAuthed>} />
      <Route path="/login" element={<RedirectIfAuthed><LoginPage /></RedirectIfAuthed>} />
      <Route path="/signup" element={<RedirectIfAuthed><SignUpPage /></RedirectIfAuthed>} />
      <Route path="/feed" element={<RequireAuth><FeedPage /></RequireAuth>} />
      <Route path="/search" element={<RequireAuth><SearchPage /></RequireAuth>} />
      <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
      <Route path="/user/:id" element={<RequireAuth><UserProfilePage /></RequireAuth>} />
      <Route path="/show/:id" element={<RequireAuth><ShowDetailPage /></RequireAuth>} />
      <Route path="/show/:id/reviews" element={<RequireAuth><ReviewsPage /></RequireAuth>} />
      <Route path="/show/:id/season/:season/episode/:episode" element={<RequireAuth><EpisodePage /></RequireAuth>} />
      <Route path="/show/:id/season/:season/episode/:episode/live" element={<RequireAuth><LiveCommentsPage /></RequireAuth>} />
      <Route path="/premium" element={<RequireAuth><PremiumPage /></RequireAuth>} />
      <Route path="/premium/success" element={<RequireAuth><PremiumSuccessPage /></RequireAuth>} />
      <Route path="/premium/cancel" element={<RequireAuth><CancelPremiumPage /></RequireAuth>} />
      <Route path="/weekly-fix" element={<RequireAuth><WeeklyFixPage /></RequireAuth>} />
    </Routes>
  );
}

export default App;
