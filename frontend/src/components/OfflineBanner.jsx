// frontend/src/components/OfflineBanner.jsx
import { useState, useEffect } from 'react'
import { useOffline } from '../hooks/useOffline'

export default function OfflineBanner() {
  const isOffline = useOffline()
  const [justReconnected, setJustReconnected] = useState(false)
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    if (isOffline) {
      setWasOffline(true)
      setJustReconnected(false)
    } else if (wasOffline && !isOffline) {
      setJustReconnected(true)
      const timer = setTimeout(() => {
        setJustReconnected(false)
        setWasOffline(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isOffline, wasOffline])

  if (!isOffline && !justReconnected) return null

  return (
    <div style={{
      position: 'fixed',
      top: '16px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 18px',
      borderRadius: '24px',
      fontSize: '13px',
      fontWeight: 500,
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      transition: 'all 0.3s ease',
      background: isOffline ? '#1B2A4A' : '#0F2A1A',
      border: `1px solid ${isOffline ? 'rgba(224,82,82,0.4)' : 'rgba(60,185,122,0.4)'}`,
      color: isOffline ? '#E05252' : '#3CB97A',
    }}>
      <div style={{
        width: '7px',
        height: '7px',
        borderRadius: '50%',
        background: isOffline ? '#E05252' : '#3CB97A',
        flexShrink: 0,
      }} />
      {isOffline
        ? '📵 Hors-ligne — historique disponible en lecture'
        : '✅ Connexion rétablie — synchronisation en cours…'
      }
    </div>
  )
}
