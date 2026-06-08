import { useState } from 'react'

type Section = 'profile' | 'notifications' | 'availability' | 'security' | 'preferences'

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      className={`sg-toggle${checked ? ' sg-toggle--on' : ''}`}
      onClick={onChange}
      role="switch"
      aria-checked={checked}
    >
      <span className="sg-toggle-thumb" />
    </button>
  )
}

function SaveBar({ onSave }: { onSave: () => void }) {
  return (
    <div className="sg-save-bar">
      <button className="sg-save-btn" onClick={onSave}>
        <i className="fa-solid fa-floppy-disk" /> Save Changes
      </button>
    </div>
  )
}

export default function DietitianSettings() {
  const [section, setSection] = useState<Section>('profile')
  const [saved, setSaved]     = useState<Section | null>(null)

  const save = (s: Section) => {
    setSaved(s)
    setTimeout(() => setSaved(null), 2500)
  }

  /* ── Profile state ── */
  const [profile, setProfile] = useState({
    displayName: 'Dr. Priya Sharma',
    email:       'priya.sharma@meridiet.com',
    phone:       '+91 98765 43210',
    tagline:     'Clinical Dietitian & Nutrition Coach',
    bio:         'With over 8 years of experience in clinical and sports nutrition, I specialize in weight management, PCOS, diabetes, and gut health. My approach is science-based yet deeply personal — I believe every body is unique and deserves a plan built around real life, not just textbook rules.',
    experience:  '8',
    languages:   'English, Hindi, Punjabi',
    qualification: 'M.Sc. Clinical Nutrition, RD (Registered Dietitian)',
  })

  /* ── Notification state ── */
  const [notif, setNotif] = useState({
    emailNew:       true,
    emailAppt:      true,
    emailPayment:   true,
    emailFollowup:  false,
    emailPromo:     false,
    smsNew:         true,
    smsAppt:        true,
    smsPayment:     false,
    appNew:         true,
    appChat:        true,
    appFollowup:    true,
    appPayment:     true,
  })

  const toggleNotif = (key: keyof typeof notif) =>
    setNotif(p => ({ ...p, [key]: !p[key] }))

  /* ── Availability state ── */
  const [avail, setAvail] = useState({
    online:          true,
    maxPerDay:       '8',
    bufferMins:      '15',
    sessionDuration: '45',
    monday:    true, tuesday: true, wednesday: true,
    thursday:  true, friday:  true, saturday:  true, sunday: false,
    startTime: '09:00', endTime: '18:00',
    modeVideo:    true, modeInPerson: true, modeChat: false,
    autoAccept:   false,
    instantBook:  true,
  })

  const toggleAvail = (key: keyof typeof avail) =>
    setAvail(p => ({ ...p, [key]: !p[p[key] === true ? key : key] }))

  const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] as const

  /* ── Security state ── */
  const [security, setSecurity] = useState({
    twoFactor:        false,
    loginAlerts:      true,
    profilePublic:    true,
    showEarnings:     false,
    showReviews:      true,
  })

  /* ── Preferences state ── */
  const [prefs, setPrefs] = useState({
    language:  'English',
    timezone:  'Asia/Kolkata (IST)',
    currency:  'INR (₹)',
    dateFormat: 'DD/MM/YYYY',
    theme:     'light',
  })

  const NAV: { key: Section; icon: string; label: string }[] = [
    { key: 'profile',       icon: 'fa-solid fa-user',             label: 'Profile'       },
    { key: 'notifications', icon: 'fa-solid fa-bell',             label: 'Notifications' },
    { key: 'availability',  icon: 'fa-solid fa-calendar-check',   label: 'Availability'  },
    { key: 'security',      icon: 'fa-solid fa-shield-halved',    label: 'Security'      },
    { key: 'preferences',   icon: 'fa-solid fa-sliders',          label: 'Preferences'   },
  ]

  return (
    <div className="sg-root">

      {/* ── Header ── */}
      <div className="sg-header">
        <h1 className="sg-title">Settings</h1>
        <p className="sg-subtitle">Manage your account, notifications, availability and preferences</p>
      </div>

      <div className="sg-body">

        {/* ── Left nav ── */}
        <aside className="sg-nav">
          {NAV.map(n => (
            <button
              key={n.key}
              className={`sg-nav-item${section === n.key ? ' sg-nav-item--active' : ''}`}
              onClick={() => setSection(n.key)}
            >
              <i className={n.icon} />
              <span>{n.label}</span>
              {section === n.key && <i className="fa-solid fa-chevron-right sg-nav-arrow" />}
            </button>
          ))}
        </aside>

        {/* ── Content ── */}
        <div className="sg-content">

          {/* ── PROFILE ── */}
          {section === 'profile' && (
            <div className="sg-section">
              <div className="sg-section-header">
                <h2 className="sg-section-title"><i className="fa-solid fa-user" /> Profile</h2>
                <p className="sg-section-sub">This information is displayed on your public dietitian profile</p>
              </div>

              {/* Photo */}
              <div className="sg-card">
                <p className="sg-card-label">Profile Photo</p>
                <div className="sg-photo-row">
                  <div className="sg-photo-avatar">PS</div>
                  <div className="sg-photo-actions">
                    <button className="sg-btn sg-btn--outline"><i className="fa-solid fa-upload" /> Upload Photo</button>
                    <button className="sg-btn sg-btn--ghost">Remove</button>
                  </div>
                  <p className="sg-photo-hint">JPG, PNG or WebP · Max 2 MB · Recommended 400×400 px</p>
                </div>
              </div>

              {/* Basic info */}
              <div className="sg-card">
                <p className="sg-card-label">Basic Information</p>
                <div className="sg-form-grid">
                  <div className="sg-field">
                    <label className="sg-label">Display Name</label>
                    <input className="sg-input" value={profile.displayName}
                      onChange={e => setProfile(p => ({ ...p, displayName: e.target.value }))} />
                  </div>
                  <div className="sg-field">
                    <label className="sg-label">Tagline</label>
                    <input className="sg-input" value={profile.tagline}
                      onChange={e => setProfile(p => ({ ...p, tagline: e.target.value }))} />
                  </div>
                  <div className="sg-field">
                    <label className="sg-label">Email Address</label>
                    <input className="sg-input" type="email" value={profile.email}
                      onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
                  </div>
                  <div className="sg-field">
                    <label className="sg-label">Phone Number</label>
                    <input className="sg-input" type="tel" value={profile.phone}
                      onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} />
                  </div>
                  <div className="sg-field">
                    <label className="sg-label">Years of Experience</label>
                    <input className="sg-input" type="number" value={profile.experience} min={0}
                      onChange={e => setProfile(p => ({ ...p, experience: e.target.value }))} />
                  </div>
                  <div className="sg-field">
                    <label className="sg-label">Languages Spoken</label>
                    <input className="sg-input" value={profile.languages}
                      onChange={e => setProfile(p => ({ ...p, languages: e.target.value }))} />
                  </div>
                  <div className="sg-field sg-field--full">
                    <label className="sg-label">Qualification</label>
                    <input className="sg-input" value={profile.qualification}
                      onChange={e => setProfile(p => ({ ...p, qualification: e.target.value }))} />
                  </div>
                  <div className="sg-field sg-field--full">
                    <label className="sg-label">Bio</label>
                    <textarea className="sg-textarea" rows={5} value={profile.bio}
                      onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} />
                    <span className="sg-char-hint">{profile.bio.length} / 600 characters</span>
                  </div>
                </div>
              </div>

              {saved === 'profile' && <div className="sg-saved-toast"><i className="fa-solid fa-circle-check" /> Changes saved successfully</div>}
              <SaveBar onSave={() => save('profile')} />
            </div>
          )}

          {/* ── NOTIFICATIONS ── */}
          {section === 'notifications' && (
            <div className="sg-section">
              <div className="sg-section-header">
                <h2 className="sg-section-title"><i className="fa-solid fa-bell" /> Notifications</h2>
                <p className="sg-section-sub">Choose how and when you receive notifications</p>
              </div>

              {[
                {
                  icon: 'fa-solid fa-envelope', label: 'Email Notifications', color: '#3b82f6',
                  items: [
                    { key: 'emailNew' as const,      label: 'New consultation request', sub: 'Notified when a client submits a new request' },
                    { key: 'emailAppt' as const,     label: 'Appointment reminders',   sub: '30 minutes before each scheduled session' },
                    { key: 'emailPayment' as const,  label: 'Payment received',         sub: 'Confirmation when a client pays for a plan' },
                    { key: 'emailFollowup' as const, label: 'Follow-up due',            sub: 'When a scheduled follow-up is due today' },
                    { key: 'emailPromo' as const,    label: 'Promotions & tips',        sub: 'Platform updates, feature tips and offers' },
                  ],
                },
                {
                  icon: 'fa-solid fa-mobile-screen', label: 'SMS Notifications', color: '#16a34a',
                  items: [
                    { key: 'smsNew' as const,     label: 'New consultation request', sub: 'Instant SMS for new client requests' },
                    { key: 'smsAppt' as const,    label: 'Appointment reminders',   sub: '1 hour before each session' },
                    { key: 'smsPayment' as const, label: 'Payment received',         sub: 'SMS confirmation on payment' },
                  ],
                },
                {
                  icon: 'fa-solid fa-bell', label: 'In-App Notifications', color: '#a855f7',
                  items: [
                    { key: 'appNew' as const,      label: 'New consultation request', sub: 'Push notification on the dashboard' },
                    { key: 'appChat' as const,     label: 'Chat messages',            sub: 'When a client sends you a message' },
                    { key: 'appFollowup' as const, label: 'Follow-up reminders',      sub: 'Due follow-ups appear in the notification bar' },
                    { key: 'appPayment' as const,  label: 'Payment alerts',           sub: 'Instant alert when payment is processed' },
                  ],
                },
              ].map(group => (
                <div className="sg-card" key={group.label}>
                  <div className="sg-notif-group-header">
                    <div className="sg-notif-icon" style={{ background: group.color + '18', color: group.color }}>
                      <i className={group.icon} />
                    </div>
                    <p className="sg-card-label" style={{ margin: 0 }}>{group.label}</p>
                  </div>
                  <div className="sg-toggle-list">
                    {group.items.map(item => (
                      <div key={item.key} className="sg-toggle-row">
                        <div className="sg-toggle-info">
                          <p className="sg-toggle-label">{item.label}</p>
                          <p className="sg-toggle-sub">{item.sub}</p>
                        </div>
                        <Toggle checked={notif[item.key]} onChange={() => toggleNotif(item.key)} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {saved === 'notifications' && <div className="sg-saved-toast"><i className="fa-solid fa-circle-check" /> Changes saved successfully</div>}
              <SaveBar onSave={() => save('notifications')} />
            </div>
          )}

          {/* ── AVAILABILITY ── */}
          {section === 'availability' && (
            <div className="sg-section">
              <div className="sg-section-header">
                <h2 className="sg-section-title"><i className="fa-solid fa-calendar-check" /> Availability</h2>
                <p className="sg-section-sub">Set your working hours, session limits and consultation modes</p>
              </div>

              {/* Online status */}
              <div className="sg-card">
                <p className="sg-card-label">Online Status</p>
                <div className="sg-toggle-row">
                  <div className="sg-toggle-info">
                    <p className="sg-toggle-label">Available for consultations</p>
                    <p className="sg-toggle-sub">Clients can book sessions and send requests when you are online</p>
                  </div>
                  <Toggle checked={avail.online} onChange={() => setAvail(p => ({ ...p, online: !p.online }))} />
                </div>
              </div>

              {/* Working days */}
              <div className="sg-card">
                <p className="sg-card-label">Working Days</p>
                <div className="sg-days-grid">
                  {DAYS.map(d => (
                    <button
                      key={d}
                      className={`sg-day-btn${avail[d] ? ' sg-day-btn--active' : ''}`}
                      onClick={() => setAvail(p => ({ ...p, [d]: !p[d] }))}
                    >
                      {d.slice(0, 3).charAt(0).toUpperCase() + d.slice(1, 3)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hours + limits */}
              <div className="sg-card">
                <p className="sg-card-label">Working Hours & Session Limits</p>
                <div className="sg-form-grid">
                  <div className="sg-field">
                    <label className="sg-label">Start Time</label>
                    <input className="sg-input" type="time" value={avail.startTime}
                      onChange={e => setAvail(p => ({ ...p, startTime: e.target.value }))} />
                  </div>
                  <div className="sg-field">
                    <label className="sg-label">End Time</label>
                    <input className="sg-input" type="time" value={avail.endTime}
                      onChange={e => setAvail(p => ({ ...p, endTime: e.target.value }))} />
                  </div>
                  <div className="sg-field">
                    <label className="sg-label">Session Duration (mins)</label>
                    <select className="sg-select" value={avail.sessionDuration}
                      onChange={e => setAvail(p => ({ ...p, sessionDuration: e.target.value }))}>
                      {['30','45','60','90'].map(v => <option key={v} value={v}>{v} minutes</option>)}
                    </select>
                  </div>
                  <div className="sg-field">
                    <label className="sg-label">Buffer Between Sessions (mins)</label>
                    <select className="sg-select" value={avail.bufferMins}
                      onChange={e => setAvail(p => ({ ...p, bufferMins: e.target.value }))}>
                      {['0','10','15','20','30'].map(v => <option key={v} value={v}>{v === '0' ? 'No buffer' : `${v} minutes`}</option>)}
                    </select>
                  </div>
                  <div className="sg-field">
                    <label className="sg-label">Max Sessions Per Day</label>
                    <input className="sg-input" type="number" min={1} max={20} value={avail.maxPerDay}
                      onChange={e => setAvail(p => ({ ...p, maxPerDay: e.target.value }))} />
                  </div>
                </div>
              </div>

              {/* Consultation modes */}
              <div className="sg-card">
                <p className="sg-card-label">Consultation Modes</p>
                <div className="sg-toggle-list">
                  {[
                    { key: 'modeVideo' as const,    label: 'Video Call',  sub: 'Google Meet, Zoom or built-in video', icon: 'fa-solid fa-video' },
                    { key: 'modeInPerson' as const, label: 'In-Person',   sub: 'Clients visit your registered clinic address', icon: 'fa-solid fa-location-dot' },
                    { key: 'modeChat' as const,     label: 'Chat / Text', sub: 'Async text-based consultation',        icon: 'fa-solid fa-comment' },
                  ].map(m => (
                    <div key={m.key} className="sg-toggle-row">
                      <div className="sg-mode-icon"><i className={m.icon} /></div>
                      <div className="sg-toggle-info">
                        <p className="sg-toggle-label">{m.label}</p>
                        <p className="sg-toggle-sub">{m.sub}</p>
                      </div>
                      <Toggle checked={avail[m.key]} onChange={() => setAvail(p => ({ ...p, [m.key]: !p[m.key] }))} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Booking preferences */}
              <div className="sg-card">
                <p className="sg-card-label">Booking Preferences</p>
                <div className="sg-toggle-list">
                  <div className="sg-toggle-row">
                    <div className="sg-toggle-info">
                      <p className="sg-toggle-label">Instant Booking</p>
                      <p className="sg-toggle-sub">Clients can book without waiting for your manual approval</p>
                    </div>
                    <Toggle checked={avail.instantBook} onChange={() => setAvail(p => ({ ...p, instantBook: !p.instantBook }))} />
                  </div>
                  <div className="sg-toggle-row">
                    <div className="sg-toggle-info">
                      <p className="sg-toggle-label">Auto-accept Returning Clients</p>
                      <p className="sg-toggle-sub">Automatically accept new requests from existing clients</p>
                    </div>
                    <Toggle checked={avail.autoAccept} onChange={() => setAvail(p => ({ ...p, autoAccept: !p.autoAccept }))} />
                  </div>
                </div>
              </div>

              {saved === 'availability' && <div className="sg-saved-toast"><i className="fa-solid fa-circle-check" /> Changes saved successfully</div>}
              <SaveBar onSave={() => save('availability')} />
            </div>
          )}

          {/* ── SECURITY ── */}
          {section === 'security' && (
            <div className="sg-section">
              <div className="sg-section-header">
                <h2 className="sg-section-title"><i className="fa-solid fa-shield-halved" /> Security</h2>
                <p className="sg-section-sub">Manage your password, two-factor authentication and privacy settings</p>
              </div>

              {/* Password */}
              <div className="sg-card">
                <p className="sg-card-label">Change Password</p>
                <div className="sg-form-grid">
                  <div className="sg-field sg-field--full">
                    <label className="sg-label">Current Password</label>
                    <input className="sg-input" type="password" placeholder="••••••••••" />
                  </div>
                  <div className="sg-field">
                    <label className="sg-label">New Password</label>
                    <input className="sg-input" type="password" placeholder="Min 8 characters" />
                  </div>
                  <div className="sg-field">
                    <label className="sg-label">Confirm New Password</label>
                    <input className="sg-input" type="password" placeholder="Repeat new password" />
                  </div>
                </div>
                <div className="sg-password-rules">
                  {['At least 8 characters','One uppercase letter','One number','One special character'].map(r => (
                    <span key={r} className="sg-pw-rule"><i className="fa-solid fa-circle" /> {r}</span>
                  ))}
                </div>
                <button className="sg-btn sg-btn--green" style={{ marginTop: 12 }}>Update Password</button>
              </div>

              {/* 2FA + alerts */}
              <div className="sg-card">
                <p className="sg-card-label">Account Security</p>
                <div className="sg-toggle-list">
                  <div className="sg-toggle-row">
                    <div className="sg-toggle-info">
                      <p className="sg-toggle-label">Two-Factor Authentication</p>
                      <p className="sg-toggle-sub">Require a one-time code on every login via SMS or authenticator app</p>
                    </div>
                    <Toggle checked={security.twoFactor} onChange={() => setSecurity(p => ({ ...p, twoFactor: !p.twoFactor }))} />
                  </div>
                  <div className="sg-toggle-row">
                    <div className="sg-toggle-info">
                      <p className="sg-toggle-label">Login Activity Alerts</p>
                      <p className="sg-toggle-sub">Get an email when your account is logged into from a new device</p>
                    </div>
                    <Toggle checked={security.loginAlerts} onChange={() => setSecurity(p => ({ ...p, loginAlerts: !p.loginAlerts }))} />
                  </div>
                </div>
              </div>

              {/* Privacy */}
              <div className="sg-card">
                <p className="sg-card-label">Privacy</p>
                <div className="sg-toggle-list">
                  <div className="sg-toggle-row">
                    <div className="sg-toggle-info">
                      <p className="sg-toggle-label">Public Profile</p>
                      <p className="sg-toggle-sub">Your profile is searchable and visible on the MeriDiet directory</p>
                    </div>
                    <Toggle checked={security.profilePublic} onChange={() => setSecurity(p => ({ ...p, profilePublic: !p.profilePublic }))} />
                  </div>
                  <div className="sg-toggle-row">
                    <div className="sg-toggle-info">
                      <p className="sg-toggle-label">Show Reviews Publicly</p>
                      <p className="sg-toggle-sub">Client reviews appear on your public profile page</p>
                    </div>
                    <Toggle checked={security.showReviews} onChange={() => setSecurity(p => ({ ...p, showReviews: !p.showReviews }))} />
                  </div>
                  <div className="sg-toggle-row">
                    <div className="sg-toggle-info">
                      <p className="sg-toggle-label">Show Earnings on Profile</p>
                      <p className="sg-toggle-sub">Display approximate earnings badge on your public listing</p>
                    </div>
                    <Toggle checked={security.showEarnings} onChange={() => setSecurity(p => ({ ...p, showEarnings: !p.showEarnings }))} />
                  </div>
                </div>
              </div>

              {/* Login sessions */}
              <div className="sg-card">
                <p className="sg-card-label">Active Sessions</p>
                <div className="sg-session-list">
                  {[
                    { device: 'Chrome · Windows 11', location: 'New Delhi, India', time: 'Active now',    current: true  },
                    { device: 'Safari · iPhone 15',  location: 'New Delhi, India', time: '2 hours ago',   current: false },
                    { device: 'Chrome · MacBook',    location: 'Mumbai, India',    time: '3 days ago',    current: false },
                  ].map((s, i) => (
                    <div key={i} className="sg-session-row">
                      <div className="sg-session-icon"><i className="fa-solid fa-laptop" /></div>
                      <div className="sg-session-info">
                        <p className="sg-session-device">{s.device} {s.current && <span className="sg-session-current">Current</span>}</p>
                        <p className="sg-session-meta">{s.location} · {s.time}</p>
                      </div>
                      {!s.current && <button className="sg-session-revoke">Revoke</button>}
                    </div>
                  ))}
                </div>
                <button className="sg-btn sg-btn--danger" style={{ marginTop: 12 }}>
                  <i className="fa-solid fa-right-from-bracket" /> Sign Out All Other Devices
                </button>
              </div>

              {/* Danger zone */}
              <div className="sg-card sg-danger-card">
                <p className="sg-card-label sg-danger-label">Danger Zone</p>
                <p className="sg-danger-text">Permanently delete your MeriDiet account, all client data, and earnings history. This action cannot be undone.</p>
                <button className="sg-btn sg-btn--danger">
                  <i className="fa-solid fa-trash" /> Delete My Account
                </button>
              </div>

              {saved === 'security' && <div className="sg-saved-toast"><i className="fa-solid fa-circle-check" /> Changes saved successfully</div>}
              <SaveBar onSave={() => save('security')} />
            </div>
          )}

          {/* ── PREFERENCES ── */}
          {section === 'preferences' && (
            <div className="sg-section">
              <div className="sg-section-header">
                <h2 className="sg-section-title"><i className="fa-solid fa-sliders" /> Preferences</h2>
                <p className="sg-section-sub">Language, timezone, and display options</p>
              </div>

              <div className="sg-card">
                <p className="sg-card-label">Regional Settings</p>
                <div className="sg-form-grid">
                  <div className="sg-field">
                    <label className="sg-label">Language</label>
                    <select className="sg-select" value={prefs.language}
                      onChange={e => setPrefs(p => ({ ...p, language: e.target.value }))}>
                      {['English','Hindi','Punjabi','Tamil','Telugu','Marathi'].map(l => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                  <div className="sg-field">
                    <label className="sg-label">Timezone</label>
                    <select className="sg-select" value={prefs.timezone}
                      onChange={e => setPrefs(p => ({ ...p, timezone: e.target.value }))}>
                      {['Asia/Kolkata (IST)','Asia/Dubai (GST)','Europe/London (GMT)','America/New_York (EST)'].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="sg-field">
                    <label className="sg-label">Currency</label>
                    <select className="sg-select" value={prefs.currency}
                      onChange={e => setPrefs(p => ({ ...p, currency: e.target.value }))}>
                      {['INR (₹)','USD ($)','GBP (£)','EUR (€)','AED (د.إ)'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="sg-field">
                    <label className="sg-label">Date Format</label>
                    <select className="sg-select" value={prefs.dateFormat}
                      onChange={e => setPrefs(p => ({ ...p, dateFormat: e.target.value }))}>
                      {['DD/MM/YYYY','MM/DD/YYYY','YYYY-MM-DD'].map(f => <option key={f}>{f}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="sg-card">
                <p className="sg-card-label">Appearance</p>
                <div className="sg-theme-row">
                  {[
                    { key: 'light', icon: 'fa-solid fa-sun',         label: 'Light'  },
                    { key: 'dark',  icon: 'fa-solid fa-moon',         label: 'Dark'   },
                    { key: 'auto',  icon: 'fa-solid fa-circle-half-stroke', label: 'System' },
                  ].map(t => (
                    <button
                      key={t.key}
                      className={`sg-theme-btn${prefs.theme === t.key ? ' sg-theme-btn--active' : ''}`}
                      onClick={() => setPrefs(p => ({ ...p, theme: t.key }))}
                    >
                      <i className={t.icon} />
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
                <p className="sg-theme-note"><i className="fa-solid fa-circle-info" /> Dark mode applies to the dietitian dashboard only</p>
              </div>

              {saved === 'preferences' && <div className="sg-saved-toast"><i className="fa-solid fa-circle-check" /> Changes saved successfully</div>}
              <SaveBar onSave={() => save('preferences')} />
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
