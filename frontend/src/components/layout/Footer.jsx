import { Link } from 'react-router-dom';
import { CATEGORIES } from '../../constants';

const columns = [
  {
    title: 'Shop',
    links: [
      { to: '/', label: 'Shop all' },
      ...CATEGORIES.map((c) => ({ to: `/?category=${encodeURIComponent(c)}`, label: c })),
    ],
  },
  {
    title: 'Support',
    links: [
      { to: '/', label: 'Shipping & delivery' },
      { to: '/', label: '30-day returns' },
      { to: 'mailto:care@nordstroma.com', label: 'Contact' },
    ],
  },
  {
    title: 'Account',
    links: [
      { to: '/login', label: 'Sign in' },
      { to: '/register', label: 'Join free' },
      { to: '/profile', label: 'Profile' },
    ],
  },
];

const Footer = () => (
  <footer className="mt-auto border-t border-line">
    {/* Trust strip — micro labels, hairline separated */}
    <div className="border-b border-line">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-0 gap-y-2 px-4 py-5 sm:px-6">
        {['Free shipping over $100', '30-day returns', 'Secure checkout', '2-year warranty'].map(
          (item, i) => (
            <span key={item} className="flex items-center">
              {i > 0 && (
                <span className="mx-6 h-3 w-px bg-line sm:mx-10" aria-hidden="true" />
              )}
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
                {item}
              </span>
            </span>
          )
        )}
      </div>
    </div>

    <div className="mx-auto grid max-w-[1400px] gap-12 px-4 py-16 sm:px-6 lg:grid-cols-12">
      {/* Wordmark */}
      <div className="lg:col-span-5">
        <p className="font-serif text-3xl uppercase tracking-[0.28em] text-ink">Nordstroma</p>
        <p className="mt-4 max-w-xs font-serif text-lg italic leading-relaxed text-muted">
          Everyday things, beautifully made.
        </p>
      </div>

      {/* Columns */}
      {columns.map((col) => (
        <nav key={col.title} aria-label={col.title} className="lg:col-span-2">
          <p className="kicker mb-5">{col.title}</p>
          <ul className="space-y-3">
            {col.links.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.to}
                  className="text-sm text-muted transition hover:text-ink"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ))}
    </div>

    <div className="border-t border-line">
      <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-2 px-4 py-5 sm:px-6 md:flex-row">
        <p className="text-xs text-faint">
          © {new Date().getFullYear()} Nordstroma
        </p>
        <p className="text-xs uppercase tracking-[0.22em] text-faint">Est. 2026 — with intent</p>
      </div>
    </div>
  </footer>
);

export default Footer;
