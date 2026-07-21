import { Link } from 'react-router-dom';
import { Check, Gem, Home, Lock, MapPin, Search, ShieldCheck, Users, Zap } from 'lucide-react';
import { PublicFooter } from '../components/layout/PublicFooter';

const stats = [
  { icon: <Home size={25} />, value: '25K+', label: 'Properties Listed' },
  { icon: <Users size={25} />, value: '120K+', label: 'Happy Users' },
  { icon: <ShieldCheck size={25} />, value: '2K+', label: 'Verified Landlords' },
  { icon: <MapPin size={25} />, value: '47+', label: 'Towns & Cities' },
];

const features = [
  { icon: <ShieldCheck size={18} />, title: 'Verified & Trusted', text: 'All listings and landlords are carefully verified.' },
  { icon: <Home size={18} />, title: 'No Fake Listings', text: 'We take fraud seriously. Only genuine listings.' },
  { icon: <Zap size={18} />, title: 'Real-Time Updates', text: 'Get real-time availability and instant alerts.' },
  { icon: <Users size={18} />, title: 'User First', text: 'We build every feature with your needs in mind.' },
  { icon: <Lock size={18} />, title: 'Secure & Private', text: 'Your data is protected with enterprise-grade security.' },
  { icon: <Users size={18} />, title: '24/7 Support', text: 'Our team is always here to help you.' },
];

