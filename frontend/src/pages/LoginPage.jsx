import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username, password)
      navigate('/chat')
    } catch {
      setError('Identifiants incorrects. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoRow}>
          <div style={styles.logoIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C9A843" strokeWidth="1.8">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
          </div>
          <div>
            <p style={styles.brand}>AGENT API</p>
            <p style={styles.sub}>API_LIDL · LIDL_CAMPUS</p>
          </div>
        </div>

        <h1 style={styles.title}>Connexion</h1>
        <p style={styles.desc}>Accédez à votre assistant logistique</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Identifiant</label>
            <input
              style={styles.input}
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="nom.utilisateur"
              autoComplete="username"
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Mot de passe</label>
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          <div style={styles.forgotRow}>
            <Link to="/forgot-password" style={styles.forgotLink}>
              Mot de passe oublié ?
            </Link>
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
            {loading ? 'Connexion en cours…' : 'Se connecter'}
          </button>
        </form>

        <p style={styles.registerRow}>
          Pas encore de compte ?{' '}
          <Link to="/register" style={styles.registerLink}>Créer un compte</Link>
        </p>

        <div style={styles.hint}>
          <span style={styles.hintDot}></span>
          Système réservé aux agents API_LIDL autorisés
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--navy)', padding: '24px' },
  card: { width: '100%', maxWidth: '400px', background: 'var(--navy-mid)', border: '1px solid var(--navy-border)', borderRadius: '16px', padding: '40px' },
  logoRow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' },
  logoIcon: { width: '44px', height: '44px', background: 'var(--gold-dim)', border: '1px solid rgba(201,168,67,0.3)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  brand: { fontWeight: 600, fontSize: '13px', letterSpacing: '2px', color: 'var(--gold)', margin: 0 },
  sub: { fontSize: '11px', color: 'var(--muted)', margin: 0, marginTop: '2px' },
  title: { fontSize: '22px', fontWeight: 500, color: 'var(--white)', marginBottom: '6px' },
  desc: { fontSize: '13px', color: 'var(--muted)', marginBottom: '28px' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.5px', fontWeight: 500 },
  input: { background: 'var(--navy)', border: '1px solid var(--navy-border)', borderRadius: '8px', padding: '10px 14px', color: 'var(--white)', fontSize: '14px', outline: 'none' },
  forgotRow: { display: 'flex', justifyContent: 'flex-end', marginTop: '-8px' },
  forgotLink: { fontSize: '12px', color: 'var(--gold)', textDecoration: 'none', opacity: 0.8 },
  error: { fontSize: '13px', color: 'var(--danger)', padding: '8px 12px', background: 'rgba(224,82,82,0.1)', borderRadius: '6px' },
  btn: { background: 'var(--gold)', color: 'var(--navy)', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', marginTop: '4px', letterSpacing: '0.3px' },
  registerRow: { marginTop: '20px', fontSize: '13px', color: 'var(--muted)', textAlign: 'center' },
  registerLink: { color: 'var(--gold)', textDecoration: 'none', fontWeight: 500 },
  hint: { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', fontSize: '11px', color: 'var(--muted)' },
  hintDot: { width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)', flexShrink: 0 },
}
