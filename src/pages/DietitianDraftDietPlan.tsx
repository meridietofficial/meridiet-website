import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, useLocation, useOutletContext } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import dietitianDietPlanApi, {
  DietPlanDetail, DietPlanStatus, DietWeek, DietFoodItem, FeaturedRecipe,
  HealthFormData, PlanContent, SendPlanResult, SmartSwap,
} from '../api/dietitianDietPlan'
import appointmentApi, { AppointmentDietForm } from '../api/appointment'
import earningsApi from '../api/earnings'
import DietPlanFormFields, { DietPlanFormValues, EMPTY_FORM } from '../components/DietPlanFormFields'
import DietPlanDocument, { PAGE_W, PAGE_H } from '../components/DietPlanDocument'
import ManualDietPlanDocument from '../components/ManualDietPlanDocument'
import type { DietitianOutletContext } from '../components/DietitianLayout'
import SearchableSelect from '../components/SearchableSelect'
import { IN_STATES } from '../data/indiaCities'
import SEO from '../components/SEO'

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
    city:               df.city                 ?? '',
    state:              df.state                ?? '',
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
    city:               pick(draft.city,               client.city),
    state:              pick(draft.state,              client.state),
  }
}

const STATUS_META: Partial<Record<DietPlanStatus, { label: string; color: string }>> = {
  completed:  { label: 'Ready to Send', color: 'green'  },
  draft:      { label: 'Draft',         color: 'orange' },
  generating: { label: 'Generating',    color: 'blue'   },
  failed:     { label: 'Failed',        color: 'red'    },
  sent:       { label: 'Sent ✓',        color: 'teal'   },
}


/* Build the plan shape that DietPlanDocument expects */
function planDetailToDoc(plan: DietPlanDetail, clientForm?: import('../api/appointment').AppointmentDietForm | null): any {
  const fd = plan.form_data || plan.form || {}
  return {
    form_id: plan.form_id,
    summary: {
      client_name:      plan.client_name,
      calorie_range:    plan.calorie_range,
      plan_duration:    plan.plan_duration,
      primary_goal:     plan.primary_goal,
      protein_target_g: plan.protein_target_g,
      carbs_target_g:   plan.carbs_target_g,
      fat_target_g:     plan.fat_target_g,
    },
    client_profile: {
      personal_information: {
        full_name: plan.client_name,
        age:       fd.age,
        gender:    fd.gender,
        date_of_birth: fd.dob,
        height:    fd.height,
        phone:     (fd as any).whatsapp || (fd as any).phone || clientForm?.whatsapp || null,
        email:     (fd as any).email   || clientForm?.email  || null,
        city:      (fd as any).city    || clientForm?.city   || null,
        state:     (fd as any).state   || clientForm?.state  || null,
      },
      current_vitals: {
        weight_kg:    fd.weight,
        height_cm:    typeof fd.height === 'string' ? parseFloat(fd.height) : fd.height,
        bmi:          plan.bmi,
        bmi_category: plan.bmi_category,
        bmr_kcal:     plan.bmr,
        tdee_kcal:    plan.tdee,
      },
      health_and_fitness_goals: {
        goals:        fd.goals,
        health_notes: fd.health_notes,
      },
      lifestyle_overview: {
        activity_level:  fd.activity_level,
        work_type:       fd.work_type,
        workout_type:    fd.workout_type,
        smoke_alcohol:   fd.smoke_alcohol,
        digestive_health: fd.digestive_health,
      },
      medical_information: {
        medical_conditions: fd.medical_conditions,
        other_condition:    fd.other_condition,
        on_medication:      fd.on_medication,
        medications:        fd.medications,
        food_allergies:     fd.food_allergies,
      },
      dietary_information: {
        diet_type:          fd.diet_type,
        cuisine_preference: fd.cuisine_preference,
        favorite_foods:     fd.favorite_foods,
        foods_dislike:      fd.foods_dislike,
      },
    },
    weeks:            plan.weeks,
    featured_recipes: plan.featured_recipes,
    general_tips:     plan.general_tips,
    hydration_guide:  plan.hydration_guide,
  }
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
    city:               (fd as any).city            ?? '',
    state:              (fd as any).state           ?? '',
  }
}

function isFormComplete(f: DietPlanFormValues): boolean {
  return (
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
    city:             form.city  || undefined,
    state:            form.state || undefined,
    plan_type:        form.plan_type ? Number(form.plan_type) : 2,
  }
}

/* ─── PDF-style plan preview wrapper ─── */
function PlanDocPreview({ plan, dietitian, isManual, clientForm }: {
  plan: DietPlanDetail
  dietitian?: import('../api/dietitian').DietitianProfile | null
  isManual?: boolean
  clientForm?: import('../api/appointment').AppointmentDietForm | null
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [docHeight, setDocHeight] = useState(PAGE_H)
  useEffect(() => {
    function measure() {
      const w = wrapRef.current?.parentElement?.clientWidth ?? PAGE_W
      const h = wrapRef.current?.scrollHeight ?? PAGE_H
      setScale(Math.min(1, (w - 8) / PAGE_W))
      setDocHeight(h)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])
  const docPlan = planDetailToDoc(plan, clientForm)

  const [downloading, setDownloading] = useState(false)

  async function handleDownloadPdf() {
    if (!wrapRef.current || downloading) return
    setDownloading(true)

    // Remove the responsive scale transform so html2canvas captures at full A4 resolution
    const wrap = wrapRef.current
    const savedTransform    = wrap.style.transform
    const savedMarginBottom = wrap.style.marginBottom
    wrap.style.transform    = 'none'
    wrap.style.marginBottom = '0'

    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ])
      const pages = Array.from(wrap.querySelectorAll<HTMLElement>('.dp-page'))
      if (pages.length === 0) return
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [PAGE_W, PAGE_H], hotfixes: ['px_scaling'] })
      for (let i = 0; i < pages.length; i++) {
        const canvas = await html2canvas(pages[i], {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          width: PAGE_W,
          height: PAGE_H,
          windowWidth: PAGE_W,
          windowHeight: PAGE_H,
        })
        if (i > 0) pdf.addPage([PAGE_W, PAGE_H])
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, PAGE_W, PAGE_H)
      }
      const name = (plan.client_name || 'diet-plan').replace(/\s+/g, '-').toLowerCase()
      pdf.save(`${name}-diet-plan.pdf`)
    } finally {
      wrap.style.transform    = savedTransform
      wrap.style.marginBottom = savedMarginBottom
      setDownloading(false)
    }
  }

  return (
    <div className="dpv-doc-outer">
      <SEO noIndex={true} title="Draft Diet Plan" description="Draft diet plan — private dietitian area." />
      <div className="dpv-download-bar">
        <button className="dpv-download-btn" onClick={handleDownloadPdf} disabled={downloading}>
          {downloading
            ? <><i className="fa-solid fa-circle-notch fa-spin" /> Generating PDF…</>
            : <><i className="fa-solid fa-download" /> Download as PDF</>}
        </button>
      </div>
      <div ref={wrapRef}
        style={{
          width: PAGE_W,
          transformOrigin: 'top left',
          transform: `scale(${scale})`,
          marginBottom: `${(docHeight * (scale - 1))}px`,
        }}>
        {isManual
          ? <ManualDietPlanDocument plan={docPlan} dietitian={dietitian} />
          : <DietPlanDocument plan={docPlan} />
        }
      </div>
    </div>
  )
}

/* ─── Meal-editor immutable helpers ─── */
type MealKey = 'breakfast' | 'lunch' | 'snack' | 'dinner'

function setFoodItem(weeks: DietWeek[], wi: number, di: number, meal: MealKey, fi: number, field: string, val: string): DietWeek[] {
  return weeks.map((w, a) => a !== wi ? w : ({
    ...w,
    days: (w.days ?? []).map((d, b) => b !== di ? d : ({
      ...d,
      [meal]: (d[meal] ?? []).map((f, c) => c !== fi ? f : ({
        ...f,
        [field]: (field === 'kcal' || field === 'protein_g') ? (val !== '' ? Number(val) : undefined) : val,
      })),
    })),
  }))
}
function addFoodItem(weeks: DietWeek[], wi: number, di: number, meal: MealKey): DietWeek[] {
  return weeks.map((w, a) => a !== wi ? w : ({
    ...w,
    days: (w.days ?? []).map((d, b) => b !== di ? d : ({
      ...d,
      [meal]: [...(d[meal] ?? []), { food: '' }],
    })),
  }))
}
function removeFoodItem(weeks: DietWeek[], wi: number, di: number, meal: MealKey, fi: number): DietWeek[] {
  return weeks.map((w, a) => a !== wi ? w : ({
    ...w,
    days: (w.days ?? []).map((d, b) => b !== di ? d : ({
      ...d,
      [meal]: (d[meal] ?? []).filter((_, c) => c !== fi),
    })),
  }))
}
function setWeekProp(weeks: DietWeek[], wi: number, field: string, val: any): DietWeek[] {
  return weeks.map((w, a) => a !== wi ? w : { ...w, [field]: val })
}
function recomputeDayTotals(weeks: DietWeek[]): DietWeek[] {
  return weeks.map(w => ({
    ...w,
    days: (w.days ?? []).map(day => {
      let kcal = 0, protein = 0
      for (const m of ['breakfast', 'lunch', 'snack', 'dinner'] as MealKey[]) {
        for (const item of ((day as any)[m] ?? [])) {
          kcal    += Number(item.kcal      ?? 0)
          protein += Number(item.protein_g ?? 0)
        }
      }
      for (const em of (day.extra_meals ?? [])) {
        for (const item of (em.items ?? [])) {
          kcal    += Number(item.kcal      ?? 0)
          protein += Number(item.protein_g ?? 0)
        }
      }
      return { ...day, total_kcal: Math.round(kcal), total_protein_g: Math.round(protein * 10) / 10 }
    }),
  }))
}

