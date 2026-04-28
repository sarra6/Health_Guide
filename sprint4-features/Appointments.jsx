import { useState, useEffect } from 'react'
import api from '../services/api'
import { useToast } from '../components/Toast'
import styles from './CRUD.module.css'

const STATUS_COLORS = { upcoming:'#3B82F6', completed:'#10B981', cancelled:'#EF4444' }

export default function Appointments() {
  const toast = useToast()
  const [appts, setAppts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ doctorName:'', specialty:'', date:'', location:'', notes:'' })
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState('upcoming')

  const load = async () => {
    try { const r = await api.get('/appointments'); setAppts(r.data) }
    catch { toast('Failed to load appointments', 'error') }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const save = async e => {
    e.preventDefault(); setSaving(true)
    try {
      await api.post('/appointments', form)
      toast('Appointment scheduled!')
      setModal(false); setForm({ doctorName:'', specialty:'', date:'', location:'', notes:'' })
      load()
    } catch { toast('Failed to save', 'error') }
    setSaving(false)
  }

  const updateStatus = async (id, status) => {
    try { await api.patch(`/appointments/${id}`, { status }); toast(`Marked as ${status}`); load() }
    catch { toast('Error', 'error') }
  }

  const remove = async (id) => {
    if (!confirm('Delete this appointment?')) return
    try { await api.delete(`/appointments/${id}`); toast('Deleted'); load() }
    catch { toast('Error', 'error') }
  }

  const filtered = appts.filter(a => a.status === filter)
  const upcoming = appts.filter(a => a.status === 'upcoming')
  const daysUntil = (date) => Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24))

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div><h1>📅 Appointments</h1><p>Schedule and track your doctor appointments</p></div>
        <button className={styles.addBtn} onClick={() => setModal(true)}>+ Schedule Appointment</button>
      </div>

      {/* UPCOMING COUNTDOWN */}
      {upcoming.length > 0 && (
        <div className={styles.nextAppt}>
          <div className={styles.nextLabel}>🔔 Next Appointment</div>
          <div className={styles.nextInfo}>
            <strong>{upcoming[0].doctorName}</strong>
            {upcoming[0].specialty && <span> — {upcoming[0].specialty}</span>}
          </div>
          <div className={styles.nextDate}>
            {new Date(upcoming[0].date).toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
            <span className={styles.countdown}>{daysUntil(upcoming[0].date)} days away</span>
          </div>
          {upcoming[0].location && <div className={styles.nextLoc}>📍 {upcoming[0].location}</div>}
        </div>
      )}

      {/* FILTER TABS */}
      <div className={styles.filterTabs}>
        {['upcoming','completed','cancelled'].map(s => (
          <button key={s} className={`${styles.filterTab} ${filter===s ? styles.filterActive : ''}`} onClick={() => setFilter(s)} style={filter===s ? { borderColor: STATUS_COLORS[s], color: STATUS_COLORS[s] } : {}}>
            {s.charAt(0).toUpperCase()+s.slice(1)} ({appts.filter(a => a.status===s).length})
          </button>
        ))}
      </div>

      {loading ? <div className={styles.loading}>Loading...</div> : (
        filtered.length === 0 ? <div className={styles.empty}>No {filter} appointments.</div> : (
          <div className={styles.grid}>
            {filtered.map(a => (
              <div key={a.id} className={styles.card}>
                <div className={styles.cardTop}>
                  <div>
                    <h4>{a.doctorName}</h4>
                    {a.specialty && <p className={styles.small}>{a.specialty}</p>}
                  </div>
                  <span className={styles.statusBadge} style={{ background: STATUS_COLORS[a.status]+'22', color: STATUS_COLORS[a.status] }}>{a.status}</span>
                </div>
                <p className={styles.apptDate}>🗓️ {new Date(a.date).toLocaleString()}</p>
                {a.location && <p className={styles.small}>📍 {a.location}</p>}
                {a.notes && <p className={styles.notes}>{a.notes}</p>}
                <div className={styles.actions}>
                  {a.status === 'upcoming' && <>
                    <button className={styles.btnGreen} onClick={() => updateStatus(a.id, 'completed')}>✅ Completed</button>
                    <button className={styles.btnRed}   onClick={() => updateStatus(a.id, 'cancelled')}>✕ Cancel</button>
                  </>}
                  <button className={styles.btnGhost} onClick={() => remove(a.id)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {modal && (
        <div className={styles.overlay} onClick={() => setModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <button className={styles.close} onClick={() => setModal(false)}>✕</button>
            <h2>📅 Schedule Appointment</h2>
            <form onSubmit={save}>
              {[
                { name:'doctorName', label:"Doctor's Name *", placeholder:'Dr. Smith', required:true },
                { name:'specialty',  label:'Specialty',        placeholder:'e.g. Cardiologist' },
                { name:'date',       label:'Date & Time *',    type:'datetime-local', required:true },
                { name:'location',   label:'Location',         placeholder:'e.g. City Hospital, Room 204' },
              ].map(f => (
                <div key={f.name} className={styles.field}>
                  <label>{f.label}</label>
                  <input type={f.type||'text'} placeholder={f.placeholder} required={f.required}
                    value={form[f.name]} onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))} />
                </div>
              ))}
              <div className={styles.field}>
                <label>Notes</label>
                <textarea rows={3} placeholder="Reason for visit, questions to ask..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
              </div>
              <button type="submit" className={styles.submitBtn} disabled={saving}>{saving ? 'Saving...' : 'Schedule Appointment'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
