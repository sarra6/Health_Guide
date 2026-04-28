import { useState, useEffect, createContext, useContext, useCallback } from 'react'

const ToastCtx = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const show = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }, [])

  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div style={{ position:'fixed', bottom:24, right:24, display:'flex', flexDirection:'column', gap:10, zIndex:9999 }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background: t.type==='error' ? '#EF4444' : t.type==='warning' ? '#F59E0B' : '#10B981',
            color:'white', padding:'12px 20px', borderRadius:10, fontWeight:600, fontSize:14,
            boxShadow:'0 4px 20px rgba(0,0,0,0.15)', animation:'fadeIn 0.3s ease',
            maxWidth:320
          }}>
            {t.type==='error' ? '❌' : t.type==='warning' ? '⚠️' : '✅'} {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

export const useToast = () => useContext(ToastCtx)
