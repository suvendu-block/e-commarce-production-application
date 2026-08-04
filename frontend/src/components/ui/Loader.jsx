// Full-page or inline loading state — brand wordmark + hairline sweep.
// `label` renders beneath; `className` lets callers position it.
const Loader = ({ label = 'Loading', className = '' }) => (
  <div className={`flex flex-col items-center justify-center gap-4 py-16 text-ink ${className}`} role="status">
    <span className="brand-loader font-serif text-xl tracking-[0.22em]">
      NORDSTROMA
    </span>
    <span className="brand-line" aria-hidden="true" />
    <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted">
      {label}…
    </span>
    <span className="sr-only">{label}…</span>
  </div>
);

// Small spinner for buttons / inline actions
export const Spinner = ({ className = 'h-4 w-4' }) => (
  <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
  </svg>
);

export default Loader;
