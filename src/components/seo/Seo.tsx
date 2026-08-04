import { Helmet } from 'react-helmet-async';

interface SeoProps {
  title: string;
  description: string;
  canonicalPath?: string;
  image?: string | null;
  jsonLd?: object | object[];
}

export function Seo({ title, description, canonicalPath = '/', image, jsonLd }: SeoProps) {
  const origin = typeof window === 'undefined' ? 'https://staylynk.co.ke' : window.location.origin;
  const canonical = `${origin}${canonicalPath}`;
  const payload = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [];

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical} />
      {image && <meta property="og:image" content={image} />}
      <meta name="twitter:card" content="summary_large_image" />
      {payload.map((entry, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(entry)}
        </script>
      ))}
    </Helmet>
  );
}
