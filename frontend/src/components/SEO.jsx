import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Ilé Ẹwà';
const BASE_URL  = 'https://portail-ileewa.com';
const DEFAULT_DESC = 'Ilé Ẹwà est un espace communautaire pour se former, se rencontrer et grandir ensemble.';
const DEFAULT_IMG  = `${BASE_URL}/og-image.jpg`; // à placer dans public/

/**
 * Composant SEO — à placer en haut de chaque page.
 *
 * Props :
 *   title       string  — titre de la page (sans le nom du site)
 *   description string  — méta description (155 chars max)
 *   image       string  — URL absolue d'une image OG
 *   url         string  — URL canonique de la page
 *   type        string  — 'website' | 'article'
 *   article     object  — { publishedTime, modifiedTime, author, tags[] }
 *   noIndex     bool    — true pour les pages privées (espace membre, admin…)
 */
export default function SEO({
  title,
  description = DEFAULT_DESC,
  image = DEFAULT_IMG,
  url,
  type = 'website',
  article,
  noIndex = false,
}) {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — Cercle communautaire`;
  const canonical = url ? `${BASE_URL}${url}` : undefined;
  const imgAbs    = image?.startsWith('http') ? image : image ? `${BASE_URL}${image}` : DEFAULT_IMG;

  return (
    <Helmet>
      {/* Titre */}
      <title>{fullTitle}</title>

      {/* Meta de base */}
      <meta name="description" content={description.slice(0, 160)} />
      {noIndex
        ? <meta name="robots" content="noindex, nofollow" />
        : <meta name="robots" content="index, follow" />
      }
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph */}
      <meta property="og:title"       content={fullTitle} />
      <meta property="og:description" content={description.slice(0, 160)} />
      <meta property="og:image"       content={imgAbs} />
      <meta property="og:type"        content={type} />
      {canonical && <meta property="og:url" content={canonical} />}
      <meta property="og:site_name"   content={SITE_NAME} />
      <meta property="og:locale"      content="fr_FR" />

      {/* Twitter Card */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={description.slice(0, 160)} />
      <meta name="twitter:image"       content={imgAbs} />

      {/* Article structuré (si type === 'article') */}
      {type === 'article' && article?.publishedTime && (
        <meta property="article:published_time" content={article.publishedTime} />
      )}
      {type === 'article' && article?.modifiedTime && (
        <meta property="article:modified_time" content={article.modifiedTime} />
      )}
      {type === 'article' && article?.author && (
        <meta property="article:author" content={article.author} />
      )}
      {type === 'article' && article?.tags?.map((tag) => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}
    </Helmet>
  );
}
