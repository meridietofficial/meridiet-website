import { useState } from 'react'

type PlanStatus = 'active' | 'draft' | 'archived'

interface Meal {
  label: string
  items: string[]
  calories: number
}

interface DietPlan {
  id: number
  name: string
  clientName: string
  clientInitials: string
  goal: string
  type: string
  duration: string
  status: PlanStatus
  lastUpdated: string
  createdOn: string
  calories: number
  protein: number
  carbs: number
  fat: number
  meals: Meal[]
  notes: string
  tags: string[]
}

const PLANS: DietPlan[] = [
  {
    id: 1,
    name: 'High-Protein Muscle Gain Plan',
    clientName: 'Rohan Mehta',
    clientInitials: 'RM',
    goal: 'Muscle Gain',
    type: 'Non-Vegetarian',
    duration: '12 weeks',
    status: 'active',
    lastUpdated: 'Jun 5, 2026',
    createdOn: 'Mar 10, 2026',
    calories: 2800,
    protein: 180,
    carbs: 300,
    fat: 80,
    meals: [
      { label: 'Breakfast',    items: ['6 egg whites + 2 whole eggs scrambled', 'Oats with banana & peanut butter', 'Whole milk – 1 glass'], calories: 620 },
      { label: 'Mid-Morning',  items: ['Whey protein shake', 'Mixed dry fruits – 30g'], calories: 280 },
      { label: 'Lunch',        items: ['Grilled chicken breast – 200g', 'Brown rice – 1.5 cups', 'Mixed vegetables stir-fry'], calories: 750 },
      { label: 'Evening',      items: ['Cottage cheese (paneer) – 100g', 'Apple or banana'], calories: 300 },
      { label: 'Dinner',       items: ['Salmon or tuna – 180g', 'Sweet potato – 1 medium', 'Steamed broccoli & carrots'], calories: 650 },
      { label: 'Post-workout', items: ['Whey protein shake', 'White rice – ½ cup'], calories: 200 },
    ],
    notes: 'Increase calorie intake by 200 kcal after Week 4 if no weight gain. Prioritise post-workout nutrition within 30 minutes.',
    tags: ['High Protein', 'Muscle Building', 'Non-Veg'],
  },
  {
    id: 2,
    name: 'PCOS Hormone Balance Diet',
    clientName: 'Sneha Iyer',
    clientInitials: 'SI',
    goal: 'PCOS Management',
    type: 'Vegetarian',
    duration: '16 weeks',
    status: 'active',
    lastUpdated: 'Jun 6, 2026',
    createdOn: 'Apr 2, 2026',
    calories: 1800,
    protein: 90,
    carbs: 180,
    fat: 65,
    meals: [
      { label: 'Breakfast',   items: ['Overnight oats with chia seeds & berries', 'Boiled eggs – 2', 'Green tea'], calories: 420 },
      { label: 'Mid-Morning', items: ['Handful of walnuts & almonds', 'Buttermilk – 1 glass'], calories: 200 },
      { label: 'Lunch',       items: ['Quinoa khichdi with veggies', 'Curd – 1 cup', 'Salad with olive oil dressing'], calories: 500 },
      { label: 'Evening',     items: ['Roasted makhana – 1 cup', 'Herbal tea (spearmint)'], calories: 160 },
      { label: 'Dinner',      items: ['Moong dal – 1 cup', 'Roti – 1 (wheat/jowar)', 'Sautéed leafy greens'], calories: 420 },
      { label: 'Bedtime',     items: ['Turmeric milk – 1 glass'], calories: 100 },
    ],
    notes: 'Focus on low-GI foods to manage insulin resistance. Avoid refined sugar completely. Include anti-inflammatory spices.',
    tags: ['Low GI', 'Hormonal Balance', 'Veg', 'Anti-inflammatory'],
  },
  {
    id: 3,
    name: 'Thyroid-Friendly Weight Loss Plan',
    clientName: 'Anjali Singh',
    clientInitials: 'AS',
    goal: 'Weight Loss',
    type: 'Vegetarian',
    duration: '20 weeks',
    status: 'active',
    lastUpdated: 'Jun 3, 2026',
    createdOn: 'Feb 1, 2026',
    calories: 1600,
    protein: 80,
    carbs: 160,
    fat: 55,
    meals: [
      { label: 'Breakfast',   items: ['Poha with vegetables & peanuts', 'Amla juice – 1 glass'], calories: 350 },
      { label: 'Mid-Morning', items: ['Seasonal fruit – 1 medium', 'Flaxseeds – 1 tbsp'], calories: 120 },
      { label: 'Lunch',       items: ['2 rotis (multigrain)', 'Rajma or chana curry', 'Salad & curd'], calories: 480 },
      { label: 'Evening',     items: ['Roasted chana – ½ cup', 'Green tea'], calories: 150 },
      { label: 'Dinner',      items: ['Vegetable soup – 1 bowl', '1 roti', 'Paneer bhurji – small portion'], calories: 400 },
      { label: 'Bedtime',     items: ['Warm water with lemon'], calories: 5 },
    ],
    notes: 'Avoid raw cruciferous vegetables. Take meals at fixed times to support thyroid rhythm. Hydration is critical — minimum 3 L/day.',
    tags: ['Thyroid', 'Weight Loss', 'Veg', 'Calorie Deficit'],
  },
  {
    id: 4,
    name: 'Calorie Deficit + Low-GI Plan',
    clientName: 'Vikram Singh',
    clientInitials: 'VS',
    goal: 'Weight Loss',
    type: 'Non-Vegetarian',
    duration: '24 weeks',
    status: 'active',
    lastUpdated: 'Jun 4, 2026',
    createdOn: 'May 5, 2026',
    calories: 2000,
    protein: 130,
    carbs: 190,
    fat: 60,
    meals: [
      { label: 'Breakfast',   items: ['Besan chilla – 2', 'Mint chutney', 'Black coffee'], calories: 380 },
      { label: 'Mid-Morning', items: ['Boiled egg – 2', 'Cucumber & carrot sticks'], calories: 180 },
      { label: 'Lunch',       items: ['Grilled chicken – 150g', 'Brown rice – 1 cup', 'Dal + sabzi'], calories: 620 },
      { label: 'Evening',     items: ['Sprouts chaat – small bowl', 'Green tea'], calories: 180 },
      { label: 'Dinner',      items: ['Fish curry – small portion', '1 roti', 'Salad'], calories: 500 },
    ],
    notes: 'Monitor blood glucose before and after meals. Avoid fruit juices. Increase fibre intake gradually to prevent bloating.',
    tags: ['Calorie Deficit', 'Low GI', 'Diabetes-Friendly', 'Non-Veg'],
  },
  {
    id: 5,
    name: 'Diabetic Management Diet (Draft)',
    clientName: 'Priya Sharma',
    clientInitials: 'PS',
    goal: 'Diabetes Management',
    type: 'Vegetarian',
    duration: '12 weeks',
    status: 'draft',
    lastUpdated: 'Jun 1, 2026',
    createdOn: 'Jun 1, 2026',
    calories: 1700,
    protein: 85,
    carbs: 170,
    fat: 55,
    meals: [
      { label: 'Breakfast',   items: ['Methi paratha – 1', 'Curd – ½ cup', 'Herbal tea'], calories: 350 },
      { label: 'Mid-Morning', items: ['Handful of nuts', 'Jamun or guava'], calories: 150 },
      { label: 'Lunch',       items: ['2 rotis', 'Palak dal', 'Salad'], calories: 500 },
      { label: 'Evening',     items: ['Sprouts – ½ cup', 'Green tea'], calories: 130 },
      { label: 'Dinner',      items: ['Vegetable khichdi', 'Raita'], calories: 420 },
    ],
    notes: 'Draft pending final review. Adjust carb targets based on latest HbA1c report.',
    tags: ['Diabetes', 'Low Carb', 'Veg'],
  },
  {
    id: 6,
    name: 'Elite Athlete Performance Diet',
    clientName: 'Arjun Kapoor',
    clientInitials: 'AK',
    goal: 'Sports Nutrition',
    type: 'Non-Vegetarian',
    duration: '16 weeks',
    status: 'archived',
    lastUpdated: 'Mar 15, 2026',
    createdOn: 'Dec 1, 2025',
    calories: 3400,
    protein: 210,
    carbs: 380,
    fat: 90,
    meals: [
      { label: 'Breakfast',     items: ['Oats + banana smoothie', '4 eggs scrambled', 'Whole grain toast'], calories: 800 },
      { label: 'Pre-workout',   items: ['Rice cakes + peanut butter', 'Black coffee'], calories: 350 },
      { label: 'Lunch',         items: ['Chicken breast – 250g', 'Rice – 2 cups', 'Vegetables'], calories: 900 },
      { label: 'Post-workout',  items: ['Whey protein shake', 'Banana + dates'], calories: 400 },
      { label: 'Dinner',        items: ['Salmon – 200g', 'Sweet potato', 'Salad'], calories: 750 },
      { label: 'Night',         items: ['Casein protein or cottage cheese'], calories: 200 },
    ],
    notes: 'Goal achieved. Client maintained performance weight of 82 kg. Plan archived after program completion.',
    tags: ['Athletic', 'High Calorie', 'Performance', 'Non-Veg'],
  },
]

