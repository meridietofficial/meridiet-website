import Hero from '../components/Hero'
import HowItWorks from '../components/HowItWorks'
import PlansFor from '../components/PlansFor'
import SamplePlan from '../components/SamplePlan'
import Pricing from '../components/Pricing'
import WhyChoose from '../components/WhyChoose'
import Testimonials from '../components/Testimonials'
import CTA from '../components/CTA'

const HomePage = ({ onOpenForm }: { onOpenForm: () => void }) => (
  <main>
    <Hero onOpenForm={onOpenForm} />
    <HowItWorks />
    <PlansFor />
    <SamplePlan />
    <Pricing />
    <WhyChoose />
    <Testimonials />
    <CTA onOpenForm={onOpenForm} />
  </main>
)

export default HomePage
