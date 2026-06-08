import { useState, useEffect } from 'react'
import appointmentApi, { DietitianAppointment } from '../api/appointment'

type Tab = 'all' | 'pending' | 'accepted' | 'rejected'

const STATUS_LABEL: Record<DietitianAppointment['status'], string> = {
  pending:   'Pending',
  confirmed: 'Accepted',
  cancelled: 'Rejected',
  completed: 'Completed',
}

function statusCssClass(status: DietitianAppointment['status']): string {
  if (status === 'confirmed') return 'accepted'
  if (status === 'cancelled') return 'rejected'
  return status
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'Just now'
  if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs} hr${hrs > 1 ? 's' : ''} ago`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export default function DietitianConsultationRequests() {
  const [tab, setTab]                   = useState<Tab>('all')
  const [search, setSearch]             = useState('')
  const [selected, setSelected]         = useState<DietitianAppointment | null>(null)
  const [appointments, setAppointments] = useState<DietitianAppointment[]>([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState<string | null>(null)
  const [updating, setUpdating]         = useState<number | null>(null)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    setError(null)
    try {
      const { data } = await appointmentApi.getDietitianAppointments({ limit: 50 })
      setAppointments(data)
    } catch (e: any) {
      setError(e.message ?? 'Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id: number, status: 'confirmed' | 'cancelled') {
    setUpdating(id)
    try {
      await appointmentApi.updateAppointmentStatus(id, status)
      setAppointments(prev => prev.map(r => r.id === id ? { ...r, status } : r))
      setSelected(s => s?.id === id ? { ...s, status } : s)
    } catch {
      // silent — could add a toast
    } finally {
      setUpdating(null)
    }
  }

  const filtered = appointments.filter(r => {
    const matchesTab =
      tab === 'all'      ||
      (tab === 'pending'  && r.status === 'pending')   ||
      (tab === 'accepted' && r.status === 'confirmed') ||
      (tab === 'rejected' && r.status === 'cancelled')
    const q = search.toLowerCase()
    const matchesSearch = !q || r.name.toLowerCase().includes(q) || (r.notes ?? '').toLowerCase().includes(q)
    return matchesTab && matchesSearch
  })

  const counts = {
    all:      appointments.length,
    pending:  appointments.filter(r => r.status === 'pending').length,
    accepted: appointments.filter(r => r.status === 'confirmed').length,
    rejected: appointments.filter(r => r.status === 'cancelled').length,
  }

  return (
    <div className="cr-root">
      {/* ── Page Header ── */}
      <div className="cr-header">
        <div>
          <h1 className="cr-title">Consultation Requests</h1>
          <p className="cr-subtitle">Review and manage incoming consultation requests from clients</p>
        </div>
        <div className="cr-header-stats">
          <div className="cr-hstat cr-hstat--orange">
            <span className="cr-hstat-val">{counts.pending}</span>
            <span className="cr-hstat-label">Pending</span>
          </div>
          <div className="cr-hstat cr-hstat--green">
            <span className="cr-hstat-val">{counts.accepted}</span>
            <span className="cr-hstat-label">Accepted</span>
          </div>
          <div className="cr-hstat cr-hstat--red">
            <span className="cr-hstat-val">{counts.rejected}</span>
            <span className="cr-hstat-label">Rejected</span>
          </div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="cr-toolbar">
        <div className="cr-tabs">
          {(['all', 'pending', 'accepted', 'rejected'] as Tab[]).map(t => (
            <button
              key={t}
              className={`cr-tab${tab === t ? ' cr-tab--active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
              <span className="cr-tab-count">{counts[t]}</span>
            </button>
          ))}
        </div>
        <div className="cr-search-wrap">
          <i className="fa-solid fa-magnifying-glass cr-search-icon" />
          <input
            className="cr-search"
            placeholder="Search by name or notes…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── Content ── */}
      <div className={`cr-content${selected ? ' cr-content--split' : ''}`}>

        {/* Request List */}
        <div className="cr-list">
          {loading && (
            <div className="cr-empty">
              <span className="cr-empty-icon">⏳</span>
              <p className="cr-empty-text">Loading appointments…</p>
            </div>
          )}

          {!loading && error && (
            <div className="cr-empty">
              <span className="cr-empty-icon">⚠️</span>
              <p className="cr-empty-text">{error}</p>
              <button className="cr-btn-detail" style={{ marginTop: 8 }} onClick={fetchAll}>
                Retry
              </button>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="cr-empty">
              <span className="cr-empty-icon">📋</span>
              <p className="cr-empty-text">No requests found</p>
            </div>
          )}

          {!loading && !error && filtered.map(r => (
            <div
              key={r.id}
              className={`cr-card${selected?.id === r.id ? ' cr-card--selected' : ''}`}
              onClick={() => setSelected(r.id === selected?.id ? null : r)}
            >
              <div className="cr-card-top">
                <div className="cr-avatar">{getInitials(r.name)}</div>
                <div className="cr-card-info">
                  <div className="cr-name-row">
                    <span className="cr-name">{r.name}</span>
                    {r.status === 'pending' && <span className="cr-badge cr-badge--new">NEW</span>}
                    <span className={`cr-status cr-status--${statusCssClass(r.status)}`}>
                      {STATUS_LABEL[r.status]}
                    </span>
                    <span className="cr-time">{relativeTime(r.created_at)}</span>
                  </div>
                  <p className="cr-goal">
                    <i className="fa-regular fa-calendar" /> {formatDate(r.appointment_date)} · {r.slot}
                  </p>
                  {r.notes && <p className="cr-desc">{r.notes}</p>}
                </div>
              </div>
              <div className="cr-card-meta">
                <span className="cr-meta-pill">
                  <i className="fa-solid fa-indian-rupee-sign" /> {Number(r.fee).toLocaleString('en-IN')} {r.currency}
                </span>
                <span className="cr-meta-pill">
                  <i className="fa-solid fa-credit-card" /> {r.payment_status}
                </span>
                <span className="cr-meta-pill">
                  <i className="fa-regular fa-clock" /> {r.slot}
                </span>
                <div className="cr-card-actions">
                  <button
                    className="cr-btn-detail"
                    onClick={e => { e.stopPropagation(); setSelected(r) }}
                  >
                    View Details
                  </button>
                  {r.status === 'pending' && (
                    <>
                      <button
                        className="cr-btn-accept"
                        disabled={updating === r.id}
                        onClick={e => { e.stopPropagation(); updateStatus(r.id, 'confirmed') }}
                      >
                        <i className="fa-solid fa-check" /> Accept
                      </button>
                      <button
                        className="cr-btn-reject"
                        disabled={updating === r.id}
                        onClick={e => { e.stopPropagation(); updateStatus(r.id, 'cancelled') }}
                      >
                        <i className="fa-solid fa-xmark" /> Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="cr-detail">
            <div className="cr-detail-header">
              <h2 className="cr-detail-title">Request Details</h2>
              <button className="cr-detail-close" onClick={() => setSelected(null)}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div className="cr-detail-avatar-row">
              <div className="cr-detail-avatar">{getInitials(selected.name)}</div>
              <div>
                <p className="cr-detail-name">{selected.name}</p>
                <span className={`cr-status cr-status--${statusCssClass(selected.status)}`}>
                  {STATUS_LABEL[selected.status]}
                </span>
              </div>
            </div>

            <div className="cr-detail-section">
              <p className="cr-detail-section-title">Contact Info</p>
              <div className="cr-detail-grid">
                <div className="cr-detail-field">
                  <span className="cr-detail-label">Phone</span>
                  <span className="cr-detail-val">{selected.phone ?? '—'}</span>
                </div>
                <div className="cr-detail-field">
                  <span className="cr-detail-label">Email</span>
                  <span className="cr-detail-val">{selected.email ?? '—'}</span>
                </div>
              </div>
            </div>

            <div className="cr-detail-section">
              <p className="cr-detail-section-title">Appointment Details</p>
              <div className="cr-detail-grid">
                <div className="cr-detail-field">
                  <span className="cr-detail-label">Date</span>
                  <span className="cr-detail-val">{formatDate(selected.appointment_date)}</span>
                </div>
                <div className="cr-detail-field">
                  <span className="cr-detail-label">Time Slot</span>
                  <span className="cr-detail-val">{selected.slot}</span>
                </div>
                <div className="cr-detail-field">
                  <span className="cr-detail-label">Fee</span>
                  <span className="cr-detail-val">
                    {Number(selected.fee).toLocaleString('en-IN')} {selected.currency}
                  </span>
                </div>
                <div className="cr-detail-field">
                  <span className="cr-detail-label">Payment</span>
                  <span className="cr-detail-val" style={{ textTransform: 'capitalize' }}>
                    {selected.payment_status}
                  </span>
                </div>
              </div>
            </div>

            {selected.notes && (
              <div className="cr-detail-section">
                <p className="cr-detail-section-title">Notes</p>
                <p className="cr-detail-desc">{selected.notes}</p>
              </div>
            )}

            <div className="cr-detail-section">
              <p className="cr-detail-section-title">Received</p>
              <p className="cr-detail-desc">{relativeTime(selected.created_at)}</p>
            </div>

            {selected.status === 'pending' && (
              <div className="cr-detail-btns">
                <button
                  className="cr-btn-accept cr-btn-accept--full"
                  disabled={updating === selected.id}
                  onClick={() => updateStatus(selected.id, 'confirmed')}
                >
                  <i className="fa-solid fa-check" /> Accept Request
                </button>
                <button
                  className="cr-btn-reject cr-btn-reject--full"
                  disabled={updating === selected.id}
                  onClick={() => updateStatus(selected.id, 'cancelled')}
                >
                  <i className="fa-solid fa-xmark" /> Reject Request
                </button>
              </div>
            )}
            {selected.status === 'confirmed' && (
              <div className="cr-detail-btns">
                <button className="cr-btn-accept cr-btn-accept--full">
                  <i className="fa-solid fa-video" /> Start Video Call
                </button>
                <button className="cr-btn-detail cr-btn-detail--full">
                  <i className="fa-solid fa-paper-plane" /> Send Message
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
