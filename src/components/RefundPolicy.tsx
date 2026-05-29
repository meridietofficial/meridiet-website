const sections = [
  {
    title: '1. Introduction',
    content: 'This Refund & Cancellation Policy applies to all services, products, subscriptions, consultations, diet plans, wallet recharges, and digital offerings provided by MeriDiet Technologies Pvt. Ltd. ("MeriDiet", "we", "our", or "us").',
    footer: 'By purchasing or using our services, you agree to this policy.',
  },
  {
    title: '2. No Refund Policy',
    content: 'ALL PAYMENTS MADE TO MERIDIET ARE FINAL. We maintain a strict no-refund policy. Under no circumstances shall refunds be provided for:',
    items: [
      'Diet plans', 'Consultation bookings', 'Subscription plans', 'Wallet recharges',
      'Premium features', 'AI-generated plans', 'Digital products', 'Downloadable reports',
      'Supplement recommendations', 'Consultation packages', 'Customized nutrition services',
      'Partially used services', 'Unused services', 'Dissatisfaction with results', 'Change of mind',
    ],
    highlight: true,
  },
  {
    title: '3. Digital Service Nature',
    content: 'Users understand that MeriDiet provides:',
    items: ['Personalized digital services', 'Instant-access wellness tools', 'AI-generated recommendations', 'Consultation infrastructure', 'Customized nutrition content'],
    footer: 'Since these are digital and instantly accessible services, they are considered non-returnable and non-refundable.',
  },
  {
    title: '4. Consultation Fees',
    content: 'Once a consultation is booked:',
    items: ['Fees cannot be refunded', 'Rescheduling may be allowed only at the discretion of the dietitian or platform'],
    footer: 'Failure to attend a scheduled consultation shall not qualify for a refund.',
  },
  {
    title: '5. Wallet Recharge Policy',
    content: 'Wallet balances:',
    items: ['Are non-refundable', 'Non-transferable', 'Cannot be exchanged for cash'],
    footer: 'Unused balances remain subject to platform validity policies, if introduced in future.',
  },
  {
    title: '6. Subscription Cancellation',
    content: 'Users may stop using the platform at any time. However:',
    items: ['Cancellation does not entitle users to refunds', 'Partially used subscription periods are non-refundable'],
  },
  {
    title: '7. Failed Transactions',
    content: 'If payment is deducted but service is not activated due to technical failure:',
    items: ['Users should contact support', 'After verification, the service may be activated or payment may be reversed if the transaction genuinely failed'],
    footer: 'This does not apply to dissatisfaction after successful delivery of services.',
  },
  {
    title: '8. Chargebacks & Payment Disputes',
    content: 'Users agree not to initiate fraudulent chargebacks. MeriDiet reserves the right to:',
    items: ['Suspend accounts', 'Restrict services', 'Take legal action'],
    footer: 'against abusive or fraudulent payment disputes.',
  },
  {
    title: '9. Exceptional Situations',
    content: 'In extremely rare situations, if a refund is approved by MeriDiet management:',
    items: ['It shall remain solely at our discretion', 'No user shall have automatic entitlement to refunds'],
  },
  {
    title: '10. Modification of Policy',
    content: 'MeriDiet reserves the right to modify this Refund Policy at any time without prior notice.',
  },
  {
    title: '11. Contact Information',
    contact: true,
  },
  {
    title: '12. Acceptance',
    content: 'By purchasing or using any MeriDiet service, you acknowledge that:',
    items: ['You have read this Refund Policy', 'You understand it', 'You agree that payments are non-refundable under all conditions'],
  },
]

const RefundPolicy = () => {
  return (
    <div className="privacy-page">
      <div className="privacy-hero">
        <div className="container">
          <h1 className="privacy-hero-title">Refund &amp; Cancellation Policy</h1>
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
                {sec.content && (
                  <p className={`privacy-para${'highlight' in sec && sec.highlight ? ' privacy-highlight' : ''}`}>
                    {sec.content}
                  </p>
                )}

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

export default RefundPolicy
