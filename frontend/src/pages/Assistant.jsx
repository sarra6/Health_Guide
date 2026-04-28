import { useState, useRef, useEffect } from 'react'
import api from '../services/api'
import { Send, Plus, X, RefreshCw } from 'lucide-react'
import styles from './Assistant.module.css'

const QUICK_SYMPTOMS = ['Headache','Fever','Fatigue','Cough','Nausea','Chest pain','Shortness of breath','Dizziness','Abdominal pain','Joint pain']

export default function Assistant() {
  const [tab, setTab] = useState('chat')

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>🤖 Smart Health Assistant</h1>
        <p>Analyze symptoms, chat with AI, and get personalized health recommendations</p>
      </div>
      <div className={styles.tabs}>
        {['chat','symptoms','vitals','reports'].map(t => (
          <button key={t} className={`${styles.tab} ${tab===t ? styles.activeTab : ''}`} onClick={() => setTab(t)}>
            {t === 'chat' ? '💬 AI Chat' : t === 'symptoms' ? '🩺 Symptom Checker' : t === 'vitals' ? '📊 Vitals Analysis' : '📋 My Reports'}
          </button>
        ))}
      </div>
      {tab === 'chat' && <ChatTab />}
      {tab === 'symptoms' && <SymptomsTab />}
      {tab === 'vitals' && <VitalsTab />}
      {tab === 'reports' && <ReportsTab />}
    </div>
  )
}

