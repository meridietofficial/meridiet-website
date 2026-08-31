import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import manualDietPlanApi from '../api/manualDietPlan'
import type { DietPlanSummary, DietPlanStatus } from '../api/dietitianDietPlan'
import SEO from '../components/SEO'

type Tab = 'all' | DietPlanStatus

const STATUS_META: Partial<Record<DietPlanStatus, { label: string; color: string }>> = {
  completed:  { label: 'Diet Chart Generated', color: 'green'  },
  sent:       { label: 'Diet Chart Generated', color: 'green'  },
  draft:      { label: 'Draft',               color: 'orange' },
  generating: { label: 'Generating…',         color: 'blue'   },
  failed:     { label: 'Generation Failed',   color: 'red'    },
  archived:   { label: 'Archived',            color: 'gray'   },
}

const DIET_LABEL: Record<string, string> = {
  vegetarian:     'Veg',
  non_vegetarian: 'Non-Veg',
  eggetarian:     'Eggetarian',
  vegan:          'Vegan',
}

const ACTIVITY_LABEL: Record<string, string> = {
  sedentary:         'Sedentary',
  lightly_active:    'Light',
  moderately_active: 'Moderate',
  very_active:       'Very Active',
  super_active:      'Athlete',
}

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch { return iso }
}

