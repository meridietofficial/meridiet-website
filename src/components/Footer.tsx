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
              <img src="/logo.png" alt="MeriDiet" className="footer-logo-img" />
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
            <a href="#about">About Us</a>
            <a href="#faq">FAQ</a>
            <a href="#">Careers</a>
            <a href="#">Press</a>
          </div>

          <div className="footer-col">
            <h4>Product</h4>
            <a href="#how-it-works">How It Works</a>
            <a href="#plans">Plans</a>
            <a href="#sample-diet">Sample Diet</a>
            <a href="#pricing">Pricing</a>
          </div>

          <div className="footer-col">
            <h4>Support</h4>
            <a href="#">Contact Us</a>
            <a href="#faq">FAQ</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>

          <div className="footer-col">
            <h4>Contact</h4>
            <p className="footer-contact-item">📧 hello@meridiet.in</p>
            <p className="footer-contact-item">📱 +91 98765 43210</p>
            <p className="footer-contact-item">🏢 Mumbai, India</p>
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
