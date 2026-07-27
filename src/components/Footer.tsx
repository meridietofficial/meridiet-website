import { Link } from 'react-router-dom'

const socialLinks = [
  { icon: 'fa-brands fa-instagram',  label: 'Instagram', cls: 'social-icon--insta', url: 'https://www.instagram.com/meridietofficial/' },
  { icon: 'fa-brands fa-facebook-f', label: 'Facebook',  cls: 'social-icon--fb',    url: 'https://www.facebook.com/people/MeriDiet/61564942492475/' },
  { icon: 'fa-brands fa-x-twitter',  label: 'X',         cls: 'social-icon--tw',    url: 'https://x.com/Meridietoffical' },
  { icon: 'fa-brands fa-youtube',    label: 'YouTube',   cls: 'social-icon--yt',    url: 'https://www.youtube.com/@MeriDiet' },
  { icon: 'fa-brands fa-linkedin-in',label: 'LinkedIn',  cls: 'social-icon--li',    url: 'https://www.linkedin.com/company/meridiet/' },
]

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <a href="#" className="footer-logo">
              <img src="/logo-footer.png" alt="MeriDiet" className="footer-logo-img" />
            </a>
            <p className="footer-tagline">
              India's First AI-Powered Platform Blending Intelligent Technology with Expert Dietitians. Smarter, personalized nutrition — thoughtfully crafted for complete well-being.
            </p>
            <div className="footer-social">
              {socialLinks.map((s, i) => (
                <a
                  key={i}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className={`social-icon ${s.cls}`}
                >
                  <i className={s.icon} />
                </a>
              ))}
            </div>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <Link to="/about">About Us</Link>
            <Link to="/blog">Blog & Press</Link>
            <Link to="/faq">FAQ</Link>
          </div>

          <div className="footer-col">
            <h4>Product</h4>
            <Link to="/#how-it-works">How It Works</Link>
            <Link to="/#plans">Plans</Link>
            <Link to="/#sample-diet">Sample Diet</Link>
            <Link to="/#pricing">Pricing</Link>
            <Link to="/calculators">Calculators</Link>
            <Link to="/nutritionist-course">Nutritionist Course</Link>
          </div>

          <div className="footer-col">
            <h4>Support</h4>
            <Link to="/contact">Contact Us</Link>
            <Link to="/faq">FAQ</Link>
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-conditions">Terms of Service</Link>
            <Link to="/refund-policy">Refund Policy</Link>
          </div>

          <div className="footer-col">
            <h4>Contact</h4>
            <p className="footer-contact-item">📧 support@meridiet.in</p>
            <p className="footer-contact-item">📱 +91 960 960 6009</p>
            <p className="footer-contact-item">🏢 Uttar Pradesh, India</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 MeriDiet. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
