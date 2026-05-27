import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import ScrollToTop from './components/ScrollToTop'
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

function HomePage({ onOpenForm }: { onOpenForm: () => void }) {
  return (
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
}

function AboutPage() {
  return (
    <main>
      <AboutUs />
    </main>
  )
}

function FAQPage() {
  return (
    <main>
      <FAQ />
    </main>
  )
}

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
      <ScrollToTop />
      <Navbar onOpenForm={openForm} formMode={showForm} />
      <div className="navbar-push" />
      <Routes>
        <Route path="/" element={<HomePage onOpenForm={openForm} />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/faq" element={<FAQPage />} />
      </Routes>
      <Footer />
      {showForm && <DietForm onClose={closeForm} />}
    </>
  )
}

export default App
