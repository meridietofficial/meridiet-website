import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import appointmentApi, { DietitianAppointment, AppointmentDietForm } from '../api/appointment'
import dietitianDietPlanApi from '../api/dietitianDietPlan'
import DietPlanFormFields, { DietPlanFormValues, EMPTY_FORM } from '../components/DietPlanFormFields'

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fmtEnum(s: string | null | undefined) {
  return s ? s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : null
}

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

function dietFormToValues(df: AppointmentDietForm): DietPlanFormValues {
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
    city:               df.city                 ?? '',
    state:              df.state                ?? '',
  }
}

export default function DietitianCreateDietPlan() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const apptIdParam = searchParams.get('appointment_id')

  const [clientName, setClientName]           = useState('')
  const [apptId, setApptId]                   = useState<number | ''>(apptIdParam ? Number(apptIdParam) : '')
  const [appointments, setAppointments]       = useState<DietitianAppointment[]>([])
  const [form, setForm]                       = useState<DietPlanFormValues>(EMPTY_FORM)
  const [prefilled, setPrefilled]             = useState(false)
  const [submitting, setSubmitting]           = useState(false)
  const [error, setError]                     = useState<string | null>(null)

  // Load confirmed appointments if no appointment_id in URL
  useEffect(() => {
    if (apptIdParam) return
    appointmentApi.getDietitianAppointments({ status: 'confirmed', limit: 50 })
      .then(r => setAppointments(r.data))
      .catch(() => {})
  }, [apptIdParam])

  // Load client name + pre-fill form from client's diet form whenever an appointment is selected
  const resolvedId = apptIdParam ? Number(apptIdParam) : (typeof apptId === 'number' ? apptId : null)

  useEffect(() => {
    if (!resolvedId) { setClientName(''); setForm(EMPTY_FORM); setPrefilled(false); return }
    appointmentApi.getById(resolvedId)
      .then(a => setClientName(a.name))
      .catch(() => setClientName(''))
    appointmentApi.getDietFormForAppointment(resolvedId)
      .then(df => { setForm(dietFormToValues(df)); setPrefilled(true) })
      .catch(() => { setForm(EMPTY_FORM); setPrefilled(false) })
  }, [resolvedId])

  function setField<K extends keyof DietPlanFormValues>(key: K, val: DietPlanFormValues[K]) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  async function handleSave() {
    if (!resolvedId) { setError('Please select an appointment'); return }
    setSubmitting(true)
    setError(null)
    try {
      const goals = form.goals.map(g =>
        g === 'other' && form.goals_other ? form.goals_other : g
      )
      const result = await dietitianDietPlanApi.saveDraft({
        appointment_id:   resolvedId,
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
      })
      navigate(`/dietitian-diet-plans/${result.plan_id}`)
    } catch (e: any) {
      setError(e.message ?? 'Failed to save draft')
      setSubmitting(false)
    }
  }

  return (
    <div className="cdp-root">

      {/* ── Header ── */}
      <div className="cdp-header">
        <button className="cdp-back-btn" onClick={() => navigate(-1)}>
          <i className="fa-solid fa-arrow-left" />
        </button>
        <div>
          <h1 className="cdp-title">Create Diet Plan</h1>
          <p className="cdp-subtitle">Fill in the client's health information to create a personalised plan</p>
        </div>
      </div>

      <div className="cdp-body">

        {/* Client banner */}
        {clientName && (
          <div className="cdp-client-banner">
            <div className="cdp-client-avatar">{clientName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}</div>
            <div className="cdp-client-info">
              <span className="cdp-client-label">Creating plan for</span>
              <span className="cdp-client-name">{clientName}</span>
            </div>
          </div>
        )}

        {/* Appointment picker (only if no appointment_id in URL) */}
        {!apptIdParam && (
          <div className="cdp-section">
            <h3 className="cdp-section-title">
              <i className="fa-solid fa-calendar-check" /> Select Appointment
            </h3>
            <div className="cdp-field">
              <label className="cdp-label">Appointment *</label>
              <select
                className="cdp-select"
                value={apptId}
                onChange={e => setApptId(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">Select a confirmed appointment</option>
                {appointments.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name} — {fmtDate(a.appointment_date)} · {a.slot}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Pre-fill notice */}
        {prefilled && (
          <div className="cdp-prefill-notice">
            <i className="fa-solid fa-circle-check" />
            <span>Health form pre-filled from {clientName || 'client'}'s booking details — review and adjust if needed.</span>
          </div>
        )}

        {/* Health form */}
        <DietPlanFormFields form={form} onChange={setField} disabled={submitting} />

        {error && <p className="cdp-error">{error}</p>}

      </div>

      {/* ── Sticky footer ── */}
      <div className="cdp-sticky-footer">
        <button className="cdp-btn-cancel" onClick={() => navigate(-1)} disabled={submitting}>
          Cancel
        </button>
        <button
          className="cdp-btn-save"
          onClick={handleSave}
          disabled={submitting || !resolvedId}
        >
          <i className="fa-solid fa-floppy-disk" />
          {submitting ? 'Saving…' : 'Save as Draft'}
        </button>
      </div>

    </div>
  )
}