/* ---- CHAT TAB ---- */
function ChatTab() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m HealthGuide AI. I can help you understand symptoms, explain medical terms, and provide health guidance.\n\n⚠️ I provide informational guidance only. Always consult a qualified healthcare professional.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const startSession = async () => {
    try {
      const res = await api.post('/chat/session', { title: 'Health Consultation' })
      setSessionId(res.data.sessionId)
      return res.data.sessionId
    } catch { return null }
  }

  const send = async () => {
    if (!input.trim() || loading) return
    const msg = input.trim()
    setInput('')
    setMessages(m => [...m, { role: 'user', content: msg }])
    setLoading(true)

    try {
      let sid = sessionId
      if (!sid) sid = await startSession()
      const res = await api.post('/chat/message', { sessionId: sid, message: msg })
      setMessages(m => [...m, { role: 'assistant', content: res.data.response }])
      if (res.data.triage?.triage !== 'routine') {
        setMessages(m => [...m, { role: 'triage', content: res.data.triage.message, level: res.data.triage.triage }])
      }
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: '❌ Connection error. Please check that the server is running.' }])
    }
    setLoading(false)
  }

  const newSession = () => {
    setSessionId(null)
    setMessages([{ role: 'assistant', content: '✅ New session started. How can I help you today?' }])
  }

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <div><strong>🤖 HealthGuide AI</strong><div className={styles.online}>● Online</div></div>
        <button className={styles.btnSm} onClick={newSession}>New Session</button>
      </div>
      <div className={styles.messages}>
        {messages.map((m, i) => (
          <div key={i} className={`${styles.message} ${m.role === 'user' ? styles.user : m.role === 'triage' ? styles.triageMsg : styles.assistant}`}>
            {m.role === 'triage'
              ? <div className={`${styles.triageAlert} ${styles[m.level]}`}>{m.content}</div>
              : <div className={styles.bubble}>{m.content.split('\n').map((l, j) => <span key={j}>{l}<br /></span>)}</div>
            }
          </div>
        ))}
        {loading && (
          <div className={`${styles.message} ${styles.assistant}`}>
            <div className={styles.bubble}><span className={styles.typing}>●●●</span></div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className={styles.inputArea}>
        <textarea
          className={styles.chatInput}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          placeholder="Describe your symptoms or ask a health question..."
          rows={1}
        />
        <button className={styles.sendBtn} onClick={send} disabled={loading || !input.trim()}>
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}

/* ---- SYMPTOMS TAB ---- */
function SymptomsTab() {
  const [symptoms, setSymptoms] = useState([])
  const [input, setInput] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const add = () => {
    const v = input.trim()
    if (v && !symptoms.includes(v)) setSymptoms(s => [...s, v])
    setInput('')
  }

  const analyze = async () => {
    if (!symptoms.length) { setError('Please add at least one symptom.'); return }
    setError(''); setLoading(true)
    try {
      const res = await api.post('/ai/symptoms', { symptoms })
      setResult(res.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed.')
    }
    setLoading(false)
  }

  return (
    <div className={styles.panel}>
      <h3>🩺 Symptom Analyzer</h3>
      <p className={styles.panelSub}>Add your symptoms for AI-powered analysis of possible conditions and risk levels.</p>

      <div className={styles.inputRow}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} placeholder="e.g. headache, fever..." className={styles.textInput} />
        <button className={styles.btnPrimary} onClick={add}><Plus size={16} /> Add</button>
      </div>

      <div className={styles.quickLabel}>QUICK SELECT</div>
      <div className={styles.quickBtns}>
        {QUICK_SYMPTOMS.map(s => (
          <button key={s} className={styles.quickBtn} onClick={() => { if (!symptoms.includes(s)) setSymptoms(p => [...p, s]) }}>{s}</button>
        ))}
      </div>

      <div className={styles.chips}>
        {symptoms.length === 0 ? <span className={styles.noSymptoms}>No symptoms added yet</span> :
          symptoms.map(s => (
            <span key={s} className={styles.chip}>{s} <X size={14} onClick={() => setSymptoms(p => p.filter(x => x !== s))} /></span>
          ))
        }
      </div>

      {error && <div className={styles.errorMsg}>{error}</div>}
      <button className={styles.btnPrimary} onClick={analyze} disabled={loading}>
        {loading ? 'Analyzing...' : '🔍 Analyze Symptoms'}
      </button>

      {result && <SymptomResult data={result} />}
    </div>
  )
}

function SymptomResult({ data }) {
  const { triage, analysis } = data
  const risk = analysis?.riskLevel || 'low'
  return (
    <div className={styles.result}>
      <div className={styles.resultHeader}>
        <h3>Analysis Results</h3>
        <span className={`${styles.badge} ${styles[`risk_${risk}`]}`}>{risk} risk</span>
      </div>
      {triage?.message && <div className={`${styles.triageAlert} ${styles[triage.triage]}`}>{triage.message}</div>}
      {analysis?.possibleConditions?.length > 0 && (
        <div className={styles.section}>
          <strong>Possible Conditions:</strong>
          <ul>{analysis.possibleConditions.map(c => <li key={c}>{c}</li>)}</ul>
        </div>
      )}
      {analysis?.recommendation && (
        <div className={styles.section}><strong>Recommendation:</strong><p>{analysis.recommendation}</p></div>
      )}
      {analysis?.specialistReferral && <p><strong>Specialist Referral:</strong> {analysis.specialistReferral}</p>}
      <div className={`${styles.triageAlert} ${styles.routine}`} style={{marginTop:12}}>
        ⚕️ <em>{analysis?.disclaimer || 'This does not replace professional medical advice.'}</em>
      </div>
    </div>
  )
}

/* ---- VITALS TAB ---- */
function VitalsTab() {
  const [vitals, setVitals] = useState({})
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fields = [
    { key:'bloodPressureSystolic', label:'BP Systolic (mmHg)', placeholder:'120' },
    { key:'bloodPressureDiastolic', label:'BP Diastolic (mmHg)', placeholder:'80' },
    { key:'heartRate', label:'Heart Rate (bpm)', placeholder:'72' },
    { key:'temperature', label:'Temperature (°C)', placeholder:'37.0' },
    { key:'oxygenSaturation', label:'O2 Saturation (%)', placeholder:'98' },
    { key:'weight', label:'Weight (kg)', placeholder:'70' },
    { key:'height', label:'Height (cm)', placeholder:'170' },
    { key:'glucose', label:'Blood Glucose (mg/dL)', placeholder:'95' },
    { key:'cholesterol', label:'Cholesterol (mg/dL)', placeholder:'180' },
  ]

  const analyze = async () => {
    const filled = Object.fromEntries(Object.entries(vitals).filter(([,v]) => v !== '' && !isNaN(v)).map(([k,v]) => [k, parseFloat(v)]))
    if (!Object.keys(filled).length) { setError('Please enter at least one value.'); return }
    setError(''); setLoading(true)
    try {
      const res = await api.post('/ai/vitals', { vitals: filled })
      setResult(res.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed.')
    }
    setLoading(false)
  }

  return (
    <div className={styles.panel}>
      <h3>📊 Vitals Analysis</h3>
      <p className={styles.panelSub}>Enter your health measurements for AI-powered risk assessment.</p>
      <div className={styles.vitalsGrid}>
        {fields.map(f => (
          <div key={f.key} className={styles.field}>
            <label>{f.label}</label>
            <input type="number" placeholder={f.placeholder} value={vitals[f.key] || ''} onChange={e => setVitals(v => ({ ...v, [f.key]: e.target.value }))} className={styles.textInput} />
          </div>
        ))}
      </div>
      {error && <div className={styles.errorMsg}>{error}</div>}
      <button className={styles.btnPrimary} onClick={analyze} disabled={loading}>{loading ? 'Analyzing...' : '📈 Analyze Vitals'}</button>

      {result && (
        <div className={styles.result}>
          <div className={styles.resultHeader}>
            <h3>Vitals Assessment</h3>
            <span className={`${styles.badge} ${styles[`risk_${result.ruleRecommendations?.overallRiskLevel || 'low'}`]}`}>{result.ruleRecommendations?.overallRiskLevel || 'low'} risk</span>
          </div>
          {result.ruleRecommendations?.urgentCareNeeded && <div className={`${styles.triageAlert} ${styles.emergency}`}>🚨 Urgent care recommended!</div>}
          {result.ruleRecommendations?.summary && <p style={{marginBottom:12}}>{result.ruleRecommendations.summary}</p>}
          {result.ruleRecommendations?.findings?.map((f, i) => (
            <div key={i} className={`${styles.finding} ${styles[`finding_${f.riskLevel}`]}`}>
              <span className={`${styles.badge} ${styles[`risk_${f.riskLevel}`]}`} style={{marginBottom:6,display:'inline-block'}}>{f.riskLevel}</span>
              <p>{f.recommendation}</p>
              {f.specialist && <small>Referral: {f.specialist}</small>}
            </div>
          ))}
          <div className={`${styles.triageAlert} ${styles.routine}`} style={{marginTop:12}}>
            ⚕️ <em>{result.ruleRecommendations?.disclaimer}</em>
          </div>
        </div>
      )}
    </div>
  )
}

/* ---- REPORTS TAB ---- */
function ReportsTab() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/ai/reports')
      setReports(res.data)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h3>📋 My AI Reports</h3>
        <button className={styles.btnSm} onClick={load}><RefreshCw size={14} /> Refresh</button>
      </div>
      {loading ? <p className={styles.loading}>Loading...</p> :
        reports.length === 0 ? <p className={styles.loading}>No reports yet. Use the AI tools above to generate your first report.</p> :
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>Date</th><th>Type</th><th>Prediction</th><th>Risk</th><th>Reviewed</th></tr></thead>
            <tbody>
              {reports.map(r => (
                <tr key={r.id}>
                  <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td><span className={styles.typeBadge}>{r.inputType}</span></td>
                  <td className={styles.predCell}>{r.prediction || '—'}</td>
                  <td><span className={`${styles.badge} ${styles[`risk_${r.riskLevel || 'low'}`]}`}>{r.riskLevel || 'low'}</span></td>
                  <td>{r.reviewedByDoctor ? '✅' : '⏳'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      }
    </div>
  )
}
