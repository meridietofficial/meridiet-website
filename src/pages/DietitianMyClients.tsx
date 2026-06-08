import { useState, useEffect } from 'react'
import appointmentApi, { DietitianClient } from '../api/appointment'

type Tab = 'all' | 'active' | 'inactive'
type ViewMode = 'list' | 'grid'

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function isActive(c: DietitianClient): boolean {
  return c.pending + c.confirmed > 0
}

function completionRate(c: DietitianClient): number {
  if (c.total_appointments === 0) return 0
  return Math.round((c.completed / c.total_appointments) * 100)
}

function isSame(a: DietitianClient, b: DietitianClient): boolean {
  if (a.user_id !== null && b.user_id !== null) return a.user_id === b.user_id
  return a.name === b.name
}

export default function DietitianMyClients() {
  const [tab, setTab]           = useState<Tab>('all')
  const [search, setSearch]     = useState('')
  const [view, setView]         = useState<ViewMode>('list')
  const [selected, setSelected] = useState<DietitianClient | null>(null)
  const [clients, setClients]   = useState<DietitianClient[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    setError(null)
    try {
      const { data } = await appointmentApi.getClients({ limit: 50 })
      setClients(data)
    } catch (e: any) {
      setError(e.message ?? 'Failed to load clients')
    } finally {
      setLoading(false)
    }
  }

  const counts = {
    all:      clients.length,
    active:   clients.filter(isActive).length,
    inactive: clients.filter(c => !isActive(c)).length,
  }

  const filtered = clients.filter(c => {
    const matchesTab =
      tab === 'all' ||
      (tab === 'active'   && isActive(c)) ||
      (tab === 'inactive' && !isActive(c))
    const q = search.toLowerCase()
    const matchesSearch = !q || c.name.toLowerCase().includes(q)
    return matchesTab && matchesSearch
  })

  function select(c: DietitianClient) {
    setSelected(s => (s && isSame(s, c)) ? null : c)
  }

  return (
    <div className="mc-root">

      {/* ── Header ── */}
      <div className="mc-header">
        <div>
          <h1 className="mc-title">My Clients</h1>
          <p className="mc-subtitle">Track progress, manage plans, and stay connected with your clients</p>
        </div>
        <div className="mc-header-stats">
          <div className="mc-hstat mc-hstat--blue">
            <span className="mc-hstat-val">{counts.all}</span>
            <span className="mc-hstat-label">Total</span>
          </div>
          <div className="mc-hstat mc-hstat--green">
            <span className="mc-hstat-val">{counts.active}</span>
            <span className="mc-hstat-label">Active</span>
          </div>
          <div className="mc-hstat mc-hstat--gray">
            <span className="mc-hstat-val">{counts.inactive}</span>
            <span className="mc-hstat-label">Inactive</span>
          </div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="mc-toolbar">
        <div className="mc-tabs">
          {(['all', 'active', 'inactive'] as Tab[]).map(t => (
            <button
              key={t}
              className={`mc-tab${tab === t ? ' mc-tab--active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
              <span className="mc-tab-count">{counts[t]}</span>
            </button>
          ))}
        </div>
        <div className="mc-toolbar-right">
          <div className="mc-search-wrap">
            <i className="fa-solid fa-magnifying-glass mc-search-icon" />
            <input
              className="mc-search"
              placeholder="Search clients…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="mc-view-toggle">
            <button
              className={`mc-view-btn${view === 'list' ? ' mc-view-btn--active' : ''}`}
              onClick={() => setView('list')}
              title="List view"
            ><i className="fa-solid fa-list" /></button>
            <button
              className={`mc-view-btn${view === 'grid' ? ' mc-view-btn--active' : ''}`}
              onClick={() => setView('grid')}
              title="Grid view"
            ><i className="fa-solid fa-grip" /></button>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className={`mc-content${selected ? ' mc-content--split' : ''}`}>

        <div className={view === 'grid' && !selected ? 'mc-grid' : 'mc-list'}>
          {loading && (
            <div className="mc-empty">
              <span className="mc-empty-icon">⏳</span>
              <p className="mc-empty-text">Loading clients…</p>
            </div>
          )}
          {!loading && error && (
            <div className="mc-empty">
              <span className="mc-empty-icon">⚠️</span>
              <p className="mc-empty-text">{error}</p>
              <button className="mc-btn-outline" style={{ marginTop: 8 }} onClick={fetchAll}>Retry</button>
            </div>
          )}
          {!loading && !error && filtered.length === 0 && (
            <div className="mc-empty">
              <span className="mc-empty-icon">👥</span>
              <p className="mc-empty-text">No clients found</p>
            </div>
          )}
          {!loading && !error && (
            view === 'list'
              ? filtered.map((c, i) => (
                  <ClientRow
                    key={c.user_id ?? `guest-${i}`}
                    client={c}
                    selected={!!selected && isSame(selected, c)}
                    onSelect={select}
                  />
                ))
              : filtered.map((c, i) => (
                  <ClientCard
                    key={c.user_id ?? `guest-${i}`}
                    client={c}
                    selected={!!selected && isSame(selected, c)}
                    onSelect={select}
                  />
                ))
          )}
        </div>

        {selected && <ClientDetail client={selected} onClose={() => setSelected(null)} />}
      </div>
    </div>
  )
}

/* ─── Row (list view) ─── */
function ClientRow({
  client: c, selected, onSelect,
}: { client: DietitianClient; selected: boolean; onSelect: (c: DietitianClient) => void }) {
  const active = isActive(c)
  const rate   = completionRate(c)
  return (
    <div
      className={`mc-row${selected ? ' mc-row--selected' : ''}`}
      onClick={() => onSelect(c)}
    >
      <div className="mc-row-left">
        <div className="mc-avatar">{getInitials(c.name)}</div>
        <div className="mc-row-info">
          <div className="mc-row-name-line">
            <span className="mc-name">{c.name}</span>
            <span className={`mc-status mc-status--${active ? 'active' : 'inactive'}`}>
              {active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <p className="mc-row-meta">
            <i className="fa-regular fa-calendar" /> Last: {formatDate(c.last_appointment_date)}
          </p>
          <p className="mc-row-plan">
            <i className="fa-solid fa-chart-simple" /> {c.total_appointments} appointment{c.total_appointments !== 1 ? 's' : ''} total
          </p>
        </div>
      </div>

      <div className="mc-row-mid">
        <div className="mc-row-stat">
          <span className="mc-row-stat-label">Last Appt</span>
          <span className="mc-row-stat-val">{formatDate(c.last_appointment_date)}</span>
        </div>
        <div className="mc-row-stat">
          <span className="mc-row-stat-label">Total</span>
          <span className="mc-row-stat-val">{c.total_appointments}</span>
        </div>
        <div className="mc-row-stat">
          <span className="mc-row-stat-label">Completed</span>
          <span className="mc-row-stat-val">{c.completed}</span>
        </div>
      </div>

      <div className="mc-row-right">
        <div className="mc-progress-wrap">
          <div className="mc-progress-label-row">
            <span className="mc-progress-label">Completion Rate</span>
            <span className="mc-progress-pct">{rate}%</span>
          </div>
          <div className="mc-progress-bar-bg">
            <div className="mc-progress-bar-fill" style={{ width: `${rate}%` }} />
          </div>
        </div>
        <div className="mc-row-actions">
          <button className="mc-btn-outline" onClick={e => { e.stopPropagation(); onSelect(c) }}>
            <i className="fa-solid fa-eye" /> View
          </button>
          <button className="mc-btn-icon" title="Chat"><i className="fa-solid fa-comment" /></button>
          <button className="mc-btn-icon" title="Diet Plan"><i className="fa-solid fa-bowl-food" /></button>
        </div>
      </div>
    </div>
  )
}

/* ─── Card (grid view) ─── */
function ClientCard({
  client: c, selected, onSelect,
}: { client: DietitianClient; selected: boolean; onSelect: (c: DietitianClient) => void }) {
  const active = isActive(c)
  const rate   = completionRate(c)
  return (
    <div
      className={`mc-card${selected ? ' mc-card--selected' : ''}`}
      onClick={() => onSelect(c)}
    >
      <div className="mc-card-top">
        <div className="mc-avatar mc-avatar--lg">{getInitials(c.name)}</div>
        <span className={`mc-status mc-status--${active ? 'active' : 'inactive'}`}>
          {active ? 'Active' : 'Inactive'}
        </span>
      </div>
      <p className="mc-name mc-name--center">{c.name}</p>
      <p className="mc-card-sub">Last appt: {formatDate(c.last_appointment_date)}</p>
      <p className="mc-card-goal">{c.total_appointments} appointment{c.total_appointments !== 1 ? 's' : ''}</p>
      <div className="mc-progress-wrap" style={{ marginTop: 10 }}>
        <div className="mc-progress-label-row">
          <span className="mc-progress-label">Completion Rate</span>
          <span className="mc-progress-pct">{rate}%</span>
        </div>
        <div className="mc-progress-bar-bg">
          <div className="mc-progress-bar-fill" style={{ width: `${rate}%` }} />
        </div>
      </div>
      <div className="mc-card-stats">
        <div className="mc-card-stat">
          <span className="mc-card-stat-val">{c.total_appointments}</span>
          <span className="mc-card-stat-label">Sessions</span>
        </div>
        <div className="mc-card-stat-divider" />
        <div className="mc-card-stat">
          <span className="mc-card-stat-val">{c.completed}</span>
          <span className="mc-card-stat-label">Completed</span>
        </div>
      </div>
      <div className="mc-card-actions">
        <button className="mc-btn-outline mc-btn-outline--sm" onClick={e => { e.stopPropagation(); onSelect(c) }}>
          View Profile
        </button>
        <button className="mc-btn-icon" title="Chat"><i className="fa-solid fa-comment" /></button>
      </div>
    </div>
  )
}

/* ─── Detail Panel ─── */
function ClientDetail({ client: c, onClose }: { client: DietitianClient; onClose: () => void }) {
  const active = isActive(c)
  const rate   = completionRate(c)
  return (
    <div className="mc-detail">
      <div className="mc-detail-header">
        <h2 className="mc-detail-title">Client Profile</h2>
        <button className="mc-detail-close" onClick={onClose}>
          <i className="fa-solid fa-xmark" />
        </button>
      </div>

      {/* Avatar + name */}
      <div className="mc-detail-hero">
        <div className="mc-avatar mc-avatar--xl">{getInitials(c.name)}</div>
        <div>
          <p className="mc-detail-name">{c.name}</p>
          <p className="mc-detail-sub">Last appointment: {formatDate(c.last_appointment_date)}</p>
          <span className={`mc-status mc-status--${active ? 'active' : 'inactive'}`}>
            {active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Completion rate */}
      <div className="mc-detail-section">
        <p className="mc-detail-section-title">Session Completion</p>
        <div className="mc-progress-wrap" style={{ marginTop: 8 }}>
          <div className="mc-progress-label-row">
            <span className="mc-progress-label">{c.completed} of {c.total_appointments} completed</span>
            <span className="mc-progress-pct">{rate}%</span>
          </div>
          <div className="mc-progress-bar-bg">
            <div className="mc-progress-bar-fill" style={{ width: `${rate}%` }} />
          </div>
        </div>
      </div>

      {/* Appointment breakdown */}
      <div className="mc-detail-section">
        <p className="mc-detail-section-title">Appointment Breakdown</p>
        <div className="mc-detail-grid">
          <div className="mc-detail-field">
            <span className="mc-detail-label">Total</span>
            <span className="mc-detail-val">{c.total_appointments}</span>
          </div>
          <div className="mc-detail-field">
            <span className="mc-detail-label">Pending</span>
            <span className="mc-detail-val">{c.pending}</span>
          </div>
          <div className="mc-detail-field">
            <span className="mc-detail-label">Confirmed</span>
            <span className="mc-detail-val">{c.confirmed}</span>
          </div>
          <div className="mc-detail-field">
            <span className="mc-detail-label">Completed</span>
            <span className="mc-detail-val">{c.completed}</span>
          </div>
          <div className="mc-detail-field">
            <span className="mc-detail-label">Cancelled</span>
            <span className="mc-detail-val">{c.cancelled}</span>
          </div>
          <div className="mc-detail-field">
            <span className="mc-detail-label">Last Appt</span>
            <span className="mc-detail-val">{formatDate(c.last_appointment_date)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mc-detail-btns">
        <button className="mc-btn-primary mc-btn-primary--full">
          <i className="fa-solid fa-bowl-food" /> View Diet Plan
        </button>
        <button className="mc-btn-outline mc-btn-outline--full">
          <i className="fa-solid fa-comment" /> Send Message
        </button>
        <button className="mc-btn-outline mc-btn-outline--full">
          <i className="fa-solid fa-video" /> Video Call
        </button>
      </div>
    </div>
  )
}
