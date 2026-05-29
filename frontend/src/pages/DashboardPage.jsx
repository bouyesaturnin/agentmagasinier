import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import api from '../services/api'

const ROLE_LABELS = { magasinier: 'Magasinier', responsable: 'Responsable', admin: 'Admin' }

function StatCard({ icon, label, value, sub, color = '#C9A843' }) {
  return (
    <div style={s.statCard}>
      <div style={{ ...s.statIcon, background: `${color}18`, border: `1px solid ${color}30` }}>
        {icon}
      </div>
      <div>
        <p style={s.statValue}>{value}</p>
        <p style={s.statLabel}>{label}</p>
        {sub && <p style={s.statSub}>{sub}</p>}
      </div>
    </div>
  )
}

function MiniBar({ data }) {
  if (!data || data.length === 0) return null
  const max = Math.max(...data.map(d => d.conversations), 1)
  return (
    <div style={s.barChart}>
      {data.map((d, i) => (
        <div key={i} style={s.barCol}>
          <div style={s.barWrapper}>
            <div
              style={{
                ...s.bar,
                height: `${Math.max((d.conversations / max) * 100, 4)}%`,
                background: d.conversations > 0 ? '#C9A843' : '#2E4470',
              }}
            />
          </div>
          <span style={s.barLabel}>{d.date}</span>
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/agent/dashboard/')
      .then(res => setData(res.data))
      .catch(() => setError('Impossible de charger le tableau de bord.'))
      .finally(() => setLoading(false))
  }, [])

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
          <button style={s.navBtn} onClick={() => navigate('/chat')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Chat
          </button>
          <div style={s.avatar}>{user?.full_name?.[0] || user?.username?.[0] || 'U'}</div>
          <div style={{ minWidth: 0 }}>
            <p style={s.userName}>{user?.full_name || user?.username}</p>
            <p style={s.userRole}>{ROLE_LABELS[user?.role] || user?.role}</p>
          </div>
          <button style={s.logoutBtn} onClick={handleLogout} title="Déconnexion">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div style={s.content}>
        <div style={s.pageHeader}>
          <h1 style={s.pageTitle}>Tableau de bord</h1>
          <p style={s.pageDesc}>Vue d'ensemble de l'activité LIDL_CAMPUS</p>
        </div>

        {loading && (
          <div style={s.center}>
            <div style={s.spinner}></div>
            <p style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '12px' }}>Chargement des données…</p>
          </div>
        )}

        {error && <div style={s.errorBox}>{error}</div>}

        {data && (
          <>
            {/* STATS GLOBALES */}
            <div style={s.statsGrid}>
              <StatCard
                icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9A843" strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
                label="Conversations totales"
                value={data.global.total_conversations}
                sub={`+${data.global.conv_this_week} cette semaine`}
              />
              <StatCard
                icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3CB97A" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>}
                label="Documents générés"
                value={data.global.total_documents}
                sub={`+${data.global.docs_this_week} cette semaine`}
                color="#3CB97A"
              />
              <StatCard
                icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
                label="Utilisateurs inscrits"
                value={data.global.total_users}
                sub={`${data.global.active_users} actifs ce mois`}
                color="#60A5FA"
              />
              <StatCard
                icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>}
                label="Mes conversations"
                value={data.my_stats.conversations}
                sub={`${data.my_stats.this_week} cette semaine`}
                color="#F59E0B"
              />
            </div>

            {/* GRAPHIQUE + TOP USERS */}
            <div style={s.bottomGrid}>
              {/* Activité 7 jours */}
              <div style={s.panel}>
                <p style={s.panelTitle}>Activité des 7 derniers jours</p>
                <MiniBar data={data.activity} />
                <div style={s.barLegend}>
                  <div style={s.legendDot}></div>
                  <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Conversations par jour</span>
                </div>
              </div>

              {/* Top utilisateurs */}
              <div style={s.panel}>
                <p style={s.panelTitle}>Utilisateurs les plus actifs (30 jours)</p>
                {data.top_users.length === 0 ? (
                  <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '12px' }}>Aucune activité ce mois.</p>
                ) : (
                  <div style={s.userList}>
                    {data.top_users.map((u, i) => (
                      <div key={i} style={s.userRow}>
                        <div style={s.rank}>#{i + 1}</div>
                        <div style={s.userAvatar}>{u.full_name[0] || '?'}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={s.userRowName}>{u.full_name}</p>
                          <p style={s.userRowRole}>{ROLE_LABELS[u.role] || u.role}</p>
                        </div>
                        <div style={s.convBadge}>{u.conversations} conv.</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
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
  topbarRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  navBtn: { display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--navy-light)', border: '1px solid var(--navy-border)', borderRadius: '8px', padding: '7px 12px', color: 'var(--white)', fontSize: '13px', cursor: 'pointer' },
  avatar: { width: '28px', height: '28px', borderRadius: '50%', background: 'var(--gold-dim)', border: '1px solid rgba(201,168,67,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, color: 'var(--gold)', flexShrink: 0 },
  userName: { fontSize: '12px', fontWeight: 500, color: 'var(--white)', margin: 0 },
  userRole: { fontSize: '10px', color: 'var(--muted)', margin: 0 },
  logoutBtn: { background: 'none', color: 'var(--muted)', padding: '4px', cursor: 'pointer', border: 'none' },
  content: { flex: 1, padding: '28px 24px', maxWidth: '1100px', width: '100%', margin: '0 auto' },
  pageHeader: { marginBottom: '24px' },
  pageTitle: { fontSize: '22px', fontWeight: 600, color: 'var(--white)', margin: '0 0 4px' },
  pageDesc: { fontSize: '13px', color: 'var(--muted)', margin: 0 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' },
  statCard: { background: 'var(--navy-mid)', border: '1px solid var(--navy-border)', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'flex-start', gap: '14px' },
  statIcon: { width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statValue: { fontSize: '28px', fontWeight: 700, color: 'var(--white)', margin: '0 0 2px', lineHeight: 1 },
  statLabel: { fontSize: '12px', color: 'var(--muted)', margin: '0 0 4px' },
  statSub: { fontSize: '11px', color: 'var(--success)', margin: 0 },
  bottomGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  panel: { background: 'var(--navy-mid)', border: '1px solid var(--navy-border)', borderRadius: '12px', padding: '20px' },
  panelTitle: { fontSize: '13px', fontWeight: 500, color: 'var(--white)', margin: '0 0 16px' },
  barChart: { display: 'flex', gap: '8px', alignItems: 'flex-end', height: '120px' },
  barCol: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%' },
  barWrapper: { flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end' },
  bar: { width: '100%', borderRadius: '4px 4px 0 0', minHeight: '4px', transition: 'height 0.3s ease' },
  barLabel: { fontSize: '10px', color: 'var(--muted)', whiteSpace: 'nowrap' },
  barLegend: { display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px' },
  legendDot: { width: '8px', height: '8px', borderRadius: '2px', background: '#C9A843' },
  userList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  userRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  rank: { fontSize: '12px', color: 'var(--muted)', width: '24px', flexShrink: 0 },
  userAvatar: { width: '28px', height: '28px', borderRadius: '50%', background: 'var(--navy-light)', border: '1px solid var(--navy-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, color: 'var(--gold)', flexShrink: 0 },
  userRowName: { fontSize: '13px', fontWeight: 500, color: 'var(--white)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  userRowRole: { fontSize: '11px', color: 'var(--muted)', margin: 0 },
  convBadge: { fontSize: '11px', color: 'var(--gold)', background: 'var(--gold-dim)', border: '1px solid rgba(201,168,67,0.2)', borderRadius: '12px', padding: '2px 8px', flexShrink: 0 },
  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' },
  spinner: { width: '32px', height: '32px', border: '3px solid var(--navy-border)', borderTop: '3px solid var(--gold)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  errorBox: { background: 'rgba(224,82,82,0.1)', border: '1px solid rgba(224,82,82,0.3)', borderRadius: '8px', padding: '12px 16px', color: 'var(--danger)', fontSize: '13px' },
}
