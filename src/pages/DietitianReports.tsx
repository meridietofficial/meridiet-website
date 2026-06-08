import { useState } from 'react'

type Period = 'week' | 'month' | 'quarter' | 'year'

const MONTHLY_SESSIONS = [
  { month: 'Jan', count: 38 },
  { month: 'Feb', count: 45 },
  { month: 'Mar', count: 52 },
  { month: 'Apr', count: 48 },
  { month: 'May', count: 61 },
  { month: 'Jun', count: 29 },
]

const GOAL_DIST = [
  { label: 'Weight Loss',         count: 12, color: '#3b82f6', pct: 38 },
  { label: 'Diabetes Management', count: 6,  color: '#f97316', pct: 19 },
  { label: 'PCOS Management',     count: 5,  color: '#a855f7', pct: 16 },
  { label: 'Muscle Gain',         count: 5,  color: '#22c55e', pct: 16 },
  { label: 'Sports Nutrition',    count: 3,  color: '#06b6d4', pct: 9  },
  { label: 'Other',               count: 1,  color: '#d1d5db', pct: 3  },
]

const CLIENT_PROGRESS = [
  { name: 'Anjali Singh',  initials: 'AS', goal: 'Weight Loss',      progress: 88, sessions: 12, status: 'active',   change: '+12%' },
  { name: 'Rohan Mehta',   initials: 'RM', goal: 'Muscle Gain',      progress: 72, sessions: 9,  status: 'active',   change: '+8%'  },
  { name: 'Sneha Iyer',    initials: 'SI', goal: 'PCOS Management',  progress: 55, sessions: 6,  status: 'active',   change: '+15%' },
  { name: 'Vikram Singh',  initials: 'VS', goal: 'Weight Loss',      progress: 30, sessions: 4,  status: 'active',   change: '+5%'  },
  { name: 'Priya Sharma',  initials: 'PS', goal: 'Diabetes Mgmt',    progress: 65, sessions: 14, status: 'inactive', change: '+10%' },
  { name: 'Arjun Kapoor',  initials: 'AK', goal: 'Sports Nutrition', progress: 95, sessions: 20, status: 'inactive', change: '+22%' },
]

const RECENT_REPORTS = [
  { id: 1, title: 'Monthly Summary – May 2026',        type: 'Summary',  date: 'Jun 1, 2026',  size: '1.2 MB', icon: 'fa-solid fa-file-lines',   color: '#3b82f6' },
  { id: 2, title: 'Client Progress – Q2 2026',         type: 'Progress', date: 'Jun 1, 2026',  size: '890 KB', icon: 'fa-solid fa-chart-line',   color: '#16a34a' },
  { id: 3, title: 'Earnings Report – May 2026',        type: 'Earnings', date: 'May 31, 2026', size: '650 KB', icon: 'fa-solid fa-sack-dollar',   color: '#f97316' },
  { id: 4, title: 'Diet Plan Performance – Apr 2026',  type: 'Plans',    date: 'May 5, 2026',  size: '780 KB', icon: 'fa-solid fa-bowl-food',    color: '#a855f7' },
  { id: 5, title: 'Monthly Summary – Apr 2026',        type: 'Summary',  date: 'May 1, 2026',  size: '1.1 MB', icon: 'fa-solid fa-file-lines',   color: '#3b82f6' },
  { id: 6, title: 'Consultation Stats – Q1 2026',      type: 'Summary',  date: 'Apr 1, 2026',  size: '920 KB', icon: 'fa-solid fa-clipboard-list', color: '#06b6d4' },
]

const maxSessions = Math.max(...MONTHLY_SESSIONS.map(m => m.count))

