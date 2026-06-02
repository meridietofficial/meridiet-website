import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { icon: '▪',  label: 'Dashboard'             },
  { icon: '📋', label: 'Consultation Requests' },
  { icon: '👥', label: 'My Clients'            },
  { icon: '📅', label: 'Appointments'          },
  { icon: '🥗', label: 'Diet Plans'            },
  { icon: '💬', label: 'Chat'                  },
  { icon: '🔔', label: 'Follow Ups'            },
  { icon: '📊', label: 'Reports'               },
  { icon: '💰', label: 'Earnings'              },
  { icon: '👛', label: 'Wallet'                },
  { icon: '⭐', label: 'Reviews'               },
  { icon: '👤', label: 'Profile'               },
  { icon: '⚙️', label: 'Settings'              },
]

const TABS = ['Personal Information', 'Professional Information', 'Documents', 'Preferences', 'Security']

const COMPLETION_ITEMS = [
  { label: 'Personal Information',     done: true },
  { label: 'Professional Information', done: true },
  { label: 'Documents',               done: true },
  { label: 'Profile Photo',           done: true },
  { label: 'About Me',                done: true },
]

const AVAILABILITY_INIT = [
  { day: 'Monday',    time: '09:00 AM - 06:00 PM', closed: false },
  { day: 'Tuesday',   time: '09:00 AM - 06:00 PM', closed: false },
  { day: 'Wednesday', time: '09:00 AM - 06:00 PM', closed: false },
  { day: 'Thursday',  time: '09:00 AM - 06:00 PM', closed: false },
  { day: 'Friday',    time: '09:00 AM - 06:00 PM', closed: false },
  { day: 'Saturday',  time: '10:00 AM - 02:00 PM', closed: false },
  { day: 'Sunday',    time: 'Closed',               closed: true  },
]

function CircularProgress({ pct }: { pct: number }) {
  const r = 36, circ = 2 * Math.PI * r, dash = (pct / 100) * circ
  return (
    <svg width="90" height="90" viewBox="0 0 90 90">
      <circle cx="45" cy="45" r={r} fill="none" stroke="#e8f0eb" strokeWidth="8" />
      <circle cx="45" cy="45" r={r} fill="none" stroke="#1E8E3E" strokeWidth="8"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform="rotate(-90 45 45)" />
      <text x="45" y="49" textAnchor="middle" fontSize="15" fontWeight="700" fill="#1E8E3E">{pct}%</text>
    </svg>
  )
}

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button className={`dmp-toggle${on ? ' dmp-toggle--on' : ''}`} onClick={onChange}>
      <span className="dmp-toggle-knob" />
    </button>
  )
}

/* ─── Tab panels ─────────────────────────────────────────── */