// Extra meal helpers
function addExtraMeal(weeks: DietWeek[], wi: number, di: number): DietWeek[] {
  return weeks.map((w, a) => a !== wi ? w : ({
    ...w,
    days: (w.days ?? []).map((d, b) => b !== di ? d : ({
      ...d,
      extra_meals: [...(d.extra_meals ?? []), { name: 'Extra Meal', items: [] }],
    })),
  }))
}
function removeExtraMeal(weeks: DietWeek[], wi: number, di: number, ei: number): DietWeek[] {
  return weeks.map((w, a) => a !== wi ? w : ({
    ...w,
    days: (w.days ?? []).map((d, b) => b !== di ? d : ({
      ...d,
      extra_meals: (d.extra_meals ?? []).filter((_, i) => i !== ei),
    })),
  }))
}
function renameExtraMeal(weeks: DietWeek[], wi: number, di: number, ei: number, name: string): DietWeek[] {
  return weeks.map((w, a) => a !== wi ? w : ({
    ...w,
    days: (w.days ?? []).map((d, b) => b !== di ? d : ({
      ...d,
      extra_meals: (d.extra_meals ?? []).map((em, i) => i !== ei ? em : { ...em, name }),
    })),
  }))
}
function addExtraMealItem(weeks: DietWeek[], wi: number, di: number, ei: number): DietWeek[] {
  return weeks.map((w, a) => a !== wi ? w : ({
    ...w,
    days: (w.days ?? []).map((d, b) => b !== di ? d : ({
      ...d,
      extra_meals: (d.extra_meals ?? []).map((em, i) =>
        i !== ei ? em : { ...em, items: [...(em.items ?? []), { food: '' }] }
      ),
    })),
  }))
}
function setExtraMealItem(weeks: DietWeek[], wi: number, di: number, ei: number, fi: number, field: string, val: string): DietWeek[] {
  return weeks.map((w, a) => a !== wi ? w : ({
    ...w,
    days: (w.days ?? []).map((d, b) => b !== di ? d : ({
      ...d,
      extra_meals: (d.extra_meals ?? []).map((em, i) =>
        i !== ei ? em : {
          ...em,
          items: (em.items ?? []).map((f, c) => c !== fi ? f : ({
            ...f,
            [field]: (field === 'kcal' || field === 'protein_g') ? (val !== '' ? Number(val) : undefined) : val,
          })),
        }
      ),
    })),
  }))
}
function removeExtraMealItem(weeks: DietWeek[], wi: number, di: number, ei: number, fi: number): DietWeek[] {
  return weeks.map((w, a) => a !== wi ? w : ({
    ...w,
    days: (w.days ?? []).map((d, b) => b !== di ? d : ({
      ...d,
      extra_meals: (d.extra_meals ?? []).map((em, i) =>
        i !== ei ? em : { ...em, items: (em.items ?? []).filter((_, c) => c !== fi) }
      ),
    })),
  }))
}
function setMealTiming(weeks: DietWeek[], wi: number, di: number, meal: MealKey, time: string): DietWeek[] {
  return weeks.map((w, a) => a !== wi ? w : ({
    ...w,
    days: (w.days ?? []).map((d, b) => b !== di ? d : ({
      ...d,
      meal_timing: { ...(d.meal_timing ?? {}), [meal]: time },
    })),
  }))
}
function setExtraMealTime(weeks: DietWeek[], wi: number, di: number, ei: number, time: string): DietWeek[] {
  return weeks.map((w, a) => a !== wi ? w : ({
    ...w,
    days: (w.days ?? []).map((d, b) => b !== di ? d : ({
      ...d,
      extra_meals: (d.extra_meals ?? []).map((em, i) =>
        i !== ei ? em : { ...em, time }
      ),
    })),
  }))
}

/* ─── Edit Plan Mode ─── */

type EditPlanContentProps = {
  plan: DietPlanDetail
  editedFields: Record<string, any>
  onFieldChange: (key: string, val: any) => void
  editTips: string[]
  onTipsChange: (tips: string[]) => void
  editWeeks: DietWeek[]
  onWeeksChange: (weeks: DietWeek[]) => void
  editRecipes: FeaturedRecipe[]
  onRecipesChange: (recipes: FeaturedRecipe[]) => void
  isDirty: boolean
  onBack: () => void
  onSave: () => void
  onSend: () => void
  saving: boolean
  sending: boolean
  actionErr: string | null
  isManual?: boolean
}

const MEAL_COLORS: Record<MealKey, string> = {
  breakfast: '#f59e0b', lunch: '#10b981', snack: '#8b5cf6', dinner: '#3b82f6',
}
const MEAL_ICONS: Record<MealKey, string> = {
  breakfast: '🌅', lunch: '☀️', snack: '🍎', dinner: '🌙',
}
const SUMMARY_FIELDS: { key: string; label: string; placeholder?: string; type?: string }[] = [
  { key: 'calorie_range',    label: 'Calorie Range',      placeholder: '1800–2000 kcal/day' },
  { key: 'primary_goal',     label: 'Primary Goal',       placeholder: 'Weight Loss' },
  { key: 'plan_duration',    label: 'Plan Duration',      placeholder: '4 weeks' },
  { key: 'diet_type',        label: 'Diet Type',          placeholder: 'Vegetarian' },
  { key: 'protein_target_g', label: 'Protein Target (g)', type: 'number' },
  { key: 'carbs_target_g',   label: 'Carbs Target (g)',   type: 'number' },
  { key: 'fat_target_g',     label: 'Fat Target (g)',     type: 'number' },
  { key: 'hydration_guide',  label: 'Hydration Guide',    placeholder: 'Drink 2.5–3 L daily' },
  { key: 'notes',            label: 'Dietitian Notes',    placeholder: 'Additional notes…' },
]

