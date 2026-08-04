// Shared JSON-LD builders — keeps structured data consistent and DRY
// across pages instead of duplicating literals in every <Seo jsonLd=...>.

export const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': ['Organization', 'RealEstateAgent'],
  name: 'StayLynk',
  url: 'https://staylynk.co.ke',
  logo: 'https://staylynk.co.ke/android-chrome-512x512.png',
  description: 'StayLynk is a verified rental listings platform for Kenya. Renters search houses, hostels, and rooms by location, price, and amenities, watch short video tours, compare listings side by side, and book viewings directly with landlords.',
  areaServed: { '@type': 'Country', name: 'Kenya' },
} as const;

export function buildBreadcrumbSchema(items: Array<{ name: string; path: string }>) {
  const origin = typeof window === 'undefined' ? 'https://staylynk.co.ke' : window.location.origin;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${origin}${item.path}`,
    })),
  };
}
