import { useState, useRef, useEffect } from 'react'

export const SPECIALIZATIONS = [
  'Weight Management', 'Sports Nutrition', 'Clinical Nutrition',
  'Pediatric Nutrition', 'PCOS / Hormonal Imbalance', 'Diabetes Care',
  'Gut Health & IBS', 'General Wellness', 'Thyroid Management',
  'Renal / Kidney Nutrition', 'Cardiac Nutrition', 'Oncology Nutrition',
  'Pre & Postnatal Nutrition', 'Geriatric Nutrition', 'Eating Disorders',
  'Food Allergy & Intolerance', 'Vegan / Plant-Based Nutrition',
  'Bariatric Nutrition', 'Immune & Functional Nutrition',
  'Keto / Low-Carb Nutrition', 'Fatty Liver & Liver Health',
  'Cholesterol & Lipid Management', 'Hypertension & Heart Health',
  'Anaemia & Iron Deficiency', 'Bone Health & Osteoporosis',
  'Skin & Hair Nutrition', 'Mental Health & Nutrition',
]

const SOFT_WARN  = 5
const HARD_LIMIT = 8

/* ── Specialization tag-input ── */
export default function SpecializationInput({
  value, onChange,
}: { value: string[]; onChange: (v: string[]) => void }) {
  const [query, setQuery]   = useState('')
  const [open, setOpen]     = useState(false)
  const wrapRef             = useRef<HTMLDivElement>(null)
  const inputRef            = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false); setQuery('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const atLimit    = value.length >= HARD_LIMIT
  const suggestions = SPECIALIZATIONS.filter(
    s => s.toLowerCase().includes(query.toLowerCase()) && !value.includes(s)
  )
  const canAddCustom = query.trim() && !SPECIALIZATIONS.includes(query.trim()) && !value.includes(query.trim())

  const add = (item: string) => {
    if (atLimit) return
    onChange([...value, item])
    setQuery(''); setOpen(false); inputRef.current?.focus()
  }

  const remove = (item: string) => onChange(value.filter(v => v !== item))

  return (
    <div className="jd2-spec-wrap" ref={wrapRef}>
      {/* Tags */}
      {value.length > 0 && (
        <div className="jd2-spec-tags">
          {value.map(v => (
            <span key={v} className="jd2-spec-tag">
              {v}
              <button type="button" className="jd2-spec-tag-remove" onClick={() => remove(v)}>✕</button>
            </span>
          ))}
        </div>
      )}

      {/* Nudge / limit messages */}
      {atLimit ? (
        <p className="jd2-spec-limit-msg">
          Maximum {HARD_LIMIT} specializations reached. Remove one to add another.
        </p>
      ) : value.length >= SOFT_WARN ? (
        <p className="jd2-spec-warn-msg">
          Profiles with focused specializations tend to get more client trust.
        </p>
      ) : null}

      {/* Input */}
      {!atLimit && (
        <div className="jd2-spec-input-row">
          <input
            ref={inputRef}
            className="jd2-spec-input"
            placeholder={value.length ? 'Search to add more…' : 'Search specialization…'}
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
          />
          {query.trim() && (
            <button type="button" className="jd2-spec-add-btn"
              onClick={() => (canAddCustom ? add(query.trim()) : suggestions[0] && add(suggestions[0]))}>
              + Add
            </button>
          )}
        </div>
      )}

      {/* Dropdown */}
      {!atLimit && open && (query.trim() || suggestions.length > 0) && (
        <div className="jd2-spec-dropdown">
          {suggestions.map(s => (
            <button key={s} type="button" className="jd2-spec-option" onClick={() => add(s)}>
              <span>{s}</span>
              <span className="jd2-spec-plus">+</span>
            </button>
          ))}
          {canAddCustom && (
            <button type="button" className="jd2-spec-option jd2-spec-option--custom" onClick={() => add(query.trim())}>
              <span>Add "<strong>{query.trim()}</strong>"</span>
              <span className="jd2-spec-plus">+</span>
            </button>
          )}
          {!suggestions.length && !canAddCustom && (
            <p className="jd2-spec-empty">Already added or type something new</p>
          )}
        </div>
      )}
    </div>
  )
}
