import { useState, useEffect, useRef } from 'react'
import SEO from '../components/SEO'
import careerApi, { Job, ApplyBody, JobType } from '../api/career'
import { uploadSingleDocument } from '../api/dietitian'
import { ApiError } from '../api/client'

const JOB_TYPE_LABEL: Record<JobType, string> = {
  full_time:  'Full Time',
  part_time:  'Part Time',
  contract:   'Contract',
  internship: 'Internship',
}

const JOB_TYPE_OPTIONS = [
  { value: '',           label: 'All Types' },
  { value: 'full_time',  label: 'Full Time' },
  { value: 'part_time',  label: 'Part Time' },
  { value: 'contract',   label: 'Contract' },
  { value: 'internship', label: 'Internship' },
]

const PERKS = [
  {
    icon: 'fa-solid fa-laptop-house',
    title: 'Remote-First',
    desc:  'Work from anywhere in India. We believe great work happens everywhere.',
  },
  {
    icon: 'fa-solid fa-seedling',
    title: 'Mission-Driven',
    desc:  'Help millions of Indians eat healthier. Your work creates real-world impact.',
  },
  {
    icon: 'fa-solid fa-chart-line',
    title: 'Grow Fast',
    desc:  'Steep learning curve, clear ownership, and rapid career progression.',
  },
  {
    icon: 'fa-solid fa-hand-holding-heart',
    title: 'Great Benefits',
    desc:  'Competitive compensation, health coverage, and generous leave policy.',
  },
]

const EMPTY_FORM = {
  full_name:        '',
  email:            '',
  phone:            '',
  current_location: '',
  total_experience: '',
  current_company:  '',
  current_ctc:      '',
  expected_ctc:     '',
  notice_period:    '',
  cover_letter:     '',
  linkedin_url:     '',
}

type ModalStep = 'detail' | 'form' | 'success'

