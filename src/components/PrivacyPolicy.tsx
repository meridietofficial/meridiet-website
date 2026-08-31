const sections = [
  {
    title: '1. Introduction',
    content: `Welcome to MeriDiet Technologies Pvt. Ltd. ("MeriDiet", "we", "our", or "us").

We value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, share, and protect your information when you use our website, mobile applications, diet planning services, calculators, consultations, AI tools, and related services.

By using our platform, you agree to the terms outlined in this Privacy Policy.`,
  },
  {
    title: '2. Information We Collect',
    content: null,
    subsections: [
      {
        title: 'A. Personal Information',
        items: ['Full name', 'Email address', 'Mobile number', 'Gender', 'Age', 'Date of birth', 'Profile photo (optional)', 'Address and location'],
      },
      {
        title: 'B. Health & Wellness Information',
        items: ['Height', 'Weight', 'BMI', 'Dietary preferences', 'Allergies', 'Fitness goals', 'Medical conditions (if voluntarily provided)', 'Lifestyle habits', 'Activity level', 'Sleep patterns', 'Body measurements', 'Pregnancy or PCOS-related information (if voluntarily provided)'],
      },
      {
        title: 'C. Payment Information',
        items: ['Payments are processed securely through third-party payment gateways. We do not store your full debit/credit card information on our servers.'],
        isList: false,
      },
      {
        title: 'D. Technical Information',
        items: ['IP address', 'Browser type', 'Device information', 'Operating system', 'Cookies and usage analytics', 'Login activity'],
      },
    ],
  },
  {
    title: '3. How We Use Your Information',
    content: 'We use your information to:',
    items: ['Generate personalized diet plans', 'Provide AI-based recommendations', 'Enable consultations with dietitians', 'Improve platform performance', 'Process payments', 'Provide customer support', 'Send reminders and notifications', 'Recommend supplements and nutrition products', 'Improve user experience and analytics', 'Prevent fraud and abuse'],
  },
  {
    title: '4. Dietitian & B2B Services',
    content: `MeriDiet also provides tools for registered dietitians and nutritionists to generate diet plans under their own branding.

In such cases:`,
    items: ['Dietitians may collect client information directly.', 'MeriDiet acts as a technology platform provider.', 'Dietitians are responsible for maintaining confidentiality and compliance regarding their client data.', 'We do not publicly disclose client information or references without explicit permission.'],
  },
  {
    title: '5. AI-Generated Recommendations',
    content: 'Our platform may use artificial intelligence and automated systems to:',
    items: ['Generate diet plans', 'Suggest nutritional guidance', 'Recommend supplements', 'Estimate nutritional deficiencies', 'Analyze wellness patterns'],
    footer: 'These recommendations are for informational and wellness purposes only and should not be considered medical diagnosis or treatment. Always consult a qualified healthcare professional before making medical or health decisions.',
  },
  {
    title: '6. Data Sharing & Third Parties',
    content: 'We do not sell your personal data. However, we may share limited information with:',
    items: ['Payment gateway providers', 'Cloud hosting providers', 'Analytics services', 'Communication providers (SMS, WhatsApp, Email)', 'Registered dietitians you choose to consult'],
    footer: 'All third-party providers are expected to maintain appropriate security standards.',
  },
  {
    title: '7. Data Security',
    content: 'We implement reasonable technical and organizational measures to protect your information, including:',
    items: ['Secure servers', 'Encryption', 'Access control systems', 'Authentication mechanisms', 'Regular security monitoring'],
    footer: 'However, no online platform can guarantee 100% security.',
  },
  {
    title: '8. Cookies & Tracking Technologies',
    content: 'We may use cookies and similar technologies to:',
    items: ['Improve website functionality', 'Remember user preferences', 'Analyze traffic and usage', 'Enhance user experience'],
    footer: 'Users may disable cookies through browser settings.',
  },
  {
    title: '9. User Rights',
    content: 'You may:',
    items: ['Access your personal data', 'Update your information', 'Request deletion of your account', 'Withdraw consent where applicable'],
    footer: 'To request changes, contact us at: support@meridiet.com',
  },
  {
    title: "10. Children's Privacy",
    content: 'Our services are not intended for children under 18 without parental or guardian supervision.',
  },
  {
    title: '11. Medical Disclaimer',
    content: 'MeriDiet is a wellness and nutrition technology platform. We do not provide:',
    items: ['Medical diagnosis', 'Emergency healthcare services', 'Prescription treatment'],
    footer: 'Information provided through calculators, AI systems, diet plans, or consultations is for informational purposes only. Always consult licensed healthcare professionals for medical advice.',
  },
  {
    title: '12. Supplement Recommendations Disclaimer',
    content: 'Supplement suggestions provided through our platform are:',
    items: ['General wellness recommendations', 'Based on user-provided information', 'Not medical prescriptions'],
    footer: 'Users should consult qualified healthcare professionals before consuming supplements.',
  },
  {
    title: '13. Data Retention',
    content: 'We may retain user information:',
    items: ['As long as required to provide services', 'For legal compliance', 'For fraud prevention', 'For business analytics'],
    footer: 'Users may request deletion of their account and associated data.',
  },
  {
    title: '14. International Users',
    content: 'If users access our services from outside India, they understand that their data may be processed and stored in India or other jurisdictions where our service providers operate.',
  },
  {
    title: '15. Changes to This Privacy Policy',
    content: 'We may update this Privacy Policy from time to time. Updated versions will be posted on our platform with revised effective dates.',
  },
  {
    title: '16. Contact Us',
    content: null,
    contact: true,
  },
  {
    title: '17. Confidentiality Commitment',
    content: 'MeriDiet respects the privacy of both users and partner dietitians. We do not publicly disclose:',
    items: ['Customer identities', 'Consultation details', 'Business relationships', 'Client references'],
    footer: 'unless explicit permission is provided by the concerned party.',
  },
]

