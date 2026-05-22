import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../services/api'

export default function ResetPasswordPage() {
  const { uid, token } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/reset-password/', { uid, token, password })
      navigate('/login?reset=success')
    } catch (err) {
      setError(err.response?.data?.error || 'Lien invalide ou expiré.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logoRow}>
          <div style={s.logoIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C9A843" strokeWidth="1.8">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
          </div>
          <div>
            <p style={s.brand}>AGENT API</p>
            <p style={s.sub}>API_LIDL · LIDL_CAMPUS</p>
          </div>
        </div>

        <h1 style={s.title}>Nouveau mot de passe</h1>
        <p style={s.desc}>Choisissez un mot de passe sécurisé d'au moins 8 caractères.</p>

        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>Nouveau mot de passe</label>
            <input
              style={s.input}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <div style={s.field}>
            <label style={s.label}>Confirmer le mot de passe</label>
            <input
              style={s.input}
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          {error && <p style={s.error}>{error}</p>}
          <button style={{ ...s.btn, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
            {loading ? 'Réinitialisation…' : 'Réinitialiser le mot de passe'}
          </button>
        </form>

        <Link to="/login" style={s.backLink}>← Retour à la connexion</Link>
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--navy)', padding: '24px' },
  card: { width: '100%', maxWidth: '400px', background: 'var(--navy-mid)', border: '1px solid var(--navy-border)', borderRadius: '16px', padding: '40px' },
  logoRow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' },
  logoIcon: { width: '44px', height: '44px', background: 'var(--gold-dim)', border: '1px solid rgba(201,168,67,0.3)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  brand: { fontWeight: 600, fontSize: '13px', letterSpacing: '2px', color: 'var(--gold)', margin: 0 },
  sub: { fontSize: '11px', color: 'var(--muted)', margin: 0, marginTop: '2px' },
  title: { fontSize: '22px', fontWeight: 500, color: 'var(--white)', marginBottom: '6px' },
  desc: { fontSize: '13px', color: 'var(--muted)', marginBottom: '28px', lineHeight: 1.6 },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.5px', fontWeight: 500 },
  input: { background: 'var(--navy)', border: '1px solid var(--navy-border)', borderRadius: '8px', padding: '10px 14px', color: 'var(--white)', fontSize: '14px', outline: 'none' },
  error: { fontSize: '13px', color: 'var(--danger)', padding: '8px 12px', background: 'rgba(224,82,82,0.1)', borderRadius: '6px' },
  btn: { background: 'var(--gold)', color: 'var(--navy)', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', marginTop: '4px' },
  backLink: { display: 'block', marginTop: '20px', fontSize: '13px', color: 'var(--muted)', textDecoration: 'none' },
}
