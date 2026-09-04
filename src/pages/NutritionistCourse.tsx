import { useState } from 'react'
import SEO from '../components/SEO'
import courseApi from '../api/course'

const COURSE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: 'MeriDiet Certified Nutritionist Course',
  description: 'Become a certified nutritionist in 3 months. Online live + recorded classes in English, open to 12th pass candidates. Earn a professional certificate and get listed on the MeriDiet platform.',
  url: 'https://meridiet.com/nutritionist-course',
  provider: { '@type': 'Organization', name: 'MeriDiet', url: 'https://meridiet.com' },
  hasCourseInstance: {
    '@type': 'CourseInstance',
    courseMode: 'online',
    duration: 'P3M',
    inLanguage: 'en',
    courseSchedule: { '@type': 'Schedule', repeatFrequency: 'P1D' },
  },
  offers: {
    '@type': 'Offer',
    price: '14999',
    priceCurrency: 'INR',
    availability: 'https://schema.org/InStock',
    url: 'https://meridiet.com/nutritionist-course',
  },
  educationalCredentialAwarded: 'MeriDiet Certified Nutritionist Certificate',
  teaches: ['Nutrition Fundamentals', 'Indian Meal Planning', 'Weight Management', 'PCOS Nutrition', 'Diabetes Nutrition', 'AI-Based Diet Plan Creation'],
}

const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://meridiet.com/' },
    { '@type': 'ListItem', position: 2, name: 'Nutritionist Course', item: 'https://meridiet.com/nutritionist-course' },
  ],
}

const CURRICULUM = [
  'Fundamentals of Nutrition',
  'Weight Loss & Weight Management',
  'Weight Gain Nutrition',
  'PCOS Nutrition',
  'Diabetes Nutrition',
  'Sports Nutrition',
  'Meal Planning',
  'Client Assessment',
  'Personalized Diet Planning',
  'Communication & Consultation Skills',
  'Professional Ethics',
  'AI-Based Diet Plan Creation',
  'Building Your Nutrition Career',
]

const WHO_CAN_JOIN = [
  { emoji: '🎓', label: '12th Pass Students' },
  { emoji: '📚', label: 'College Students' },
  { emoji: '🌱', label: 'Fresh Graduates' },
  { emoji: '🏠', label: 'Housewives' },
  { emoji: '🏋️', label: 'Gym Trainers' },
  { emoji: '⚡', label: 'Fitness Enthusiasts' },
  { emoji: '💼', label: 'Working Professionals' },
  { emoji: '🔄', label: 'Career Changers' },
]

const AFTER_COMPLETION = [
  { icon: '🎓', text: 'Receive your MeriDiet Certified Nutritionist Certificate' },
  { icon: '👤', text: 'Get listed on the MeriDiet Platform' },
  { icon: '📋', text: 'Create your professional nutrition profile' },
  { icon: '💰', text: 'Receive ₹5,000 AI Diet Plan Credit Wallet' },
  { icon: '📞', text: 'Start offering nutrition consultations through the platform' },
  { icon: '🏠', text: 'Build your nutrition consulting career from home' },
]

const WHY_STANDS_OUT = [
  { icon: '🧪', title: 'Practical Learning',   desc: 'Real-world case studies and consultation-focused training.' },
  { icon: '🎧', title: 'Flexible Learning',    desc: 'Attend live sessions or learn anytime with recorded lectures.' },
  { icon: '🚀', title: 'Career Support',       desc: 'Guidance to help you begin your nutrition consulting journey.' },
  { icon: '👤', title: 'Professional Profile', desc: 'Create your profile on the MeriDiet Platform after successful completion.' },
  { icon: '🤖', title: 'AI Tools',             desc: 'Use modern AI-powered tools to create personalized diet plans efficiently.' },
]

const FAQS = [
  { q: 'Who can apply?',                                   a: 'Anyone who has completed 12th grade can apply.' },
  { q: 'Do I need a medical background?',                  a: 'No. The program is designed for beginners as well as fitness professionals who want to learn nutrition.' },
  { q: 'Is the course online?',                            a: 'Yes. It includes live classes and recorded sessions you can watch anytime.' },
  { q: 'Will I receive a certificate?',                    a: 'Yes. After successfully completing the program, you\'ll receive the MeriDiet Certified Nutritionist Certificate.' },
  { q: 'Can I offer consultations after completing?',      a: 'After successful completion and onboarding to the MeriDiet platform, eligible learners can create a professional profile and offer nutrition consultations, subject to platform policies.' },
  { q: 'What is the ₹5,000 AI Diet Plan Credit Wallet?',  a: 'You\'ll receive AI Diet Plan credits worth ₹5,000 that can be used to generate personalized diet plans through the MeriDiet platform after successful course completion.' },
]

