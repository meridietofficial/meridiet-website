const sections = [
  {
    title: '1. Introduction',
    content: `Welcome to MeriDiet Technologies Pvt. Ltd. ("MeriDiet", "we", "our", or "us").

These Terms & Conditions govern your use of:`,
    items: ['Our website', 'Mobile applications', 'AI tools', 'Calculators', 'Diet plans', 'Nutrition consultations', 'Subscription services', 'Supplement recommendations', 'And all related services'],
    footer: 'By accessing or using our platform, you agree to comply with these Terms & Conditions. If you do not agree, please do not use our services.',
  },
  {
    title: '2. Eligibility',
    content: 'By using our services, you confirm that:',
    items: ['You are at least 18 years old, or', 'You are using the platform under parental/guardian supervision'],
    footer: 'You also confirm that the information you provide is accurate and truthful.',
  },
  {
    title: '3. Nature of Services',
    content: 'MeriDiet is a nutrition and wellness technology platform. We provide:',
    items: ['Personalized diet plans', 'AI-powered recommendations', 'Wellness calculators', 'Access to independent dietitians/nutritionists', 'Supplement suggestions', 'Educational wellness content'],
    footer: 'We are NOT a hospital, emergency medical provider, diagnostic laboratory, or licensed medical treatment provider.',
  },
  {
    title: '4. Medical Disclaimer',
    content: 'All diet plans, AI suggestions, supplement recommendations, wellness scores, and consultation content are informational in nature only. They should NOT be treated as medical advice, diagnosis, prescription, or treatment plan.',
    items: [],
    footer: 'Users should consult qualified healthcare professionals before making medical or dietary decisions. MeriDiet shall not be responsible for health complications arising from undisclosed medical conditions, allergies, incorrect information submitted by users, or misuse of plans or supplements.',
  },
  {
    title: '5. User Responsibilities',
    content: 'Users agree:',
    items: ['To provide accurate information', 'Not to misuse the platform', 'Not to share false medical details', 'Not to use another person\'s account', 'Not to attempt unauthorized access to systems or data'],
    footer: 'Users are responsible for maintaining confidentiality of login credentials, monitoring their own health conditions, and consulting doctors where necessary.',
  },
  {
    title: '6. Dietitian Consultations',
    content: 'MeriDiet may connect users with registered dietitians or nutrition professionals. Users understand:',
    items: ['Dietitians operate independently', 'Consultation quality may vary', 'MeriDiet acts as a technology facilitator'],
    footer: 'MeriDiet is not liable for professional opinions shared by dietitians, consultation outcomes, or user dissatisfaction arising from independent consultation services.',
  },
  {
    title: '7. AI-Generated Diet Plans & Recommendations',
    content: 'Some recommendations may be generated using automated systems and artificial intelligence. AI outputs:',
    items: ['May contain limitations', 'Are based on submitted data', 'Are not medical diagnosis'],
    footer: 'Users must use discretion before following recommendations.',
  },
  {
    title: '8. Supplement Recommendations',
    content: 'Supplement suggestions are provided for wellness guidance, nutritional awareness, and general health support. We do not guarantee:',
    items: ['Effectiveness', 'Suitability', 'Medical outcomes'],
    footer: 'Users should consult healthcare professionals before consuming supplements.',
  },
  {
    title: '9. Payments & Refunds',
    content: 'All purchases made on the platform are subject to our pricing policies. Unless otherwise stated:',
    items: ['Fees paid are non-refundable', 'Consultations once booked may not be refunded', 'Partially used subscriptions are non-refundable'],
    footer: 'Refund requests, if applicable, shall be reviewed solely at MeriDiet\'s discretion.',
  },
  {
    title: '10. Subscription Services',
    content: 'Subscription plans may include:',
    items: ['Diet plans', 'Premium calculators', 'Consultation access', 'Tracking features', 'Wellness tools'],
    footer: 'Users are responsible for renewing subscriptions, monitoring plan validity, and cancellation before renewal (if auto-renewal is introduced later).',
  },
  {
    title: '11. Third-Party Products & Services',
    content: 'MeriDiet may recommend supplements, health products, and wellness services. We do not manufacture all products listed or recommended on the platform.',
    footer: 'Product usage remains the sole responsibility of users.',
  },
  {
    title: '12. Intellectual Property',
    content: 'All content on the platform including logos, branding, graphics, diet templates, software, AI systems, calculators, and designs are the intellectual property of MeriDiet Technologies Pvt. Ltd. Users may not:',
    items: ['Copy', 'Resell', 'Reproduce', 'Reverse engineer', 'Distribute'],
    footer: 'without written permission.',
  },
  {
    title: '13. Privacy & Confidentiality',
    content: 'User information is handled according to our Privacy Policy. We respect client confidentiality and do not publicly disclose:',
    items: ['Client identities', 'Consultation details', 'Personal health data', 'Business references'],
    footer: 'without explicit consent.',
  },
  {
    title: '14. Platform Availability',
    content: 'We aim to provide uninterrupted services but do not guarantee continuous uptime, error-free operation, or uninterrupted access. We may:',
    items: ['Update features', 'Suspend services', 'Modify functionality', 'Conduct maintenance'],
    footer: 'without prior notice.',
  },
  {
    title: '15. Limitation of Liability',
    content: 'To the maximum extent permitted by law, MeriDiet shall not be liable for:',
    items: ['Indirect damages', 'Health complications', 'Financial losses', 'Allergic reactions', 'Supplement side effects', 'User negligence', 'Inaccuracies in user-submitted information'],
    footer: 'Users use the platform at their own discretion and risk.',
  },
  {
    title: '16. Account Suspension',
    content: 'We reserve the right to suspend or terminate accounts if users:',
    items: ['Violate these terms', 'Abuse the platform', 'Engage in fraud', 'Misuse consultations', 'Attempt unauthorized access'],
  },
  {
    title: '17. Changes to Terms',
    content: 'We may update these Terms & Conditions periodically. Continued use of the platform after updates constitutes acceptance of revised terms.',
  },
  {
    title: '18. Governing Law',
    content: 'These Terms & Conditions shall be governed by the laws of India. Any disputes shall be subject to the jurisdiction of courts located in Uttar Pradesh, India.',
  },
  {
    title: '19. Contact Information',
    contact: true,
  },
  {
    title: '20. Acceptance',
    content: 'By using MeriDiet services, you acknowledge that:',
    items: ['You have read these Terms & Conditions', 'You understand them', 'You agree to be legally bound by them'],
  },
]

const TermsConditions = () => {
  return (
    <div className="privacy-page">
      <div className="privacy-hero">
        <div className="container">
          <h1 className="privacy-hero-title">Terms &amp; Conditions</h1>
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
                <p>Website: <a href="https://www.meridiet.com" target="_blank" rel="noreferrer">www.meridiet.com</a></p>
                <p>Email: <a href="mailto:support@meridiet.com">support@meridiet.com</a></p>
              </div>
            ) : (
              <>
                {sec.content && <p className="privacy-para">{sec.content}</p>}

                {'items' in sec && sec.items && sec.items.length > 0 && (
                  <ul className="privacy-list">
                    {sec.items.map((item, j) => <li key={j}>{item}</li>)}
                  </ul>
                )}

                {'footer' in sec && sec.footer && (
                  <p className="privacy-para privacy-note">{sec.footer}</p>
                )}
              </>
            )}
          </section>
        ))}
      </div>
    </div>
  )
}

export default TermsConditions
