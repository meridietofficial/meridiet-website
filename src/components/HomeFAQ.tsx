import { useState } from 'react'

const faqs = [
  {
    q: 'How does MeriDiet create my personalized diet plan?',
    a: 'We use smart nutrition technology to analyse your body details, lifestyle, food preferences, routine and goals. This creates a personalized plan tailored specifically to you, which is then reviewed and refined by a qualified dietitian.',
  },
  {
    q: 'Is my diet plan reviewed by a dietitian?',
    a: 'Yes. Every diet plan is reviewed by a qualified dietitian before it reaches you. The dietitian refines the plan to ensure it is safe, balanced and suited to your individual needs.',
  },
  {
    q: 'Can I choose my food preferences?',
    a: 'Absolutely. You can specify whether you prefer vegetarian, vegan, non-vegetarian, or any regional Indian cuisine. Your food preferences, allergies and dislikes are all taken into account when creating your plan.',
  },
  {
    q: 'Can I consult a dietitian directly?',
    a: 'Yes. MeriDiet has 100+ verified dietitians you can choose from based on their specialization, experience, availability and consultation fee. You can book a consultation directly through the platform.',
  },
  {
    q: 'Can I get a diet plan after my consultation?',
    a: 'Yes. After your consultation, your dietitian can create and share a personalized diet plan based on the discussion and your goals.',
  },
  {
    q: 'How will I receive my diet plan?',
    a: 'Your personalized diet plan will be delivered to you via WhatsApp and Email as a neat PDF document.',
  },
  {
    q: 'How quickly will I receive my diet plan?',
    a: 'You will receive your personalized diet plan within 24 hours of completing your assessment.',
  },
  {
    q: 'Is MeriDiet suitable for Indian food and lifestyle?',
    a: 'MeriDiet is built specifically for Indians. All meal plans use Indian ingredients, recipes and cooking methods that fit your regional food habits and daily routine.',
  },
]

const HomeFAQ = () => {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="hfaq-section">
      <div className="container">
        <div className="hfaq-header">
          <span className="section-tag">FAQs</span>
          <h2 className="section-title">Frequently Asked <span className="hfaq-accent">Questions</span></h2>
          <p className="section-sub">Everything you need to know about MeriDiet.</p>
        </div>
        <div className="hfaq-list">
          {faqs.map((f, i) => (
            <div key={i} className={`hfaq-item${open === i ? ' hfaq-item--open' : ''}`}>
              <button className="hfaq-question" onClick={() => setOpen(open === i ? null : i)}>
                <span>{f.q}</span>
                <i className={`fa-solid ${open === i ? 'fa-minus' : 'fa-plus'} hfaq-icon`} />
              </button>
              {open === i && <p className="hfaq-answer">{f.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HomeFAQ
