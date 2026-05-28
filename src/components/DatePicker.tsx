import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'

type Props = {
  value: string
  onChange: (val: string) => void
  min?: string
  max?: string
  placeholder?: string
  hasError?: boolean
}

const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December']
const WEEK = ['Su','Mo','Tu','We','Th','Fr','Sa']

function toDate(s: string) { return s ? new Date(s + 'T00:00:00') : null }

function toStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate()
}

export default function DatePicker({ value, onChange, min, max, placeholder, hasError }: Props) {
  const today   = new Date()
  const selected = toDate(value)
  const minDate  = toDate(min ?? '')
  const maxDate  = toDate(max ?? '')

  const [open, setOpen]           = useState(false)
  const [showYears, setShowYears] = useState(false)
  const [viewYear, setViewYear]   = useState(selected?.getFullYear() ?? today.getFullYear())
  const [viewMonth, setViewMonth] = useState(selected?.getMonth()    ?? today.getMonth())

  const wrapRef = useRef<HTMLDivElement>(null)

  // sync view when value changes externally
  useEffect(() => {
    if (selected) { setViewYear(selected.getFullYear()); setViewMonth(selected.getMonth()) }
  }, [value])

  // close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) { setOpen(false); setShowYears(false) }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const isDisabled = (d: Date) => {
    if (minDate && d < minDate) return true
    if (maxDate && d > maxDate) return true
    return false
  }

  const getDays = () => {
    const first   = new Date(viewYear, viewMonth, 1).getDay()
    const inMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    const inPrev  = new Date(viewYear, viewMonth, 0).getDate()
    const days: { d: Date; out: boolean }[] = []
    for (let i = first - 1; i >= 0; i--)
      days.push({ d: new Date(viewYear, viewMonth - 1, inPrev - i), out: true })
    for (let i = 1; i <= inMonth; i++)
      days.push({ d: new Date(viewYear, viewMonth, i), out: false })
    while (days.length < 42)
      days.push({ d: new Date(viewYear, viewMonth + 1, days.length - first - inMonth + 1), out: true })
    return days
  }

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const pick = (d: Date) => {
    if (isDisabled(d)) return
    onChange(toStr(d))
    setOpen(false)
    setShowYears(false)
  }

  const displayVal = selected
    ? selected.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })
    : ''

  const minYear = minDate?.getFullYear() ?? 1900
  const maxYear = maxDate?.getFullYear() ?? today.getFullYear()
  const years   = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i)

  return (
    <div ref={wrapRef} className="dp-wrap">

      {/* Trigger */}
      <button
        type="button"
        className={['dp-trigger', hasError?'dp-trigger--err':'', open?'dp-trigger--open':''].filter(Boolean).join(' ')}
        onClick={() => { setShowYears(false); setOpen(p => !p) }}
      >
        <span className="dp-icon">📅</span>
        <span className={displayVal ? 'dp-val' : 'dp-placeholder'}>
          {displayVal || placeholder || 'Select date of birth'}
        </span>
        <ChevronDown size={15} className={`dp-chevron${open?' rotated':''}`} />
      </button>

      {/* Panel — absolutely positioned inside .dp-wrap */}
      {open && (
        <div className="dp-panel">

          <div className="dp-header">
            <button type="button" className="dp-nav-btn" onClick={prevMonth}><ChevronLeft size={15}/></button>
            <button type="button" className="dp-month-btn" onClick={() => setShowYears(p => !p)}>
              {MONTHS[viewMonth]} {viewYear}
              <ChevronDown size={11} className={showYears ? 'rotated' : ''} />
            </button>
            <button type="button" className="dp-nav-btn" onClick={nextMonth}><ChevronRight size={15}/></button>
          </div>

          {showYears ? (
            <div className="dp-year-grid">
              {years.map(y => (
                <button key={y} type="button"
                  className={`dp-year-btn${y===viewYear?' active':''}`}
                  onClick={() => { setViewYear(y); setShowYears(false) }}
                >{y}</button>
              ))}
            </div>
          ) : (
            <>
              <div className="dp-weekdays">
                {WEEK.map(w => <span key={w} className="dp-weekday">{w}</span>)}
              </div>

              <div className="dp-days">
                {getDays().map(({ d, out }, i) => {
                  const sel = selected ? sameDay(d, selected) : false
                  const tod = sameDay(d, today)
                  const dis = isDisabled(d)
                  return (
                    <button key={i} type="button" disabled={dis}
                      className={['dp-day',
                        out?'dp-day--out':'', sel?'dp-day--sel':'',
                        tod&&!sel?'dp-day--today':'', dis?'dp-day--dis':'',
                      ].filter(Boolean).join(' ')}
                      onClick={() => pick(d)}
                    >{d.getDate()}</button>
                  )
                })}
              </div>

              <div className="dp-footer">
                <button type="button" className="dp-today-btn"
                  disabled={isDisabled(today)} onClick={() => pick(today)}>
                  Today
                </button>
              </div>
            </>
          )}

        </div>
      )}
    </div>
  )
}
