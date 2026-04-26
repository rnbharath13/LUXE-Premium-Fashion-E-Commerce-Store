import { useEffect } from 'react';

const SITE_NAME    = 'LUXE';
const TITLE_SUFFIX = `· ${SITE_NAME}`;
const FALLBACK_DESC = 'Premium fashion, curated for you. Discover the season\'s most-wanted pieces — shipped fast, returned free.';

// Set or update a meta tag identified by attribute key/value (e.g. name="description" or property="og:title").
const upsertMeta = (key, val, content) => {
  let el = document.head.querySelector(`meta[${key}="${val}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(key, val);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content ?? '');
};

const upsertCanonical = (href) => {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = href;
};

// Inject (or replace) a JSON-LD structured-data script tag with a stable id so
// repeated renders update the same node instead of stacking.
const upsertJsonLd = (id, data) => {
  let el = document.head.querySelector(`script[type="application/ld+json"][data-seo="${id}"]`);
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.setAttribute('data-seo', id);
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
};

const removeJsonLd = (id) => {
  const el = document.head.querySelector(`script[type="application/ld+json"][data-seo="${id}"]`);
  if (el) el.remove();
};

/**
 * Set the document head metadata for SEO + social sharing.
 * Pass `jsonLd` for structured data (pass an object; pass null to clear on unmount).
 *
 * Usage:
 *   useSeo({
 *     title: product.name,
 *     description: product.description,
 *     image: product.image,
 *     jsonLd: { id: 'product', data: { '@context': 'https://schema.org/', '@type': 'Product', ... } },
 *   });
 */
export const useSeo = ({ title, description, image, type = 'website', jsonLd } = {}) => {
  useEffect(() => {
    const url  = window.location.href;
    const desc = description || FALLBACK_DESC;
    const ttl  = title ? `${title} ${TITLE_SUFFIX}` : SITE_NAME;

    document.title = ttl;
    upsertMeta('name',     'description',     desc);
    upsertMeta('property', 'og:type',         type);
    upsertMeta('property', 'og:title',        title || SITE_NAME);
    upsertMeta('property', 'og:description',  desc);
    upsertMeta('property', 'og:url',          url);
    upsertMeta('property', 'og:site_name',    SITE_NAME);
    upsertMeta('name',     'twitter:card',    image ? 'summary_large_image' : 'summary');
    upsertMeta('name',     'twitter:title',   title || SITE_NAME);
    upsertMeta('name',     'twitter:description', desc);
    if (image) {
      upsertMeta('property', 'og:image',      image);
      upsertMeta('name',     'twitter:image', image);
    }
    upsertCanonical(url);

    if (jsonLd?.id && jsonLd.data) {
      upsertJsonLd(jsonLd.id, jsonLd.data);
      return () => removeJsonLd(jsonLd.id);
    }
  }, [title, description, image, type, jsonLd?.id, jsonLd?.data && JSON.stringify(jsonLd.data)]);
};
