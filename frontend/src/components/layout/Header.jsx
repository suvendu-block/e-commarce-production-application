import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowUpRight, LayoutDashboard, LogOut, Moon, Search, Sun, User, X } from 'lucide-react';
import { logout } from '../../store/slices/authSlice';
import { THEME_KEY } from '../../constants';
import SearchBox from '../ui/SearchBox';

const menuItem =
  'flex w-full items-center gap-2.5 px-4 py-3 text-sm font-medium text-muted transition hover:bg-surface-2 hover:text-ink';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.cartItems);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const closeBtnRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // Scroll lock + Escape while the overlay menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    if (menuOpen) closeBtnRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  const closeAll = () => {
    setMenuOpen(false);
    setSearchOpen(false);
    setDropdownOpen(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    closeAll();
    navigate('/');
  };

  const menuLink = (i) => ({ animationDelay: `${80 + i * 60}ms` });

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
        <div className="relative mx-auto flex h-[68px] max-w-[1400px] items-center justify-between px-4 sm:px-6">
          {/* Left cluster: menu + search */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="flex h-10 w-10 items-center justify-center text-ink transition hover:bg-surface-2"
              aria-label="Open menu"
              aria-expanded={menuOpen}
            >
              <svg width="22" height="10" viewBox="0 0 22 10" fill="none" aria-hidden="true">
                <line x1="0" y1="1" x2="22" y2="1" stroke="currentColor" />
                <line x1="0" y1="9" x2="14" y2="9" stroke="currentColor" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen((o) => !o)}
              className="hidden h-10 w-10 items-center justify-center text-ink transition hover:bg-surface-2 sm:flex"
              aria-label={searchOpen ? 'Close search' : 'Open search'}
              aria-expanded={searchOpen}
            >
              <Search className="h-[18px] w-[18px]" aria-hidden="true" />
            </button>
          </div>

          {/* Center wordmark */}
          <Link
            to="/"
            onClick={closeAll}
            className="absolute left-1/2 -translate-x-1/2 font-serif text-[15px] uppercase tracking-[0.32em] text-ink transition-opacity hover:opacity-70"
          >
            Nordstroma
          </Link>

          {/* Right cluster */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="flex h-10 w-10 items-center justify-center text-ink transition hover:bg-surface-2"
            >
              {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
            </button>

            <Link
              to="/cart"
              onClick={closeAll}
              className="relative flex h-10 items-center gap-1 px-2 text-ink transition hover:bg-surface-2"
              aria-label={`Cart, ${cartCount} item${cartCount === 1 ? '' : 's'}`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 8h12l-1 12H7L6 8Z" stroke="currentColor" />
                <path d="M9 8V6a3 3 0 0 1 6 0v2" stroke="currentColor" />
              </svg>
              {cartCount > 0 && (
                <sup className="font-serif text-[11px] italic text-ink">{cartCount}</sup>
              )}
            </Link>

            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen((o) => !o)}
                  aria-haspopup="menu"
                  aria-expanded={dropdownOpen}
                  className="flex h-10 items-center gap-2 px-2 text-ink transition hover:bg-surface-2"
                >
                  <User className="h-[18px] w-[18px]" aria-hidden="true" />
                  <span className="hidden max-w-24 truncate text-sm lg:inline">
                    {user.name.split(' ')[0]}
                  </span>
                </button>
                {dropdownOpen && (
                  <div
                    role="menu"
                    className="card absolute right-0 top-full mt-1 w-56 py-1"
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <Link to="/profile" role="menuitem" className={menuItem} onClick={closeAll}>
                      <User className="h-4 w-4" aria-hidden="true" /> Profile
                    </Link>
                    {user.isAdmin && (
                      <Link to="/admin" role="menuitem" className={menuItem} onClick={closeAll}>
                        <LayoutDashboard className="h-4 w-4" aria-hidden="true" /> Admin panel
                      </Link>
                    )}
                    <div className="my-1 border-t border-line" />
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 px-4 py-3 text-sm font-medium text-danger transition hover:bg-danger-soft"
                    >
                      <LogOut className="h-4 w-4" aria-hidden="true" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                onClick={closeAll}
                className="hidden px-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink transition hover:opacity-60 sm:inline"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>

        {/* Expandable search row */}
        {searchOpen && (
          <div className="border-t border-line px-4 py-5 sm:px-6">
            <div className="mx-auto max-w-xl">
              <SearchBox autoFocus />
            </div>
          </div>
        )}
      </header>

      {/* Full-screen overlay menu */}
      {menuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-50 flex flex-col bg-bg"
        >
          <div className="flex h-[68px] items-center justify-between border-b border-line px-4 sm:px-6">
            <span className="font-serif text-[13px] uppercase tracking-[0.32em] text-faint">
              Index
            </span>
            <button
              ref={closeBtnRef}
              type="button"
              onClick={() => setMenuOpen(false)}
              className="flex h-10 w-10 items-center justify-center text-ink transition hover:bg-surface-2"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div className="mx-auto grid w-full max-w-[1400px] flex-1 gap-10 overflow-y-auto px-6 py-12 sm:px-10 lg:grid-cols-2 lg:gap-20">
            {/* Primary serif nav */}
            <nav aria-label="Menu" className="flex flex-col justify-center gap-1">
              <p className="menu-item kicker mb-4" style={menuLink(0)}>Shop</p>
              {[
                { to: '/', label: 'Shop all' },
                { to: '/?category=Electronics', label: 'Electronics' },
                { to: '/?category=Apparel', label: 'Apparel' },
                { to: '/?category=Home & Kitchen', label: 'Home & Kitchen' },
                { to: '/?category=Sports', label: 'Sports' },
                { to: '/?category=Accessories', label: 'Accessories' },
              ].map((item, i) => (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={closeAll}
                  className="menu-item group flex items-center justify-between border-b border-line py-3.5 font-serif text-2xl text-ink transition-colors hover:border-ink sm:text-3xl"
                  style={menuLink(i + 1)}
                >
                  {item.label}
                  <ArrowUpRight
                    className="h-5 w-5 text-faint transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </nav>

            {/* Account rail */}
            <div className="flex flex-col justify-end gap-8 pb-2">
              <div>
                <p className="menu-item kicker mb-4" style={menuLink(7)}>Account</p>
                <div className="flex flex-wrap gap-x-8 gap-y-3">
                  {user ? (
                    <>
                      <Link to="/profile" onClick={closeAll} className="menu-item text-sm text-muted transition hover:text-ink" style={menuLink(8)}>
                        Profile
                      </Link>
                      {user.isAdmin && (
                        <Link to="/admin" onClick={closeAll} className="menu-item text-sm text-muted transition hover:text-ink" style={menuLink(9)}>
                          Admin panel
                        </Link>
                      )}
                      <button type="button" onClick={handleLogout} className="menu-item text-sm text-danger" style={menuLink(10)}>
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" onClick={closeAll} className="menu-item text-sm text-muted transition hover:text-ink" style={menuLink(8)}>
                        Sign in
                      </Link>
                      <Link to="/register" onClick={closeAll} className="menu-item text-sm text-muted transition hover:text-ink" style={menuLink(9)}>
                        Join free
                      </Link>
                    </>
                  )}
                </div>
              </div>
              <p className="menu-item text-xs leading-relaxed text-faint" style={menuLink(11)}>
                Nordstroma — everyday things, beautifully made.
                <br />
                Free shipping over $100 · 30-day returns.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
