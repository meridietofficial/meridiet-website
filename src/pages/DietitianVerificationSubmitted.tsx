import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthModal from '../components/AuthModal'
import SEO from '../components/SEO'

export default function DietitianVerificationSubmitted() {
  const navigate = useNavigate()
  const [loginOpen, setLoginOpen] = useState(false)

  return (
    <div className="jd2-page">
      <SEO noIndex={true} title="Verification Submitted" description="Verification submitted — private dietitian area." />
      <div className="jd2-card-wrap">
        <div className="jd2-card">
          <div className="jd2-review">
            <p className="jd2-review-almost">You are almost done</p>
            <p className="jd2-review-sub">We'll review all your documents</p>
            <img src="/review-illustration.png" alt="Review" className="jd2-review-img" />
            <h2 className="jd2-review-title">Application Submitted!</h2>
            <p className="jd2-review-desc">
              Our team will review your information and verify your account within 24–48 hours.
              You'll receive an email once your profile is approved.
            </p>
            <div className="jd2-review-box">
              <i className="fa-regular fa-clock jd2-review-box-icon" />
              Verification usually takes <strong>24–48 hours</strong>
            </div>
          </div>

          <div className="jd2-nav" style={{ justifyContent: 'center', gap: 12 }}>
            <button className="jd2-back-btn" onClick={() => navigate('/for-dietitians')}>
              ← Back to Home
            </button>
            <button className="jd2-next-btn" onClick={() => setLoginOpen(true)}>
              Login to Dashboard →
            </button>
          </div>
        </div>
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
