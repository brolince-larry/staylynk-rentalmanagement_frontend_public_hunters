import { useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Loader2, Mail, MapPin, MessageCircle, Phone, Send, ShieldCheck, XCircle } from 'lucide-react';
import { PublicFooter } from '../components/layout/PublicFooter';
import { useSiteSettings, useSubmitContact } from '../api/siteApi';
import { Seo } from '../components/seo/Seo';

interface FormState {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const initialForm: FormState = { name: '', email: '', phone: '', subject: '', message: '' };

export default function ContactPage() {
  const { data: settings } = useSiteSettings();
  const { mutate: submitContact, isPending, isError, error, reset } = useSubmitContact();
  const [form, setForm] = useState<FormState>(initialForm);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const contactMethods = [
    {
      icon: <Phone size={22} />,
      title: 'Call Us',
      primary: settings?.support_phone_display ?? settings?.support_phone ?? '—',
      secondary: settings?.support_hours ?? '',
      href: settings?.support_phone ? `tel:${settings.support_phone}` : undefined,
    },
    {
      icon: <MessageCircle size={22} />,
      title: 'WhatsApp',
      primary: settings?.support_phone_display ?? settings?.support_phone ?? '—',
      secondary: 'Chat with us on WhatsApp',
      href: settings?.whatsapp_url,
      external: true,
    },
    {
      icon: <Mail size={22} />,
      title: 'Email Us',
      primary: settings?.support_email ?? '—',
      secondary: 'We aim to reply within 24 hours',
      href: settings?.support_email ? `mailto:${settings.support_email}` : undefined,
    },
    {
      icon: <MapPin size={22} />,
      title: 'Visit Us',
      primary: settings?.office_address ?? '—',
      secondary: settings?.office_address_full ?? '',
      href: undefined,
    },
  ];

  const handleChange = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (isError) reset();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isPending) return;
    setSuccessMessage(null);
    submitContact(
      {
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        subject: form.subject || undefined,
        message: form.message,
      },
      {
        onSuccess: (res) => {
          setSuccessMessage(res.message ?? "Thanks for reaching out — we'll respond soon.");
          setForm(initialForm);
        },
      },
    );
  };

  return (
    <main className="min-h-screen bg-white dark:bg-[#0d0d14]">
      <Seo
        title="Contact StayLynk"
        description="Reach the StayLynk team by phone, WhatsApp, or email for support with rentals, listings, or account questions."
        canonicalPath="/contact"
      />
      <section className="mx-auto grid max-w-[1480px] items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
        <div>
          <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-[11px] font-black uppercase text-blue-700 dark:bg-violet-500/15 dark:text-violet-300">Get in touch</span>
          <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight text-slate-950 dark:text-white sm:text-5xl">
            <span className="text-blue-600 dark:text-violet-400">Contact</span> Us
          </h1>
          <p className="mt-5 max-w-xl text-base font-medium leading-7 text-slate-600 dark:text-white/50">
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
        <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-white/[0.07] dark:bg-[#141421]">
          <h2 className="text-lg font-black text-slate-950 dark:text-white">Send us a message</h2>

          {successMessage && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-900/10 dark:text-emerald-300">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}
          {isError && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700 dark:border-red-500/20 dark:bg-red-900/10 dark:text-red-300">
              <XCircle size={18} className="mt-0.5 shrink-0" />
              <span>{(error as { message?: string } | null)?.message ?? 'Something went wrong. Please try again.'}</span>
            </div>
          )}

          <div className="mt-5 grid gap-4">
            <Field label="Full Name" placeholder="Your full name" value={form.name} onChange={handleChange('name')} required minLength={2} maxLength={150} />
            <Field label="Email Address" placeholder="you@example.com" type="email" value={form.email} onChange={handleChange('email')} required maxLength={150} />
            <Field label="Phone Number" placeholder="0700 000 000" value={form.phone} onChange={handleChange('phone')} maxLength={30} />
            <Field label="Subject" placeholder="How can we help you?" value={form.subject} onChange={handleChange('subject')} maxLength={200} />
            <label className="grid gap-1.5 text-xs font-bold text-slate-700 dark:text-white/60">
              Message
              <textarea
                value={form.message}
                onChange={handleChange('message')}
                required
                minLength={10}
                maxLength={5000}
                className="min-h-32 rounded-lg border border-slate-200 px-3 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/30 dark:focus:border-violet-500 dark:focus:ring-violet-500/20"
                placeholder="Type your message..."
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-black text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-violet-600 dark:hover:bg-violet-500"
          >
            {isPending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            {isPending ? 'Sending…' : 'Send Message'}
          </button>
          <p className="mt-3 text-center text-xs font-medium text-slate-500 dark:text-white/40">We typically respond within a few hours</p>
        </form>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-white/[0.07] dark:bg-[#141421]">
          <h2 className="text-lg font-black text-slate-950 dark:text-white">Other ways to reach us</h2>
          <div className="mt-5 grid gap-3">
            {contactMethods.map(method => {
              const content = (
                <>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-violet-500/15 dark:text-violet-300">{method.icon}</div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-black text-slate-950 dark:text-white">{method.title}</h3>
                    <p className="mt-1 text-sm font-bold text-slate-700 dark:text-white/70">{method.primary}</p>
                    <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-white/40">{method.secondary}</p>
                  </div>
                  <span className="text-slate-400 dark:text-white/30">›</span>
                </>
              );
              return method.href ? (
                <a
                  key={method.title}
                  href={method.href}
                  {...(method.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="flex items-center gap-4 rounded-lg border border-slate-200 p-4 transition hover:border-blue-300 dark:border-white/[0.07] dark:hover:border-violet-500/30"
                >
                  {content}
                </a>
              ) : (
                <article key={method.title} className="flex items-center gap-4 rounded-lg border border-slate-200 p-4 dark:border-white/[0.07]">
                  {content}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1480px] px-4 py-5 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-6 dark:border-amber-500/20 dark:bg-amber-900/10">
          <div className="mb-5 flex items-center justify-center gap-2 text-center">
            <AlertTriangle className="text-amber-600 dark:text-amber-400" size={20} />
            <h2 className="text-lg font-black text-slate-950 dark:text-white">Important Safety & Payment Notice</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Notice icon={<AlertTriangle size={20} />} title="No Payment Before Verification" text="Never make any payment before visiting and verifying the property." />
            <Notice icon={<ShieldCheck size={20} />} title="No Financial Transactions on Platform" text="StayLynk does not hold, collect, or process any payments between tenants and landlords." />
            <Notice icon={<ShieldCheck size={20} />} title="No Responsibility for Refunds" text="We are not responsible for refunds, financial disputes, or any financial convenience between users." />
          </div>
          <p className="mt-5 text-center text-sm font-black text-slate-700 dark:text-white/70">All agreements and financial transactions are strictly between you and the landlord.</p>
        </div>
      </section>

      <section className="mx-auto max-w-[1480px] px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-white/[0.07] dark:bg-white/[0.03]">
          <div>
            <h2 className="text-lg font-black text-slate-950 dark:text-white">Frequently Asked Questions</h2>
            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-white/40">Find quick answers to common questions.</p>
          </div>
          <Link to="/contact" className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-black text-blue-600 dark:border-violet-500/50 dark:text-violet-300 dark:hover:bg-violet-500/10">Visit Help Center</Link>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}

function Field({
  label, placeholder, type = 'text', value, onChange, required, minLength, maxLength,
}: {
  label: string;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
}) {
  return (
    <label className="grid gap-1.5 text-xs font-bold text-slate-700 dark:text-white/60">
      {label}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        minLength={minLength}
        maxLength={maxLength}
        className="h-11 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/30 dark:focus:border-violet-500 dark:focus:ring-violet-500/20"
      />
    </label>
  );
}

function Notice({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <article className="flex gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-amber-300 bg-white text-amber-600 dark:border-amber-500/30 dark:bg-white/[0.05] dark:text-amber-400">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-black text-slate-950 dark:text-white">{title}</h3>
        <p className="mt-1 text-xs font-medium leading-5 text-slate-700 dark:text-white/60">{text}</p>
      </div>
    </article>
  );
}
