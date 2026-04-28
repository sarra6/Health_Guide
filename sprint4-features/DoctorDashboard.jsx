import { useState, useEffect } from 'react'
import api from '../services/api'
import { Users, FileText, Calendar, Pill, Search, RefreshCw, Plus, X, Activity, AlertCircle } from 'lucide-react'
import styles from './DoctorDashboard.module.css'

export default function DoctorDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState(null)
  const [patients, setPatients] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [patientDetails, setPatientDetails] = useState(null)
  const [prescriptions, setPrescriptions] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Prescription form
  const [rxModal, setRxModal] = useState(false)
  const [rxForm, setRxForm] = useState({
    medicationName: '', dosage: '', frequency: '', duration: '', 
    instructions: '', startDate: new Date().toISOString().split('T')[0], endDate: '', notes: ''
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const [statsRes, patientsRes, rxRes, apptRes] = await Promise.all([
        api.get('/doctor/stats'),
        api.get('/doctor/patients'),
        api.get('/doctor/prescriptions'),
        api.get('/doctor/appointments')
      ])
      setStats(statsRes.data)
      setPatients(patientsRes.data)
      setPrescriptions(rxRes.data)
      setAppointments(apptRes.data)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const searchPatients = async (query) => {
    if (!query.trim()) {
      const res = await api.get('/doctor/patients')
      setPatients(res.data)
      return
    }
    const res = await api.get(`/doctor/patients/search?q=${query}`)
    setPatients(res.data)
  }

  const viewPatient = async (patientId) => {
    try {
      const res = await api.get(`/doctor/patients/${patientId}`)
      setPatientDetails(res.data)
    } catch (err) {
      alert('Failed to load patient details')
    }
  }

  const createPrescription = async (e) => {
    e.preventDefault()
    if (!selectedPatient) {
      alert('Please select a patient first')
      return
    }
    try {
      await api.post('/doctor/prescriptions', {
        patientId: selectedPatient.id,
        ...rxForm
      })
      alert('Prescription created!')
      setRxModal(false)
      setRxForm({
        medicationName: '', dosage: '', frequency: '', duration: '', 
        instructions: '', startDate: new Date().toISOString().split('T')[0], endDate: '', notes: ''
      })
      loadData()
    } catch (err) {
      alert('Failed to create prescription')
    }
  }

  const openRxModal = (patient) => {
    setSelectedPatient(patient)
    setRxModal(true)
  }

  const filteredPatients = patients.filter(p => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) return <div className={styles.loading}>Loading...</div>

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <h1>👨‍⚕️ Doctor Portal</h1>
        <p>Manage patients, prescriptions, and appointments</p>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.blue}`}>
          <Users size={24} />
          <div className={styles.statLabel}>Total Patients</div>
          <div className={styles.statValue}>{stats?.totalPatients ?? 0}</div>
        </div>
        <div className={`${styles.statCard} ${styles.green}`}>
          <Pill size={24} />
          <div className={styles.statLabel}>Active Prescriptions</div>
          <div className={styles.statValue}>{stats?.activePrescriptions ?? 0}</div>
        </div>
        <div className={`${styles.statCard} ${styles.orange}`}>
          <Calendar size={24} />
          <div className={styles.statLabel}>Today's Appointments</div>
          <div className={styles.statValue}>{stats?.todayAppointments ?? 0}</div>
        </div>
        <div className={`${styles.statCard} ${styles.red}`}>
          <AlertCircle size={24} />
          <div className={styles.statLabel}>Critical Cases</div>
          <div className={styles.statValue}>{stats?.criticalCases ?? 0}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button className={activeTab === 'dashboard' ? styles.activeTab : ''} onClick={() => setActiveTab('dashboard')}>
          <Activity size={18} /> Dashboard
        </button>
        <button className={activeTab === 'prescriptions' ? styles.activeTab : ''} onClick={() => setActiveTab('prescriptions')}>
          <Pill size={18} /> Prescriptions
        </button>
        <button className={activeTab === 'appointments' ? styles.activeTab : ''} onClick={() => setActiveTab('appointments')}>
          <Calendar size={18} /> Appointments
        </button>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className={styles.dashboardGrid}>
          <div className={styles.card}>
            <h3>Recent Patients</h3>
            <div className={styles.list}>
              {patients.slice(0, 5).map(p => (
                <div key={p.id} className={styles.listItem} onClick={() => { viewPatient(p.id); setActiveTab('patients') }}>
                  <div className={styles.avatar}>{p.name?.[0]}</div>
                  <div><strong>{p.name}</strong><br/><small>{p.email}</small></div>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.card}>
            <h3>Today's Appointments</h3>
            <div className={styles.list}>
              {appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).slice(0, 5).map(a => (
                <div key={a.id} className={styles.listItem}>
                  <div className={styles.avatar}><Calendar size={16}/></div>
                  <div><strong>{a.patient?.name}</strong><br/><small>{a.time} - {a.doctorName}</small></div>
                </div>
              ))}
              {appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length === 0 && (
                <p className={styles.empty}>No appointments today</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Patients Tab */}
      {activeTab === 'patients' && (
        <div className={styles.card}>
          <div className={styles.toolbar}>
            <div className={styles.searchBox}>
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Search patients..." 
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); searchPatients(e.target.value) }}
              />
            </div>
            <button className={styles.btnPrimary} onClick={loadData}><RefreshCw size={16} /> Refresh</button>
          </div>
          
          <table className={styles.table}>
            <thead>
              <tr><th>Name</th><th>Email</th><th>DOB</th><th>Gender</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filteredPatients.map(p => (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong></td>
                  <td>{p.email}</td>
                  <td>{p.dateOfBirth || '—'}</td>
                  <td>{p.gender || '—'}</td>
                  <td>
                    <button className={styles.btnSm} onClick={() => viewPatient(p.id)}>View</button>
                    <button className={styles.btnSm} style={{background: '#22c55e'}} onClick={() => openRxModal(p)}>
                      <Plus size={14} /> Rx
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Prescriptions Tab */}
      {activeTab === 'prescriptions' && (
        <div className={styles.card}>
          <h3>All Prescriptions</h3>
          <table className={styles.table}>
            <thead>
              <tr><th>Patient</th><th>Medication</th><th>Dosage</th><th>Frequency</th><th>Status</th><th>Date</th></tr>
            </thead>
            <tbody>
              {prescriptions.map(rx => (
                <tr key={rx.id}>
                  <td><strong>{rx.patient?.name}</strong></td>
                  <td>{rx.medicationName}</td>
                  <td>{rx.dosage}</td>
                  <td>{rx.frequency}</td>
                  <td><span className={`${styles.badge} ${rx.status === 'active' ? styles.active : styles.inactive}`}>{rx.status}</span></td>
                  <td>{new Date(rx.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Appointments Tab */}
      {activeTab === 'appointments' && (
        <div className={styles.card}>
          <h3>All Appointments</h3>
          <table className={styles.table}>
            <thead>
              <tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Location</th><th>Status</th></tr>
            </thead>
            <tbody>
              {appointments.map(a => (
                <tr key={a.id}>
                  <td><strong>{a.patient?.name}</strong></td>
                  <td>{a.doctorName}</td>
                  <td>{a.date}</td>
                  <td>{a.time}</td>
                  <td>{a.location || '—'}</td>
                  <td><span className={styles.badge}>{a.status || 'scheduled'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Patient Details Modal */}
      {patientDetails && (
        <div className={styles.overlay} onClick={() => setPatientDetails(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <button className={styles.close} onClick={() => setPatientDetails(null)}>✕</button>
            <h2>👤 {patientDetails.patient.name}</h2>
            <p>{patientDetails.patient.email}</p>
            
            <div className={styles.detailSection}>
              <h4>Prescriptions</h4>
              {patientDetails.prescriptions?.length > 0 ? (
                <ul>
                  {patientDetails.prescriptions.map(rx => (
                    <li key={rx.id}>{rx.medicationName} - {rx.dosage} ({rx.status})</li>
                  ))}
                </ul>
              ) : <p>No prescriptions</p>}
            </div>
            
            <div className={styles.detailSection}>
              <h4>Recent Health Data</h4>
              {patientDetails.healthData?.length > 0 ? (
                <div className={styles.healthGrid}>
                  {patientDetails.healthData.slice(0, 5).map(h => (
                    <div key={h.id} className={styles.healthItem}>
                      <small>{new Date(h.createdAt).toLocaleDateString()}</small>
                      <div>BP: {h.bloodPressure || '—'}</div>
                      <div>HR: {h.heartRate || '—'}</div>
                    </div>
                  ))}
                </div>
              ) : <p>No health data</p>}
            </div>
            
            <div className={styles.detailSection}>
              <h4>AI Reports</h4>
              {patientDetails.reports?.length > 0 ? (
                <ul>
                  {patientDetails.reports.slice(0, 3).map(r => (
                    <li key={r.id}>{r.inputType} - {r.riskLevel} ({new Date(r.createdAt).toLocaleDateString()})</li>
                  ))}
                </ul>
              ) : <p>No AI reports</p>}
            </div>
          </div>
        </div>
      )}

      {/* Prescription Modal */}
      {rxModal && (
        <div className={styles.overlay} onClick={() => setRxModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <button className={styles.close} onClick={() => setRxModal(false)}>✕</button>
            <h2>💊 New Prescription</h2>
            <p>For: <strong>{selectedPatient?.name}</strong></p>
            
            <form onSubmit={createPrescription} className={styles.form}>
              <div className={styles.field}>
                <label>Medication Name *</label>
                <input type="text" required value={rxForm.medicationName} 
                  onChange={e => setRxForm({...rxForm, medicationName: e.target.value})} />
              </div>
              
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Dosage *</label>
                  <input type="text" required placeholder="e.g. 500mg" value={rxForm.dosage}
                    onChange={e => setRxForm({...rxForm, dosage: e.target.value})} />
                </div>
                <div className={styles.field}>
                  <label>Frequency *</label>
                  <input type="text" required placeholder="e.g. 3x daily" value={rxForm.frequency}
                    onChange={e => setRxForm({...rxForm, frequency: e.target.value})} />
                </div>
              </div>
              
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Duration</label>
                  <input type="text" placeholder="e.g. 7 days" value={rxForm.duration}
                    onChange={e => setRxForm({...rxForm, duration: e.target.value})} />
                </div>
                <div className={styles.field}>
                  <label>Start Date</label>
                  <input type="date" required value={rxForm.startDate}
                    onChange={e => setRxForm({...rxForm, startDate: e.target.value})} />
                </div>
              </div>
              
              <div className={styles.field}>
                <label>Instructions</label>
                <textarea placeholder="e.g. Take with food" value={rxForm.instructions}
                  onChange={e => setRxForm({...rxForm, instructions: e.target.value})} />
              </div>
              
              <div className={styles.field}>
                <label>Notes</label>
                <textarea placeholder="Additional notes..." value={rxForm.notes}
                  onChange={e => setRxForm({...rxForm, notes: e.target.value})} />
              </div>
              
              <button type="submit" className={styles.btnPrimary} style={{width: '100%'}}>
                Create Prescription
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
