import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import dietitianDietPlanApi, {
  DietPlanSummary, DietPlanDetail, DietPlanStatus,
} from '../api/dietitianDietPlan'

type Tab = 'all' | DietPlanStatus

const STATUS_META: Partial<Record<DietPlanStatus, { label: string; color: string }>> = {
  completed:  { label: 'Active',     color: 'green'  },
  draft:      { label: 'Draft',      color: 'orange' },
  generating: { label: 'Generating', color: 'blue'   },
  failed:     { label: 'Failed',     color: 'red'    },
}

const GOAL_LABEL: Record<string, string> = {
  weight_loss:      'Weight Loss',
  muscle_gain:      'Muscle Gain',
  maintenance:      'Maintenance',
  improve_energy:   'Energy',
  manage_condition: 'Condition',
  hormonal_balance: 'Hormonal',
  improve_digestion:'Digestion',
  general_fitness:  'Fitness',
}

const ACTIVITY_LABEL: Record<string, string> = {
  sedentary:         'Sedentary',
  lightly_active:    'Light',
  moderately_active: 'Moderate',
  very_active:       'Very Active',
  super_active:      'Athlete',
}

const DIET_LABEL: Record<string, string> = {
  vegetarian:     'Veg',
  non_vegetarian: 'Non-Veg',
  eggetarian:     'Eggetarian',
  vegan:          'Vegan',
}

