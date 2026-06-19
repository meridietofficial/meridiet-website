import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import dietitianDietPlanApi, {
  DietPlanDetail, DietPlanStatus, DietWeek, HealthFormData,
} from '../api/dietitianDietPlan'
import appointmentApi, { AppointmentDietForm } from '../api/appointment'
import DietPlanFormFields, { DietPlanFormValues, EMPTY_FORM } from '../components/DietPlanFormFields'

/* Map Title Case goal labels from the client booking form → snake_case used by the dietitian form */
const CLIENT_GOAL_MAP: Record<string, string> = {
  'Weight Loss':       'weight_loss',
  'Fat Loss':          'fat_loss',
  'Muscle Gain':       'muscle_gain',
  'PCOS Support':      'pcos_support',
  'Healthy Lifestyle': 'healthy_lifestyle',
}
function normalizeGoal(g: string): string {
  return CLIENT_GOAL_MAP[g] ?? g
}

/* Convert the client's booking diet form into the editable form shape */
function clientFormToValues(df: AppointmentDietForm): DietPlanFormValues {
  return {
    dob:                df.dob ? df.dob.split('T')[0] : '',
    age:                df.age?.toString()       ?? '',
    gender:             df.gender               ?? '',
    height:             df.height               ?? '',
    height_unit:        df.height_unit          ?? 'cm',
    weight:             df.weight?.toString()    ?? '',
    weight_unit:        df.weight_unit          ?? 'kg',
    goals:              (df.goals ?? []).map(normalizeGoal),
    goals_other:        '',
    activity_level:     df.activity_level       ?? '',
    work_type:          df.work_type            ?? '',
    workout_type:       df.workout_type         ?? '',
    diet_type:          df.diet_type            ?? '',
    cuisine_preference: df.cuisine_preference   ?? [],
    food_allergies:     df.food_allergies       ?? [],
    foods_dislike:      df.foods_dislike        ?? '',
    favorite_foods:     df.favorite_foods       ?? '',
    medical_conditions: df.medical_conditions   ?? [],
    other_condition:    df.other_condition      ?? '',
    on_medication:      df.on_medication        ?? '',
    medications:        df.medications          ?? '',
    digestive_health:   df.digestive_health     ?? '',
    smoke_alcohol:      df.smoke_alcohol        ?? '',
    health_notes:       df.health_notes         ?? '',
    plan_type:          df.plan_type?.toString() ?? '',
  }
}

/* Merge: draft-saved values win; client values fill any empty fields */
function mergeFormValues(draft: DietPlanFormValues, client: DietPlanFormValues): DietPlanFormValues {
  const pick = <T,>(d: T, c: T): T => {
    if (Array.isArray(d)) return ((d as unknown[]).length > 0 ? d : c) as T
    return (d !== '' && d != null ? d : c)
  }
  return {
    dob:                pick(draft.dob,                client.dob),
    age:                pick(draft.age,                client.age),
    gender:             pick(draft.gender,             client.gender),
    height:             pick(draft.height,             client.height),
    height_unit:        pick(draft.height_unit,        client.height_unit),
    weight:             pick(draft.weight,             client.weight),
    weight_unit:        pick(draft.weight_unit,        client.weight_unit),
    goals:              pick(draft.goals,              client.goals),
    goals_other:        pick(draft.goals_other,        client.goals_other),
    activity_level:     pick(draft.activity_level,     client.activity_level),
    work_type:          pick(draft.work_type,          client.work_type),
    workout_type:       pick(draft.workout_type,       client.workout_type),
    diet_type:          pick(draft.diet_type,          client.diet_type),
    cuisine_preference: pick(draft.cuisine_preference, client.cuisine_preference),
    food_allergies:     pick(draft.food_allergies,     client.food_allergies),
    foods_dislike:      pick(draft.foods_dislike,      client.foods_dislike),
    favorite_foods:     pick(draft.favorite_foods,     client.favorite_foods),
    medical_conditions: pick(draft.medical_conditions, client.medical_conditions),
    other_condition:    pick(draft.other_condition,    client.other_condition),
    on_medication:      pick(draft.on_medication,      client.on_medication),
    medications:        pick(draft.medications,        client.medications),
    digestive_health:   pick(draft.digestive_health,   client.digestive_health),
    smoke_alcohol:      pick(draft.smoke_alcohol,      client.smoke_alcohol),
    health_notes:       pick(draft.health_notes,       client.health_notes),
    plan_type:          pick(draft.plan_type,          client.plan_type),
  }
}

