// value is 0-10 (TMDB scale), rendered as a 5-star display.
export default function Stars({ value, max = 5 }) {
  const filled = Math.round((value / 10) * max);
  return (
    <span className="stars">
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < filled ? 'star filled' : 'star'}>★</span>
      ))}
      <span className="rating-num">{((value / 10) * 5).toFixed(1)}</span>
    </span>
  );
}
