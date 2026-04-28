import { useState, useEffect } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import styles from './Profile.module.css'

export default function Profile() {
  const { user } = useAuth()
  const toast = useToast()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [allergyInput, setAllergyInput] = useState('')
  const [conditionInput, setConditionInput] = useState('')

  useEffect(() => {
    api.get('/profile').then(r => { setProfile(r.data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const save = async e => {
    e.preventDefault(); setSaving(true)
    try {
      const r = await api.put('/profile', profile)
      setProfile(r.data)
      toast('Profile saved!')
    } catch { toast('Failed to save', 'error') }
    setSaving(false)
  }

  const set = (key, val) => setProfile(p => ({ ...p, [key]: val }))

  const addTag = (key, val, clearFn) => {
    if (!val.trim()) return
    const current = profile[key] || []
    if (!current.includes(val.trim())) set(key, [...current, val.trim()])
    clearFn('')
  }

  const removeTag = (key, val) => set(key, (profile[key] || []).filter(x => x !== val))

  if (loading) return <div style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>Loading profile...</div>

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>👤 Health Profile</h1>
        <p>Your complete medical profile — used to personalize AI recommendations</p>
      </div>

      <form onSubmit={save} className={styles.form}>
        {/* PERSONAL */}
        <div className={styles.section}>
          <h3>👤 Personal Info</h3>
          <div className={styles.grid2}>
            <div className={styles.field}>
              <label>Name</label>
              <input value={user?.name || ''} disabled />
            </div>
            <div className={styles.field}>
              <label>Email</label>
              <input value={user?.email || ''} disabled />
            </div>
            <div className={styles.field}>
              <label>Blood Type</label>
              <select value={profile?.bloodType || 'Unknown'} onChange={e => set('bloodType', e.target.value)}>
                {['A+','A-','B+','B-','AB+','AB-','O+','O-','Unknown'].map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label>Height (cm)</label>
              <input type="number" value={profile?.height || ''} onChange={e => set('height', e.target.value)} placeholder="170" />
            </div>
            <div className={styles.field}>
              <label>Weight (kg)</label>
              <input type="number" value={profile?.weight || ''} onChange={e => set('weight', e.target.value)} placeholder="70" />
            </div>
          </div>
        </div>

        {/* LIFESTYLE */}
        <div className={styles.section}>
          <h3>🏃 Lifestyle</h3>
          <div className={styles.grid3}>
            <div className={styles.field}>
              <label>Smoking Status</label>
              <select value={profile?.smokingStatus || 'never'} onChange={e => set('smokingStatus', e.target.value)}>
                <option value="never">Never smoked</option>
                <option value="former">Former smoker</option>
                <option value="current">Current smoker</option>
              </select>
            </div>
            <div className={styles.field}>
              <label>Alcohol Use</label>
              <select value={profile?.alcoholUse || 'none'} onChange={e => set('alcoholUse', e.target.value)}>
                <option value="none">None</option>
                <option value="occasional">Occasional</option>
                <option value="moderate">Moderate</option>
                <option value="heavy">Heavy</option>
              </select>
            </div>
            <div className={styles.field}>
              <label>Exercise Frequency</label>
              <select value={profile?.exerciseFrequency || 'none'} onChange={e => set('exerciseFrequency', e.target.value)}>
                <option value="none">None</option>
                <option value="1-2/week">1–2× per week</option>
                <option value="3-4/week">3–4× per week</option>
                <option value="5+/week">5+× per week</option>
              </select>
            </div>
          </div>
        </div>

        {/* ALLERGIES */}
        <div className={styles.section}>
          <h3>⚠️ Allergies</h3>
          <div className={styles.tagInput}>
            <input value={allergyInput} onChange={e => setAllergyInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag('allergies', allergyInput, setAllergyInput))}
              placeholder="Type allergy and press Enter (e.g. Penicillin, Peanuts)" />
            <button type="button" onClick={() => addTag('allergies', allergyInput, setAllergyInput)}>Add</button>
          </div>
          <div className={styles.tags}>
            {(profile?.allergies || []).length === 0 ? <span className={styles.noTags}>No allergies listed</span> :
              (profile?.allergies || []).map(a => (
                <span key={a} className={`${styles.tag} ${styles.tagRed}`}>{a} <span onClick={() => removeTag('allergies', a)}>✕</span></span>
              ))
            }
          </div>
        </div>

        {/* CHRONIC CONDITIONS */}
        <div className={styles.section}>
          <h3>🏥 Chronic Conditions</h3>
          <div className={styles.tagInput}>
            <input value={conditionInput} onChange={e => setConditionInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag('chronicConditions', conditionInput, setConditionInput))}
              placeholder="Type condition and press Enter (e.g. Type 2 Diabetes)" />
            <button type="button" onClick={() => addTag('chronicConditions', conditionInput, setConditionInput)}>Add</button>
          </div>
          <div className={styles.tags}>
            {(profile?.chronicConditions || []).length === 0 ? <span className={styles.noTags}>No conditions listed</span> :
              (profile?.chronicConditions || []).map(c => (
                <span key={c} className={`${styles.tag} ${styles.tagBlue}`}>{c} <span onClick={() => removeTag('chronicConditions', c)}>✕</span></span>
              ))
            }
          </div>
        </div>

        {/* EMERGENCY CONTACT */}
        <div className={styles.section}>
          <h3>🆘 Emergency Contact</h3>
          <div className={styles.grid2}>
            <div className={styles.field}>
              <label>Contact Name</label>
              <input value={profile?.emergencyContact || ''} onChange={e => set('emergencyContact', e.target.value)} placeholder="Jane Doe" />
            </div>
            <div className={styles.field}>
              <label>Phone Number</label>
              <input value={profile?.emergencyPhone || ''} onChange={e => set('emergencyPhone', e.target.value)} placeholder="+1 234 567 8900" />
            </div>
            <div className={styles.field}>
              <label>Insurance Provider</label>
              <input value={profile?.insuranceProvider || ''} onChange={e => set('insuranceProvider', e.target.value)} placeholder="e.g. Blue Cross" />
            </div>
          </div>
        </div>

        {/* NOTES */}
        <div className={styles.section}>
          <h3>📝 Additional Notes</h3>
          <textarea rows={4} value={profile?.notes || ''} onChange={e => set('notes', e.target.value)} placeholder="Any other relevant medical information..." className={styles.textarea} />
        </div>

        <button type="submit" className={styles.saveBtn} disabled={saving}>
          {saving ? 'Saving...' : '💾 Save Profile'}
        </button>
      </form>
    </div>
  )
}