import SEO from './SEO'

const PrivacyPolicy = () => {
  return (
    <div className="privacy-page">
      <SEO
        title="Privacy Policy – How We Handle Your Data"
        description="Read MeriDiet's privacy policy to learn how we collect, use, and protect your personal and health data in compliance with Indian data protection laws."
        keywords="MeriDiet privacy policy, diet app data privacy, health data India"
        canonical="/privacy-policy"
      />
      <div className="privacy-hero">
        <div className="container">
          <h1 className="privacy-hero-title">Privacy Policy</h1>
          <p className="privacy-hero-sub">MeriDiet Technologies Pvt. Ltd. &nbsp;·&nbsp; Effective Date: To be announced</p>
        </div>
      </div>

      <div className="container privacy-body">
        {sections.map((sec, i) => (
          <section key={i} className="privacy-section">
            <h2 className="privacy-section-title">{sec.title}</h2>

            {sec.contact ? (
              <div className="privacy-contact-box">
                <p><strong>MeriDiet Technologies Pvt. Ltd.</strong></p>
                <p>Email: <a href="mailto:support@meridiet.com">support@meridiet.com</a></p>
                <p>Website: <a href="https://www.meridiet.com" target="_blank" rel="noreferrer">www.meridiet.com</a></p>
              </div>
            ) : (
              <>
                {sec.content && <p className="privacy-para">{sec.content}</p>}

                {'subsections' in sec && sec.subsections && sec.subsections.map((sub, j) => (
                  <div key={j} className="privacy-subsection">
                    <h3 className="privacy-sub-title">{sub.title}</h3>
                    {sub.isList === false
                      ? <p className="privacy-para">{sub.items[0]}</p>
                      : (
                        <ul className="privacy-list">
                          {sub.items.map((item, k) => <li key={k}>{item}</li>)}
                        </ul>
                      )
                    }
                  </div>
                ))}

                {'items' in sec && sec.items && (
                  <ul className="privacy-list">
                    {sec.items.map((item, j) => <li key={j}>{item}</li>)}
                  </ul>
                )}

                {'footer' in sec && sec.footer && <p className="privacy-para privacy-note">{sec.footer}</p>}
              </>
            )}
          </section>
        ))}
      </div>
    </div>
  )
}

export default PrivacyPolicy
