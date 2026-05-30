import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import dietitianApi, { uploadDocuments } from '../api/dietitian'
import { ApiError } from '../api/client'
import { useToast } from '../context/ToastContext'

const STEPS = [
  { num: 1, label: 'Basic Information' },
  { num: 2, label: 'Qualifications' },
  { num: 3, label: 'Verification' },
]

const SPECIALIZATIONS = [
  'Weight Management', 'Sports Nutrition', 'Clinical Nutrition',
  'Pediatric Nutrition', 'PCOS / Hormonal', 'Diabetes Care',
  'Gut Health', 'General Wellness',
]

const PLATFORMS = [
  { v: 'WhatsApp',   icon: '💬' },
  { v: 'Video Call', icon: '📹' },
  { v: 'Phone Call', icon: '📞' },
  { v: 'In-Person',  icon: '🏥' },
]

const TIMINGS = [
  '6:00 AM – 9:00 AM', '9:00 AM – 12:00 PM',
  '12:00 PM – 3:00 PM', '3:00 PM – 6:00 PM',
  '6:00 PM – 9:00 PM', 'Flexible / Anytime',
]

type Form = {
  fullName: string; email: string; phone: string
  city: string; state: string; password: string
  qualification: string; experience: string; license: string
  specializations: string[]
  platforms: string[]; timings: string[]
  about: string; agreeTerms: boolean
}

const INIT: Form = {
  fullName: '', email: '', phone: '',
  city: '', state: '', password: '',
  qualification: '', experience: '', license: '',
  specializations: [],
  platforms: [], timings: [],
  about: '', agreeTerms: false,
}

const Err = ({ msg }: { msg?: string }) =>
  msg ? <p className="jd2-err">⚠ {msg}</p> : null

