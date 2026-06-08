import { useState } from 'react'

type TxTab = 'all' | 'credits' | 'debits'

const TRANSACTIONS = [
  { id: 1,  name: 'Anjali Singh',   plan: '3-Month Weight Loss',       amount: 4500,  type: 'credit', method: 'UPI',         date: 'Jun 6, 2026',  invoice: 'INV-1042', status: 'completed' },
  { id: 2,  name: 'Rohan Mehta',    plan: '1-Month Muscle Gain',        amount: 1800,  type: 'credit', method: 'Card',        date: 'Jun 5, 2026',  invoice: 'INV-1041', status: 'completed' },
  { id: 3,  name: 'Bank Withdrawal',plan: 'HDFC Bank ••••4521',         amount: 15000, type: 'debit',  method: 'Bank',        date: 'Jun 4, 2026',  invoice: 'WD-0089',  status: 'completed' },
  { id: 4,  name: 'Sneha Iyer',     plan: '6-Month PCOS Program',       amount: 8400,  type: 'credit', method: 'UPI',         date: 'Jun 3, 2026',  invoice: 'INV-1040', status: 'completed' },
  { id: 5,  name: 'Vikram Singh',   plan: '1-Month Consultation',       amount: 1200,  type: 'credit', method: 'Net Banking', date: 'Jun 2, 2026',  invoice: 'INV-1039', status: 'completed' },
  { id: 6,  name: 'Platform Fee',   plan: 'June 2026 commission',       amount: 1320,  type: 'debit',  method: 'Auto-debit',  date: 'Jun 1, 2026',  invoice: 'FEE-0210', status: 'completed' },
  { id: 7,  name: 'Priya Sharma',   plan: '3-Month Diabetes Mgmt',      amount: 3600,  type: 'credit', method: 'UPI',         date: 'May 31, 2026', invoice: 'INV-1038', status: 'completed' },
  { id: 8,  name: 'Arjun Kapoor',   plan: '6-Month Sports Nutrition',   amount: 9000,  type: 'credit', method: 'Card',        date: 'May 29, 2026', invoice: 'INV-1037', status: 'completed' },
  { id: 9,  name: 'Bank Withdrawal',plan: 'HDFC Bank ••••4521',         amount: 20000, type: 'debit',  method: 'Bank',        date: 'May 25, 2026', invoice: 'WD-0088',  status: 'completed' },
  { id: 10, name: 'Meera Joshi',    plan: '1-Month Basic Plan',         amount: 900,   type: 'credit', method: 'UPI',         date: 'May 22, 2026', invoice: 'INV-1036', status: 'pending'   },
]

const LINKED_ACCOUNTS = [
  { id: 1, type: 'bank',  label: 'HDFC Bank',    detail: 'Savings ••••4521', icon: 'fa-solid fa-building-columns', primary: true  },
  { id: 2, type: 'upi',   label: 'Google Pay',   detail: 'dr.priya@okhdfc',  icon: 'fa-solid fa-mobile-screen',    primary: false },
  { id: 3, type: 'upi',   label: 'PhonePe',      detail: 'dr.priya@ybl',     icon: 'fa-solid fa-mobile-screen',    primary: false },
]

const METHOD_ICON: Record<string, string> = {
  'UPI':         'fa-solid fa-mobile-screen',
  'Card':        'fa-solid fa-credit-card',
  'Bank':        'fa-solid fa-building-columns',
  'Net Banking': 'fa-solid fa-globe',
  'Auto-debit':  'fa-solid fa-rotate',
}

