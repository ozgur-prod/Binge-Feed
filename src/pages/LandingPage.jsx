import { useNavigate } from 'react-router-dom';
import { PlayIcon, PenLineIcon, ListIcon, UserIcon } from '../components/icons';
import PosterBackground from '../components/PosterBackground';
import './LandingPage.css';

const features = [
  {
    title: 'Episode-level discussions',
    text: 'Join spoiler-safe threads for every episode.',
    icon: <PenLineIcon />,
  },
  {
    title: 'Track your Watching Journey',
    text: 'Organize your watchlist, progress, and watched episodes.',
    icon: <ListIcon />,
  },
  {
    title: 'Social discovery feed',
    text: "Discover shows through friends' activity and reactions.",
    icon: <UserIcon />,
  },
];

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      <PosterBackground />

      <header className="nav">
        <div className="logo">
          Binge<span>Feed</span>
          <PlayIcon className="play" />
        </div>
      </header>

      <main className="hero">
        <h1>Your TV watching experience, together</h1>

        <div className="actions">
          <button className="btn login" onClick={() => navigate('/login')}>Log In</button>
          <button className="btn signup" onClick={() => navigate('/signup')}>Sign Up</button>
        </div>

        <section className="features">
          {features.map((feature) => (
            <article className="card" key={feature.title}>
              <span className="card-icon">{feature.icon}</span>
              <h2>{feature.title}</h2>
              <p>{feature.text}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}

export default LandingPage;