export default function DietitianManualDietPlans() {
  const navigate = useNavigate()

  const [tab, setTab]         = useState<Tab>('all')
  const [search, setSearch]   = useState('')
  const [plans, setPlans]     = useState<DietPlanSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => { fetchPlans() }, [])

  async function fetchPlans() {
    setLoading(true)
    setError(null)
    try {
      const { plans: data } = await manualDietPlanApi.list({ limit: 50 })
      setPlans(data)
    } catch (e: any) {
      setError(e.message ?? 'Failed to load manual diet plans')
    } finally {
      setLoading(false)
    }
  }

  const counts = {
    all:       plans.length,
    draft:     plans.filter(p => p.status === 'draft').length,
    generating: plans.filter(p => p.status === 'generating').length,
    completed: plans.filter(p => p.status === 'completed').length,
    sent:      plans.filter(p => p.status === 'sent').length,
    failed:    plans.filter(p => p.status === 'failed').length,
  }

  const filtered = plans.filter(p => {
    const matchesTab = tab === 'all'
      || (tab === 'completed' ? (p.status === 'completed' || p.status === 'sent') : p.status === tab)
    const q             = search.toLowerCase()
    const matchesSearch = !q || p.client_name.toLowerCase().includes(q)
    return matchesTab && matchesSearch
  })

  const TABS: [Tab, string, number][] = [
    ['all',        'All',        counts.all],
    ['draft',      'Drafts',     counts.draft],
    ['completed',  'Generated',  counts.completed + counts.sent],
    ['generating', 'Generating', counts.generating],
  ]

  return (
    <div className="dp-root">
      <SEO noIndex={true} title="Manual Diet Plans" description="Manual diet plans — private dietitian area." />

      {/* Header */}
      <div className="dp-header">
        <div>
          <h1 className="dp-title">Manual Diet Plans</h1>
          <p className="dp-subtitle">Create custom diet plans for any client — AI generates the plan for ₹50 (1 week) or ₹100 (1 month)</p>
        </div>
        <div className="dp-header-right">
          <div className="dp-header-stats">
            <div className="dp-hstat dp-hstat--green">
              <span className="dp-hstat-val">{counts.completed + counts.sent}</span>
              <span className="dp-hstat-label">Generated</span>
            </div>
            <div className="dp-hstat dp-hstat--orange">
              <span className="dp-hstat-val">{counts.draft}</span>
              <span className="dp-hstat-label">Draft</span>
            </div>
          </div>
          <button className="dp-create-btn" onClick={() => navigate('/dietitian-diet-plans/manual/new')}>
            <i className="fa-solid fa-plus" /> Create Plan
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="dp-toolbar">
        <div className="dp-tabs">
          {TABS.map(([t, label, count]) => (
            <button
              key={t}
              className={`dp-tab${tab === t ? ' dp-tab--active' : ''}`}
              onClick={() => setTab(t)}
            >
              {label}
              <span className="dp-tab-count">{count}</span>
            </button>
          ))}
        </div>
        <div className="dp-search-wrap">
          <i className="fa-solid fa-magnifying-glass dp-search-icon" />
          <input
            className="dp-search"
            placeholder="Search by client name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      <div className="dp-content">
        <div className="dp-list">

          {loading && (
            <div className="dp-empty">
              <span className="dp-empty-icon">⏳</span>
              <p className="dp-empty-text">Loading manual diet plans…</p>
            </div>
          )}

          {!loading && error && (
            <div className="dp-empty">
              <span className="dp-empty-icon">⚠️</span>
              <p className="dp-empty-text">{error}</p>
              <button className="dp-btn-view" style={{ marginTop: 8 }} onClick={fetchPlans}>Retry</button>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="dp-empty">
              <span className="dp-empty-icon">🥗</span>
              <p className="dp-empty-text">
                {tab === 'all' ? 'No manual diet plans yet' : `No ${STATUS_META[tab as DietPlanStatus]?.label ?? tab} plans`}
              </p>
              {tab === 'all' && (
                <button className="dp-create-btn" style={{ marginTop: 12 }}
                  onClick={() => navigate('/dietitian-diet-plans/manual/new')}>
                  <i className="fa-solid fa-plus" /> Create First Plan
                </button>
              )}
            </div>
          )}

          {!loading && !error && filtered.map(p => {
            const sm     = STATUS_META[p.status] ?? { label: p.status, color: 'gray' }
            const isDraft = p.status === 'draft' || p.status === 'failed'
            const goals  = p.form_goals ?? []

            return (
              <div
                key={p.id}
                className="dp-card"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/dietitian-diet-plans/${p.id}?manual=1`, { state: { isManual: true, returnTo: '/dietitian-diet-plans/manual' } })}
              >
                <div className="dp-card-top">
                  <div className="dp-card-title-wrap">
                    <span className={`dp-status dp-status--${sm.color}`}>{sm.label}</span>
                    <div className="dp-client-pill" style={{ marginTop: 6 }}>
                      <span className="dp-client-avatar">{getInitials(p.client_name)}</span>
                      <span className="dp-client-name-text">{p.client_name}</span>
                    </div>
                  </div>
                  <div className="dp-card-actions" onClick={e => e.stopPropagation()}>
                    {isDraft ? (
                      <button className="dp-btn-view"
                        onClick={() => navigate(`/dietitian-diet-plans/manual/${p.id}/edit`)}>
                        <i className="fa-solid fa-pen" /> Edit Form
                      </button>
                    ) : (
                      <button className="dp-btn-view"
                        onClick={() => navigate(`/dietitian-diet-plans/${p.id}?manual=1`, { state: { isManual: true, returnTo: '/dietitian-diet-plans/manual', startInEdit: true } })}>
                        <i className="fa-solid fa-pen" /> Edit Plan
                      </button>
                    )}
                    <button className="dp-btn-view"
                      onClick={() => navigate(`/dietitian-diet-plans/${p.id}?manual=1`, { state: { isManual: true, returnTo: '/dietitian-diet-plans/manual' } })}>
                      <i className="fa-solid fa-eye" /> View
                    </button>
                    {p.pdf_url && (
                      <a href={p.pdf_url} target="_blank" rel="noopener noreferrer"
                        className="dp-btn-view" onClick={e => e.stopPropagation()}>
                        <i className="fa-solid fa-file-pdf" /> PDF
                      </a>
                    )}
                  </div>
                </div>

                {/* Health snapshot */}
                {(p.form_age || p.form_gender || p.form_height || p.form_weight || goals.length > 0 || p.form_diet_type) && (
                  <div className="dp-health-snap">
                    <div className="dp-health-snap-row">
                      {p.form_age && <span className="dp-snap-pill">{p.form_age} yr</span>}
                      {p.form_gender && <span className="dp-snap-pill" style={{ textTransform: 'capitalize' }}>{p.form_gender}</span>}
                      {p.form_weight && (
                        <span className="dp-snap-pill">{p.form_weight}{p.form_weight_unit ?? 'kg'}</span>
                      )}
                      {p.form_diet_type && (
                        <span className="dp-snap-pill dp-snap-pill--green">
                          {DIET_LABEL[p.form_diet_type] ?? p.form_diet_type}
                        </span>
                      )}
                      {p.form_activity_level && (
                        <span className="dp-snap-pill">
                          {ACTIVITY_LABEL[p.form_activity_level] ?? p.form_activity_level}
                        </span>
                      )}
                    </div>
                    {goals.length > 0 && (
                      <div className="dp-health-snap-goals">
                        {goals.slice(0, 3).map(g => (
                          <span key={g} className="dp-goal-chip">{g.replace(/_/g, ' ')}</span>
                        ))}
                        {goals.length > 3 && (
                          <span className="dp-goal-chip dp-goal-chip--more">+{goals.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Status-specific footer */}
                {isDraft && (
                  <div className="dp-card-generate" onClick={e => e.stopPropagation()}>
                    <button
                      className="dp-btn-generate-plan"
                      onClick={() => navigate(`/dietitian-diet-plans/${p.id}?manual=1`, { state: { isManual: true, returnTo: '/dietitian-diet-plans/manual' } })}
                    >
                      <i className="fa-solid fa-wand-magic-sparkles" />
                      {p.status === 'failed' ? 'Retry — ₹100' : 'Generate Plan — ₹100'}
                    </button>
                  </div>
                )}

                {p.status === 'generating' && (
                  <div className="dp-generating-bar">
                    <i className="fa-solid fa-wand-magic-sparkles" />
                    <span>AI is generating this plan…</span>
                  </div>
                )}

                {p.created_at && (
                  <div className="dp-card-meta" style={{ marginTop: 8 }}>
                    <span className="dp-macro-updated">Created {formatDate(p.created_at)}</span>
                  </div>
                )}
              </div>
            )
          })}

        </div>
      </div>

    </div>
  )
}
