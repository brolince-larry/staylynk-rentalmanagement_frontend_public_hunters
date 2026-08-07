import { Link } from 'react-router-dom';
import { Globe2, MessageCircle } from 'lucide-react';
import logoUrl from '../../assets/logo.png';
import { useSiteSettings } from '../../api/siteApi';

const staticFooterGroups = [
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
    title: 'Legal',
    links: [
      { label: 'Terms & Conditions', to: '/terms' },
      { label: 'Privacy Policy',     to: '/privacy' },
      { label: 'Safety Policy',      to: '/safety' },
    ],
  },
];

const socialLinks = [
  {
    label: 'Facebook',
    href: 'https://facebook.com/profile.php?id=61592438087284',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.098 2.795.142v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.324v-21.35c0-.732-.593-1.325-1.325-1.325z" />
      </svg>
    ),
  },
  {
    label: 'X / Twitter',
    href: 'https://x.com/Staylynkkenya',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com/staylynk.ke',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.012-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.058 1.645-.07 4.849-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/company/staylynk',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.446-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
];

export function PublicFooter() {
  const { data: settings } = useSiteSettings();

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
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-600 dark:border-white/[0.08] dark:text-white/40 dark:hover:border-violet-500/30 dark:hover:bg-violet-500/10 dark:hover:text-violet-400"
              >
                {link.icon}
              </a>
            ))}
            {settings?.whatsapp_url && (
              <a
                href={settings.whatsapp_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat with us on WhatsApp"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600 dark:border-white/[0.08] dark:text-white/40 dark:hover:border-emerald-500/30 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400"
              >
                <MessageCircle size={15} />
              </a>
            )}
          </div>
        </div>

        {/* Link groups */}
        {staticFooterGroups.map(group => (
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

        {/* For Landlords — sign-up link is backend-sourced and always opens
            the app subdomain in a new tab, so it can't be repointed by
            editing frontend code. */}
        <div>
          <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-950 dark:text-white/90">
            For Landlords
          </h3>
          <div className="mt-4 flex flex-col gap-3">
            {settings?.landlord_portal_url && (
              <a
                href={settings.landlord_portal_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-slate-500 transition hover:text-violet-600 dark:text-white/40 dark:hover:text-violet-400"
              >
                Landlord Sign up
              </a>
            )}
            <Link
              to="/how-it-works"
              className="text-sm font-medium text-slate-500 transition hover:text-violet-600 dark:text-white/40 dark:hover:text-violet-400"
            >
              Resources
            </Link>
            <Link
              to="/contact"
              className="text-sm font-medium text-slate-500 transition hover:text-violet-600 dark:text-white/40 dark:hover:text-violet-400"
            >
              Support
            </Link>
          </div>
        </div>

        {/* Contact Us — backend-sourced, real tel:/mailto: links */}
        <div>
          <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-950 dark:text-white/90">
            Contact Us
          </h3>
          <div className="mt-4 flex flex-col gap-3">
            {settings?.support_phone && (
              <a
                href={`tel:${settings.support_phone}`}
                className="text-sm font-medium text-slate-500 transition hover:text-violet-600 dark:text-white/40 dark:hover:text-violet-400"
              >
                {settings.support_phone_display || settings.support_phone}
              </a>
            )}
            {settings?.support_email && (
              <a
                href={`mailto:${settings.support_email}`}
                className="text-sm font-medium text-slate-500 transition hover:text-violet-600 dark:text-white/40 dark:hover:text-violet-400"
              >
                {settings.support_email}
              </a>
            )}
            {settings?.office_address && (
              <Link
                to="/contact"
                className="text-sm font-medium text-slate-500 transition hover:text-violet-600 dark:text-white/40 dark:hover:text-violet-400"
              >
                {settings.office_address}
              </Link>
            )}
          </div>
        </div>
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
