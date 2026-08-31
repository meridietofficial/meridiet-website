import { useState, useEffect } from 'react'
import earningsApi, { WalletTransaction, WalletOverview, PayoutData } from '../api/earnings'
import accountsApi, { LinkedAccount } from '../api/accounts'
import SEO from '../components/SEO'

type TxTab = 'all' | 'credits' | 'debits'
type WalletFilter = 'all' | 'plan' | 'earnings'

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
  const [tab, setTab]               = useState<TxTab>('all')
  const [walletFilter, setWalletFilter] = useState<WalletFilter>('all')
  const [search, setSearch]         = useState('')
  const [showAdd, setShowAdd]           = useState(false)
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [withdrawAmt, setWithdrawAmt]   = useState('')
  const [addAmt, setAddAmt]             = useState('')
  const [addingMoney, setAddingMoney]   = useState(false)
  const [addMoneyErr, setAddMoneyErr]   = useState<string | null>(null)

  const [overview, setOverview]             = useState<WalletOverview | null>(null)
  const [overviewLoading, setOverviewLoading] = useState(true)

  const [payout, setPayout]               = useState<PayoutData | null>(null)
  const [payoutLoading, setPayoutLoading] = useState(true)

  // Linked accounts state
  const [accounts, setAccounts]               = useState<LinkedAccount[]>([])
  const [accountsLoading, setAccountsLoading] = useState(true)

  const [transactions, setTransactions]     = useState<WalletTransaction[]>([])
  const [total, setTotal]                   = useState(0)
  const [page, setPage]                     = useState(1)
  const [totalPages, setTotalPages]         = useState(1)
  const [loading, setLoading]               = useState(true)
  const [loadingMore, setLoadingMore]       = useState(false)
  const [txRefreshTick, setTxRefreshTick]   = useState(0)

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
    setPayoutLoading(true)
    earningsApi.getPayout()
      .then(data => setPayout(data))
      .catch(() => {})
      .finally(() => setPayoutLoading(false))
  }, [])

  useEffect(() => {
    setPage(1)
    setTransactions([])
  }, [walletFilter])

  useEffect(() => {
    if (page === 1) setLoading(true)
    else setLoadingMore(true)
    earningsApi.getWalletTransactions({
      page,
      limit: 10,
      wallet: walletFilter !== 'all' ? walletFilter : undefined,
    })
      .then(res => {
        setTotal(res.data.total)
        setTotalPages(res.meta.totalPages)
        setTransactions(prev => page === 1 ? res.data.transactions : [...prev, ...res.data.transactions])
      })
      .catch(() => {})
      .finally(() => { setLoading(false); setLoadingMore(false) })
  }, [page, txRefreshTick, walletFilter])

  async function handleAddMoney() {
    const amt = Number(addAmt)
    if (!amt || !Number.isInteger(amt)) { setAddMoneyErr('Please enter a valid whole number amount'); return }
    if (amt < 100)   { setAddMoneyErr('Minimum recharge amount is ₹100'); return }
    if (amt > 50000) { setAddMoneyErr('Maximum recharge amount is ₹50,000'); return }
    setAddingMoney(true)
    setAddMoneyErr(null)
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
        theme: { color: '#006B28' },
        handler: async (rzpResponse: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            await earningsApi.rechargeVerify(rzpResponse)
            setShowAdd(false)
            setAddAmt('')
            // Re-fetch overview for correct balance (don't rely on verify response)
            earningsApi.getWalletOverview().then(data => setOverview(data)).catch(() => {})
            // Force transaction list refresh even if already on page 1
            setPage(1)
            setTxRefreshTick(t => t + 1)
          } catch (err: any) {
            setAddMoneyErr(err.message ?? 'Payment verification failed')
          } finally {
            setAddingMoney(false)
          }
        },
        modal: {
          ondismiss: async () => {
            try { await earningsApi.rechargeFailed(order_id) } catch {}
            setAddingMoney(false)
          },
        },
      })
      rzp.open()
    } catch (e: any) {
      setAddMoneyErr(e.message ?? 'Could not initiate payment')
      setAddingMoney(false)
    }
  }

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
      <SEO noIndex={true} title="Wallet" description="Wallet — private dietitian area." />

      {/* ── Header ── */}
      <div className="wa-header">
        <div>
          <h1 className="wa-title">Wallet</h1>
          <p className="wa-subtitle">Manage your earnings, payouts and linked accounts</p>
        </div>
        <div className="wa-header-actions">
          <button className="wa-btn wa-btn--outline" onClick={() => { setShowAdd(true); setShowWithdraw(false) }}>
            <i className="fa-solid fa-coins" /> Recharge Plan Credits
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
              <p className="wa-action-title">Recharge Plan Credits</p>
              <p className="wa-action-sub">Pay via UPI, Card or Net Banking · ₹50 per 1-week plan · ₹100 per 1-month plan</p>
              <div className="wa-action-row">
                <div className="wa-action-input-wrap">
                  <span className="wa-action-prefix">₹</span>
                  <input
                    className="wa-action-input"
                    type="number"
                    placeholder="Enter amount"
                    value={addAmt}
                    onChange={e => { setAddAmt(e.target.value); setAddMoneyErr(null) }}
                    min={1}
                    disabled={addingMoney}
                  />
                </div>
                <button
                  className="wa-action-confirm"
                  onClick={handleAddMoney}
                  disabled={addingMoney || !addAmt}
                >
                  {addingMoney ? 'Processing…' : 'Proceed to Pay'}
                </button>
                <button className="wa-action-cancel" onClick={() => { setShowAdd(false); setAddMoneyErr(null) }} disabled={addingMoney}>Cancel</button>
              </div>
              {addMoneyErr && (
                <p style={{ color: '#ef4444', fontSize: 12, marginTop: 6 }}>
                  <i className="fa-solid fa-circle-exclamation" style={{ marginRight: 4 }} />{addMoneyErr}
                </p>
              )}
              <p className="wa-action-hint">Min ₹100 · Max ₹50,000 · Accepted: UPI · Debit/Credit Card · Net Banking</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Plan Credits Banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
        border: '1.5px solid #c4b5fd',
        borderRadius: 16,
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        marginBottom: 24,
        flexWrap: 'wrap',
      }}>
        <div style={{
          background: '#6366f1', borderRadius: 12, width: 48, height: 48,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <i className="fa-solid fa-coins" style={{ color: '#fff', fontSize: 20 }} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: '#4c1d95' }}>Plan Credits</p>
          <p style={{ margin: '3px 0 0', fontSize: 12, color: '#7c3aed' }}>
            Used for AI diet plan generation · ₹50 per 1-week plan · ₹100 per 1-month plan
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#4c1d95' }}>
            {overviewLoading
              ? <span className="ea-kpi-skel" style={{ width: 80, height: 26, display: 'inline-block' }} />
              : formatINR(overview?.plan_credits ?? 0)}
          </p>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: '#7c3aed' }}>Available Credits</p>
        </div>
        <button
          className="wa-btn wa-btn--outline"
          style={{ borderColor: '#6366f1', color: '#6366f1', flexShrink: 0 }}
          onClick={() => { setShowAdd(true); setShowWithdraw(false) }}
        >
          <i className="fa-solid fa-plus" /> Recharge
        </button>
      </div>

      {/* ── Main content row: Transactions + Linked Accounts ── */}
      <div className="wa-content-row">

        {/* Transactions card */}
        <div className="wa-card wa-card--wide">
          <div className="wa-card-header">
            <h2 className="wa-card-title">Transactions</h2>
            <span className="wa-card-sub">{loading ? '—' : `${total} total`}</span>
          </div>

          {/* Wallet filter */}
          <div style={{ display: 'flex', gap: 8, padding: '0 0 12px', borderBottom: '1px solid #f3f4f6', marginBottom: 12 }}>
            {([
              { key: 'all',      label: 'All Wallets', icon: 'fa-layer-group' },
              { key: 'plan',     label: 'Plan Credits', icon: 'fa-coins' },
              { key: 'earnings', label: 'Earnings',     icon: 'fa-building-columns' },
            ] as { key: WalletFilter; label: string; icon: string }[]).map(w => (
              <button
                key={w.key}
                type="button"
                onClick={() => setWalletFilter(w.key)}
                style={{
                  padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                  border: `1.5px solid ${walletFilter === w.key ? '#6366f1' : '#e5e7eb'}`,
                  background: walletFilter === w.key ? '#eef2ff' : '#fff',
                  color: walletFilter === w.key ? '#4338ca' : '#6b7280',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                }}
              >
                <i className={`fa-solid ${w.icon}`} style={{ fontSize: 11 }} />
                {w.label}
              </button>
            ))}
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
                  <p className="wa-tx-name" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    {tx.description}
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 20, letterSpacing: 0.4,
                      background: tx.wallet === 'plan' ? '#ede9fe' : '#f0fdf4',
                      color:      tx.wallet === 'plan' ? '#6d28d9'  : '#15803d',
                      border:     `1px solid ${tx.wallet === 'plan' ? '#c4b5fd' : '#bbf7d0'}`,
                    }}>
                      <i className={`fa-solid ${tx.wallet === 'plan' ? 'fa-coins' : 'fa-building-columns'}`} style={{ marginRight: 3, fontSize: 9 }} />
                      {tx.wallet === 'plan' ? 'Plan Credits' : 'Earnings'}
                    </span>
                  </p>
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
              {/* Next Payout date — temporarily hidden
              <div className="wa-schedule-row">
                <div className="wa-schedule-icon"><i className="fa-solid fa-calendar-check" /></div>
                <div className="wa-schedule-info">
                  <p className="wa-schedule-label">Next Payout</p>
                  <p className="wa-schedule-val">
                    {payoutLoading ? '—' : payout?.next_payout_date
                      ? new Date(payout.next_payout_date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '—'}
                  </p>
                </div>
                <span className="wa-schedule-badge wa-schedule-badge--green">Scheduled</span>
              </div>
              */}
              <div className="wa-schedule-row">
                <div className="wa-schedule-icon"><i className="fa-solid fa-sack-dollar" /></div>
                <div className="wa-schedule-info">
                  <p className="wa-schedule-label">Pending Payout</p>
                  <p className="wa-schedule-val">
                    {payoutLoading ? '—' : formatINR(payout?.pending_booking_net ?? 0)}
                  </p>
                </div>
              </div>
              <div className="wa-schedule-row">
                <div className="wa-schedule-icon"><i className="fa-solid fa-mobile-screen" /></div>
                <div className="wa-schedule-info">
                  <p className="wa-schedule-label">Payout UPI</p>
                  <p className="wa-schedule-val">
                    {payoutLoading ? '—' : payout?.payout_upi ?? 'No UPI linked'}
                  </p>
                </div>
              </div>
              <div className="wa-schedule-row">
                <div className="wa-schedule-icon"><i className="fa-solid fa-percent" /></div>
                <div className="wa-schedule-info">
                  <p className="wa-schedule-label">Platform Fee</p>
                  <p className="wa-schedule-val">
                    {payoutLoading ? '—' : `${payout?.platform_commission_pct ?? 0}%`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mini summary */}
          <div className="wa-card wa-summary-card">
            <div className="wa-card-header">
              <h2 className="wa-card-title">
                {new Date().toLocaleString('en-IN', { month: 'long' })} Summary
              </h2>
            </div>
            <div className="wa-summary-rows">
              {payoutLoading ? (
                [1, 2, 3].map(n => (
                  <div key={n} className="wa-summary-row">
                    <span className="wa-summary-label"><span className="ea-kpi-skel" style={{ width: 120, height: 13, display: 'inline-block' }} /></span>
                    <span className="wa-summary-val"><span className="ea-kpi-skel" style={{ width: 70, height: 13, display: 'inline-block' }} /></span>
                  </div>
                ))
              ) : (
                <>
                  <div className="wa-summary-row">
                    <span className="wa-summary-label">Gross Earnings</span>
                    <span className="wa-summary-val" style={{ color: '#16a34a' }}>{formatINR(payout?.gross_paid_this_month ?? 0)}</span>
                  </div>
                  <div className="wa-summary-row">
                    <span className="wa-summary-label">Platform Fee ({payout?.platform_commission_pct ?? 0}%)</span>
                    <span className="wa-summary-val" style={{ color: '#f97316' }}>−{formatINR(payout?.platform_commission_this_month ?? 0)}</span>
                  </div>
                  <div className="wa-summary-row">
                    <span className="wa-summary-label wa-summary-label--bold">Net Paid</span>
                    <span className="wa-summary-val" style={{ color: '#16a34a', fontWeight: 800 }}>{formatINR(payout?.net_paid_this_month ?? 0)}</span>
                  </div>
                </>
              )}
            </div>
            {/* Download Statement — temporarily hidden
            <button className="wa-dl-summary-btn"><i className="fa-solid fa-download" /> Download Statement</button>
            */}
          </div>

        </div>
      </div>

    </div>
  )
}
