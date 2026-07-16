import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import dietitianApi, { uploadDocuments } from '../api/dietitian'
import { prepareImageFile } from '../utils/imageUtils'
import { ApiError } from '../api/client'
import { useToast } from '../context/ToastContext'
import AuthModal from '../components/AuthModal'
import { IN_STATES } from '../data/indiaCities'
import SearchableSelect from '../components/SearchableSelect'
import type { SelectOption } from '../components/SearchableSelect'
import SpecializationInput from '../components/SpecializationInput'
import { trackEvent } from '../utils/analytics'

/* ── Session storage key for form data (text fields only) ── */
const STORAGE_KEY = 'md_dietitian_onboarding'

/* ── URL → step number map ── */
const STEP_MAP: Record<string, number> = {
  '/for-dietitians/basic-info':      1,
  '/for-dietitians/qualification':   2,
  '/for-dietitians/document-upload': 3,
}
const STEP_PATHS = [
  '',
  '/for-dietitians/basic-info',
  '/for-dietitians/qualification',
  '/for-dietitians/document-upload',
]

const STEPS = [
  { num: 1, label: 'Basic Info' },
  { num: 2, label: 'Qualifications' },
  { num: 3, label: 'Documents' },
]

/* ── Degrees (unchanged from JoinDietitian) ── */
const DEGREES: SelectOption[] = [
  { value: '', label: 'Undergraduate Degrees', isGroup: true },
  { value: 'B.Sc. Nutrition & Dietetics',            label: 'B.Sc. Nutrition & Dietetics' },
  { value: 'B.Sc. Food Science & Nutrition',         label: 'B.Sc. Food Science & Nutrition' },
  { value: 'B.Sc. Clinical Nutrition',               label: 'B.Sc. Clinical Nutrition' },
  { value: 'B.Sc. Dietetics',                        label: 'B.Sc. Dietetics' },
  { value: 'B.Sc. Food & Nutrition',                 label: 'B.Sc. Food & Nutrition' },
  { value: 'B.Sc. Food Technology',                  label: 'B.Sc. Food Technology' },
  { value: 'B.Sc. Home Science (Nutrition)',          label: 'B.Sc. Home Science (Nutrition)' },
  { value: 'B.Sc. Home Science (Food & Nutrition)',   label: 'B.Sc. Home Science (Food & Nutrition)' },
  { value: 'B.Sc. Biochemistry',                     label: 'B.Sc. Biochemistry' },
  { value: 'B.Sc. Biotechnology',                    label: 'B.Sc. Biotechnology' },
  { value: 'B.Sc. Agriculture (Food Science)',        label: 'B.Sc. Agriculture (Food Science)' },
  { value: 'B.H.Sc. Home Science',                   label: 'B.H.Sc. Home Science' },

  { value: '', label: 'Postgraduate Degrees', isGroup: true },
  { value: 'M.Sc. Nutrition & Dietetics',            label: 'M.Sc. Nutrition & Dietetics' },
  { value: 'M.Sc. Clinical Nutrition & Dietetics',   label: 'M.Sc. Clinical Nutrition & Dietetics' },
  { value: 'M.Sc. Food Science & Nutrition',         label: 'M.Sc. Food Science & Nutrition' },
  { value: 'M.Sc. Food & Nutrition',                 label: 'M.Sc. Food & Nutrition' },
  { value: 'M.Sc. Dietetics',                        label: 'M.Sc. Dietetics' },
  { value: 'M.Sc. Food Technology',                  label: 'M.Sc. Food Technology' },
  { value: 'M.Sc. Home Science (Food & Nutrition)',   label: 'M.Sc. Home Science (Food & Nutrition)' },
  { value: 'M.Sc. Sports Nutrition',                 label: 'M.Sc. Sports Nutrition' },
  { value: 'M.Sc. Public Health Nutrition',          label: 'M.Sc. Public Health Nutrition' },
  { value: 'M.Sc. Community Nutrition',              label: 'M.Sc. Community Nutrition' },
  { value: 'M.Sc. Human Nutrition',                  label: 'M.Sc. Human Nutrition' },
  { value: 'M.Sc. Maternal & Child Nutrition',       label: 'M.Sc. Maternal & Child Nutrition' },
  { value: 'M.Sc. Biochemistry',                     label: 'M.Sc. Biochemistry' },
  { value: 'M.Sc. Applied Nutrition',                label: 'M.Sc. Applied Nutrition' },

  { value: '', label: 'PG Diploma & Diploma', isGroup: true },
  { value: 'PG Diploma in Dietetics',                          label: 'PG Diploma in Dietetics' },
  { value: 'PG Diploma in Clinical Nutrition & Dietetics',     label: 'PG Diploma in Clinical Nutrition & Dietetics' },
  { value: 'PG Diploma in Nutrition & Dietetics',              label: 'PG Diploma in Nutrition & Dietetics' },
  { value: 'PG Diploma in Sports Nutrition',                   label: 'PG Diploma in Sports Nutrition' },
  { value: 'PG Diploma in Food Science & Nutrition',           label: 'PG Diploma in Food Science & Nutrition' },
  { value: 'PG Diploma in Dietetics & Applied Nutrition',      label: 'PG Diploma in Dietetics & Applied Nutrition' },
  { value: 'PG Diploma in Child Nutrition & Dietetics',        label: 'PG Diploma in Child Nutrition & Dietetics' },
  { value: 'PG Diploma in Diabetes Education',                 label: 'PG Diploma in Diabetes Education' },
  { value: 'PG Diploma in Community Nutrition',                label: 'PG Diploma in Community Nutrition' },
  { value: 'PGDDN – PG Diploma in Dietetics & Nutrition (IGNOU)', label: 'PGDDN – PG Diploma in Dietetics & Nutrition (IGNOU)' },
  { value: 'Diploma in Nutrition & Health Education (DNHE)',   label: 'Diploma in Nutrition & Health Education (DNHE)' },
  { value: 'Diploma in Dietetics & Nutrition',                 label: 'Diploma in Dietetics & Nutrition' },

  { value: '', label: 'Doctorate', isGroup: true },
  { value: 'Ph.D. Nutrition',                        label: 'Ph.D. Nutrition' },
  { value: 'Ph.D. Food Science & Nutrition',         label: 'Ph.D. Food Science & Nutrition' },
  { value: 'Ph.D. Clinical Nutrition',               label: 'Ph.D. Clinical Nutrition' },
  { value: 'Ph.D. Nutritional Biochemistry',         label: 'Ph.D. Nutritional Biochemistry' },
  { value: 'Ph.D. Food & Nutrition',                 label: 'Ph.D. Food & Nutrition' },
  { value: 'Ph.D. Dietetics',                        label: 'Ph.D. Dietetics' },
  { value: 'Ph.D. Home Science (Nutrition)',          label: 'Ph.D. Home Science (Nutrition)' },

  { value: '', label: 'Medical Degrees', isGroup: true },
  { value: 'MBBS',                                   label: 'MBBS' },
  { value: 'MD Medicine',                            label: 'MD Medicine' },
  { value: 'MD Biochemistry',                        label: 'MD Biochemistry' },
  { value: 'DNB (General Medicine)',                 label: 'DNB (General Medicine)' },

  { value: '', label: 'Professional Certifications', isGroup: true },
  { value: 'Certified Diabetes Educator (CDE)',      label: 'Certified Diabetes Educator (CDE)' },
  { value: 'Certified Sports Nutritionist',          label: 'Certified Sports Nutritionist' },
  { value: 'Certified Nutrition Specialist (CNS)',   label: 'Certified Nutrition Specialist (CNS)' },
  { value: 'Registered Dietitian (RD)',              label: 'Registered Dietitian (RD)' },
  { value: 'Other',                                  label: 'Other' },
]

