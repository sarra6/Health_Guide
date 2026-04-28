import { useState, useEffect } from 'react'
import api from '../services/api'
import { useToast } from '../components/Toast'
import styles from './CRUD.module.css'

export default function Medications() {
  const toast = useToast()
  const [meds, setMeds] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ name:'', dosage:'', frequency:'', startDate:'', notes:'', active:true })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try { const r = await api.get('/medications'); setMeds(r.data) }
    catch { toast('Failed to load medications', 'error') }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const save = async e => {
    e.preventDefault(); setSaving(true)
    try {
      await api.post('/medications', form)
      toast('Medication added!')
      setModal(false); setForm({ name:'', dosage:'', frequency:'', startDate:'', notes:'', active:true })
      load()
    } catch { toast('Failed to save', 'error') }
    setSaving(false)
  }

  const markTaken = async (id) => {
    try { await api.patch(`/medications/${id}/taken`); toast('Marked as taken ✅'); load() }
    catch { toast('Error', 'error') }
  }

  const remove = async (id) => {
    if (!confirm('Delete this medication?')) return
    try { await api.delete(`/medications/${id}`); toast('Deleted'); load() }
    catch { toast('Error', 'error') }
  }

  const active = meds.filter(m => m.active)
  const inactive = meds.filter(m => !m.active)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div><h1>💊 Medications</h1><p>Track your daily medications and mark them as taken</p></div>
        <button className={styles.addBtn} onClick={() => setModal(true)}>+ Add Medication</button>
      </div>

      {loading ? <div className={styles.loading}>Loading...</div> : (
        <>
          {/* SUMMARY */}
          <div className={styles.summaryRow}>
            <div className={styles.summaryCard} style={{ borderColor:'#10B981' }}>
              <div className={styles.summaryNum} style={{ color:'#10B981' }}>{active.length}</div>
              <div>Active Medications</div>
            </div>
            <div className={styles.summaryCard} style={{ borderColor:'#3B82F6' }}>
              <div className={styles.summaryNum} style={{ color:'#3B82F6' }}>{active.filter(m => m.takenToday).length}</div>
              <div>Taken Today</div>
            </div>
            <div className={styles.summaryCard} style={{ borderColor:'#F59E0B' }}>
              <div className={styles.summaryNum} style={{ color:'#F59E0B' }}>{active.filter(m => !m.takenToday).length}</div>
              <div>Pending Today</div>
            </div>
          </div>

          <h3 className={styles.sectionTitle}>Active Medications</h3>
          {active.length === 0 ? <div className={styles.empty}>No active medications. Add one above.</div> : (
            <div className={styles.grid}>
              {active.map(m => (
                <div key={m.id} className={`${styles.card} ${m.takenToday ? styles.taken : ''}`}>
                  <div className={styles.cardTop}>
                    <div>
                      <h4>{m.name}</h4>
                      <p>{m.dosage} — {m.frequency}</p>
                    </div>
                    <span className={m.takenToday ? styles.badgeGreen : styles.badgeOrange}>
                      {m.takenToday ? '✅ Taken' : '⏳ Pending'}
                    </span>
                  </div>
                  {m.startDate && <p className={styles.small}>Started: {new Date(m.startDate).toLocaleDateString()}</p>}
                  {m.lastTaken && <p className={styles.small}>Last taken: {new Date(m.lastTaken).toLocaleString()}</p>}
                  {m.notes && <p className={styles.notes}>{m.notes}</p>}
                  <div className={styles.actions}>
                    {!m.takenToday && <button className={styles.btnGreen} onClick={() => markTaken(m.id)}>✅ Mark Taken</button>}
                    <button className={styles.btnGhost} onClick={() => remove(m.id)}>🗑️ Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {inactive.length > 0 && (
            <>
              <h3 className={styles.sectionTitle} style={{ marginTop:28 }}>Inactive / Past Medications</h3>
              <div className={styles.grid}>
                {inactive.map(m => (
                  <div key={m.id} className={`${styles.card} ${styles.inactive}`}>
                    <h4>{m.name}</h4>
                    <p>{m.dosage} — {m.frequency}</p>
                    <button className={styles.btnGhost} onClick={() => remove(m.id)}>🗑️ Delete</button>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {modal && (
        <div className={styles.overlay} onClick={() => setModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <button className={styles.close} onClick={() => setModal(false)}>✕</button>
            <h2>💊 Add Medication</h2>
            <form onSubmit={save}>
              {[
                { name:'name', label:'Medication Name *', placeholder:'e.g. Metformin 500mg', required:true },
                { name:'dosage', label:'Dosage', placeholder:'e.g. 500mg' },
                { name:'frequency', label:'Frequency', placeholder:'e.g. Twice daily' },
                { name:'startDate', label:'Start Date', type:'date' },
              ].map(f => (
                <div key={f.name} className={styles.field}>
                  <label>{f.label}</label>
                  <input type={f.type||'text'} placeholder={f.placeholder} required={f.required}
                    value={form[f.name]} onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))} />
                </div>
              ))}
              <div className={styles.field}>
                <label>Notes</label>
                <textarea rows={3} placeholder="Any additional notes..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
              </div>
              <button type="submit" className={styles.submitBtn} disabled={saving}>{saving ? 'Saving...' : 'Add Medication'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