const PLAN_TYPE_LABEL: Record<number, string> = {
  1: '2 Weeks',
  2: '1 Month',
  3: '3 Months',
}

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function DietitianDietPlans() {
  const navigate = useNavigate()

  const [tab, setTab]                     = useState<Tab>('all')
  const [search, setSearch]               = useState('')
  const [plans, setPlans]                 = useState<DietPlanSummary[]>([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState<string | null>(null)
  const [selected, setSelected]           = useState<DietPlanSummary | null>(null)
  const [detailPlan, setDetailPlan]       = useState<DietPlanDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [generatingIds, setGeneratingIds] = useState<Set<number>>(new Set())
  const [openWeek, setOpenWeek]           = useState(0)
  const [openDay, setOpenDay]             = useState(0)
  const [openMeal, setOpenMeal]           = useState<number | null>(null)

  useEffect(() => { fetchPlans() }, [])

  async function fetchPlans() {
    setLoading(true)
    setError(null)
    try {
      const { data } = await dietitianDietPlanApi.list({ limit: 50 })
      setPlans(Array.isArray(data) ? data : [])
    } catch (e: any) {
      setError(e.message ?? 'Failed to load diet plans')
    } finally {
      setLoading(false)
    }
  }

  async function handleSelect(plan: DietPlanSummary) {
    if (selected?.id === plan.id) {
      setSelected(null)
      setDetailPlan(null)
      return
    }
    setSelected(plan)
    setDetailPlan(null)
    setOpenWeek(0)
    setOpenDay(0)
    setOpenMeal(null)
    setDetailLoading(true)
    try {
      const full = await dietitianDietPlanApi.get(plan.id)
      setDetailPlan(full)
    } catch { /* show summary */ }
    finally { setDetailLoading(false) }
  }

  async function handleGenerate(plan: DietPlanSummary) {
    setGeneratingIds(prev => new Set(prev).add(plan.id))
    try {
      await dietitianDietPlanApi.generatePlan(plan.id)
      setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, status: 'generating' } : p))
      if (selected?.id === plan.id) setSelected(s => s ? { ...s, status: 'generating' } : s)
    } catch { /* silent – button will re-enable */ }
    finally {
      setGeneratingIds(prev => { const s = new Set(prev); s.delete(plan.id); return s })
    }
  }

  const counts = {
    all:        plans.length,
    completed:  plans.filter(p => p.status === 'completed').length,
    draft:      plans.filter(p => p.status === 'draft').length,
    generating: plans.filter(p => p.status === 'generating').length,
    failed:     plans.filter(p => p.status === 'failed').length,
  }

  const filtered = plans.filter(p => {
    const matchesTab    = tab === 'all' || p.status === tab
    const q             = search.toLowerCase()
    const matchesSearch = !q || p.client_name.toLowerCase().includes(q)
    return matchesTab && matchesSearch
  })

  const TABS: [Tab, string, number][] = [
    ['all',        'All',        counts.all],
    ['completed',  'Active',     counts.completed],
    ['draft',      'Draft',      counts.draft],
    ['generating', 'Generating', counts.generating],
  ]

  const weeks       = detailPlan?.weeks ?? []
  const currentWeek = weeks[openWeek]
  const currentDay  = currentWeek?.days[openDay]

  return (
    <div className="dp-root">

      {/* ── Header ── */}
      <div className="dp-header">
        <div>
          <h1 className="dp-title">Diet Plans</h1>
          <p className="dp-subtitle">Create, manage and assign personalised diet plans to your clients</p>
        </div>
        <div className="dp-header-right">
          <div className="dp-header-stats">
            <div className="dp-hstat dp-hstat--green">
              <span className="dp-hstat-val">{counts.completed}</span>
              <span className="dp-hstat-label">Active</span>
            </div>
            <div className="dp-hstat dp-hstat--orange">
              <span className="dp-hstat-val">{counts.draft}</span>
              <span className="dp-hstat-label">Draft</span>
            </div>
          </div>
          <button className="dp-create-btn" onClick={() => navigate('/dietitian-diet-plans/new')}>
            <i className="fa-solid fa-plus" /> Create Plan
          </button>
        </div>
      </div>

      {/* ── Toolbar ── */}
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

      {/* ── Content ── */}
      <div className={`dp-content${selected ? ' dp-content--split' : ''}`}>

        {/* Plan list */}
        <div className="dp-list">
          {loading && (
            <div className="dp-empty">
              <span className="dp-empty-icon">⏳</span>
              <p className="dp-empty-text">Loading diet plans…</p>
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
              <p className="dp-empty-text">No diet plans found</p>
              <button className="dp-create-btn" style={{ marginTop: 12 }} onClick={() => navigate('/dietitian-diet-plans/new')}>
                <i className="fa-solid fa-plus" /> Create First Plan
              </button>
            </div>
          )}

          {!loading && !error && filtered.map(p => {
            const sm = STATUS_META[p.status] ?? { label: p.status, color: 'gray' }
            const isDraft = p.status === 'draft' || p.status === 'failed'
            const isTriggering = generatingIds.has(p.id)
            const goals = p.form_goals ?? []

            return (
              <div
                key={p.id}
                className={`dp-card${selected?.id === p.id ? ' dp-card--selected' : ''}`}
                onClick={() => handleSelect(p)}
              >
                {/* Top row: status + client + actions */}
                <div className="dp-card-top">
                  <div className="dp-card-title-wrap">
                    <span className={`dp-status dp-status--${sm.color}`}>{sm.label}</span>
                    <div className="dp-client-pill" style={{ marginTop: 6 }}>
                      <span className="dp-client-avatar">{getInitials(p.client_name)}</span>
                      <span className="dp-client-name-text">{p.client_name}</span>
                    </div>
                  </div>
                  <div className="dp-card-actions" onClick={e => e.stopPropagation()}>
                    {isDraft && (
                      <button className="dp-btn-view" onClick={() => navigate(`/dietitian-diet-plans/${p.id}`)}>
                        <i className="fa-solid fa-pen" /> Edit
                      </button>
                    )}
                    {p.status === 'completed' && p.pdf_url && (
                      <a href={p.pdf_url} target="_blank" rel="noopener noreferrer"
                        className="dp-btn-view" onClick={e => e.stopPropagation()}>
                        <i className="fa-solid fa-file-pdf" /> PDF
                      </a>
                    )}
                  </div>
                </div>

                {/* Appointment meta */}
                <div className="dp-card-meta">
                  {p.appointment_date && (
                    <span className="dp-meta-pill">
                      <i className="fa-regular fa-calendar" /> {formatDate(p.appointment_date)}
                    </span>
                  )}
                  {p.slot && (
                    <span className="dp-meta-pill">
                      <i className="fa-regular fa-clock" /> {p.slot}
                    </span>
                  )}
                  {p.updated_at && (
                    <span className="dp-macro-updated" style={{ marginLeft: 'auto' }}>
                      Updated {formatDate(p.updated_at)}
                    </span>
                  )}
                </div>

                {/* Health snapshot */}
                {(p.form_age || p.form_gender || p.form_height || p.form_weight || goals.length > 0 || p.form_diet_type) && (
                  <div className="dp-health-snap">
                    <div className="dp-health-snap-row">
                      {p.form_age && <span className="dp-snap-pill">{p.form_age} yr</span>}
                      {p.form_gender && <span className="dp-snap-pill" style={{ textTransform: 'capitalize' }}>{p.form_gender}</span>}
                      {p.form_height && (
                        <span className="dp-snap-pill">
                          {p.form_height}{p.form_height_unit ?? 'cm'}
                        </span>
                      )}
                      {p.form_weight && (
                        <span className="dp-snap-pill">
                          {p.form_weight}{p.form_weight_unit ?? 'kg'}
                        </span>
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
                      {p.form_plan_type && (
                        <span className="dp-snap-pill dp-snap-pill--blue">
                          {PLAN_TYPE_LABEL[p.form_plan_type] ?? p.form_plan_type}
                        </span>
                      )}
                    </div>
                    {goals.length > 0 && (
                      <div className="dp-health-snap-goals">
                        {goals.slice(0, 3).map(g => (
                          <span key={g} className="dp-goal-chip">
                            {GOAL_LABEL[g] ?? g}
                          </span>
                        ))}
                        {goals.length > 3 && (
                          <span className="dp-goal-chip dp-goal-chip--more">+{goals.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Generate button for draft plans */}
                {isDraft && (
                  <div className="dp-card-generate" onClick={e => e.stopPropagation()}>
                    <button
                      className="dp-btn-generate-plan"
                      disabled={isTriggering}
                      onClick={() => handleGenerate(p)}
                    >
                      {isTriggering
                        ? <><i className="fa-solid fa-spinner fa-spin" /> Starting…</>
                        : <><i className="fa-solid fa-wand-magic-sparkles" /> Generate Diet Plan</>
                      }
                    </button>
                  </div>
                )}

                {/* Generating indicator */}
                {p.status === 'generating' && (
                  <div className="dp-generating-bar">
                    <i className="fa-solid fa-wand-magic-sparkles" />
                    <span>AI is generating this plan…</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* ── Detail panel ── */}
        {selected && (
          <div className="dp-detail">
            <div className="dp-detail-header">
              <h2 className="dp-detail-title">Plan Details</h2>
              <button className="dp-detail-close" onClick={() => { setSelected(null); setDetailPlan(null) }}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {detailLoading ? (
              <div className="dp-empty" style={{ padding: '40px 0' }}>
                <span className="dp-empty-icon">⏳</span>
                <p className="dp-empty-text">Loading plan…</p>
              </div>
            ) : (
              <>
                {/* Hero */}
                <div className="dp-detail-hero">
                  {(() => {
                    const sm = STATUS_META[selected.status] ?? { label: selected.status, color: 'gray' }
                    return <span className={`dp-status dp-status--${sm.color}`}>{sm.label}</span>
                  })()}
                  <div className="dp-client-pill dp-client-pill--detail" style={{ marginTop: 10 }}>
                    <span className="dp-client-avatar">{getInitials(selected.client_name)}</span>
                    {selected.client_name}
                  </div>
                </div>

                {/* Plan info */}
                <div className="dp-detail-section">
                  <p className="dp-detail-section-title">Appointment Info</p>
                  <div className="dp-detail-grid">
                    {selected.appointment_date && (
                      <div className="dp-detail-field">
                        <span className="dp-detail-label">Date</span>
                        <span className="dp-detail-val">{formatDate(selected.appointment_date)}</span>
                      </div>
                    )}
                    {selected.slot && (
                      <div className="dp-detail-field">
                        <span className="dp-detail-label">Slot</span>
                        <span className="dp-detail-val">{selected.slot}</span>
                      </div>
                    )}
                    {selected.created_at && (
                      <div className="dp-detail-field">
                        <span className="dp-detail-label">Created</span>
                        <span className="dp-detail-val">{formatDate(selected.created_at)}</span>
                      </div>
                    )}
                    {selected.updated_at && (
                      <div className="dp-detail-field">
                        <span className="dp-detail-label">Updated</span>
                        <span className="dp-detail-val">{formatDate(selected.updated_at)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Meal schedule (completed plans) */}
                {weeks.length > 0 && (
                  <div className="dp-detail-section">
                    <p className="dp-detail-section-title">
                      Meal Schedule
                      {currentWeek && ` · Week ${currentWeek.week}`}
                      {currentDay  && ` · ${currentDay.day}`}
                    </p>

                    {weeks.length > 1 && (
                      <div className="dp-week-tabs">
                        {weeks.map((w, i) => (
                          <button
                            key={i}
                            className={`dp-week-tab${openWeek === i ? ' dp-week-tab--active' : ''}`}
                            onClick={() => { setOpenWeek(i); setOpenDay(0); setOpenMeal(null) }}
                          >
                            W{w.week}
                          </button>
                        ))}
                      </div>
                    )}

                    {currentWeek && currentWeek.days.length > 1 && (
                      <div className="dp-week-tabs" style={{ marginTop: 6 }}>
                        {currentWeek.days.map((d, i) => (
                          <button
                            key={i}
                            className={`dp-week-tab${openDay === i ? ' dp-week-tab--active' : ''}`}
                            onClick={() => { setOpenDay(i); setOpenMeal(null) }}
                          >
                            {d.day.slice(0, 3)}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="dp-meals" style={{ marginTop: 10 }}>
                      {(currentDay?.meals ?? []).map((meal, idx) => (
                        <div key={idx} className="dp-meal">
                          <button
                            className={`dp-meal-header${openMeal === idx ? ' dp-meal-header--open' : ''}`}
                            onClick={() => setOpenMeal(openMeal === idx ? null : idx)}
                          >
                            <span className="dp-meal-label">{meal.label}</span>
                            {meal.calories != null && (
                              <span className="dp-meal-cals">{meal.calories} kcal</span>
                            )}
                            <i className={`fa-solid fa-chevron-${openMeal === idx ? 'up' : 'down'} dp-meal-chevron`} />
                          </button>
                          {openMeal === idx && (
                            <ul className="dp-meal-items">
                              {meal.items.map((item, i) => (
                                <li key={i} className="dp-meal-item">
                                  <span className="dp-meal-dot" /> {item}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="dp-detail-btns">
                  {(selected.status === 'draft' || selected.status === 'failed') && (
                    <button
                      className="dp-btn-primary dp-btn-primary--full"
                      onClick={() => navigate(`/dietitian-diet-plans/${selected.id}`)}
                    >
                      <i className="fa-solid fa-pen" /> Edit Draft
                    </button>
                  )}

                  {selected.status === 'completed' && selected.pdf_url && (
                    <a
                      href={selected.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="dp-btn-primary dp-btn-primary--full"
                    >
                      <i className="fa-solid fa-file-pdf" /> View PDF
                    </a>
                  )}

                  {selected.status === 'generating' && (
                    <div className="dp-generating-bar" style={{ margin: '8px 0' }}>
                      <i className="fa-solid fa-wand-magic-sparkles" />
                      <span>Generating… check back soon.</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

    </div>
  )
}