const STATUS_META: Partial<Record<DietPlanStatus, { label: string; color: string }>> = {
  completed:  { label: 'Active',     color: 'green'  },
  draft:      { label: 'Draft',      color: 'orange' },
  generating: { label: 'Generating', color: 'blue'   },
  failed:     { label: 'Failed',     color: 'red'    },
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function planToForm(fd: HealthFormData = {}): DietPlanFormValues {
  return {
    dob:                fd.dob ? fd.dob.split('T')[0] : '',
    age:                fd.age?.toString()          ?? '',
    gender:             fd.gender                   ?? '',
    height:             fd.height                   ?? '',
    height_unit:        (fd.height_unit as 'cm' | 'ft_in') ?? 'cm',
    weight:             fd.weight?.toString()        ?? '',
    weight_unit:        (fd.weight_unit as 'kg' | 'lbs') ?? 'kg',
    goals:              fd.goals                    ?? [],
    goals_other:        '',
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
  const goals = form.goals.map(g =>
    g === 'other' && form.goals_other ? form.goals_other : g
  )
  return {
    dob:              form.dob || undefined,
    age:              form.age ? Number(form.age) : undefined,
    gender:           form.gender || undefined,
    height:           form.height || undefined,
    height_unit:      form.height_unit,
    weight:           form.weight ? Number(form.weight) : undefined,
    weight_unit:      form.weight_unit,
    goals:            goals.length ? goals : undefined,
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
  const currentDays = currentWeek?.days ?? []
  const currentDay  = currentDays[openDay]

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

      {currentDays.length > 1 && (
        <div className="dp-week-tabs" style={{ marginTop: 6 }}>
          {currentDays.map((d, i) => (
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
  const location = useLocation()
  const { planId } = useParams<{ planId: string }>()
  const id = Number(planId)
  const locationState = location.state as { returnTo?: string; appointmentId?: number } | null
  const returnTo      = locationState?.returnTo ?? '/dietitian-diet-plans'
  const stateApptId   = locationState?.appointmentId

  const [plan, setPlan]             = useState<DietPlanDetail | null>(null)
  const [loading, setLoading]       = useState(true)
  const [loadError, setLoadError]   = useState<string | null>(null)
  const [form, setForm]             = useState<DietPlanFormValues>(EMPTY_FORM)
  const [clientForm, setClientForm] = useState<AppointmentDietForm | null>(null)
  const [updating, setUpdating]     = useState(false)
  const [generating, setGenerating] = useState(false)
  const [actionErr, setActionErr]   = useState<string | null>(null)
  const [savedOk, setSavedOk]       = useState(false)

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Clear poll on unmount
  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current) }, [])

  useEffect(() => { loadPlan() }, [id])

  // Poll every 15 s while generating
  useEffect(() => {
    if (plan?.status !== 'generating') return
    pollRef.current = setInterval(async () => {
      try {
        const updated = await dietitianDietPlanApi.get(id)
        if (!updated?.id) return
        if (updated.status !== 'generating') {
          setPlan(updated)
          clearInterval(pollRef.current!)
          if (updated.status === 'failed') {
            setActionErr('Diet plan generation failed. Please review the details and try again.')
          }
        }
      } catch { /* ignore rate-limit / transient errors */ }
    }, 15000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [plan?.status, id])

  async function loadPlan() {
    setLoading(true)
    setLoadError(null)
    try {
      const data = await dietitianDietPlanApi.get(id)
      if (!data?.id) throw new Error('Plan not found')
      setPlan(data)
      setForm(planToForm(data.form_data))
      // Fetch client's original diet form — prefer appointmentId from navigation state
      // (always available when coming from the appointments list), fall back to the
      // plan's own appointment_id field for direct URL access.
      const apptId = stateApptId ?? data.appointment_id
      if (apptId) {
        appointmentApi.getDietFormForAppointment(apptId)
          .then(df => {
            setClientForm(df)
            setForm(prev => mergeFormValues(prev, clientFormToValues(df)))
          })
          .catch(() => {})
      }
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
      if (updated?.id) setPlan(updated)
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
    setSavedOk(false)
    try {
      // Best-effort save — don't let a save failure block generation
      try { await dietitianDietPlanApi.update(id, formToBody(form)) } catch {}
      await dietitianDietPlanApi.generatePlan(id)
      const apptId = stateApptId ?? plan?.appointment_id
      if (apptId) {
        navigate(`/dietitian-appointments/${apptId}`)
      } else {
        navigate(returnTo)
      }
    } catch (e: any) {
      setActionErr(e.message ?? 'Failed to start generation')
    } finally {
      setGenerating(false)
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
      <button className="cdp-btn-cancel" style={{ marginTop: 16 }} onClick={() => navigate(returnTo)}>
        Go Back
      </button>
    </div>
  )

  const planStatus   = (plan.status as string | undefined ?? '').toLowerCase() as DietPlanStatus
  const sm           = STATUS_META[planStatus] ?? { label: plan.status, color: 'gray' }
  const isDraft      = planStatus === 'draft' || planStatus === 'failed'
  const isCompleted  = planStatus === 'completed'
  const isGenerating = planStatus === 'generating'
  const weeks = plan.weeks ?? []
  const busy  = updating || generating

  return (
    <div className="cdp-root">

      {/* ── Header ── */}
      <div className="cdp-header">
        <button className="cdp-back-btn" onClick={() => navigate(returnTo)}>
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
              <p className="ddp-gen-sub">This usually takes 2–5 minutes. Please keep this page open or check back later.</p>
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

        {/* Pre-fill notice */}
        {clientForm && (
          <div className="cdp-prefill-notice">
            <i className="fa-solid fa-circle-check" />
            <span>Health details pre-filled from {clientForm.full_name}'s booking form — review and adjust before saving.</span>
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

        {/* Generate CTA — shown in-body for draft/failed so it's impossible to miss */}
        {isDraft && !isGenerating && (
          <div className="ddp-generate-cta">
            <div className="ddp-generate-cta-left">
              <span className="ddp-generate-cta-icon">🤖</span>
              <div>
                <p className="ddp-generate-cta-title">Ready to generate the diet plan?</p>
                <p className="ddp-generate-cta-sub">
                  AI will build a personalised <strong>1-month meal plan</strong> based on the health details above.
                  Your draft will be saved automatically before generation starts.
                </p>
              </div>
            </div>
            <button
              className="ddp-generate-cta-btn"
              onClick={handleGenerate}
              disabled={busy}
            >
              {generating
                ? <><i className="fa-solid fa-spinner fa-spin" /> Starting…</>
                : <><i className="fa-solid fa-wand-magic-sparkles" /> Generate Diet Plan</>
              }
            </button>
          </div>
        )}

        {actionErr && <p className="cdp-error">{actionErr}</p>}
        {savedOk   && <p className="cdp-success"><i className="fa-solid fa-check" /> Draft updated successfully</p>}

      </div>

      {/* ── Sticky footer ── */}
      <div className="cdp-sticky-footer">
        {isDraft && (
          <>
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

        {isCompleted && plan.pdf_url && (
          <a href={plan.pdf_url} target="_blank" rel="noopener noreferrer" className="cdp-btn-generate">
            <i className="fa-solid fa-file-pdf" /> View PDF
          </a>
        )}

        {isGenerating && (
          <button className="cdp-btn-generate" disabled>
            <i className="fa-solid fa-spinner fa-spin" /> Generating…
          </button>
        )}
      </div>

    </div>
  )
}
