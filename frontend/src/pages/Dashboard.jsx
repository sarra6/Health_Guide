import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import styles from './Dashboard.module.css'

const RISK_COLORS = { low: '#10B981', moderate: '#F59E0B', high: '#EF4444', critical: '#7C3AED' }

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [overview, setOverview] = useState(null)
  const [trends, setTrends] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeChart, setActiveChart] = useState('bloodPressure')

  useEffect(() => {
    const load = async () => {
      try {
        const [ov, tr, al] = await Promise.all([
          api.get('/stats/overview'),
          api.get('/stats/trends?limit=20'),
          api.get('/stats/alerts')
        ])
        setOverview(ov.data)
        setTrends(tr.data)
        setAlerts(al.data.alerts || [])
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    load()
  }, [])

  const CHARTS = [
    { key: 'bloodPressure', label: '🩸 Blood Pressure', color: '#EF4444', lines: [
      { key: 'systolic', color: '#EF4444', name: 'Systolic' },
      { key: 'diastolic', color: '#F59E0B', name: 'Diastolic' }
    ]},
    { key: 'heartRate',  label: '💓 Heart Rate',    color: '#3B82F6', lines: [{ key: 'heartRate', color: '#3B82F6', name: 'BPM' }] },
    { key: 'glucose',    label: '🩸 Glucose',        color: '#8B5CF6', lines: [{ key: 'glucose',   color: '#8B5CF6', name: 'mg/dL' }] },
    { key: 'weight',     label: '⚖️ Weight',         color: '#10B981', lines: [{ key: 'weight',    color: '#10B981', name: 'kg' }] },
    { key: 'oxygenSaturation', label: '🫁 O2 Sat', color: '#06B6D4', lines: [{ key: 'oxygenSaturation', color: '#06B6D4', name: '%' }] },
    { key: 'cholesterol',label: '🧪 Cholesterol',   color: '#F97316', lines: [{ key: 'cholesterol',color: '#F97316', name: 'mg/dL' }] },
  ]

  const activeChartDef = CHARTS.find(c => c.key === activeChart)

  const riskPieData = (overview?.riskDistribution || []).map(r => ({
    name: r.riskLevel || 'unknown',
    value: parseInt(r.count),
    color: RISK_COLORS[r.riskLevel] || '#94A3B8'
  }))

  const hs = overview?.healthScore

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>📊 Health Dashboard</h1>
          <p>Welcome back, <strong>{user?.name}</strong> — here's your health overview</p>
        </div>
        <button className={styles.addBtn} onClick={() => navigate('/assistant')}>+ Log Vitals</button>
      </div>

      {/* ALERTS */}
      {alerts.length > 0 && (
        <div className={styles.alertsBar}>
          {alerts.map((a, i) => (
            <div key={i} className={`${styles.alert} ${styles[a.type]}`}>
              {a.icon} {a.message}
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className={styles.loading}><div className={styles.spinner}></div><p>Loading your health data...</p></div>
      ) : (
        <>
          {/* STAT CARDS */}
          <div className={styles.statGrid}>
            <StatCard icon="📋" label="Health Records" value={overview?.totalRecords ?? 0} sub="total logged" color="blue" onClick={() => navigate('/assistant')} />
            <StatCard icon="🤖" label="AI Reports" value={overview?.totalReports ?? 0} sub="analyses done" color="purple" onClick={() => navigate('/assistant')} />
            <StatCard icon="💊" label="Active Meds" value={overview?.activeMedications ?? 0} sub="medications" color="green" onClick={() => navigate('/medications')} />
            <StatCard icon="📅" label="Upcoming Appts" value={overview?.upcomingAppointments ?? 0} sub="appointments" color="orange" onClick={() => navigate('/appointments')} />
          </div>

          <div className={styles.row}>
            {/* HEALTH SCORE */}
            <div className={styles.scoreCard}>
              <h3>🎯 Health Score</h3>
              {hs ? (
                <>
                  <div className={styles.scoreCircle} style={{ '--score-color': hs.color }}>
                    <svg viewBox="0 0 120 120" className={styles.scoreSvg}>
                      <circle cx="60" cy="60" r="50" fill="none" stroke="#E2E8F0" strokeWidth="10" />
                      <circle cx="60" cy="60" r="50" fill="none" stroke={hs.color} strokeWidth="10"
                        strokeDasharray={`${(hs.score / 100) * 314} 314`}
                        strokeLinecap="round" transform="rotate(-90 60 60)" />
                    </svg>
                    <div className={styles.scoreInner}>
                      <div className={styles.scoreNum} style={{ color: hs.color }}>{hs.score}</div>
                      <div className={styles.scoreGrade} style={{ color: hs.color }}>{hs.grade}</div>
                    </div>
                  </div>
                  <div className={styles.scoreStatus} style={{ color: hs.color }}>{hs.status}</div>
                  {hs.factors?.length > 0 && (
                    <div className={styles.factors}>
                      <div className={styles.factorsLabel}>Deductions:</div>
                      {hs.factors.map((f, i) => (
                        <div key={i} className={styles.factor}>
                          <span>{f.label}</span>
                          <span style={{ color: '#EF4444' }}>{f.impact}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className={styles.noData}>
                  <p>No vitals logged yet.</p>
                  <button className={styles.linkBtn} onClick={() => navigate('/assistant')}>Log vitals →</button>
                </div>
              )}
            </div>

            {/* RISK PIE */}
            <div className={styles.pieCard}>
              <h3>🎲 Risk Distribution</h3>
              {riskPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={riskPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" label={({ name, value }) => `${name} (${value})`} labelLine={false}>
                      {riskPieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className={styles.noData}><p>No AI reports yet.</p><button className={styles.linkBtn} onClick={() => navigate('/assistant')}>Run analysis →</button></div>
              )}
            </div>

            {/* LATEST VITALS */}
            <div className={styles.vitalsCard}>
              <h3>🩺 Latest Vitals</h3>
              {overview?.latestVitals ? (
                <div className={styles.vitalsList}>
                  {[
                    { label:'Blood Pressure', value: overview.latestVitals.bloodPressureSystolic ? `${overview.latestVitals.bloodPressureSystolic}/${overview.latestVitals.bloodPressureDiastolic} mmHg` : '—', icon:'🩸' },
                    { label:'Heart Rate',  value: overview.latestVitals.heartRate ? `${overview.latestVitals.heartRate} bpm` : '—', icon:'💓' },
                    { label:'O2 Sat',      value: overview.latestVitals.oxygenSaturation ? `${overview.latestVitals.oxygenSaturation}%` : '—', icon:'🫁' },
                    { label:'Temperature', value: overview.latestVitals.temperature ? `${overview.latestVitals.temperature}°C` : '—', icon:'🌡️' },
                    { label:'Weight',      value: overview.latestVitals.weight ? `${overview.latestVitals.weight} kg` : '—', icon:'⚖️' },
                    { label:'Glucose',     value: overview.latestVitals.glucose ? `${overview.latestVitals.glucose} mg/dL` : '—', icon:'🧪' },
                  ].map(v => (
                    <div key={v.label} className={styles.vitalRow}>
                      <span>{v.icon} {v.label}</span>
                      <strong>{v.value}</strong>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.noData}><p>No vitals recorded yet.</p></div>
              )}
            </div>
          </div>

          {/* TRENDS CHART */}
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h3>📈 Health Trends</h3>
              <div className={styles.chartTabs}>
                {CHARTS.map(c => (
                  <button key={c.key} className={`${styles.chartTab} ${activeChart === c.key ? styles.chartTabActive : ''}`} onClick={() => setActiveChart(c.key)} style={activeChart === c.key ? { borderColor: c.color, color: c.color } : {}}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            {trends.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={trends} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    {activeChartDef.lines.map(l => (
                      <linearGradient key={l.key} id={`grad_${l.key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={l.color} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={l.color} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 13 }} />
                  <Legend />
                  {activeChartDef.lines.map(l => (
                    <Area key={l.key} type="monotone" dataKey={l.key} name={l.name} stroke={l.color} strokeWidth={2.5} fill={`url(#grad_${l.key})`} connectNulls dot={false} />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.noData} style={{ padding: '60px 0' }}>
                <p>No historical data yet. Start logging your vitals to see trends.</p>
                <button className={styles.linkBtn} onClick={() => navigate('/assistant')}>Log vitals →</button>
              </div>
            )}
          </div>

          {/* RECORDS BAR CHART */}
          {trends.length > 0 && (
            <div className={styles.chartCard}>
              <h3>📅 Records Per Month</h3>
              <MonthlyChart data={trends} />
            </div>
          )}
        </>
      )}
    </div>
  )
}

function StatCard({ icon, label, value, sub, color, onClick }) {
  return (
    <div className={`${styles.statCard} ${styles[color]}`} onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className={styles.statIcon}>{icon}</div>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statSub}>{sub}</div>
    </div>
  )
}

function MonthlyChart({ data }) {
  const monthly = data.reduce((acc, r) => {
    const month = new Date(r.fullDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    acc[month] = (acc[month] || 0) + 1
    return acc
  }, {})
  const chartData = Object.entries(monthly).map(([month, count]) => ({ month, count }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
        <Tooltip contentStyle={{ borderRadius: 10, fontSize: 13 }} />
        <Bar dataKey="count" name="Records" fill="#3B82F6" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