function EditPlanContent({
  plan, editedFields, onFieldChange,
  editTips, onTipsChange,
  editWeeks, onWeeksChange,
  editRecipes, onRecipesChange,
  isDirty, onBack, onSave, onSend, saving, sending, actionErr, isManual,
}: EditPlanContentProps) {
  const [openWeekIdx, setOpenWeekIdx]     = useState<number | null>(0)
  const [openDays, setOpenDays]           = useState<Record<string, boolean>>({})
  const [openRecipeIdx, setOpenRecipeIdx] = useState<number | null>(null)
  const [editingTipIdx, setEditingTipIdx] = useState<number | null>(null)
  const [editingTipVal, setEditingTipVal] = useState('')
  const [newTip, setNewTip]               = useState('')

  const fd = plan.form || plan.form_data || {}

  function getFieldVal(key: string): any {
    return key in editedFields ? editedFields[key] : ((plan as any)[key] ?? '')
  }
  function isFieldDirty(key: string): boolean {
    if (!(key in editedFields)) return false
    return String(editedFields[key] ?? '') !== String((plan as any)[key] ?? '')
  }

  // Meal helpers (delegate to module-level immutable helpers)
  function updMealItem(wi: number, di: number, meal: MealKey, fi: number, field: string, val: string) {
    onWeeksChange(recomputeDayTotals(setFoodItem(editWeeks, wi, di, meal, fi, field, val)))
  }
  function addMealItm(wi: number, di: number, meal: MealKey) {
    onWeeksChange(recomputeDayTotals(addFoodItem(editWeeks, wi, di, meal)))
  }
  function remMealItm(wi: number, di: number, meal: MealKey, fi: number) {
    onWeeksChange(recomputeDayTotals(removeFoodItem(editWeeks, wi, di, meal, fi)))
  }

  // Extra meal helpers
  function addExMeal(wi: number, di: number) {
    onWeeksChange(recomputeDayTotals(addExtraMeal(editWeeks, wi, di)))
  }
  function remExMeal(wi: number, di: number, ei: number) {
    onWeeksChange(recomputeDayTotals(removeExtraMeal(editWeeks, wi, di, ei)))
  }
  function renExMeal(wi: number, di: number, ei: number, name: string) {
    onWeeksChange(renameExtraMeal(editWeeks, wi, di, ei, name))
  }
  function addExMealItm(wi: number, di: number, ei: number) {
    onWeeksChange(recomputeDayTotals(addExtraMealItem(editWeeks, wi, di, ei)))
  }
  function updExMealItm(wi: number, di: number, ei: number, fi: number, field: string, val: string) {
    onWeeksChange(recomputeDayTotals(setExtraMealItem(editWeeks, wi, di, ei, fi, field, val)))
  }
  function remExMealItm(wi: number, di: number, ei: number, fi: number) {
    onWeeksChange(recomputeDayTotals(removeExtraMealItem(editWeeks, wi, di, ei, fi)))
  }
  function updMealTiming(wi: number, di: number, meal: MealKey, time: string) {
    onWeeksChange(setMealTiming(editWeeks, wi, di, meal, time))
  }
  function updExMealTime(wi: number, di: number, ei: number, time: string) {
    onWeeksChange(setExtraMealTime(editWeeks, wi, di, ei, time))
  }

  // Week helpers
  function updWeekProp(wi: number, field: string, val: any) {
    onWeeksChange(setWeekProp(editWeeks, wi, field, val))
  }
  function addSwap(wi: number) {
    onWeeksChange(editWeeks.map((w, i) => i !== wi ? w : {
      ...w, smart_swaps: [...(w.smart_swaps ?? []), { instead_of: '', choose: '' }],
    }))
  }
  function updSwap(wi: number, si: number, field: keyof SmartSwap, val: string) {
    onWeeksChange(editWeeks.map((w, i) => i !== wi ? w : {
      ...w,
      smart_swaps: (w.smart_swaps ?? []).map((s, j) => j !== si ? s : { ...s, [field]: val }),
    }))
  }
  function remSwap(wi: number, si: number) {
    onWeeksChange(editWeeks.map((w, i) => i !== wi ? w : {
      ...w, smart_swaps: (w.smart_swaps ?? []).filter((_, j) => j !== si),
    }))
  }

  // Recipe helpers
  function updRecipe(ri: number, partial: Partial<FeaturedRecipe>) {
    onRecipesChange(editRecipes.map((r, i) => i === ri ? { ...r, ...partial } : r))
  }
  function addRecIngredient(ri: number) {
    onRecipesChange(editRecipes.map((r, i) => i === ri ? { ...r, ingredients: [...(r.ingredients ?? []), ''] } : r))
  }
  function updRecIngredient(ri: number, ii: number, val: string) {
    onRecipesChange(editRecipes.map((r, i) => i !== ri ? r : {
      ...r, ingredients: (r.ingredients ?? []).map((x, j) => j === ii ? val : x),
    }))
  }
  function remRecIngredient(ri: number, ii: number) {
    onRecipesChange(editRecipes.map((r, i) => i !== ri ? r : {
      ...r, ingredients: (r.ingredients ?? []).filter((_, j) => j !== ii),
    }))
  }
  function addRecStep(ri: number) {
    onRecipesChange(editRecipes.map((r, i) => i === ri ? { ...r, steps: [...(r.steps ?? []), ''] } : r))
  }
  function updRecStep(ri: number, si: number, val: string) {
    onRecipesChange(editRecipes.map((r, i) => i !== ri ? r : {
      ...r, steps: (r.steps ?? []).map((x, j) => j === si ? val : x),
    }))
  }
  function remRecStep(ri: number, si: number) {
    onRecipesChange(editRecipes.map((r, i) => i !== ri ? r : {
      ...r, steps: (r.steps ?? []).filter((_, j) => j !== si),
    }))
  }
  function addRecipe() {
    onRecipesChange([...editRecipes, { name: 'New Recipe', ingredients: [], steps: [] }])
    setOpenRecipeIdx(editRecipes.length)
  }
  function remRecipe(ri: number) {
    onRecipesChange(editRecipes.filter((_, i) => i !== ri))
    if (openRecipeIdx === ri) setOpenRecipeIdx(null)
  }

  function dayTotal(day: any) {
    // Prefer stored totals (kept live by recomputeDayTotals on every item change)
    if (day.total_kcal != null || day.total_protein_g != null) {
      return { kcal: day.total_kcal ?? 0, protein: day.total_protein_g ?? 0 }
    }
    let kcal = 0, protein = 0
    for (const m of ['breakfast', 'lunch', 'snack', 'dinner'] as MealKey[]) {
      for (const item of (day[m] ?? [])) {
        kcal    += Number(item.kcal      ?? 0)
        protein += Number(item.protein_g ?? 0)
      }
    }
    return { kcal, protein }
  }

  return (
    <div className="epm-root">

      {/* Sticky toolbar */}
      <div className="epm-toolbar">
        <button className="epm-back-btn" onClick={onBack}>
          <i className="fa-solid fa-arrow-left" /> Back
        </button>
        <div className="epm-toolbar-title">
          <span className="epm-toolbar-name">{plan.client_name}</span>
          <span className="epm-toolbar-sub">Edit Diet Plan #{plan.id}</span>
        </div>
        <div className="epm-toolbar-actions">
          {isDirty && (
            <button className="epm-save-btn" onClick={onSave} disabled={saving || sending}>
              <i className="fa-solid fa-floppy-disk" /> {saving ? 'Saving…' : 'Save Changes'}
            </button>
          )}
          {!isManual && (
            <button className="epm-send-btn" onClick={onSend} disabled={saving || sending}>
              <i className="fa-solid fa-paper-plane" /> {sending ? 'Sending…' : 'Send to Patient'}
            </button>
          )}
        </div>
      </div>

      <div className="epm-body">
        {actionErr && (
          <div className="epm-error"><i className="fa-solid fa-circle-exclamation" /> {actionErr}</div>
        )}

        {/* 2-col info cards */}
        <div className="epm-info-grid">
          <div className="epm-card">
            <div className="epm-card-header"><i className="fa-solid fa-user" /> Client Info</div>
            {([
              { label: 'Name',   value: plan.client_name },
              { label: 'Gender', value: fd.gender },
              { label: 'Age',    value: fd.age },
              { label: 'Height', value: fd.height ? `${fd.height} ${fd.height_unit ?? ''}`.trim() : undefined },
              { label: 'Weight', value: fd.weight ? `${fd.weight} ${fd.weight_unit ?? 'kg'}` : undefined },
            ] as { label: string; value: any }[]).filter(r => r.value != null).map(r => (
              <div key={r.label} className="epm-info-row">
                <span>{r.label}</span><b>{String(r.value)}</b>
              </div>
            ))}
            {plan.sent_at && (
              <div className="epm-info-row"><span>Sent At</span><b>{fmtDate(plan.sent_at)}</b></div>
            )}
            {plan.pdf_url && (
              <a href={plan.pdf_url} target="_blank" rel="noopener noreferrer" className="epm-pdf-link">
                <i className="fa-solid fa-file-pdf" /> Download PDF
              </a>
            )}
          </div>

          <div className="epm-card">
            <div className="epm-card-header"><i className="fa-solid fa-heart-pulse" /> Vitals &amp; Targets</div>
            <div className="epm-vitals-grid">
              {([
                { label: 'BMI',     value: plan.bmi != null ? Number(plan.bmi).toFixed(1) : undefined, sub: plan.bmi_category ?? '' },
                { label: 'BMR',     value: plan.bmr  ? `${plan.bmr} kcal`  : undefined, sub: 'Basal Metabolic Rate' },
                { label: 'TDEE',    value: plan.tdee ? `${plan.tdee} kcal` : undefined, sub: 'Daily Energy Exp.' },
                { label: 'Protein', value: plan.protein_target_g ? `${plan.protein_target_g}g` : undefined, sub: 'Daily target' },
                { label: 'Carbs',   value: plan.carbs_target_g   ? `${plan.carbs_target_g}g`   : undefined, sub: 'Daily target' },
                { label: 'Fat',     value: plan.fat_target_g     ? `${plan.fat_target_g}g`     : undefined, sub: 'Daily target' },
              ] as { label: string; value: any; sub: string }[]).filter(v => v.value != null).map(v => (
                <div key={v.label} className="epm-vital-chip">
                  <span className="epm-vital-val">{v.value}</span>
                  <span className="epm-vital-label">{v.label}</span>
                  {v.sub && <span className="epm-vital-sub">{v.sub}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Plan Summary (Editable) */}
        <div className="epm-section">
          <div className="epm-section-header">
            <i className="fa-solid fa-bullseye" /> Plan Summary
            <span className="epm-section-badge epm-badge-editable">Editable</span>
          </div>
          <div className="epm-summary-grid">
            {SUMMARY_FIELDS.map(({ key, label, placeholder, type }) => {
              const dirty = isFieldDirty(key)
              return (
                <div key={key} className={`epm-field-block${dirty ? ' epm-field-dirty' : ''}`}>
                  <label className="epm-field-label">
                    {label}{dirty && <span className="epm-dirty-dot" />}
                  </label>
                  <input
                    className="epm-field-input"
                    type={type ?? 'text'}
                    placeholder={placeholder ?? ''}
                    value={getFieldVal(key)}
                    onChange={e => onFieldChange(key, type === 'number' ? Number(e.target.value) : e.target.value)}
                  />
                </div>
              )
            })}
          </div>
        </div>

        {/* General Tips (Editable) */}
        <div className="epm-section">
          <div className="epm-section-header">
            <i className="fa-solid fa-lightbulb" /> General Tips
            <span className="epm-section-badge epm-badge-editable">Editable</span>
          </div>
          <div className="epm-tips-list">
            {editTips.map((tip, ti) => (
              <div key={ti} className="epm-tip-row">
                {editingTipIdx === ti ? (
                  <>
                    <textarea className="epm-tip-textarea" rows={2} value={editingTipVal}
                      onChange={e => setEditingTipVal(e.target.value)} />
                    <div className="epm-tip-actions">
                      <button className="epm-btn-sm epm-btn-green" onClick={() => {
                        onTipsChange(editTips.map((t, i) => i === ti ? editingTipVal : t))
                        setEditingTipIdx(null)
                      }}>Save</button>
                      <button className="epm-btn-sm epm-btn-gray" onClick={() => setEditingTipIdx(null)}>Cancel</button>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="epm-tip-num">{ti + 1}.</span>
                    <span className="epm-tip-text">{tip}</span>
                    <div className="epm-tip-actions">
                      <button className="epm-btn-sm epm-btn-outline" title="Edit"
                        onClick={() => { setEditingTipIdx(ti); setEditingTipVal(tip) }}>
                        <i className="fa-solid fa-pen" />
                      </button>
                      <button className="epm-btn-sm epm-btn-red" title="Delete"
                        onClick={() => onTipsChange(editTips.filter((_, i) => i !== ti))}>
                        <i className="fa-solid fa-trash" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {editTips.length === 0 && <p className="epm-empty-hint">No tips yet — add one below.</p>}
          </div>
          <div className="epm-add-tip-row">
            <input className="epm-tip-input" placeholder="Add a new tip…" value={newTip}
              onChange={e => setNewTip(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && newTip.trim()) {
                  onTipsChange([...editTips, newTip.trim()])
                  setNewTip('')
                }
              }} />
            <button className="epm-btn-sm epm-btn-green" disabled={!newTip.trim()}
              onClick={() => { if (newTip.trim()) { onTipsChange([...editTips, newTip.trim()]); setNewTip('') } }}>
              <i className="fa-solid fa-plus" /> Add
            </button>
          </div>
        </div>

        {/* Featured Recipes (Editable) */}
        {(
          <div className="epm-section">
            <div className="epm-section-header">
              <i className="fa-solid fa-bowl-food" /> Featured Recipes
              <span className="epm-section-badge epm-badge-editable">Editable</span>
            </div>
            {editRecipes.map((recipe, ri) => (
              <div key={ri} className="epm-accordion">
                <button className="epm-accordion-head"
                  onClick={() => setOpenRecipeIdx(openRecipeIdx === ri ? null : ri)}>
                  <span className="epm-acc-label">{recipe.name || `Recipe ${ri + 1}`}</span>
                  <span className="epm-acc-meta">
                    {recipe.cook_time && <span>{recipe.cook_time}</span>}
                    {recipe.calories  && <span>{recipe.calories} kcal</span>}
                  </span>
                  <i className={`fa-solid fa-chevron-${openRecipeIdx === ri ? 'up' : 'down'} epm-acc-chevron`} />
                </button>
                {openRecipeIdx === ri && (
                  <div className="epm-accordion-body">
                    <div className="epm-recipe-meta-grid">
                      {([
                        { key: 'name',      label: 'Name',            wide: true   },
                        { key: 'cook_time', label: 'Cook Time'                     },
                        { key: 'servings',  label: 'Servings',        type:'number'},
                        { key: 'calories',  label: 'Calories (kcal)', type:'number'},
                      ] as { key: string; label: string; wide?: boolean; type?: string }[]).map(({ key, label, wide, type }) => (
                        <div key={key} className={`epm-field-block${wide ? ' epm-field-wide' : ''}`}>
                          <label className="epm-field-label">{label}</label>
                          <input className="epm-field-input" type={type ?? 'text'}
                            value={(recipe as any)[key] ?? ''}
                            onChange={e => updRecipe(ri, { [key]: type === 'number' ? Number(e.target.value) : e.target.value })} />
                        </div>
                      ))}
                    </div>
                    <div className="epm-recipe-macros">
                      {(['protein_g','carbs_g','fat_g','fiber_g'] as const).map(k => (
                        <div key={k} className="epm-field-block">
                          <label className="epm-field-label">{k.replace('_g','').replace('_',' ')} (g)</label>
                          <input className="epm-field-input" type="number"
                            value={recipe.macros?.[k] ?? ''}
                            onChange={e => updRecipe(ri, {
                              macros: { ...recipe.macros, [k]: e.target.value ? Number(e.target.value) : undefined }
                            })} />
                        </div>
                      ))}
                    </div>
                    <div className="epm-recipe-list-section">
                      <div className="epm-list-label">Ingredients</div>
                      {(recipe.ingredients ?? []).map((ing, ii) => (
                        <div key={ii} className="epm-list-item-row">
                          <span className="epm-list-bullet">•</span>
                          <input className="epm-field-input" placeholder="e.g. 1 cup oats" value={ing}
                            onChange={e => updRecIngredient(ri, ii, e.target.value)} />
                          <button className="epm-btn-icon-red" onClick={() => remRecIngredient(ri, ii)}>
                            <i className="fa-solid fa-xmark" />
                          </button>
                        </div>
                      ))}
                      <button className="epm-add-item-btn" onClick={() => addRecIngredient(ri)}>
                        <i className="fa-solid fa-plus" /> Add ingredient
                      </button>
                    </div>
                    <div className="epm-recipe-list-section">
                      <div className="epm-list-label">Steps</div>
                      {(recipe.steps ?? []).map((step, si) => (
                        <div key={si} className="epm-list-item-row">
                          <span className="epm-list-bullet epm-list-num">{si + 1}.</span>
                          <input className="epm-field-input" placeholder="Describe this step…" value={step}
                            onChange={e => updRecStep(ri, si, e.target.value)} />
                          <button className="epm-btn-icon-red" onClick={() => remRecStep(ri, si)}>
                            <i className="fa-solid fa-xmark" />
                          </button>
                        </div>
                      ))}
                      <button className="epm-add-item-btn" onClick={() => addRecStep(ri)}>
                        <i className="fa-solid fa-plus" /> Add step
                      </button>
                    </div>
                    <button className="epm-delete-recipe-btn" onClick={() => remRecipe(ri)}>
                      <i className="fa-solid fa-trash" /> Delete Recipe
                    </button>
                  </div>
                )}
              </div>
            ))}
            {editRecipes.length === 0 && <p className="epm-empty-hint">No recipes yet — click Add Recipe to create one.</p>}
            <button className="epm-add-recipe-btn" onClick={addRecipe}>
              <i className="fa-solid fa-plus" /> Add Recipe
            </button>
          </div>
        )}

        {/* Weekly Meal Plan (Editable) */}
        {editWeeks.length > 0 && (
          <div className="epm-section">
            <div className="epm-section-header">
              <i className="fa-solid fa-calendar-week" /> Weekly Meal Plan
              <span className="epm-section-badge epm-badge-editable">Editable</span>
            </div>
            {editWeeks.map((week, wi) => (
              <div key={wi} className="epm-accordion epm-week-accordion">
                <button className="epm-accordion-head epm-week-head"
                  onClick={() => setOpenWeekIdx(openWeekIdx === wi ? null : wi)}>
                  <span className="epm-acc-label">
                    Week {week.week}{week.title ? ` — ${week.title}` : ''}
                  </span>
                  <span className="epm-acc-meta">
                    {(week.focus ?? []).slice(0, 2).map((f, i) => (
                      <span key={i} className="epm-focus-chip">{f}</span>
                    ))}
                  </span>
                  <i className={`fa-solid fa-chevron-${openWeekIdx === wi ? 'up' : 'down'} epm-acc-chevron`} />
                </button>
                {openWeekIdx === wi && (
                  <div className="epm-accordion-body">

                    {/* Week metadata */}
                    <div className="epm-week-meta-grid">
                      <div className="epm-field-block">
                        <label className="epm-field-label">Title</label>
                        <input className="epm-field-input" value={week.title ?? ''}
                          onChange={e => updWeekProp(wi, 'title', e.target.value)} />
                      </div>
                      <div className="epm-field-block">
                        <label className="epm-field-label">What to Expect</label>
                        <input className="epm-field-input" value={week.what_to_expect ?? ''}
                          onChange={e => updWeekProp(wi, 'what_to_expect', e.target.value)} />
                      </div>
                      <div className="epm-field-block epm-field-full">
                        <label className="epm-field-label">Description</label>
                        <textarea className="epm-field-input epm-field-textarea" rows={2}
                          value={week.description ?? ''}
                          onChange={e => updWeekProp(wi, 'description', e.target.value)} />
                      </div>
                      <div className="epm-field-block epm-field-full">
                        <label className="epm-field-label">
                          Focus Points <span style={{ fontSize: 10, color: '#9ca3af' }}>(one per line — shown in plan overview)</span>
                        </label>
                        <textarea className="epm-field-input epm-field-textarea" rows={2}
                          value={(week.focus ?? []).join('\n')}
                          onChange={e => updWeekProp(wi, 'focus', e.target.value.split('\n').filter(Boolean))} />
                      </div>
                      <div className="epm-field-block epm-field-full">
                        <label className="epm-field-label">
                          Weekly Notes <span style={{ fontSize: 10, color: '#9ca3af' }}>(one per line)</span>
                        </label>
                        <textarea className="epm-field-input epm-field-textarea" rows={3}
                          value={(week.weekly_notes ?? []).join('\n')}
                          onChange={e => updWeekProp(wi, 'weekly_notes', e.target.value.split('\n'))} />
                      </div>
                    </div>

                    {/* Smart Swaps */}
                    <div className="epm-smart-swaps">
                      <div className="epm-sub-header">
                        <i className="fa-solid fa-arrows-rotate" /> Smart Swaps
                        <button className="epm-btn-sm epm-btn-outline" style={{ marginLeft: 'auto' }}
                          onClick={() => addSwap(wi)}>
                          <i className="fa-solid fa-plus" /> Add
                        </button>
                      </div>
                      {(week.smart_swaps ?? []).length === 0 && (
                        <p className="epm-empty-hint">No smart swaps — click Add to create one.</p>
                      )}
                      {(week.smart_swaps ?? []).map((swap, si) => (
                        <div key={si} className="epm-swap-row">
                          <input className="epm-field-input epm-swap-inp" placeholder="Instead of…"
                            value={swap.instead_of}
                            onChange={e => updSwap(wi, si, 'instead_of', e.target.value)} />
                          <span className="epm-swap-arrow">→</span>
                          <input className="epm-field-input epm-swap-inp" placeholder="Choose this"
                            value={swap.choose}
                            onChange={e => updSwap(wi, si, 'choose', e.target.value)} />
                          <button className="epm-btn-icon-red" onClick={() => remSwap(wi, si)}>
                            <i className="fa-solid fa-xmark" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Days */}
                    {(week.days ?? []).map((day, di) => {
                      const dayKey = `${wi}-${di}`
                      const isOpen = dayKey in openDays ? openDays[dayKey] : di === 0
                      const tot    = dayTotal(day)
                      return (
                        <div key={di} className="epm-day-accordion">
                          <button className="epm-day-head"
                            onClick={() => setOpenDays(prev => ({ ...prev, [dayKey]: !isOpen }))}>
                            <span className="epm-day-label">Day {day.day}</span>
                            {tot.kcal > 0 && (
                              <span className="epm-day-total">
                                {tot.kcal} kcal · {tot.protein.toFixed(0)}g protein
                              </span>
                            )}
                            <i className={`fa-solid fa-chevron-${isOpen ? 'up' : 'down'} epm-acc-chevron`} />
                          </button>
                          {isOpen && (
                            <div className="epm-day-body">
                              {(['breakfast','lunch','snack','dinner'] as MealKey[]).map(mealKey => {
                                const items  = day[mealKey] ?? []
                                const mKcal  = items.reduce((s: number, f: any) => s + (f.kcal ?? 0), 0)
                                const col    = MEAL_COLORS[mealKey]
                                return (
                                  <div key={mealKey} className="epm-meal-section" style={{ borderLeftColor: col }}>
                                    <div className="epm-meal-head">
                                      <span style={{ color: col, fontWeight: 700 }}>
                                        {MEAL_ICONS[mealKey]} {mealKey.charAt(0).toUpperCase() + mealKey.slice(1)}
                                      </span>
                                      <input
                                        className="epm-field-input"
                                        style={{ maxWidth: 100, padding: '2px 6px', fontSize: 12, color: '#6b7280' }}
                                        placeholder="e.g. 8:00 AM"
                                        value={(day.meal_timing as any)?.[mealKey] ?? ''}
                                        onChange={e => updMealTiming(wi, di, mealKey, e.target.value)}
                                      />
                                      {mKcal > 0 && (
                                        <span className="epm-meal-kcal" style={{ background: col + '22', color: col }}>
                                          {mKcal} kcal
                                        </span>
                                      )}
                                    </div>
                                    {items.length > 0 && (
                                      <div className="epm-food-header-row">
                                        <span className="epm-fc-food">Food</span>
                                        <span className="epm-fc-qty">Qty</span>
                                        <span className="epm-fc-kcal">kcal</span>
                                        <span className="epm-fc-prot">protein (g)</span>
                                        <span />
                                      </div>
                                    )}
                                    {items.map((item: any, fi: number) => (
                                      <div key={fi} className="epm-food-row">
                                        <input className="epm-food-inp epm-fc-food" placeholder="Food name"
                                          value={item.food ?? ''}
                                          onChange={e => updMealItem(wi, di, mealKey, fi, 'food', e.target.value)} />
                                        <input className="epm-food-inp epm-fc-qty" placeholder="e.g. 1 cup"
                                          value={item.quantity ?? ''}
                                          onChange={e => updMealItem(wi, di, mealKey, fi, 'quantity', e.target.value)} />
                                        <input className="epm-food-inp epm-fc-kcal" type="number" placeholder="0"
                                          value={item.kcal ?? ''}
                                          onChange={e => updMealItem(wi, di, mealKey, fi, 'kcal', e.target.value)} />
                                        <input className="epm-food-inp epm-fc-prot" type="number" placeholder="0"
                                          value={item.protein_g ?? ''}
                                          onChange={e => updMealItem(wi, di, mealKey, fi, 'protein_g', e.target.value)} />
                                        <button className="epm-btn-icon-red"
                                          onClick={() => remMealItm(wi, di, mealKey, fi)}>
                                          <i className="fa-solid fa-xmark" />
                                        </button>
                                      </div>
                                    ))}
                                    <button className="epm-add-food-btn"
                                      onClick={() => addMealItm(wi, di, mealKey)}>
                                      <i className="fa-solid fa-plus" /> Add item
                                    </button>
                                  </div>
                                )
                              })}
                              {/* Extra meals */}
                              {(day.extra_meals ?? []).map((em, ei) => {
                                const emKcal = (em.items ?? []).reduce((s, f) => s + (f.kcal ?? 0), 0)
                                return (
                                  <div key={ei} className="epm-meal-section" style={{ borderLeftColor: '#ec4899' }}>
                                    <div className="epm-meal-head">
                                      <input
                                        className="epm-field-input"
                                        style={{ fontWeight: 700, color: '#ec4899', maxWidth: 200, padding: '2px 6px' }}
                                        value={em.name}
                                        onChange={e => renExMeal(wi, di, ei, e.target.value)}
                                        placeholder="Meal name…"
                                      />
                                      <input
                                        className="epm-field-input"
                                        style={{ maxWidth: 100, padding: '2px 6px', fontSize: 12, color: '#6b7280' }}
                                        placeholder="e.g. 5:00 PM"
                                        value={em.time ?? ''}
                                        onChange={e => updExMealTime(wi, di, ei, e.target.value)}
                                      />
                                      {emKcal > 0 && (
                                        <span className="epm-meal-kcal" style={{ background: '#fdf2f8', color: '#ec4899' }}>
                                          {emKcal} kcal
                                        </span>
                                      )}
                                      <button className="epm-btn-icon-red" style={{ marginLeft: 'auto' }}
                                        title="Remove this meal"
                                        onClick={() => remExMeal(wi, di, ei)}>
                                        <i className="fa-solid fa-trash" />
                                      </button>
                                    </div>
                                    {(em.items ?? []).length > 0 && (
                                      <div className="epm-food-header-row">
                                        <span className="epm-fc-food">Food</span>
                                        <span className="epm-fc-qty">Qty</span>
                                        <span className="epm-fc-kcal">kcal</span>
                                        <span className="epm-fc-prot">protein (g)</span>
                                        <span />
                                      </div>
                                    )}
                                    {(em.items ?? []).map((item, fi) => (
                                      <div key={fi} className="epm-food-row">
                                        <input className="epm-food-inp epm-fc-food" placeholder="Food name"
                                          value={item.food ?? ''}
                                          onChange={e => updExMealItm(wi, di, ei, fi, 'food', e.target.value)} />
                                        <input className="epm-food-inp epm-fc-qty" placeholder="e.g. 1 cup"
                                          value={item.quantity ?? ''}
                                          onChange={e => updExMealItm(wi, di, ei, fi, 'quantity', e.target.value)} />
                                        <input className="epm-food-inp epm-fc-kcal" type="number" placeholder="0"
                                          value={item.kcal ?? ''}
                                          onChange={e => updExMealItm(wi, di, ei, fi, 'kcal', e.target.value)} />
                                        <input className="epm-food-inp epm-fc-prot" type="number" placeholder="0"
                                          value={item.protein_g ?? ''}
                                          onChange={e => updExMealItm(wi, di, ei, fi, 'protein_g', e.target.value)} />
                                        <button className="epm-btn-icon-red"
                                          onClick={() => remExMealItm(wi, di, ei, fi)}>
                                          <i className="fa-solid fa-xmark" />
                                        </button>
                                      </div>
                                    ))}
                                    <button className="epm-add-food-btn"
                                      onClick={() => addExMealItm(wi, di, ei)}>
                                      <i className="fa-solid fa-plus" /> Add item
                                    </button>
                                  </div>
                                )
                              })}

                              {/* Add meal button */}
                              <button
                                className="epm-add-food-btn"
                                style={{ marginTop: 8, borderColor: '#ec4899', color: '#ec4899' }}
                                onClick={() => addExMeal(wi, di)}
                              >
                                <i className="fa-solid fa-plus" /> Add Meal
                              </button>

                              {tot.kcal > 0 && (
                                <div className="epm-day-totals-bar">
                                  <span>Day Total:</span>
                                  <b>{tot.kcal} kcal</b>
                                  <b>{tot.protein.toFixed(0)}g protein</b>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Original Form Data (read-only) */}
        <div className="epm-section epm-section-readonly">
          <div className="epm-section-header">
            <i className="fa-solid fa-clipboard" /> Original Form Data
            <span className="epm-section-badge epm-badge-readonly">Read-only</span>
          </div>
          <div className="epm-form-data-grid">
            {([
              { label: 'Age',              value: fd.age },
              { label: 'Gender',           value: fd.gender },
              { label: 'Height',           value: fd.height ? `${fd.height} ${fd.height_unit ?? ''}`.trim() : undefined },
              { label: 'Weight',           value: fd.weight ? `${fd.weight} ${fd.weight_unit ?? 'kg'}` : undefined },
              { label: 'Activity Level',   value: fd.activity_level },
              { label: 'Work Type',        value: fd.work_type },
              { label: 'Workout Type',     value: fd.workout_type },
              { label: 'Diet Type',        value: fd.diet_type },
              { label: 'Digestive Health', value: fd.digestive_health },
              { label: 'Smoke / Alcohol',  value: fd.smoke_alcohol },
              { label: 'On Medication',    value: fd.on_medication },
              { label: 'Medications',      value: fd.medications },
            ] as { label: string; value: any }[]).filter(r => r.value != null && r.value !== '').map(({ label, value }) => (
              <div key={label} className="epm-form-chip">
                <span className="epm-chip-label">{label}</span>
                <span className="epm-chip-val">{String(value)}</span>
              </div>
            ))}
          </div>
          {(fd.medical_conditions ?? []).length > 0 && (
            <div className="epm-tags-row">
              <span className="epm-tags-label">Medical Conditions:</span>
              {(fd.medical_conditions as string[]).map((c, i) => (
                <span key={i} className="epm-tag epm-tag-red">{c}</span>
              ))}
            </div>
          )}
          {(fd.goals ?? []).length > 0 && (
            <div className="epm-tags-row">
              <span className="epm-tags-label">Goals:</span>
              {(fd.goals as string[]).map((g, i) => (
                <span key={i} className="epm-tag epm-tag-green">{g.replace(/_/g, ' ')}</span>
              ))}
            </div>
          )}
          {(fd.food_allergies ?? []).length > 0 && (
            <div className="epm-tags-row">
              <span className="epm-tags-label">Food Allergies:</span>
              {(fd.food_allergies as string[]).map((a, i) => (
                <span key={i} className="epm-tag epm-tag-orange">{a}</span>
              ))}
            </div>
          )}
          {fd.health_notes && (
            <div className="epm-health-notes">
              <span className="epm-tags-label">Health Notes:</span>
              <p>{fd.health_notes}</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

/* ─── Main Page ─── */
export default function DietitianDraftDietPlan() {
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast } = useToast()
  const { planId } = useParams<{ planId: string }>()
  const { profile } = useOutletContext<DietitianOutletContext>()
  const id = Number(planId)
  const locationState = location.state as { returnTo?: string; appointmentId?: number; isManual?: boolean; startInEdit?: boolean } | null
  const searchParams  = new URLSearchParams(location.search)
  const returnTo      = locationState?.returnTo ?? '/dietitian-diet-plans'
  const stateApptId   = locationState?.appointmentId
  const stateIsManual = (locationState?.isManual ?? false) || searchParams.get('manual') === '1'
  const startInEdit   = locationState?.startInEdit ?? false

  const [plan, setPlan]             = useState<DietPlanDetail | null>(null)
  const [loading, setLoading]       = useState(true)
  const [loadError, setLoadError]   = useState<string | null>(null)
  const [form, setForm]             = useState<DietPlanFormValues>(EMPTY_FORM)
  const [clientForm, setClientForm] = useState<AppointmentDietForm | null>(null)
  const [updating, setUpdating]           = useState(false)
  const [generating, setGenerating]       = useState(false)
  const [editingContent, setEditingContent] = useState(false)
  const [editedFields, setEditedFields]   = useState<Record<string, any>>({})
  const [editTips, setEditTips]           = useState<string[]>([])
  const [editWeeks, setEditWeeks]         = useState<DietWeek[]>([])
  const [editRecipes, setEditRecipes]     = useState<FeaturedRecipe[]>([])
  const [savingContent, setSavingContent] = useState(false)
  const [sending, setSending]             = useState(false)
  const [sendResult, setSendResult]       = useState<SendPlanResult | null>(null)
  const [actionErr, setActionErr]         = useState<string | null>(null)
  const [savedOk, setSavedOk]             = useState(false)
  const [sendOk, setSendOk]               = useState(false)
  const [showSendModal, setShowSendModal] = useState(false)
  // Wallet balance check for manual plans
  const [planCredits, setPlanCredits]             = useState<number | null>(null)   // plan credits wallet
  const [walletBalance, setWalletBalance]         = useState<number | null>(null)   // earnings wallet
  const [showWalletModal, setShowWalletModal]     = useState(false)
  const [addMoneyAmt, setAddMoneyAmt]             = useState('200')
  const [topping, setTopping]                     = useState(false)
  const [topupError, setTopupError]               = useState<string | null>(null)

  // Client info inline editing (manual plans)
  const [clientEmail, setClientEmail]         = useState('')
  const [clientWhatsapp, setClientWhatsapp]   = useState('')
  const [clientCity, setClientCity]           = useState('')
  const [clientState, setClientState]         = useState('')
  const [clientStateCode, setClientStateCode] = useState('')
  const [cities, setCities]                   = useState<string[]>([])
  const [citiesLoading, setCitiesLoading]     = useState(false)

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Clear poll on unmount
  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current) }, [])

  useEffect(() => { loadPlan() }, [id])

  // Fetch cities when state changes
  useEffect(() => {
    if (!clientState) { setCities([]); return }
    setCitiesLoading(true)
    fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country: 'India', state: clientState }),
    })
      .then(r => r.json())
      .then(data => setCities(Array.isArray(data?.data) ? data.data : []))
      .catch(() => setCities([]))
      .finally(() => setCitiesLoading(false))
  }, [clientState])

  // Auto-enter edit mode when navigated here with startInEdit flag (e.g. from "Edit Plan" button on list)
  useEffect(() => {
    if (startInEdit && plan && (plan.status === 'completed' || plan.status === 'sent')) {
      startEditContent()
    }
  }, [startInEdit, plan?.id])

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
      const fd2 = (data.form || data.form_data || {}) as any
      const stateName = fd2.state ?? ''
      setClientEmail(fd2.email ?? '')
      setClientWhatsapp(fd2.whatsapp ?? '')
      setClientCity(fd2.city ?? '')
      setClientState(stateName)
      setClientStateCode(fd2.state_code ?? IN_STATES.find(s => s.name === stateName)?.isoCode ?? '')
      const apptId = stateApptId ?? data.appointment_id
      const isManual = stateIsManual || (!apptId && !data.user_id)
      if (apptId) {
        appointmentApi.getDietFormForAppointment(apptId)
          .then(df => {
            setClientForm(df)
            setForm(prev => mergeFormValues(prev, clientFormToValues(df)))
          })
          .catch(() => {})
      }
      // Pre-load wallet balances for manual plans so the generate CTA can show them
      if (isManual) {
        earningsApi.getWalletOverview()
          .then(res => {
            setPlanCredits(res.plan_credits ?? 0)
            setWalletBalance(res.available_balance ?? 0)
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
      const updated = await dietitianDietPlanApi.update(id, {
        ...formToBody(form),
        email:    clientEmail.trim()    || undefined,
        whatsapp: clientWhatsapp.trim() || undefined,
        city:     clientCity.trim()     || undefined,
        state:    clientState.trim()    || undefined,
      })
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
    setActionErr(null)
    setSavedOk(false)
    const apptId   = stateApptId ?? plan?.appointment_id
    const isManual = stateIsManual || (!apptId && !plan?.user_id)

    // Refresh balances and recheck — button disabled state covers the common case
    if (isManual) {
      try {
        const balRes  = await earningsApi.getWalletOverview()
        const credits  = balRes.plan_credits    ?? 0
        const earnings = balRes.available_balance ?? 0
        setPlanCredits(credits)
        setWalletBalance(earnings)
        if (credits + earnings < generationCost) return   // button will show as disabled; 402 is the server fallback
      } catch { /* server will return 402 if both wallets are insufficient */ }
    }

    setGenerating(true)
    try {
      try { await dietitianDietPlanApi.update(id, formToBody(form)) } catch {}
      const result = await dietitianDietPlanApi.generatePlan(id)

      // Toast confirming which wallet was charged
      if (result.deducted_from === 'plan_credits') {
        showToast(`₹${result.deducted_amount} deducted from plan credits. Generation started!`)
      } else if (result.deducted_from === 'earnings') {
        showToast(`₹${result.deducted_amount} deducted from earnings wallet (plan credits were insufficient). Generation started!`)
      } else {
        showToast('Generation started!')
      }

      if (apptId) {
        navigate(`/dietitian-appointments/${apptId}`)
      } else {
        navigate(returnTo)
      }
    } catch (e: any) {
      if (e?.status === 402 || e?.message?.toLowerCase().includes('insufficient')) {
        // Server confirmed both wallets insufficient — refresh balances and show recharge modal
        earningsApi.getWalletOverview().then(res => {
          setPlanCredits(res.plan_credits ?? 0)
          setWalletBalance(res.available_balance ?? 0)
        }).catch(() => {})
        setShowWalletModal(true)
      } else {
        setActionErr(e.message ?? 'Failed to start generation')
      }
    } finally {
      setGenerating(false)
    }
  }

  async function handleWalletTopup() {
    const amt = Number(addMoneyAmt)
    if (!amt || amt < 100) { setTopupError('Minimum recharge amount is ₹100'); return }
    setTopping(true)
    setTopupError(null)
    try {
      const orderRes = await earningsApi.rechargeCreateOrder(amt)
      const { order_id, key_id, amount, currency } = orderRes.data
      const rzp = new window.Razorpay({
        key:         key_id,
        amount:      amount * 100,
        currency:    currency ?? 'INR',
        order_id,
        name:        'MeriDiet',
        description: 'Plan Credits Recharge',
        image:       '/logo.png',
        theme: { color: '#6366f1' },
        handler: async (rzpResponse: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            const verifyRes = await earningsApi.rechargeVerify(rzpResponse)
            setPlanCredits(verifyRes.data?.plan_credits ?? (planCredits ?? 0) + amt)
            setShowWalletModal(false)
            setTopupError(null)
          } catch (err: any) {
            setTopupError(err.message ?? 'Payment verification failed')
          } finally {
            setTopping(false)
          }
        },
        modal: {
          ondismiss: async () => {
            try { await earningsApi.rechargeFailed(order_id) } catch {}
            setTopping(false)
          },
        },
      })
      rzp.open()
    } catch (e: any) {
      setTopupError(e.message ?? 'Could not initiate payment')
      setTopping(false)
    }
  }

  function startEditContent() {
    if (!plan) return
    setEditedFields({})
    setEditTips(plan.general_tips ?? [])
    const weeks = JSON.parse(JSON.stringify(plan.weeks ?? []))
    setEditWeeks(recomputeDayTotals(weeks))
    setEditRecipes(JSON.parse(JSON.stringify(plan.featured_recipes ?? [])))
    setEditingContent(true)
    setActionErr(null)
  }

  async function handleSaveContent() {
    setSavingContent(true)
    setActionErr(null)
    try {
      const weeksWithTotals = recomputeDayTotals(editWeeks)
      const body = {
        weeks:            weeksWithTotals,
        featured_recipes: editRecipes.length ? editRecipes : undefined,
        general_tips:     editTips,
        ...editedFields,
      } as PlanContent
      await dietitianDietPlanApi.updateContent(id, body)
      setSavedOk(true)
      setEditingContent(false)
      loadPlan()
      setTimeout(() => setSavedOk(false), 3000)
    } catch (e: any) {
      setActionErr(e.message ?? 'Failed to save plan content')
    } finally {
      setSavingContent(false)
    }
  }

  async function handleSendConfirm() {
    setShowSendModal(false)
    setActionErr(null)
    if (isDirty) {
      setSavingContent(true)
      try {
        await dietitianDietPlanApi.updateContent(id, {
          weeks:            recomputeDayTotals(editWeeks),
          featured_recipes: editRecipes.length ? editRecipes : undefined,
          general_tips:     editTips,
          ...editedFields,
        } as PlanContent)
        loadPlan()
      } catch (e: any) {
        setActionErr(e.message ?? 'Failed to save plan content')
        setSavingContent(false)
        return
      }
      setSavingContent(false)
    }
    setSending(true)
    try {
      const result = await dietitianDietPlanApi.sendPlan(id)
      setSendResult(result)
      setSendOk(true)
      setPlan(prev => prev ? { ...prev, status: 'sent' } : prev)
      setEditingContent(false)
    } catch (e: any) {
      setActionErr(e.message ?? 'Failed to send plan to patient')
    } finally {
      setSending(false)
    }
  }

  async function handleSendPlan() {
    setSending(true)
    setActionErr(null)
    try {
      const result = await dietitianDietPlanApi.sendPlan(id)
      setSendResult(result)
      setSendOk(true)
      setPlan(prev => prev ? { ...prev, status: 'sent' } : prev)
    } catch (e: any) {
      setActionErr(e.message ?? 'Failed to send plan to patient')
    } finally {
      setSending(false)
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
  const isSent       = planStatus === 'sent'
  const isGenerating = planStatus === 'generating'
  const weeks = plan.weeks ?? []
  const busy  = updating || generating || savingContent || sending
  const isFormValid = isFormComplete(form)
  const apptIdForRender = stateApptId ?? plan.appointment_id
  const isManualPlan = stateIsManual || (!apptIdForRender && !plan.user_id)
  const generationCost    = form.plan_type === '1' ? 50 : 100
  const planDurationLabel = form.plan_type === '1' ? '1-week' : '1-month'
  // 3-state wallet check (only meaningful once balances are loaded)
  const balancesLoaded    = isManualPlan && planCredits !== null && walletBalance !== null
  const creditsOk         = !balancesLoaded || (planCredits ?? 0) >= generationCost
  const earningsOk        = !balancesLoaded || (walletBalance ?? 0) >= generationCost
  const bothInsufficient  = balancesLoaded && !creditsOk && !earningsOk

  const isDirty = editingContent && (
    Object.keys(editedFields).length > 0 ||
    JSON.stringify(editTips)    !== JSON.stringify(plan.general_tips    ?? []) ||
    JSON.stringify(editWeeks)   !== JSON.stringify(plan.weeks           ?? []) ||
    JSON.stringify(editRecipes) !== JSON.stringify(plan.featured_recipes ?? [])
  )

  /* ── Edit mode: full-page takeover ── */
  if (editingContent && (isCompleted || isSent)) {
    return (
      <>
        <EditPlanContent
          plan={plan}
          editedFields={editedFields}
          onFieldChange={(key, val) => setEditedFields(prev => ({ ...prev, [key]: val }))}
          editTips={editTips}
          onTipsChange={setEditTips}
          editWeeks={editWeeks}
          onWeeksChange={setEditWeeks}
          editRecipes={editRecipes}
          onRecipesChange={setEditRecipes}
          isDirty={isDirty}
          onBack={() => { setEditingContent(false); setActionErr(null) }}
          onSave={handleSaveContent}
          onSend={() => { setActionErr(null); setShowSendModal(true) }}
          saving={savingContent}
          sending={sending}
          actionErr={actionErr}
          isManual={isManualPlan}
        />
        {showSendModal && !isManualPlan && (
          <div className="epm-modal-overlay"
            onClick={e => { if (e.target === e.currentTarget) setShowSendModal(false) }}>
            <div className="epm-modal">
              <div className="epm-modal-title">
                <i className="fa-solid fa-paper-plane" style={{ color: '#1d4ed8', marginRight: 8 }} />
                Send Diet Plan
              </div>
              <p className="epm-modal-sub">
                This plan will be sent to <b>{plan.client_name}</b>.
              </p>
              {isSent && (
                <div className="epm-modal-warn">
                  <i className="fa-solid fa-triangle-exclamation" /> This plan was already sent. Sending again will re-deliver it.
                </div>
              )}
              {isDirty && (
                <div className="epm-modal-warn">
                  <i className="fa-solid fa-floppy-disk" /> Unsaved changes will be saved automatically before sending.
                </div>
              )}
              {actionErr && (
                <div className="epm-error" style={{ marginBottom: 12 }}>
                  <i className="fa-solid fa-circle-exclamation" /> {actionErr}
                </div>
              )}
              <div className="epm-modal-actions">
                <button className="cdp-btn-cancel"
                  onClick={() => setShowSendModal(false)} disabled={savingContent || sending}>
                  Cancel
                </button>
                <button className="epm-send-btn"
                  onClick={handleSendConfirm} disabled={savingContent || sending}>
                  {savingContent ? 'Saving…' : sending ? 'Sending…' : 'Send Now'}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <>
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
          <p className="cdp-logo-hint">
            <i className="fa-solid fa-image" />
            To upload or update your personal logo on the diet plan —{' '}
            <button className="cdp-logo-hint-link" onClick={() => navigate('/dietitian-profile', { state: { openTab: 'Documents' } })}>
              go to Profile → Documents section
            </button>
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

        {/* Sent: success banner */}
        {(isSent || sendOk) && (
          <div className="ddp-send-success">
            <i className="fa-solid fa-circle-check" style={{ fontSize: 22 }} />
            <div>
              <p className="ddp-send-success-title">Plan sent to patient!</p>
              {sendResult && (
                <p className="ddp-send-success-sub">
                  {[
                    sendResult.sent_email && sendResult.delivery_to?.email && `Email: ${sendResult.delivery_to.email}`,
                    sendResult.sent_whatsapp && sendResult.delivery_to?.whatsapp && `WhatsApp: ${sendResult.delivery_to.whatsapp}`,
                  ].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Completed: PDF banner */}
        {(isCompleted || isSent) && plan.pdf_url && (
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

        {/* Client Information — manual plans only, always editable */}
        {isManualPlan && (
          <div className="cdp-section">
            <h3 className="cdp-section-title"><span>👤</span> Client Information</h3>
            <div className="cdp-row">
              <div className="cdp-field">
                <label className="cdp-label">Full Name</label>
                <input className="cdp-input" value={plan.client_name ?? ''} readOnly style={{ background: '#f8faf9', cursor: 'default' }} />
              </div>
              <div className="cdp-field">
                <label className="cdp-label">Email</label>
                <input
                  className="cdp-input" type="email" placeholder="rahul@gmail.com"
                  value={clientEmail}
                  onChange={e => setClientEmail(e.target.value)}
                  disabled={busy}
                />
              </div>
            </div>
            <div className="cdp-row" style={{ marginTop: 14 }}>
              <div className="cdp-field">
                <label className="cdp-label">WhatsApp Number</label>
                <input
                  className="cdp-input" type="tel" placeholder="9876543210"
                  value={clientWhatsapp}
                  onChange={e => setClientWhatsapp(e.target.value)}
                  disabled={busy}
                />
              </div>
              <div className="cdp-field">
                <label className="cdp-label">State</label>
                <SearchableSelect
                  options={IN_STATES.map(s => ({ value: s.isoCode, label: s.name }))}
                  value={clientStateCode}
                  onChange={code => {
                    const name = IN_STATES.find(s => s.isoCode === code)?.name ?? ''
                    setClientStateCode(code)
                    setClientState(name)
                    setClientCity('')
                  }}
                  placeholder="Select state"
                  searchPlaceholder="Search state..."
                  disabled={busy}
                />
              </div>
            </div>
            <div className="cdp-row" style={{ marginTop: 14 }}>
              <div className="cdp-field">
                <label className="cdp-label">City</label>
                <SearchableSelect
                  options={cities.map(c => ({ value: c, label: c }))}
                  value={clientCity}
                  onChange={city => setClientCity(city)}
                  placeholder={citiesLoading ? 'Loading cities…' : !clientState ? 'Select state first' : 'Select city'}
                  searchPlaceholder="Search city..."
                  disabled={!clientState || citiesLoading || busy}
                />
              </div>
              <div className="cdp-field" />
            </div>
          </div>
        )}

        {/* Health form — only show for draft/failed plans */}
        {(isDraft || isGenerating) && (
          <DietPlanFormFields
            form={form}
            onChange={setField}
            disabled={!isDraft || busy}
          />
        )}

        {/* PDF-style plan preview (view mode for completed/sent) */}
        {(isCompleted || isSent) && (
          <PlanDocPreview plan={plan} dietitian={profile} isManual={isManualPlan} clientForm={clientForm} />
        )}

        {/* Generate CTA — shown in-body for draft/failed so it's impossible to miss */}
        {isDraft && !isGenerating && (
          <div className="ddp-generate-cta">
            <div className="ddp-generate-cta-left">
              <span className="ddp-generate-cta-icon">🤖</span>
              <div>
                <p className="ddp-generate-cta-title">Ready to generate the diet plan?</p>
                <p className="ddp-generate-cta-sub">
                  AI will build a personalised <strong>{planDurationLabel} meal plan</strong> based on the health details above.
                  Your draft will be saved automatically before generation starts.
                </p>
                {isManualPlan && (
                  <>
                    {/* Balance info row */}
                    {balancesLoaded && (
                      <p className="ddp-generate-cta-sub" style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <i className="fa-solid fa-coins" style={{ color: '#6366f1', fontSize: 12 }} />
                          <span style={{ fontWeight: 600, color: '#4c1d95' }}>Plan Credits:</span>
                          <span style={{ fontWeight: 700, color: creditsOk ? '#16a34a' : '#f97316' }}>₹{planCredits}</span>
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <i className="fa-solid fa-building-columns" style={{ color: '#6b7280', fontSize: 12 }} />
                          <span style={{ fontWeight: 600, color: '#374151' }}>Earnings:</span>
                          <span style={{ fontWeight: 700, color: '#374151' }}>₹{walletBalance}</span>
                        </span>
                      </p>
                    )}
                    {/* State 1: credits ok — no warning */}
                    {creditsOk && (
                      <p className="ddp-generate-cta-sub" style={{ marginTop: 4 }}>
                        <i className="fa-solid fa-coins" style={{ marginRight: 6, color: '#6366f1' }} />
                        <strong>₹{generationCost}</strong> will be deducted from your plan credits.
                      </p>
                    )}
                    {/* State 2: credits low but earnings can cover */}
                    {!creditsOk && earningsOk && (
                      <p className="ddp-generate-cta-sub" style={{ marginTop: 4, color: '#f97316' }}>
                        <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 6 }} />
                        Plan credits insufficient — ₹{generationCost} will be deducted from your earnings wallet
                      </p>
                    )}
                    {/* State 3: both insufficient */}
                    {bothInsufficient && (
                      <p className="ddp-generate-cta-sub" style={{ marginTop: 4, color: '#ef4444', fontWeight: 600 }}>
                        <i className="fa-solid fa-circle-exclamation" style={{ marginRight: 6 }} />
                        Insufficient balance. Add plan credits to generate.{' '}
                        <button
                          type="button"
                          onClick={() => setShowWalletModal(true)}
                          style={{ background: 'none', border: 'none', color: '#6366f1', fontWeight: 700, cursor: 'pointer', padding: 0, fontSize: 'inherit', textDecoration: 'underline' }}
                        >
                          Recharge now
                        </button>
                      </p>
                    )}
                  </>
                )}
                {!isFormValid && (
                  <p className="ddp-generate-cta-warn">
                    <i className="fa-solid fa-triangle-exclamation" /> Please fill all required fields (*) above before generating.
                  </p>
                )}
              </div>
            </div>
            <button
              className="ddp-generate-cta-btn"
              onClick={handleGenerate}
              disabled={busy || !isFormValid || bothInsufficient}
              title={
                !isFormValid        ? 'Fill all required fields to generate' :
                bothInsufficient    ? 'Recharge plan credits to generate' :
                undefined
              }
            >
              {generating
                ? <><i className="fa-solid fa-spinner fa-spin" /> Starting…</>
                : isManualPlan
                  ? <><i className="fa-solid fa-wand-magic-sparkles" /> Generate — ₹{generationCost}</>
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
            <button
              className="cdp-btn-generate"
              onClick={handleGenerate}
              disabled={busy || !isFormValid}
              title={!isFormValid ? 'Fill all required fields to generate' : undefined}
            >
              <i className="fa-solid fa-wand-magic-sparkles" />
              {generating ? 'Starting…' : 'Generate Diet Plan'}
            </button>
          </>
        )}

        {isCompleted && (
          <>
            {plan.pdf_url && (
              <a href={plan.pdf_url} target="_blank" rel="noopener noreferrer" className="cdp-btn-save">
                <i className="fa-solid fa-file-pdf" /> View PDF
              </a>
            )}
            <button className="cdp-btn-save" onClick={startEditContent} disabled={busy}>
              <i className="fa-solid fa-pen" /> Edit Plan
            </button>
            {!isManualPlan && (
              <button className="cdp-btn-send" onClick={handleSendPlan} disabled={busy}>
                <i className="fa-solid fa-paper-plane" />
                {sending ? 'Sending…' : 'Send to Patient'}
              </button>
            )}
          </>
        )}

        {isSent && (
          <>
            {plan.pdf_url && (
              <a href={plan.pdf_url} target="_blank" rel="noopener noreferrer" className="cdp-btn-save">
                <i className="fa-solid fa-file-pdf" /> View PDF
              </a>
            )}
            <button className="cdp-btn-save" onClick={startEditContent} disabled={busy}>
              <i className="fa-solid fa-pen" /> Edit Plan
            </button>
            {!isManualPlan && (
              <button className="cdp-btn-send" onClick={handleSendPlan} disabled={busy}>
                <i className="fa-solid fa-rotate-right" />
                {sending ? 'Sending…' : 'Resend to Patient'}
              </button>
            )}
          </>
        )}

        {isGenerating && (
          <button className="cdp-btn-generate" disabled>
            <i className="fa-solid fa-spinner fa-spin" /> Generating…
          </button>
        )}
      </div>

    </div>

    {/* ── Wallet Top-up Modal ── */}
    {showWalletModal && (
      <div className="epm-modal-overlay"
        onClick={e => { if (e.target === e.currentTarget && !topping) setShowWalletModal(false) }}>
        <div className="epm-modal">
          <div className="epm-modal-title">
            <i className="fa-solid fa-coins" style={{ color: '#6366f1', marginRight: 8 }} />
            Insufficient Balance
          </div>
          <p className="epm-modal-sub">
            Neither wallet has enough to generate this plan (needs <strong>₹{generationCost}</strong>).
          </p>
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1, background: '#f5f3ff', border: '1.5px solid #c4b5fd', borderRadius: 10, padding: '10px 14px' }}>
              <p style={{ margin: 0, fontSize: 11, color: '#7c3aed', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Plan Credits</p>
              <p style={{ margin: '4px 0 0', fontSize: 20, fontWeight: 800, color: (planCredits ?? 0) >= generationCost ? '#16a34a' : '#ef4444' }}>
                ₹{planCredits ?? 0}
              </p>
            </div>
            <div style={{ flex: 1, background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 10, padding: '10px 14px' }}>
              <p style={{ margin: 0, fontSize: 11, color: '#15803d', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Earnings Wallet</p>
              <p style={{ margin: '4px 0 0', fontSize: 20, fontWeight: 800, color: (walletBalance ?? 0) >= generationCost ? '#16a34a' : '#ef4444' }}>
                ₹{walletBalance ?? 0}
              </p>
            </div>
          </div>
          <div className="epm-modal-warn" style={{ background: '#eff6ff', borderColor: '#bfdbfe', color: '#1d4ed8' }}>
            <i className="fa-solid fa-circle-info" /> Recharge plan credits to continue. Plan credits are used first; earnings wallet is the fallback.
          </div>
          <div style={{ marginTop: 16 }}>
            <label className="epm-field-label">Recharge Plan Credits (₹)</label>
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              {[100, 200, 500].map(a => (
                <button key={a} type="button"
                  onClick={() => setAddMoneyAmt(String(a))}
                  style={{
                    padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13,
                    border: `2px solid ${addMoneyAmt === String(a) ? '#6366f1' : '#e5e7eb'}`,
                    background: addMoneyAmt === String(a) ? '#eef2ff' : '#fff',
                    color: addMoneyAmt === String(a) ? '#4338ca' : '#374151',
                    fontWeight: addMoneyAmt === String(a) ? 700 : 400,
                  }}>
                  ₹{a}
                </button>
              ))}
              <input
                type="number"
                min={100}
                placeholder="Custom"
                value={addMoneyAmt}
                onChange={e => setAddMoneyAmt(e.target.value)}
                style={{
                  flex: 1, border: '1.5px solid #e5e7eb', borderRadius: 8,
                  padding: '6px 10px', fontSize: 13, outline: 'none',
                }}
              />
            </div>
          </div>
          {topupError && (
            <div className="epm-error" style={{ marginTop: 10 }}>
              <i className="fa-solid fa-circle-exclamation" /> {topupError}
            </div>
          )}
          <div className="epm-modal-actions" style={{ marginTop: 20 }}>
            <button className="cdp-btn-cancel" disabled={topping}
              onClick={() => { setShowWalletModal(false); setTopupError(null) }}>
              Cancel
            </button>
            <button
              className="epm-send-btn"
              disabled={topping || !addMoneyAmt || Number(addMoneyAmt) < 100}
              onClick={handleWalletTopup}
            >
              <i className="fa-solid fa-credit-card" />
              {topping ? 'Processing…' : `Recharge ₹${addMoneyAmt || 0}`}
            </button>
          </div>
          <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 10, textAlign: 'center' }}>
            Accepted: UPI · Debit/Credit Card · Net Banking
          </p>
        </div>
      </div>
    )}
  </>
  )
}
