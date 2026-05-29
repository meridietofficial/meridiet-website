import { useState } from 'react'

const ContactUs = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
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
            <div className="contact-card-icon">📧</div>
            <h3>Email Us</h3>
            <p>support@meridiet.com</p>
            <a href="mailto:support@meridiet.com" className="contact-card-link">Send an email</a>
          </div>
          <div className="contact-card">
            <div className="contact-card-icon">📱</div>
            <h3>Call / WhatsApp</h3>
            <p>+91 960 960 6009</p>
            <a href="https://wa.me/919609606009" target="_blank" rel="noreferrer" className="contact-card-link">Chat on WhatsApp</a>
          </div>
          <div className="contact-card">
            <div className="contact-card-icon">🏢</div>
            <h3>Office</h3>
            <p>Uttar Pradesh, India</p>
            <span className="contact-card-link">Mon – Sat, 10am – 7pm</span>
          </div>
        </div>

        {/* Form */}
        <div className="contact-form-wrap">
          <h2 className="contact-form-title">Send Us a Message</h2>
          <p className="contact-form-subtitle">Fill in the form below and we'll get back to you within 24 hours.</p>

          {submitted ? (
            <div className="contact-success">
              <span className="contact-success-icon">✅</span>
              <h3>Message Sent!</h3>
              <p>Thank you for reaching out. Our team will get back to you within 24 hours.</p>
              <button className="btn-primary" onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }) }}>
                Send Another Message
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="contact-form-row">
                <div className="contact-field">
                  <label htmlFor="name">Full Name <span>*</span></label>
                  <input id="name" name="name" type="text" placeholder="Your full name" value={form.name} onChange={handleChange} required />
                </div>
                <div className="contact-field">
                  <label htmlFor="email">Email Address <span>*</span></label>
                  <input id="email" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
                </div>
              </div>

              <div className="contact-form-row">
                <div className="contact-field">
                  <label htmlFor="phone">Phone / WhatsApp</label>
                  <input id="phone" name="phone" type="tel" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={handleChange} />
                </div>
                <div className="contact-field">
                  <label htmlFor="subject">Subject <span>*</span></label>
                  <select id="subject" name="subject" value={form.subject} onChange={handleChange} required>
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
                <textarea id="message" name="message" rows={5} placeholder="Write your message here..." value={form.message} onChange={handleChange} required />
              </div>

              <button type="submit" className="btn-primary contact-submit">Send Message</button>
            </form>
          )}
        </div>

      </div>
    </div>
  )
}

export default ContactUs
