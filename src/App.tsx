import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import PlansFor from './components/PlansFor'
import SamplePlan from './components/SamplePlan'
import WhyChoose from './components/WhyChoose'
import Testimonials from './components/Testimonials'
import CTA from './components/CTA'
import Footer from './components/Footer'
import DietForm from './components/DietForm'
import Pricing from './components/Pricing'
import AboutUs from './components/AboutUs'
import FAQ from './components/FAQ'

function App() {
  const [showForm, setShowForm] = useState(() => window.location.hash === '#form')

  const openForm = () => {
    setShowForm(true)
    history.pushState(null, '', '#form')
  }

  const closeForm = () => {
    setShowForm(false)
    history.pushState(null, '', window.location.pathname)
  }

  useEffect(() => {
    const onPop = () => setShowForm(window.location.hash === '#form')
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  return (
    <>
      <Navbar onOpenForm={openForm} formMode={showForm} />
      <div className="navbar-push" />
      <main>
        <Hero onOpenForm={openForm} />
        <HowItWorks />
        <PlansFor />
        <SamplePlan />
        <Pricing />
        <WhyChoose />
        <Testimonials />
        <AboutUs />
        <FAQ />
        <CTA onOpenForm={openForm} />
      </main>
      <Footer />
      {showForm && <DietForm onClose={closeForm} />}
    </>
  )
}

export default App
