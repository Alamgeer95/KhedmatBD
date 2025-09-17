'use client';

import { Helmet } from 'react-helmet-async';

type JsonLd = Record<string, any>;

type SeoProps = {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  noindex?: boolean;
  jsonLd?: JsonLd | JsonLd[];
};

export default function Seo({
  title,
  description,
  canonical,
  ogImage,
  noindex,
  jsonLd,
}: SeoProps) {
  const siteName = 'KhedmatBD';
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const image = ogImage || '/og-default.png';

  // JSON-LD কে সবসময় array বানাই
  const json = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [];

  return (
    <>
      <Helmet prioritizeSeoTags>
        {/* Title & Description */}
        <title>{fullTitle}</title>
        {description && <meta name="description" content={description} />}
        {noindex && <meta name="robots" content="noindex, nofollow" />}

        {/* Canonical */}
        {canonical && <link rel="canonical" href={canonical} />}

        {/* Open Graph */}
        <meta property="og:site_name" content={siteName} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={fullTitle} />
        {description && <meta property="og:description" content={description} />}
        {canonical && <meta property="og:url" content={canonical} />}
        {image && <meta property="og:image" content={image} />}
        <meta property="og:locale" content="bn_BD" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={fullTitle} />
        {description && <meta name="twitter:description" content={description} />}
        {image && <meta name="twitter:image" content={image} />}
      </Helmet>

      {/* JSON-LD */}
      {json.map((obj, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(obj) }}
        />
      ))}
    </>
  );
}
