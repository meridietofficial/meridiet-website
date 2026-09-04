import Hero from '../components/Hero'
import StatsCounter from '../components/StatsCounter'
import DietitianShowcase from '../components/DietitianShowcase'
import HowItWorks from '../components/HowItWorks'
import PlansFor from '../components/PlansFor'
import SamplePlan from '../components/SamplePlan'
import Pricing from '../components/Pricing'
import WhyChoose from '../components/WhyChoose'
import Testimonials from '../components/Testimonials'
import MediaPress from '../components/MediaPress'
import CTA from '../components/CTA'
import SEO from '../components/SEO'

const ORG_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'MeriDiet',
  url: 'https://meridiet.com',
  logo: 'https://meridiet.com/logo.png',
  description: 'India\'s AI-powered personalized diet plan and online dietitian consultation platform.',
  sameAs: [
    'https://www.instagram.com/meridietofficial/',
    'https://www.facebook.com/people/MeriDiet/61564942492475/',
    'https://x.com/Meridietoffical',
    'https://www.youtube.com/@MeriDiet',
    'https://www.linkedin.com/company/meridiet/',
  ],
}

const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'MeriDiet',
  url: 'https://meridiet.com',
  description: 'India\'s AI-powered personalized diet plan and online dietitian consultation platform.',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://meridiet.com/consult-dietitian?search={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
}

const SERVICE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'AI Personalized Diet Plan',
  provider: { '@type': 'Organization', name: 'MeriDiet' },
  areaServed: 'IN',
  description: 'Get a personalized AI-generated Indian diet plan tailored to your body, goals, and lifestyle.',
  offers: {
    '@type': 'Offer',
    priceCurrency: 'INR',
    price: '199',
    availability: 'https://schema.org/InStock',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '2847',
    bestRating: '5',
    worstRating: '1',
  },
  review: [
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Priya Sharma' },
      reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
      reviewBody: 'I lost 8 kg in 2 months following my MeriDiet plan! The meals are delicious and so easy to prepare. Best part — everything is Indian food I already love.',
    },
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Ananya Singh' },
      reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
      reviewBody: 'Dealing with PCOS for years, and finally found something that works! The plan is so detailed, with breakfast to dinner covered. Highly recommend to all women with PCOS.',
    },
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Rajesh Kumar' },
      reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
      reviewBody: 'As a diabetic, finding the right diet was always a challenge. MeriDiet gave me a proper plan that my doctor also approved. My sugar levels are much more stable now.',
    },
  ],
}

const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://meridiet.com/' },
  ],
}

const HomePage = ({ onOpenForm }: { onOpenForm: () => void }) => (
  <main>
    <SEO
      title="Personalized Indian Diet Plan in 24 Hours"
      description="Get a personalized AI diet plan made for Indians. Consult verified dietitians online for weight loss, PCOS, diabetes & muscle gain. Plans starting ₹199."
      canonical="/"
      jsonLd={[ORG_SCHEMA, WEBSITE_SCHEMA, SERVICE_SCHEMA, BREADCRUMB_SCHEMA]}
    />
    <Hero onOpenForm={onOpenForm} />
    <StatsCounter />
    <DietitianShowcase />
    <HowItWorks />
    <PlansFor />
    <SamplePlan onOpenForm={onOpenForm} />
    <Pricing onOpenForm={onOpenForm} />
    <WhyChoose onOpenForm={onOpenForm} />
    <Testimonials />
    <MediaPress />
    <CTA onOpenForm={onOpenForm} />
  </main>
)

export default HomePage