export default function Career() {
  const [jobs,        setJobs]        = useState<Job[]>([])
  const [loading,     setLoading]     = useState(true)
  const [fetchError,  setFetchError]  = useState<string | null>(null)
  const [deptFilter,  setDeptFilter]  = useState('')
  const [typeFilter,  setTypeFilter]  = useState('')
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [step,        setStep]        = useState<ModalStep>('detail')
  const [form,        setForm]        = useState(EMPTY_FORM)
  const [formErrors,  setFormErrors]  = useState<Record<string, string>>({})
  const [resumeFile,  setResumeFile]  = useState<File | null>(null)
  const [resumeError, setResumeError] = useState<string | null>(null)
  const [submitting,  setSubmitting]  = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [appId,       setAppId]       = useState<number | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { fetchJobs() }, [deptFilter, typeFilter])

  async function fetchJobs() {
    setLoading(true)
    setFetchError(null)
    try {
      const data = await careerApi.listJobs({
        department: deptFilter || undefined,
        job_type:   typeFilter || undefined,
      })
      setJobs(data)
    } catch (err) {
      setFetchError(err instanceof ApiError ? err.message : 'Failed to load positions. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function openJob(job: Job) {
    setSelectedJob(job)
    setStep('detail')
    setForm(EMPTY_FORM)
    setFormErrors({})
    setResumeFile(null)
    setResumeError(null)
    setSubmitError(null)
    setAppId(null)
    document.body.style.overflow = 'hidden'
  }

  function closeModal() {
    setSelectedJob(null)
    document.body.style.overflow = ''
  }

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    setFormErrors(prev => ({ ...prev, [name]: '' }))
  }

  function handleResumeFile(file: File | null) {
    if (!file) return
    if (file.type !== 'application/pdf') {
      setResumeError('Please upload a PDF file.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setResumeError('File must be under 5 MB.')
      return
    }
    setResumeFile(file)
    setResumeError(null)
    setFormErrors(prev => ({ ...prev, resume: '' }))
  }

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!form.full_name.trim())        errs.full_name        = 'Full name is required'
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                                       errs.email            = 'Valid email is required'
    if (!form.phone.trim() || !/^\d{10}$/.test(form.phone.replace(/\D/g, '')))
                                       errs.phone            = 'Valid 10-digit phone is required'
    if (!form.current_location.trim()) errs.current_location = 'Current location is required'
    if (!form.total_experience.trim()) errs.total_experience = 'Total experience is required'
    if (!resumeFile)                   errs.resume           = 'Please upload your resume (PDF)'
    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleApply(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedJob || !validate() || !resumeFile) return

    setSubmitting(true)
    setSubmitError(null)
    try {
      const resume_url = await uploadSingleDocument(resumeFile, 'resumes')
      const body: ApplyBody = {
        full_name:        form.full_name.trim(),
        email:            form.email.trim(),
        phone:            form.phone.trim(),
        current_location: form.current_location.trim(),
        total_experience: form.total_experience.trim(),
        resume_url,
        ...(form.current_company ? { current_company: form.current_company }   : {}),
        ...(form.current_ctc     ? { current_ctc: form.current_ctc }           : {}),
        ...(form.expected_ctc    ? { expected_ctc: form.expected_ctc }         : {}),
        ...(form.notice_period   ? { notice_period: form.notice_period }       : {}),
        ...(form.cover_letter    ? { cover_letter: form.cover_letter.trim() }  : {}),
        ...(form.linkedin_url    ? { linkedin_url: form.linkedin_url.trim() }  : {}),
      }
      const result = await careerApi.apply(selectedJob.id, body)
      setAppId(result.id)
      setStep('success')
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Failed to submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const departments = Array.from(new Set(jobs.map(j => j.department))).sort()

  function formatDeadline(date: string) {
    return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  function isClosingSoon(deadline: string) {
    return (new Date(deadline).getTime() - Date.now()) < 7 * 24 * 60 * 60 * 1000
  }

  return (
    <div className="career-page">
      <SEO
        title="Careers – Join India's Leading AI Nutrition Platform"
        description="Join the MeriDiet team and help transform nutrition for millions of Indians. Explore open roles across nutrition, tech, design, and more."
        canonical="/careers"
      />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className="career-hero">
        <div className="container">
          <span className="section-tag">We're Hiring</span>
          <h1 className="career-hero-title">Build the Future of Nutrition</h1>
          <p className="career-hero-sub">
            Join a passionate team building India's most trusted AI-powered nutrition platform.
            Make a real difference in how people eat and live.
          </p>
          <a href="#open-positions" className="btn-primary career-hero-cta">
            See Open Positions <i className="fa-solid fa-arrow-down" />
          </a>
        </div>
      </div>

      {/* ── Perks ────────────────────────────────────────────── */}
      <section className="career-perks-section">
        <div className="container">
          <h2 className="career-section-title">Why MeriDiet?</h2>
          <p className="career-section-sub">
            We're a small, focused team solving a big problem. Here's what makes us different.
          </p>
          <div className="career-perks-grid">
            {PERKS.map((p, i) => (
              <div key={i} className="career-perk-card">
                <div className="career-perk-icon"><i className={p.icon} /></div>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Open Positions ───────────────────────────────────── */}
      <section className="career-positions-section" id="open-positions">
        <div className="container">
          <h2 className="career-section-title">Open Positions</h2>

          {/* Filters */}
          <div className="career-filters">
            <select
              className="career-select"
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            <select
              className="career-select"
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
            >
              {JOB_TYPE_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* States */}
          {loading ? (
            <div className="career-state-wrap">
              <div className="page-loader-spinner" />
              <p>Loading positions…</p>
            </div>
          ) : fetchError ? (
            <div className="career-state-wrap">
              <p className="career-fetch-error">{fetchError}</p>
              <button className="btn-outline" onClick={fetchJobs}>Try Again</button>
            </div>
          ) : jobs.length === 0 ? (
            <div className="career-empty">
              <div className="career-empty-icon"><i className="fa-solid fa-briefcase" /></div>
              <h3>No open positions right now</h3>
              <p>
                We're always growing. Check back soon or send your resume to{' '}
                <a href="mailto:careers@meridiet.com">careers@meridiet.com</a>
              </p>
            </div>
          ) : (
            <div className="career-grid">
              {jobs.map(job => (
                <button key={job.id} className="career-card" onClick={() => openJob(job)}>
                  <div className="career-card-top">
                    <div className="career-card-badges">
                      <span className="career-dept-badge">{job.department}</span>
                      <span className={`career-type-badge career-type-badge--${job.job_type}`}>
                        {JOB_TYPE_LABEL[job.job_type] ?? job.job_type}
                      </span>
                    </div>
                    {isClosingSoon(job.deadline) && (
                      <span className="career-urgent">Closing Soon</span>
                    )}
                  </div>

                  <h3 className="career-card-title">{job.title}</h3>

                  <div className="career-card-info">
                    <span><i className="fa-solid fa-location-dot" /> {job.location}</span>
                    <span><i className="fa-solid fa-briefcase" /> {job.experience_required}</span>
                    <span><i className="fa-solid fa-indian-rupee-sign" /> {job.salary_range}</span>
                  </div>

                  <p className="career-card-desc">
                    {job.description.length > 140
                      ? job.description.slice(0, 140) + '…'
                      : job.description}
                  </p>

                  <div className="career-card-footer">
                    <span className="career-deadline">
                      <i className="fa-regular fa-calendar" /> Apply by {formatDeadline(job.deadline)}
                    </span>
                    <span className="career-view-link">
                      View Details <i className="fa-solid fa-arrow-right" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA strip ────────────────────────────────────────── */}
      <section className="career-cta-section">
        <div className="container">
          <h2>Don't see a role that fits?</h2>
          <p>We'd still love to hear from you. Drop your resume and we'll reach out when something opens up.</p>
          <a href="mailto:careers@meridiet.com" className="btn-primary">
            Send Your Resume <i className="fa-solid fa-paper-plane" />
          </a>
        </div>
      </section>

      {/* ── Job Modal ────────────────────────────────────────── */}
      {selectedJob && (
        <div
          className="career-modal-overlay"
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div className="career-modal" role="dialog" aria-modal="true">

            {/* Header */}
            <div className="career-modal-header">
              <div className="career-modal-header-left">
                {step === 'form' && (
                  <button className="career-back-btn" onClick={() => setStep('detail')}>
                    <i className="fa-solid fa-arrow-left" /> Back
                  </button>
                )}
                <h2 className="career-modal-title">
                  {step === 'success'
                    ? 'Application Submitted!'
                    : step === 'form'
                    ? `Apply — ${selectedJob.title}`
                    : selectedJob.title}
                </h2>
                {step === 'detail' && (
                  <div className="career-modal-meta">
                    <span className={`career-type-badge career-type-badge--${selectedJob.job_type}`}>
                      {JOB_TYPE_LABEL[selectedJob.job_type]}
                    </span>
                    <span className="career-modal-dept">{selectedJob.department}</span>
                  </div>
                )}
              </div>
              <button className="career-modal-close" onClick={closeModal} aria-label="Close modal">
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {/* Body */}
            <div className="career-modal-body">
              {step === 'success' && (
                <div className="career-success">
                  <div className="career-success-icon">
                    <i className="fa-solid fa-circle-check" />
                  </div>
                  <h3>You're all set!</h3>
                  <p>
                    Application <strong>#{appId}</strong> submitted for{' '}
                    <strong>{selectedJob.title}</strong>.<br />
                    Our team will review it and get back to you within 5–7 business days.
                  </p>
                  <button className="btn-primary" onClick={closeModal}>Close</button>
                </div>
              )}

              {step === 'form' && (
                <form className="career-apply-form" onSubmit={handleApply} noValidate>

                  {/* Personal Details */}
                  <div className="career-form-section">
                    <h4>Personal Details</h4>
                    <div className="career-form-row">
                      <div className="career-field">
                        <label>Full Name <span className="req">*</span></label>
                        <input
                          name="full_name"
                          value={form.full_name}
                          onChange={handleFormChange}
                          placeholder="Your full name"
                          className={formErrors.full_name ? 'has-error' : ''}
                        />
                        {formErrors.full_name && <span className="career-field-err">{formErrors.full_name}</span>}
                      </div>
                      <div className="career-field">
                        <label>Email Address <span className="req">*</span></label>
                        <input
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={handleFormChange}
                          placeholder="you@example.com"
                          className={formErrors.email ? 'has-error' : ''}
                        />
                        {formErrors.email && <span className="career-field-err">{formErrors.email}</span>}
                      </div>
                    </div>

                    <div className="career-form-row">
                      <div className="career-field">
                        <label>Phone Number <span className="req">*</span></label>
                        <input
                          name="phone"
                          type="tel"
                          value={form.phone}
                          onChange={handleFormChange}
                          placeholder="10-digit mobile number"
                          className={formErrors.phone ? 'has-error' : ''}
                        />
                        {formErrors.phone && <span className="career-field-err">{formErrors.phone}</span>}
                      </div>
                      <div className="career-field">
                        <label>Current Location <span className="req">*</span></label>
                        <input
                          name="current_location"
                          value={form.current_location}
                          onChange={handleFormChange}
                          placeholder="City, State"
                          className={formErrors.current_location ? 'has-error' : ''}
                        />
                        {formErrors.current_location && <span className="career-field-err">{formErrors.current_location}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Professional Details */}
                  <div className="career-form-section">
                    <h4>Professional Details</h4>
                    <div className="career-form-row">
                      <div className="career-field">
                        <label>Total Experience <span className="req">*</span></label>
                        <input
                          name="total_experience"
                          value={form.total_experience}
                          onChange={handleFormChange}
                          placeholder="e.g. 3 years"
                          className={formErrors.total_experience ? 'has-error' : ''}
                        />
                        {formErrors.total_experience && <span className="career-field-err">{formErrors.total_experience}</span>}
                      </div>
                      <div className="career-field">
                        <label>Current Company</label>
                        <input
                          name="current_company"
                          value={form.current_company}
                          onChange={handleFormChange}
                          placeholder="Current employer (optional)"
                        />
                      </div>
                    </div>

                    <div className="career-form-row">
                      <div className="career-field">
                        <label>Current CTC</label>
                        <input
                          name="current_ctc"
                          value={form.current_ctc}
                          onChange={handleFormChange}
                          placeholder="e.g. 5 LPA"
                        />
                      </div>
                      <div className="career-field">
                        <label>Expected CTC</label>
                        <input
                          name="expected_ctc"
                          value={form.expected_ctc}
                          onChange={handleFormChange}
                          placeholder="e.g. 8 LPA"
                        />
                      </div>
                    </div>

                    <div className="career-form-row">
                      <div className="career-field">
                        <label>Notice Period</label>
                        <input
                          name="notice_period"
                          value={form.notice_period}
                          onChange={handleFormChange}
                          placeholder="e.g. 30 days"
                        />
                      </div>
                      <div className="career-field">
                        <label>LinkedIn URL</label>
                        <input
                          name="linkedin_url"
                          value={form.linkedin_url}
                          onChange={handleFormChange}
                          placeholder="https://linkedin.com/in/..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Resume Upload */}
                  <div className="career-form-section">
                    <h4>Resume <span className="req">*</span></h4>
                    <div
                      className={`career-resume-drop${resumeFile ? ' has-file' : ''}${(resumeError || formErrors.resume) ? ' has-err' : ''}`}
                      onClick={() => fileRef.current?.click()}
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => { e.preventDefault(); handleResumeFile(e.dataTransfer.files[0] ?? null) }}
                    >
                      <input
                        ref={fileRef}
                        type="file"
                        accept=".pdf,application/pdf"
                        style={{ display: 'none' }}
                        onChange={e => handleResumeFile(e.target.files?.[0] ?? null)}
                      />
                      {resumeFile ? (
                        <>
                          <i className="fa-solid fa-file-pdf career-resume-icon career-resume-icon--pdf" />
                          <p className="career-resume-name">{resumeFile.name}</p>
                          <span className="career-resume-size">
                            {(resumeFile.size / 1024 / 1024).toFixed(1)} MB · Click to change
                          </span>
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-cloud-arrow-up career-resume-icon" />
                          <p>Drag &amp; drop your resume or <strong>browse</strong></p>
                          <span className="career-resume-hint">PDF only · Max 5 MB</span>
                        </>
                      )}
                    </div>
                    {(resumeError || formErrors.resume) && (
                      <span className="career-field-err">{resumeError || formErrors.resume}</span>
                    )}
                  </div>

                  {/* Cover Letter */}
                  <div className="career-form-section">
                    <h4>Cover Letter <span className="career-optional">(optional)</span></h4>
                    <textarea
                      name="cover_letter"
                      value={form.cover_letter}
                      onChange={handleFormChange}
                      placeholder="Tell us why you're excited about this role and what makes you a great fit…"
                      rows={4}
                    />
                  </div>

                  {submitError && <p className="career-submit-err">{submitError}</p>}

                  <button type="submit" className="btn-primary career-submit-btn" disabled={submitting}>
                    {submitting
                      ? <><span className="career-btn-spin" /> Uploading &amp; Submitting…</>
                      : <>Submit Application <i className="fa-solid fa-paper-plane" /></>}
                  </button>
                </form>
              )}

              {step === 'detail' && (
                <div className="career-job-detail">
                  {/* Highlights grid */}
                  <div className="career-highlights">
                    <div className="career-highlight">
                      <i className="fa-solid fa-location-dot" />
                      <div>
                        <span>Location</span>
                        <strong>{selectedJob.location}</strong>
                      </div>
                    </div>
                    <div className="career-highlight">
                      <i className="fa-solid fa-briefcase" />
                      <div>
                        <span>Experience</span>
                        <strong>{selectedJob.experience_required}</strong>
                      </div>
                    </div>
                    <div className="career-highlight">
                      <i className="fa-solid fa-indian-rupee-sign" />
                      <div>
                        <span>Salary</span>
                        <strong>{selectedJob.salary_range}</strong>
                      </div>
                    </div>
                    <div className="career-highlight">
                      <i className="fa-regular fa-calendar" />
                      <div>
                        <span>Apply By</span>
                        <strong>{formatDeadline(selectedJob.deadline)}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="career-detail-section">
                    <h4>About the Role</h4>
                    <p>{selectedJob.description}</p>
                  </div>

                  {selectedJob.responsibilities.length > 0 && (
                    <div className="career-detail-section">
                      <h4>Responsibilities</h4>
                      <ul className="career-checklist">
                        {selectedJob.responsibilities.map((r, i) => (
                          <li key={i}>
                            <i className="fa-solid fa-check" />
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedJob.requirements.length > 0 && (
                    <div className="career-detail-section">
                      <h4>Requirements</h4>
                      <ul className="career-checklist">
                        {selectedJob.requirements.map((r, i) => (
                          <li key={i}>
                            <i className="fa-solid fa-check" />
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {step === 'detail' && (
              <div className="career-modal-footer">
                <button className="btn-primary career-apply-btn" onClick={() => setStep('form')}>
                  Apply Now <i className="fa-solid fa-arrow-right" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
