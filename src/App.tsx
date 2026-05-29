import { lazy, Suspense } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'

const HomePage      = lazy(() => import('./pages/HomePage'))
const AboutUs       = lazy(() => import('./components/AboutUs'))
const FAQ           = lazy(() => import('./components/FAQ'))
const DietForm      = lazy(() => import('./components/DietForm'))
const UserProfile   = lazy(() => import('./components/UserProfile'))
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'))
const TermsConditions = lazy(() => import('./components/TermsConditions'))
const RefundPolicy  = lazy(() => import('./components/RefundPolicy'))
const ContactUs     = lazy(() => import('./components/ContactUs'))

function PageLoader() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="page-loader-spinner" />
    </div>
  )
}

function FormPage() {
  const navigate = useNavigate()
  return <DietForm onClose={() => navigate('/')} />
}

function App() {
  const navigate = useNavigate()
  const openForm = () => navigate('/form')

  return (
    <>
      <ScrollToTop />
      <Navbar onOpenForm={openForm} />
      <div className="navbar-push" />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/"                  element={<HomePage onOpenForm={openForm} />} />
          <Route path="/about"             element={<main><AboutUs /></main>} />
          <Route path="/faq"               element={<main><FAQ /></main>} />
          <Route path="/profile"           element={<UserProfile />} />
          <Route path="/form"              element={<FormPage />} />
          <Route path="/privacy-policy"    element={<main><PrivacyPolicy /></main>} />
          <Route path="/terms-conditions"  element={<main><TermsConditions /></main>} />
          <Route path="/refund-policy"     element={<main><RefundPolicy /></main>} />
          <Route path="/contact"           element={<main><ContactUs /></main>} />
        </Routes>
      </Suspense>
      <Footer />
    </>
  )
}

export default App
