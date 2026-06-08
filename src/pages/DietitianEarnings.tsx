import { useState } from 'react'

type Period = 'week' | 'month' | 'quarter' | 'year'
type TxStatus = 'paid' | 'pending' | 'refunded'

interface Transaction {
  id: number
  clientName: string
  initials: string
  plan: string
  date: string
  amount: number
  sessions: number
  status: TxStatus
  method: 'UPI' | 'Card' | 'Net Banking'
  invoiceNo: string
}

const TRANSACTIONS: Transaction[] = [
  { id: 1,  clientName: 'Rohan Mehta',  initials: 'RM', plan: 'High-Protein Muscle Gain Plan', date: 'Jun 7, 2026',  amount: 2500, sessions: 1, status: 'paid',    method: 'UPI',         invoiceNo: 'INV-2026-061' },
  { id: 2,  clientName: 'Sneha Iyer',   initials: 'SI', plan: 'PCOS Hormone Balance Diet',     date: 'Jun 6, 2026',  amount: 3200, sessions: 1, status: 'paid',    method: 'Card',        invoiceNo: 'INV-2026-060' },
  { id: 3,  clientName: 'Vikram Singh', initials: 'VS', plan: 'Calorie Deficit + Low-GI Plan', date: 'Jun 4, 2026',  amount: 2800, sessions: 1, status: 'paid',    method: 'UPI',         invoiceNo: 'INV-2026-059' },
  { id: 4,  clientName: 'Anjali Singh', initials: 'AS', plan: 'Thyroid Weight Loss Plan',      date: 'Jun 3, 2026',  amount: 2500, sessions: 1, status: 'pending', method: 'Net Banking', invoiceNo: 'INV-2026-058' },
  { id: 5,  clientName: 'Rohan Mehta',  initials: 'RM', plan: 'High-Protein Muscle Gain Plan', date: 'Jun 1, 2026',  amount: 2500, sessions: 1, status: 'paid',    method: 'UPI',         invoiceNo: 'INV-2026-057' },
  { id: 6,  clientName: 'Sneha Iyer',   initials: 'SI', plan: 'PCOS Hormone Balance Diet',     date: 'May 28, 2026', amount: 3200, sessions: 1, status: 'paid',    method: 'Card',        invoiceNo: 'INV-2026-056' },
  { id: 7,  clientName: 'Anjali Singh', initials: 'AS', plan: 'Thyroid Weight Loss Plan',      date: 'May 25, 2026', amount: 2500, sessions: 1, status: 'paid',    method: 'UPI',         invoiceNo: 'INV-2026-055' },
  { id: 8,  clientName: 'Vikram Singh', initials: 'VS', plan: 'Calorie Deficit + Low-GI Plan', date: 'May 20, 2026', amount: 2800, sessions: 1, status: 'paid',    method: 'Net Banking', invoiceNo: 'INV-2026-054' },
  { id: 9,  clientName: 'Priya Sharma', initials: 'PS', plan: 'Diabetic Management Diet',      date: 'May 15, 2026', amount: 3000, sessions: 1, status: 'paid',    method: 'UPI',         invoiceNo: 'INV-2026-053' },
  { id: 10, clientName: 'Arjun Kapoor', initials: 'AK', plan: 'Elite Athlete Performance',     date: 'May 10, 2026', amount: 4500, sessions: 1, status: 'refunded', method: 'Card',       invoiceNo: 'INV-2026-052' },
]

const MONTHLY_EARNINGS = [
  { month: 'Jan', amount: 18400 },
  { month: 'Feb', amount: 21200 },
  { month: 'Mar', amount: 26800 },
  { month: 'Apr', amount: 24600 },
  { month: 'May', amount: 31500 },
  { month: 'Jun', amount: 11000 },
]

const PLAN_EARNINGS = [
  { plan: 'PCOS Hormone Balance Diet',     amount: 28800, pct: 24, color: '#a855f7', sessions: 9  },
  { plan: 'Elite Athlete Performance',     amount: 27000, pct: 22, color: '#06b6d4', sessions: 6  },
  { plan: 'Diabetic Management Diet',      amount: 24000, pct: 20, color: '#f97316', sessions: 8  },
  { plan: 'Calorie Deficit + Low-GI Plan', amount: 19600, pct: 16, color: '#3b82f6', sessions: 7  },
  { plan: 'Thyroid Weight Loss Plan',      amount: 15000, pct: 12, color: '#22c55e', sessions: 6  },
  { plan: 'High-Protein Muscle Gain',      amount:  7500, pct:  6, color: '#ec4899', sessions: 3  },
]

const maxEarning = Math.max(...MONTHLY_EARNINGS.map(m => m.amount))

const STATUS_META: Record<TxStatus, { label: string; color: string }> = {
  paid:     { label: 'Paid',     color: 'green'  },
  pending:  { label: 'Pending',  color: 'orange' },
  refunded: { label: 'Refunded', color: 'red'    },
}

const METHOD_ICON: Record<Transaction['method'], string> = {
  'UPI':         'fa-solid fa-mobile-screen',
  'Card':        'fa-solid fa-credit-card',
  'Net Banking': 'fa-solid fa-building-columns',
}