const testimonials = [
  { name: 'Wanjiku M.', role: 'Tenant', quote: 'StayLynk made it so easy to find my apartment. The listings are genuine and the process was smooth.' },
  { name: 'Brian K.', role: 'Landlord', quote: 'As a landlord, I get serious tenants faster than any other platform.' },
  { name: 'Amina H.', role: 'Tenant', quote: 'Real-time availability is a game changer. No more disappointments!' },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#0d0d14]">
      <section className="mx-auto grid max-w-[1480px] items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8">
        <div>
          <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-[11px] font-black uppercase text-blue-700 dark:bg-violet-500/15 dark:text-violet-300">Our Story</span>
          <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight text-slate-950 dark:text-white sm:text-5xl">
            Building Trust Between Renters and <span className="text-blue-600 dark:text-violet-400">Landlords</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-slate-600 dark:text-white/50">
            StayLynk was created with a simple mission: to make finding and managing rental properties in Kenya easier, safer, and more transparent for everyone.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/browse" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-500 dark:bg-violet-600 dark:hover:bg-violet-500">
              <Search size={15} />
              Browse Properties
            </Link>
            <Link to="/list-property" className="inline-flex items-center gap-2 rounded-lg border border-blue-600 px-5 py-3 text-sm font-black text-blue-600 dark:border-violet-500/50 dark:text-violet-300 dark:hover:bg-violet-500/10">
              <Home size={15} />
              List Your Property
            </Link>
          </div>
        </div>
        <img
          src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=82"
          alt="Modern living room with city view"
          loading="lazy"
          decoding="async"
          className="aspect-[16/9] w-full rounded-lg object-cover shadow-sm"
        />
      </section>

      <section className="mx-auto max-w-[1480px] px-4 pb-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-white/[0.07] dark:bg-[#141421] sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(stat => (
            <div key={stat.label} className="flex items-center justify-center gap-5 border-slate-100 dark:border-white/[0.06] lg:border-r last:border-r-0">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-violet-500/15 dark:text-violet-300">{stat.icon}</div>
              <div>
                <p className="text-3xl font-black text-blue-600 dark:text-violet-400">{stat.value}</p>
                <p className="text-sm font-medium text-slate-600 dark:text-white/50">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-[1480px] gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1100&q=82"
            alt="StayLynk team collaborating"
            loading="lazy"
            decoding="async"
            className="aspect-[4/3] w-full rounded-lg object-cover shadow-sm"
          />
          <div className="absolute bottom-5 left-5 rounded-lg bg-white p-4 shadow-xl dark:bg-[#141421] dark:shadow-black/40">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-violet-500/15 dark:text-violet-300"><Users size={22} /></span>
              <p className="max-w-40 text-sm font-black text-slate-950 dark:text-white">A passionate team working for you</p>
            </div>
          </div>
        </div>
        <div>
          <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-[11px] font-black uppercase text-blue-700 dark:bg-violet-500/15 dark:text-violet-300">Who We Are</span>
          <h2 className="mt-5 text-3xl font-black leading-tight text-slate-950 dark:text-white">We’re more than just a property platform.</h2>
          <p className="mt-4 text-sm font-medium leading-6 text-slate-600 dark:text-white/50">
            We are a team of innovators, designers, and problem solvers passionate about real estate and technology. Our platform helps renters make informed decisions and helps landlords reach the right tenants faster.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {features.map(feature => (
              <article key={feature.title} className="flex gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-violet-500/15 dark:text-violet-300">{feature.icon}</span>
                <div>
                  <h3 className="text-sm font-black text-slate-950 dark:text-white">{feature.title}</h3>
                  <p className="mt-1 text-xs font-medium leading-5 text-slate-600 dark:text-white/50">{feature.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1480px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-blue-50 p-6 dark:bg-violet-500/[0.06]">
          <h2 className="text-2xl font-black text-slate-950 dark:text-white">Our Mission, Vision & Values</h2>
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <Value icon={<Search size={26} />} title="Our Mission" text="To revolutionize the way people find and manage rental properties through trust, transparency, and technology." />
            <Value icon={<ShieldCheck size={26} />} title="Our Vision" text="To become Kenya’s most trusted and widely used rental property platform, connecting millions of people to better homes." />
            <Value icon={<Gem size={26} />} title="Our Values" text="Integrity, transparency, innovation, customer focus, and excellence guide how we build StayLynk." />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1480px] px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="mb-5 text-center text-2xl font-black text-slate-950 dark:text-white">Trusted by Thousands</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map(item => (
            <article key={item.name} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-white/[0.07] dark:bg-[#141421]">
              <p className="text-amber-400">★★★★★</p>
              <p className="mt-3 text-sm font-medium leading-6 text-slate-700 dark:text-white/60">“{item.quote}”</p>
              <p className="mt-4 text-sm font-black text-slate-950 dark:text-white">{item.name}</p>
              <p className="text-xs font-medium text-slate-500 dark:text-white/40">{item.role}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-5 rounded-lg bg-blue-700 p-6 text-white dark:bg-violet-700">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15"><Home size={32} fill="currentColor" /></span>
            <div>
              <h2 className="text-2xl font-black">Ready to find or list your next property?</h2>
              <p className="mt-1 text-sm font-medium text-blue-50 dark:text-violet-100">Join thousands of satisfied renters and landlords on StayLynk today.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/browse" className="rounded-lg bg-white px-5 py-3 text-sm font-black text-blue-700 hover:bg-white/90 dark:text-violet-700">Browse Properties</Link>
            <Link to="/list-property" className="rounded-lg border border-white/60 px-5 py-3 text-sm font-black text-white hover:bg-white/10">List Your Property</Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}

function Value({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <article className="flex gap-4">
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-blue-600 dark:bg-[#141421] dark:text-violet-400">{icon}</span>
      <div>
        <h3 className="text-base font-black text-slate-950 dark:text-white">{title}</h3>
        <p className="mt-2 text-sm font-medium leading-6 text-slate-600 dark:text-white/50">{text}</p>
        {title === 'Our Values' && (
          <div className="mt-3 grid gap-1 text-sm font-medium text-slate-700 dark:text-white/60">
            {['Integrity', 'Transparency', 'Innovation', 'Customer Focus', 'Excellence'].map(item => (
              <span key={item} className="inline-flex items-center gap-2"><Check size={14} className="text-blue-600 dark:text-violet-400" />{item}</span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
