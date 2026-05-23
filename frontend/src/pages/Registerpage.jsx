import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm: '',
    role: 'magasinier',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (form.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/register/', {
        username: form.username,
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        password: form.password,
        role: form.role,
        entrepot: 'LIDL_CAMPUS',
      })
      navigate('/login?registered=success')
    } catch (err) {
      const data = err.response?.data
      if (data?.username) setError('Ce nom d\'utilisateur est déjà pris.')
      else if (data?.email) setError('Cet email est déjà utilisé.')
      else setError('Une erreur est survenue. Réessayez.')
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

        <h1 style={s.title}>Créer un compte</h1>
        <p style={s.desc}>Rejoignez l'équipe LIDL_CAMPUS</p>

        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.row}>
            <div style={s.field}>
              <label style={s.label}>Prénom</label>
              <input style={s.input} name="first_name" value={form.first_name} onChange={update} placeholder="Jean" required />
            </div>
            <div style={s.field}>
              <label style={s.label}>Nom</label>
              <input style={s.input} name="last_name" value={form.last_name} onChange={update} placeholder="Dupont" required />
            </div>
          </div>

          <div style={s.field}>
            <label style={s.label}>Identifiant</label>
            <input style={s.input} name="username" value={form.username} onChange={update} placeholder="jean.dupont" required />
          </div>

          <div style={s.field}>
            <label style={s.label}>Email</label>
            <input style={s.input} type="email" name="email" value={form.email} onChange={update} placeholder="jean@lidl.fr" required />
          </div>

          <div style={s.field}>
            <label style={s.label}>Rôle</label>
            <select style={s.select} name="role" value={form.role} onChange={update}>
              <option value="magasinier">Magasinier</option>
              <option value="responsable">Responsable</option>
            </select>
          </div>

          <div style={s.field}>
            <label style={s.label}>Mot de passe</label>
            <input style={s.input} type="password" name="password" value={form.password} onChange={update} placeholder="••••••••" required />
          </div>

          <div style={s.field}>
            <label style={s.label}>Confirmer le mot de passe</label>
            <input style={s.input} type="password" name="confirm" value={form.confirm} onChange={update} placeholder="••••••••" required />
          </div>

          {error && <p style={s.error}>{error}</p>}

          <button style={{ ...s.btn, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
            {loading ? 'Création en cours…' : 'Créer mon compte'}
          </button>
        </form>

        <p style={s.loginLink}>
          Déjà un compte ? <Link to="/login" style={s.link}>Se connecter</Link>
        </p>
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--navy)', padding: '24px' },
  card: { width: '100%', maxWidth: '440px', background: 'var(--navy-mid)', border: '1px solid var(--navy-border)', borderRadius: '16px', padding: '40px' },
  logoRow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' },
  logoIcon: { width: '44px', height: '44px', background: 'var(--gold-dim)', border: '1px solid rgba(201,168,67,0.3)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  brand: { fontWeight: 600, fontSize: '13px', letterSpacing: '2px', color: 'var(--gold)', margin: 0 },
  sub: { fontSize: '11px', color: 'var(--muted)', margin: 0, marginTop: '2px' },
  title: { fontSize: '22px', fontWeight: 500, color: 'var(--white)', marginBottom: '6px' },
  desc: { fontSize: '13px', color: 'var(--muted)', marginBottom: '24px' },
  form: { display: 'flex', flexDirection: 'column', gap: '14px' },
  row: { display: 'flex', gap: '12px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 },
  label: { fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.5px', fontWeight: 500 },
  input: { background: 'var(--navy)', border: '1px solid var(--navy-border)', borderRadius: '8px', padding: '10px 14px', color: 'var(--white)', fontSize: '14px', outline: 'none' },
  select: { background: 'var(--navy)', border: '1px solid var(--navy-border)', borderRadius: '8px', padding: '10px 14px', color: 'var(--white)', fontSize: '14px', outline: 'none' },
  error: { fontSize: '13px', color: 'var(--danger)', padding: '8px 12px', background: 'rgba(224,82,82,0.1)', borderRadius: '6px' },
  btn: { background: 'var(--gold)', color: 'var(--navy)', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', marginTop: '4px' },
  loginLink: { marginTop: '20px', fontSize: '13px', color: 'var(--muted)', textAlign: 'center' },
  link: { color: 'var(--gold)', textDecoration: 'none' },
}
