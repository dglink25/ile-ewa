/**
 * SchemaOrg — injecte un bloc JSON-LD dans le <head>
 * Compatible avec react-helmet-async.
 *
 * Usage :
 *   <SchemaOrg schema={schemaObject} />
 *   <SchemaOrg schema={[schema1, schema2]} />
 */
import { Helmet } from 'react-helmet-async';

export default function SchemaOrg({ schema }) {
  const data = Array.isArray(schema) ? schema : [schema];
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(data.length === 1 ? data[0] : data, null, 0)}
      </script>
    </Helmet>
  );
}

/* ═══════════════════════════════════════════════
   HELPERS — constructeurs de schémas réutilisables
═══════════════════════════════════════════════ */

const BASE = 'https://portail-ileewa.com';
const LOGO = `${BASE}/logo.png`;

/** Organisation principale du site */
export function schemaOrganization() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Ilé Ẹwà',
    url: BASE,
    logo: LOGO,
    description: 'Ilé Ẹwà est un espace communautaire pour se former, se rencontrer et grandir ensemble.',
    sameAs: [],            // ajouter URLs réseaux sociaux si disponibles
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'admin@ile-ewa.com',
      availableLanguage: 'French',
    },
  };
}

/** Site Web (SearchAction pour le rich result sitelinks searchbox) */
export function schemaWebSite() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Ilé Ẹwà',
    url: BASE,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE}/blog?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/** Article de blog */
export function schemaBlogPosting({ article }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.excerpt || '',
    image: article.cover_image_url || LOGO,
    url: `${BASE}/blog/${article.slug}`,
    datePublished: article.published_at || article.created_at,
    dateModified: article.updated_at || article.published_at,
    author: article.author_name
      ? { '@type': 'Person', name: article.author_name }
      : { '@type': 'Organization', name: 'Ilé Ẹwà' },
    publisher: {
      '@type': 'Organization',
      name: 'Ilé Ẹwà',
      logo: { '@type': 'ImageObject', url: LOGO },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${BASE}/blog/${article.slug}` },
    keywords: article.category_name || '',
  };
}

/** Événement / Formation (avec prix si payant) */
export function schemaEvent({ article }) {
  const isFree = article.is_free === 1 || article.is_free === true;

  // Prix promotionnel actif ?
  let price = article.price;
  const now = new Date();
  if (!isFree && article.has_promo && article.promo_price) {
    const ps = article.promo_start ? new Date(article.promo_start) : null;
    const pe = article.promo_end   ? new Date(article.promo_end)   : null;
    if ((!ps || now >= ps) && (!pe || now <= pe)) price = article.promo_price;
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: article.title,
    description: article.excerpt || '',
    image: article.cover_image_url || LOGO,
    url: `${BASE}/blog/${article.slug}`,
    organizer: { '@type': 'Organization', name: 'Ilé Ẹwà', url: BASE },
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
  };

  if (article.start_date) schema.startDate = article.start_date;
  if (article.end_date)   schema.endDate   = article.end_date;

  // Offre tarifaire
  schema.offers = {
    '@type': 'Offer',
    url: `${BASE}/blog/${article.slug}`,
    priceCurrency: 'XOF',
    price: isFree ? '0' : String(price || '0'),
    availability: 'https://schema.org/InStock',
  };
  if (isFree) schema.offers.name = 'Entrée libre';

  return schema;
}

/** Profil membre (Person) */
export function schemaPerson({ profile }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.display_name,
    image: profile.avatar_url || undefined,
    url: `${BASE}/membres/${profile.slug}`,
    description: profile.bio_html
      ? profile.bio_html.replace(/<[^>]*>/g, '').slice(0, 200)
      : undefined,
    address: profile.city
      ? { '@type': 'PostalAddress', addressLocality: profile.city }
      : undefined,
    memberOf: { '@type': 'Organization', name: 'Ilé Ẹwà', url: BASE },
  };
}

/** Fil d'Ariane (BreadcrumbList) */
export function schemaBreadcrumb(items) {
  // items = [{ name, url }]
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${BASE}${item.url}`,
    })),
  };
}

/** FAQ (utile pour les pages Présentation) */
export function schemaFAQ(questions) {
  // questions = [{ question, answer }]
  if (!questions?.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: { '@type': 'Answer', text: q.answer },
    })),
  };
}
