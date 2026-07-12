import { StarIcon, StarHalfIcon } from './icons';

// value is 0-10, rendered as a 5-star display with half-star precision.
export default function Stars({ value, max = 5 }) {
  const starValue = Math.round((value / 10) * max * 2) / 2; // nearest 0.5
  return (
    <span className="stars">
      {Array.from({ length: max }, (_, i) => {
        if (starValue >= i + 1) {
          return <StarIcon key={i} className="star filled" fill="currentColor" />;
        }
        if (starValue >= i + 0.5) {
          return <StarHalfIcon key={i} className="star filled" />;
        }
        return <StarIcon key={i} className="star" fill="none" />;
      })}
      <span className="rating-num">{((value / 10) * 5).toFixed(1)}</span>
    </span>
  );
}
