import Hero from '../components/Hero'
import StatsCounter from '../components/StatsCounter'
import HowItWorks from '../components/HowItWorks'
import GetStarted from '../components/GetStarted'
import TechPlusDietitian from '../components/TechPlusDietitian'
import DietitianShowcase from '../components/DietitianShowcase'
import FindDietitian from '../components/FindDietitian'
import ConsultJourney from '../components/ConsultJourney'
import PlansFor from '../components/PlansFor'
import SamplePlan from '../components/SamplePlan'
import Pricing from '../components/Pricing'
import WhyChoose from '../components/WhyChoose'
import HomeFAQ from '../components/HomeFAQ'
import TransformationGallery from '../components/TransformationGallery'
import Testimonials from '../components/Testimonials'
import MediaPress from '../components/MediaPress'
import TeamSection from '../components/TeamSection'
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
      author: { '@type': 'Person', name: 'Tanshik' },
      reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
      reviewBody: 'Thanks to Meri Diet\'s personalized nutrition plan, I gained 8 kg in 3 months of muscle and improved my fitness results.',
    },
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Siddhesh' },
      reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
      reviewBody: 'Meri Diet helped me lose 7kg in 3 months without feeling restricted or hungry all the time.',
    },
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Gourav' },
      reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
      reviewBody: 'I lost 40kg in 3 months with Meri Diet without giving up the foods I love. The plan was simple & easy to follow.',
    },
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Anmol' },
      reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
      reviewBody: 'Meri Diet helped me understand what to eat to support my workouts. With a personalized plan, I lost 5kg in 3 months.',
    },
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Neeraj' },
      reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
      reviewBody: 'Meri Diet helped me gain 11kg in 5 months in a healthy & sustainable way. The personalized plan was easy to follow & delivered great results.',
    },
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Priya' },
      reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
      reviewBody: 'Meri Diet helped me gain 5kg in 2 months. The plan felt practical and sustainable. Highly recommended.',
    },
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Shubham' },
      reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
      reviewBody: 'Thanks to Meri Diet, I maintained 63kg and developed healthier habits. I would recommend it to all fitness enthusiasts.',
    },
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Yash' },
      reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
      reviewBody: 'I gained 20 kg in 6-7 months with Meri Diet\'s personalized nutrition plan. The approach was sustainable, practical, and helped me achieve my goals.',
    },
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Nikhil' },
      reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
      reviewBody: 'I successfully lost 5 kg in just 2 months while preserving lean muscle mass. Meri Diet\'s nutrition plan perfectly supported my fat-loss journey.',
    },
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Charanjeet Kaur' },
      reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
      reviewBody: 'I lost 6 kgs in 2 months, thanks to MeriDiet. MeriDiet gave me a personalized meal plan that fit my lifestyle instead of forcing me to change everything.',
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
    <HowItWorks onOpenForm={onOpenForm} />
    <GetStarted onOpenForm={onOpenForm} />
    <TechPlusDietitian />
    <DietitianShowcase />
    <FindDietitian />
    <ConsultJourney />
    <PlansFor />
    <SamplePlan onOpenForm={onOpenForm} />
    <Pricing onOpenForm={onOpenForm} />
    <WhyChoose onOpenForm={onOpenForm} />
    <HomeFAQ />
    <TransformationGallery />
    <Testimonials />
    <MediaPress />
    <TeamSection />
    <CTA onOpenForm={onOpenForm} />
  </main>
)

export default HomePage
