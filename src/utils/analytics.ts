/* eslint-disable @typescript-eslint/no-explicit-any */

declare global {
  function gtag(...args: any[]): void
  interface Window { fbq?: (...args: any[]) => void }
}

const PAGE_TITLES: Record<string, string> = {
  '/':                                    'Home | MeriDiet',
  '/about':                               'About Us | MeriDiet',
  '/faq':                                 'FAQ | MeriDiet',
  '/contact':                             'Contact Us | MeriDiet',
  '/consult-dietitian':                   'Consult a Dietitian Online | MeriDiet',
  '/consult-dietitian/success':           'Consultation Booked – Thank You | MeriDiet',
  '/for-dietitians':                      'For Dietitians | MeriDiet',
  '/for-dietitians/basic-info':           'Join as Dietitian – Basic Info | MeriDiet',
  '/for-dietitians/qualification':        'Join as Dietitian – Qualifications | MeriDiet',
  '/for-dietitians/document-upload':      'Join as Dietitian – Documents | MeriDiet',
  '/for-dietitians/payment':             'Join as Dietitian – Payment | MeriDiet',
  '/dietitian/verification-submitted':    'Application Submitted | MeriDiet',
  '/privacy-policy':                      'Privacy Policy | MeriDiet',
  '/terms-conditions':                    'Terms & Conditions | MeriDiet',
  '/refund-policy':                       'Refund Policy | MeriDiet',
  '/profile':                             'My Profile | MeriDiet',
  '/diet-plan':                           'Get Your AI Diet Plan | MeriDiet',
  '/diet-plan/step-1':                    'Diet Plan – Basic Details | MeriDiet',
  '/diet-plan/step-2':                    'Diet Plan – Lifestyle | MeriDiet',
  '/diet-plan/step-3':                    'Diet Plan – Food Preferences | MeriDiet',
  '/diet-plan/step-4':                    'Diet Plan – Health & Medical | MeriDiet',
  '/diet-plan/step-5':                    'Diet Plan – Contact Details | MeriDiet',
  '/diet-plan/checkout':                  'Diet Plan – Checkout | MeriDiet',
  '/diet-plan/success':                   'Diet Plan – Order Confirmed | MeriDiet',
  '/form':                                'Get Your AI Diet Plan | MeriDiet',
  '/reset-password':                      'Reset Password | MeriDiet',
}

function resolveTitle(path: string): string {
  if (PAGE_TITLES[path]) return PAGE_TITLES[path]
  if (path.startsWith('/dietitian/')) return 'Dietitian Profile | MeriDiet'
  if (path.startsWith('/dietitian-dashboard'))              return 'Dashboard | MeriDiet'
  if (path.startsWith('/dietitian-profile'))                return 'My Profile | MeriDiet'
  if (path.startsWith('/dietitian-consultation-requests'))  return 'Consultation Requests | MeriDiet'
  if (path.startsWith('/dietitian-my-clients'))             return 'My Clients | MeriDiet'
  if (path.startsWith('/dietitian-appointments'))           return 'Appointments | MeriDiet'
  if (path.startsWith('/dietitian-diet-plans'))             return 'Diet Plans | MeriDiet'
  if (path.startsWith('/dietitian-chat'))                   return 'Chat | MeriDiet'
  if (path.startsWith('/dietitian-follow-ups'))             return 'Follow-Ups | MeriDiet'
  if (path.startsWith('/dietitian-reports'))                return 'Reports | MeriDiet'
  if (path.startsWith('/dietitian-earnings'))               return 'Earnings | MeriDiet'
  if (path.startsWith('/dietitian-wallet'))                 return 'Wallet | MeriDiet'
  if (path.startsWith('/dietitian-reviews'))                return 'Reviews | MeriDiet'
  if (path.startsWith('/dietitian-settings'))               return 'Settings | MeriDiet'
  return 'MeriDiet'
}

// index.html fires fbq('track', 'PageView') on initial load.
// We skip the first Meta PageView call here to avoid a duplicate on app mount.
let _initialMetaPageViewFired = false

export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof gtag !== 'undefined') {
    gtag('event', eventName, params ?? {})
  }
  if (window.fbq) {
    window.fbq('trackCustom', eventName, params ?? {})
  }
}

export function trackInitiateCheckout(value: number, currency: string) {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'begin_checkout', { value, currency })
  }
  if (window.fbq) {
    window.fbq('track', 'InitiateCheckout', { value, currency })
  }
}

export function trackConsultationBooked(value: number, dietitian_name: string) {
  if (window.fbq) {
    window.fbq('trackCustom', 'ConsultationBooked', { value, currency: 'INR', dietitian_name })
  }
}

export function trackPurchase(value: number, currency: string, plan_name?: string) {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'purchase', { value, currency })
  }
  if (window.fbq) {
    window.fbq('track', 'Purchase', { value, currency, ...(plan_name ? { plan_name } : {}) })
  }
}

export function trackPageView(path: string) {
  const title = resolveTitle(path)

  // Update browser tab title on every navigation
  document.title = title

  // GA4 — fire a page_view event so every route change is counted
  // (gtag auto page_view is disabled via send_page_view: false in index.html)
  if (typeof gtag !== 'undefined') {
    gtag('event', 'page_view', {
      page_path:  path,
      page_title: title,
      page_location: window.location.href,
    })
  }

  // Meta Pixel — skip the first call because index.html already fired PageView on load.
  // Fire normally for all subsequent SPA navigations.
  if (window.fbq) {
    if (_initialMetaPageViewFired) {
      window.fbq('track', 'PageView')
    } else {
      _initialMetaPageViewFired = true
    }
  }
}

// ── Funnel-specific events ───────────────────────────────────

/** Fires when the diet form overlay opens (user begins the funnel). */
export function trackFormOpened() {
  trackEvent('form_opened')
}

/**
 * Fires when a user passes validation and advances to the next step.
 * Step 1 also fires Meta's standard Lead event (contact info captured).
 */
export function trackStepComplete(step: number, params?: Record<string, unknown>) {
  trackEvent(`step_${step}_complete`, params)
  if (step === 1 && window.fbq) {
    window.fbq('track', 'Lead')
  }
}

/** Fires when the Razorpay modal is dismissed without payment. */
export function trackPaymentDismissed(plan_name: string, amount: number) {
  trackEvent('payment_dismissed', { plan_name, amount })
}

/** Fires when the user explicitly selects a plan (sidebar or Step 5 cards). */
export function trackPlanSelected(plan_name: string) {
  trackEvent('plan_selected', { plan_name })
}

/** Fires when a step's validation fails, listing which fields failed. */
export function trackValidationError(step: number, fields: string[]) {
  trackEvent('validation_error', { step, failed_fields: fields })
}

/** Fires when the auth/login modal appears at the Step 5 payment gate. */
export function trackAuthGateShown() {
  trackEvent('auth_gate_shown')
}

/** Fires after the user successfully logs in at the payment gate. */
export function trackAuthGateComplete() {
  trackEvent('auth_gate_complete')
}
