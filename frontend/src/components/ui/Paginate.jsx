import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';

// Page navigation — editorial: numbers as hairline links, arrows as micro text.
// Builds `/page/:n` links, preserving keyword/category filters.
const Paginate = ({ pages = 1, page = 1, keyword = '', category = '' }) => {
  if (pages <= 1) return null;

  const to = (n) => {
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (category) params.set('category', category);
    const qs = params.toString();
    return `/page/${n}${qs ? `?${qs}` : ''}`;
  };

  const pageNumbers = [];
  for (let i = 1; i <= pages; i += 1) pageNumbers.push(i);

  return (
    <nav className="mt-12 flex items-center justify-center gap-6" aria-label="Pagination">
      {page > 1 && (
        <Link
          to={to(page - 1)}
          className="link-arrow"
          aria-label="Previous page"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Prev
        </Link>
      )}

      <div className="flex items-center gap-1">
        {pageNumbers.map((n) => (
          <Link
            key={n}
            to={to(n)}
            aria-current={n === page ? 'page' : undefined}
            className={`px-3 py-1.5 text-sm transition ${
              n === page
                ? 'border-b border-ink font-semibold text-ink'
                : 'border-b border-transparent text-muted hover:border-line hover:text-ink'
            }`}
          >
            {n}
          </Link>
        ))}
      </div>

      {page < pages && (
        <Link
          to={to(page + 1)}
          className="link-arrow"
          aria-label="Next page"
        >
          Next
          <ArrowRight className="h-3.5 w-3.5 arrow-slide" aria-hidden="true" />
        </Link>
      )}
    </nav>
  );
};

export default Paginate;
