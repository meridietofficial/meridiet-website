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
    price: '499',
    availability: 'https://schema.org/InStock',
  },
}

const HomePage = ({ onOpenForm }: { onOpenForm: () => void }) => (
  <main>
    <SEO
      title="AI Diet Plans & Online Dietitian Consultation India"
      description="Get a personalized AI diet plan made for Indians. Consult verified dietitians online for weight loss, PCOS, diabetes & muscle gain. Plans starting ₹499."
      keywords="AI diet plan India, personalized diet plan, online dietitian India, diet chart, Indian diet plan, weight loss diet plan, diet consultation online, AI nutrition plan, custom diet plan"
      canonical="/"
      jsonLd={[ORG_SCHEMA, WEBSITE_SCHEMA, SERVICE_SCHEMA]}
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
