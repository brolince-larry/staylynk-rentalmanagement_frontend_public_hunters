import { Link } from 'react-router-dom';
import { CalendarDays, CheckSquare, Heart, Lock, MessageSquare, Search, ShieldCheck, Zap } from 'lucide-react';
import { PublicFooter } from '../components/layout/PublicFooter';

const steps = [
  { icon: <Search size={28} />, title: '1. Search Properties', text: 'Browse thousands of verified properties that match your preferences.' },
  { icon: <Heart size={28} />, title: '2. Save & Compare', text: 'Save your favorite homes and compare prices, features and locations.' },
  { icon: <MessageSquare size={28} />, title: '3. Contact Landlord', text: 'Message or call the landlord directly through our secure platform.' },
  { icon: <CalendarDays size={28} />, title: '4. Schedule Viewing', text: 'Book a viewing and visit the property at a time that works for you.' },
  { icon: <CheckSquare size={28} />, title: '5. Move In', text: 'Close the deal and move into your perfect new home.' },
];

const benefits = [
  { icon: <ShieldCheck size={22} />, title: 'Verified Listings', text: 'All listings are verified to ensure trust and transparency.' },
  { icon: <Zap size={22} />, title: 'Real-Time Availability', text: 'Get real-time updates on property availability and pricing.' },
  { icon: <Lock size={22} />, title: 'Secure & Safe', text: 'Your data is protected with enterprise-grade security.' },
  { icon: <MessageSquare size={22} />, title: '24/7 Support', text: 'Our support team is always here to help you anytime.' },
];

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto grid max-w-[1480px] items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div>
          <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-[11px] font-black uppercase text-blue-700">Simple, fast & reliable</span>
          <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight text-slate-950 sm:text-5xl">
            How <span className="text-blue-600">StayLynk</span> Works
          </h1>
          <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-slate-600">
            Finding your perfect home has never been easier. We connect you with verified landlords and quality properties in minutes.
          </p>
        </div>
        <img
          src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=82"
          alt="Bright furnished living room"
          loading="lazy"
          decoding="async"
          className="aspect-[16/9] w-full rounded-lg object-cover shadow-sm"
        />
      </section>

      <section className="mx-auto max-w-[1480px] px-4 pb-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map(step => (
            <article key={step.title} className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                {step.icon}
              </div>
              <h2 className="mt-4 text-sm font-black text-slate-950">{step.title}</h2>
              <p className="mx-auto mt-2 max-w-44 text-xs font-medium leading-5 text-slate-600">{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1480px] px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="mb-5 text-2xl font-black text-slate-950">Why Choose StayLynk?</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(benefit => (
            <article key={benefit.title} className="rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">{benefit.icon}</div>
              <h3 className="mt-4 text-sm font-black text-slate-950">{benefit.title}</h3>
              <p className="mt-2 text-xs font-medium leading-5 text-slate-600">{benefit.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1480px] px-4 py-5 sm:px-6 lg:px-8">
        <div className="grid gap-5 rounded-lg border border-amber-300 bg-amber-50 p-6 md:grid-cols-[0.9fr_1.1fr]">
          <div className="flex gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white text-amber-600">
              <ShieldCheck size={34} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-950">Your Safety is Our Priority</h2>
              <p className="mt-2 text-sm font-black text-slate-700">Never make any payment before you:</p>
              <ul className="mt-2 space-y-1 text-sm font-medium text-slate-700">
                <li>Verify the house</li>
                <li>Visit the property</li>
                <li>Agree with the landlord</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-amber-200 pt-5 md:border-l md:border-t-0 md:pl-6 md:pt-0">
            <p className="text-sm font-black text-slate-950">StayLynk does not hold, collect, or process any payments between tenants and landlords.</p>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-700">We are not responsible for refunds, financial disputes, or financial convenience between users. All agreements are strictly between you and the landlord.</p>
            <p className="mt-2 text-sm font-black text-slate-950">Stay safe. Stay smart.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1480px] px-4 py-5 sm:px-6 lg:px-8">
        <div className="grid items-center gap-6 overflow-hidden rounded-lg border border-slate-200 bg-blue-50 p-6 md:grid-cols-[0.8fr_1.2fr]">
          <img
            src="https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=900&q=82"
            alt="Mobile property search app"
            loading="lazy"
            decoding="async"
            className="aspect-[16/10] w-full rounded-lg object-cover"
          />
          <div>
            <h2 className="text-2xl font-black text-slate-950">Ready to find your new home?</h2>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-600">Join thousands of happy renters who found their perfect home on StayLynk.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/browse" className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-black text-white">Browse Properties</Link>
              <Link to="/list-property" className="rounded-lg border border-blue-600 px-5 py-3 text-sm font-black text-blue-600">List Your Property</Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
