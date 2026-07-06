import type { FormEvent, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Mail, MapPin, MessageCircle, Phone, Send, ShieldCheck } from 'lucide-react';
import { PublicFooter } from '../components/layout/PublicFooter';

const contactMethods = [
  { icon: <Phone size={22} />, title: 'Call Us', primary: '+254 700 123 456', secondary: 'Mon - Fri, 8:00 AM - 6:00 PM' },
  { icon: <MessageCircle size={22} />, title: 'WhatsApp', primary: '+254 700 123 456', secondary: 'Chat with us on WhatsApp' },
  { icon: <Mail size={22} />, title: 'Email Us', primary: 'hello@staylynk.com', secondary: 'We aim to reply within 24 hours' },
  { icon: <MapPin size={22} />, title: 'Visit Us', primary: 'Westlands, Nairobi', secondary: 'Off Waiyaki Way, Nairobi, Kenya' },
];

export default function ContactPage() {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => event.preventDefault();

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto grid max-w-[1480px] items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
        <div>
          <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-[11px] font-black uppercase text-blue-700">Get in touch</span>
          <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight text-slate-950 sm:text-5xl">
            <span className="text-blue-600">Contact</span> Us
          </h1>
          <p className="mt-5 max-w-xl text-base font-medium leading-7 text-slate-600">
            We'd love to hear from you. Reach out to us for inquiries, support or partnership opportunities.
          </p>
        </div>
        <img
          src="https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?auto=format&fit=crop&w=1100&q=82"
          alt="Support desk with laptop and phone"
          loading="lazy"
          decoding="async"
          className="aspect-[16/9] w-full rounded-lg object-cover shadow-sm"
        />
      </section>

      <section className="mx-auto grid max-w-[1480px] gap-6 px-4 py-5 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
        <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black text-slate-950">Send us a message</h2>
          <div className="mt-5 grid gap-4">
            <Field label="Full Name" placeholder="Your full name" />
            <Field label="Email Address" placeholder="you@example.com" type="email" />
            <Field label="Phone Number" placeholder="0700 000 000" />
            <Field label="Subject" placeholder="How can we help you?" />
            <label className="grid gap-1.5 text-xs font-bold text-slate-700">
              Message
              <textarea className="min-h-32 rounded-lg border border-slate-200 px-3 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Type your message..." />
            </label>
          </div>
          <button className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-black text-white transition-colors hover:bg-blue-700">
            <Send size={15} />
            Send Message
          </button>
          <p className="mt-3 text-center text-xs font-medium text-slate-500">We typically respond within a few hours</p>
        </form>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black text-slate-950">Other ways to reach us</h2>
          <div className="mt-5 grid gap-3">
            {contactMethods.map(method => (
              <article key={method.title} className="flex items-center gap-4 rounded-lg border border-slate-200 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">{method.icon}</div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-black text-slate-950">{method.title}</h3>
                  <p className="mt-1 text-sm font-bold text-slate-700">{method.primary}</p>
                  <p className="mt-0.5 text-xs font-medium text-slate-500">{method.secondary}</p>
                </div>
                <span className="text-slate-400">›</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1480px] px-4 py-5 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-6">
          <div className="mb-5 flex items-center justify-center gap-2 text-center">
            <AlertTriangle className="text-amber-600" size={20} />
            <h2 className="text-lg font-black text-slate-950">Important Safety & Payment Notice</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Notice icon={<AlertTriangle size={20} />} title="No Payment Before Verification" text="Never make any payment before visiting and verifying the property." />
            <Notice icon={<ShieldCheck size={20} />} title="No Financial Transactions on Platform" text="StayLynk does not hold, collect, or process any payments between tenants and landlords." />
            <Notice icon={<ShieldCheck size={20} />} title="No Responsibility for Refunds" text="We are not responsible for refunds, financial disputes, or any financial convenience between users." />
          </div>
          <p className="mt-5 text-center text-sm font-black text-slate-700">All agreements and financial transactions are strictly between you and the landlord.</p>
        </div>
      </section>

      <section className="mx-auto max-w-[1480px] px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 p-5">
          <div>
            <h2 className="text-lg font-black text-slate-950">Frequently Asked Questions</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">Find quick answers to common questions.</p>
          </div>
          <Link to="/contact" className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-black text-blue-600">Visit Help Center</Link>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}

function Field({ label, placeholder, type = 'text' }: { label: string; placeholder: string; type?: string }) {
  return (
    <label className="grid gap-1.5 text-xs font-bold text-slate-700">
      {label}
      <input
        type={type}
        placeholder={placeholder}
        className="h-11 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}

function Notice({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <article className="flex gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-amber-300 bg-white text-amber-600">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-black text-slate-950">{title}</h3>
        <p className="mt-1 text-xs font-medium leading-5 text-slate-700">{text}</p>
      </div>
    </article>
  );
}
