import { useState, useEffect } from 'react'
import earningsApi, { WalletTransaction, WalletOverview } from '../api/earnings'
import accountsApi, { LinkedAccount } from '../api/accounts'

type TxTab = 'all' | 'credits' | 'debits'

function formatINR(amount: number) {
  return '₹' + amount.toLocaleString('en-IN')
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch { return iso }
}

function formatSource(source: string) {
  return source.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export default function DietitianWallet() {
  const [tab, setTab]       = useState<TxTab>('all')
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd]           = useState(false)
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [withdrawAmt, setWithdrawAmt]   = useState('')
  const [addAmt, setAddAmt]             = useState('')

  const [overview, setOverview]             = useState<WalletOverview | null>(null)
  const [overviewLoading, setOverviewLoading] = useState(true)

  // Linked accounts state
  const [accounts, setAccounts]               = useState<LinkedAccount[]>([])
  const [accountsLoading, setAccountsLoading] = useState(true)

  const [transactions, setTransactions]     = useState<WalletTransaction[]>([])
  const [total, setTotal]                   = useState(0)
  const [page, setPage]                     = useState(1)
  const [totalPages, setTotalPages]         = useState(1)
  const [loading, setLoading]               = useState(true)
  const [loadingMore, setLoadingMore]       = useState(false)

  useEffect(() => {
    setAccountsLoading(true)
    accountsApi.getAccounts()
      .then(data => setAccounts(data))
      .catch(() => {})
      .finally(() => setAccountsLoading(false))
  }, [])

  useEffect(() => {
    setOverviewLoading(true)
    earningsApi.getWalletOverview()
      .then(data => setOverview(data))
      .catch(() => {})
      .finally(() => setOverviewLoading(false))
  }, [])

  useEffect(() => {
    if (page === 1) setLoading(true)
    else setLoadingMore(true)
    earningsApi.getWalletTransactions({ page, limit: 10 })
      .then(res => {
        setTotal(res.data.total)
        setTotalPages(res.meta.totalPages)
        setTransactions(prev => page === 1 ? res.data.transactions : [...prev, ...res.data.transactions])
      })
      .catch(() => {})
      .finally(() => { setLoading(false); setLoadingMore(false) })
  }, [page])

  const filtered = transactions.filter(t => {
    if (tab === 'credits' && t.type !== 'credit') return false
    if (tab === 'debits'  && t.type !== 'debit')  return false
    const q = search.toLowerCase()
    return !q || t.description.toLowerCase().includes(q) || t.source.toLowerCase().includes(q)
  })

  const creditCount = transactions.filter(t => t.type === 'credit').length
  const debitCount  = transactions.filter(t => t.type === 'debit').length

  return (
    <div className="wa-root">

      {/* ── Header ── */}
      <div className="wa-header">
        <div>
          <h1 className="wa-title">Wallet</h1>
          <p className="wa-subtitle">Manage your earnings, payouts and linked accounts</p>
        </div>
        <div className="wa-header-actions">
          <button className="wa-btn wa-btn--outline" onClick={() => { setShowAdd(true); setShowWithdraw(false) }}>
            <i className="fa-solid fa-plus" /> Add Money
          </button>
          <button className="wa-btn wa-btn--solid" onClick={() => { setShowWithdraw(true); setShowAdd(false) }}>
            <i className="fa-solid fa-arrow-up-from-bracket" /> Withdraw
          </button>
        </div>
      </div>

      {/* ── Balance + KPI row ── */}
      <div className="wa-top-row">

        {/* Balance card */}
        <div className="wa-balance-card">
          <div className="wa-balance-top">
            <div>
              <p className="wa-balance-label">Available Balance</p>
              <p className="wa-balance-amount">
                {overviewLoading ? <span className="ea-kpi-skel" style={{ width: 120, height: 28, display: 'inline-block' }} /> : formatINR(overview?.available_balance ?? 0)}
              </p>
              <p className="wa-balance-note"><i className="fa-solid fa-shield-halved" /> Secured by MeriDiet Pay</p>
            </div>
            <div className="wa-balance-icon">
              <i className="fa-solid fa-wallet" />
            </div>
          </div>
          <div className="wa-balance-actions">
            <button className="wa-quick-btn" onClick={() => { setShowWithdraw(true); setShowAdd(false) }}>
              <i className="fa-solid fa-arrow-up-from-bracket" />
              <span>Withdraw</span>
            </button>
            <div className="wa-balance-divider" />
            <button className="wa-quick-btn" onClick={() => { setShowAdd(true); setShowWithdraw(false) }}>
              <i className="fa-solid fa-plus" />
              <span>Add Money</span>
            </button>
            <div className="wa-balance-divider" />
            <button className="wa-quick-btn">
              <i className="fa-solid fa-arrow-right-arrow-left" />
              <span>Transfer</span>
            </button>
            <div className="wa-balance-divider" />
            <button className="wa-quick-btn">
              <i className="fa-solid fa-clock-rotate-left" />
              <span>History</span>
            </button>
          </div>
        </div>

        {/* KPI mini cards */}
        <div className="wa-kpis">
          <div className="wa-kpi wa-kpi--orange">
            <div className="wa-kpi-icon wa-kpi-icon--orange"><i className="fa-solid fa-hourglass-half" /></div>
            <div>
              <p className="wa-kpi-label">Pending Payout</p>
              <p className="wa-kpi-val">
                {overviewLoading ? <span className="ea-kpi-skel" style={{ width: 80, height: 20, display: 'inline-block' }} /> : formatINR(overview?.pending_payout ?? 0)}
              </p>
              <p className="wa-kpi-sub">Clears in 2 days</p>
            </div>
          </div>
          <div className="wa-kpi wa-kpi--blue">
            <div className="wa-kpi-icon wa-kpi-icon--blue"><i className="fa-solid fa-calendar-day" /></div>
            <div>
              <p className="wa-kpi-label">Earned This Month</p>
              <p className="wa-kpi-val">
                {overviewLoading ? <span className="ea-kpi-skel" style={{ width: 80, height: 20, display: 'inline-block' }} /> : formatINR(overview?.earned_this_month ?? 0)}
              </p>
              {!overviewLoading && overview && (
                overview.earned_this_month_change_pct !== null
                  ? <p className={`wa-kpi-sub ${overview.earned_this_month_change_pct >= 0 ? 'wa-sub--up' : 'wa-sub--down'}`}>
                      {overview.earned_this_month_change_pct >= 0 ? '↗' : '↘'} {Math.abs(overview.earned_this_month_change_pct)}% vs last month
                    </p>
                  : <p className="wa-kpi-sub">This month</p>
              )}
            </div>
          </div>
          <div className="wa-kpi wa-kpi--purple">
            <div className="wa-kpi-icon wa-kpi-icon--purple"><i className="fa-solid fa-building-columns" /></div>
            <div>
              <p className="wa-kpi-label">Total Withdrawn</p>
              <p className="wa-kpi-val">
                {overviewLoading ? <span className="ea-kpi-skel" style={{ width: 80, height: 20, display: 'inline-block' }} /> : formatINR(overview?.total_withdrawn ?? 0)}
              </p>
              {!overviewLoading && <p className="wa-kpi-sub">{overview?.withdrawn_ytd_label ?? ''}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* ── Withdraw / Add modal-inline banners ── */}
      {showWithdraw && (
        <div className="wa-action-banner wa-action-banner--withdraw">
          <div className="wa-action-banner-inner">
            <div className="wa-action-icon"><i className="fa-solid fa-arrow-up-from-bracket" /></div>
            <div className="wa-action-body">
              <p className="wa-action-title">Withdraw to Bank</p>
              <p className="wa-action-sub">Funds will reach HDFC ••••4521 in 1–2 business days</p>
              <div className="wa-action-row">
                <div className="wa-action-input-wrap">
                  <span className="wa-action-prefix">₹</span>
                  <input
                    className="wa-action-input"
                    type="number"
                    placeholder="Enter amount"
                    value={withdrawAmt}
                    onChange={e => setWithdrawAmt(e.target.value)}
                    min={1}
                    max={overview?.available_balance ?? 0}
                  />
                </div>
                <button className="wa-action-confirm">Confirm Withdrawal</button>
                <button className="wa-action-cancel" onClick={() => setShowWithdraw(false)}>Cancel</button>
              </div>
              <p className="wa-action-hint">Available: {formatINR(overview?.available_balance ?? 0)} · Min ₹100 · No fee</p>
            </div>
          </div>
        </div>
      )}

      {showAdd && (
        <div className="wa-action-banner wa-action-banner--add">
          <div className="wa-action-banner-inner">
            <div className="wa-action-icon wa-action-icon--green"><i className="fa-solid fa-plus" /></div>
            <div className="wa-action-body">
              <p className="wa-action-title">Add Money to Wallet</p>
              <p className="wa-action-sub">Instantly credit your MeriDiet wallet via UPI, Card or Net Banking</p>
              <div className="wa-action-row">
                <div className="wa-action-input-wrap">
                  <span className="wa-action-prefix">₹</span>
                  <input
                    className="wa-action-input"
                    type="number"
                    placeholder="Enter amount"
                    value={addAmt}
                    onChange={e => setAddAmt(e.target.value)}
                    min={1}
                  />
                </div>
                <button className="wa-action-confirm">Proceed to Pay</button>
                <button className="wa-action-cancel" onClick={() => setShowAdd(false)}>Cancel</button>
              </div>
              <p className="wa-action-hint">Accepted: UPI · Debit/Credit Card · Net Banking</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Main content row: Transactions + Linked Accounts ── */}
      <div className="wa-content-row">

        {/* Transactions card */}
        <div className="wa-card wa-card--wide">
          <div className="wa-card-header">
            <h2 className="wa-card-title">Transactions</h2>
            <span className="wa-card-sub">{loading ? '—' : `${total} total`}</span>
          </div>

          {/* Toolbar */}
          <div className="wa-tx-toolbar">
            <div className="wa-tx-tabs">
              {([
                { key: 'all',     label: 'All',     count: total        },
                { key: 'credits', label: 'Credits', count: creditCount  },
                { key: 'debits',  label: 'Debits',  count: debitCount   },
              ] as { key: TxTab; label: string; count: number }[]).map(t => (
                <button
                  key={t.key}
                  className={`wa-tx-tab${tab === t.key ? ' wa-tx-tab--active' : ''}`}
                  onClick={() => setTab(t.key)}
                >
                  {t.label}
                  <span className="wa-tx-count">{loading ? '—' : t.count}</span>
                </button>
              ))}
            </div>
            <div className="wa-tx-search-wrap">
              <i className="fa-solid fa-magnifying-glass wa-tx-search-icon" />
              <input
                className="wa-tx-search"
                placeholder="Search transactions…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* List */}
          <div className="wa-tx-list">
            {loading && [1,2,3,4,5].map(i => (
              <div key={i} className="wa-tx-row">
                <div className="wa-tx-avatar" style={{ background: '#e5e7eb' }} />
                <div className="wa-tx-info">
                  <span className="ea-kpi-skel" style={{ width: 180, height: 13, display: 'block', marginBottom: 6 }} />
                  <span className="ea-kpi-skel" style={{ width: 120, height: 11, display: 'block' }} />
                </div>
                <div className="wa-tx-meta">
                  <span className="ea-kpi-skel" style={{ width: 80, height: 11, display: 'block', marginBottom: 4 }} />
                  <span className="ea-kpi-skel" style={{ width: 70, height: 11, display: 'block' }} />
                </div>
                <span className="ea-kpi-skel" style={{ width: 80, height: 14, display: 'inline-block' }} />
                <span className="ea-kpi-skel" style={{ width: 70, height: 14, display: 'inline-block' }} />
              </div>
            ))}

            {!loading && filtered.length === 0 && (
              <div className="wa-tx-empty">
                <i className="fa-solid fa-receipt" />
                <span>No transactions found</span>
              </div>
            )}

            {!loading && filtered.map(tx => (
              <div key={tx.id} className="wa-tx-row">
                <div className={`wa-tx-avatar ${tx.type === 'credit' ? 'wa-tx-avatar--green' : 'wa-tx-avatar--red'}`}>
                  <i className={tx.type === 'credit' ? 'fa-solid fa-arrow-down' : 'fa-solid fa-arrow-up'} />
                </div>
                <div className="wa-tx-info">
                  <p className="wa-tx-name">{tx.description}</p>
                  <p className="wa-tx-plan">{formatSource(tx.source)}</p>
                </div>
                <div className="wa-tx-meta">
                  <span className="wa-tx-invoice">Balance: {formatINR(tx.balance_after)}</span>
                  <span className="wa-tx-date">{formatDate(tx.created_at)}</span>
                </div>
                <div className="wa-tx-method">
                  <i className="fa-solid fa-circle-check" />
                  Completed
                </div>
                <span className="wa-tx-status wa-tx-status--green">
                  {tx.type === 'credit' ? 'Credit' : 'Debit'}
                </span>
                <span className={`wa-tx-amount ${tx.type === 'debit' ? 'wa-tx-amount--red' : ''}`}>
                  {tx.type === 'debit' ? '−' : '+'}{formatINR(tx.net_amount)}
                </span>
              </div>
            ))}

            {loadingMore && (
              <div style={{ textAlign: 'center', padding: '12px 0', color: '#9ca3af', fontSize: 13 }}>
                Loading…
              </div>
            )}

            {!loading && !loadingMore && page < totalPages && (
              <div style={{ textAlign: 'center', paddingTop: 16 }}>
                <button className="rv-load-more" onClick={() => setPage(p => p + 1)}>
                  Load more
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right panel */}
        <div className="wa-right-col">

          {/* Linked accounts */}
          <div className="wa-card">
            <div className="wa-card-header">
              <h2 className="wa-card-title">Linked Accounts</h2>
            </div>
            <div className="wa-account-list">
              {accountsLoading && [1, 2].map(i => (
                <div key={i} className="wa-account-row">
                  <div className="wa-account-icon" style={{ background: '#e5e7eb' }} />
                  <div className="wa-account-info">
                    <span className="ea-kpi-skel" style={{ width: 100, height: 12, display: 'block', marginBottom: 5 }} />
                    <span className="ea-kpi-skel" style={{ width: 140, height: 11, display: 'block' }} />
                  </div>
                </div>
              ))}

              {!accountsLoading && accounts.length === 0 && (
                <p style={{ fontSize: 13, color: '#9ca3af', padding: '8px 0' }}>
                  No accounts linked. Go to Profile → Bank Information to add one.
                </p>
              )}

              {!accountsLoading && accounts.map(a => (
                <div key={a.id} className="wa-account-row">
                  <div className="wa-account-icon">
                    <i className={a.type === 'upi' ? 'fa-solid fa-mobile-screen' : 'fa-solid fa-building-columns'} />
                  </div>
                  <div className="wa-account-info">
                    <p className="wa-account-label">{a.type === 'upi' ? 'UPI' : a.bank_name}</p>
                    <p className="wa-account-detail">
                      {a.type === 'upi' ? a.upi_id : `••••${a.account_number?.slice(-4)}`}
                    </p>
                  </div>
                  {a.is_primary && <span className="wa-account-primary">Primary</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Payout schedule */}
          <div className="wa-card">
            <div className="wa-card-header">
              <h2 className="wa-card-title">Payout Schedule</h2>
            </div>
            <div className="wa-schedule-list">
              <div className="wa-schedule-row">
                <div className="wa-schedule-icon"><i className="fa-solid fa-calendar-check" /></div>
                <div className="wa-schedule-info">
                  <p className="wa-schedule-label">Next Payout</p>
                  <p className="wa-schedule-val">Jun 10, 2026</p>
                </div>
                <span className="wa-schedule-badge wa-schedule-badge--green">Scheduled</span>
              </div>
              <div className="wa-schedule-row">
                <div className="wa-schedule-icon"><i className="fa-solid fa-sack-dollar" /></div>
                <div className="wa-schedule-info">
                  <p className="wa-schedule-label">Payout Amount</p>
                  <p className="wa-schedule-val">₹12,840</p>
                </div>
              </div>
              <div className="wa-schedule-row">
                <div className="wa-schedule-icon"><i className="fa-solid fa-building-columns" /></div>
                <div className="wa-schedule-info">
                  <p className="wa-schedule-label">To Account</p>
                  <p className="wa-schedule-val">HDFC ••••4521</p>
                </div>
              </div>
              <div className="wa-schedule-row">
                <div className="wa-schedule-icon"><i className="fa-solid fa-rotate" /></div>
                <div className="wa-schedule-info">
                  <p className="wa-schedule-label">Frequency</p>
                  <p className="wa-schedule-val">Bi-weekly</p>
                </div>
                <button className="wa-schedule-change">Change</button>
              </div>
            </div>
          </div>

          {/* Mini summary */}
          <div className="wa-card wa-summary-card">
            <div className="wa-card-header">
              <h2 className="wa-card-title">June Summary</h2>
            </div>
            <div className="wa-summary-rows">
              {[
                { label: 'Gross Earnings',    val: '₹28,200',  color: '#16a34a' },
                { label: 'Platform Fee (10%)',val: '−₹2,820',  color: '#f97316' },
                { label: 'GST Deducted',      val: '−₹508',    color: '#f97316' },
                { label: 'Net Payable',        val: '₹24,872', color: '#16a34a', bold: true },
              ].map(r => (
                <div key={r.label} className="wa-summary-row">
                  <span className={`wa-summary-label${r.bold ? ' wa-summary-label--bold' : ''}`}>{r.label}</span>
                  <span className="wa-summary-val" style={{ color: r.color, fontWeight: r.bold ? 800 : 600 }}>{r.val}</span>
                </div>
              ))}
            </div>
            <button className="wa-dl-summary-btn"><i className="fa-solid fa-download" /> Download Statement</button>
          </div>

        </div>
      </div>

    </div>
  )
}
