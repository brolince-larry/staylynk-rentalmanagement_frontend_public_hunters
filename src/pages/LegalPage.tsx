import { Link, useLocation } from 'react-router-dom';
import { PublicFooter } from '../components/layout/PublicFooter';

const content = {
  '/privacy': {
    title: 'Privacy Policy',
    intro: 'This Privacy Policy explains how StayLynk collects, uses, protects, and shares information when you use our platform.',
    sections: [
      ['Information We Collect', 'We collect account details, contact information, listing activity, inquiry messages, device information, and usage analytics needed to operate the platform.'],
      ['How We Use Information', 'We use information to show listings, connect renters and landlords, improve safety, prevent fraud, provide support, and improve the product experience.'],
      ['Sharing and Disclosure', 'We do not sell personal data. We may share necessary information with landlords, renters, service providers, or authorities where legally required.'],
      ['Data Security', 'We use reasonable technical and organizational safeguards to protect your information from unauthorized access, misuse, or loss.'],
      ['Your Choices', 'You can request updates, corrections, or deletion of your account information by contacting StayLynk support.'],
    ],
  },
  '/terms': {
    title: 'Terms & Conditions',
    intro: 'These Terms & Conditions govern your use of StayLynk as a renter, landlord, visitor, or partner.',
    sections: [
      ['Platform Role', 'StayLynk helps users discover rental listings and connect with landlords. StayLynk is not a party to rental agreements between renters and landlords.'],
      ['User Responsibilities', 'Users must provide accurate information, respect other users, and use the platform lawfully and responsibly.'],
      ['Listings and Availability', 'We work to keep listings accurate, but availability, prices, and details may change. Always verify a property before making decisions.'],
      ['Payments', 'StayLynk does not hold, collect, or process payments between tenants and landlords unless a clearly stated official payment product is provided.'],
      ['Limitation of Liability', 'StayLynk is not responsible for private agreements, refunds, financial disputes, or off-platform transactions between users.'],
    ],
  },
  '/safety': {
    title: 'Safety Policy',
    intro: 'StayLynk is designed to make house hunting safer, more transparent, and more reliable.',
    sections: [
      ['Verify Before Paying', 'Never pay before visiting and verifying a property, landlord, and rental terms.'],
      ['Avoid Off-Platform Pressure', 'Be cautious of anyone rushing payments, refusing viewings, or avoiding identity verification.'],
      ['Report Suspicious Listings', 'Report fake listings, suspicious requests, or inaccurate information to StayLynk support immediately.'],
      ['User Agreements', 'All rental agreements and financial arrangements are strictly between renters and landlords.'],
    ],
  },
};

export default function LegalPage() {
  const location = useLocation();
  const page = content[location.pathname as keyof typeof content] ?? content['/privacy'];

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Link to="/" className="text-sm font-black text-blue-600">StayLynk</Link>
        <h1 className="mt-5 text-4xl font-black text-slate-950">{page.title}</h1>
        <p className="mt-4 text-base font-medium leading-7 text-slate-600">{page.intro}</p>
        <div className="mt-8 space-y-5">
          {page.sections.map(([title, text]) => (
            <section key={title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-black text-slate-950">{title}</h2>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-600">{text}</p>
            </section>
          ))}
        </div>
        <p className="mt-8 text-sm font-medium leading-6 text-slate-500">
          For questions about this policy, contact us at hello@staylynk.com.
        </p>
      </section>
      <PublicFooter />
    </main>
  );
}
