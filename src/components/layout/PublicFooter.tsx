import { Link } from 'react-router-dom';
import { Globe2 } from 'lucide-react';
import logoUrl from '../../assets/logo.svg';

const footerGroups = [
  {
    title: 'Quick Links',
    links: [
      { label: 'Browse Properties', to: '/browse' },
      { label: 'How it works',      to: '/how-it-works' },
      { label: 'About us',          to: '/about' },
      { label: 'Contact us',        to: '/contact' },
    ],
  },
  {
    title: 'For Renters',
    links: [
      { label: 'Search Properties', to: '/browse' },
      { label: 'Saved Properties',  to: '/saved' },
      { label: 'Alerts',            to: '/alerts' },
      { label: 'Help Center',       to: '/contact' },
    ],
  },
  {
    title: 'For Landlords',
    links: [
      { label: 'List Property',   to: '/list-property' },
      { label: 'Landlord Sign up', to: '/list-property' },
      { label: 'Resources',        to: '/how-it-works' },
      { label: 'Support',          to: '/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms & Conditions', to: '/terms' },
      { label: 'Privacy Policy',     to: '/privacy' },
      { label: 'Safety Policy',      to: '/safety' },
    ],
  },
  {
    title: 'Contact Us',
    links: [
      { label: '+254 700 123 456',   to: '/contact' },
      { label: 'hello@staylynk.com', to: '/contact' },
      { label: 'Westlands, Nairobi', to: '/contact' },
    ],
  },
];

const socialLinks = [
  {
    label: 'Facebook',
    href: '#',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
      </svg>
    ),
  },
  {
    label: 'X / Twitter',
    href: '#',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: '#',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: '#',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
];

export function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-white/[0.07] dark:bg-[#141421]">
      <div className="mx-auto grid max-w-[1480px] gap-8 px-4 py-10 sm:px-6 md:grid-cols-3 lg:grid-cols-[1.2fr_repeat(5,1fr)] lg:px-8">
        {/* Brand */}
        <div>
          <Link
            to="/"
            className="flex items-center gap-2.5 text-[17px] font-black text-slate-950 dark:text-white"
          >
            <img src={logoUrl} alt="" aria-hidden="true" className="h-9 w-9 shrink-0" />
            StayLynk
          </Link>
          <p className="mt-4 max-w-xs text-sm font-medium leading-6 text-slate-500 dark:text-white/40">
            Your trusted platform for finding verified apartments, rooms and houses across Kenya.
          </p>
          <div className="mt-5 flex items-center gap-2">
            {socialLinks.map(link => (
              <a
                key={link.label}
                href={link.href}
                aria-label={link.label}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-600 dark:border-white/[0.08] dark:text-white/40 dark:hover:border-violet-500/30 dark:hover:bg-violet-500/10 dark:hover:text-violet-400"
              >
                {link.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Link groups */}
        {footerGroups.map(group => (
          <div key={group.title}>
            <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-950 dark:text-white/90">
              {group.title}
            </h3>
            <div className="mt-4 flex flex-col gap-3">
              {group.links.map(link => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="text-sm font-medium text-slate-500 transition hover:text-violet-600 dark:text-white/40 dark:hover:text-violet-400"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="mx-auto flex max-w-[1480px] flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-4 text-xs font-medium text-slate-400 dark:border-white/[0.05] dark:text-white/30 sm:px-6 lg:px-8">
        <span>© {new Date().getFullYear()} StayLynk. All rights reserved.</span>
        <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 font-bold text-slate-600 transition hover:border-slate-300 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/50 dark:hover:border-white/[0.12]">
          <Globe2 size={13} />
          Kenya (EN)
        </button>
      </div>
    </footer>
  );
}