function TabPersonal({ user, photoSrc, fileRef, onPhotoChange }: {
  user: any; photoSrc: string | null
  fileRef: React.RefObject<HTMLInputElement>
  onPhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  const initials = user?.full_name
    ? user.full_name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'D'
  const [aboutEdit, setAboutEdit] = useState(false)
  const [aboutText, setAboutText] = useState(
    'I am a passionate and certified clinical dietitian with over 5 years of experience in helping individuals achieve their health and wellness goals through personalized nutrition. I believe in sustainable and realistic diet plans that fit your lifestyle.'
  )

  return (
    <>
      <div className="dmp-left">
        {/* Personal Information */}
        <div className="dmp-card">
          <h3 className="dmp-card-title">Personal Information</h3>
          <div className="dmp-info-grid">
            {[
              { icon: '👤', label: 'Full Name',    val: user?.full_name ?? 'Dr. Neha Sharma' },
              { icon: '✉️', label: 'Email Address', val: user?.email ?? 'neha.sharma@maridiet.com' },
              { icon: '📞', label: 'Phone Number',  val: '+91 98765 43210' },
              { icon: '🎂', label: 'Date of Birth', val: '15 March 1991' },
              { icon: '⚥',  label: 'Gender',        val: 'Female' },
              { icon: '📍', label: 'Address',        val: '123, Green Park, New Delhi, Delhi – 110016, India' },
            ].map(row => (
              <div key={row.label} className="dmp-info-row">
                <span className="dmp-info-icon">{row.icon}</span>
                <span className="dmp-info-label">{row.label}</span>
                <span className="dmp-info-val">{row.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* About Me */}
        <div className="dmp-card">
          <div className="dmp-card-header">
            <h3 className="dmp-card-title">About Me</h3>
            <button className="dmp-edit-link" onClick={() => setAboutEdit(e => !e)}>
              {aboutEdit ? 'Save ✓' : 'Edit ✏️'}
            </button>
          </div>
          {aboutEdit
            ? <textarea className="dmp-about-textarea" value={aboutText} onChange={e => setAboutText(e.target.value)} rows={4} />
            : <p className="dmp-about-text">{aboutText}</p>
          }
        </div>

        {/* Availability */}
        <div className="dmp-card">
          <div className="dmp-card-header">
            <h3 className="dmp-card-title">Availability</h3>
            <button className="dmp-edit-link">Edit Availability</button>
          </div>
          <div className="dmp-avail-grid">
            {AVAILABILITY_INIT.map(a => (
              <div key={a.day} className="dmp-avail-row">
                <span className="dmp-avail-day">{a.day}</span>
                <span className={`dmp-avail-time${a.closed ? ' dmp-avail-closed' : ''}`}>{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dmp-center">
        {/* Profile Photo */}
        <div className="dmp-card">
          <h3 className="dmp-card-title">Profile Photo</h3>
          <div className="dmp-photo-wrap">
            <div className="dmp-photo-circle">
              {photoSrc
                ? <img src={photoSrc} alt="Profile" className="dmp-photo-img" />
                : <span className="dmp-photo-initials">{initials}</span>
              }
            </div>
            <p className="dmp-photo-hint">JPG, PNG or GIF. Max size 2MB.</p>
            <button className="dmp-change-photo-btn" onClick={() => fileRef.current?.click()}>⬆ Change Photo</button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onPhotoChange} />
          </div>
        </div>
      </div>
    </>
  )
}

function TabProfessional() {
  const [specs, setSpecs] = useState(['Weight Management', 'Diabetes Nutrition', 'PCOS Diet', 'Sports Nutrition', 'Child Nutrition'])
  const [newSpec, setNewSpec] = useState('')
  const [qualEdit, setQualEdit] = useState(false)
  const [quals, setQuals] = useState([
    { degree: 'M.Sc. Nutrition & Dietetics', institute: 'AIIMS, New Delhi', year: '2018' },
    { degree: 'B.Sc. Food Science', institute: 'Delhi University', year: '2016' },
    { degree: 'Certified Diabetes Educator (CDE)', institute: 'RSSDI', year: '2020' },
  ])
  const removeSpec = (s: string) => setSpecs(p => p.filter(x => x !== s))
  const addSpec = () => { if (newSpec.trim()) { setSpecs(p => [...p, newSpec.trim()]); setNewSpec('') } }

  return (
    <>
      <div className="dmp-left">
        {/* Qualifications */}
        <div className="dmp-card">
          <div className="dmp-card-header">
            <h3 className="dmp-card-title">Qualifications & Education</h3>
            <button className="dmp-edit-link" onClick={() => setQualEdit(e => !e)}>
              {qualEdit ? 'Done ✓' : 'Edit ✏️'}
            </button>
          </div>
          <div className="dmp-qual-list">
            {quals.map((q, i) => (
              <div key={i} className="dmp-qual-item">
                <span className="dmp-qual-icon">🎓</span>
                <div className="dmp-qual-info">
                  {qualEdit ? (
                    <div className="dmp-qual-edit-row">
                      <input className="dmp-field-input" value={q.degree} onChange={e => setQuals(p => p.map((x, j) => j === i ? { ...x, degree: e.target.value } : x))} placeholder="Degree" />
                      <input className="dmp-field-input" value={q.institute} onChange={e => setQuals(p => p.map((x, j) => j === i ? { ...x, institute: e.target.value } : x))} placeholder="Institute" />
                      <input className="dmp-field-input dmp-field-year" value={q.year} onChange={e => setQuals(p => p.map((x, j) => j === i ? { ...x, year: e.target.value } : x))} placeholder="Year" />
                    </div>
                  ) : (
                    <>
                      <p className="dmp-qual-degree">{q.degree}</p>
                      <p className="dmp-qual-institute">{q.institute} · {q.year}</p>
                    </>
                  )}
                </div>
                {qualEdit && <button className="dmp-remove-btn" onClick={() => setQuals(p => p.filter((_, j) => j !== i))}>✕</button>}
              </div>
            ))}
            {qualEdit && (
              <button className="dmp-add-qual-btn" onClick={() => setQuals(p => [...p, { degree: '', institute: '', year: '' }])}>
                + Add Qualification
              </button>
            )}
          </div>
        </div>

        {/* Specializations */}
        <div className="dmp-card">
          <h3 className="dmp-card-title">Specializations</h3>
          <div className="dmp-spec-tags">
            {specs.map(s => (
              <span key={s} className="dmp-spec-tag">
                {s}
                <button className="dmp-spec-remove" onClick={() => removeSpec(s)}>✕</button>
              </span>
            ))}
          </div>
          <div className="dmp-spec-add-row">
            <input className="dmp-field-input" value={newSpec} onChange={e => setNewSpec(e.target.value)} placeholder="Add specialization..." onKeyDown={e => e.key === 'Enter' && addSpec()} />
            <button className="dmp-spec-add-btn" onClick={addSpec}>Add</button>
          </div>
        </div>

        {/* Awards */}
        <div className="dmp-card">
          <h3 className="dmp-card-title">Awards & Achievements</h3>
          <div className="dmp-award-list">
            {[
              { icon: '🏆', title: 'Best Dietitian Award 2023', org: 'Indian Dietetics Association' },
              { icon: '🥇', title: 'Excellence in Nutrition Research', org: 'AIIMS New Delhi · 2019' },
              { icon: '📜', title: 'Featured in Health Magazine', org: 'Outlook Health · 2022' },
            ].map((a, i) => (
              <div key={i} className="dmp-award-item">
                <span className="dmp-award-icon">{a.icon}</span>
                <div>
                  <p className="dmp-award-title">{a.title}</p>
                  <p className="dmp-award-org">{a.org}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dmp-center">
        {/* Professional Details */}
        <div className="dmp-card">
          <h3 className="dmp-card-title">Professional Details</h3>
          <div className="dmp-info-grid">
            {[
              { icon: '⏱', label: 'Experience',         val: '5+ Years' },
              { icon: '🪪', label: 'Registration No.', val: 'DEL12345' },
              { icon: '🌐', label: 'Languages',        val: 'English, Hindi, Punjabi' },
            ].map(row => (
              <div key={row.label} className="dmp-info-row">
                <span className="dmp-info-icon">{row.icon}</span>
                <span className="dmp-info-label">{row.label}</span>
                <span className="dmp-info-val">{row.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Services Offered */}
        <div className="dmp-card">
          <h3 className="dmp-card-title">Services Offered</h3>
          <div className="dmp-service-list">
            {[
              { icon: '🥗', label: 'Personalised Diet Plans' },
              { icon: '📊', label: 'Body Composition Analysis' },
              { icon: '💊', label: 'Supplement Guidance' },
              { icon: '🧘', label: 'Lifestyle & Wellness Coaching' },
              { icon: '📞', label: 'Follow-up Consultations' },
            ].map(s => (
              <div key={s.label} className="dmp-service-item">
                <span className="dmp-service-icon">{s.icon}</span>
                <span className="dmp-service-label">{s.label}</span>
                <span className="dmp-service-check">✓</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

function TabDocuments() {
  const docs = [
    { id: 'degree',   label: 'Degree Certificate',     icon: '🎓', status: 'verified', uploaded: '12 Jan 2023', filename: 'MSc_Nutrition_Cert.pdf' },
    { id: 'reg',      label: 'Registration Certificate', icon: '📋', status: 'verified', uploaded: '12 Jan 2023', filename: 'IDA_Registration.pdf' },
    { id: 'gov-id',   label: 'Government ID Proof',    icon: '🪪', status: 'verified', uploaded: '12 Jan 2023', filename: 'Aadhar_Card.pdf' },
    { id: 'exp',      label: 'Experience Certificate', icon: '💼', status: 'pending',  uploaded: '01 Mar 2024', filename: 'Experience_Letter.pdf' },
    { id: 'cde',      label: 'Diabetes Educator Cert.', icon: '🏆', status: 'verified', uploaded: '15 Jun 2023', filename: 'CDE_Certificate.pdf' },
    { id: 'photo-id', label: 'Passport Size Photo',    icon: '📸', status: 'not-uploaded', uploaded: '—', filename: '' },
  ]
  const [fileNames, setFileNames] = useState<Record<string, string>>({})

  return (
    <div className="dmp-docs-grid">
      {docs.map(d => (
        <div key={d.id} className="dmp-doc-card">
          <div className="dmp-doc-top">
            <span className="dmp-doc-icon">{d.icon}</span>
            <div className="dmp-doc-info">
              <p className="dmp-doc-label">{d.label}</p>
              <p className="dmp-doc-file">{fileNames[d.id] ?? (d.filename || 'No file uploaded')}</p>
            </div>
            <span className={`dmp-doc-status dmp-doc-status--${d.status}`}>
              {d.status === 'verified' ? '✓ Verified' : d.status === 'pending' ? '⏳ Pending' : '— Not Uploaded'}
            </span>
          </div>
          {d.status !== 'not-uploaded' && (
            <p className="dmp-doc-date">Uploaded: {d.uploaded}</p>
          )}
          <div className="dmp-doc-actions">
            {d.status !== 'not-uploaded' && (
              <button className="dmp-doc-view-btn">👁 View</button>
            )}
            <label className="dmp-doc-upload-btn">
              ⬆ {d.status === 'not-uploaded' ? 'Upload' : 'Replace'}
              <input type="file" style={{ display: 'none' }} onChange={e => {
                const f = e.target.files?.[0]; if (f) setFileNames(p => ({ ...p, [d.id]: f.name }))
              }} />
            </label>
          </div>
        </div>
      ))}
    </div>
  )
}

function TabPreferences() {
  const [notifs, setNotifs] = useState({ email: true, sms: true, whatsapp: true, push: false })
  const [availability, setAvailability] = useState(AVAILABILITY_INIT.map(a => ({ ...a })))

  const toggleDay = (i: number) =>
    setAvailability(p => p.map((a, j) => j === i ? { ...a, closed: !a.closed } : a))

  return (
    <>
      <div className="dmp-left">
        {/* Notification Preferences */}
        <div className="dmp-card">
          <h3 className="dmp-card-title">Notification Preferences</h3>
          <div className="dmp-pref-list">
            {([
              { key: 'email',     label: 'Email Notifications',     desc: 'Receive booking & update emails',         icon: '✉️' },
              { key: 'sms',       label: 'SMS Notifications',       desc: 'Get SMS alerts for appointments',          icon: '💬' },
              { key: 'whatsapp',  label: 'WhatsApp Notifications',  desc: 'Receive updates on WhatsApp',              icon: '📱' },
              { key: 'push',      label: 'Push Notifications',      desc: 'Browser / app push alerts',               icon: '🔔' },
            ] as const).map(n => (
              <div key={n.key} className="dmp-pref-row">
                <span className="dmp-pref-icon">{n.icon}</span>
                <div className="dmp-pref-text">
                  <p className="dmp-pref-label">{n.label}</p>
                  <p className="dmp-pref-desc">{n.desc}</p>
                </div>
                <Toggle on={notifs[n.key]} onChange={() => setNotifs(p => ({ ...p, [n.key]: !p[n.key] }))} />
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="dmp-center">
        {/* Weekly Availability */}
        <div className="dmp-card">
          <h3 className="dmp-card-title">Weekly Availability Settings</h3>
          <div className="dmp-week-avail">
            {availability.map((a, i) => (
              <div key={a.day} className="dmp-week-row">
                <Toggle on={!a.closed} onChange={() => toggleDay(i)} />
                <span className={`dmp-week-day${a.closed ? ' dmp-week-day--off' : ''}`}>{a.day}</span>
                {a.closed
                  ? <span className="dmp-week-closed">Closed</span>
                  : <span className="dmp-week-time">{a.time}</span>
                }
              </div>
            ))}
          </div>
          <button className="dmp-complete-btn" style={{ marginTop: 14 }}>Save Availability</button>
        </div>
      </div>
    </>
  )
}

function TabSecurity() {
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew]         = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pwForm, setPwForm]           = useState({ current: '', next: '', confirm: '' })
  const [pwStrength, setPwStrength]   = useState(0)

  const calcStrength = (pw: string) => {
    let s = 0
    if (pw.length >= 8) s++
    if (/[A-Z]/.test(pw)) s++
    if (/[0-9]/.test(pw)) s++
    if (/[^A-Za-z0-9]/.test(pw)) s++
    return s
  }

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const strengthColor = ['', '#e53935', '#f4842c', '#FBC02D', '#1E8E3E']

  return (
    <div className="dmp-left">
      {/* Change Password */}
      <div className="dmp-card">
        <h3 className="dmp-card-title">Change Password</h3>
        <div className="dmp-pw-form">
          {([
            { key: 'current', label: 'Current Password', show: showCurrent, toggle: () => setShowCurrent(p => !p) },
            { key: 'next',    label: 'New Password',     show: showNew,     toggle: () => setShowNew(p => !p)     },
            { key: 'confirm', label: 'Confirm Password', show: showConfirm, toggle: () => setShowConfirm(p => !p) },
          ] as const).map(f => (
            <div key={f.key} className="dmp-pw-field">
              <label className="dmp-pw-label">{f.label}</label>
              <div className="dmp-pw-input-wrap">
                <input
                  type={f.show ? 'text' : 'password'}
                  className="dmp-field-input"
                  value={pwForm[f.key]}
                  placeholder={f.key === 'current' ? 'Enter current password' : f.key === 'next' ? 'Min. 8 characters' : 'Re-enter new password'}
                  onChange={e => {
                    setPwForm(p => ({ ...p, [f.key]: e.target.value }))
                    if (f.key === 'next') setPwStrength(calcStrength(e.target.value))
                  }}
                />
                <button className="dmp-pw-eye" onClick={f.toggle}>{f.show ? '🙈' : '👁'}</button>
              </div>
              {f.key === 'next' && pwForm.next && (
                <div className="dmp-strength-bar-row">
                  {[1, 2, 3, 4].map(n => (
                    <div key={n} className="dmp-strength-seg" style={{ background: n <= pwStrength ? strengthColor[pwStrength] : '#e8f0eb' }} />
                  ))}
                  <span className="dmp-strength-txt" style={{ color: strengthColor[pwStrength] }}>{strengthLabel[pwStrength]}</span>
                </div>
              )}
            </div>
          ))}
          <p className="dmp-pw-rules">Password must be 8+ characters with uppercase, numbers, and symbols.</p>
          <button className="dmp-complete-btn">Update Password</button>
        </div>
      </div>
    </div>
  )
}

/* ─── Edit Profile Drawer ────────────────────────────────── */

interface BannerProfile {
  name: string; title: string; degree: string
  experience: string; licenseNo: string; languages: string
}

function EditProfileDrawer({
  open, profile, onSave, onClose,
}: {
  open: boolean
  profile: BannerProfile
  onSave: (p: BannerProfile) => void
  onClose: () => void
}) {
  const [form, setForm] = useState<BannerProfile>(profile)
  // reset form when drawer re-opens
  const prevOpen = useRef(false)
  if (open && !prevOpen.current) { setForm(profile) }
  prevOpen.current = open

  const set = (key: keyof BannerProfile) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [key]: e.target.value }))

  const FIELDS: { key: keyof BannerProfile; label: string; icon: string; placeholder: string }[] = [
    { key: 'name',       label: 'Full Name',            icon: '👤', placeholder: 'Dr. Neha Sharma'           },
    { key: 'title',      label: 'Designation / Title',  icon: '💼', placeholder: 'Clinical Dietitian'         },
    { key: 'degree',     label: 'Qualification',        icon: '🎓', placeholder: 'M.Sc. Nutrition & Dietetics' },
    { key: 'experience', label: 'Years of Experience',  icon: '⏱', placeholder: '5+ Years'                   },
    { key: 'licenseNo',  label: 'Registration / License No.', icon: '🪪', placeholder: 'DEL12345'            },
    { key: 'languages',  label: 'Languages',            icon: '🌐', placeholder: 'English, Hindi'             },
  ]

  if (!open) return null

  return (
    <>
      <div className="dmp-drawer-backdrop" onClick={onClose} />
      <div className="dmp-drawer">
        <div className="dmp-drawer-header">
          <h3 className="dmp-drawer-title">Edit Profile</h3>
          <button className="dmp-drawer-close" onClick={onClose}>✕</button>
        </div>

        <div className="dmp-drawer-body">
          <p className="dmp-drawer-desc">Update your public profile information visible to clients.</p>

          <div className="dmp-drawer-fields">
            {FIELDS.map(f => (
              <div key={f.key} className="dmp-drawer-field">
                <label className="dmp-drawer-label">
                  <span className="dmp-drawer-label-icon">{f.icon}</span>
                  {f.label}
                </label>
                <input
                  className="dmp-field-input"
                  value={form[f.key]}
                  placeholder={f.placeholder}
                  onChange={set(f.key)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="dmp-drawer-footer">
          <button className="dmp-drawer-cancel" onClick={onClose}>Cancel</button>
          <button className="dmp-complete-btn dmp-drawer-save" onClick={() => { onSave(form); onClose() }}>
            Save Changes
          </button>
        </div>
      </div>
    </>
  )
}

/* ─── Main component ─────────────────────────────────────── */

export default function DietitianMyProfile() {
  const { user, clearAuth } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Personal Information')
  const [activeNav, setActiveNav] = useState('Profile')
  const [photoSrc, setPhotoSrc] = useState<string | null>(null)
  const [editProfileOpen, setEditProfileOpen] = useState(false)
  const [bannerProfile, setBannerProfile] = useState<BannerProfile>({
    name:       user?.full_name ?? 'Dr. Neha Sharma',
    title:      'Clinical Dietitian',
    degree:     'M.Sc. Nutrition & Dietetics',
    experience: '5+ Years',
    licenseNo:  'DEL12345',
    languages:  'English, Hindi',
  })
  const fileRef = useRef<HTMLInputElement>(null)

  const initials = bannerProfile.name
    ? bannerProfile.name.split(' ').filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : 'D'

  const handleLogout = () => { clearAuth(); navigate('/') }
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (file) setPhotoSrc(URL.createObjectURL(file))
  }
  const handleNavClick = (label: string) => {
    setActiveNav(label)
    if (label === 'Dashboard') navigate('/dietitian-dashboard')
  }

  return (
    <div className="dd-root">

      {/* ── Sidebar ── */}
      <aside className="dd-sidebar">
        <div className="dd-sidebar-logo">
          <Link to="/dietitian-dashboard">
            <img src="/logo-header.png" alt="MeriDiet" className="dd-logo-img" />
          </Link>
          <p className="dd-logo-sub">Dietitian Dashboard</p>
        </div>
        <div className="dd-sidebar-scroll">
          <nav className="dd-nav">
            {NAV_ITEMS.map(item => (
              <button
                key={item.label}
                className={`dd-nav-item${activeNav === item.label ? ' dd-nav-item--active' : ''}`}
                onClick={() => handleNavClick(item.label)}
              >
                <span className="dd-nav-icon">{item.icon}</span>
                <span className="dd-nav-label">{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="dd-refer-card">
            <p className="dd-refer-title">Refer &amp; Earn</p>
            <p className="dd-refer-desc">Invite fellow dietitians and earn exciting rewards.</p>
            <button className="dd-refer-btn">Refer Now →</button>
          </div>
          <button className="dd-help-link">❓ Need Help?</button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="dd-main dmp-main">

        {/* Top bar */}
        <header className="dd-topbar">
          <div className="dd-topbar-left">
            <p className="dd-welcome">My</p>
            <h1 className="dd-welcome-name">Profile</h1>
          </div>
          <div className="dd-topbar-right">
            <button className="dd-notif-btn">🔔<span className="dd-notif-badge">2</span></button>
            <div className="dd-user-chip">
              <div className="dd-user-avatar">{initials}</div>
              <span className="dd-user-name">{user?.full_name ?? 'Dietitian'}</span>
              <span className="dd-user-chevron">▾</span>
              <div className="dd-user-dropdown">
                <button className="dd-dropdown-item" onClick={handleLogout}>Logout</button>
              </div>
            </div>
          </div>
        </header>

        {/* ── Profile banner ── */}
        <div className="dmp-banner">
          <div className="dmp-banner-left">
            <div className="dmp-banner-avatar">
              {photoSrc
                ? <img src={photoSrc} alt="Profile" className="dmp-banner-avatar-img" />
                : <span className="dmp-banner-avatar-initials">{initials}</span>
              }
              <button className="dmp-avatar-edit-btn" onClick={() => fileRef.current?.click()}>✏️</button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
            </div>
            <div className="dmp-banner-info">
              <div className="dmp-banner-name-row">
                <h2 className="dmp-banner-name">{bannerProfile.name}</h2>
                <span className="dmp-verified-badge">✓ Verified</span>
              </div>
              <p className="dmp-banner-title">{bannerProfile.title}</p>
              <p className="dmp-banner-degree">{bannerProfile.degree}</p>
              <div className="dmp-banner-meta">
                <span>⏱ {bannerProfile.experience} Experience</span>
                <span>🪪 {bannerProfile.licenseNo}</span>
                <span>🌐 {bannerProfile.languages}</span>
              </div>
            </div>
          </div>
          <button className="dmp-edit-profile-btn" onClick={() => setEditProfileOpen(true)}>✏️ Edit Profile</button>
        </div>

        {/* ── Edit Profile Drawer ── */}
        <EditProfileDrawer
          open={editProfileOpen}
          profile={bannerProfile}
          onSave={setBannerProfile}
          onClose={() => setEditProfileOpen(false)}
        />

        {/* ── Tabs ── */}
        <div className="dmp-tabs">
          {TABS.map(tab => (
            <button
              key={tab}
              className={`dmp-tab${activeTab === tab ? ' dmp-tab--active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── Body ── */}
        <div className={`dmp-body${activeTab === 'Documents' ? ' dmp-body--docs' : ''}`}>

          {/* Main area — changes by tab */}
          {activeTab === 'Personal Information'     && <TabPersonal user={user} photoSrc={photoSrc} fileRef={fileRef} onPhotoChange={handlePhotoChange} />}
          {activeTab === 'Professional Information' && <TabProfessional />}
          {activeTab === 'Documents'                && <TabDocuments />}
          {activeTab === 'Preferences'              && <TabPreferences />}
          {activeTab === 'Security'                 && <TabSecurity />}

          {/* ── Right sidebar (always visible) ── */}
          {activeTab !== 'Documents' && (
            <aside className="dmp-right">
              <div className="dmp-card">
                <h3 className="dmp-card-title">Profile Completion</h3>
                <div className="dmp-completion-row">
                  <CircularProgress pct={85} />
                  <p className="dmp-completion-msg">Great Job! Your profile is almost complete.</p>
                </div>
                <div className="dmp-completion-list">
                  {COMPLETION_ITEMS.map(item => (
                    <div key={item.label} className="dmp-completion-item">
                      <span className={`dmp-completion-check${item.done ? ' dmp-completion-check--done' : ''}`}>
                        {item.done ? '✓' : '○'}
                      </span>
                      <span className="dmp-completion-label">{item.label}</span>
                    </div>
                  ))}
                </div>
                <button className="dmp-complete-btn">Complete Your Profile</button>
              </div>

              <div className="dmp-card">
                <h3 className="dmp-card-title">Professional Summary</h3>
                <div className="dmp-summary-list">
                  {[
                    { icon: '👥', label: 'Total Clients',       val: '68'    },
                    { icon: '📅', label: 'Total Consultations', val: '156'   },
                    { icon: '📋', label: 'Diet Plans Created',  val: '128'   },
                    { icon: '⭐', label: 'Average Rating',       val: '4.8/5' },
                  ].map(s => (
                    <div key={s.label} className="dmp-summary-row">
                      <span className="dmp-summary-icon">{s.icon}</span>
                      <span className="dmp-summary-label">{s.label}</span>
                      <span className="dmp-summary-val">{s.val}</span>
                    </div>
                  ))}
                </div>
                <button className="dmp-reports-link">View Reports &amp; Earnings →</button>
              </div>

              <div className="dmp-card">
                <h3 className="dmp-card-title">Account Details</h3>
                <div className="dmp-account-list">
                  <div className="dmp-account-row">
                    <span className="dmp-account-icon">📅</span>
                    <span className="dmp-account-label">Member Since</span>
                    <span className="dmp-account-val">10 Jan 2023</span>
                  </div>
                  <div className="dmp-account-row">
                    <span className="dmp-account-icon">🪪</span>
                    <span className="dmp-account-label">Account Type</span>
                    <span className="dmp-account-val">Dietitian</span>
                  </div>
                  <div className="dmp-account-row">
                    <span className="dmp-account-icon">ℹ️</span>
                    <span className="dmp-account-label">Account Status</span>
                    <span className="dmp-account-val dmp-status-active">Active</span>
                  </div>
                </div>
                <button className="dmp-deactivate-btn">🗑 Deactivate Account</button>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  )
}
