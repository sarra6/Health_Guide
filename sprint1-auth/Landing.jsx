import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Landing.module.css'

export default function Landing() {
  const { user, login, register, logout } = useAuth()
  const navigate = useNavigate()
  const [modal, setModal] = useState(null) // 'login' | 'register'
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'patient' })

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleLogin = async e => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const data = await login(form.email, form.password)
      setModal(null)
      navigate(data.user.role === 'doctor' || data.user.role === 'admin' ? '/dashboard' : '/assistant')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed.')
    }
    setLoading(false)
  }

  const handleRegister = async e => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      await register(form)
      setModal(null)
      navigate('/assistant')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.')
    }
    setLoading(false)
  }

  const openModal = (type) => { setError(''); setForm({ name:'', email:'', password:'', role:'patient' }); setModal(type) }

  return (
    <div className={styles.page}>
      {/* NAVBAR */}
      <nav className={styles.navbar}>
        <div className={styles.brand}>
          <span>🩺</span>
          <span className={styles.brandName}>HealthGuide </span>
        </div>
        <div className={styles.navActions}>
          {user ? (
            <>
              <span className={styles.greeting}>👋 {user.name}</span>
              <button className={styles.btnPrimary} onClick={() => navigate(user.role === 'doctor' ? '/dashboard' : '/assistant')}>Dashboard</button>
              <button className={styles.btnOutline} onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <button className={styles.btnOutline} onClick={() => openModal('login')}>Login</button>
              <button className={styles.btnPrimary} onClick={() => openModal('register')}>Get Started</button>
            </>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>🧠 AI-Powered Health Intelligence</div>
          <h1 className={styles.title}>Your Smart <span className={styles.gradient}>Health Assistant</span></h1>
          <p className={styles.subtitle}>Analyze symptoms, interpret medical images, and get personalized health recommendations — powered by AI.</p>
          <div className={styles.heroActions}>
            <button className={styles.btnHero} onClick={() => user ? navigate('/assistant') : openModal('register')}>Start Free Analysis</button>
            <button className={styles.btnHeroOutline} onClick={() => user ? navigate('/assistant') : openModal('login')}>View Dashboard</button>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.orb}></div>
          <div className={`${styles.floatCard} ${styles.card1}`}>💊 Medication Tracker</div>
          <div className={`${styles.floatCard} ${styles.card2}`}>🫀 Vitals Monitor</div>
          <div className={`${styles.floatCard} ${styles.card3}`}>🧬 AI Diagnosis</div>
        </div>
      </section>

      {/* FEATURES */}
      <section className={styles.features}>
        <h2 className={styles.sectionTitle}>Everything You Need</h2>
        <p className={styles.sectionSub}>A complete health intelligence platform with AI-powered </p>
        <div className={styles.grid}>
          {[
            { icon:'🤖', title:'AI Health Assistant', desc:'Chat with Gemini AI to analyze symptoms and get personalized health guidance.', tag:'Gemini AI' },
            { icon:'🔬', title:'Medical Image Analysis', desc:'Upload X-rays for AI-assisted analysis with confidence scoring.', tag:'Vision AI' },
            { icon:'👨‍⚕️', title:'Doctor Dashboard', desc:'Healthcare providers review AI reports and monitor patient trends.', tag:'Role-Based' },
            { icon:'📊', title:'Health Tracking', desc:'Track vitals and blood work with automated risk assessments.', tag:'Rule Engine' },
            { icon:'🔐', title:'Secure & Private', desc:'JWT authentication and role-based access control.', tag:'JWT + RBAC' },
            { icon:'📋', title:'AI Reports Archive', desc:'Every AI analysis stored for history tracking and doctor review.', tag:'MySQL' },
          ].map(f => (
            <div key={f.title} className={styles.card} onClick={() => user ? navigate('/assistant') : openModal('register')}>
              <div className={styles.cardIcon}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
              <span className={styles.tag}>{f.tag}</span>
            </div>
          ))}
        </div>
      </section>

      {/* DISCLAIMER */}
      <div className={styles.disclaimer}>
        <span>⚕️</span>
        <p><strong>Medical Disclaimer:</strong> HealthGuide AI provides informational analysis only. Always consult a qualified healthcare provider for medical decisions.</p>
      </div>

      <footer className={styles.footer}>🩺 HealthGuide  © 2026 </footer>

      {/* MODAL */}
      {modal && (
        <div className={styles.overlay} onClick={() => setModal(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <button className={styles.close} onClick={() => setModal(null)}>✕</button>
            <h2>{modal === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
            <p className={styles.modalSub}>{modal === 'login' ? 'Log in to your account' : 'Join HealthGuide AI today'}</p>
            {error && <div className={styles.error}>{error}</div>}
            <form onSubmit={modal === 'login' ? handleLogin : handleRegister}>
              {modal === 'register' && (
                <div className={styles.field}>
                  <label>Full Name</label>
                  <input name="name" value={form.name} onChange={handleChange} placeholder="John Doe" required />
                </div>
              )}
              <div className={styles.field}>
                <label>Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" required />
              </div>
              <div className={styles.field}>
                <label>Password</label>
                <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min 6 characters" required />
              </div>
              {modal === 'register' && (
                <div className={styles.field}>
                  <label>Role</label>
                  <select name="role" value={form.role} onChange={handleChange}>
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor / Healthcare Provider</option>
                  </select>
                </div>
              )}
              <button type="submit" className={styles.btnFull} disabled={loading}>
                {loading ? '...' : modal === 'login' ? 'Login' : 'Create Account'}
              </button>
            </form>
            <p className={styles.switch}>
              {modal === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <a onClick={() => openModal(modal === 'login' ? 'register' : 'login')}>
                {modal === 'login' ? 'Sign up' : 'Login'}
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
