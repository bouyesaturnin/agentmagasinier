import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/forgot-password/', { email })
      setSent(true)
    } catch {
      setError('Une erreur est survenue. Réessayez.')
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

        {sent ? (
          <div style={s.success}>
            <div style={s.successIcon}>✓</div>
            <h2 style={s.title}>Email envoyé !</h2>
            <p style={s.desc}>Si votre email est enregistré, vous recevrez un lien de réinitialisation dans quelques minutes. Vérifiez vos spams.</p>
            <Link to="/login" style={s.backLink}>← Retour à la connexion</Link>
          </div>
        ) : (
          <>
            <h1 style={s.title}>Mot de passe oublié</h1>
            <p style={s.desc}>Entrez votre email pour recevoir un lien de réinitialisation.</p>

            <form onSubmit={handleSubmit} style={s.form}>
              <div style={s.field}>
                <label style={s.label}>Adresse email</label>
                <input
                  style={s.input}
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                />
              </div>
              {error && <p style={s.error}>{error}</p>}
              <button style={{ ...s.btn, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
                {loading ? 'Envoi en cours…' : 'Envoyer le lien'}
              </button>
            </form>

            <Link to="/login" style={s.backLink}>← Retour à la connexion</Link>
          </>
        )}
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
  success: { textAlign: 'center' },
  successIcon: { width: '48px', height: '48px', background: 'rgba(60,185,122,0.15)', border: '1px solid rgba(60,185,122,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: 'var(--success)', margin: '0 auto 16px' },
}