export default function DietitianReports() {
  const [period, setPeriod] = useState<Period>('month')

  const periodStats: Record<Period, { sessions: string; clients: string; revenue: string; rating: string }> = {
    week:    { sessions: '14', clients: '6',  revenue: '₹7,200',  rating: '4.9' },
    month:   { sessions: '61', clients: '6',  revenue: '₹28,450', rating: '4.8' },
    quarter: { sessions: '158', clients: '8', revenue: '₹74,200', rating: '4.8' },
    year:    { sessions: '530', clients: '12', revenue: '₹2,34,000', rating: '4.9' },
  }

  const stats = periodStats[period]

  return (
    <div className="rep-root">

      {/* ── Header ── */}
      <div className="rep-header">
        <div>
          <h1 className="rep-title">Reports</h1>
          <p className="rep-subtitle">Overview of your practice performance, client progress and earnings</p>
        </div>
        <div className="rep-header-right">
          <div className="rep-period-toggle">
            {(['week', 'month', 'quarter', 'year'] as Period[]).map(p => (
              <button
                key={p}
                className={`rep-period-btn${period === p ? ' rep-period-btn--active' : ''}`}
                onClick={() => setPeriod(p)}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
          <button className="rep-export-btn">
            <i className="fa-solid fa-download" /> Export
          </button>
        </div>
      </div>

      {/* ── KPI stat cards ── */}
      <div className="rep-kpis">
        <div className="rep-kpi rep-kpi--blue">
          <div className="rep-kpi-icon-wrap rep-kpi-icon--blue">
            <i className="fa-solid fa-calendar-check" />
          </div>
          <div>
            <p className="rep-kpi-label">Total Sessions</p>
            <p className="rep-kpi-val">{stats.sessions}</p>
            <p className="rep-kpi-sub rep-sub--up">↗ 18% vs last {period}</p>
          </div>
        </div>
        <div className="rep-kpi rep-kpi--green">
          <div className="rep-kpi-icon-wrap rep-kpi-icon--green">
            <i className="fa-solid fa-users" />
          </div>
          <div>
            <p className="rep-kpi-label">Active Clients</p>
            <p className="rep-kpi-val">{stats.clients}</p>
            <p className="rep-kpi-sub">2 new this {period}</p>
          </div>
        </div>
        <div className="rep-kpi rep-kpi--orange">
          <div className="rep-kpi-icon-wrap rep-kpi-icon--orange">
            <i className="fa-solid fa-sack-dollar" />
          </div>
          <div>
            <p className="rep-kpi-label">Revenue</p>
            <p className="rep-kpi-val">{stats.revenue}</p>
            <p className="rep-kpi-sub rep-sub--up">↗ 12% vs last {period}</p>
          </div>
        </div>
        <div className="rep-kpi rep-kpi--purple">
          <div className="rep-kpi-icon-wrap rep-kpi-icon--purple">
            <i className="fa-solid fa-star" />
          </div>
          <div>
            <p className="rep-kpi-label">Avg Rating</p>
            <p className="rep-kpi-val">{stats.rating} <span className="rep-kpi-star">★</span></p>
            <p className="rep-kpi-sub">From 24 reviews</p>
          </div>
        </div>
      </div>

      {/* ── Charts row ── */}
      <div className="rep-charts-row">

        {/* Sessions bar chart */}
        <div className="rep-card rep-card--wide">
          <div className="rep-card-header">
            <h2 className="rep-card-title">Monthly Sessions</h2>
            <span className="rep-card-sub">Jan – Jun 2026</span>
          </div>
          <div className="rep-bar-chart">
            {MONTHLY_SESSIONS.map(m => (
              <div key={m.month} className="rep-bar-col">
                <span className="rep-bar-val">{m.count}</span>
                <div className="rep-bar-track">
                  <div
                    className="rep-bar-fill"
                    style={{ height: `${(m.count / maxSessions) * 100}%` }}
                  />
                </div>
                <span className="rep-bar-label">{m.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Goal distribution */}
        <div className="rep-card">
          <div className="rep-card-header">
            <h2 className="rep-card-title">Client Goals</h2>
            <span className="rep-card-sub">32 total clients</span>
          </div>
          <div className="rep-goal-list">
            {GOAL_DIST.map(g => (
              <div key={g.label} className="rep-goal-row">
                <span className="rep-goal-dot" style={{ background: g.color }} />
                <span className="rep-goal-label">{g.label}</span>
                <div className="rep-goal-bar-bg">
                  <div className="rep-goal-bar-fill" style={{ width: `${g.pct}%`, background: g.color }} />
                </div>
                <span className="rep-goal-count">{g.count}</span>
                <span className="rep-goal-pct">{g.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Performance metrics ── */}
      <div className="rep-charts-row">
        <div className="rep-card">
          <div className="rep-card-header">
            <h2 className="rep-card-title">Quick Performance Metrics</h2>
          </div>
          <div className="rep-metrics-grid">
            {[
              { label: 'Session Completion Rate', val: '94%',  bar: 94, color: '#16a34a' },
              { label: 'Client Retention Rate',   val: '83%',  bar: 83, color: '#3b82f6' },
              { label: 'Follow-Up Response Rate', val: '78%',  bar: 78, color: '#a855f7' },
              { label: 'Plan Compliance Rate',    val: '71%',  bar: 71, color: '#f97316' },
            ].map(m => (
              <div key={m.label} className="rep-metric">
                <div className="rep-metric-top">
                  <span className="rep-metric-label">{m.label}</span>
                  <span className="rep-metric-val" style={{ color: m.color }}>{m.val}</span>
                </div>
                <div className="rep-metric-bar-bg">
                  <div className="rep-metric-bar-fill" style={{ width: `${m.bar}%`, background: m.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Consultation type split */}
        <div className="rep-card">
          <div className="rep-card-header">
            <h2 className="rep-card-title">Session Types</h2>
            <span className="rep-card-sub">This month</span>
          </div>
          <div className="rep-type-list">
            {[
              { label: 'Video Call',  count: 42, pct: 69, color: '#3b82f6', icon: 'fa-solid fa-video' },
              { label: 'In-Person',   count: 11, pct: 18, color: '#16a34a', icon: 'fa-solid fa-location-dot' },
              { label: 'Chat / Text', count: 8,  pct: 13, color: '#f97316', icon: 'fa-solid fa-comment' },
            ].map(t => (
              <div key={t.label} className="rep-type-row">
                <div className="rep-type-icon-wrap" style={{ background: t.color + '18', color: t.color }}>
                  <i className={t.icon} />
                </div>
                <div className="rep-type-info">
                  <div className="rep-type-top">
                    <span className="rep-type-label">{t.label}</span>
                    <span className="rep-type-count">{t.count} sessions</span>
                  </div>
                  <div className="rep-metric-bar-bg">
                    <div className="rep-metric-bar-fill" style={{ width: `${t.pct}%`, background: t.color }} />
                  </div>
                </div>
                <span className="rep-type-pct" style={{ color: t.color }}>{t.pct}%</span>
              </div>
            ))}
          </div>
          <div className="rep-type-total">
            <i className="fa-solid fa-calendar-days" /> 61 total sessions in June 2026
          </div>
        </div>
      </div>

      {/* ── Client progress table ── */}
      <div className="rep-card">
        <div className="rep-card-header">
          <h2 className="rep-card-title">Client Progress Overview</h2>
          <button className="rep-card-link">View All Clients</button>
        </div>
        <div className="rep-table-wrap">
          <table className="rep-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Goal</th>
                <th>Sessions</th>
                <th>Progress</th>
                <th>Change</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {CLIENT_PROGRESS.map(c => (
                <tr key={c.name}>
                  <td>
                    <div className="rep-client-cell">
                      <div className="rep-table-avatar">{c.initials}</div>
                      <span className="rep-table-name">{c.name}</span>
                    </div>
                  </td>
                  <td><span className="rep-table-goal">{c.goal}</span></td>
                  <td><span className="rep-table-num">{c.sessions}</span></td>
                  <td>
                    <div className="rep-table-progress">
                      <div className="rep-mini-bar-bg">
                        <div
                          className="rep-mini-bar-fill"
                          style={{ width: `${c.progress}%`, background: c.progress >= 75 ? '#16a34a' : c.progress >= 50 ? '#3b82f6' : '#f97316' }}
                        />
                      </div>
                      <span className="rep-mini-pct">{c.progress}%</span>
                    </div>
                  </td>
                  <td><span className="rep-change">{c.change}</span></td>
                  <td>
                    <span className={`rep-table-status rep-table-status--${c.status}`}>
                      {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Recent reports ── */}
      <div className="rep-card">
        <div className="rep-card-header">
          <h2 className="rep-card-title">Generated Reports</h2>
          <button className="rep-generate-btn"><i className="fa-solid fa-plus" /> Generate New</button>
        </div>
        <div className="rep-report-list">
          {RECENT_REPORTS.map(r => (
            <div key={r.id} className="rep-report-row">
              <div className="rep-report-icon-wrap" style={{ background: r.color + '18', color: r.color }}>
                <i className={r.icon} />
              </div>
              <div className="rep-report-info">
                <p className="rep-report-name">{r.title}</p>
                <p className="rep-report-meta">{r.type} · {r.date} · {r.size}</p>
              </div>
              <div className="rep-report-actions">
                <button className="rep-report-btn" title="Preview"><i className="fa-solid fa-eye" /></button>
                <button className="rep-report-btn" title="Share"><i className="fa-solid fa-share-nodes" /></button>
                <button className="rep-report-btn rep-report-btn--dl" title="Download">
                  <i className="fa-solid fa-download" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
