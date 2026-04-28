import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Layout.module.css'

const PATIENT_NAV = [
  { to:'/dashboard',      icon:'📊', label:'Dashboard' },
  { to:'/assistant',      icon:'🤖', label:'AI Assistant' },
  { to:'/image-analysis', icon:'🔬', label:'Image Analysis' },
  { to:'/medications',    icon:'💊', label:'Medications' },
  { to:'/appointments',   icon:'📅', label:'Appointments' },
  { to:'/profile',        icon:'👤', label:'My Profile' },
]

const DOCTOR_NAV = [
  { to:'/doctor',        icon:'👨‍⚕️', label:'Doctor Dashboard' },
  { to:'/assistant',     icon:'🤖', label:'AI Assistant' },
  { to:'/image-analysis',icon:'🔬', label:'Image Analysis' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/') }

  const isDoctor = user?.role === 'doctor' || user?.role === 'admin'
  const nav = isDoctor ? DOCTOR_NAV : PATIENT_NAV

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span>🩺</span>
          <span>HealthGuide <span className={styles.ai}>AI</span></span>
        </div>
        <nav className={styles.nav}>
          {nav.map(n => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
              <span>{n.icon}</span> {n.label}
            </NavLink>
          ))}
        </nav>
        <div className={styles.footer}>
          <div className={styles.user}>
            <div className={styles.avatar}>{isDoctor ? '👨‍⚕️' : user?.name?.[0]?.toUpperCase()}</div>
            <div>
              <div className={styles.name}>{isDoctor ? `Dr. ${user?.name}` : user?.name}</div>
              <div className={styles.role}>{user?.role}</div>
            </div>
          </div>
          <button className={styles.logout} onClick={handleLogout}>⬅️ Logout</button>
        </div>
      </aside>
      <main className={styles.main}><Outlet /></main>
    </div>
  )
}
