import { useState } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'
import SEO from './SEO'

const faqs = [
  {
    category: 'Getting Started',
    items: [
      {
        q: 'What is MeriDiet?',
        a: "MeriDiet is India's personalized diet plan platform. You fill a short health assessment, our certified dietitians review it, and you receive a complete Indian diet plan — tailored to your body, goals, and food preferences.",
      },
      {
        q: 'How long does it take to get my plan?',
        a: 'The entire process takes under 3 minutes on your end. Once you submit your assessment, your personalized plan is delivered to your WhatsApp within a few hours.',
      },
      {
        q: 'Do I need to create an account?',
        a: "No account needed. Just fill the assessment form, make the payment, and your plan is sent directly to your WhatsApp or email — no app to download, no login required.",
      },
    ],
  },
  {
    category: 'The Diet Plan',
    items: [
      {
        q: 'Will the plan include Indian food only?',
        a: "Yes, 100%. Every meal in your plan uses familiar Indian ingredients — dal, sabzi, roti, rice, curd, and more. We don't suggest exotic or expensive ingredients you won't find at your local market.",
      },
      {
        q: 'Can I get a plan for a specific health condition?',
        a: 'Absolutely. We create plans for diabetes, PCOS, thyroid issues, heart health, pregnancy, gut health, weight loss, muscle gain, and more. Just mention your condition in the assessment.',
      },
      {
        q: 'What does the plan include?',
        a: 'Your plan includes a day-by-day meal schedule (breakfast, lunch, dinner + snacks), simple recipes for each meal, a weekly grocery shopping list, and nutrition tips tailored to your goals.',
      },
      {
        q: 'Can vegetarians and vegans get a plan?',
        a: "Yes! We have dedicated vegetarian and vegan plan options. Just select your preference in the assessment and we'll build your plan entirely around plant-based Indian food.",
      },
    ],
  },
  {
    category: 'Pricing & Payment',
    items: [
      {
        q: 'What are the pricing plans?',
        a: 'We offer three plans: ₹199 for a 1-week plan (great for trying us out), ₹499 for a 1-month plan (most popular), and ₹3,999 for a full year plan (best value — saves ₹1,989 vs monthly).',
      },
      {
        q: 'Is there a free trial?',
        a: 'Yes! Our 1-week plan at ₹199 acts as a low-risk trial. If you love your results, you can upgrade to the monthly or annual plan anytime.',
      },
      {
        q: 'What payment methods do you accept?',
        a: 'We accept all major payment methods — UPI (GPay, PhonePe, Paytm), debit/credit cards, net banking, and wallets. All payments are 100% secure.',
      },
      {
        q: 'Do you offer refunds?',
        a: "If you're not satisfied with your plan, contact us within 24 hours of receiving it and we'll either revise your plan free of charge or issue a full refund — no questions asked.",
      },
    ],
  },
  {
    category: 'Support',
    items: [
      {
        q: 'Can I talk to a dietitian directly?',
        a: 'Yes. The 1-month plan includes 1 free dietitian consultation, and the annual plan includes quarterly video consultations with a dedicated nutritionist.',
      },
      {
        q: 'How do I get WhatsApp support?',
        a: 'All plans include WhatsApp plan delivery. Monthly and annual plans also include ongoing WhatsApp support where you can ask questions and get guidance from our dietitian team.',
      },
      {
        q: 'Can I request changes to my plan?',
        a: "Of course. If something doesn't work for you — a disliked ingredient, a schedule conflict, or a new health update — just let us know and we'll update your plan.",
      },
    ],
  },
]

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<string | null>('0-0')

  const toggle = (key: string) => {
    setOpenIndex(prev => (prev === key ? null : key))
  }

  return (
    <section className="faq-section" id="faq">
      <SEO
        title="FAQ – Diet Plans & Online Dietitian Consultations"
        description="Have questions about MeriDiet's AI diet plans, dietitian consultations, pricing, or delivery? Find all answers in our FAQ."
        keywords="MeriDiet FAQ, diet plan questions, online dietitian FAQ, diet chart India questions, nutrition plan help"
        canonical="/faq"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            { '@type': 'Question', name: 'What is MeriDiet?', acceptedAnswer: { '@type': 'Answer', text: "MeriDiet is India's personalized diet plan platform. You fill a short health assessment and receive a complete Indian diet plan tailored to your body, goals, and food preferences." } },
            { '@type': 'Question', name: 'How long does it take to get my plan?', acceptedAnswer: { '@type': 'Answer', text: 'The entire process takes under 3 minutes. Once you submit your assessment, your personalized plan is delivered within a few hours.' } },
            { '@type': 'Question', name: 'What are the pricing plans?', acceptedAnswer: { '@type': 'Answer', text: 'We offer three plans: ₹199 for a 1-week plan, ₹499 for a 1-month plan (most popular), and ₹3,999 for an annual plan.' } },
            { '@type': 'Question', name: 'Can I get a plan for a specific health condition?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. We create plans for diabetes, PCOS, thyroid issues, heart health, weight loss, muscle gain, and more.' } },
            { '@type': 'Question', name: 'Do you offer refunds?', acceptedAnswer: { '@type': 'Answer', text: "If you're not satisfied, contact us within 24 hours and we'll revise your plan free of charge or issue a full refund." } },
          ],
        }}
      />
      <div className="container">

        <div className="faq-header">
          <span className="section-tag">FAQ</span>
          <h2 className="section-title">Frequently Asked <span className="faq-green">Questions</span></h2>
          <p className="section-sub">
            Everything you need to know about MeriDiet. Can't find an answer?{' '}
            <a href="https://wa.me/919876543210" className="faq-contact-link">Chat with us on WhatsApp →</a>
          </p>
        </div>

        <div className="faq-body">
          {faqs.map((group, gi) => (
            <div key={gi} className="faq-group">
              <div className="faq-group-label">
                <HelpCircle size={14} strokeWidth={2} />
                {group.category}
              </div>

              <div className="faq-list">
                {group.items.map((item, ii) => {
                  const key = `${gi}-${ii}`
                  const isOpen = openIndex === key
                  return (
                    <div key={ii} className={`faq-item${isOpen ? ' faq-item--open' : ''}`}>
                      <button className="faq-question" onClick={() => toggle(key)}>
                        <span>{item.q}</span>
                        <ChevronDown size={18} strokeWidth={2} className="faq-chevron" />
                      </button>
                      <div className="faq-answer">
                        <p>{item.a}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

export default FAQ
