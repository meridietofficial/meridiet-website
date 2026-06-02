import { lazy, Suspense } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
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
const ContactUs       = lazy(() => import('./components/ContactUs'))
const ForDietitians     = lazy(() => import('./pages/ForDietitians'))
const JoinDietitian     = lazy(() => import('./pages/JoinDietitian'))
const ConsultDietitian    = lazy(() => import('./pages/ConsultDietitian'))
const DietitianProfile    = lazy(() => import('./pages/DietitianProfile'))
const DietitianDashboard  = lazy(() => import('./pages/DietitianDashboard'))
const DietitianMyProfile  = lazy(() => import('./pages/DietitianMyProfile'))

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

const NO_NAVBAR_ROUTES = ['/dietitian-dashboard', '/dietitian-profile']
const NO_FOOTER_ROUTES = ['/form', '/join-as-dietitian', '/dietitian-dashboard', '/dietitian-profile']

function App() {
  const navigate  = useNavigate()
  const { pathname } = useLocation()
  const openForm  = () => navigate('/form')
  const showNavbar = !NO_NAVBAR_ROUTES.includes(pathname)
  const showFooter = !NO_FOOTER_ROUTES.includes(pathname)

  return (
    <>
      <ScrollToTop />
      {showNavbar && <Navbar onOpenForm={openForm} />}
      {showNavbar && <div className="navbar-push" />}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/"                     element={<HomePage onOpenForm={openForm} />} />
          <Route path="/about"                element={<main><AboutUs /></main>} />
          <Route path="/faq"                  element={<main><FAQ /></main>} />
          <Route path="/profile"              element={<UserProfile />} />
          <Route path="/form"                 element={<FormPage />} />
          <Route path="/privacy-policy"       element={<main><PrivacyPolicy /></main>} />
          <Route path="/terms-conditions"     element={<main><TermsConditions /></main>} />
          <Route path="/refund-policy"        element={<main><RefundPolicy /></main>} />
          <Route path="/contact"              element={<main><ContactUs /></main>} />
          <Route path="/consult-dietitian"    element={<ConsultDietitian />} />
          <Route path="/dietitian/:id"        element={<DietitianProfile />} />
          <Route path="/for-dietitians"       element={<ForDietitians />} />
          <Route path="/join-as-dietitian"    element={<JoinDietitian />} />
          <Route path="/dietitian-dashboard"  element={<DietitianDashboard />} />
          <Route path="/dietitian-profile"   element={<DietitianMyProfile />} />
        </Routes>
      </Suspense>
      {showFooter && <Footer />}
    </>
  )
}

export default App