type Tab = 'all' | 'active' | 'draft' | 'archived'

const STATUS_META: Record<PlanStatus, { label: string; color: string }> = {
  active:   { label: 'Active',    color: 'green'  },
  draft:    { label: 'Draft',     color: 'orange' },
  archived: { label: 'Archived',  color: 'gray'   },
}

const MACRO_COLOR = { protein: '#3b82f6', carbs: '#f97316', fat: '#a855f7' }

export default function DietitianDietPlans() {
  const [tab, setTab]       = useState<Tab>('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<DietPlan | null>(null)
  const [openMeal, setOpenMeal]   = useState<number | null>(null)

  const counts = {
    all:      PLANS.length,
    active:   PLANS.filter(p => p.status === 'active').length,
    draft:    PLANS.filter(p => p.status === 'draft').length,
    archived: PLANS.filter(p => p.status === 'archived').length,
  }

  const filtered = PLANS.filter(p => {
    const matchesTab = tab === 'all' || p.status === tab
    const q = search.toLowerCase()
    const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.clientName.toLowerCase().includes(q) || p.goal.toLowerCase().includes(q)
    return matchesTab && matchesSearch
  })

  const totalCals = (p: DietPlan) => p.meals.reduce((s, m) => s + m.calories, 0)

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
              <span className="dp-hstat-val">{counts.active}</span>
              <span className="dp-hstat-label">Active</span>
            </div>
            <div className="dp-hstat dp-hstat--orange">
              <span className="dp-hstat-val">{counts.draft}</span>
              <span className="dp-hstat-label">Draft</span>
            </div>
            <div className="dp-hstat dp-hstat--gray">
              <span className="dp-hstat-val">{counts.archived}</span>
              <span className="dp-hstat-label">Archived</span>
            </div>
          </div>
          <button className="dp-create-btn">
            <i className="fa-solid fa-plus" /> Create Plan
          </button>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="dp-toolbar">
        <div className="dp-tabs">
          {(['all', 'active', 'draft', 'archived'] as Tab[]).map(t => (
            <button
              key={t}
              className={`dp-tab${tab === t ? ' dp-tab--active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
              <span className="dp-tab-count">{counts[t]}</span>
            </button>
          ))}
        </div>
        <div className="dp-search-wrap">
          <i className="fa-solid fa-magnifying-glass dp-search-icon" />
          <input
            className="dp-search"
            placeholder="Search plans, clients, goals…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── Content ── */}
      <div className={`dp-content${selected ? ' dp-content--split' : ''}`}>

        {/* Plan list */}
        <div className="dp-list">
          {filtered.length === 0 && (
            <div className="dp-empty">
              <span className="dp-empty-icon">🥗</span>
              <p className="dp-empty-text">No diet plans found</p>
            </div>
          )}

          {filtered.map(p => {
            const sm = STATUS_META[p.status]
            const totalMacros = p.protein * 4 + p.carbs * 4 + p.fat * 9
            return (
              <div
                key={p.id}
                className={`dp-card${selected?.id === p.id ? ' dp-card--selected' : ''}`}
                onClick={() => setSelected(p.id === selected?.id ? null : p)}
              >
                {/* Top row */}
                <div className="dp-card-top">
                  <div className="dp-card-title-wrap">
                    <span className={`dp-status dp-status--${sm.color}`}>{sm.label}</span>
                    <h3 className="dp-plan-name">{p.name}</h3>
                  </div>
                  <div className="dp-card-actions" onClick={e => e.stopPropagation()}>
                    <button className="dp-btn-icon" title="Edit"><i className="fa-solid fa-pen" /></button>
                    <button className="dp-btn-icon" title="Duplicate"><i className="fa-solid fa-copy" /></button>
                    <button className="dp-btn-view" onClick={() => setSelected(p.id === selected?.id ? null : p)}>
                      View Plan
                    </button>
                  </div>
                </div>

                {/* Client + meta pills */}
                <div className="dp-card-meta">
                  <span className="dp-client-pill">
                    <span className="dp-client-avatar">{p.clientInitials}</span>
                    {p.clientName}
                  </span>
                  <span className="dp-meta-pill"><i className="fa-solid fa-bullseye" /> {p.goal}</span>
                  <span className="dp-meta-pill"><i className="fa-solid fa-leaf" /> {p.type}</span>
                  <span className="dp-meta-pill"><i className="fa-regular fa-clock" /> {p.duration}</span>
                  <span className="dp-meta-pill"><i className="fa-solid fa-fire" /> {p.calories} kcal</span>
                </div>

                {/* Macro bar */}
                <div className="dp-macro-row">
                  <div className="dp-macro-bar-wrap">
                    <div className="dp-macro-bar-track">
                      <div className="dp-macro-bar-seg dp-macro-bar-seg--protein"
                        style={{ width: `${(p.protein * 4 / totalMacros) * 100}%` }} />
                      <div className="dp-macro-bar-seg dp-macro-bar-seg--carbs"
                        style={{ width: `${(p.carbs * 4 / totalMacros) * 100}%` }} />
                      <div className="dp-macro-bar-seg dp-macro-bar-seg--fat"
                        style={{ width: `${(p.fat * 9 / totalMacros) * 100}%` }} />
                    </div>
                  </div>
                  <div className="dp-macro-labels">
                    <span className="dp-macro-label dp-macro-label--protein">Protein {p.protein}g</span>
                    <span className="dp-macro-label dp-macro-label--carbs">Carbs {p.carbs}g</span>
                    <span className="dp-macro-label dp-macro-label--fat">Fat {p.fat}g</span>
                    <span className="dp-macro-updated">Updated {p.lastUpdated}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="dp-tags">
                  {p.tags.map(tag => <span key={tag} className="dp-tag">{tag}</span>)}
                </div>
              </div>
            )
          })}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="dp-detail">
            <div className="dp-detail-header">
              <h2 className="dp-detail-title">Plan Details</h2>
              <button className="dp-detail-close" onClick={() => setSelected(null)}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {/* Plan name + status */}
            <div className="dp-detail-hero">
              <span className={`dp-status dp-status--${STATUS_META[selected.status].color}`}>
                {STATUS_META[selected.status].label}
              </span>
              <p className="dp-detail-plan-name">{selected.name}</p>
              <div className="dp-client-pill dp-client-pill--detail">
                <span className="dp-client-avatar">{selected.clientInitials}</span>
                {selected.clientName}
              </div>
            </div>

            {/* Info grid */}
            <div className="dp-detail-section">
              <p className="dp-detail-section-title">Plan Info</p>
              <div className="dp-detail-grid">
                <div className="dp-detail-field">
                  <span className="dp-detail-label">Goal</span>
                  <span className="dp-detail-val">{selected.goal}</span>
                </div>
                <div className="dp-detail-field">
                  <span className="dp-detail-label">Diet Type</span>
                  <span className="dp-detail-val">{selected.type}</span>
                </div>
                <div className="dp-detail-field">
                  <span className="dp-detail-label">Duration</span>
                  <span className="dp-detail-val">{selected.duration}</span>
                </div>
                <div className="dp-detail-field">
                  <span className="dp-detail-label">Created</span>
                  <span className="dp-detail-val">{selected.createdOn}</span>
                </div>
              </div>
            </div>

            {/* Calories + macros */}
            <div className="dp-detail-section">
              <p className="dp-detail-section-title">Daily Nutrition Target</p>
              <div className="dp-detail-cals">
                <i className="fa-solid fa-fire" style={{ color: '#f97316' }} />
                <span className="dp-detail-cals-val">{selected.calories}</span>
                <span className="dp-detail-cals-unit">kcal / day</span>
              </div>
              <div className="dp-macro-detail-row">
                {[
                  { key: 'protein', label: 'Protein', val: `${selected.protein}g`, color: MACRO_COLOR.protein },
                  { key: 'carbs',   label: 'Carbs',   val: `${selected.carbs}g`,   color: MACRO_COLOR.carbs   },
                  { key: 'fat',     label: 'Fat',     val: `${selected.fat}g`,     color: MACRO_COLOR.fat     },
                ].map(m => (
                  <div key={m.key} className="dp-macro-pill" style={{ borderColor: m.color + '55', background: m.color + '11' }}>
                    <span className="dp-macro-pill-val" style={{ color: m.color }}>{m.val}</span>
                    <span className="dp-macro-pill-label">{m.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Meal plan accordion */}
            <div className="dp-detail-section">
              <p className="dp-detail-section-title">Meal Schedule ({selected.meals.length} meals)</p>
              <div className="dp-meals">
                {selected.meals.map((meal, idx) => (
                  <div key={idx} className="dp-meal">
                    <button
                      className={`dp-meal-header${openMeal === idx ? ' dp-meal-header--open' : ''}`}
                      onClick={() => setOpenMeal(openMeal === idx ? null : idx)}
                    >
                      <span className="dp-meal-label">{meal.label}</span>
                      <span className="dp-meal-cals">{meal.calories} kcal</span>
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

            {/* Notes */}
            <div className="dp-detail-section">
              <p className="dp-detail-section-title">Dietitian Notes</p>
              <p className="dp-detail-notes">{selected.notes}</p>
            </div>

            {/* Tags */}
            <div className="dp-detail-section">
              <p className="dp-detail-section-title">Tags</p>
              <div className="dp-tags">{selected.tags.map(t => <span key={t} className="dp-tag">{t}</span>)}</div>
            </div>

            {/* Actions */}
            <div className="dp-detail-btns">
              <button className="dp-btn-primary dp-btn-primary--full">
                <i className="fa-solid fa-pen" /> Edit Plan
              </button>
              <button className="dp-btn-outline-g dp-btn-outline-g--full">
                <i className="fa-solid fa-paper-plane" /> Send to Client
              </button>
              <button className="dp-btn-outline-g dp-btn-outline-g--full">
                <i className="fa-solid fa-copy" /> Duplicate Plan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
