import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import dietitianDietPlanApi, {
  DietPlanDetail, DietPlanStatus, DietWeek, HealthFormData,
} from '../api/dietitianDietPlan'
import DietPlanFormFields, { DietPlanFormValues, EMPTY_FORM } from '../components/DietPlanFormFields'

const STATUS_META: Record<DietPlanStatus, { label: string; color: string }> = {
  completed:  { label: 'Active',      color: 'green'  },
  draft:      { label: 'Draft',       color: 'orange' },
  archived:   { label: 'Archived',    color: 'gray'   },
  generating: { label: 'Generating',  color: 'blue'   },
  failed:     { label: 'Failed',      color: 'red'    },
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function planToForm(fd: HealthFormData = {}): DietPlanFormValues {
  return {
    age:                fd.age?.toString()          ?? '',
    gender:             fd.gender                   ?? '',
    height:             fd.height                   ?? '',
    height_unit:        (fd.height_unit as 'cm' | 'ft_in') ?? 'cm',
    weight:             fd.weight?.toString()        ?? '',
    weight_unit:        (fd.weight_unit as 'kg' | 'lbs') ?? 'kg',
    goals:              fd.goals                    ?? [],
    activity_level:     fd.activity_level           ?? '',
    work_type:          fd.work_type                ?? '',
    workout_type:       fd.workout_type             ?? '',
    diet_type:          fd.diet_type                ?? '',
    cuisine_preference: fd.cuisine_preference       ?? [],
    food_allergies:     fd.food_allergies           ?? [],
    foods_dislike:      fd.foods_dislike            ?? '',
    favorite_foods:     fd.favorite_foods           ?? '',
    medical_conditions: fd.medical_conditions       ?? [],
    other_condition:    fd.other_condition          ?? '',
    on_medication:      fd.on_medication            ?? '',
    medications:        fd.medications              ?? '',
    digestive_health:   fd.digestive_health         ?? '',
    smoke_alcohol:      fd.smoke_alcohol            ?? '',
    health_notes:       fd.health_notes             ?? '',
    plan_type:          fd.plan_type?.toString()    ?? '',
  }
}

function formToBody(form: DietPlanFormValues) {
  return {
    age:              form.age ? Number(form.age) : undefined,
    gender:           form.gender || undefined,
    height:           form.height || undefined,
    height_unit:      form.height_unit,
    weight:           form.weight ? Number(form.weight) : undefined,
    weight_unit:      form.weight_unit,
    goals:            form.goals.length ? form.goals : undefined,
    activity_level:   form.activity_level || undefined,
    work_type:        form.work_type || undefined,
    workout_type:     form.workout_type || undefined,
    diet_type:        form.diet_type || undefined,
    cuisine_preference:  form.cuisine_preference.length ? form.cuisine_preference : undefined,
    food_allergies:      form.food_allergies.length ? form.food_allergies : undefined,
    foods_dislike:    form.foods_dislike || undefined,
    favorite_foods:   form.favorite_foods || undefined,
    medical_conditions:  form.medical_conditions.length ? form.medical_conditions : undefined,
    other_condition:  form.other_condition || undefined,
    on_medication:    form.on_medication || undefined,
    medications:      form.medications || undefined,
    digestive_health: form.digestive_health || undefined,
    smoke_alcohol:    form.smoke_alcohol || undefined,
    health_notes:     form.health_notes || undefined,
    plan_type:        form.plan_type ? Number(form.plan_type) : undefined,
  }
}

/* ─── Generated Meal Plan View ─── */
function GeneratedPlanView({ weeks }: { weeks: DietWeek[] }) {
  const [openWeek, setOpenWeek] = useState(0)
  const [openDay, setOpenDay]   = useState(0)
  const [openMeal, setOpenMeal] = useState<number | null>(null)

  const currentWeek = weeks[openWeek]
  const currentDay  = currentWeek?.days[openDay]

  return (
    <div className="cdp-section">
      <h3 className="cdp-section-title">
        <i className="fa-solid fa-utensils" /> Generated Meal Plan
      </h3>

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
  )
}

/* ─── Main Page ─── */
export default function DietitianDraftDietPlan() {
  const navigate = useNavigate()
  const { planId } = useParams<{ planId: string }>()
  const id = Number(planId)

  const [plan, setPlan]             = useState<DietPlanDetail | null>(null)
  const [loading, setLoading]       = useState(true)
  const [loadError, setLoadError]   = useState<string | null>(null)
  const [form, setForm]             = useState<DietPlanFormValues>(EMPTY_FORM)
  const [updating, setUpdating]     = useState(false)
  const [generating, setGenerating] = useState(false)
  const [archiving, setArchiving]   = useState(false)
  const [actionErr, setActionErr]   = useState<string | null>(null)
  const [savedOk, setSavedOk]       = useState(false)

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Clear poll on unmount
  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current) }, [])

  useEffect(() => { loadPlan() }, [id])

  // Poll every 6 s while generating
  useEffect(() => {
    if (plan?.status !== 'generating') return
    pollRef.current = setInterval(async () => {
      try {
        const updated = await dietitianDietPlanApi.get(id)
        if (updated.status !== 'generating') {
          setPlan(updated)
          clearInterval(pollRef.current!)
        }
      } catch { /* ignore */ }
    }, 6000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [plan?.status, id])

  async function loadPlan() {
    setLoading(true)
    setLoadError(null)
    try {
      const data = await dietitianDietPlanApi.get(id)
      setPlan(data)
      setForm(planToForm(data.form_data))
    } catch (e: any) {
      setLoadError(e.message ?? 'Failed to load plan')
    } finally {
      setLoading(false)
    }
  }

  function setField<K extends keyof DietPlanFormValues>(key: K, val: DietPlanFormValues[K]) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  async function handleUpdate() {
    setUpdating(true)
    setActionErr(null)
    setSavedOk(false)
    try {
      const updated = await dietitianDietPlanApi.update(id, formToBody(form))
      setPlan(updated)
      setSavedOk(true)
      setTimeout(() => setSavedOk(false), 3000)
    } catch (e: any) {
      setActionErr(e.message ?? 'Failed to update draft')
    } finally {
      setUpdating(false)
    }
  }

  async function handleGenerate() {
    setGenerating(true)
    setActionErr(null)
    try {
      await dietitianDietPlanApi.generatePlan(id)
      setPlan(prev => prev ? { ...prev, status: 'generating' } : prev)
    } catch (e: any) {
      setActionErr(e.message ?? 'Failed to start generation')
    } finally {
      setGenerating(false)
    }
  }

  async function handleArchive() {
    setArchiving(true)
    setActionErr(null)
    try {
      const updated = await dietitianDietPlanApi.archive(id)
      setPlan(updated)
    } catch (e: any) {
      setActionErr(e.message ?? 'Failed to archive plan')
    } finally {
      setArchiving(false)
    }
  }

  /* Loading / Error states */
  if (loading) return (
    <div className="cdp-root cdp-state-center">
      <div className="cdp-spinner" />
      <p>Loading plan…</p>
    </div>
  )

  if (loadError || !plan) return (
    <div className="cdp-root cdp-state-center">
      <i className="fa-solid fa-circle-exclamation" style={{ fontSize: 32, color: '#ef4444' }} />
      <p style={{ marginTop: 12 }}>{loadError ?? 'Plan not found'}</p>
      <button className="cdp-btn-cancel" style={{ marginTop: 16 }} onClick={() => navigate('/dietitian-diet-plans')}>
        Back to Plans
      </button>
    </div>
  )

  const sm          = STATUS_META[plan.status] ?? { label: plan.status, color: 'gray' }
  const isDraft     = plan.status === 'draft' || plan.status === 'failed'
  const isCompleted = plan.status === 'completed'
  const isGenerating = plan.status === 'generating'
  const isArchived  = plan.status === 'archived'
  const weeks       = plan.weeks ?? []
  const busy        = updating || generating || archiving

  return (
    <div className="cdp-root">

      {/* ── Header ── */}
      <div className="cdp-header">
        <button className="cdp-back-btn" onClick={() => navigate('/dietitian-diet-plans')}>
          <i className="fa-solid fa-arrow-left" />
        </button>
        <div>
          <h1 className="cdp-title">
            {isCompleted ? 'Diet Plan' : 'Draft Diet Plan'}
            <span className={`dp-status dp-status--${sm.color}`} style={{ marginLeft: 10, verticalAlign: 'middle', fontSize: 12 }}>
              {sm.label}
            </span>
          </h1>
          <p className="cdp-subtitle">
            {plan.client_name}
            {plan.appointment_date && ` · ${fmtDate(plan.appointment_date)}`}
            {plan.slot && ` · ${plan.slot}`}
          </p>
        </div>
      </div>

      <div className="cdp-body">

        {/* Generating banner */}
        {isGenerating && (
          <div className="ddp-generating-banner">
            <div className="ddp-gen-spinner" />
            <div>
              <p className="ddp-gen-title">AI is generating the diet plan…</p>
              <p className="ddp-gen-sub">This usually takes 1–2 minutes. You can leave this page and come back.</p>
            </div>
          </div>
        )}

        {/* Completed: PDF banner */}
        {isCompleted && plan.pdf_url && (
          <div className="ddp-pdf-banner">
            <i className="fa-solid fa-file-pdf" style={{ color: '#ef4444', fontSize: 20 }} />
            <span>Diet plan PDF is ready</span>
            <a href={plan.pdf_url} target="_blank" rel="noopener noreferrer" className="ddp-pdf-btn">
              <i className="fa-solid fa-download" /> Download PDF
            </a>
          </div>
        )}

        {/* Health form (editable for draft/failed, read-only otherwise) */}
        <DietPlanFormFields
          form={form}
          onChange={setField}
          disabled={!isDraft || busy}
        />

        {/* Generated meal plan (visible when completed) */}
        {isCompleted && weeks.length > 0 && (
          <GeneratedPlanView weeks={weeks} />
        )}

        {actionErr && <p className="cdp-error">{actionErr}</p>}
        {savedOk   && <p className="cdp-success"><i className="fa-solid fa-check" /> Draft updated successfully</p>}

      </div>

      {/* ── Sticky footer ── */}
      <div className="cdp-sticky-footer">
        {isDraft && (
          <>
            <button className="cdp-btn-cancel" onClick={handleArchive} disabled={busy}>
              {archiving ? 'Archiving…' : 'Archive'}
            </button>
            <button className="cdp-btn-save" onClick={handleUpdate} disabled={busy}>
              <i className="fa-solid fa-floppy-disk" />
              {updating ? 'Saving…' : 'Update Draft'}
            </button>
            <button className="cdp-btn-generate" onClick={handleGenerate} disabled={busy}>
              <i className="fa-solid fa-wand-magic-sparkles" />
              {generating ? 'Starting…' : 'Generate Diet Plan'}
            </button>
          </>
        )}

        {isCompleted && (
          <>
            {plan.pdf_url && (
              <a href={plan.pdf_url} target="_blank" rel="noopener noreferrer" className="cdp-btn-generate">
                <i className="fa-solid fa-file-pdf" /> View PDF
              </a>
            )}
            <button className="cdp-btn-cancel" onClick={handleArchive} disabled={archiving}>
              {archiving ? 'Archiving…' : 'Archive Plan'}
            </button>
          </>
        )}

        {isGenerating && (
          <button className="cdp-btn-generate" disabled>
            <i className="fa-solid fa-spinner fa-spin" /> Generating…
          </button>
        )}

        {isArchived && (
          <span className="cdp-archived-label">
            <i className="fa-solid fa-box-archive" /> Archived
          </span>
        )}
      </div>

    </div>
  )
}
