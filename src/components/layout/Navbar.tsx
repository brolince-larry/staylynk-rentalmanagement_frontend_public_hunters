import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, Moon, Play, Search, Sun, X } from 'lucide-react';
import { SmartImage } from '../media/SmartImage';
import { useTheme } from '../../hooks/useTheme';
import logoUrl from '../../assets/logo.png';
import type { MediaItem } from '../../types';

const FULL_SCREEN_ROUTES = ['/ai', '/hunter', '/find'];

interface NavbarProps {
  isAuthenticated?: boolean;
  user?: { name: string; avatar?: string | MediaItem };
}

export function Navbar({ isAuthenticated, user }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const location = useLocation();

  if (FULL_SCREEN_ROUTES.includes(location.pathname)) return null;

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
      isActive
        ? 'bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300'
        : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100 dark:text-white/60 dark:hover:text-white dark:hover:bg-white/[0.06]'
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-sm shadow-black/[0.04] backdrop-blur dark:border-white/[0.07] dark:bg-[#0d0d14]/95 dark:shadow-black/30">
      <div className="mx-auto flex h-16 max-w-[1480px] items-center gap-6 px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2.5 text-[17px] font-black tracking-tight text-slate-950 dark:text-white"
        >
          <img src={logoUrl} alt="" aria-hidden="true" className="h-9 w-9 shrink-0" />
          Stay<span className="text-slate-400 dark:text-white/35">Lynk</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden flex-1 items-center justify-center gap-0.5 lg:flex">
          <NavLink to="/" className={linkClass} end>Home</NavLink>
          <NavLink to="/browse" className={linkClass}>Browse</NavLink>
          <NavLink to="/feed" className={linkClass}>Video feed</NavLink>
          <NavLink to="/compare" className={linkClass}>Compare</NavLink>
          {isAuthenticated && <NavLink to="/saved" className={linkClass}>Saved</NavLink>}
          <NavLink to="/how-it-works" className={linkClass}>How it works</NavLink>
          {!isAuthenticated && <NavLink to="/about" className={linkClass}>About</NavLink>}
          <NavLink to="/contact" className={linkClass}>Contact</NavLink>
          {isAuthenticated && (
            <button className="inline-flex items-center gap-1 px-3 py-2 text-sm font-bold text-slate-600 hover:text-slate-950 dark:text-white/60 dark:hover:text-white">
              More <ChevronDown size={13} />
            </button>
          )}
        </div>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-1.5">
          {isAuthenticated ? (
            <>
              <button
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:text-white/50 dark:hover:bg-white/[0.07] dark:hover:text-white"
                aria-label="Theme toggle"
                onClick={toggle}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button
                className="hidden items-center gap-2 rounded-full border border-slate-200 py-1 pl-1 pr-3 text-sm font-bold text-slate-900 transition hover:border-violet-200 hover:bg-violet-50 dark:border-white/[0.08] dark:text-white dark:hover:border-violet-500/30 dark:hover:bg-violet-500/10 sm:flex"
              >
                <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
                  {user?.avatar
                    ? <SmartImage src={user.avatar} alt={user.name} aspectRatio="1 / 1" className="h-full w-full" sizes="32px" />
                    : <span className="text-sm font-black">{(user?.name ?? 'U')[0]}</span>}
                </span>
                <span>{user?.name ?? 'Account'}</span>
                <ChevronDown size={13} />
              </button>
            </>
          ) : (
            <>
              <button
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:text-white/50 dark:hover:bg-white/[0.07] dark:hover:text-white"
                aria-label="Toggle theme"
                onClick={toggle}
              >
                {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
              </button>
              <Link
                to="/browse"
                className="hidden h-9 items-center gap-2 rounded-lg border-2 border-slate-900 px-4 text-sm font-black text-slate-900 transition hover:bg-slate-900 hover:text-white dark:border-white/25 dark:text-white dark:hover:bg-white dark:hover:text-slate-950 sm:inline-flex"
              >
                <Search size={15} />
                Find a home
              </Link>
              <Link
                to="/feed"
                className="hidden h-9 items-center gap-2 rounded-lg bg-violet-600 px-4 text-sm font-black text-white shadow-md shadow-violet-600/25 transition hover:bg-violet-500 sm:inline-flex"
              >
                <Play size={15} fill="currentColor" strokeWidth={0} />
                Watch tours
              </Link>
            </>
          )}

          <button
            className="rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-100 dark:border-white/[0.08] dark:text-white/70 dark:hover:bg-white/[0.06] lg:hidden"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="flex flex-col gap-0.5 border-t border-slate-100 bg-white px-4 pb-5 pt-3 dark:border-white/[0.06] dark:bg-[#141421] lg:hidden">
          {[
            { to: '/',             label: 'Home',         end: true },
            { to: '/browse',       label: 'Browse' },
            { to: '/feed',         label: 'Video feed' },
            { to: '/compare',      label: 'Compare' },
            { to: '/how-it-works', label: 'How it works' },
            { to: '/about',        label: 'About' },
            { to: '/contact',      label: 'Contact' },
          ].map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={!!end}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2.5 text-sm font-bold transition-colors ${
                  isActive
                    ? 'bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300'
                    : 'text-slate-700 hover:bg-slate-50 dark:text-white/70 dark:hover:bg-white/[0.05]'
                }`
              }
              onClick={() => setMobileOpen(false)}
            >
              {label}
            </NavLink>
          ))}
          <div className="mt-3 flex items-center gap-2">
            <Link
              to="/browse"
              className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border-2 border-slate-900 text-sm font-black text-slate-900 dark:border-white/20 dark:text-white"
              onClick={() => setMobileOpen(false)}
            >
              <Search size={15} />
              Find a home
            </Link>
            <Link
              to="/feed"
              className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-violet-600 text-sm font-black text-white"
              onClick={() => setMobileOpen(false)}
            >
              <Play size={15} fill="currentColor" strokeWidth={0} />
              Watch tours
            </Link>
          </div>
          <button
            className="mt-2 flex items-center justify-center gap-2 rounded-lg border border-slate-200 py-2.5 text-sm font-bold text-slate-700 dark:border-white/[0.08] dark:text-white/60"
            onClick={toggle}
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            {theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          </button>
        </div>
      )}
    </nav>
  );
}
