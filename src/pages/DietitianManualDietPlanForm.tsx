import { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import manualDietPlanApi, { ManualDraftBody } from '../api/manualDietPlan'
import dietitianDietPlanApi, { UpdateDraftBody } from '../api/dietitianDietPlan'
import DietPlanFormFields, { DietPlanFormValues, EMPTY_FORM } from '../components/DietPlanFormFields'

type ClientInfo = {
  full_name: string
  email: string
  whatsapp: string
  city: string
  state: string
  breakfast_time: string
  lunch_time: string
  evening_snack_time: string
  dinner_time: string
  whey_protein: string
}

const EMPTY_CLIENT: ClientInfo = {
  full_name: '', email: '', whatsapp: '',
  city: '', state: '',
  breakfast_time: '8:00 AM', lunch_time: '1:30 PM', evening_snack_time: '5:00 PM', dinner_time: '8:30 PM',
  whey_protein: '',
}


const TIMES = [
  '6:00 AM', '6:30 AM', '7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM',
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
  '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
  '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM', '10:00 PM',
]

const MEAL_TIMES = [
  { lbl: 'Breakfast',     icon: '☀️',  key: 'breakfast_time'    },
  { lbl: 'Lunch',         icon: '🌤️', key: 'lunch_time'        },
  { lbl: 'Evening Snack', icon: '🌅',  key: 'evening_snack_time' },
  { lbl: 'Dinner',        icon: '🌙',  key: 'dinner_time'       },
]

const WHEY_OPTIONS = [
  { value: 'yes_using',      label: 'Yes, I already use it', icon: '💪', desc: 'Include shakes in plan' },
  { value: 'open_to_trying', label: 'Open to trying it',     icon: '🤔', desc: 'Willing if recommended' },
  { value: 'no_food_only',   label: 'No, prefer food-only',  icon: '🥗', desc: 'Whole foods only' },
]

function isFormComplete(f: DietPlanFormValues, c: ClientInfo): boolean {
  return (
    c.full_name.trim().length > 0 &&
    f.goals.length > 0 &&
    !!f.gender &&
    !!f.height &&
    !!f.weight &&
    !!f.activity_level &&
    !!f.work_type &&
    !!f.workout_type &&
    !!f.diet_type &&
    f.medical_conditions.length > 0 &&
    !!f.on_medication &&
    !!f.digestive_health &&
    !!f.smoke_alcohol
  )
}

function buildBody(client: ClientInfo, form: DietPlanFormValues): ManualDraftBody {
  const goals = form.goals.map(g =>
    g === 'other' && form.goals_other ? form.goals_other : g
  )
  return {
    full_name: client.full_name.trim(),
    email:     client.email.trim()    || undefined,
    whatsapp:  client.whatsapp.trim() || undefined,
    city:      client.city.trim()     || undefined,
    state:     client.state.trim()    || undefined,
    breakfast_time:       client.breakfast_time    || undefined,
    lunch_time:           client.lunch_time        || undefined,
    evening_snack_time:   client.evening_snack_time || undefined,
    dinner_time:          client.dinner_time       || undefined,
    whey_protein:         client.whey_protein      || undefined,
    age:               form.age    ? Number(form.age)    : undefined,
    gender:            form.gender || undefined,
    dob:               form.dob    || undefined,
    height:            form.height || undefined,
    height_unit:       form.height_unit,
    weight:            form.weight ? Number(form.weight) : undefined,
    weight_unit:       form.weight_unit,
    goals:             goals.length ? goals : undefined,
    activity_level:    form.activity_level  || undefined,
    work_type:         form.work_type       || undefined,
    workout_type:      form.workout_type    || undefined,
    diet_type:         form.diet_type       || undefined,
    cuisine_preference: form.cuisine_preference.length ? form.cuisine_preference : undefined,
    food_allergies:     form.food_allergies.length    ? form.food_allergies    : undefined,
    foods_dislike:     form.foods_dislike   || undefined,
    favorite_foods:    form.favorite_foods  || undefined,
    medical_conditions: form.medical_conditions.length ? form.medical_conditions : undefined,
    other_condition:   form.other_condition || undefined,
    on_medication:     form.on_medication   || undefined,
    medications:       form.medications     || undefined,
    digestive_health:  form.digestive_health || undefined,
    smoke_alcohol:     form.smoke_alcohol   || undefined,
    health_notes:      form.health_notes    || undefined,
    plan_type:         form.plan_type ? Number(form.plan_type) : undefined,
  }
}

export default function DietitianManualDietPlanForm() {
  const navigate  = useNavigate()
  const { planId } = useParams<{ planId: string }>()
  const location  = useLocation()
  const isEdit    = !!planId
  const id        = Number(planId)

  const prefill = (location.state as any)?.prefill as Partial<ClientInfo> | undefined

  const [client, setClient] = useState<ClientInfo>(() =>
    prefill ? { ...EMPTY_CLIENT, ...prefill } : EMPTY_CLIENT
  )
  const [form, setForm]     = useState<DietPlanFormValues>(EMPTY_FORM)
  const [loading, setLoading]   = useState(isEdit)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (!isEdit) return
    setLoading(true)
    dietitianDietPlanApi.get(id)
      .then(plan => {
        const fd = plan.form_data || plan.form || {} as any
        setClient({
          full_name:  (plan as any).client_name ?? fd.full_name ?? '',
          email:      fd.email     ?? '',
          whatsapp:   fd.whatsapp  ?? '',
          city:       fd.city      ?? '',
          state:      fd.state     ?? '',
          breakfast_time:       fd.breakfast_time       ?? '',
          lunch_time:           fd.lunch_time           ?? '',
          evening_snack_time:   fd.evening_snack_time   ?? '',
          dinner_time:          fd.dinner_time          ?? '',
          whey_protein:         fd.whey_protein         ?? '',
        })
        setForm({
          dob:               fd.dob ? fd.dob.split('T')[0] : '',
          age:               fd.age?.toString()          ?? '',
          gender:            fd.gender                   ?? '',
          height:            fd.height                   ?? '',
          height_unit:       fd.height_unit              ?? 'cm',
          weight:            fd.weight?.toString()       ?? '',
          weight_unit:       fd.weight_unit              ?? 'kg',
          goals:             fd.goals                    ?? [],
          goals_other:       '',
          activity_level:    fd.activity_level           ?? '',
          work_type:         fd.work_type                ?? '',
          workout_type:      fd.workout_type             ?? '',
          diet_type:         fd.diet_type                ?? '',
          cuisine_preference: fd.cuisine_preference      ?? [],
          food_allergies:    fd.food_allergies           ?? [],
          foods_dislike:     fd.foods_dislike            ?? '',
          favorite_foods:    fd.favorite_foods           ?? '',
          medical_conditions: fd.medical_conditions      ?? [],
          other_condition:   fd.other_condition          ?? '',
          on_medication:     fd.on_medication            ?? '',
          medications:       fd.medications              ?? '',
          digestive_health:  fd.digestive_health         ?? '',
          smoke_alcohol:     fd.smoke_alcohol            ?? '',
          health_notes:      fd.health_notes             ?? '',
          plan_type:         fd.plan_type?.toString()    ?? '',
          city:              fd.city                     ?? '',
          state:             fd.state                    ?? '',
        })
      })
      .catch(e => setLoadError(e.message ?? 'Failed to load plan'))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  function setClientField<K extends keyof ClientInfo>(key: K, val: ClientInfo[K]) {
    setClient(prev => ({ ...prev, [key]: val }))
  }

  function setField<K extends keyof DietPlanFormValues>(key: K, val: DietPlanFormValues[K]) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  async function handleSave() {
    setError(null)
    setSaving(true)
    try {
      if (isEdit) {
        const body: UpdateDraftBody = buildBody(client, form) as UpdateDraftBody
        body.full_name = client.full_name.trim()
        await dietitianDietPlanApi.update(id, body)
        navigate(`/dietitian-diet-plans/${id}?manual=1`, { state: { isManual: true, returnTo: '/dietitian-diet-plans/manual' } })
      } else {
        const result = await manualDietPlanApi.create(buildBody(client, form))
        navigate(`/dietitian-diet-plans/${result.plan_id}?manual=1`, { state: { isManual: true, returnTo: '/dietitian-diet-plans/manual' } })
      }
    } catch (e: any) {
      setError(e.message ?? 'Failed to save draft')
    } finally {
      setSaving(false)
    }
  }

  const canSave = isFormComplete(form, client)

  if (loading) return (
    <div className="cdp-root cdp-state-center">
      <div className="cdp-spinner" />
      <p>Loading plan…</p>
    </div>
  )

  if (loadError) return (
    <div className="cdp-root cdp-state-center">
      <i className="fa-solid fa-circle-exclamation" style={{ fontSize: 32, color: '#ef4444' }} />
      <p style={{ marginTop: 12 }}>{loadError}</p>
      <button className="cdp-btn-cancel" style={{ marginTop: 16 }}
        onClick={() => navigate('/dietitian-diet-plans/manual')}>Go Back</button>
    </div>
  )

  return (
    <div className="cdp-root">

      {/* Header */}
      <div className="cdp-header">
        <button className="cdp-back-btn"
          onClick={() => navigate(isEdit ? `/dietitian-diet-plans/${id}?manual=1` : '/dietitian-diet-plans/manual')}>
          <i className="fa-solid fa-arrow-left" />
        </button>
        <div>
          <h1 className="cdp-title">{isEdit ? 'Edit Manual Plan' : 'Create Manual Diet Plan'}</h1>
          <p className="cdp-subtitle">
            {isEdit ? 'Update client information and health details' : `Fill in client details to create a new draft — AI generation costs ₹${form.plan_type === '1' ? 50 : 100} from your wallet`}
          </p>
        </div>
      </div>

      <div className="cdp-body">

        {/* ─── Client Information ─── */}
        <div className="cdp-section">
          <h3 className="cdp-section-title"><span>👤</span> Client Information</h3>
          <div className="cdp-row">
            <div className="cdp-field">
              <label className="cdp-label">Full Name <span className="cdp-req">*</span></label>
              <input
                className="cdp-input"
                placeholder="e.g. Rahul Sharma"
                value={client.full_name}
                onChange={e => setClientField('full_name', e.target.value)}
                disabled={saving}
              />
            </div>
            <div className="cdp-field">
              <label className="cdp-label">Email</label>
              <input
                className="cdp-input"
                type="email"
                placeholder="rahul@gmail.com"
                value={client.email}
                onChange={e => setClientField('email', e.target.value)}
                disabled={saving}
              />
            </div>
          </div>
          <div className="cdp-row" style={{ marginTop: 14 }}>
            <div className="cdp-field">
              <label className="cdp-label">WhatsApp Number</label>
              <input
                className="cdp-input"
                type="tel"
                placeholder="9876543210"
                value={client.whatsapp}
                onChange={e => setClientField('whatsapp', e.target.value)}
                disabled={saving}
              />
            </div>
            <div className="cdp-field">
              <label className="cdp-label">State</label>
              <input
                className="cdp-input"
                placeholder="e.g. Gujarat"
                value={client.state}
                onChange={e => setClientField('state', e.target.value)}
                disabled={saving}
              />
            </div>
          </div>
          <div className="cdp-row" style={{ marginTop: 14 }}>
            <div className="cdp-field">
              <label className="cdp-label">City</label>
              <input
                className="cdp-input"
                placeholder="e.g. Surat"
                value={client.city}
                onChange={e => setClientField('city', e.target.value)}
                disabled={saving}
              />
            </div>
            <div className="cdp-field" />
          </div>
        </div>

        {/* Health form — meal timings slot after Lifestyle, whey protein slot after Food Prefs */}
        <DietPlanFormFields
          form={form}
          onChange={setField}
          disabled={saving}
          afterLifestyle={
            <div className="cdp-section">
              <h3 className="cdp-section-title"><span>🕐</span> Preferred Meal Timings</h3>
              <p className="cdp-section-sub">Optional — helps AI tailor the schedule to the client's daily routine.</p>
              <div className="fp-timings-grid">
                {MEAL_TIMES.map(t => (
                  <div key={t.key} className="fp-timing-card">
                    <div className="fp-timing-header">
                      <span className="fp-timing-icon">{t.icon}</span>
                      <span className="fp-timing-lbl">{t.lbl}</span>
                    </div>
                    <select
                      className="fp-timing-select"
                      disabled={saving}
                      value={(client as Record<string, string>)[t.key] || ''}
                      onChange={e => setClientField(t.key as keyof ClientInfo, e.target.value)}
                    >
                      <option value="">Select time</option>
                      {TIMES.map(tt => <option key={tt}>{tt}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          }
          afterFoodPrefs={
            <div className="cdp-section">
              <h3 className="cdp-section-title"><span>🥛</span> Whey Protein / Supplements</h3>
              <p className="cdp-section-sub">Should we include protein shakes or supplements in the plan?</p>
              <div className="fp-diet-grid">
                {WHEY_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={saving}
                    className={`fp-diet-card${client.whey_protein === opt.value ? ' sel' : ''}`}
                    onClick={() => setClientField('whey_protein', client.whey_protein === opt.value ? '' : opt.value)}
                  >
                    {client.whey_protein === opt.value && <span className="fp-diet-check">✓</span>}
                    <span className="fp-diet-icon">{opt.icon}</span>
                    <strong className="fp-diet-name">{opt.label}</strong>
                    <span className="fp-diet-desc">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          }
        />

        {error && (
          <div className="cdp-error" style={{ marginTop: 16 }}>
            <i className="fa-solid fa-circle-exclamation" /> {error}
          </div>
        )}

        {!canSave && (
          <div style={{
            background: '#fefce8', border: '1px solid #fde68a',
            borderRadius: 10, padding: '10px 14px',
            fontSize: 13, color: '#92400e', margin: '8px 0',
          }}>
            <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 6 }} />
            Fill in Client Name and all required health fields (*) to save the draft.
          </div>
        )}

      </div>

      {/* Sticky footer */}
      <div className="cdp-sticky-footer">
        <button className="cdp-btn-cancel"
          onClick={() => navigate(isEdit ? `/dietitian-diet-plans/${id}?manual=1` : '/dietitian-diet-plans/manual')}>
          Cancel
        </button>
        <button
          className="cdp-btn-save"
          onClick={handleSave}
          disabled={saving || !canSave}
        >
          <i className="fa-solid fa-floppy-disk" />
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Save as Draft'}
        </button>
      </div>

    </div>
  )
}