type TxTab = 'all' | 'paid' | 'pending' | 'refunded'

export default function DietitianEarnings() {
  const [period, setPeriod] = useState<Period>('month')
  const [txTab, setTxTab]   = useState<TxTab>('all')
  const [search, setSearch] = useState('')

  const periodData: Record<Period, { total: string; sessions: number; avg: string; pending: string; growth: string }> = {
    week:    { total: '₹8,300',   sessions: 3,   avg: '₹2,767', pending: '₹2,500',   growth: '+11%' },
    month:   { total: '₹28,450',  sessions: 11,  avg: '₹2,586', pending: '₹2,500',   growth: '+18%' },
    quarter: { total: '₹74,200',  sessions: 31,  avg: '₹2,394', pending: '₹5,300',   growth: '+14%' },
    year:    { total: '₹2,34,000', sessions: 103, avg: '₹2,272', pending: '₹8,100',  growth: '+22%' },
  }

  const d = periodData[period]

  const txCounts = {
    all:      TRANSACTIONS.length,
    paid:     TRANSACTIONS.filter(t => t.status === 'paid').length,
    pending:  TRANSACTIONS.filter(t => t.status === 'pending').length,
    refunded: TRANSACTIONS.filter(t => t.status === 'refunded').length,
  }

  const filtered = TRANSACTIONS.filter(t => {
    const matchesTab = txTab === 'all' || t.status === txTab
    const q = search.toLowerCase()
    const matchesSearch = !q || t.clientName.toLowerCase().includes(q) || t.plan.toLowerCase().includes(q) || t.invoiceNo.toLowerCase().includes(q)
    return matchesTab && matchesSearch
  })

  const totalPaid    = TRANSACTIONS.filter(t => t.status === 'paid').reduce((s, t) => s + t.amount, 0)
  const totalPending = TRANSACTIONS.filter(t => t.status === 'pending').reduce((s, t) => s + t.amount, 0)

  return (
    <div className="ea-root">

      {/* ── Header ── */}
      <div className="ea-header">
        <div>
          <h1 className="ea-title">Earnings</h1>
          <p className="ea-subtitle">Track your revenue, transactions and payout status</p>
        </div>
        <div className="ea-header-right">
          <div className="ea-period-toggle">
            {(['week', 'month', 'quarter', 'year'] as Period[]).map(p => (
              <button
                key={p}
                className={`ea-period-btn${period === p ? ' ea-period-btn--active' : ''}`}
                onClick={() => setPeriod(p)}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
          <button className="ea-export-btn">
            <i className="fa-solid fa-download" /> Export
          </button>
        </div>
      </div>

      {/* ── KPI cards ── */}
      <div className="ea-kpis">
        <div className="ea-kpi ea-kpi--green">
          <div className="ea-kpi-icon ea-kpi-icon--green"><i className="fa-solid fa-sack-dollar" /></div>
          <div className="ea-kpi-body">
            <p className="ea-kpi-label">Total Earnings</p>
            <p className="ea-kpi-val">{d.total}</p>
            <p className="ea-kpi-sub ea-sub--up">↗ {d.growth} vs last {period}</p>
          </div>
        </div>
        <div className="ea-kpi ea-kpi--blue">
          <div className="ea-kpi-icon ea-kpi-icon--blue"><i className="fa-solid fa-calendar-check" /></div>
          <div className="ea-kpi-body">
            <p className="ea-kpi-label">Sessions Billed</p>
            <p className="ea-kpi-val">{d.sessions}</p>
            <p className="ea-kpi-sub">This {period}</p>
          </div>
        </div>
        <div className="ea-kpi ea-kpi--purple">
          <div className="ea-kpi-icon ea-kpi-icon--purple"><i className="fa-solid fa-chart-line" /></div>
          <div className="ea-kpi-body">
            <p className="ea-kpi-label">Avg per Session</p>
            <p className="ea-kpi-val">{d.avg}</p>
            <p className="ea-kpi-sub ea-sub--up">↗ 6% vs last {period}</p>
          </div>
        </div>
        <div className="ea-kpi ea-kpi--orange">
          <div className="ea-kpi-icon ea-kpi-icon--orange"><i className="fa-solid fa-clock" /></div>
          <div className="ea-kpi-body">
            <p className="ea-kpi-label">Pending Payout</p>
            <p className="ea-kpi-val">{d.pending}</p>
            <p className="ea-kpi-sub">Processing in 2–3 days</p>
          </div>
        </div>
      </div>

      {/* ── Charts row ── */}
      <div className="ea-charts-row">

        {/* Monthly bar chart */}
        <div className="ea-card ea-card--wide">
          <div className="ea-card-header">
            <h2 className="ea-card-title">Monthly Revenue</h2>
            <span className="ea-card-sub">Jan – Jun 2026</span>
          </div>
          <div className="ea-bar-chart">
            {MONTHLY_EARNINGS.map(m => (
              <div key={m.month} className="ea-bar-col">
                <span className="ea-bar-val">₹{(m.amount / 1000).toFixed(0)}k</span>
                <div className="ea-bar-track">
                  <div className="ea-bar-fill" style={{ height: `${(m.amount / maxEarning) * 100}%` }} />
                </div>
                <span className="ea-bar-label">{m.month}</span>
              </div>
            ))}
          </div>
          <div className="ea-chart-total">
            <span className="ea-chart-total-label">6-month total</span>
            <span className="ea-chart-total-val">
              ₹{(MONTHLY_EARNINGS.reduce((s, m) => s + m.amount, 0) / 1000).toFixed(1)}k
            </span>
          </div>
        </div>

        {/* Plan-wise earnings */}
        <div className="ea-card">
          <div className="ea-card-header">
            <h2 className="ea-card-title">Earnings by Plan</h2>
            <span className="ea-card-sub">All time</span>
          </div>
          <div className="ea-plan-list">
            {PLAN_EARNINGS.map(p => (
              <div key={p.plan} className="ea-plan-row">
                <div className="ea-plan-dot" style={{ background: p.color }} />
                <div className="ea-plan-info">
                  <div className="ea-plan-top">
                    <span className="ea-plan-name">{p.plan}</span>
                    <span className="ea-plan-amount">₹{p.amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="ea-plan-bar-bg">
                    <div className="ea-plan-bar-fill" style={{ width: `${p.pct}%`, background: p.color }} />
                  </div>
                </div>
                <span className="ea-plan-pct">{p.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Payout summary card ── */}
      <div className="ea-payout-banner">
        <div className="ea-payout-left">
          <div className="ea-payout-icon"><i className="fa-solid fa-wallet" /></div>
          <div>
            <p className="ea-payout-title">Next Payout</p>
            <p className="ea-payout-sub">Processing on Jun 10, 2026 · UPI linked: mthak@upi</p>
          </div>
        </div>
        <div className="ea-payout-mid">
          <div className="ea-payout-stat">
            <span className="ea-payout-stat-label">Paid (this month)</span>
            <span className="ea-payout-stat-val ea-payout-val--green">₹{totalPaid.toLocaleString('en-IN')}</span>
          </div>
          <div className="ea-payout-divider" />
          <div className="ea-payout-stat">
            <span className="ea-payout-stat-label">Pending</span>
            <span className="ea-payout-stat-val ea-payout-val--orange">₹{totalPending.toLocaleString('en-IN')}</span>
          </div>
          <div className="ea-payout-divider" />
          <div className="ea-payout-stat">
            <span className="ea-payout-stat-label">Platform Fee (10%)</span>
            <span className="ea-payout-stat-val">₹{Math.round(totalPaid * 0.1).toLocaleString('en-IN')}</span>
          </div>
        </div>
        <button className="ea-payout-btn">Manage Payout <i className="fa-solid fa-arrow-right" /></button>
      </div>

      {/* ── Transactions ── */}
      <div className="ea-card">
        <div className="ea-card-header">
          <div>
            <h2 className="ea-card-title">Transactions</h2>
          </div>
          <div className="ea-tx-toolbar">
            <div className="ea-tx-tabs">
              {(['all', 'paid', 'pending', 'refunded'] as TxTab[]).map(t => (
                <button
                  key={t}
                  className={`ea-tx-tab${txTab === t ? ' ea-tx-tab--active' : ''}`}
                  onClick={() => setTxTab(t)}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                  <span className="ea-tx-count">{txCounts[t]}</span>
                </button>
              ))}
            </div>
            <div className="ea-tx-search-wrap">
              <i className="fa-solid fa-magnifying-glass ea-tx-search-icon" />
              <input
                className="ea-tx-search"
                placeholder="Search client or invoice…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="ea-tx-list">
          {filtered.length === 0 && (
            <div className="ea-tx-empty">
              <i className="fa-solid fa-receipt" />
              <p>No transactions found</p>
            </div>
          )}
          {filtered.map(tx => {
            const sm = STATUS_META[tx.status]
            return (
              <div key={tx.id} className="ea-tx-row">
                <div className="ea-tx-avatar">{tx.initials}</div>
                <div className="ea-tx-info">
                  <p className="ea-tx-name">{tx.clientName}</p>
                  <p className="ea-tx-plan">{tx.plan}</p>
                </div>
                <div className="ea-tx-meta">
                  <span className="ea-tx-invoice">{tx.invoiceNo}</span>
                  <span className="ea-tx-date">{tx.date}</span>
                </div>
                <div className="ea-tx-method">
                  <i className={METHOD_ICON[tx.method]} />
                  <span>{tx.method}</span>
                </div>
                <span className={`ea-tx-status ea-tx-status--${sm.color}`}>{sm.label}</span>
                <span className={`ea-tx-amount${tx.status === 'refunded' ? ' ea-tx-amount--red' : ''}`}>
                  {tx.status === 'refunded' ? '-' : ''}₹{tx.amount.toLocaleString('en-IN')}
                </span>
                <button className="ea-tx-dl" title="Download invoice"><i className="fa-solid fa-download" /></button>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
