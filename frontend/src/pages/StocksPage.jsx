import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import api from '../services/api'

const STATUT_CONFIG = {
  rupture: { label: 'Rupture', color: '#E05252', bg: 'rgba(224,82,82,0.1)', border: 'rgba(224,82,82,0.3)' },
  critique: { label: 'Critique', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' },
  bas: { label: 'Bas', color: '#60A5FA', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.3)' },
  ok: { label: 'OK', color: '#3CB97A', bg: 'rgba(60,185,122,0.1)', border: 'rgba(60,185,122,0.3)' },
}

const CATEGORIES = [
  { value: '', label: 'Toutes catégories' },
  { value: 'frais', label: '❄️ Frais' },
  { value: 'sec', label: '🌾 Épicerie sèche' },
  { value: 'surgele', label: '🧊 Surgelés' },
  { value: 'boisson', label: '🥤 Boissons' },
  { value: 'hygiene', label: '🧴 Hygiène' },
  { value: 'autre', label: '📦 Autre' },
]

function StatutBadge({ statut }) {
  const cfg = STATUT_CONFIG[statut] || STATUT_CONFIG.ok
  return (
    <span style={{
      fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '12px',
      background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color,
    }}>
      {cfg.label}
    </span>
  )
}

function StockBar({ actuel, minimum, maximum }) {
  const pct = maximum > 0 ? Math.min((actuel / maximum) * 100, 100) : 0
  const minPct = maximum > 0 ? (minimum / maximum) * 100 : 0
  let barColor = '#3CB97A'
  if (actuel === 0) barColor = '#E05252'
  else if (actuel <= minimum) barColor = '#F59E0B'
  else if (actuel <= minimum * 1.5) barColor = '#60A5FA'

  return (
    <div style={{ position: 'relative', height: '6px', background: 'var(--navy)', borderRadius: '3px', width: '100%', minWidth: '80px' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${pct}%`, background: barColor, borderRadius: '3px', transition: 'width 0.3s' }} />
      <div style={{ position: 'absolute', left: `${minPct}%`, top: '-2px', width: '2px', height: '10px', background: '#F59E0B', borderRadius: '1px' }} title={`Minimum: ${minimum}`} />
    </div>
  )
}

export default function StocksPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [produits, setProduits] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categorie, setCategorie] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadData()
  }, [categorie])

  const loadData = async () => {
    setLoading(true)
    try {
      const params = {}
      if (categorie) params.categorie = categorie
      const [stocksRes, summaryRes] = await Promise.all([
        api.get('/wms/stocks/', { params }),
        api.get('/wms/stocks/summary/'),
      ])
      setProduits(stocksRes.data)
      setSummary(summaryRes.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const filtered = produits.filter(p =>
    p.nom.toLowerCase().includes(search.toLowerCase()) ||
    p.reference.toLowerCase().includes(search.toLowerCase()) ||
    p.emplacement.toLowerCase().includes(search.toLowerCase())
  )

  const handleEdit = (p) => {
    setEditingId(p.id)
    setEditValue(String(p.stock_actuel))
  }

  const handleSave = async (p) => {
    setSaving(true)
    try {
      await api.patch(`/wms/stocks/${p.id}/`, {
        stock_actuel: parseInt(editValue),
        motif: 'Correction manuelle via interface',
      })
      setEditingId(null)
      loadData()
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div style={s.page}>
      {/* TOPBAR */}
      <div style={s.topbar}>
        <div style={s.topbarLeft}>
          <div style={s.logoMark}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9A843" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            </svg>
          </div>
          <div>
            <p style={s.brandName}>AGENT API</p>
            <p style={s.brandSub}>LIDL_CAMPUS</p>
          </div>
        </div>
        <div style={s.topbarRight}>
          {['chat', 'dashboard', 'templates'].map(page => (
            <button key={page} style={s.navBtn} onClick={() => navigate(`/${page}`)}>
              {page.charAt(0).toUpperCase() + page.slice(1)}
            </button>
          ))}
          <div style={s.avatar}>{user?.full_name?.[0] || user?.username?.[0] || 'U'}</div>
          <button style={s.logoutBtn} onClick={handleLogout} title="Déconnexion">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
          </button>
        </div>
      </div>

      <div style={s.content}>
        <div style={s.pageHeader}>
          <h1 style={s.pageTitle}>Gestion des stocks</h1>
          <p style={s.pageDesc}>LIDL_CAMPUS — Données en temps réel</p>
        </div>

        {/* RÉSUMÉ */}
        {summary && (
          <div style={s.summaryGrid}>
            <div style={s.summaryCard}>
              <p style={s.summaryValue}>{summary.total_produits}</p>
              <p style={s.summaryLabel}>Références</p>
            </div>
            <div style={{ ...s.summaryCard, borderColor: 'rgba(224,82,82,0.3)' }}>
              <p style={{ ...s.summaryValue, color: '#E05252' }}>{summary.nb_ruptures}</p>
              <p style={s.summaryLabel}>Ruptures</p>
            </div>
            <div style={{ ...s.summaryCard, borderColor: 'rgba(245,158,11,0.3)' }}>
              <p style={{ ...s.summaryValue, color: '#F59E0B' }}>{summary.nb_critiques}</p>
              <p style={s.summaryLabel}>Critiques</p>
            </div>
            <div style={{ ...s.summaryCard, borderColor: 'rgba(96,165,250,0.3)' }}>
              <p style={{ ...s.summaryValue, color: '#60A5FA' }}>{summary.nb_bas}</p>
              <p style={s.summaryLabel}>Stocks bas</p>
            </div>
          </div>
        )}

        {/* FILTRES */}
        <div style={s.filters}>
          <input
            style={s.searchInput}
            placeholder="🔍 Rechercher par référence, nom ou emplacement…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select style={s.select} value={categorie} onChange={e => setCategorie(e.target.value)}>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <button style={s.refreshBtn} onClick={loadData}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23,4 23,10 17,10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            Actualiser
          </button>
        </div>

        {/* TABLE */}
        {loading ? (
          <div style={s.center}>
            <div style={s.spinner}></div>
          </div>
        ) : (
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  {['Référence', 'Produit', 'Catégorie', 'Emplacement', 'Stock', 'Niveau', 'Statut', 'Action'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{ ...s.td, textAlign: 'center', color: 'var(--muted)', padding: '32px' }}>Aucun produit trouvé</td></tr>
                ) : filtered.map(p => (
                  <tr key={p.id} style={p.statut === 'rupture' ? s.rowRupture : {}}>
                    <td style={s.td}><span style={s.ref}>{p.reference}</span></td>
                    <td style={s.td}><span style={s.nom}>{p.nom}</span></td>
                    <td style={s.td}><span style={s.cat}>{p.categorie}</span></td>
                    <td style={s.td}><span style={s.empl}>{p.emplacement}</span></td>
                    <td style={s.td}>
                      {editingId === p.id ? (
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <input
                            style={s.editInput}
                            type="number"
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            min="0"
                          />
                          <button style={s.saveBtn} onClick={() => handleSave(p)} disabled={saving}>✓</button>
                          <button style={s.cancelBtn} onClick={() => setEditingId(null)}>✕</button>
                        </div>
                      ) : (
                        <span style={{ fontWeight: 600, color: p.statut === 'rupture' ? '#E05252' : 'var(--white)' }}>
                          {p.stock_actuel} <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 400 }}>{p.unite}</span>
                        </span>
                      )}
                    </td>
                    <td style={{ ...s.td, minWidth: '100px' }}>
                      <StockBar actuel={p.stock_actuel} minimum={p.stock_minimum} maximum={p.stock_maximum} />
                      <span style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '3px', display: 'block' }}>
                        min {p.stock_minimum} / max {p.stock_maximum}
                      </span>
                    </td>
                    <td style={s.td}><StatutBadge statut={p.statut} /></td>
                    <td style={s.td}>
                      <button style={s.editBtn} onClick={() => handleEdit(p)}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Modifier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: 'var(--navy)', display: 'flex', flexDirection: 'column' },
  topbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', borderBottom: '1px solid var(--navy-border)', background: 'var(--navy-mid)' },
  topbarLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  logoMark: { width: '30px', height: '30px', background: 'var(--gold-dim)', border: '1px solid rgba(201,168,67,0.3)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  brandName: { fontSize: '11px', fontWeight: 600, letterSpacing: '2px', color: 'var(--gold)', margin: 0 },
  brandSub: { fontSize: '10px', color: 'var(--muted)', margin: 0 },
  topbarRight: { display: 'flex', alignItems: 'center', gap: '8px' },
  navBtn: { background: 'var(--navy-light)', border: '1px solid var(--navy-border)', borderRadius: '8px', padding: '6px 12px', color: 'var(--white)', fontSize: '12px', cursor: 'pointer' },
  avatar: { width: '28px', height: '28px', borderRadius: '50%', background: 'var(--gold-dim)', border: '1px solid rgba(201,168,67,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, color: 'var(--gold)' },
  logoutBtn: { background: 'none', color: 'var(--muted)', padding: '4px', cursor: 'pointer', border: 'none' },
  content: { flex: 1, padding: '24px', maxWidth: '1200px', width: '100%', margin: '0 auto' },
  pageHeader: { marginBottom: '20px' },
  pageTitle: { fontSize: '22px', fontWeight: 600, color: 'var(--white)', margin: '0 0 4px' },
  pageDesc: { fontSize: '13px', color: 'var(--muted)', margin: 0 },
  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' },
  summaryCard: { background: 'var(--navy-mid)', border: '1px solid var(--navy-border)', borderRadius: '10px', padding: '16px', textAlign: 'center' },
  summaryValue: { fontSize: '28px', fontWeight: 700, color: 'var(--gold)', margin: '0 0 4px' },
  summaryLabel: { fontSize: '12px', color: 'var(--muted)', margin: 0 },
  filters: { display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' },
  searchInput: { flex: 1, minWidth: '200px', background: 'var(--navy-mid)', border: '1px solid var(--navy-border)', borderRadius: '8px', padding: '9px 14px', color: 'var(--white)', fontSize: '13px', outline: 'none' },
  select: { background: 'var(--navy-mid)', border: '1px solid var(--navy-border)', borderRadius: '8px', padding: '9px 14px', color: 'var(--white)', fontSize: '13px', outline: 'none' },
  refreshBtn: { display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--navy-light)', border: '1px solid var(--navy-border)', borderRadius: '8px', padding: '9px 14px', color: 'var(--muted)', fontSize: '13px', cursor: 'pointer' },
  tableWrap: { overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--navy-border)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--muted)', letterSpacing: '1px', background: 'var(--navy-mid)', borderBottom: '1px solid var(--navy-border)', whiteSpace: 'nowrap' },
  td: { padding: '10px 14px', fontSize: '13px', color: 'var(--white)', borderBottom: '1px solid rgba(46,68,112,0.5)' },
  rowRupture: { background: 'rgba(224,82,82,0.04)' },
  ref: { fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--gold)' },
  nom: { fontWeight: 500 },
  cat: { fontSize: '11px', color: 'var(--muted)', textTransform: 'capitalize' },
  empl: { fontFamily: 'var(--mono)', fontSize: '12px', background: 'var(--navy)', padding: '2px 6px', borderRadius: '4px', color: 'var(--muted)' },
  editInput: { width: '70px', background: 'var(--navy)', border: '1px solid var(--navy-border)', borderRadius: '6px', padding: '4px 8px', color: 'var(--white)', fontSize: '13px', outline: 'none' },
  saveBtn: { background: '#3CB97A', border: 'none', borderRadius: '4px', padding: '4px 8px', color: '#fff', cursor: 'pointer', fontSize: '12px' },
  cancelBtn: { background: 'var(--navy-light)', border: 'none', borderRadius: '4px', padding: '4px 8px', color: 'var(--muted)', cursor: 'pointer', fontSize: '12px' },
  editBtn: { display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--navy-light)', border: '1px solid var(--navy-border)', borderRadius: '6px', padding: '5px 9px', color: 'var(--muted)', fontSize: '11px', cursor: 'pointer' },
  center: { display: 'flex', justifyContent: 'center', padding: '60px' },
  spinner: { width: '28px', height: '28px', border: '3px solid var(--navy-border)', borderTop: '3px solid var(--gold)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
}
