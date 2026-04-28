import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './components/Toast'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Assistant from './pages/Assistant'
import ImageAnalysis from './pages/ImageAnalysis'
import DoctorDashboard from './pages/DoctorDashboard'
import Medications from './pages/Medications'
import Appointments from './pages/Appointments'
import Profile from './pages/Profile'
import Layout from './components/Layout'

function Protected({ children, doctorOnly = false }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',color:'#64748B',fontSize:16}}>Loading...</div>
  if (!user) return <Navigate to="/" replace />
  if (doctorOnly && user.role === 'patient') return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
              <Route path="/assistant" element={<Protected><Assistant /></Protected>} />
              <Route path="/image-analysis" element={<Protected><ImageAnalysis /></Protected>} />
              <Route path="/medications" element={<Protected><Medications /></Protected>} />
              <Route path="/appointments" element={<Protected><Appointments /></Protected>} />
              <Route path="/profile" element={<Protected><Profile /></Protected>} />
              <Route path="/doctor" element={<Protected doctorOnly><DoctorDashboard /></Protected>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}
