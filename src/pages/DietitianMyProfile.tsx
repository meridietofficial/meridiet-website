import { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import dietitianApi, { uploadSingleDocument, deleteDocument, type DietitianProfile } from '../api/dietitian'
import { ApiError } from '../api/client'
import accountsApi, { LinkedAccount } from '../api/accounts'
import banksApi, { Bank } from '../api/banks'
import SearchableSelect from '../components/SearchableSelect'
import SpecializationInput from '../components/SpecializationInput'
import { IN_STATES } from '../data/indiaCities'

/* ─── Helpers ────────────────────────────────────────────── */
/* Normalize any backend date/datetime to a calendar date 'YYYY-MM-DD'.
 * A DOB is a pure calendar date, but the backend round-trips it as a
 * timezone-shifted timestamp (e.g. "1993-06-12T18:30:00.000Z" for an IST
 * 13 Jun). Slicing the UTC portion would lose a day, so we read the LOCAL
 * date parts — the same way it was entered — which keeps the day stable. */
const toDateInput = (value: string | null | undefined): string => {
  if (!value) return ''
  // Already a plain date — use verbatim, never touch Date()/timezones.
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const d = new Date(value)
  if (isNaN(d.getTime())) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const fmtDate = (value: string | null | undefined) => {
  const iso = toDateInput(value)
  if (!iso) return '—'
  // Build from parts at LOCAL midnight so formatting never shifts the day.
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const orDash = (v: string | null | undefined) => (v && v.trim() ? v : '—')

/* Compute profile-completion checklist + percentage from real data */
function getCompletion(p: DietitianProfile | null) {
  const has = (v: unknown) => typeof v === 'string' ? v.trim().length > 0 : !!v
  const items = [
    {
      label: 'Personal Information', tab: 'Personal Information',
      done: !!p && has(p.full_name) && has(p.email) && has(p.phone_number) &&
            has(p.date_of_birth) && has(p.gender) && has(p.state) && has(p.city),
    },
    {
      label: 'Professional Information', tab: 'Professional Information',
      done: !!p && has(p.experience) && has(p.registration_number) &&
            (p.specialization?.length ?? 0) > 0 && (p.degrees?.length ?? 0) > 0,
    },
    {
      label: 'Documents', tab: 'Documents',
      done: !!p && has(p.documents.degree_certificate) &&
            has(p.documents.registration_certificate) && has(p.documents.id_proof),
    },
    { label: 'Profile Photo', tab: 'Documents', done: !!p && (has(p.documents.profile_photo) || has(p.avatar_url)) },
    { label: 'About Me',      tab: 'Personal Information', done: !!p && has(p.bio) },
  ]
  const doneCount = items.filter(i => i.done).length
  const pct = Math.round((doneCount / items.length) * 100)
  const message = pct === 100
    ? 'Excellent! Your profile is complete.'
    : pct >= 60
    ? 'Great job! Your profile is almost complete.'
    : "Let's complete your profile to get started."
  const firstIncompleteTab = items.find(i => !i.done)?.tab ?? 'Personal Information'
  return { items, pct, message, firstIncompleteTab }
}

/* Shared save helper — PUTs a partial profile, refreshes parent, toasts result */
function useProfileSave(onSaved: (p: DietitianProfile) => void) {
  const { showToast } = useToast()
  const [saving, setSaving] = useState(false)
  const save = async (body: Record<string, unknown>): Promise<boolean> => {
    setSaving(true)
    try {
      const updated = await dietitianApi.updateProfile(body)
      onSaved(updated)
      showToast('Profile updated successfully.', 'success')
      return true
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not update profile.', 'error')
      return false
    } finally {
      setSaving(false)
    }
  }
  return { saving, save }
}

/* ── Availability day → API key map ── */
const DAY_KEYS = [
  { day: 'Monday', key: 'mon' }, { day: 'Tuesday', key: 'tue' },
  { day: 'Wednesday', key: 'wed' }, { day: 'Thursday', key: 'thu' },
  { day: 'Friday', key: 'fri' }, { day: 'Saturday', key: 'sat' },
  { day: 'Sunday', key: 'sun' },
] as const

// "09:00" → "09:00 AM"
const to12hLabel = (hhmm: string): string => {
  const [h, m] = hhmm.split(':').map(Number)
  if (Number.isNaN(h)) return hhmm
  const ap = h >= 12 ? 'PM' : 'AM'
  return `${String(h % 12 || 12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ap}`
}

const TABS = ['Personal Information', 'Professional Information', 'Documents', 'Preferences', 'Bank Information', 'Security']

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

function TabPersonal({ profile, photoSrc, fileRef, onPhotoChange, onSaved, photoUploading }: {
  profile: DietitianProfile | null; photoSrc: string | null
  fileRef: React.RefObject<HTMLInputElement>
  onPhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSaved: (p: DietitianProfile) => void
  photoUploading: boolean
}) {
  const { save } = useProfileSave(onSaved)

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'D'
  const [aboutEdit, setAboutEdit] = useState(false)
  const [aboutSaving, setAboutSaving] = useState(false)
  const [saving, setSaving] = useState(false)
  const [aboutText, setAboutText] = useState('')
  useEffect(() => { setAboutText(profile?.bio ?? '') }, [profile?.bio])

  const handleEditSave = async () => {
    if (!personalEdit) { setPersonalEdit(true); return }
    setSaving(true)
    const ok = await save({
      dateOfBirth: form.date_of_birth || null,
      gender:      form.gender || null,
      state:       form.state || null,
      city:        form.city || null,
    })
    setSaving(false)
    if (ok) setPersonalEdit(false)
  }

  const handleAboutSave = async () => {
    if (!aboutEdit) { setAboutEdit(true); return }
    setAboutSaving(true)
    const ok = await save({ bio: aboutText || null })
    setAboutSaving(false)
    if (ok) setAboutEdit(false)
  }

  // ── Personal info editable form ──
  const emptyPersonal = {
    full_name: '', email: '', phone_code: '', phone_number: '',
    date_of_birth: '', gender: '', state: '', city: '',
  }
  const [personalEdit, setPersonalEdit] = useState(false)
  const [form, setForm] = useState(emptyPersonal)
  const [stateCode, setStateCode] = useState('')
  const [cities, setCities] = useState<string[]>([])
  const [citiesLoading, setCitiesLoading] = useState(false)
  useEffect(() => {
    if (!profile) return
    setForm({
      full_name:     profile.full_name ?? '',
      email:         profile.email ?? '',
      phone_code:    profile.phone_code ?? '',
      phone_number:  profile.phone_number ?? '',
      date_of_birth: toDateInput(profile.date_of_birth),
      gender:        profile.gender ?? '',
      state:         profile.state ?? '',
      city:          profile.city ?? '',
    })
    setStateCode(IN_STATES.find(s => s.name === profile.state)?.isoCode ?? '')
  }, [profile])

  // Load cities whenever the selected state changes (same as registration form)
  useEffect(() => {
    if (!form.state) { setCities([]); return }
    setCitiesLoading(true)
    fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country: 'India', state: form.state }),
    })
      .then(r => r.json())
      .then(res => { if (!res.error) setCities(res.data ?? []) })
      .catch(() => {})
      .finally(() => setCitiesLoading(false))
  }, [form.state])

  const setField = (k: keyof typeof emptyPersonal, v: string) =>
    setForm(p => ({ ...p, [k]: v }))

  const phoneDisplay = form.phone_number
    ? `${form.phone_code} ${form.phone_number}`.trim()
    : '—'

  const PERSONAL_ROWS = [
    { key: 'full_name',     label: 'Full Name',     icon: 'fa-regular fa-user',          type: 'text',   editable: false, display: orDash(form.full_name) },
    { key: 'email',         label: 'Email Address', icon: 'fa-regular fa-envelope',      type: 'email',  editable: false, display: orDash(form.email) },
    { key: 'phone_number',  label: 'Phone Number',  icon: 'fa-solid fa-phone',           type: 'tel',    editable: false, display: phoneDisplay },
    { key: 'date_of_birth', label: 'Date of Birth', icon: 'fa-regular fa-calendar',      type: 'date',   editable: true,  display: fmtDate(form.date_of_birth) },
    { key: 'gender',        label: 'Gender',        icon: 'fa-solid fa-venus-mars',      type: 'select', editable: true,  display: orDash(form.gender) },
    { key: 'state',         label: 'State',         icon: 'fa-solid fa-map-location-dot', type: 'text',  editable: true,  display: orDash(form.state) },
    { key: 'city',          label: 'City',          icon: 'fa-solid fa-location-dot',    type: 'text',   editable: true,  display: orDash(form.city) },
  ] as const

  return (
    <>
      <div className="dmp-left">
        {/* Personal Information */}
        <div className="dmp-card">
          <div className="dmp-card-header">
            <h3 className="dmp-card-title">Personal Information</h3>
            <button className="dmp-edit-link" disabled={saving} onClick={handleEditSave}>
              {saving
                ? <><i className="fa-solid fa-spinner fa-spin" /> Saving…</>
                : personalEdit
                ? <><i className="fa-solid fa-check" /> Save</>
                : <><i className="fa-solid fa-pen" /> Edit</>}
            </button>
          </div>
          <div className="dmp-info-grid">
            {PERSONAL_ROWS.map(row => (
              <div key={row.key} className="dmp-info-row">
                <span className="dmp-info-icon"><i className={row.icon} /></span>
                <span className="dmp-info-label">{row.label}</span>
                {personalEdit && row.editable ? (
                  row.key === 'state' ? (
                    <SearchableSelect
                      options={IN_STATES.map(s => ({ value: s.isoCode, label: s.name }))}
                      value={stateCode}
                      onChange={code => {
                        const name = IN_STATES.find(s => s.isoCode === code)?.name ?? ''
                        setStateCode(code)
                        setForm(p => ({ ...p, state: name, city: '' }))
                      }}
                      placeholder="Select your state"
                      searchPlaceholder="Search state..."
                    />
                  ) : row.key === 'city' ? (
                    <SearchableSelect
                      options={cities.map(c => ({ value: c, label: c }))}
                      value={form.city}
                      onChange={city => setField('city', city)}
                      placeholder={citiesLoading ? 'Loading cities…' : !form.state ? 'Select a state first' : 'Select your city'}
                      searchPlaceholder="Search city..."
                      disabled={!form.state || citiesLoading}
                    />
                  ) : row.type === 'select' ? (
                    <select
                      className="dmp-field-input dmp-info-input"
                      value={form.gender}
                      onChange={e => setField('gender', e.target.value)}
                    >
                      <option value="">Select…</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <input
                      className="dmp-field-input dmp-info-input"
                      type={row.type}
                      value={form[row.key]}
                      onChange={e => setField(row.key, e.target.value)}
                    />
                  )
                ) : (
                  <span className="dmp-info-val">{row.display}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* About Me */}
        <div className="dmp-card">
          <div className="dmp-card-header">
            <h3 className="dmp-card-title">About Me</h3>
            <button className="dmp-edit-link" disabled={aboutSaving} onClick={handleAboutSave}>
              {aboutSaving
                ? <><i className="fa-solid fa-spinner fa-spin" /> Saving…</>
                : aboutEdit
                ? <><i className="fa-solid fa-check" /> Save</>
                : <><i className="fa-solid fa-pen" /> Edit</>}
            </button>
          </div>
          {aboutEdit
            ? <textarea className="dmp-about-textarea" value={aboutText} onChange={e => setAboutText(e.target.value)} rows={4} />
            : <p className="dmp-about-text">{aboutText || 'No bio added yet.'}</p>
          }
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
            <button className="dmp-change-photo-btn" disabled={photoUploading} onClick={() => fileRef.current?.click()}>
              {photoUploading
                ? <><i className="fa-solid fa-spinner fa-spin" /> Uploading…</>
                : <><i className="fa-solid fa-upload" /> Change Photo</>}
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onPhotoChange} />
          </div>
        </div>
      </div>
    </>
  )
}

function TabProfessional({ profile, onSaved }: { profile: DietitianProfile | null; onSaved: (p: DietitianProfile) => void }) {
  const { save } = useProfileSave(onSaved)
  const [specs, setSpecs] = useState<string[]>([])
  const [specsSaving, setSpecsSaving] = useState(false)
  const [qualEdit, setQualEdit] = useState(false)
  const [qualSaving, setQualSaving] = useState(false)
  const [quals, setQuals] = useState<{ degree: string; institute: string; year: string }[]>([])

  // Awards
  const [awards, setAwards] = useState<{ title: string; organization: string; year: string }[]>([])
  const [awardsEdit, setAwardsEdit] = useState(false)
  const [awardsSaving, setAwardsSaving] = useState(false)

  // Professional details (experience + languages; registration number editable only when missing/N/A)
  const [detailsEdit, setDetailsEdit] = useState(false)
  const [detailsSaving, setDetailsSaving] = useState(false)
  const [experience, setExperience] = useState('')
  const [languages, setLanguages] = useState('')
  const [registration, setRegistration] = useState('')

  // Services
  const [services, setServices] = useState<string[]>([])
  const [newService, setNewService] = useState('')
  const [servicesEdit, setServicesEdit] = useState(false)
  const [servicesSaving, setServicesSaving] = useState(false)

  useEffect(() => {
    if (!profile) return
    setSpecs(profile.specialization ?? [])
    setQuals((profile.degrees ?? []).map(d => ({
      degree: d.degree ?? '', institute: d.institute ?? '', year: d.year ?? '',
    })))
    setAwards((profile.awards ?? []).map(a => ({
      title: a.title ?? '', organization: a.organization ?? '', year: a.year ?? '',
    })))
    setExperience(profile.experience ?? '')
    setLanguages((profile.languages ?? []).join(', '))
    setRegistration(profile.registration_number ?? '')
    setServices(profile.services ?? [])
  }, [profile])

  const EXPERIENCE_RANGES = ['Less than 1 year', '1 – 3 years', '3 – 5 years', '5 – 10 years', '10+ years']
  const experienceOptions = Array.from(new Set([...EXPERIENCE_RANGES, experience].filter(Boolean)))

  // Registration number is editable only when it's empty or a placeholder like "N/A"
  const reg = profile?.registration_number?.trim() ?? ''
  const canEditReg = reg === '' || reg.toLowerCase() === 'n/a'

  const handleSpecsSave = async () => {
    setSpecsSaving(true)
    await save({ specialization: specs })
    setSpecsSaving(false)
  }

  const handleQualSave = async () => {
    if (!qualEdit) { setQualEdit(true); return }
    setQualSaving(true)
    const cleaned = quals
      .filter(q => q.degree.trim())
      .map(q => ({ degree: q.degree.trim(), institute: q.institute.trim(), year: q.year.trim() }))
    const ok = await save({ degrees: cleaned })
    setQualSaving(false)
    if (ok) setQualEdit(false)
  }

  const handleAwardsSave = async () => {
    if (!awardsEdit) { setAwardsEdit(true); return }
    setAwardsSaving(true)
    const cleaned = awards
      .filter(a => a.title.trim())
      .map(a => ({ title: a.title.trim(), organization: a.organization.trim(), year: a.year.trim() }))
    const ok = await save({ awards: cleaned })
    setAwardsSaving(false)
    if (ok) setAwardsEdit(false)
  }

  const handleDetailsSave = async () => {
    if (!detailsEdit) { setDetailsEdit(true); return }
    setDetailsSaving(true)
    const langs = languages.split(',').map(l => l.trim()).filter(Boolean)
    const body: Record<string, unknown> = { experience: experience || null, languages: langs }
    if (canEditReg) body.registrationNumber = registration.trim() || null
    const ok = await save(body)
    setDetailsSaving(false)
    if (ok) setDetailsEdit(false)
  }

  const addService = () => {
    if (newService.trim()) { setServices(p => [...p, newService.trim()]); setNewService('') }
  }
  const handleServicesSave = async () => {
    if (!servicesEdit) { setServicesEdit(true); return }
    setServicesSaving(true)
    const ok = await save({ services: services.map(s => s.trim()).filter(Boolean) })
    setServicesSaving(false)
    if (ok) setServicesEdit(false)
  }

  return (
    <>
      <div className="dmp-left">
        {/* Qualifications */}
        <div className="dmp-card">
          <div className="dmp-card-header">
            <h3 className="dmp-card-title">Qualifications & Education</h3>
            <button className="dmp-edit-link" disabled={qualSaving} onClick={handleQualSave}>
              {qualSaving
                ? <><i className="fa-solid fa-spinner fa-spin" /> Saving…</>
                : qualEdit
                ? <><i className="fa-solid fa-check" /> Done</>
                : <><i className="fa-solid fa-pen" /> Edit</>}
            </button>
          </div>
          <div className="dmp-qual-list">
            {!quals.length && !qualEdit && <p className="dmp-empty-hint">No qualifications added yet.</p>}
            {quals.map((q, i) => (
              <div key={i} className="dmp-qual-item">
                <span className="dmp-qual-icon"><i className="fa-solid fa-graduation-cap" /></span>
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
                      {(q.institute || q.year) && (
                        <p className="dmp-qual-institute">{[q.institute, q.year].filter(Boolean).join(' · ')}</p>
                      )}
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
          <div className="dmp-card-header">
            <h3 className="dmp-card-title">Specializations</h3>
            <button className="dmp-edit-link" disabled={specsSaving} onClick={handleSpecsSave}>
              {specsSaving
                ? <><i className="fa-solid fa-spinner fa-spin" /> Saving…</>
                : <><i className="fa-solid fa-check" /> Save</>}
            </button>
          </div>
          <SpecializationInput value={specs} onChange={setSpecs} />
        </div>

        {/* Awards */}
        <div className="dmp-card">
          <div className="dmp-card-header">
            <h3 className="dmp-card-title">Awards & Achievements</h3>
            <button className="dmp-edit-link" disabled={awardsSaving} onClick={handleAwardsSave}>
              {awardsSaving
                ? <><i className="fa-solid fa-spinner fa-spin" /> Saving…</>
                : awardsEdit
                ? <><i className="fa-solid fa-check" /> Done</>
                : <><i className="fa-solid fa-pen" /> Edit</>}
            </button>
          </div>
          <div className="dmp-award-list">
            {!awards.length && !awardsEdit && <p className="dmp-empty-hint">No awards added yet.</p>}
            {awards.map((a, i) => (
              <div key={i} className="dmp-award-item">
                <span className="dmp-award-icon"><i className="fa-solid fa-trophy" /></span>
                <div style={{ flex: 1 }}>
                  {awardsEdit ? (
                    <div className="dmp-qual-edit-row">
                      <input className="dmp-field-input" value={a.title} placeholder="Award title"
                        onChange={e => setAwards(p => p.map((x, j) => j === i ? { ...x, title: e.target.value } : x))} />
                      <input className="dmp-field-input" value={a.organization} placeholder="Organization"
                        onChange={e => setAwards(p => p.map((x, j) => j === i ? { ...x, organization: e.target.value } : x))} />
                      <input className="dmp-field-input dmp-field-year" value={a.year} placeholder="Year"
                        onChange={e => setAwards(p => p.map((x, j) => j === i ? { ...x, year: e.target.value } : x))} />
                    </div>
                  ) : (
                    <>
                      <p className="dmp-award-title">{a.title || '—'}</p>
                      {(a.organization || a.year) && (
                        <p className="dmp-award-org">{[a.organization, a.year].filter(Boolean).join(' · ')}</p>
                      )}
                    </>
                  )}
                </div>
                {awardsEdit && <button className="dmp-remove-btn" onClick={() => setAwards(p => p.filter((_, j) => j !== i))}>✕</button>}
              </div>
            ))}
            {awardsEdit && (
              <button className="dmp-add-qual-btn" onClick={() => setAwards(p => [...p, { title: '', organization: '', year: '' }])}>
                + Add Award
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="dmp-center">
        {/* Professional Details */}
        <div className="dmp-card">
          <div className="dmp-card-header">
            <h3 className="dmp-card-title">Professional Details</h3>
            <button className="dmp-edit-link" disabled={detailsSaving} onClick={handleDetailsSave}>
              {detailsSaving
                ? <><i className="fa-solid fa-spinner fa-spin" /> Saving…</>
                : detailsEdit
                ? <><i className="fa-solid fa-check" /> Save</>
                : <><i className="fa-solid fa-pen" /> Edit</>}
            </button>
          </div>
          <div className="dmp-info-grid">
            <div className="dmp-info-row">
              <span className="dmp-info-icon"><i className="fa-solid fa-clock" /></span>
              <span className="dmp-info-label">Experience</span>
              {detailsEdit ? (
                <select className="dmp-field-input dmp-info-input" value={experience} onChange={e => setExperience(e.target.value)}>
                  <option value="">Select…</option>
                  {experienceOptions.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              ) : (
                <span className="dmp-info-val">{orDash(profile?.experience)}</span>
              )}
            </div>
            <div className="dmp-info-row">
              <span className="dmp-info-icon"><i className="fa-solid fa-id-card" /></span>
              <span className="dmp-info-label">Registration No.</span>
              {detailsEdit && canEditReg ? (
                <input className="dmp-field-input dmp-info-input" value={registration} placeholder="Enter registration number"
                  onChange={e => setRegistration(e.target.value)} />
              ) : (
                <span className="dmp-info-val">{orDash(profile?.registration_number)}</span>
              )}
            </div>
            <div className="dmp-info-row">
              <span className="dmp-info-icon"><i className="fa-solid fa-language" /></span>
              <span className="dmp-info-label">Languages</span>
              {detailsEdit ? (
                <input className="dmp-field-input dmp-info-input" value={languages} placeholder="English, Hindi, Marathi"
                  onChange={e => setLanguages(e.target.value)} />
              ) : (
                <span className="dmp-info-val">{profile?.languages?.length ? profile.languages.join(', ') : '—'}</span>
              )}
            </div>
          </div>
          {detailsEdit && (
            <p className="dmp-empty-hint">
              Separate languages with commas.{!canEditReg && ' Registration number can\'t be changed once verified.'}
            </p>
          )}
        </div>

        {/* Services Offered */}
        <div className="dmp-card">
          <div className="dmp-card-header">
            <h3 className="dmp-card-title">Services Offered</h3>
            <button className="dmp-edit-link" disabled={servicesSaving} onClick={handleServicesSave}>
              {servicesSaving
                ? <><i className="fa-solid fa-spinner fa-spin" /> Saving…</>
                : servicesEdit
                ? <><i className="fa-solid fa-check" /> Done</>
                : <><i className="fa-solid fa-pen" /> Edit</>}
            </button>
          </div>
          <div className="dmp-service-list">
            {!services.length && !servicesEdit && <p className="dmp-empty-hint">No services added yet.</p>}
            {services.map((s, i) => (
              <div key={i} className="dmp-service-item">
                <span className="dmp-service-icon"><i className="fa-solid fa-bowl-food" /></span>
                {servicesEdit ? (
                  <input className="dmp-field-input" style={{ flex: 1 }} value={s}
                    onChange={e => setServices(p => p.map((x, j) => j === i ? e.target.value : x))} />
                ) : (
                  <span className="dmp-service-label">{s}</span>
                )}
                {servicesEdit
                  ? <button className="dmp-remove-btn" onClick={() => setServices(p => p.filter((_, j) => j !== i))}>✕</button>
                  : <span className="dmp-service-check">✓</span>}
              </div>
            ))}
            {servicesEdit && (
              <div className="dmp-spec-add-row" style={{ marginTop: 8 }}>
                <input className="dmp-field-input" value={newService} placeholder="Add a service…"
                  onChange={e => setNewService(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addService()} />
                <button className="dmp-spec-add-btn" onClick={addService}>Add</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

const DOC_DEFS = [
  { id: 'degree', label: 'Degree Certificate',      icon: 'fa-solid fa-graduation-cap', folder: 'degree-certificates',       apiKey: 'degreeCertificate',       urlKey: 'degree_certificate' },
  { id: 'reg',    label: 'Registration Certificate', icon: 'fa-solid fa-clipboard',      folder: 'registration-certificates', apiKey: 'registrationCertificate', urlKey: 'registration_certificate' },
  { id: 'gov-id', label: 'Government ID Proof',      icon: 'fa-solid fa-id-card',        folder: 'id-proofs',                 apiKey: 'idProof',                 urlKey: 'id_proof' },
  { id: 'exp',    label: 'Experience Certificate',   icon: 'fa-solid fa-briefcase',      folder: 'experience-certificates',   apiKey: 'experienceCertificate',   urlKey: 'experience_certificate' },
  { id: 'photo',  label: 'Profile Photo',            icon: 'fa-solid fa-image',          folder: 'profile-photos',            apiKey: 'profilePhoto',            urlKey: 'profile_photo' },
] as const

function TabDocuments({ profile, onSaved }: { profile: DietitianProfile | null; onSaved: (p: DietitianProfile) => void }) {
  const { showToast } = useToast()
  const { save } = useProfileSave(onSaved)
  const [busy, setBusy] = useState<string | null>(null)

  const verified = profile?.is_verified === 1
  const fileNameFromUrl = (url: string | null) =>
    url ? decodeURIComponent(url.split('/').pop() ?? '') : ''

  // Current documents as the API's camelCase body (used as the base on each update)
  const docsBody = () => ({
    profilePhoto:            profile?.documents.profile_photo ?? null,
    degreeCertificate:       profile?.documents.degree_certificate ?? null,
    registrationCertificate: profile?.documents.registration_certificate ?? null,
    idProof:                 profile?.documents.id_proof ?? null,
    experienceCertificate:   profile?.documents.experience_certificate ?? null,
  })

  const handleUpload = async (def: typeof DOC_DEFS[number], file: File) => {
    if (!profile) return
    setBusy(def.id)
    try {
      const url = await uploadSingleDocument(file, def.folder)
      await save({ documents: { ...docsBody(), [def.apiKey]: url } })
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Upload failed. Please try again.', 'error')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="dmp-docs-grid">
      {DOC_DEFS.map(def => {
        const url = (profile?.documents[def.urlKey] ?? null) as string | null
        const status = !url ? 'not-uploaded' : verified ? 'verified' : 'pending'
        const uploading = busy === def.id
        return (
          <div key={def.id} className="dmp-doc-card">
            <div className="dmp-doc-top">
              <span className="dmp-doc-icon"><i className={def.icon} /></span>
              <div className="dmp-doc-info">
                <p className="dmp-doc-label">{def.label}</p>
                <p className="dmp-doc-file">{fileNameFromUrl(url) || 'No file uploaded'}</p>
              </div>
              <span className={`dmp-doc-status dmp-doc-status--${status}`}>
                {status === 'verified' ? '✓ Verified' : status === 'pending' ? '⏳ Pending' : '— Not Uploaded'}
              </span>
            </div>
            <div className="dmp-doc-actions">
              {url && (
                <a className="dmp-doc-view-btn" href={url} target="_blank" rel="noopener noreferrer">
                  <i className="fa-regular fa-eye" /> View
                </a>
              )}
              <label className={`dmp-doc-upload-btn${uploading ? ' dmp-doc-upload-btn--busy' : ''}`}>
                {uploading
                  ? <><i className="fa-solid fa-spinner fa-spin" /> Uploading…</>
                  : <><i className="fa-solid fa-upload" /> {status === 'not-uploaded' ? 'Upload' : 'Replace'}</>}
                <input type="file" accept="image/*,.pdf" style={{ display: 'none' }} disabled={uploading}
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(def, f) }} />
              </label>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function TabPreferences({ profile, onSaved }: { profile: DietitianProfile | null; onSaved: (p: DietitianProfile) => void }) {
  const { showToast } = useToast()
  const { save } = useProfileSave(onSaved)
  const [notifs, setNotifs] = useState({ email: true, sms: true, whatsapp: true, push: false })
  const [availability, setAvailability] = useState(
    DAY_KEYS.map(({ day, key }) => ({
      day, key,
      start:  day === 'Saturday' ? '10:00' : '09:00',
      end:    day === 'Saturday' ? '14:00' : '18:00',
      closed: day === 'Sunday',
    }))
  )
  const [availSaving, setAvailSaving] = useState(false)
  const [availEdit, setAvailEdit] = useState(false)

  // Seed from API availability ({ mon: ["09:00-18:00"], ... }) when present
  useEffect(() => {
    const av = profile?.availability
    if (!av) return
    setAvailability(DAY_KEYS.map(({ day, key }) => {
      const slot = av[key]?.[0]
      const [start, end] = slot ? slot.split('-') : []
      return av[key]?.length
        ? { day, key, start: start || '09:00', end: end || '18:00', closed: false }
        : { day, key, start: '09:00', end: '18:00', closed: true }
    }))
  }, [profile])

  const toggleDay = (i: number) =>
    setAvailability(p => p.map((a, j) => j === i ? { ...a, closed: !a.closed } : a))

  const setTime = (i: number, field: 'start' | 'end', value: string) =>
    setAvailability(p => p.map((a, j) => j === i ? { ...a, [field]: value } : a))

  const handleAvailSave = async () => {
    if (!availEdit) { setAvailEdit(true); return }
    // Validate each open day has end after start
    const bad = availability.find(a => !a.closed && (!a.start || !a.end || a.end <= a.start))
    if (bad) {
      showToast(`${bad.day}: end time must be after start time.`, 'error')
      return
    }
    setAvailSaving(true)
    const payload: Record<string, string[]> = {}
    availability.forEach(a => {
      if (a.closed) return
      payload[a.key] = [`${a.start}-${a.end}`]
    })
    const ok = await save({ availability: payload })
    setAvailSaving(false)
    if (ok) setAvailEdit(false)
  }

  return (
    <>
      <div className="dmp-left">
        {/* Notification Preferences */}
        <div className="dmp-card">
          <div className="dmp-card-header">
            <h3 className="dmp-card-title">Notification Preferences</h3>
            <span className="dmp-soon-badge">Coming Soon</span>
          </div>
          <div className="dmp-pref-list dmp-pref-list--disabled">
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
                <Toggle on={notifs[n.key]} onChange={() => {}} />
              </div>
            ))}
          </div>
          <p className="dmp-empty-hint">🔔 Notifications aren't available yet — we'll enable this feature soon.</p>
        </div>

      </div>

      <div className="dmp-center">
        {/* Weekly Availability */}
        <div className="dmp-card">
          <div className="dmp-card-header">
            <h3 className="dmp-card-title">Weekly Availability Settings</h3>
            <button className="dmp-edit-link" disabled={availSaving} onClick={handleAvailSave}>
              {availSaving
                ? <><i className="fa-solid fa-spinner fa-spin" /> Saving…</>
                : availEdit
                ? <><i className="fa-solid fa-check" /> Save</>
                : <><i className="fa-solid fa-pen" /> Edit</>}
            </button>
          </div>
          <div className="dmp-week-avail">
            {availability.map((a, i) => (
              <div key={a.day} className="dmp-week-row">
                {availEdit && <Toggle on={!a.closed} onChange={() => toggleDay(i)} />}
                <span className={`dmp-week-day${a.closed ? ' dmp-week-day--off' : ''}`}>{a.day}</span>
                {a.closed ? (
                  <span className="dmp-week-closed">Closed</span>
                ) : availEdit ? (
                  <div className="dmp-week-times">
                    <input type="time" className="dmp-time-input" value={a.start}
                      onChange={e => setTime(i, 'start', e.target.value)} />
                    <span className="dmp-week-dash">–</span>
                    <input type="time" className="dmp-time-input" value={a.end}
                      onChange={e => setTime(i, 'end', e.target.value)} />
                  </div>
                ) : (
                  <span className="dmp-week-time">{to12hLabel(a.start)} – {to12hLabel(a.end)}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

function TabSecurity() {
  const { showToast } = useToast()
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew]         = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pwForm, setPwForm]           = useState({ current: '', next: '', confirm: '' })
  const [pwStrength, setPwStrength]   = useState(0)
  const [pwSaving, setPwSaving]       = useState(false)

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

  const handleUpdatePassword = async () => {
    if (!pwForm.current || !pwForm.next || !pwForm.confirm) {
      showToast('Please fill in all password fields.', 'error'); return
    }
    if (pwForm.next.length < 8) {
      showToast('New password must be at least 8 characters.', 'error'); return
    }
    if (pwForm.next !== pwForm.confirm) {
      showToast('New passwords do not match.', 'error'); return
    }
    setPwSaving(true)
    try {
      await dietitianApi.changePassword({ current_password: pwForm.current, new_password: pwForm.next })
      showToast('Password changed successfully!', 'success')
      setPwForm({ current: '', next: '', confirm: '' })
      setPwStrength(0)
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to change password. Please try again.', 'error')
    } finally {
      setPwSaving(false)
    }
  }

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
          <button className="dmp-complete-btn" disabled={pwSaving} onClick={handleUpdatePassword}>
            {pwSaving ? 'Updating…' : 'Update Password'}
          </button>
        </div>
      </div>
    </div>
  )
}

function BankPicker({ selected, onSelect }: {
  selected: Bank | null
  onSelect: (bank: Bank) => void
}) {
  const [open, setOpen]       = useState(false)
  const [search, setSearch]   = useState('')
  const [banks, setBanks]     = useState<Bank[]>([])
  const [fetching, setFetching] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => {
      setFetching(true)
      banksApi.getBanks(search || undefined)
        .then(setBanks)
        .catch(() => {})
        .finally(() => setFetching(false))
    }, search ? 300 : 0)
    return () => clearTimeout(t)
  }, [open, search])

  function handleOpen() {
    setSearch('')
    setBanks([])
    setOpen(true)
  }

  return (
    <div className="dmp-bank-picker" ref={ref}>
      <div
        className={`dmp-bank-picker-trigger${open ? ' dmp-bank-picker-trigger--open' : ''}`}
        onClick={handleOpen}
      >
        {selected ? (
          <>
            {selected.logo_url
              ? <img src={selected.logo_url} alt={selected.name} className="dmp-bank-picker-logo" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
              : <div className="dmp-bank-picker-logo-fallback"><i className="fa-solid fa-building-columns" /></div>
            }
            <span className="dmp-bank-picker-trigger-name">{selected.name}</span>
          </>
        ) : (
          <span className="dmp-bank-picker-placeholder">Select bank</span>
        )}
        <i className="fa-solid fa-chevron-down dmp-bank-picker-chevron" />
      </div>

      {open && (
        <div className="dmp-bank-picker-dropdown">
          <div className="dmp-bank-picker-search-wrap">
            <i className="fa-solid fa-magnifying-glass" />
            <input
              autoFocus
              placeholder="Search bank…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="dmp-bank-picker-list">
            {fetching && <p className="dmp-bank-picker-loading"><i className="fa-solid fa-spinner fa-spin" /> Loading…</p>}
            {!fetching && banks.length === 0 && (
              <p className="dmp-bank-picker-empty">No banks found</p>
            )}
            {!fetching && banks.map(bank => (
              <div
                key={bank.id}
                className={`dmp-bank-picker-item${selected?.id === bank.id ? ' dmp-bank-picker-item--selected' : ''}`}
                onClick={() => { onSelect(bank); setOpen(false) }}
              >
                {bank.logo_url
                  ? <img src={bank.logo_url} alt={bank.name} className="dmp-bank-picker-item-logo" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  : <div className="dmp-bank-picker-item-fallback"><i className="fa-solid fa-building-columns" /></div>
                }
                <span className="dmp-bank-picker-item-name">{bank.name}</span>
                {selected?.id === bank.id && <i className="fa-solid fa-check dmp-bank-picker-item-check" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function TabBankInformation() {
  const { showToast } = useToast()
  const [accounts, setAccounts]       = useState<LinkedAccount[]>([])
  const [loading, setLoading]         = useState(true)
  const [showForm, setShowForm]       = useState(false)
  const [formType, setFormType]       = useState<'upi' | 'bank'>('upi')
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null)
  const [form, setForm] = useState({
    upi_id: '', bank_name: '', account_holder: '', account_number: '', ifsc_code: '', set_primary: false,
  })
  const [submitting, setSubmitting]   = useState(false)
  const [error, setError]             = useState<string | null>(null)

  function loadAccounts() {
    setLoading(true)
    accountsApi.getAccounts()
      .then(data => setAccounts(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }
  useEffect(() => { loadAccounts() }, [])

  async function handleAdd() {
    setError(null)

    // ── Client-side validation ──────────────────────────────
    if (formType === 'upi') {
      const upi = form.upi_id.trim()
      if (!upi) { setError('UPI ID is required.'); return }
      if (!/^[\w.\-]+@[a-zA-Z]+$/.test(upi)) {
        setError('Invalid UPI ID format. Expected format: yourname@bankhandle (e.g. manish@okhdfc)')
        return
      }
    } else {
      if (!selectedBank) { setError('Please select a bank.'); return }
      if (!form.account_holder.trim()) { setError('Account holder name is required.'); return }
      if (!form.account_number.trim()) { setError('Account number is required.'); return }
      if (!/^\d{9,18}$/.test(form.account_number.trim())) {
        setError('Account number must be 9–18 digits with no spaces or letters.')
        return
      }
      if (!form.ifsc_code.trim()) { setError('IFSC code is required.'); return }
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifsc_code.trim().toUpperCase())) {
        setError('Invalid IFSC code format (e.g. HDFC0001234)')
        return
      }
    }

    setSubmitting(true)
    try {
      if (formType === 'upi') {
        const result = await accountsApi.addAccount({
          type: 'upi', upi_id: form.upi_id.trim(), set_primary: form.set_primary,
        })
        if ('upi_verified_note' in result && !result.upi_verified) {
          showToast(`Account added. Note: ${result.upi_verified_note}`, 'success')
        } else {
          showToast('UPI account added successfully.', 'success')
        }
      } else {
        const result = await accountsApi.addAccount({
          type: 'bank',
          bank_name: form.bank_name.trim(),
          account_holder: form.account_holder.trim(),
          account_number: form.account_number.trim(),
          ifsc_code: form.ifsc_code.trim().toUpperCase(),
          set_primary: form.set_primary,
        })
        if ('ifsc_verified' in result && result.ifsc_verified) {
          showToast(`Account added. Verified bank: ${result.verified_bank_name}`, 'success')
        } else {
          showToast('Bank account added successfully.', 'success')
        }
      }
      setShowForm(false)
      setSelectedBank(null)
      setForm({ upi_id: '', bank_name: '', account_holder: '', account_number: '', ifsc_code: '', set_primary: false })
      loadAccounts()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to add account.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSetPrimary(id: number) {
    try {
      await accountsApi.setPrimary(id)
      setAccounts(prev => prev.map(a => ({ ...a, is_primary: a.id === id })))
      showToast('Primary account updated.', 'success')
    } catch {
      showToast('Failed to update primary account.', 'error')
    }
  }

  async function handleDelete(id: number) {
    try {
      await accountsApi.deleteAccount(id)
      setAccounts(prev => prev.filter(a => a.id !== id))
      showToast('Account removed.', 'success')
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to delete account.', 'error')
    }
  }

  return (
    <div className="dmp-left">
      <div className="dmp-card">
        <div className="dmp-card-header">
          <h3 className="dmp-card-title">Linked Accounts</h3>
          <button
            className="dmp-edit-link"
            onClick={() => { setShowForm(s => !s); setError(null) }}
          >
            <i className={`fa-solid ${showForm ? 'fa-xmark' : 'fa-plus'}`} />
            {showForm ? ' Cancel' : ' Add Account'}
          </button>
        </div>

        {/* Add form */}
        {showForm && (
          <div className="dmp-bi-form">
            <div className="dmp-bi-type-row">
              <button
                className={`dmp-bi-type-btn${formType === 'upi' ? ' dmp-bi-type-btn--active' : ''}`}
                onClick={() => setFormType('upi')}
              >
                <i className="fa-solid fa-mobile-screen" /> UPI
              </button>
              <button
                className={`dmp-bi-type-btn${formType === 'bank' ? ' dmp-bi-type-btn--active' : ''}`}
                onClick={() => setFormType('bank')}
              >
                <i className="fa-solid fa-building-columns" /> Bank Account
              </button>
            </div>
            <div className="dmp-bi-fields">
              {formType === 'upi' ? (
                <input
                  placeholder="UPI ID (e.g. name@upi)"
                  value={form.upi_id}
                  onChange={e => setForm(f => ({ ...f, upi_id: e.target.value }))}
                />
              ) : (
                <>
                  <BankPicker
                    selected={selectedBank}
                    onSelect={bank => {
                      setSelectedBank(bank)
                      setForm(f => ({ ...f, bank_name: bank.name }))
                    }}
                  />
                  <input
                    placeholder="Account Holder Name"
                    value={form.account_holder}
                    onChange={e => setForm(f => ({ ...f, account_holder: e.target.value }))}
                  />
                  <input
                    placeholder="Account Number"
                    value={form.account_number}
                    onChange={e => setForm(f => ({ ...f, account_number: e.target.value }))}
                  />
                  <input
                    placeholder="IFSC Code"
                    value={form.ifsc_code}
                    onChange={e => setForm(f => ({ ...f, ifsc_code: e.target.value.toUpperCase() }))}
                  />
                </>
              )}
            </div>

            <div
              className="dmp-bi-primary-row"
              onClick={() => setForm(f => ({ ...f, set_primary: !f.set_primary }))}
            >
              <div className="dmp-bi-primary-row-icon">
                <i className="fa-solid fa-star" />
              </div>
              <div className="dmp-bi-primary-row-text">
                <p className="dmp-bi-primary-row-label">Set as primary account</p>
                <p className="dmp-bi-primary-row-desc">Payouts will be sent to this account by default</p>
              </div>
              <span onClick={e => e.stopPropagation()}>
                <Toggle on={form.set_primary} onChange={() => setForm(f => ({ ...f, set_primary: !f.set_primary }))} />
              </span>
            </div>
            {error && <p className="dmp-bi-error">{error}</p>}
            <div className="dmp-bi-form-actions">
              <button className="dmp-bi-save-btn" onClick={handleAdd} disabled={submitting}>
                {submitting ? <><i className="fa-solid fa-spinner fa-spin" /> Saving…</> : 'Save Account'}
              </button>
              <button className="dmp-bi-cancel-btn" onClick={() => { setShowForm(false); setError(null) }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* List */}
        {loading && [1, 2].map(i => (
          <div key={i} className="dmp-bi-account-row">
            <div className="dmp-bi-icon" style={{ background: '#f3f4f6', color: '#d1d5db' }} />
            <div className="dmp-bi-info">
              <span className="ea-kpi-skel" style={{ width: 110, height: 12, display: 'block', marginBottom: 6 }} />
              <span className="ea-kpi-skel" style={{ width: 160, height: 11, display: 'block' }} />
            </div>
          </div>
        ))}

        {!loading && accounts.length === 0 && (
          <p className="dmp-bi-empty">No accounts linked yet. Add a UPI ID or bank account to receive payouts.</p>
        )}

        {!loading && accounts.map(a => (
          <div key={a.id} className="dmp-bi-account-row">
            <div className="dmp-bi-icon">
              <i className={a.type === 'upi' ? 'fa-solid fa-mobile-screen' : 'fa-solid fa-building-columns'} />
            </div>
            <div className="dmp-bi-info">
              <p className="dmp-bi-label">
                {a.type === 'upi' ? 'UPI' : a.bank_name}
              </p>
              <p className="dmp-bi-detail">
                {a.type === 'upi'
                  ? a.upi_id
                  : `${a.account_holder} · ••••${a.account_number?.slice(-4)}`}
              </p>
            </div>
            {a.is_primary
              ? <span className="dmp-bi-primary">Primary</span>
              : (
                <div className="dmp-bi-actions">
                  <button className="dmp-bi-set-primary-btn" onClick={() => handleSetPrimary(a.id)}>
                    Set Primary
                  </button>
                </div>
              )
            }
            <button
              className="dmp-bi-delete-btn"
              title="Delete account"
              onClick={() => handleDelete(a.id)}
            >
              <i className="fa-solid fa-trash" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

const FEE_MIN = 1499
const FEE_MAX = 4500

function FeeCard({ profile, onSaved }: { profile: DietitianProfile | null; onSaved: (p: DietitianProfile) => void }) {
  const { save, saving } = useProfileSave(onSaved)
  const isSet = (profile?.appointment_fee ?? 0) > 0
  const [editing, setEditing] = useState(false)
  const [sliderVal, setSliderVal] = useState(FEE_MIN)
  const [inputText, setInputText] = useState(String(FEE_MIN))

  const startEdit = () => {
    const cur = profile?.appointment_fee ?? 0
    const initial = cur >= FEE_MIN && cur <= FEE_MAX ? cur : FEE_MIN
    setSliderVal(initial)
    setInputText(String(initial))
    setEditing(true)
  }

  const handleSave = async () => {
    const ok = await save({ appointmentFee: sliderVal, appointmentCurrency: 'INR' })
    if (ok) setEditing(false)
  }

  const pct = ((sliderVal - FEE_MIN) / (FEE_MAX - FEE_MIN)) * 100

  return (
    <div className="dmp-card dmp-fee-card">
      <div className="dmp-card-header">
        <h3 className="dmp-card-title">
          <span className="dmp-fee-icon">💰</span> Consultation Fee
        </h3>
        {!editing && (
          <button className="dmp-edit-link" onClick={startEdit}>
            <i className={`fa-solid ${isSet ? 'fa-pen' : 'fa-plus'}`} />
            {isSet ? ' Edit' : ' Set Fee'}
          </button>
        )}
      </div>

      {editing ? (
        <div className="dmp-fee-edit">
          <div className="dmp-fee-slider-top">
            <div className="dmp-fee-input-wrap">
              <span className="dmp-fee-currency">₹</span>
              <input
                className="dmp-field-input dmp-fee-input"
                type="number"
                min={FEE_MIN}
                max={FEE_MAX}
                value={inputText}
                onChange={e => {
                  setInputText(e.target.value)
                  const v = Number(e.target.value)
                  if (!isNaN(v) && v >= FEE_MIN && v <= FEE_MAX) setSliderVal(v)
                }}
                onBlur={() => {
                  const v = Number(inputText)
                  const clamped = isNaN(v) ? FEE_MIN : Math.min(FEE_MAX, Math.max(FEE_MIN, v))
                  setSliderVal(clamped)
                  setInputText(String(clamped))
                }}
              />
            </div>
            <span className="dmp-fee-per">per consultation</span>
          </div>
          <div className="dmp-fee-slider-wrap">
            <input
              type="range"
              className="dmp-fee-slider"
              min={FEE_MIN}
              max={FEE_MAX}
              step={1}
              value={sliderVal}
              style={{ '--pct': `${pct}%` } as React.CSSProperties}
              onChange={e => { const v = Number(e.target.value); setSliderVal(v); setInputText(String(v)) }}
            />
            <div className="dmp-fee-slider-labels">
              <span>₹{FEE_MIN.toLocaleString('en-IN')}</span>
              <span>₹{FEE_MAX.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <div className="dmp-fee-actions">
            <button className="dmp-complete-btn" disabled={saving} onClick={handleSave}>
              {saving ? <><i className="fa-solid fa-spinner fa-spin" /> Saving…</> : 'Save Fee'}
            </button>
            <button className="dmp-fee-cancel-btn" disabled={saving} onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : isSet ? (
        <div className="dmp-fee-display">
          <span className="dmp-fee-amount">₹{profile!.appointment_fee!.toLocaleString('en-IN')}</span>
          <span className="dmp-fee-per">per consultation</span>
        </div>
      ) : (
        <div className="dmp-fee-unset">
          <p className="dmp-fee-unset-msg">No fee set yet. Clients won't be able to book until you add one.</p>
          <button className="dmp-complete-btn" onClick={startEdit}>
            <i className="fa-solid fa-plus" /> Set Your Fee
          </button>
        </div>
      )}
    </div>
  )
}

interface BannerProfile {
  name: string; title: string; degree: string
  experience: string; licenseNo: string; languages: string
}

/* ─── Main component ─────────────────────────────────────── */

export default function DietitianMyProfile() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const location = useLocation()
  // Allow other pages to deep-link to a specific tab (e.g. the onboarding
  // prompt sends the dietitian straight to "Preferences" for availability).
  const requestedTab = (location.state as { tab?: string } | null)?.tab
  const [activeTab, setActiveTab] = useState(
    requestedTab && TABS.includes(requestedTab) ? requestedTab : 'Personal Information'
  )
  const [photoSrc, setPhotoSrc] = useState<string | null>(null)
  const [profile, setProfile] = useState<DietitianProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [bannerProfile, setBannerProfile] = useState<BannerProfile>({
    name:       user?.full_name ?? '',
    title:      'Dietitian',
    degree:     '',
    experience: '',
    licenseNo:  '',
    languages:  '',
  })
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let active = true
    dietitianApi.getProfile()
      .then(p => {
        if (!active) return
        setProfile(p)
        setBannerProfile({
          name:       p.full_name || '',
          title:      p.specialization[0] ?? 'Dietitian',
          degree:     p.degrees[0]?.degree ?? '',
          experience: p.experience ?? '',
          licenseNo:  p.registration_number ?? '',
          languages:  p.languages.join(', '),
        })
        if (p.documents.profile_photo) setPhotoSrc(p.documents.profile_photo)
      })
      .catch(err => {
        if (active) showToast(err instanceof ApiError ? err.message : 'Could not load your profile.', 'error')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [showToast])

  const initials = bannerProfile.name
    ? bannerProfile.name.split(' ').filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : 'D'

  const completion = getCompletion(profile)

  const [photoUploading, setPhotoUploading] = useState(false)
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file later
    if (!file) return
    const oldUrl = profile?.documents.profile_photo ?? null
    setPhotoSrc(URL.createObjectURL(file)) // instant local preview
    setPhotoUploading(true)
    try {
      const url = await uploadSingleDocument(file, 'profile-photos')
      const updated = await dietitianApi.updateProfile({
        documents: {
          profilePhoto:            url,
          degreeCertificate:       profile?.documents.degree_certificate ?? null,
          registrationCertificate: profile?.documents.registration_certificate ?? null,
          idProof:                 profile?.documents.id_proof ?? null,
          experienceCertificate:   profile?.documents.experience_certificate ?? null,
        },
      })
      setProfile(updated)
      setPhotoSrc(updated.documents.profile_photo)
      showToast('Profile photo updated.', 'success')
      // Old photo is now orphaned — remove it from S3 (best-effort)
      if (oldUrl && oldUrl !== url) deleteDocument(oldUrl)
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not upload photo.', 'error')
    } finally {
      setPhotoUploading(false)
    }
  }
  return (
    <>
        {/* ── Profile banner ── */}
        <div className="dmp-banner">
          <div className="dmp-banner-left">
            <div className="dmp-banner-avatar">
              {photoSrc
                ? <img src={photoSrc} alt="Profile" className="dmp-banner-avatar-img" />
                : <span className="dmp-banner-avatar-initials">{initials}</span>
              }
              {photoUploading && (
                <span className="dmp-avatar-uploading"><i className="fa-solid fa-spinner fa-spin" /></span>
              )}
              <button className="dmp-avatar-edit-btn" disabled={photoUploading} onClick={() => fileRef.current?.click()}>
                <i className="fa-solid fa-pen" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
            </div>
            <div className="dmp-banner-info">
              <div className="dmp-banner-name-row">
                <h2 className="dmp-banner-name">{bannerProfile.name}</h2>
                {profile?.is_verified === 1 && <span className="dmp-verified-badge">✓ Verified</span>}
              </div>
              <p className="dmp-banner-title">{bannerProfile.title}</p>
              <p className="dmp-banner-degree">{bannerProfile.degree}</p>
              <div className="dmp-banner-meta">
                <span><i className="fa-solid fa-clock" /> {bannerProfile.experience} Experience</span>
                <span><i className="fa-solid fa-id-card" /> {bannerProfile.licenseNo}</span>
                <span><i className="fa-solid fa-language" /> {bannerProfile.languages || 'Please select the language you are comfortable'}</span>
              </div>
            </div>
          </div>
        </div>

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
        {loading && !profile ? (
          <div className="dmp-loading">Loading your profile…</div>
        ) : (
        <div className={`dmp-body${activeTab === 'Documents' ? ' dmp-body--docs' : ''}`}>

          {/* Main area — changes by tab */}
          {activeTab === 'Personal Information'     && <TabPersonal profile={profile} photoSrc={photoSrc} fileRef={fileRef} onPhotoChange={handlePhotoChange} onSaved={setProfile} photoUploading={photoUploading} />}
          {activeTab === 'Professional Information' && <TabProfessional profile={profile} onSaved={setProfile} />}
          {activeTab === 'Documents'                && <TabDocuments profile={profile} onSaved={setProfile} />}
          {activeTab === 'Preferences'              && <TabPreferences profile={profile} onSaved={setProfile} />}
          {activeTab === 'Bank Information'         && <TabBankInformation />}
          {activeTab === 'Security'                 && <TabSecurity />}

          {/* ── Right sidebar (always visible) ── */}
          {activeTab !== 'Documents' && (
            <aside className="dmp-right">
              <div className="dmp-card">
                <h3 className="dmp-card-title">Profile Completion</h3>
                <div className="dmp-completion-row">
                  <CircularProgress pct={completion.pct} />
                  <p className="dmp-completion-msg">{completion.message}</p>
                </div>
                <div className="dmp-completion-list">
                  {completion.items.map(item => (
                    <div key={item.label} className="dmp-completion-item">
                      <span className={`dmp-completion-check${item.done ? ' dmp-completion-check--done' : ''}`}>
                        {item.done ? '✓' : '○'}
                      </span>
                      <span className="dmp-completion-label">{item.label}</span>
                    </div>
                  ))}
                </div>
                {completion.pct < 100 && (
                  <button className="dmp-complete-btn" onClick={() => {
                    setActiveTab(completion.firstIncompleteTab)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}>
                    Complete Your Profile
                  </button>
                )}
              </div>

              <FeeCard profile={profile} onSaved={setProfile} />

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
                    <span className="dmp-account-val">{fmtDate(profile?.created_at)}</span>
                  </div>
                  <div className="dmp-account-row">
                    <span className="dmp-account-icon">🪪</span>
                    <span className="dmp-account-label">Account Type</span>
                    <span className="dmp-account-val">Dietitian</span>
                  </div>
                  <div className="dmp-account-row">
                    <span className="dmp-account-icon">ℹ️</span>
                    <span className="dmp-account-label">Account Status</span>
                    {profile?.is_active === 0
                      ? <span className="dmp-account-val">Inactive</span>
                      : <span className="dmp-account-val dmp-status-active">Active</span>}
                  </div>
                </div>
                <button className="dmp-deactivate-btn">🗑 Deactivate Account</button>
              </div>
            </aside>
          )}
        </div>
        )}
    </>
  )
}
