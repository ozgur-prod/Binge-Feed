import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const features = [
  {
    title: 'Episode-level discussions',
    text: 'Join spoiler-safe threads for every episode.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
    ),
  },
  {
    title: 'Track your Watching Journey',
    text: 'Organize your watchlist, progress, and watched episodes.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    ),
  },
  {
    title: 'Social discovery feed',
    text: "Discover shows through friends' activity and reactions.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      <header className="nav">
        <div className="logo">
          Binge<span>Feed</span>
          <svg className="play" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
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