const EXPERIENCE_OPTIONS = [
  { value: 'Less than 1 year', label: '< 1 Year',   sub: 'Fresher' },
  { value: '1 – 3 years',      label: '1 – 3 Yrs',  sub: 'Junior'  },
  { value: '3 – 5 years',      label: '3 – 5 Yrs',  sub: 'Mid-level' },
  { value: '5 – 10 years',     label: '5 – 10 Yrs', sub: 'Senior'  },
  { value: '10+ years',        label: '10+ Yrs',    sub: 'Expert'  },
]

type Form = {
  fullName: string; email: string; phone: string
  city: string; state: string; stateCode: string; password: string
  qualification: string; experience: string; license: string
  specializations: string[]
  agreeTerms: boolean
}

const INIT: Form = {
  fullName: '', email: '', phone: '',
  city: '', state: '', stateCode: '', password: '',
  qualification: '', experience: '', license: '',
  specializations: [],
  agreeTerms: false,
}

function loadSaved(): Partial<Form> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function saveData(data: Form) {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {}
}

function clearSaved() {
  try { sessionStorage.removeItem(STORAGE_KEY) } catch {}
}

const Err = ({ msg }: { msg?: string }) =>
  msg ? <p className="jd2-err">⚠ {msg}</p> : null

export default function DietitianOnboarding() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { showToast } = useToast()

  const step = STEP_MAP[pathname] ?? 1

  const [loginOpen, setLoginOpen]     = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [data, setData]               = useState<Form>(() => ({ ...INIT, ...loadSaved() }))
  const [errors, setErrors]           = useState<Partial<Record<keyof Form, string>>>({})
  const [uploading, setUploading]     = useState(false)
  const [docError, setDocError]       = useState('')
  const [cities, setCities]           = useState<string[]>([])
  const [citiesLoading, setCitiesLoading] = useState(false)
  const [docs, setDocs]               = useState<Record<string, File | null>>({
    profilePhoto: null, degreeCert: null, regCert: null, idProof: null,
  })

  const fileRefs = {
    profilePhoto: useRef<HTMLInputElement>(null),
    degreeCert:   useRef<HTMLInputElement>(null),
    regCert:      useRef<HTMLInputElement>(null),
    idProof:      useRef<HTMLInputElement>(null),
  }

  /* Guard: if user lands on a later step without having filled earlier steps, redirect */
  useEffect(() => {
    if (step > 1 && !data.fullName.trim()) {
      navigate('/for-dietitians/basic-info', { replace: true })
    } else if (step > 2 && !data.qualification.trim()) {
      navigate('/for-dietitians/qualification', { replace: true })
    }
  }, [step, data.fullName, data.qualification, navigate])

  /* Fire funnel tracking event on each step load */
  useEffect(() => {
    const EVENT_NAMES: Record<number, string> = {
      1: 'dietitian_onboarding_step1_basic_info',
      2: 'dietitian_onboarding_step2_qualification',
      3: 'dietitian_onboarding_step3_documents',
    }
    if (EVENT_NAMES[step]) trackEvent(EVENT_NAMES[step])
  }, [step])

  /* Fetch cities whenever state changes — same logic as JoinDietitian */
  useEffect(() => {
    if (!data.state) { setCities([]); return }
    setCitiesLoading(true)
    setCities([])
    fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country: 'India', state: data.state }),
    })
      .then(r => r.json())
      .then(res => { if (!res.error) setCities(res.data ?? []) })
      .catch(() => {})
      .finally(() => setCitiesLoading(false))
  }, [data.state])

  /* Persist text fields to sessionStorage on every change */
  useEffect(() => { saveData(data) }, [data])

  const set = (k: keyof Form, v: Form[keyof Form]) => {
    setData(p => ({ ...p, [k]: v }))
    setErrors(p => { const n = { ...p }; delete n[k]; return n })
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
      if (!data.agreeTerms) e.agreeTerms = 'You must agree to the terms to continue'
    }
    return e
  }

  const goNext = async () => {
    const e = validate(step)
    if (Object.keys(e).length > 0) { setErrors(e); return }

    if (step === 3) {
      /* ── Submit: upload docs → register API (same flow as JoinDietitian) ── */
      if (!docs.profilePhoto) { setDocError('Profile Photo is required'); return }
      setDocError('')
      setUploading(true)
      try {
        const docUrls = await uploadDocuments(
          docs as Record<'profilePhoto' | 'degreeCert' | 'regCert' | 'idProof', File | null>
        )

        const body = {
          fullName:           data.fullName,
          email:              data.email,
          phone:              data.phone,
          state:              data.state,
          city:               data.city,
          password:           data.password,
          registrationNumber: data.license,
          experience:         data.experience,
          specialization:     data.specializations.length ? data.specializations : [],
          degrees: [{ degree: data.qualification, institute: '', year: '' }],
          documents: {
            profilePhoto:            docUrls.profilePhoto,
            degreeCertificate:       docUrls.degreeCert,
            registrationCertificate: docUrls.regCert,
            idProof:                 docUrls.idProof,
          },
        }

        await dietitianApi.register(body)
        clearSaved()
        trackEvent('dietitian_onboarding_complete')
        navigate('/dietitian/verification-submitted')
      } catch (err) {
        showToast(
          err instanceof ApiError ? err.message : 'Upload failed. Please try again.',
          'error'
        )
      } finally {
        setUploading(false)
      }
      return
    }

    setErrors({})
    window.scrollTo({ top: 0, behavior: 'smooth' })
    navigate(STEP_PATHS[step + 1])
  }

  const goBack = () => {
    if (step === 1) {
      navigate('/for-dietitians')
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      navigate(STEP_PATHS[step - 1])
    }
  }

  return (
    <div className="jd2-page">

      {/* ── Stepper ── */}
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
          <div className="jd2-card-hd">
            <div className="jd2-card-icon">
              {step === 1
                ? <img src="/jd-step1-icon.png" alt="" style={{ width: 28, height: 28, objectFit: 'contain' }} />
                : step === 2
                ? <i className="fa-solid fa-briefcase" />
                : <i className="fa-solid fa-file-arrow-up" />}
            </div>
            <div>
              <h2 className="jd2-card-title">
                {step === 1 ? 'Basic Information'
                  : step === 2 ? 'Professional Details'
                  : 'Document Upload'}
              </h2>
              <p className="jd2-card-sub">
                {step === 1 ? "Let's start with some basic details"
                  : step === 2 ? 'Tell us about your professional background'
                  : 'Upload your documents for verification'}
              </p>
            </div>
          </div>

          {/* ── Step 1: Basic Information ── */}
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
                      maxLength={10}
                      value={data.phone}
                      onChange={e => set('phone', e.target.value.replace(/\D/g, ''))} />
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
                  <SearchableSelect
                    options={IN_STATES.map(s => ({ value: s.isoCode, label: s.name }))}
                    value={data.stateCode}
                    onChange={code => {
                      const name = IN_STATES.find(s => s.isoCode === code)?.name ?? ''
                      setData(p => ({ ...p, stateCode: code, state: name, city: '' }))
                      setErrors(p => { const n = { ...p }; delete n.state; delete n.city; return n })
                    }}
                    placeholder="Select your state"
                    searchPlaceholder="Search state..."
                    hasError={!!errors.state}
                  />
                  <Err msg={errors.state} />
                </div>
              </div>

              <div className="jd2-row">
                <div className="jd2-field">
                  <label className="jd2-label">City <span className="jd2-req">*</span></label>
                  <SearchableSelect
                    options={cities.map(c => ({ value: c, label: c }))}
                    value={data.city}
                    onChange={city => set('city', city)}
                    placeholder={citiesLoading ? 'Loading cities…' : !data.state ? 'Select a state first' : 'Select your city'}
                    searchPlaceholder="Search city..."
                    disabled={!data.state || citiesLoading}
                    hasError={!!errors.city}
                  />
                  <Err msg={errors.city} />
                </div>
                <div className="jd2-field">
                  <label className="jd2-label">Password <span className="jd2-req">*</span></label>
                  <div className={`jd2-input-wrap${errors.password ? ' err' : ''}`}>
                    <i className="jd2-ico fa-solid fa-lock" />
                    <input className="jd2-input" type={showPassword ? 'text' : 'password'} placeholder="Minimum 8 characters"
                      value={data.password} onChange={e => set('password', e.target.value)} />
                    <button type="button" className="jd2-eye-btn" onClick={() => setShowPassword(p => !p)}>
                      <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
                    </button>
                  </div>
                  <Err msg={errors.password} />
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Professional Details (qualifications only) ── */}
          {step === 2 && (
            <div className="jd2-fields">
              <div className="jd2-row">
                <div className="jd2-field">
                  <label className="jd2-label">
                    Highest Degree <span className="jd2-req">*</span>
                    <span className="jd2-tooltip-wrap">
                      <span className="jd2-tooltip-icon">ℹ</span>
                      <span className="jd2-tooltip-box">
                        Can't find your degree? Choose <strong>"Other"</strong> at the bottom of the list.
                      </span>
                    </span>
                  </label>
                  <SearchableSelect
                    options={DEGREES}
                    value={data.qualification}
                    onChange={v => set('qualification', v)}
                    placeholder="Select your degree"
                    searchPlaceholder="Search degree..."
                    hasError={!!errors.qualification}
                  />
                  <Err msg={errors.qualification} />
                </div>
                <div className="jd2-field">
                  <label className="jd2-label">
                    Registration Number <span className="jd2-req">*</span>
                    <span className="jd2-label-hint">(if not then fill N/A)</span>
                    <span className="jd2-tooltip-wrap">
                      <span className="jd2-tooltip-icon">ℹ</span>
                      <span className="jd2-tooltip-box">
                        Don't have a registration number? Type <strong>N/A</strong>
                      </span>
                    </span>
                  </label>
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
                <div className={`jd2-exp-chips${errors.experience ? ' err' : ''}`}>
                  {EXPERIENCE_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`jd2-exp-chip${data.experience === opt.value ? ' active' : ''}`}
                      onClick={() => set('experience', opt.value)}
                    >
                      <span className="jd2-exp-chip-label">{opt.label}</span>
                      <span className="jd2-exp-chip-sub">{opt.sub}</span>
                    </button>
                  ))}
                </div>
                <Err msg={errors.experience} />
              </div>

              <div className="jd2-field">
                <label className="jd2-label">Specializations <span className="jd2-opt">(if any)</span></label>
                <SpecializationInput
                  value={data.specializations}
                  onChange={v => set('specializations', v)}
                />
              </div>
            </div>
          )}

          {/* ── Step 3: Document Upload ── */}
          {step === 3 && (
            <div className="jd2-fields">
              <div className="jd2-field">
                <label className="jd2-label">Upload Documents <span className="jd2-req">*</span></label>
                <div className="jd2-upload-grid">
                  {([
                    { key: 'profilePhoto', label: 'Profile Photo',             icon: 'fa-regular fa-image',      hint: 'JPG, PNG up\nto 2MB',      required: true  },
                    { key: 'degreeCert',   label: 'Degree Certificate',        icon: 'fa-regular fa-file-lines', hint: 'JPG, PNG, PDF\nup to 5MB', required: false },
                    { key: 'regCert',      label: 'Registration\nCertificate', icon: 'fa-regular fa-file-lines', hint: 'JPG, PNG, PDF\nup to 5MB', required: false },
                    { key: 'idProof',      label: 'ID Proof',                  icon: 'fa-regular fa-id-card',    hint: 'JPG, PNG, PDF\nup to 5MB', required: false },
                  ] as const).map(d => (
                    <div key={d.key} className={`jd2-upload-box${docs[d.key] ? ' uploaded' : ''}`}
                      onClick={() => { if (!docs[d.key]) fileRefs[d.key].current?.click() }}>
                      <input
                        ref={fileRefs[d.key]}
                        type="file"
                        accept={d.key === 'profilePhoto' ? 'image/*' : 'image/*,.pdf'}
                        style={{ display: 'none' }}
                        onChange={async e => {
                          const raw = e.target.files?.[0] ?? null
                          const file = raw && raw.type.startsWith('image/') ? await prepareImageFile(raw) : raw
                          setDocs(p => ({ ...p, [d.key]: file }))
                          if (d.key === 'profilePhoto') setDocError('')
                        }}
                      />
                      <i className={`jd2-upload-icon ${d.icon}`} />
                      <span className="jd2-upload-lbl">
                        {d.label}{d.required && <span className="jd2-req" style={{ marginLeft: 2 }}>*</span>}
                      </span>
                      {docs[d.key] && (
                        <button
                          type="button"
                          className="jd2-upload-remove"
                          onClick={e => {
                            e.stopPropagation()
                            setDocs(p => ({ ...p, [d.key]: null }))
                            if (fileRefs[d.key].current) fileRefs[d.key].current!.value = ''
                          }}
                        >✕</button>
                      )}
                      <span className="jd2-upload-hint">
                        {docs[d.key] ? '✓ ' + docs[d.key]!.name.slice(0, 14) : d.hint}
                      </span>
                    </div>
                  ))}
                </div>
                <Err msg={docError} />
              </div>

              <label className="jd2-check-label" style={{ marginTop: 8 }}>
                <input
                  type="checkbox"
                  checked={data.agreeTerms}
                  onChange={e => set('agreeTerms', e.target.checked)}
                  style={{ accentColor: 'var(--green)', width: 16, height: 16, cursor: 'pointer' }}
                />
                <span style={{ fontSize: 13, color: '#44544b' }}>
                  I agree to the{' '}
                  <a href="/terms-conditions" target="_blank" rel="noopener noreferrer"
                    style={{ color: 'var(--green)', fontWeight: 600 }}>Terms & Conditions</a>
                  {' '}and{' '}
                  <a href="/privacy-policy" target="_blank" rel="noopener noreferrer"
                    style={{ color: 'var(--green)', fontWeight: 600 }}>Privacy Policy</a>
                </span>
              </label>
              <Err msg={errors.agreeTerms} />
            </div>
          )}

          {/* ── Nav buttons ── */}
          <div className="jd2-nav">
            <button className="jd2-back-btn" onClick={goBack}>
              ← {step === 1 ? 'Home' : 'Back'}
            </button>
            <button className="jd2-next-btn" disabled={uploading} onClick={goNext}>
              {uploading ? 'Uploading…' : step === 3 ? 'Submit →' : 'Next →'}
            </button>
          </div>
        </div>

        <p className="jd2-login-note">
          Already have an account?{' '}
          <button type="button" className="jd2-login-link" onClick={() => setLoginOpen(true)}>Login</button>
        </p>
      </div>

      {loginOpen && (
        <AuthModal
          onClose={() => setLoginOpen(false)}
          initialUserType="dietitian"
          initialTab="login"
        />
      )}
    </div>
  )
}
