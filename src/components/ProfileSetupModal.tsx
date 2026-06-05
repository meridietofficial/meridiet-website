import { useEffect } from 'react'

export type SetupItem = {
  label: string
  icon: string          // Font Awesome class, e.g. "fa-solid fa-calendar-days"
  done: boolean
}

type Props = {
  items: SetupItem[]
  onComplete: () => void   // redirect to the profile page
  onSkip: () => void       // dismiss for now
}

/**
 * Onboarding prompt shown to a freshly logged-in dietitian whose profile is
 * still missing key details (above all, weekly availability — that's what
 * decides whether clients see them as "available"). It only renders when there
 * is something to fill; the parent gates that.
 */
export default function ProfileSetupModal({ items, onComplete, onSkip }: Props) {
  // Close on Escape + lock body scroll while open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onSkip() }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onSkip])

  const pending = items.filter(i => !i.done).length

  return (
    <div className="psm-backdrop" onClick={onSkip}>
      <div
        className="psm-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Complete your profile"
        onClick={e => e.stopPropagation()}
      >
        <button className="psm-close" onClick={onSkip} aria-label="Close">✕</button>

        <div className="psm-icon-badge">
          <i className="fa-solid fa-calendar-check" />
        </div>

        <h2 className="psm-title">Finish setting up your profile</h2>
        <p className="psm-subtitle">
          Add your <strong>weekly availability</strong> so clients can see you’re open
          for consultations and book a slot. A complete profile gets you more bookings.
        </p>

        <ul className="psm-list">
          {items.map(item => (
            <li key={item.label} className={`psm-list-item${item.done ? ' psm-list-item--done' : ''}`}>
              <span className="psm-list-icon"><i className={item.icon} /></span>
              <span className="psm-list-label">{item.label}</span>
              <span className="psm-list-status">
                {item.done
                  ? <i className="fa-solid fa-circle-check" />
                  : <i className="fa-regular fa-circle" />}
              </span>
            </li>
          ))}
        </ul>

        <button className="psm-primary-btn" onClick={onComplete}>
          {pending > 0 ? 'Complete Profile' : 'Review Profile'} <i className="fa-solid fa-arrow-right" />
        </button>
        <button className="psm-skip-btn" onClick={onSkip}>Skip for now</button>
      </div>
    </div>
  )
}
