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
  '/for-dietitians':                      'For Dietitians | MeriDiet',
  '/for-dietitians/basic-info':           'Join as Dietitian – Basic Info | MeriDiet',
  '/for-dietitians/qualification':        'Join as Dietitian – Qualifications | MeriDiet',
  '/for-dietitians/document-upload':      'Join as Dietitian – Documents | MeriDiet',
  '/dietitian/verification-submitted':    'Application Submitted | MeriDiet',
  '/join-as-dietitian':                   'Join as Dietitian | MeriDiet',
  '/privacy-policy':                      'Privacy Policy | MeriDiet',
  '/terms-conditions':                    'Terms & Conditions | MeriDiet',
  '/refund-policy':                       'Refund Policy | MeriDiet',
  '/profile':                             'My Profile | MeriDiet',
  '/form':                                'Diet Plan Form | MeriDiet',
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

export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof gtag !== 'undefined') {
    gtag('event', eventName, params ?? {})
  }
  if (window.fbq) {
    window.fbq('trackCustom', eventName, params ?? {})
  }
}

export function trackPageView(path: string) {
  const title = resolveTitle(path)

  // Update browser tab title on every navigation
  document.title = title

  // GA4 — fire a page_view event so every route change is counted
  if (typeof gtag !== 'undefined') {
    gtag('event', 'page_view', {
      page_path:  path,
      page_title: title,
      page_location: window.location.href,
    })
  }

  // Meta Pixel — fire PageView on every route change
  if (window.fbq) {
    window.fbq('track', 'PageView')
  }
}