const HIGHLIGHTS = [
  ['Duration',      '3 Months'],
  ['Mode',          'Live + Recorded'],
  ['Language',      'English'],
  ['Eligibility',   '12th Pass'],
  ['Certification', 'MeriDiet Certified Nutritionist'],
]

const INCLUDES = [
  'Live + Recorded lectures — learn at your pace',
  'MeriDiet Certified Nutritionist Certificate',
  'Professional profile on MeriDiet Platform',
  '₹5,000 AI Diet Plan Credit Wallet',
  'Opportunity to offer consultations',
  'Career support & guidance',
]

type EnqForm = { name: string; email: string; phone: string; qualification: string; message: string }
type PayForm = { name: string; email: string; phone: string }
const ENQ_INIT: EnqForm = { name: '', email: '', phone: '', qualification: '', message: '' }
const PAY_INIT: PayForm = { name: '', email: '', phone: '' }
type Step = 'form' | 'otp' | 'paying' | 'success' | 'pay_failed'

export default function NutritionistCourse() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [tab, setTab]         = useState<'pay' | 'enquiry'>('pay')

  // ── Enquiry state ──
  const [enqForm, setEnqForm]   = useState<EnqForm>(ENQ_INIT)
  const [enqOtp, setEnqOtp]     = useState('')
  const [enqStep, setEnqStep]   = useState<Step>('form')
  const [enqLoading, setEnqLoading] = useState(false)
  const [enqError, setEnqError] = useState('')
  const [enqOtpLoading, setEnqOtpLoading] = useState(false)
  const [enqOtpSent, setEnqOtpSent] = useState(false)

  // ── Pay state ──
  const [payForm, setPayForm]   = useState<PayForm>(PAY_INIT)
  const [payOtp, setPayOtp]     = useState('')
  const [payStep, setPayStep]   = useState<Step>('form')
  const [payLoading, setPayLoading] = useState(false)
  const [payError, setPayError] = useState('')
  const [payOtpLoading, setPayOtpLoading] = useState(false)
  const [payOtpSent, setPayOtpSent] = useState(false)
  const [paidData, setPaidData] = useState<{ name: string; amount: number } | null>(null)

  const setE = (k: keyof EnqForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setEnqForm(p => ({ ...p, [k]: e.target.value }))
  const setP = (k: keyof PayForm) => (e: React.ChangeEvent<HTMLInputElement>) => setPayForm(p => ({ ...p, [k]: e.target.value }))

  // ── Enquiry handlers ──
  const sendEnqOtp = async () => {
    const phone = enqForm.phone.trim()
    if (phone.length !== 10) { setEnqError('Enter a valid 10-digit mobile number.'); return }
    setEnqError(''); setEnqOtpLoading(true)
    try { await courseApi.sendOtp({ phone }); setEnqOtpSent(true) }
    catch (err: unknown) { setEnqError(err instanceof Error ? err.message : 'Failed to send OTP. Please try again.') }
    finally { setEnqOtpLoading(false) }
  }

  const submitEnquiry = async (e: React.FormEvent) => {
    e.preventDefault(); setEnqError('')
    if (!enqOtp.trim()) { setEnqError('Please enter the OTP.'); return }
    setEnqLoading(true)
    try {
      await courseApi.submitEnquiry({ name: enqForm.name, email: enqForm.email, phone: enqForm.phone, otp: enqOtp, qualification: enqForm.qualification, message: enqForm.message })
      setEnqStep('success'); setEnqForm(ENQ_INIT); setEnqOtp(''); setEnqOtpSent(false)
    }
    catch (err: unknown) { setEnqError(err instanceof Error ? err.message : 'Something went wrong. Please call +91 960 960 6009.') }
    finally { setEnqLoading(false) }
  }

  // ── Pay handlers ──
  const sendPayOtp = async () => {
    const phone = payForm.phone.trim()
    if (phone.length !== 10) { setPayError('Enter a valid 10-digit mobile number.'); return }
    setPayError(''); setPayOtpLoading(true)
    try { await courseApi.sendOtp({ phone }); setPayOtpSent(true); setPayStep('otp') }
    catch (err: unknown) { setPayError(err instanceof Error ? err.message : 'Failed to send OTP. Please try again.') }
    finally { setPayOtpLoading(false) }
  }

  const submitPayment = async (e: React.FormEvent) => {
    e.preventDefault(); setPayError('')
    if (!payOtp.trim()) { setPayError('Please enter the OTP.'); return }
    setPayLoading(true)
    try {
      // Step 1: Register enrollment
      const enrollRes = await courseApi.registerEnrollment({ name: payForm.name, email: payForm.email, phone: payForm.phone, otp: payOtp })
      const enrollmentId = enrollRes.data.id

      // Step 2: Create Razorpay order
      const orderRes = await courseApi.createOrder({ enrollment_id: enrollmentId })
      const { key_id, order_id, amount, name, email, phone } = orderRes.data

      // Step 3: Open Razorpay
      setPayStep('paying')
      const rzp = new window.Razorpay({
        key: key_id,
        order_id,
        amount: amount * 100,   // convert to paise
        currency: 'INR',
        name: 'MeriDiet',
        description: 'Certified Nutritionist Program',
        prefill: { name, email, contact: phone },
        theme: { color: '#16a34a' },
        handler: async (rzpRes: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            const verifyRes = await courseApi.verifyPayment({ razorpay_order_id: rzpRes.razorpay_order_id, razorpay_payment_id: rzpRes.razorpay_payment_id, razorpay_signature: rzpRes.razorpay_signature })
            setPaidData({ name: verifyRes.data.name, amount: verifyRes.data.amount_paid })
            setPayStep('success')
            setPayForm(PAY_INIT); setPayOtp(''); setPayOtpSent(false)
          } catch {
            setPayError('Payment verification failed. Please contact support.')
            setPayStep('otp')
          }
        },
        modal: {
          ondismiss: async () => {
            try { await courseApi.failedPayment({ razorpay_order_id: order_id }) } catch { /* silent */ }
            setPayStep('pay_failed')
          },
        },
      })
      rzp.open()
    }
    catch (err: unknown) {
      setPayError(err instanceof Error ? err.message : 'Something went wrong. Please call +91 960 960 6009.')
      setPayStep('otp')
    }
    finally { setPayLoading(false) }
  }

  return (
    <main className="cp">
      <SEO
        title="Certified Nutritionist Course in 3 Months"
        description="Become a Certified Nutritionist in 3 months with MeriDiet. Online classes, 12th pass eligible. Get certified, listed & start your nutrition career from home."
        canonical="/nutritionist-course"
        jsonLd={[COURSE_SCHEMA, BREADCRUMB_SCHEMA]}
      />

      {/* ── HERO ── */}
      <section className="cp-hero">
        <div className="cp-hero-bg" />
        <div className="container cp-hero-wrap">
          <div className="cp-hero-left">
            <div className="cp-hero-pill">
              <span className="cp-hero-dot" />First Batch — Enrolling Now
            </div>
            <h1 className="cp-hero-h1">
              Become a <span className="cp-hero-hl">Certified<br />Nutritionist</span><br />
              in Just 3 Months
            </h1>
            <p className="cp-hero-tagline">Learn. Get Certified. Get Listed. Start Your Nutrition Career.</p>
            <p className="cp-hero-sub">
              Build a rewarding career in nutrition with the MeriDiet Certified Nutritionist Program.
              Learn through live and recorded classes, earn your certification, and get access to the
              MeriDiet platform to offer nutrition consultations from home.
            </p>
            <ul className="cp-hero-checks">
              <li><span>✔</span> 3-Month Program</li>
              <li><span>✔</span> Live + Recorded Classes</li>
              <li><span>✔</span> English Medium</li>
              <li><span>✔</span> 12th Pass Eligible</li>
            </ul>
            <a href="#enroll" className="cp-btn-green">Apply Now →</a>
          </div>

          <div className="cp-hero-right">
            <div className="cp-card">
              <div className="cp-card-top">
                <div className="cp-card-badge">MERI DIET CERTIFIED PROGRAM</div>
                <div className="cp-card-price-row">
                  <span className="cp-card-price">
                    <span className="cp-old-price">₹24,999</span>
                    ₹14,999
                  </span>
                  <span className="cp-card-emi">EMI ₹5,999/month</span>
                </div>
                <div className="cp-card-meta">
                  <span>🗓 3 Months</span><span>•</span><span>💻 Online</span><span>•</span><span>🎓 Certificate</span>
                </div>
              </div>
              <ul className="cp-card-list">
                {INCLUDES.map(i => <li key={i}><span className="cp-card-tick">✓</span>{i}</li>)}
              </ul>
              <a href="#enroll" className="cp-card-cta">Apply for First Batch →</a>
              <p className="cp-card-seats">⚡ Limited seats — first come, first served</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── KEY BENEFITS STRIP ── */}
      <section className="cp-key-strip">
        <div className="container cp-key-strip-inner">
          <div className="cp-key-item">
            <span className="cp-key-icon">🎥</span>
            <div className="cp-key-text">
              <strong>Recorded + Live Guest Lectures</strong>
              <p>Learn at your own pace with recorded sessions, plus attend exclusive live guest lectures by industry experts</p>
            </div>
          </div>
          <div className="cp-key-sep" />
          <div className="cp-key-item">
            <span className="cp-key-icon">🎓</span>
            <div className="cp-key-text">
              <strong>Certification</strong>
              <p>MeriDiet Certified Nutritionist — official certificate after successful course completion</p>
            </div>
          </div>
          <div className="cp-key-sep" />
          <div className="cp-key-item">
            <span className="cp-key-icon">💰</span>
            <div className="cp-key-text">
              <strong>₹5,000 Free Wallet Credit</strong>
              <p>Receive ₹5,000 wallet credit after completion to generate AI-powered diet plans on the MeriDiet Platform</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE ── */}
      <section className="cp-why">
        <div className="container">
          <div className="cp-sec-head">
            <p className="cp-eyebrow">Why MeriDiet?</p>
            <h2 className="cp-sec-title">More Than a Certification —<br />A Career Opportunity</h2>
            <p className="cp-sec-sub">Unlike traditional courses that end with a certificate, the MeriDiet Certified Nutritionist Program helps you take the next step.</p>
          </div>
          <div className="cp-why-grid">
            {AFTER_COMPLETION.map(a => (
              <div key={a.text} className="cp-why-card">
                <span className="cp-why-icon">{a.icon}</span>
                <p>{a.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHO CAN JOIN ── */}
      <section className="cp-who">
        <div className="container">
          <div className="cp-sec-head">
            <p className="cp-eyebrow">Who can join?</p>
            <h2 className="cp-sec-title">This program is designed for you</h2>
            <p className="cp-sec-sub">Whether you're starting your career or looking for a new opportunity</p>
          </div>
          <div className="cp-who-grid">
            {WHO_CAN_JOIN.map(w => (
              <div key={w.label} className="cp-who-card">
                <span className="cp-who-emoji">{w.emoji}</span>
                <span>{w.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CURRICULUM ── */}
      <section className="cp-curriculum" id="curriculum">
        <div className="container">
          <div className="cp-sec-head">
            <p className="cp-eyebrow" style={{ background: '#f0fdf4', color: '#16a34a' }}>What you'll learn</p>
            <h2 className="cp-sec-title">13 Practical Topics</h2>
            <p className="cp-sec-sub">Our curriculum is designed to build practical, job-ready nutrition knowledge</p>
          </div>
          <div className="cp-curriculum-grid">
            {CURRICULUM.map((topic, i) => (
              <div key={topic} className="cp-topic-card">
                <span className="cp-topic-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="cp-topic-name">{topic}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COURSE HIGHLIGHTS ── */}
      <section className="cp-highlights">
        <div className="container cp-highlights-inner">
          <div className="cp-highlights-left">
            <p className="cp-eyebrow">At a glance</p>
            <h2 className="cp-sec-title" style={{ textAlign: 'left' }}>Course Highlights</h2>
            <p className="cp-sec-sub" style={{ textAlign: 'left' }}>Everything you need to know before you enrol</p>
            <a href="#enroll" className="cp-btn-green" style={{ marginTop: 28, display: 'inline-block' }}>Apply Now →</a>
          </div>
          <div className="cp-highlights-table">
            {HIGHLIGHTS.map(([feature, detail]) => (
              <div key={feature} className="cp-hl-row">
                <span className="cp-hl-feature">{feature}</span>
                <span className="cp-hl-detail">{detail}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY STANDS OUT ── */}
      <section className="cp-standout">
        <div className="container">
          <div className="cp-sec-head">
            <p className="cp-eyebrow">What makes us different</p>
            <h2 className="cp-sec-title">Why This Program Stands Out</h2>
          </div>
          <div className="cp-standout-grid">
            {WHY_STANDS_OUT.map(w => (
              <div key={w.title} className="cp-standout-card">
                <div className="cp-standout-icon">{w.icon}</div>
                <h4>{w.title}</h4>
                <p>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ENROL ── */}
      <section className="cp-enroll" id="enroll">
        <div className="container">
          <div className="cp-sec-head">
            <p className="cp-eyebrow">Get started today</p>
            <h2 className="cp-sec-title">Ready to Build Your Career in Nutrition?</h2>
            <p className="cp-sec-sub">Join aspiring professionals taking the first step toward a career in nutrition</p>
          </div>

          <div className="cp-toggle">
            <button className={`cp-toggle-btn${tab === 'pay' ? ' active' : ''}`} onClick={() => setTab('pay')}>💳 Register &amp; Pay</button>
            <button className={`cp-toggle-btn${tab === 'enquiry' ? ' active' : ''}`} onClick={() => setTab('enquiry')}>💬 Make an Enquiry</button>
          </div>

          {tab === 'pay' && (
            <div className="cp-panel">
              <div className="cp-panel-l cp-panel-l--pay">
                <p className="cp-panel-eyebrow">What's included</p>
                <div className="cp-panel-price">
                  <span className="cp-panel-old-price">₹24,999</span>
                  <span className="cp-panel-amount">₹14,999</span>
                  <span className="cp-panel-note">One-time · EMI ₹5,999/month</span>
                </div>
                <ul className="cp-panel-includes">
                  {INCLUDES.map(i => <li key={i}><span>✓</span>{i}</li>)}
                </ul>
                <div className="cp-panel-seats">⚡ Limited seats — first come, first served</div>
              </div>

              <div className="cp-panel-r">
                {payStep === 'success' && (
                  <div className="cp-success">
                    <div className="cp-success-icon">🎉</div>
                    <h3>Payment Successful!</h3>
                    <p>Welcome to the MeriDiet Certified Nutritionist Program{paidData ? `, ${paidData.name}` : ''}! Check your email for confirmation and next steps.</p>
                    <button onClick={() => { setPayStep('form'); setPayOtpSent(false) }} className="cp-btn-green" style={{ marginTop: 20, border: 'none', cursor: 'pointer' }}>← Go Back</button>
                  </div>
                )}
                {payStep === 'pay_failed' && (
                  <div className="cp-success">
                    <div className="cp-success-icon">❌</div>
                    <h3>Payment Not Completed</h3>
                    <p>Your payment was not completed. No amount has been deducted. Please try again.</p>
                    <button onClick={() => { setPayStep('otp'); setPayError('') }} className="cp-pay-btn" style={{ marginTop: 20 }}>Try Again</button>
                  </div>
                )}
                {payStep === 'paying' && (
                  <div className="cp-success">
                    <div className="cp-success-icon">⏳</div>
                    <h3>Opening Payment…</h3>
                    <p>Please complete the payment in the Razorpay window that just opened.</p>
                  </div>
                )}
                {(payStep === 'form' || payStep === 'otp') && (
                  <form onSubmit={submitPayment} noValidate>
                    <div className="cp-form-head">
                      <h3>Register &amp; Pay</h3>
                      <p>{payStep === 'form' ? 'Fill in your details to get started.' : 'Enter the OTP sent to your phone.'}</p>
                    </div>

                    {payStep === 'form' && (<>
                      <div className="cp-field-group">
                        <div className="cp-field">
                          <label>Full Name <span>*</span></label>
                          <input type="text" placeholder="Your full name" value={payForm.name} onChange={setP('name')} required />
                        </div>
                        <div className="cp-field">
                          <label>Email Address <span>*</span></label>
                          <input type="email" placeholder="your@email.com" value={payForm.email} onChange={setP('email')} required />
                        </div>
                      </div>
                      <div className="cp-field">
                        <label>Phone Number <span>*</span></label>
                        <div className="cp-otp-row">
                          <input type="tel" placeholder="10-digit mobile number" value={payForm.phone} onChange={setP('phone')} maxLength={10} required />
                          <button type="button" className="cp-send-otp-btn" onClick={sendPayOtp} disabled={payOtpLoading || payOtpSent}>
                            {payOtpLoading ? '…' : payOtpSent ? 'Sent ✓' : 'Send OTP'}
                          </button>
                        </div>
                      </div>
                      {payOtpSent && (
                        <p className="cp-otp-hint">OTP sent to +91 {payForm.phone}. <button type="button" className="cp-resend-link" onClick={sendPayOtp} disabled={payOtpLoading}>Resend</button></p>
                      )}
                    </>)}

                    {payStep === 'otp' && (<>
                      <div className="cp-otp-back">
                        <span>Sending to +91 {payForm.phone}</span>
                        <button type="button" onClick={() => { setPayStep('form'); setPayError('') }}>Change</button>
                      </div>
                      <div className="cp-field">
                        <label>Enter OTP <span>*</span></label>
                        <input type="text" inputMode="numeric" maxLength={4} placeholder="Enter 4-digit OTP" value={payOtp} onChange={e => setPayOtp(e.target.value)} autoFocus required />
                      </div>
                      <p className="cp-otp-hint">
                        Didn't receive it? <button type="button" className="cp-resend-link" onClick={sendPayOtp} disabled={payOtpLoading}>{payOtpLoading ? 'Sending…' : 'Resend OTP'}</button>
                      </p>
                    </>)}

                    {payError && <p className="cp-field-error">{payError}</p>}

                    {payStep === 'form' && payOtpSent && (
                      <button type="button" className="cp-btn-green" style={{ width: '100%', marginTop: 4, padding: '13px', border: 'none', borderRadius: 10, fontSize: 15, cursor: 'pointer' }} onClick={() => setPayStep('otp')}>
                        Continue →
                      </button>
                    )}
                    {payStep === 'otp' && (
                      <button type="submit" className="cp-pay-btn" disabled={payLoading}>
                        {payLoading ? 'Please wait…' : '🔒 Pay ₹14,999 Securely'}
                      </button>
                    )}
                    <p className="cp-field-note">Powered by Razorpay · 100% secure</p>
                  </form>
                )}
              </div>
            </div>
          )}

          {tab === 'enquiry' && (
            <div className="cp-panel">
              <div className="cp-panel-l cp-panel-l--enq">
                <p className="cp-panel-eyebrow" style={{ color: '#86efac' }}>We're here to help</p>
                <h3 className="cp-enq-h3">Have questions?<br />Talk to our team.</h3>
                <p className="cp-enq-p">Fill the form and our team will personally call you — covering curriculum, fees, batch dates and career outcomes.</p>
                <div className="cp-enq-items">
                  {[['📞','Personal callback within 24 hours'],['💬','WhatsApp support available'],['🌐','Hindi & English support'],['📅','First batch — enrolling now']].map(([ic, tx]) => (
                    <div key={tx} className="cp-enq-item"><span>{ic}</span><span>{tx}</span></div>
                  ))}
                </div>
              </div>

              <div className="cp-panel-r">
                {enqStep === 'success' && (
                  <div className="cp-success">
                    <div className="cp-success-icon">✅</div>
                    <h3>Enquiry Received!</h3>
                    <p>Our team will call you within 24 hours to answer all your questions about the course.</p>
                    <button onClick={() => { setEnqStep('form'); setEnqOtpSent(false) }} className="cp-btn-green" style={{ marginTop: 20, border: 'none', cursor: 'pointer' }}>← Submit Another</button>
                  </div>
                )}
                {(enqStep === 'form' || enqStep === 'otp') && (
                  <form onSubmit={submitEnquiry} noValidate>
                    <div className="cp-form-head">
                      <h3>Enquiry Form</h3>
                      <p>{enqStep === 'form' ? 'Our counsellor will reach out personally.' : 'Enter the OTP sent to your phone.'}</p>
                    </div>

                    {enqStep === 'form' && (<>
                      <div className="cp-field-group">
                        <div className="cp-field">
                          <label>Full Name <span>*</span></label>
                          <input type="text" placeholder="Your full name" value={enqForm.name} onChange={setE('name')} required />
                        </div>
                        <div className="cp-field">
                          <label>Email Address <span>*</span></label>
                          <input type="email" placeholder="your@email.com" value={enqForm.email} onChange={setE('email')} required />
                        </div>
                      </div>
                      <div className="cp-field">
                        <label>Phone Number <span>*</span></label>
                        <div className="cp-otp-row">
                          <input type="tel" placeholder="10-digit mobile number" value={enqForm.phone} onChange={setE('phone')} maxLength={10} required />
                          <button type="button" className="cp-send-otp-btn" onClick={sendEnqOtp} disabled={enqOtpLoading || enqOtpSent}>
                            {enqOtpLoading ? '…' : enqOtpSent ? 'Sent ✓' : 'Send OTP'}
                          </button>
                        </div>
                      </div>
                      {enqOtpSent && (
                        <p className="cp-otp-hint">OTP sent to +91 {enqForm.phone}. <button type="button" className="cp-resend-link" onClick={sendEnqOtp} disabled={enqOtpLoading}>Resend</button></p>
                      )}
                      <div className="cp-field">
                        <label>Highest Qualification</label>
                        <select value={enqForm.qualification} onChange={setE('qualification')}>
                          <option value="">Select your qualification</option>
                          <option>10th / High School</option><option>12th / Intermediate</option>
                          <option>Diploma</option><option>Bachelor's Degree</option>
                          <option>Master's Degree</option><option>PhD / Doctorate</option>
                        </select>
                      </div>
                      <div className="cp-field">
                        <label>Your Query <span style={{ fontWeight: 400, color: '#9ca3af' }}>(optional)</span></label>
                        <textarea placeholder="What would you like to know about the course?" value={enqForm.message} onChange={setE('message')} rows={3} />
                      </div>
                    </>)}

                    {enqStep === 'otp' && (<>
                      <div className="cp-otp-back">
                        <span>Sending to +91 {enqForm.phone}</span>
                        <button type="button" onClick={() => { setEnqStep('form'); setEnqError('') }}>Change</button>
                      </div>
                      <div className="cp-field">
                        <label>Enter OTP <span>*</span></label>
                        <input type="text" inputMode="numeric" maxLength={4} placeholder="Enter 4-digit OTP" value={enqOtp} onChange={e => setEnqOtp(e.target.value)} autoFocus required />
                      </div>
                      <p className="cp-otp-hint">
                        Didn't receive it? <button type="button" className="cp-resend-link" onClick={sendEnqOtp} disabled={enqOtpLoading}>{enqOtpLoading ? 'Sending…' : 'Resend OTP'}</button>
                      </p>
                    </>)}

                    {enqError && <p className="cp-field-error">{enqError}</p>}

                    {enqStep === 'form' && enqOtpSent && (
                      <button type="button" className="cp-enq-btn" style={{ marginTop: 4 }} onClick={() => setEnqStep('otp')}>
                        Continue →
                      </button>
                    )}
                    {enqStep === 'otp' && (
                      <button type="submit" className="cp-enq-btn" disabled={enqLoading}>
                        {enqLoading ? 'Submitting…' : 'Submit Enquiry →'}
                      </button>
                    )}
                    <p className="cp-field-note">No spam, ever. We'll only call once.</p>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="cp-faq">
        <div className="container cp-faq-wrap">
          <div className="cp-sec-head">
            <p className="cp-eyebrow">Got questions?</p>
            <h2 className="cp-sec-title">Frequently Asked Questions</h2>
          </div>
          <div className="cp-faq-list">
            {FAQS.map((f, i) => (
              <div key={i} className={`cp-faq-item${openFaq === i ? ' open' : ''}`}>
                <button className="cp-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  {f.q}
                  <span className="cp-faq-icon">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && <div className="cp-faq-a">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="cp-cta">
        <div className="cp-cta-blob cp-cta-blob--1" />
        <div className="cp-cta-blob cp-cta-blob--2" />
        <div className="container cp-cta-inner">
          <div className="cp-cta-badge">First batch — limited seats</div>
          <h2 className="cp-cta-h2">Start Your Nutrition Career Today</h2>
          <p className="cp-cta-p">Fill out the form and our team will contact you with complete course details.</p>
          <a href="#enroll" className="cp-cta-btn">Apply Now →</a>
        </div>
      </section>
    </main>
  )
}
