import type { FormEvent, ReactNode } from 'react';
import { Building2, CheckCircle2, Home, ImagePlus, ShieldCheck, UploadCloud } from 'lucide-react';
import { PublicFooter } from '../components/layout/PublicFooter';

const benefits = [
  'Publish verified rental listings',
  'Add property and room images',
  'Sync vacant rooms for public house hunters',
  'Receive serious tenant inquiries',
];

export default function ListPropertyPage() {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => event.preventDefault();

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto grid max-w-[1480px] items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <div>
          <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-[11px] font-black uppercase text-blue-700">For landlords</span>
          <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight text-slate-950 sm:text-5xl">
            List your property and reach verified renters faster
          </h1>
          <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-slate-600">
            Share your property details and our team will help you publish a clear, room-aware public listing with photos, prices, availability, and tenant-ready information.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {benefits.map(item => (
              <div key={item} className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <CheckCircle2 size={17} className="text-emerald-600" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <img
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=82"
            alt="Modern rental property exterior"
            loading="lazy"
            decoding="async"
            className="aspect-[16/9] w-full object-cover"
          />
          <div className="grid gap-3 p-5 sm:grid-cols-3">
            <Info icon={<Building2 size={18} />} title="Property" text="Add full property details" />
            <Info icon={<ImagePlus size={18} />} title="Rooms" text="Show vacant rooms" />
            <Info icon={<ShieldCheck size={18} />} title="Verified" text="Build renter trust" />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1480px] gap-6 px-4 pb-12 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white">
            <Home size={26} fill="currentColor" />
          </div>
          <h2 className="mt-5 text-2xl font-black text-slate-950">What happens next?</h2>
          <div className="mt-5 space-y-4">
            <Step number="1" title="Submit your details" text="Tell us about the property, location, room types and expected rent." />
            <Step number="2" title="Upload images" text="Property and room images are uploaded through the secure media system." />
            <Step number="3" title="Publish listing" text="Once verified, the public listing is published for house hunters." />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-950">Start listing your property</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">This public form collects your first details. Publishing and image upload happen securely after verification.</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="Full name" placeholder="Your name" />
            <Field label="Phone number" placeholder="+254 700 000 000" />
            <Field label="Email address" placeholder="you@example.com" type="email" />
            <Field label="Property location" placeholder="Westlands, Nairobi" />
            <Field label="Property type" placeholder="Apartment, house, rooms..." />
            <Field label="Available rooms" placeholder="30" type="number" />
          </div>

          <label className="mt-4 grid gap-1.5 text-xs font-bold text-slate-700">
            Property description
            <textarea
              className="min-h-28 rounded-lg border border-slate-200 px-3 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Tell renters what makes your property a good fit..."
            />
          </label>

          <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
            <UploadCloud className="mx-auto text-slate-400" size={30} />
            <p className="mt-2 text-sm font-black text-slate-800">Images are added after verification</p>
            <p className="mt-1 text-xs font-medium text-slate-500">Use the media upload flow for property and room photos before publish.</p>
          </div>

          <button className="mt-5 h-12 w-full rounded-lg bg-blue-600 text-sm font-black text-white transition-colors hover:bg-blue-700">
            Submit Property Request
          </button>
        </form>
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

function Info({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <span className="text-blue-600">{icon}</span>
      <p className="mt-2 text-sm font-black text-slate-950">{title}</p>
      <p className="mt-1 text-xs font-medium text-slate-500">{text}</p>
    </div>
  );
}

function Step({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <div className="flex gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white">{number}</span>
      <div>
        <h3 className="text-sm font-black text-slate-950">{title}</h3>
        <p className="mt-1 text-sm font-medium leading-6 text-slate-600">{text}</p>
      </div>
    </div>
  );
}