const JoinDietitian = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [step, setStep]       = useState(1)
  const [data, setData]       = useState<Form>(INIT)
  const [errors, setErrors]   = useState<Partial<Record<keyof Form, string>>>({})
  const [submitted, setSubmitted] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [docs, setDocs]     = useState<Record<string, File | null>>({
    profilePhoto: null, degreeCert: null, regCert: null, idProof: null,
  })
  const fileRefs = {
    profilePhoto: useRef<HTMLInputElement>(null),
    degreeCert:   useRef<HTMLInputElement>(null),
    regCert:      useRef<HTMLInputElement>(null),
    idProof:      useRef<HTMLInputElement>(null),
  }

  const set = (k: keyof Form, v: Form[keyof Form]) => {
    setData(p => ({ ...p, [k]: v }))
    setErrors(p => { const n = { ...p }; delete n[k]; return n })
  }
  const tog = (k: keyof Form, v: string) => {
    const arr = data[k] as string[]
    set(k, arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v])
  }

  const validate = (s: number) => {
    const e: typeof errors = {}
    if (s === 1) {
      if (!data.fullName.trim())  e.fullName = 'Full name is required'
      if (!data.email.trim() || !/\S+@\S+\.\S+/.test(data.email)) e.email = 'Valid email is required'
      if (!data.phone.trim() || !/^\d{10}$/.test(data.phone))     e.phone = 'Valid 10-digit number required'
      if (!data.state.trim())    e.state    = 'State is required'
      if (!data.city.trim())     e.city     = 'City is required'
      if (!data.password.trim()) e.password = 'Password is required'
      else if (data.password.length < 8) e.password = 'Password must be at least 8 characters'
    }
    if (s === 2) {
      if (!data.qualification.trim()) e.qualification = 'Please select your degree'
      if (!data.license.trim())       e.license       = 'Registration number is required'
      if (!data.experience)           e.experience    = 'Experience is required'
    }
    if (s === 3) {
      if (data.platforms.length === 0) e.platforms = 'Select at least one platform'
      if (data.timings.length === 0)   e.timings   = 'Select at least one timing'
      if (!data.agreeTerms)            e.agreeTerms = 'You must agree to the terms'
    }
    return e
  }

  const go = async (n: number) => {
    if (n > step) {
      const e = validate(step)
      if (Object.keys(e).length > 0) { setErrors(e); return }
    }

    // Upload docs + submit when moving from step 2 → step 3
    if (step === 2 && n === 3) {
      setUploading(true)
      try {
        const docUrls = await uploadDocuments(docs as Record<'profilePhoto' | 'degreeCert' | 'regCert' | 'idProof', File | null>)

        const body = {
          fullName:             data.fullName,
          email:                data.email,
          phone:                data.phone,
          state:                data.state,
          city:                 data.city,
          password:             data.password,
          highestDegree:        data.qualification,
          registrationNumber:   data.license,
          experience:           data.experience,
          specialization:       data.specializations[0] ?? '',
          documents: {
            profilePhoto:            docUrls.profilePhoto,
            degreeCertificate:       docUrls.degreeCert,
            registrationCertificate: docUrls.regCert,
            idProof:                 docUrls.idProof,
          },
        }

        await dietitianApi.register(body)
      } catch (err) {
        showToast(
          err instanceof ApiError ? err.message : 'Upload failed. Please try again.',
          'error'
        )
        setUploading(false)
        return
      }
      setUploading(false)
    }

    setErrors({})
    setStep(n)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (submitted) return (
    <div className="jd2-page">
      <div className="jd2-success">
        <div className="jd2-success-emoji">🎉</div>
        <h2>Application Submitted!</h2>
        <p>Thank you <strong>{data.fullName}</strong>! Our team will review your profile and reach out within 48 hours.</p>
        <a href="/for-dietitians" className="btn-primary">Back to Dietitians Page</a>
      </div>
    </div>
  )

  return (
    <div className="jd2-page">

      {/* ── Top Stepper ── */}
      <div className="jd2-stepper-wrap">
        <div className="jd2-stepper">
          {STEPS.map((s, i) => {
            const done   = s.num < step
            const active = s.num === step
            return (
              <div key={s.num} className="jd2-step-item">
                {i > 0 && <div className={`jd2-step-line${done || active ? ' filled' : ''}`} />}
                <div className={`jd2-step-dot${active ? ' active' : ''}${done ? ' done' : ''}`}>
                  {done ? '✓' : s.num}
                </div>
                <span className={`jd2-step-lbl${active ? ' active' : ''}`}>{s.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Form Card ── */}
      <div className="jd2-card-wrap">
        <div className="jd2-card">

          {/* Step header */}
          {step < 3 && <div className="jd2-card-hd">
            <div className="jd2-card-icon">
              {step === 1
                ? <img src="/jd-step1-icon.png" alt="" style={{ width: 28, height: 28, objectFit: 'contain' }} />
                : step === 2
                ? <i className="fa-solid fa-briefcase" />
                : <i className="fa-solid fa-shield-halved" />}
            </div>
            <div>
              <h2 className="jd2-card-title">
                {step === 1 ? 'Basic Information' : step === 2 ? 'Professional Details & Documents' : 'Verification'}
              </h2>
              <p className="jd2-card-sub">
                {step === 1 ? "Let's start with some basic details"
                  : step === 2 ? 'Tell us about your professional background'
                  : 'Final details to verify your profile'}
              </p>
            </div>
          </div>}

          {/* ── Step 1 ── */}
          {step === 1 && (
            <div className="jd2-fields">
              <div className="jd2-row">
                <div className="jd2-field">
                  <label className="jd2-label">Full Name <span className="jd2-req">*</span></label>
                  <div className={`jd2-input-wrap${errors.fullName ? ' err' : ''}`}>
                    <i className="jd2-ico fa-regular fa-user" />
                    <input className="jd2-input" placeholder="Enter your full name"
                      value={data.fullName} onChange={e => set('fullName', e.target.value)} />
                  </div>
                  <Err msg={errors.fullName} />
                </div>
                <div className="jd2-field">
                  <label className="jd2-label">Mobile Number <span className="jd2-req">*</span></label>
                  <div className={`jd2-input-wrap${errors.phone ? ' err' : ''}`}>
                    <i className="jd2-ico fa-solid fa-phone" />
                    <input className="jd2-input" type="tel" placeholder="Enter your 10-digit number"
                      value={data.phone} onChange={e => set('phone', e.target.value)} />
                  </div>
                  <Err msg={errors.phone} />
                </div>
              </div>

              <div className="jd2-row">
                <div className="jd2-field">
                  <label className="jd2-label">Email Address <span className="jd2-req">*</span></label>
                  <div className={`jd2-input-wrap${errors.email ? ' err' : ''}`}>
                    <i className="jd2-ico fa-regular fa-envelope" />
                    <input className="jd2-input" type="email" placeholder="Enter your email address"
                      value={data.email} onChange={e => set('email', e.target.value)} />
                  </div>
                  <Err msg={errors.email} />
                </div>
                <div className="jd2-field">
                  <label className="jd2-label">State <span className="jd2-req">*</span></label>
                  <div className={`jd2-input-wrap${errors.state ? ' err' : ''}`}>
                    <i className="jd2-ico fa-solid fa-map-location-dot" />
                    <select className="jd2-input jd2-select" value={data.state} onChange={e => set('state', e.target.value)}>
                      <option value="">Select state</option>
                      {['Andhra Pradesh','Delhi','Gujarat','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Punjab','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','West Bengal'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <Err msg={errors.state} />
                </div>
              </div>

              <div className="jd2-row">
                <div className="jd2-field">
                  <label className="jd2-label">City <span className="jd2-req">*</span></label>
                  <div className={`jd2-input-wrap${errors.city ? ' err' : ''}`}>
                    <i className="jd2-ico fa-solid fa-location-dot" />
                    <input className="jd2-input" placeholder="Enter your city"
                      value={data.city} onChange={e => set('city', e.target.value)} />
                  </div>
                  <Err msg={errors.city} />
                </div>
                <div className="jd2-field">
                  <label className="jd2-label">Password <span className="jd2-req">*</span></label>
                  <div className={`jd2-input-wrap${errors.password ? ' err' : ''}`}>
                    <i className="jd2-ico fa-solid fa-lock" />
                    <input className="jd2-input" type="password" placeholder="Minimum 8 characters"
                      value={data.password} onChange={e => set('password', e.target.value)} />
                  </div>
                  <Err msg={errors.password} />
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <div className="jd2-fields">
              <div className="jd2-row">
                <div className="jd2-field">
                  <label className="jd2-label">Highest Degree <span className="jd2-req">*</span></label>
                  <div className={`jd2-input-wrap${errors.qualification ? ' err' : ''}`}>
                    <select className="jd2-input jd2-select" style={{ paddingLeft: 12 }} value={data.qualification} onChange={e => set('qualification', e.target.value)}>
                      <option value="">Select your degree</option>
                      <option>B.Sc. Nutrition & Dietetics</option>
                      <option>M.Sc. Clinical Nutrition</option>
                      <option>M.Sc. Food & Nutrition</option>
                      <option>PG Diploma in Dietetics</option>
                      <option>Ph.D. Nutrition</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <Err msg={errors.qualification} />
                </div>
                <div className="jd2-field">
                  <label className="jd2-label">Registration Number <span className="jd2-req">*</span></label>
                  <div className={`jd2-input-wrap${errors.license ? ' err' : ''}`}>
                    <i className="jd2-ico fa-regular fa-id-card" />
                    <input className="jd2-input" placeholder="Enter registration number"
                      value={data.license} onChange={e => set('license', e.target.value)} />
                  </div>
                  <Err msg={errors.license} />
                </div>
              </div>

              <div className="jd2-field">
                <label className="jd2-label">Experience <span className="jd2-req">*</span></label>
                <div className={`jd2-input-wrap${errors.experience ? ' err' : ''}`}>
                  <select className="jd2-input jd2-select" style={{ paddingLeft: 12 }} value={data.experience} onChange={e => set('experience', e.target.value)}>
                    <option value="">Select your experience</option>
                    <option>Less than 1 year</option>
                    <option>1 – 3 years</option>
                    <option>3 – 5 years</option>
                    <option>5 – 10 years</option>
                    <option>10+ years</option>
                  </select>
                </div>
                <Err msg={errors.experience} />
              </div>

              <div className="jd2-field">
                <label className="jd2-label">Specialization <span className="jd2-opt">(if any)</span></label>
                <div className="jd2-input-wrap">
                  <i className="jd2-ico fa-solid fa-star" />
                  <input className="jd2-input" placeholder="Enter your specialization"
                    value={data.specializations[0] ?? ''} onChange={e => set('specializations', e.target.value ? [e.target.value] : [])} />
                </div>
              </div>

              <div className="jd2-field">
                <label className="jd2-label">Upload Documents <span className="jd2-req">*</span></label>
                <div className="jd2-upload-grid">
                  {([
                    { key: 'profilePhoto', label: 'Profile Photo',          icon: 'fa-regular fa-image',     hint: 'JPG, PNG up\nto 2MB' },
                    { key: 'degreeCert',   label: 'Degree Certificate',     icon: 'fa-regular fa-file-lines', hint: 'JPG, PNG, PDF\nup to 5MB' },
                    { key: 'regCert',      label: 'Registration\nCertificate', icon: 'fa-regular fa-file-lines', hint: 'JPG, PNG, PDF\nup to 5MB' },
                    { key: 'idProof',      label: 'ID Proof',               icon: 'fa-regular fa-id-card',   hint: 'JPG, PNG, PDF\nup to 5MB' },
                  ] as const).map(d => (
                    <div key={d.key} className={`jd2-upload-box${docs[d.key] ? ' uploaded' : ''}`}
                      onClick={() => fileRefs[d.key].current?.click()}>
                      <input ref={fileRefs[d.key]} type="file" accept="image/*,.pdf" style={{ display: 'none' }}
                        onChange={e => setDocs(p => ({ ...p, [d.key]: e.target.files?.[0] ?? null }))} />
                      <i className={`jd2-upload-icon ${d.icon}`} />
                      <span className="jd2-upload-lbl">{d.label}</span>
                      <span className="jd2-upload-hint">{docs[d.key] ? '✓ ' + docs[d.key]!.name.slice(0, 14) : d.hint}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3 – Review ── */}
          {step === 3 && (
            <div className="jd2-review">
              <p className="jd2-review-almost">You are almost done</p>
              <p className="jd2-review-sub">We'll review all your documents</p>
              <img src="/review-illustration.png" alt="Review" className="jd2-review-img" />
              <h2 className="jd2-review-title">Thank you for joining MeriDiet!</h2>
              <p className="jd2-review-desc">Our team will review your information and verify your account</p>
              <div className="jd2-review-box">
                <i className="fa-regular fa-clock jd2-review-box-icon" />
                Verification usually takes <strong>24–48 hours</strong>
              </div>
            </div>
          )}

          {/* ── Footer nav ── */}
          <div className="jd2-nav">
            <button className="jd2-back-btn" onClick={() => step === 1 ? navigate('/') : go(step - 1)}>
              ← {step === 1 ? 'Home' : 'Back'}
            </button>
            {step < 3 ? (
              <button className="jd2-next-btn" disabled={uploading} onClick={() => go(step + 1)}>
                {uploading ? 'Uploading…' : 'Next →'}
              </button>
            ) : (
              <button className="jd2-next-btn" onClick={() => setSubmitted(true)}>
                Done →
              </button>
            )}
          </div>
        </div>

        <p className="jd2-login-note">
          Already have an account? <a href="#">Login</a>
        </p>
      </div>
    </div>
  )
}

export default JoinDietitian
