import { Helmet } from 'react-helmet-async'

const SITE_URL  = 'https://meridiet.com'
const SITE_NAME = 'MeriDiet'
// Replace /og-cover.png with a dedicated 1200×630 image when ready
const DEFAULT_IMAGE = `${SITE_URL}/banner-slide-2.png`
const DEFAULT_IMAGE_ALT = 'MeriDiet – Personalized Indian Diet Plans & Online Dietitian Consultations'

interface SEOProps {
  title: string
  description: string
  canonical?: string
  ogImage?: string
  ogImageAlt?: string
  ogType?: 'website' | 'article'
  jsonLd?: object | object[]
  noIndex?: boolean
}

export default function SEO({
  title,
  description,
  canonical,
  ogImage = DEFAULT_IMAGE,
  ogImageAlt = DEFAULT_IMAGE_ALT,
  ogType = 'website',
  jsonLd,
  noIndex = false,
}: SEOProps) {
  const fullTitle    = `${title} | ${SITE_NAME}`
  const canonicalUrl = canonical ? `${SITE_URL}${canonical}` : undefined
  const schemas      = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : []

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      <meta name="author" content={SITE_NAME} />
      {canonicalUrl && <link rel="canonical"                href={canonicalUrl} />}
      {canonicalUrl && <link rel="alternate" hrefLang="en-IN" href={canonicalUrl} />}
      {canonicalUrl && <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:site_name"    content={SITE_NAME} />
      <meta property="og:type"         content={ogType} />
      <meta property="og:title"        content={fullTitle} />
      <meta property="og:description"  content={description} />
      <meta property="og:image"        content={ogImage} />
      <meta property="og:image:alt"    content={ogImageAlt} />
      <meta property="og:locale"       content="en_IN" />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

      {/* Twitter Card */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:site"        content="@Meridietoffical" />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image"       content={ogImage} />
      <meta name="twitter:image:alt"   content={ogImageAlt} />

      {/* JSON-LD Structured Data */}
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  )
}