export default function DietitianWallet() {
  const [tab, setTab]       = useState<TxTab>('all')
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd]      = useState(false)
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [withdrawAmt, setWithdrawAmt]   = useState('')
  const [addAmt, setAddAmt]             = useState('')

  const balance    = 12_840
  const pending    = 900
  const thisMonth  = 28_200
  const withdrawn  = 35_000

  const filtered = TRANSACTIONS.filter(t => {
    if (tab === 'credits' && t.type !== 'credit') return false
    if (tab === 'debits'  && t.type !== 'debit')  return false
    const q = search.toLowerCase()
    return !q || t.name.toLowerCase().includes(q) || t.plan.toLowerCase().includes(q) || t.invoice.toLowerCase().includes(q)
  })

  const credits = TRANSACTIONS.filter(t => t.type === 'credit')
  const debits  = TRANSACTIONS.filter(t => t.type === 'debit')

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
              <p className="wa-balance-amount">₹{balance.toLocaleString('en-IN')}</p>
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
              <p className="wa-kpi-val">₹{pending.toLocaleString('en-IN')}</p>
              <p className="wa-kpi-sub">Clears in 2 days</p>
            </div>
          </div>
          <div className="wa-kpi wa-kpi--blue">
            <div className="wa-kpi-icon wa-kpi-icon--blue"><i className="fa-solid fa-calendar-day" /></div>
            <div>
              <p className="wa-kpi-label">Earned This Month</p>
              <p className="wa-kpi-val">₹{thisMonth.toLocaleString('en-IN')}</p>
              <p className="wa-kpi-sub wa-sub--up">↗ 14% vs last month</p>
            </div>
          </div>
          <div className="wa-kpi wa-kpi--purple">
            <div className="wa-kpi-icon wa-kpi-icon--purple"><i className="fa-solid fa-building-columns" /></div>
            <div>
              <p className="wa-kpi-label">Total Withdrawn</p>
              <p className="wa-kpi-val">₹{withdrawn.toLocaleString('en-IN')}</p>
              <p className="wa-kpi-sub">Jun 2026 YTD</p>
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
                    max={balance}
                  />
                </div>
                <button className="wa-action-confirm">Confirm Withdrawal</button>
                <button className="wa-action-cancel" onClick={() => setShowWithdraw(false)}>Cancel</button>
              </div>
              <p className="wa-action-hint">Available: ₹{balance.toLocaleString('en-IN')} · Min ₹100 · No fee</p>
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
            <span className="wa-card-sub">{TRANSACTIONS.length} total</span>
          </div>

          {/* Toolbar */}
          <div className="wa-tx-toolbar">
            <div className="wa-tx-tabs">
              {([
                { key: 'all',     label: 'All',     count: TRANSACTIONS.length },
                { key: 'credits', label: 'Credits',  count: credits.length },
                { key: 'debits',  label: 'Debits',   count: debits.length },
              ] as { key: TxTab; label: string; count: number }[]).map(t => (
                <button
                  key={t.key}
                  className={`wa-tx-tab${tab === t.key ? ' wa-tx-tab--active' : ''}`}
                  onClick={() => setTab(t.key)}
                >
                  {t.label}
                  <span className="wa-tx-count">{t.count}</span>
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
            {filtered.length === 0 ? (
              <div className="wa-tx-empty">
                <i className="fa-solid fa-receipt" />
                <span>No transactions found</span>
              </div>
            ) : filtered.map(t => (
              <div key={t.id} className="wa-tx-row">
                <div className={`wa-tx-avatar ${t.type === 'credit' ? 'wa-tx-avatar--green' : 'wa-tx-avatar--red'}`}>
                  <i className={t.type === 'credit' ? 'fa-solid fa-arrow-down' : 'fa-solid fa-arrow-up'} />
                </div>
                <div className="wa-tx-info">
                  <p className="wa-tx-name">{t.name}</p>
                  <p className="wa-tx-plan">{t.plan}</p>
                </div>
                <div className="wa-tx-meta">
                  <span className="wa-tx-invoice">{t.invoice}</span>
                  <span className="wa-tx-date">{t.date}</span>
                </div>
                <div className="wa-tx-method">
                  <i className={METHOD_ICON[t.method] ?? 'fa-solid fa-circle'} />
                  {t.method}
                </div>
                <span className={`wa-tx-status wa-tx-status--${t.status === 'completed' ? 'green' : 'orange'}`}>
                  {t.status}
                </span>
                <span className={`wa-tx-amount ${t.type === 'debit' ? 'wa-tx-amount--red' : ''}`}>
                  {t.type === 'debit' ? '−' : '+'}₹{t.amount.toLocaleString('en-IN')}
                </span>
                <button className="wa-tx-dl" title="Download receipt">
                  <i className="fa-solid fa-download" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="wa-right-col">

          {/* Linked accounts */}
          <div className="wa-card">
            <div className="wa-card-header">
              <h2 className="wa-card-title">Linked Accounts</h2>
              <button className="wa-add-account-btn"><i className="fa-solid fa-plus" /> Add</button>
            </div>
            <div className="wa-account-list">
              {LINKED_ACCOUNTS.map(a => (
                <div key={a.id} className="wa-account-row">
                  <div className="wa-account-icon">
                    <i className={a.icon} />
                  </div>
                  <div className="wa-account-info">
                    <p className="wa-account-label">{a.label}</p>
                    <p className="wa-account-detail">{a.detail}</p>
                  </div>
                  {a.primary && <span className="wa-account-primary">Primary</span>}
                  <button className="wa-account-menu" title="Options">
                    <i className="fa-solid fa-ellipsis-vertical" />
                  </button>
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
                { label: 'Gross Earnings', val: '₹28,200', color: '#16a34a' },
                { label: 'Platform Fee (10%)', val: '−₹2,820', color: '#f97316' },
                { label: 'GST Deducted',      val: '−₹508',  color: '#f97316' },
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
