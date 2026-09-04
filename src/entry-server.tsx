/**
 * Server-side rendering entry point.
 * Used only during `vite build --ssr` and the subsequent prerender script.
 *
 * Rules:
 *  - Static imports only (no React.lazy — renderToString can't resolve suspense).
 *  - No GoogleOAuthProvider (not needed for SSR; may access window at init).
 *  - Only public, SEO-relevant routes are rendered; dashboard routes stay CSR.
 *  - All browser-API calls in this codebase live inside useEffect → safe in SSR.
 */

import { renderToString } from 'react-dom/server'
import { StaticRouter, Routes, Route } from 'react-router'
import { HelmetProvider } from 'react-helmet-async'

// Layouts
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'

// Public pages — static imports so renderToString gets real markup
import HomePage from './pages/HomePage'
import AboutUs from './components/AboutUs'
import FAQ from './components/FAQ'
import ContactUs from './components/ContactUs'
import PrivacyPolicy from './components/PrivacyPolicy'
import TermsConditions from './components/TermsConditions'
import RefundPolicy from './components/RefundPolicy'
import Blog from './pages/Blog'
import Calculators from './pages/Calculators'
import ForDietitians from './pages/ForDietitians'
import WomenEmpowerment from './pages/WomenEmpowerment'
import NutritionistCourse from './pages/NutritionistCourse'
import Career from './pages/Career'
import ConsultDietitian from './pages/ConsultDietitian'
import BlogList from './pages/BlogList'
import BlogPost from './pages/BlogPost'
import ConditionPage from './pages/ConditionPage'
import SponsorCohort from './pages/SponsorCohort'
import NotFoundPage from './pages/NotFoundPage'

// Contexts that are SSR-safe (no window/document at init)
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { VideoCallProvider } from './context/VideoCallContext'

// Routes that hide the public Navbar/Footer (mirrors App.tsx logic)
const NO_LAYOUT_PREFIXES = [
  '/diet-plan',
  '/reset-password',
  '/for-dietitians/basic-info',
  '/for-dietitians/qualification',
  '/for-dietitians/document-upload',
  '/dietitian/verification-submitted',
]

function showLayout(url: string) {
  return !NO_LAYOUT_PREFIXES.some(p => url === p || url.startsWith(p + '/'))
}

/**
 * Minimal server-only app — mirrors the public subset of App.tsx routes
 * but without React.lazy, GoogleOAuthProvider, or dashboard routes.
 */
function ServerApp({ url }: { url: string }) {
  const withLayout = showLayout(url)
  // no-op: navigation events don't fire during renderToString
  const noop = () => {}

  return (
    <>
      <ScrollToTop />
      {withLayout && <Navbar onOpenForm={noop} />}
      {withLayout && <div className="navbar-push" />}
      <Routes>
        <Route path="/"                  element={<HomePage onOpenForm={noop} />} />
        <Route path="/about"             element={<main><AboutUs /></main>} />
        <Route path="/faq"               element={<main><FAQ /></main>} />
        <Route path="/contact"           element={<main><ContactUs /></main>} />
        <Route path="/privacy-policy"    element={<main><PrivacyPolicy /></main>} />
        <Route path="/terms-conditions"  element={<main><TermsConditions /></main>} />
        <Route path="/refund-policy"     element={<main><RefundPolicy /></main>} />
        <Route path="/press"             element={<Blog />} />
        <Route path="/calculators"       element={<Calculators />} />
        <Route path="/for-dietitians"    element={<ForDietitians />} />
        <Route path="/women-empowerment" element={<WomenEmpowerment />} />
        <Route path="/nutritionist-course" element={<NutritionistCourse />} />
        <Route path="/careers"           element={<Career />} />
        <Route path="/consult-dietitian" element={<ConsultDietitian />} />
        <Route path="/blog"              element={<BlogList />} />
        <Route path="/blog/:slug"        element={<BlogPost />} />
        <Route path="/weight-loss"       element={<ConditionPage slug="weight-loss" />} />
        <Route path="/pcos"              element={<ConditionPage slug="pcos" />} />
        <Route path="/diabetes"          element={<ConditionPage slug="diabetes" />} />
        <Route path="/thyroid"           element={<ConditionPage slug="thyroid" />} />
        <Route path="/sponsor-cohort"    element={<SponsorCohort />} />
        {/* /404 renders the not-found page; prerender writes it to dist/404.html */}
        <Route path="/404"               element={<NotFoundPage />} />
        {/* Unrecognised routes: render nothing — prerender script skips these */}
        <Route path="*" element={<></>} />
      </Routes>
      {withLayout && <Footer />}
    </>
  )
}

export interface RenderResult {
  appHtml: string
  helmetContext: Record<string, unknown>
}

export function render(url: string): RenderResult {
  const helmetContext: Record<string, unknown> = {}

  const appHtml = renderToString(
    <HelmetProvider context={helmetContext}>
      <StaticRouter location={url}>
        <VideoCallProvider>
          <AuthProvider>
            <ToastProvider>
              <ServerApp url={url} />
            </ToastProvider>
          </AuthProvider>
        </VideoCallProvider>
      </StaticRouter>
    </HelmetProvider>
  )

  return { appHtml, helmetContext }
}
