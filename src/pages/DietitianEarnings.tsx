import { useState, useEffect } from 'react'
import earningsApi, {
  EarningsSummary, MonthlyRevenueData, MonthlyRevenueItem,
  EarningsByPlanItem, PayoutData, TransactionItem, TxSummaryCount,
} from '../api/earnings'

type Period = 'week' | 'month' | 'quarter' | 'year'
type TxTab  = 'all' | 'paid' | 'pending' | 'refunded'

const PLAN_COLORS = ['#a855f7', '#06b6d4', '#f97316', '#3b82f6', '#22c55e', '#ec4899', '#f59e0b', '#ef4444']

const TX_STATUS_META: Record<'paid' | 'pending' | 'refunded', { label: string; color: string }> = {
  paid:     { label: 'Paid',     color: 'green'  },
  pending:  { label: 'Pending',  color: 'orange' },
  refunded: { label: 'Refunded', color: 'red'    },
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function formatTxDate(dateStr: string) {
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch { return dateStr }
}

function formatINR(amount: number | undefined | null): string {
  if (amount == null) return '—'
  return '₹' + amount.toLocaleString('en-IN')
}

function changeBadge(pct: number | null, period: string) {
  if (pct === null) return <p className="ea-kpi-sub">This {period}</p>
  const up = pct >= 0
  return (
    <p className={`ea-kpi-sub ${up ? 'ea-sub--up' : 'ea-sub--down'}`}>
      {up ? '↗' : '↘'} {Math.abs(pct)}% vs last {period}
    </p>
  )
}

export default function DietitianEarnings() {
  const [period, setPeriod] = useState<Period>('month')
  const [txTab, setTxTab]   = useState<TxTab>('all')
  const [search, setSearch] = useState('')

  const [summary, setSummary]               = useState<EarningsSummary | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(true)

  const [monthlyData, setMonthlyData]           = useState<MonthlyRevenueItem[]>([])
  const [monthlyMeta, setMonthlyMeta]           = useState<Omit<MonthlyRevenueData, 'months'> | null>(null)
  const [monthlyLoading, setMonthlyLoading]     = useState(true)

  const [planData, setPlanData]           = useState<EarningsByPlanItem[]>([])
  const [planLoading, setPlanLoading]     = useState(true)

  const [payoutData, setPayoutData]       = useState<PayoutData | null>(null)
  const [payoutLoading, setPayoutLoading] = useState(true)

  const [debouncedSearch, setDebouncedSearch]   = useState('')
  const [transactions, setTransactions]         = useState<TransactionItem[]>([])
  const [txSummary, setTxSummary]               = useState<TxSummaryCount>({ all: 0, paid: 0, pending: 0, refunded: 0 })
  const [txPage, setTxPage]                     = useState(1)
  const [txTotalPages, setTxTotalPages]         = useState(1)
  const [txLoading, setTxLoading]               = useState(true)
  const [txLoadingMore, setTxLoadingMore]       = useState(false)

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  // Reset to page 1 when tab or search changes
  useEffect(() => {
    setTxPage(1)
    setTransactions([])
  }, [txTab, debouncedSearch])

  // Fetch transactions
  useEffect(() => {
    if (txPage === 1) setTxLoading(true)
    else setTxLoadingMore(true)
    earningsApi.getTransactions({ status: txTab, search: debouncedSearch || undefined, page: txPage, limit: 10 })
      .then(res => {
        setTxSummary(res.data.summary)
        setTxTotalPages(res.meta.totalPages)
        setTransactions(prev => txPage === 1 ? res.data.transactions : [...prev, ...res.data.transactions])
      })
      .catch(() => {})
      .finally(() => { setTxLoading(false); setTxLoadingMore(false) })
  }, [txTab, debouncedSearch, txPage])

  useEffect(() => {
    setSummaryLoading(true)
    earningsApi.getSummary(period)
      .then(data => setSummary(data))
      .catch(() => setSummary(null))
      .finally(() => setSummaryLoading(false))
  }, [period])

  useEffect(() => {
    setPayoutLoading(true)
    earningsApi.getPayout()
      .then(data => setPayoutData(data))
      .catch(() => {})
      .finally(() => setPayoutLoading(false))
  }, [])

  useEffect(() => {
    setPlanLoading(true)
    earningsApi.getByPlan()
      .then(data => setPlanData(data.plans))
      .catch(() => {})
      .finally(() => setPlanLoading(false))
  }, [])

  useEffect(() => {
    setMonthlyLoading(true)
    earningsApi.getMonthlyRevenue(6)
      .then(data => {
        setMonthlyData(data.months)
        const { months: _months, ...meta } = data
        setMonthlyMeta(meta)
      })
      .catch(() => {})
      .finally(() => setMonthlyLoading(false))
  }, [])

  const maxMonthlyRev = monthlyData.length > 0
    ? Math.max(...monthlyData.map(x => x.net_revenue), 1)
    : 1

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
            <p className="ea-kpi-label">Net Earnings</p>
            <p className="ea-kpi-val">
              {summaryLoading ? <span className="ea-kpi-skel" /> : summary ? formatINR(summary.net_earnings) : '—'}
            </p>
            {!summaryLoading && summary && (
              <>
                {changeBadge(summary.earnings_change_pct, period)}
                <p className="ea-kpi-sub ea-kpi-sub--muted">
                  Gross {formatINR(summary.gross_earnings)} · {summary.platform_commission_pct}% commission {formatINR(summary.platform_commission)}
                </p>
              </>
            )}
          </div>
        </div>
        <div className="ea-kpi ea-kpi--blue">
          <div className="ea-kpi-icon ea-kpi-icon--blue"><i className="fa-solid fa-calendar-check" /></div>
          <div className="ea-kpi-body">
            <p className="ea-kpi-label">Completed Sessions</p>
            <p className="ea-kpi-val">
              {summaryLoading ? <span className="ea-kpi-skel" /> : summary ? summary.completed_sessions : '—'}
            </p>
            {!summaryLoading && summary && changeBadge(summary.completed_sessions_change_pct, period)}
          </div>
        </div>
        <div className="ea-kpi ea-kpi--purple">
          <div className="ea-kpi-icon ea-kpi-icon--purple"><i className="fa-solid fa-hourglass-half" /></div>
          <div className="ea-kpi-body">
            <p className="ea-kpi-label">Pending Booking (Net)</p>
            <p className="ea-kpi-val">
              {summaryLoading ? <span className="ea-kpi-skel" /> : summary ? formatINR(summary.pending_booking_net) : '—'}
            </p>
            {!summaryLoading && summary && (
              <p className="ea-kpi-sub ea-kpi-sub--muted">
                Gross {formatINR(summary.pending_booking_gross)} · commission {formatINR(summary.pending_booking_commission)}
              </p>
            )}
          </div>
        </div>
        <div className="ea-kpi ea-kpi--orange">
          <div className="ea-kpi-icon ea-kpi-icon--orange"><i className="fa-solid fa-wallet" /></div>
          <div className="ea-kpi-body">
            <p className="ea-kpi-label">Available to Withdraw</p>
            <p className="ea-kpi-val">
              {summaryLoading ? <span className="ea-kpi-skel" /> : summary ? formatINR(summary.earnings_balance) : '—'}
            </p>
            {!summaryLoading && <p className="ea-kpi-sub">All-time net balance</p>}
          </div>
        </div>
      </div>

      {/* ── Charts row ── */}
      <div className="ea-charts-row">

        {/* Monthly bar chart */}
        <div className="ea-card ea-card--wide">
          <div className="ea-card-header">
            <h2 className="ea-card-title">Monthly Revenue</h2>
            <span className="ea-card-sub">
              {monthlyData.length > 0
                ? `${monthlyData[0].label} ${monthlyData[0].year} – ${monthlyData[monthlyData.length - 1].label} ${monthlyData[monthlyData.length - 1].year}`
                : 'Last 6 months'}
            </span>
          </div>
          {monthlyLoading ? (
            <div className="ea-bar-chart">
              {[45, 70, 55, 80, 60, 35].map((h, i) => (
                <div key={i} className="ea-bar-col">
                  <div className="ea-bar-track">
                    <div className="ea-bar-skel" style={{ height: `${h}%` }} />
                  </div>
                  <span className="ea-bar-label ea-bar-label--skel" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="ea-bar-chart">
                {monthlyData.map(m => (
                  <div key={`${m.year}-${m.month}`} className="ea-bar-col">
                    <span className="ea-bar-val">{formatINR(m.net_revenue)}</span>
                    <div className="ea-bar-track">
                      <div className="ea-bar-fill" style={{ height: `${(m.net_revenue / maxMonthlyRev) * 100}%` }} />
                    </div>
                    <span className="ea-bar-label">{m.label}</span>
                  </div>
                ))}
              </div>
              {monthlyMeta && monthlyData.length > 0 && (
                <div className="ea-chart-total">
                  <span className="ea-chart-total-label">{monthlyData.length}-month net · {monthlyMeta.platform_commission_pct}% commission deducted</span>
                  <span className="ea-chart-total-val">{formatINR(monthlyMeta.total_net)}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Plan-wise earnings */}
        <div className="ea-card">
          <div className="ea-card-header">
            <h2 className="ea-card-title">Earnings by Plan</h2>
            <span className="ea-card-sub">Net revenue · all time</span>
          </div>
          <div className="ea-plan-list">
            {planLoading && [1,2,3].map(i => (
              <div key={i} className="ea-plan-row">
                <div className="ea-plan-dot" style={{ background: '#e5e7eb' }} />
                <div className="ea-plan-info">
                  <div className="ea-plan-top">
                    <span className="ea-kpi-skel" style={{ width: 160, height: 14, display: 'inline-block' }} />
                    <span className="ea-kpi-skel" style={{ width: 60, height: 14, display: 'inline-block' }} />
                  </div>
                  <div className="ea-plan-bar-bg"><div className="ea-bar-skel" style={{ height: '100%', width: '60%' }} /></div>
                </div>
                <span className="ea-kpi-skel" style={{ width: 32, height: 14, display: 'inline-block' }} />
              </div>
            ))}
            {!planLoading && planData.length === 0 && (
              <p style={{ color: '#9ca3af', fontSize: 13, padding: '12px 0' }}>No plan data yet</p>
            )}
            {!planLoading && planData.map((p, idx) => {
              const color = PLAN_COLORS[idx % PLAN_COLORS.length]
              return (
                <div key={p.plan_name} className="ea-plan-row">
                  <div className="ea-plan-dot" style={{ background: color }} />
                  <div className="ea-plan-info">
                    <div className="ea-plan-top">
                      <span className="ea-plan-name">{p.plan_name}</span>
                      <span className="ea-plan-amount">{formatINR(p.net_revenue)}</span>
                    </div>
                    <div className="ea-plan-bar-bg">
                      <div className="ea-plan-bar-fill" style={{ width: `${p.percentage}%`, background: color }} />
                    </div>
                  </div>
                  <span className="ea-plan-pct">{p.percentage}%</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Payout summary card ── */}
      <div className="ea-payout-banner">
        <div className="ea-payout-left">
          <div className="ea-payout-icon"><i className="fa-solid fa-wallet" /></div>
          <div>
            <p className="ea-payout-title">Next Payout</p>
            {payoutLoading
              ? <span className="ea-kpi-skel" style={{ width: 220, height: 13, display: 'inline-block', marginTop: 4 }} />
              : <p className="ea-payout-sub">
                  {payoutData
                    ? <>
                        Processing on {new Date(payoutData.next_payout_date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {' · '}
                        {payoutData.payout_upi ? `UPI: ${payoutData.payout_upi}` : 'No UPI linked'}
                      </>
                    : 'Payout info unavailable'
                  }
                </p>
            }
          </div>
        </div>
        <div className="ea-payout-mid">
          <div className="ea-payout-stat">
            <span className="ea-payout-stat-label">Net Paid (this month)</span>
            <span className="ea-payout-stat-val ea-payout-val--green">
              {payoutLoading ? <span className="ea-kpi-skel" style={{ width: 70, height: 14, display: 'inline-block' }} /> : formatINR(payoutData?.net_paid_this_month)}
            </span>
          </div>
          <div className="ea-payout-divider" />
          <div className="ea-payout-stat">
            <span className="ea-payout-stat-label">Pending Bookings (Net)</span>
            <span className="ea-payout-stat-val ea-payout-val--orange">
              {payoutLoading ? <span className="ea-kpi-skel" style={{ width: 70, height: 14, display: 'inline-block' }} /> : formatINR(payoutData?.pending_booking_net)}
            </span>
          </div>
          <div className="ea-payout-divider" />
          <div className="ea-payout-stat">
            <span className="ea-payout-stat-label">
              Platform Fee ({payoutData ? `${payoutData.platform_commission_pct}%` : '—'})
            </span>
            <span className="ea-payout-stat-val">
              {payoutLoading ? <span className="ea-kpi-skel" style={{ width: 70, height: 14, display: 'inline-block' }} /> : formatINR(payoutData?.platform_commission_this_month)}
            </span>
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
                  <span className="ea-tx-count">{txSummary[t]}</span>
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
          {txLoading && [1,2,3,4,5].map(i => (
            <div key={i} className="ea-tx-row">
              <div className="ea-tx-avatar" style={{ background: '#e5e7eb' }} />
              <div className="ea-tx-info">
                <span className="ea-kpi-skel" style={{ width: 120, height: 13, display: 'block', marginBottom: 6 }} />
                <span className="ea-kpi-skel" style={{ width: 180, height: 11, display: 'block' }} />
              </div>
              <div className="ea-tx-meta">
                <span className="ea-kpi-skel" style={{ width: 90, height: 11, display: 'block', marginBottom: 4 }} />
                <span className="ea-kpi-skel" style={{ width: 70, height: 11, display: 'block' }} />
              </div>
              <span className="ea-kpi-skel" style={{ width: 50, height: 22, display: 'inline-block', borderRadius: 4 }} />
              <span className="ea-kpi-skel" style={{ width: 70, height: 14, display: 'inline-block' }} />
            </div>
          ))}

          {!txLoading && transactions.length === 0 && (
            <div className="ea-tx-empty">
              <i className="fa-solid fa-receipt" />
              <p>No transactions found</p>
            </div>
          )}

          {!txLoading && transactions.map(tx => {
            const sm = TX_STATUS_META[tx.payment_status]
            return (
              <div key={tx.id} className="ea-tx-row">
                {tx.client_avatar
                  ? <img src={tx.client_avatar} alt={tx.client_name} className="ea-tx-avatar ea-tx-avatar--img" />
                  : <div className="ea-tx-avatar">{getInitials(tx.client_name)}</div>
                }
                <div className="ea-tx-info">
                  <p className="ea-tx-name">{tx.client_name}</p>
                  <p className="ea-tx-plan">{tx.plan_name ?? 'Consultation'}</p>
                </div>
                <div className="ea-tx-meta">
                  <span className="ea-tx-invoice">{tx.invoice_number}</span>
                  <span className="ea-tx-date">{formatTxDate(tx.date)}</span>
                </div>
                <span className={`ea-tx-status ea-tx-status--${sm.color}`}>{sm.label}</span>
                <span className={`ea-tx-amount${tx.payment_status === 'refunded' ? ' ea-tx-amount--red' : ''}`}>
                  {tx.payment_status === 'refunded' ? '-' : ''}{formatINR(tx.net_amount)}
                </span>
                <button className="ea-tx-dl" title="Download invoice"><i className="fa-solid fa-download" /></button>
              </div>
            )
          })}

          {txLoadingMore && (
            <div style={{ textAlign: 'center', padding: '12px 0', color: '#9ca3af', fontSize: 13 }}>
              Loading…
            </div>
          )}

          {!txLoading && !txLoadingMore && txPage < txTotalPages && (
            <div style={{ textAlign: 'center', paddingTop: 16 }}>
              <button className="rv-load-more" onClick={() => setTxPage(p => p + 1)}>
                Load more
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
