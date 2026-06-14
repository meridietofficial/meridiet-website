import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import DietitianLayout from './components/DietitianLayout'
import { VideoCallProvider, useVideoCall } from './context/VideoCallContext'
import { trackPageView } from './utils/analytics'
const VideoCallModal = lazy(() => import('./components/VideoCallModal'))

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
const DietitianOnboarding = lazy(() => import('./pages/DietitianOnboarding'))
const DietitianVerificationSubmitted = lazy(() => import('./pages/DietitianVerificationSubmitted'))
const ConsultDietitian    = lazy(() => import('./pages/ConsultDietitian'))
const DietitianProfile    = lazy(() => import('./pages/DietitianProfile'))
const DietitianDashboard  = lazy(() => import('./pages/DietitianDashboard'))
const DietitianMyProfile  = lazy(() => import('./pages/DietitianMyProfile'))
const DietitianConsultationRequests = lazy(() => import('./pages/DietitianConsultationRequests'))
const DietitianMyClients      = lazy(() => import('./pages/DietitianMyClients'))
const DietitianAppointments   = lazy(() => import('./pages/DietitianAppointments'))
const DietitianDietPlans      = lazy(() => import('./pages/DietitianDietPlans'))
const DietitianCreateDietPlan = lazy(() => import('./pages/DietitianCreateDietPlan'))
const DietitianDraftDietPlan  = lazy(() => import('./pages/DietitianDraftDietPlan'))
const DietitianChat           = lazy(() => import('./pages/DietitianChat'))
const DietitianFollowUps      = lazy(() => import('./pages/DietitianFollowUps'))
const DietitianReports        = lazy(() => import('./pages/DietitianReports'))
const DietitianEarnings       = lazy(() => import('./pages/DietitianEarnings'))
const DietitianWallet         = lazy(() => import('./pages/DietitianWallet'))
const DietitianReviews        = lazy(() => import('./pages/DietitianReviews'))
const DietitianSettings       = lazy(() => import('./pages/DietitianSettings'))
const ResetPassword           = lazy(() => import('./pages/ResetPassword'))

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

const NO_NAVBAR_PREFIXES = ['/dietitian-dashboard', '/dietitian-profile', '/dietitian-consultation-requests', '/dietitian-my-clients', '/dietitian-appointments', '/dietitian-diet-plans', '/dietitian-chat', '/dietitian-follow-ups', '/dietitian-reports', '/dietitian-earnings', '/dietitian-wallet', '/dietitian-reviews', '/dietitian-settings', '/reset-password']
const NO_FOOTER_PREFIXES = ['/form', '/join-as-dietitian', '/for-dietitians/basic-info', '/for-dietitians/qualification', '/for-dietitians/document-upload', '/dietitian/verification-submitted', '/dietitian-dashboard', '/dietitian-profile', '/dietitian-consultation-requests', '/dietitian-my-clients', '/dietitian-appointments', '/dietitian-diet-plans', '/dietitian-chat', '/dietitian-follow-ups', '/dietitian-reports', '/dietitian-earnings', '/dietitian-wallet', '/dietitian-reviews', '/dietitian-settings', '/reset-password']

function ActiveVideoCall() {
  const { activeCall, clearCall } = useVideoCall()
  if (!activeCall) return null
  return <VideoCallModal appointmentId={activeCall.id} clientName={activeCall.clientName} onClose={clearCall} />
}

function AppInner() {
  const navigate  = useNavigate()
  const { pathname } = useLocation()
  const openForm  = () => navigate('/form')
  const showNavbar = !NO_NAVBAR_PREFIXES.some(p => pathname === p || pathname.startsWith(p + '/'))
  const showFooter = !NO_FOOTER_PREFIXES.some(p => pathname === p || pathname.startsWith(p + '/'))

  // Fire GA4 + Meta Pixel on every route change (SPA navigation fix)
  useEffect(() => {
    trackPageView(pathname)
  }, [pathname])

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
          <Route path="/for-dietitians"                    element={<ForDietitians />} />
          <Route path="/for-dietitians/basic-info"         element={<DietitianOnboarding />} />
          <Route path="/for-dietitians/qualification"      element={<DietitianOnboarding />} />
          <Route path="/for-dietitians/document-upload"    element={<DietitianOnboarding />} />
          <Route path="/dietitian/verification-submitted"  element={<DietitianVerificationSubmitted />} />
          <Route path="/join-as-dietitian"                 element={<JoinDietitian />} />
          <Route path="/reset-password"                    element={<ResetPassword />} />
          <Route element={<DietitianLayout />}>
            <Route path="/dietitian-dashboard"               element={<DietitianDashboard />} />
            <Route path="/dietitian-profile"                 element={<DietitianMyProfile />} />
            <Route path="/dietitian-consultation-requests"   element={<DietitianConsultationRequests />} />
            <Route path="/dietitian-my-clients"              element={<DietitianMyClients />} />
            <Route path="/dietitian-appointments"            element={<DietitianAppointments />} />
            <Route path="/dietitian-diet-plans"              element={<DietitianDietPlans />} />
            <Route path="/dietitian-diet-plans/new"         element={<DietitianCreateDietPlan />} />
            <Route path="/dietitian-diet-plans/:planId"     element={<DietitianDraftDietPlan />} />
            <Route path="/dietitian-chat"                   element={<DietitianChat />} />
            <Route path="/dietitian-follow-ups"             element={<DietitianFollowUps />} />
            <Route path="/dietitian-reports"               element={<DietitianReports />} />
            <Route path="/dietitian-earnings"              element={<DietitianEarnings />} />
            <Route path="/dietitian-wallet"               element={<DietitianWallet />} />
            <Route path="/dietitian-reviews"              element={<DietitianReviews />} />
            <Route path="/dietitian-settings"             element={<DietitianSettings />} />
          </Route>
        </Routes>
      </Suspense>
      {showFooter && <Footer />}
      <Suspense fallback={null}>
        <ActiveVideoCall />
      </Suspense>
    </>
  )
}

function App() {
  return (
    <VideoCallProvider>
      <AppInner />
    </VideoCallProvider>
  )
}

export default App
