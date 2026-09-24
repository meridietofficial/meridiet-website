import { useState } from 'react'
import SEO from '../components/SEO'
import courseApi from '../api/course'
import { loadRazorpay } from '../utils/loadRazorpay'

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

const SECTIONS = [
  {
    title: 'Fundamentals of Nutrition', icon: '🔬',
    classes: [
      { title: 'Introduction to Nutrition, Health & Digestive System', topics: ['Definition, importance & scope of nutrition', 'Components of health — physical, mental & social', 'Macronutrients, micronutrients & essential nutrients', 'Digestive system — structure, digestion, absorption & assimilation'] },
      { title: 'Human Circulatory & Endocrine Systems', topics: ['Heart structure, blood vessels & circulation', 'Nutrient transport & oxygen delivery', 'Major endocrine glands & hormones', 'Insulin, thyroid, cortisol & hunger/satiety hormones'] },
      { title: 'Human Excretory System & Nutrition', topics: ['Kidneys, nephrons & urine formation', 'Fluid balance & electrolyte regulation', 'Protein metabolism & nitrogenous waste', 'Hydration & urinary function'] },
    ],
  },
  {
    title: 'Macronutrients', icon: '🥩',
    classes: [
      { title: 'Protein', topics: ['Definition, structure & functions of protein', 'Essential & non-essential amino acids', 'Protein quality, sources & requirements', 'Protein needs across life stages & Indian sources'] },
      { title: 'Carbohydrates & Fiber', topics: ['Types of carbohydrates — simple & complex', 'Glycemic index & glycemic load', 'Soluble & insoluble fiber sources', 'Role of fiber in digestion & gut health'] },
      { title: 'Dietary Fats', topics: ['Saturated, unsaturated, mono, poly & trans fats', 'Omega-3 & omega-6 fatty acids', 'Dietary fat sources & recommended intake'] },
    ],
  },
  {
    title: 'Micronutrients', icon: '💊',
    classes: [
      { title: 'Vitamins', topics: ['Fat-soluble vitamins: A, D, E, K', 'Water-soluble vitamins: B Complex & C', 'Dietary sources, recommended intake & deficiency disorders', 'Toxicity risks & excess intake'] },
      { title: 'Minerals & Mineral Toxicity', topics: ['Macrominerals: Calcium, Magnesium, Sodium, Potassium', 'Trace minerals: Iron, Zinc, Iodine, Selenium & more', 'Deficiency disorders & tolerable upper intake levels', 'Safe supplementation practices'] },
    ],
  },
  {
    title: 'Nutrition Calculations', icon: '🧮',
    classes: [
      { title: 'BMI, BMR, TDEE, Protein & Hydration Calculations', topics: ['BMI formula, categories & practical examples', 'Basal Metabolic Rate using Mifflin–St Jeor equation', 'Total Daily Energy Expenditure with activity factors', 'Protein requirements by goal; daily water & fluid calculations'] },
    ],
  },
  {
    title: 'Food Science', icon: '🔍',
    classes: [
      { title: 'Food Labels', topics: ['Reading serving size, energy & macronutrient info', 'Ingredient list & label interpretation in practice'] },
      { title: 'Food Additives & Artificial Sweeteners', topics: ['Preservatives, colours, emulsifiers & INS numbers', 'Types of artificial sweeteners, safety & acceptable daily intake'] },
      { title: 'Food Processing', topics: ['Traditional vs modern processing methods', 'Effect of processing & cooking on nutrient content', 'Food fortification & preservation'] },
      { title: 'Food Safety & Hygiene', topics: ['Safe storage, temperature control & cross-contamination', 'Personal hygiene & prevention of foodborne illness'] },
    ],
  },
  {
    title: 'Life-Stage & Special Population Nutrition', icon: '👨‍👩‍👧‍👦',
    classes: [
      { title: 'Pregnancy, Lactation & Infant Nutrition', topics: ['Energy, macronutrient & key micronutrient needs during pregnancy', 'Maternal diet, hydration & breastfeeding nutrition', 'Infant complementary feeding & introduction of solids'] },
      { title: 'Child & Adolescent Nutrition', topics: ['Nutritional requirements for growth & development', 'Balanced diet, healthy habits & common deficiencies in children', 'Iron, calcium & puberty-related nutrition in adolescents'] },
      { title: 'Geriatric Nutrition, Allergies & Drug–Nutrient Interactions', topics: ['Age-related nutritional changes & common concerns', 'Food allergies vs intolerances — gluten, lactose & nuts', 'Drug–nutrient interactions, food timing & referral considerations'] },
    ],
  },
  {
    title: 'Nutrition Assessment', icon: '📋',
    classes: [
      { title: 'Client Assessment & Intake', topics: ['Medical history, lifestyle & dietary assessment', 'Food preferences, allergies, intolerances & client goals', 'Anthropometric measurements — BMI, waist, hip, waist–hip ratio & body fat', 'Client assessment forms, food recall forms & record keeping'] },
    ],
  },
  {
    title: 'Diet Planning', icon: '📝',
    classes: [
      { title: 'Diet Planning Principles & Meal Structure', topics: ['Calorie requirements & macronutrient distribution', 'Meal timing, frequency, portion control & food variety', 'Customization for allergies, intolerances & lifestyle'] },
      { title: 'Diet Templates & Indian Cuisine Customization', topics: ['Vegetarian, vegan & non-vegetarian templates (1200–2500 kcal)', 'Plant-based protein sources & nutrient considerations', 'North, South, East & West Indian meal customization'] },
    ],
  },
  {
    title: 'Weight Management', icon: '⚖️',
    classes: [
      { title: 'Weight Loss & Fat Loss', topics: ['Energy balance, calorie deficit & fat loss science', 'Factors affecting weight loss, rate of loss & plateaus', 'Diet planning — protein requirements, fiber & portion control'] },
      { title: 'Weight Gain, Muscle Gain & Behaviour Change', topics: ['Calorie surplus, nutrient-dense foods & meal frequency', 'Protein & carbohydrate needs for muscle gain & recovery', 'Habit formation, motivation, goal setting & managing setbacks'] },
    ],
  },
  {
    title: 'Lifestyle Disorders', icon: '🏥',
    classes: [
      { title: 'Obesity & PCOS', topics: ['Pathophysiology, clinical features & complications', 'Nutrition considerations & sample meal plan'] },
      { title: 'Diabetes & Hypertension', topics: ['Blood sugar & blood pressure management through diet', 'Nutrition considerations & sample meal plan'] },
      { title: 'Thyroid Disorders & Fatty Liver', topics: ['Hypo & hyperthyroidism — nutrition strategies', 'Fatty liver — dietary & lifestyle modifications', 'Sample meal plans for both conditions'] },
      { title: 'Gut Health', topics: ['Gut microbiome, pathophysiology & clinical features', 'Diet for IBS, bloating & constipation', 'Nutrition considerations & sample meal plan'] },
    ],
  },
  {
    title: 'Sports Nutrition', icon: '🏋️',
    classes: [
      { title: 'Sports Nutrition Fundamentals', topics: ['Energy requirements & pre/during/post-workout nutrition', 'Protein & carbohydrate requirements for athletes', 'Hydration, electrolyte replacement & competition nutrition'] },
    ],
  },
  {
    title: 'Supplements', icon: '💊',
    classes: [
      { title: 'Common Dietary Supplements', topics: ['Role of supplements & when they may be considered', 'Protein, creatine, omega-3, multivitamins, vitamin D, B12 & electrolytes', 'Dosage, timing, food vs supplement sources & safety', 'Client counselling on supplement use'] },
    ],
  },
  {
    title: 'Evidence-Based Awareness', icon: '🔎',
    classes: [
      { title: 'Fad Diets & Nutrition Myth-Busting', topics: ['Identifying unsupported nutrition claims', 'Keto diet & intermittent fasting — science check', 'Detox teas & cleanses — evidence, limitations & risks'] },
      { title: 'Eating Disorders & Scope of Practice', topics: ['Warning signs of eating disorders & disordered eating', 'Nutritionist\'s role, referral guidelines & professional boundaries', 'Multidisciplinary care & when to refer to a specialist'] },
    ],
  },
  {
    title: 'Professional Practice', icon: '💼',
    classes: [
      { title: 'Consultation & Communication Skills', topics: ['First consultation to follow-up process & client retention', 'Active listening, client-centred communication & motivational interviewing', 'Explaining nutrition simply & handling client concerns'] },
      { title: 'Professional Ethics & Documentation', topics: ['Scope of practice, confidentiality & informed communication', 'Evidence-based practice & professional boundaries', 'Record keeping, consultation notes & data privacy'] },
    ],
  },
  {
    title: 'Case Studies', icon: '📊',
    classes: [
      { title: 'Weight Management Case Studies', topics: ['Case: Weight loss — female client (assessment, plan & follow-up)', 'Case: Muscle gain client (energy, protein & training nutrition)'] },
      { title: 'Lifestyle Disorder Case Studies', topics: ['Case: PCOS client (nutrition analysis, meal plan & follow-up)', 'Case: Diabetes client (meal planning & lifestyle considerations)'] },
      { title: 'Office Professional & Integrated Case Practice', topics: ['Case: Sedentary office professional (lifestyle, diet & practical meal planning)', 'Integrated practice — assessment, calculations, planning, counselling & follow-up'] },
    ],
  },
  {
    title: 'Practical Toolkit', icon: '🛠️',
    classes: [
      { title: 'Nutrition Practice Tools', topics: ['Client assessment form, medical history & food recall form', 'Diet planning sheet, meal planning format & portion guide', 'Follow-up sheet, progress tracking & goal setting worksheet', 'Consultation checklist & client communication checklist'] },
    ],
  },
  {
    title: 'Software Learning — MeriDiet Platform', icon: '💻',
    classes: [
      { title: 'MeriDiet Platform Training', topics: ['Adding & managing client information', 'Entering client data, generating & reviewing AI diet plans', 'Making adjustments to diet plans', 'Tracking progress, updating records & managing follow-ups'] },
    ],
  },
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
  const [openSections, setOpenSections] = useState<Set<number>>(new Set([0]))

  const toggleSection = (i: number) => setOpenSections(prev => {
    const next = new Set(prev)
    if (next.has(i)) next.delete(i); else next.add(i)
    return next
  })

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
      await loadRazorpay()
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
            <h2 className="cp-sec-title">Complete Nutritionist Curriculum</h2>
            <p className="cp-sec-sub">17 sections · 36 classes — from human body science to running your own nutrition practice</p>
          </div>

          <div className="cp-curr-stats">
            <div className="cp-curr-stat">
              <span className="cp-curr-stat-val">17</span>
              <span>Sections</span>
            </div>
            <div className="cp-curr-stat-sep" />
            <div className="cp-curr-stat">
              <span className="cp-curr-stat-val">36</span>
              <span>Classes</span>
            </div>
            <div className="cp-curr-stat-sep" />
            <div className="cp-curr-stat">
              <span className="cp-curr-stat-val">350+</span>
              <span>Topics</span>
            </div>
            <div className="cp-curr-stat-sep" />
            <div className="cp-curr-stat">
              <span className="cp-curr-stat-val">🎓</span>
              <span>Certification Included</span>
            </div>
          </div>

          <div className="cp-sections-list">
            {SECTIONS.map((sec, si) => {
              const isOpen = openSections.has(si)
              return (
                <div key={si} className={`cp-section-acc${isOpen ? ' open' : ''}`}>
                  <button className="cp-section-acc-hdr" onClick={() => toggleSection(si)}>
                    <span className="cp-section-acc-snum">{String(si + 1).padStart(2, '0')}</span>
                    <span className="cp-section-acc-icon">{sec.icon}</span>
                    <span className="cp-section-acc-meta">
                      <span className="cp-section-acc-label">Section {si + 1}</span>
                      <span className="cp-section-acc-title">{sec.title}</span>
                    </span>
                    <span className="cp-section-acc-right">
                      <span className="cp-section-acc-count">{sec.classes.length} {sec.classes.length === 1 ? 'Class' : 'Classes'}</span>
                      <span className="cp-section-acc-arrow">▼</span>
                    </span>
                  </button>
                  {isOpen && (
                    <div className="cp-section-acc-body">
                      {sec.classes.map((cls, ci) => (
                        <div key={ci} className="cp-class-row">
                          <div className="cp-class-title">
                            <span className="cp-class-badge">Class {ci + 1}</span>
                            {cls.title}
                          </div>
                          <ul className="cp-class-topics-list">
                            {cls.topics.map((t, ti) => <li key={ti}>{t}</li>)}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}

            <div className="cp-cert-block">
              <div className="cp-cert-block-icon">🎓</div>
              <div>
                <div className="cp-cert-block-title">Certification Exam</div>
                <div className="cp-cert-block-chips">
                  {['100 MCQs', '20 Case-Based Questions', 'Online Practical Assignment', 'MeriDiet Platform Assessment', 'Certificate on Successful Completion'].map(c => (
                    <span key={c}>{c}</span>
                  ))}
                </div>
              </div>
            </div>
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
