import { Star, StarHalf } from 'lucide-react';

// Star rating — monochrome ink on paper (brand is monochrome).
// `value` is the product rating (0–5, one decimal).
// `interactive` renders a 1–5 selector for the review form.
const Rating = ({ value = 0, interactive = false, onChange, className = '' }) => {
  if (interactive) {
    return (
      <div className={`flex items-center gap-1 ${className}`} role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
            onClick={() => onChange?.(star)}
            className="rounded-none p-0.5 transition-transform active:scale-90"
          >
            <Star
              className={`h-6 w-6 transition-colors ${
                star <= value ? 'fill-ink text-ink' : 'text-line'
              }`}
            />
          </button>
        ))}
      </div>
    );
  }

  const full = Math.floor(value);
  const half = value - full >= 0.5;
  const stars = [];

  for (let i = 1; i <= 5; i += 1) {
    if (i <= full) {
      stars.push(<Star key={i} className="h-3.5 w-3.5 fill-ink text-ink" aria-hidden="true" />);
    } else if (half && i === full + 1) {
      stars.push(
        <span key={i} className="relative inline-block">
          <Star className="h-3.5 w-3.5 text-line" aria-hidden="true" />
          <StarHalf className="absolute inset-0 h-3.5 w-3.5 fill-ink text-ink" aria-hidden="true" />
        </span>
      );
    } else {
      stars.push(<Star key={i} className="h-3.5 w-3.5 text-line" aria-hidden="true" />);
    }
  }

  return (
    <div className={`flex items-center gap-0.5 ${className}`} aria-label={`Rated ${value} out of 5`}>
      {stars}
    </div>
  );
};

export default Rating;
