import { useState } from 'react'
import contactApi from '../api/contact'
import { ApiError } from '../api/client'

const EMPTY_FORM = { name: '', email: '', phone: '', subject: '', message: '' }

type FieldErrors = { name?: string; email?: string; phone?: string; message?: string }

const ContactUs = () => {
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [honeypot, setHoneypot] = useState('')   // anti-spam: bots fill this, humans don't

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    setErrors(prev => {
      const next = { ...prev, [name]: undefined }
      // email & phone share an "either is required" error — clear both together
      if (name === 'email' || name === 'phone') { next.email = undefined; next.phone = undefined }
      return next
    })
  }

  const validate = (): FieldErrors => {
    const e: FieldErrors = {}
    const email = form.email.trim()
    const phone = form.phone.trim()

    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.message.trim()) e.message = 'Message is required'

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      e.email = 'Please enter a valid email address'
    }
    // Require at least one way to reach back
    if (!email && !phone) {
      e.email = 'Enter an email or phone number'
      e.phone = 'Enter an email or phone number'
    }
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (honeypot) return   // silently drop bot submissions

    const fieldErrors = validate()
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
      return
    }

    setLoading(true)
    setError(null)
    try {
      await contactApi.submit({
        name: form.name.trim(),
        message: form.message.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        subject: form.subject || undefined,
      })
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="contact-page">
      {/* Hero */}
      <div className="privacy-hero">
        <div className="container">
          <h1 className="privacy-hero-title">Contact Us</h1>
          <p className="privacy-hero-sub">We're here to help — reach out and we'll get back to you shortly.</p>
        </div>
      </div>

      <div className="container contact-body">

        {/* Info cards */}
        <div className="contact-cards">
          <div className="contact-card">
            <div className="contact-card-icon"><i className="fa-solid fa-envelope" /></div>
            <div className="contact-card-body">
              <h3>Email Us</h3>
              <p>support@meridiet.com</p>
              <a href="mailto:support@meridiet.com" className="contact-card-link">
                Send an email <i className="fa-solid fa-arrow-right" />
              </a>
            </div>
          </div>
          <div className="contact-card">
            <div className="contact-card-icon"><i className="fa-brands fa-whatsapp" /></div>
            <div className="contact-card-body">
              <h3>Call / WhatsApp</h3>
              <p>+91 960 960 6009</p>
              <a href="https://wa.me/919609606009" target="_blank" rel="noreferrer" className="contact-card-link">
                Chat on WhatsApp <i className="fa-solid fa-arrow-right" />
              </a>
            </div>
          </div>
          <div className="contact-card">
            <div className="contact-card-icon"><i className="fa-solid fa-location-dot" /></div>
            <div className="contact-card-body">
              <h3>Office</h3>
              <p>Uttar Pradesh, India</p>
              <span className="contact-card-link contact-card-link--static">
                <i className="fa-regular fa-clock" /> Mon – Sat, 10am – 7pm
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="contact-form-wrap">
          <h2 className="contact-form-title">Send Us a Message</h2>
          <p className="contact-form-subtitle">Fill in the form below and we'll get back to you within 24 hours.</p>

          {submitted ? (
            <div className="contact-success">
              <span className="contact-success-icon"><i className="fa-solid fa-circle-check" /></span>
              <h3>Message Sent!</h3>
              <p>Thank you for reaching out. Our team will get back to you within 24 hours.</p>
              <button className="btn-primary" onClick={() => { setSubmitted(false); setForm(EMPTY_FORM); setError(null); setErrors({}) }}>
                Send Another Message
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit} noValidate>
              <div className="contact-form-row">
                <div className="contact-field">
                  <label htmlFor="name">Full Name <span>*</span></label>
                  <input id="name" name="name" type="text" placeholder="Your full name" value={form.name} onChange={handleChange} className={errors.name ? 'has-error' : ''} />
                  {errors.name && <span className="contact-field-err">{errors.name}</span>}
                </div>
                <div className="contact-field">
                  <label htmlFor="email">Email Address</label>
                  <input id="email" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} className={errors.email ? 'has-error' : ''} />
                  {errors.email && <span className="contact-field-err">{errors.email}</span>}
                </div>
              </div>

              <div className="contact-form-row">
                <div className="contact-field">
                  <label htmlFor="phone">Phone / WhatsApp</label>
                  <input id="phone" name="phone" type="tel" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={handleChange} className={errors.phone ? 'has-error' : ''} />
                  {errors.phone && <span className="contact-field-err">{errors.phone}</span>}
                </div>
                <div className="contact-field">
                  <label htmlFor="subject">Subject</label>
                  <select id="subject" name="subject" value={form.subject} onChange={handleChange}>
                    <option value="">Select a topic</option>
                    <option value="Diet Plan Query">Diet Plan Query</option>
                    <option value="Consultation Booking">Consultation Booking</option>
                    <option value="Subscription / Billing">Subscription / Billing</option>
                    <option value="Technical Support">Technical Support</option>
                    <option value="Feedback">Feedback</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="contact-field">
                <label htmlFor="message">Message <span>*</span></label>
                <textarea id="message" name="message" rows={5} placeholder="Write your message here..." value={form.message} onChange={handleChange} className={errors.message ? 'has-error' : ''} />
                {errors.message && <span className="contact-field-err">{errors.message}</span>}
              </div>

              {/* Honeypot — hidden from users, only bots fill it */}
              <input
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={e => setHoneypot(e.target.value)}
                style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
                aria-hidden="true"
              />

              {error && <p className="contact-error">{error}</p>}

              <button type="submit" className="btn-primary contact-submit" disabled={loading}>
                {loading ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  )
}

export default ContactUs
