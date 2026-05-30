import { Link } from 'react-router-dom'

const socialLinks = [
  { icon: 'fa-brands fa-instagram',  label: 'Instagram', cls: 'social-icon--insta' },
  { icon: 'fa-brands fa-facebook-f', label: 'Facebook',  cls: 'social-icon--fb'    },
  { icon: 'fa-brands fa-x-twitter',  label: 'X',         cls: 'social-icon--tw'    },
  { icon: 'fa-brands fa-youtube',    label: 'YouTube',   cls: 'social-icon--yt'    },
  { icon: 'fa-brands fa-linkedin-in',label: 'LinkedIn',  cls: 'social-icon--li'    },
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
              India's most personalized nutrition platform, crafted by expert dietitians. Real Indian food. Real results.
            </p>
            <div className="footer-social">
              {socialLinks.map((s, i) => (
                <a key={i} href="#" aria-label={s.label} className={`social-icon ${s.cls}`}>
                  <i className={s.icon} />
                </a>
              ))}
            </div>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <Link to="/about">About Us</Link>
            <Link to="/faq">FAQ</Link>
            <a href="#">Careers</a>
            <a href="#">Press</a>
          </div>

          <div className="footer-col">
            <h4>Product</h4>
            <a href="/#how-it-works">How It Works</a>
            <a href="/#plans">Plans</a>
            <a href="/#sample-diet">Sample Diet</a>
            <a href="/#pricing">Pricing</a>
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
            <p className="footer-contact-item">📧 hello@meridiet.in</p>
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
