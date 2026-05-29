import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import ReactMarkdown from 'react-markdown'
import api from '../services/api'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

function getContextualSuggestions() {
  const now = new Date()
  const hour = now.getHours()
  const day = now.getDay()
  const isWeekend = day === 0 || day === 6

  if (isWeekend) return {
    label: '📋 Weekend — Questions générales',
    suggestions: [
      'Quels sont les indicateurs logistiques clés à suivre ?',
      'Explique la méthode ABC de classification des stocks',
      'Comment optimiser l\'espace de stockage à LIDL_CAMPUS ?',
      'Quelles sont les bonnes pratiques de la méthode 5S ?',
      'Comment calculer le taux de rotation des stocks ?',
    ]
  }
  if (hour >= 6 && hour < 10) return {
    label: '🌅 Matin — Réception & contrôle',
    suggestions: [
      'Génère un bon de réception pour une livraison de produits frais',
      'Comment contrôler la conformité d\'une livraison fournisseur ?',
      'Génère une fiche de non-conformité pour une livraison endommagée',
      'Quelles sont les étapes du contrôle à réception ?',
      'Comment traiter un écart entre BL et marchandise reçue ?',
    ]
  }
  if (hour >= 10 && hour < 12) return {
    label: '📦 Matinée — Préparation & picking',
    suggestions: [
      'Comment organiser efficacement le picking à LIDL_CAMPUS ?',
      'Quelles sont les méthodes de préparation de commandes ?',
      'Comment réduire les erreurs de picking ?',
      'Explique la méthode FIFO et quand l\'utiliser à LIDL_CAMPUS',
      'Comment gérer les ruptures de stock lors du picking ?',
    ]
  }
  if (hour >= 12 && hour < 14) return {
    label: '🚚 Midi — Expédition & suivi',
    suggestions: [
      'Génère un bon d\'expédition pour une commande client',
      'Comment préparer les documents d\'expédition ?',
      'Quels contrôles faire avant l\'expédition d\'une commande ?',
      'Comment suivre le statut des expéditions en cours ?',
      'Que faire en cas de retard de livraison ?',
    ]
  }
  if (hour >= 14 && hour < 17) return {
    label: '📊 Après-midi — Stocks & réapprovisionnement',
    suggestions: [
      'Calcule un stock de sécurité : 50 unités/jour, délai 7 jours, stock mini 3 jours',
      'Comment identifier les articles en rupture imminente ?',
      'Génère un rapport de niveau de stock pour les produits critiques',
      'Comment calculer le point de commande ?',
      'Quels articles nécessitent un réapprovisionnement urgent ?',
    ]
  }
  if (hour >= 17 && hour < 20) return {
    label: '🌙 Soir — Inventaire & rapport',
    suggestions: [
      'Génère un rapport d\'inventaire de fin de journée',
      'Comment traiter un écart d\'inventaire découvert en fin de journée ?',
      'Quels indicateurs inclure dans le rapport d\'activité quotidien ?',
      'Comment clôturer les opérations de la journée ?',
      'Génère un résumé des entrées/sorties de la journée',
    ]
  }
  return {
    label: '🌃 Hors horaires — Logistique générale',
    suggestions: [
      'Quels sont les indicateurs logistiques clés à suivre ?',
      'Comment optimiser l\'espace de stockage à LIDL_CAMPUS ?',
      'Explique la méthode ABC de classification des stocks',
      'Comment prévenir les accidents dans l\'entrepôt ?',
      'Quelles sont les normes de sécurité en entrepôt ?',
    ]
  }
}

function exportToPDF(content, filename) {
  const container = document.createElement('div')
  container.style.cssText = `
    position: fixed; left: -9999px; top: 0;
    width: 794px; padding: 48px 56px;
    background: #ffffff; color: #111827;
    font-family: 'Segoe UI', Arial, sans-serif;
    font-size: 14px; line-height: 1.7;
  `
  const header = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:28px;padding-bottom:16px;border-bottom:2px solid #1B2A4A;">
      <div style="background:#1B2A4A;padding:8px 14px;border-radius:6px;">
        <span style="color:#C9A843;font-weight:700;font-size:13px;letter-spacing:2px;">AGENT API</span>
      </div>
      <div>
        <p style="margin:0;font-size:11px;color:#6B7280;">LIDL_CAMPUS · API_LIDL</p>
        <p style="margin:0;font-size:11px;color:#6B7280;">Généré le ${new Date().toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' })}</p>
      </div>
    </div>
  `
  const styledContent = content
    .replace(/^### (.+)$/gm, '<h3 style="color:#1B2A4A;font-size:15px;font-weight:600;margin:16px 0 6px;">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="color:#1B2A4A;font-size:17px;font-weight:700;margin:20px 0 8px;">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="color:#1B2A4A;font-size:20px;font-weight:700;margin:0 0 16px;">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#111827;">$1</strong>')
    .replace(/^- (.+)$/gm, '<li style="margin:3px 0;">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li style="margin:3px 0;"><span style="font-weight:600;color:#1B2A4A;">$1.</span> $2</li>')
    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid #E5E7EB;margin:16px 0;">')
    .replace(/\n/g, '<br>')
  const footer = `
    <div style="margin-top:40px;padding-top:14px;border-top:1px solid #E5E7EB;display:flex;justify-content:space-between;align-items:center;">
      <span style="font-size:11px;color:#9CA3AF;">Document généré par Agent API — LIDL_CAMPUS</span>
      <span style="font-size:11px;color:#9CA3AF;">Confidentiel</span>
    </div>
  `
  container.innerHTML = header + `<div style="color:#111827;">${styledContent}</div>` + footer
  document.body.appendChild(container)
  return html2canvas(container, { scale: 2, useCORS: true, backgroundColor: '#ffffff' }).then(canvas => {
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageW = pdf.internal.pageSize.getWidth()
    const pageH = pdf.internal.pageSize.getHeight()
    const imgW = pageW
    const imgH = (canvas.height * imgW) / canvas.width
    let yPos = 0
    while (yPos < imgH) {
      if (yPos > 0) pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, -yPos, imgW, imgH)
      yPos += pageH
    }
    pdf.save(`${filename}.pdf`)
    document.body.removeChild(container)
  })
}

function getFilename(content) {
  const c = content.toLowerCase()
  if (c.includes('non-conformit')) return 'fiche-non-conformite'
  if (c.includes('bon de r')) return 'bon-reception'
  if (c.includes('bon d\'exp')) return 'bon-expedition'
  if (c.includes('inventaire')) return 'rapport-inventaire'
  if (c.includes('stock')) return 'rapport-stock'
  if (c.includes('fifo') || c.includes('lifo')) return 'procedure-stockage'
  return 'document-agent-api'
}

export default function ChatPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [conversations, setConversations] = useState([])
  const [activeConvId, setActiveConvId] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [exportingId, setExportingId] = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const { label, suggestions } = getContextualSuggestions()

  useEffect(() => { loadConversations() }, [])
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const loadConversations = async () => {
    try {
      const { data } = await api.get('/agent/conversations/')
      setConversations(data)
    } catch {}
  }

  const loadConversation = async (id) => {
    try {
      const { data } = await api.get(`/agent/conversations/${id}/`)
      setActiveConvId(id)
      setMessages(data.messages)
    } catch {}
  }

  const newConversation = () => {
    setActiveConvId(null)
    setMessages([])
    inputRef.current?.focus()
  }

  const deleteConversation = async (id, e) => {
    e.stopPropagation()
    await api.delete(`/agent/conversations/${id}/`)
    setConversations(prev => prev.filter(c => c.id !== id))
    if (activeConvId === id) newConversation()
  }

  const sendMessage = async (text) => {
    const msg = (text || input).trim()
    if (!msg || loading) return
    setInput('')
    const userMsg = { id: Date.now(), role: 'user', content: msg, created_at: new Date().toISOString() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)
    try {
      const { data } = await api.post('/agent/chat/', {
        message: msg,
        conversation_id: activeConvId,
      })
      setActiveConvId(data.conversation_id)
      setMessages(prev => [...prev, data.message])
      loadConversations()
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Une erreur est survenue. Vérifiez votre connexion et réessayez.',
        created_at: new Date().toISOString(),
      }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleExport = async (msg) => {
    setExportingId(msg.id)
    try {
      await exportToPDF(msg.content, getFilename(msg.content))
    } finally {
      setExportingId(null)
    }
  }

  const handleKey = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div style={s.shell}>
      {/* SIDEBAR */}
      <aside style={{ ...s.sidebar, width: sidebarOpen ? '260px' : '0', overflow: sidebarOpen ? 'visible' : 'hidden' }}>
        <div style={s.sidebarInner}>
          <div style={s.sidebarHeader}>
            <div style={s.logoMark}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A843" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              </svg>
            </div>
            <div>
              <p style={s.brandName}>AGENT API</p>
              <p style={s.brandSub}>LIDL_CAMPUS</p>
            </div>
          </div>

          <button style={s.newBtn} onClick={newConversation}>
            <span style={{ fontSize: '16px', lineHeight: 1 }}>+</span>
            Nouvelle conversation
          </button>

          <div style={s.convSection}>
            <p style={s.convLabel}>Historique</p>
            <div style={s.convList}>
              {conversations.length === 0 && (
                <p style={s.emptyConvs}>Aucune conversation</p>
              )}
              {conversations.map(c => (
                <div
                  key={c.id}
                  style={{ ...s.convItem, ...(activeConvId === c.id ? s.convItemActive : {}) }}
                  onClick={() => loadConversation(c.id)}
                >
                  <div style={s.convIcon}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={s.convTitle}>{c.title}</p>
                    {c.last_message && (
                      <p style={s.convPreview}>{c.last_message.content.slice(0, 40)}…</p>
                    )}
                  </div>
                  <button style={s.deleteBtn} onClick={e => deleteConversation(c.id, e)} title="Supprimer">×</button>
                </div>
              ))}
            </div>
          </div>

          <div style={s.userRow}>
            <div style={s.avatar}>{user?.full_name?.[0] || user?.username?.[0] || 'U'}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={s.userName}>{user?.full_name || user?.username}</p>
              <p style={s.userRole}>{user?.role_display || user?.role}</p>
            </div>
            <button style={s.logoutBtn} onClick={handleLogout} title="Déconnexion">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main style={s.main}>
        <div style={s.topbar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button style={s.menuBtn} onClick={() => setSidebarOpen(v => !v)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <button style={s.dashBtn} onClick={() => navigate('/dashboard')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
              Tableau de bord
            </button>
          </div>
          <div style={s.topbarStatus}>
            <div style={s.statusDot}></div>
            <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Agent API opérationnel</span>
          </div>
        </div>

        <div style={s.messagesArea}>
          {messages.length === 0 ? (
            <div style={s.welcome}>
              <div style={s.welcomeIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C9A843" strokeWidth="1.5">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9,22 9,12 15,12 15,22"/>
                </svg>
              </div>
              <h2 style={s.welcomeTitle}>Bonjour{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''} !</h2>
              <p style={s.welcomeText}>Je suis <strong>Agent API</strong>, votre assistant logistique dédié à <strong>LIDL_CAMPUS</strong>. Comment puis-je vous aider aujourd'hui ?</p>

              {/* Label contextuel */}
              <div style={s.contextLabel}>{label}</div>

              <div style={s.chips}>
                {suggestions.map((sug, i) => (
                  <button key={i} style={s.chip} onClick={() => sendMessage(sug)}>{sug}</button>
                ))}
              </div>
            </div>
          ) : (
            <div style={s.messageList}>
              {messages.map(msg => (
                <div key={msg.id} style={{ ...s.msgRow, ...(msg.role === 'user' ? s.msgRowUser : {}) }}>
                  {msg.role === 'assistant' && (
                    <div style={s.agentAvatar}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9A843" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      </svg>
                    </div>
                  )}
                  <div style={msg.role === 'assistant' ? s.bubbleWrapper : { maxWidth: '72%' }}>
                    <div
                      className="prose"
                      style={{ ...s.bubble, ...(msg.role === 'user' ? s.bubbleUser : s.bubbleAgent) }}
                    >
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                    {msg.role === 'assistant' && (
                      <button
                        style={{ ...s.pdfBtn, ...(exportingId === msg.id ? s.pdfBtnActive : {}) }}
                        onClick={() => handleExport(msg)}
                        disabled={exportingId === msg.id}
                        title="Télécharger en PDF"
                      >
                        {exportingId === msg.id ? (
                          <>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                            </svg>
                            Génération…
                          </>
                        ) : (
                          <>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                              <polyline points="7,10 12,15 17,10"/>
                              <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                            Exporter PDF
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div style={s.msgRow}>
                  <div style={s.agentAvatar}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9A843" strokeWidth="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    </svg>
                  </div>
                  <div style={{ ...s.bubble, ...s.bubbleAgent }}>
                    <div style={s.typing}>
                      {[0, 0.2, 0.4].map((d, i) => (
                        <div key={i} style={{ ...s.dot, animationDelay: `${d}s` }}></div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div style={s.inputArea}>
          <div style={s.inputWrap}>
            <textarea
              ref={inputRef}
              style={s.textarea}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Posez votre question logistique… (Entrée pour envoyer)"
              rows={1}
            />
            <button
              style={{ ...s.sendBtn, opacity: (!input.trim() || loading) ? 0.4 : 1 }}
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22,2 15,22 11,13 2,9"/>
              </svg>
            </button>
          </div>
          <p style={s.inputHint}>Shift+Entrée pour aller à la ligne</p>
        </div>
      </main>

      <style>{`
        @keyframes blink { 0%,80%,100%{opacity:.2} 40%{opacity:1} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

        .prose p { margin: 6px 0; }
        .prose p:first-child { margin-top: 0; }
        .prose p:last-child { margin-bottom: 0; }
        .prose h1, .prose h2, .prose h3 { font-weight: 600; margin: 14px 0 6px; color: var(--gold); }
        .prose h1 { font-size: 16px; }
        .prose h2 { font-size: 15px; }
        .prose h3 { font-size: 14px; }
        .prose ul, .prose ol { padding-left: 20px; margin: 6px 0; }
        .prose li { margin: 4px 0; }
        .prose strong { color: var(--white); font-weight: 600; }
        .prose em { color: var(--muted); font-style: italic; }
        .prose hr { border: none; border-top: 1px solid var(--navy-border); margin: 12px 0; }
        .prose code { font-family: var(--mono); background: var(--navy); color: var(--gold); padding: 2px 6px; border-radius: 4px; font-size: 12px; }
        .prose pre { background: var(--navy); border: 1px solid var(--navy-border); border-radius: 8px; padding: 12px; margin: 8px 0; overflow-x: auto; }
        .prose pre code { background: none; padding: 0; color: var(--white); }
        .prose blockquote { border-left: 3px solid var(--gold); padding-left: 12px; margin: 8px 0; color: var(--muted); }
        .prose table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 13px; }
        .prose th { background: var(--navy); color: var(--gold); padding: 6px 10px; text-align: left; border: 1px solid var(--navy-border); }
        .prose td { padding: 6px 10px; border: 1px solid var(--navy-border); }
        .prose tr:nth-child(even) td { background: rgba(255,255,255,0.02); }
      `}</style>
    </div>
  )
}

const s = {
  shell: { display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--navy)' },
  sidebar: { flexShrink: 0, transition: 'width 0.2s ease', borderRight: '1px solid var(--navy-border)' },
  sidebarInner: { width: '260px', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--navy-mid)' },
  sidebarHeader: { display: 'flex', alignItems: 'center', gap: '10px', padding: '20px 16px 16px' },
  logoMark: { width: '32px', height: '32px', background: 'var(--gold-dim)', border: '1px solid rgba(201,168,67,0.3)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  brandName: { fontSize: '11px', fontWeight: 600, letterSpacing: '2px', color: 'var(--gold)', margin: 0 },
  brandSub: { fontSize: '10px', color: 'var(--muted)', margin: 0 },
  newBtn: { margin: '0 12px 16px', padding: '9px 14px', background: 'var(--gold-dim)', border: '1px solid rgba(201,168,67,0.25)', borderRadius: '8px', color: 'var(--gold)', fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' },
  convSection: { flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  convLabel: { fontSize: '10px', letterSpacing: '1.5px', color: 'var(--muted)', padding: '0 16px', marginBottom: '6px', fontWeight: 500 },
  convList: { flex: 1, overflowY: 'auto', padding: '0 8px' },
  emptyConvs: { fontSize: '12px', color: 'var(--muted)', padding: '8px', textAlign: 'center' },
  convItem: { display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '8px', borderRadius: '8px', cursor: 'pointer', marginBottom: '2px' },
  convItemActive: { background: 'var(--navy-light)' },
  convIcon: { marginTop: '2px', color: 'var(--muted)', flexShrink: 0, fontSize: '12px' },
  convTitle: { fontSize: '12px', color: 'var(--white)', fontWeight: 500, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  convPreview: { fontSize: '11px', color: 'var(--muted)', margin: 0, marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  deleteBtn: { background: 'none', color: 'var(--muted)', fontSize: '16px', padding: '0 4px', flexShrink: 0, opacity: 0.5, lineHeight: 1 },
  userRow: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderTop: '1px solid var(--navy-border)' },
  avatar: { width: '30px', height: '30px', borderRadius: '50%', background: 'var(--gold-dim)', border: '1px solid rgba(201,168,67,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, color: 'var(--gold)', flexShrink: 0 },
  userName: { fontSize: '12px', fontWeight: 500, color: 'var(--white)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  userRole: { fontSize: '10px', color: 'var(--muted)', margin: 0, textTransform: 'capitalize' },
  logoutBtn: { background: 'none', color: 'var(--muted)', padding: '4px', flexShrink: 0, border: 'none', cursor: 'pointer' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  topbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid var(--navy-border)', background: 'var(--navy)' },
  menuBtn: { background: 'none', color: 'var(--muted)', padding: '6px', borderRadius: '6px', border: 'none', cursor: 'pointer' },
  dashBtn: { display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--navy-light)', border: '1px solid var(--navy-border)', borderRadius: '8px', padding: '6px 12px', color: 'var(--muted)', fontSize: '12px', cursor: 'pointer' },
  topbarStatus: { display: 'flex', alignItems: 'center', gap: '8px' },
  statusDot: { width: '7px', height: '7px', borderRadius: '50%', background: 'var(--success)' },
  messagesArea: { flex: 1, overflowY: 'auto', padding: '0' },
  welcome: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100%', padding: '40px 24px', textAlign: 'center' },
  welcomeIcon: { width: '64px', height: '64px', background: 'var(--gold-dim)', border: '1px solid rgba(201,168,67,0.2)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' },
  welcomeTitle: { fontSize: '22px', fontWeight: 500, marginBottom: '10px', color: 'var(--white)' },
  welcomeText: { fontSize: '14px', color: 'var(--muted)', maxWidth: '460px', lineHeight: 1.7, marginBottom: '16px' },
  contextLabel: { fontSize: '12px', color: 'var(--gold)', background: 'var(--gold-dim)', border: '1px solid rgba(201,168,67,0.2)', borderRadius: '20px', padding: '5px 14px', marginBottom: '16px', letterSpacing: '0.3px' },
  chips: { display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', maxWidth: '620px' },
  chip: { background: 'var(--navy-mid)', border: '1px solid var(--navy-border)', borderRadius: '20px', padding: '7px 14px', fontSize: '12px', color: 'var(--muted)', cursor: 'pointer' },
  messageList: { padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' },
  msgRow: { display: 'flex', gap: '10px', alignItems: 'flex-start', animation: 'fadeIn 0.2s ease' },
  msgRowUser: { flexDirection: 'row-reverse' },
  agentAvatar: { width: '28px', height: '28px', borderRadius: '8px', background: 'var(--gold-dim)', border: '1px solid rgba(201,168,67,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' },
  bubbleWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px', maxWidth: '72%' },
  bubble: { width: '100%', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', lineHeight: 1.7 },
  bubbleAgent: { background: 'var(--navy-light)', border: '1px solid var(--navy-border)', borderTopLeftRadius: '4px', color: 'var(--white)' },
  bubbleUser: { background: '#1B3A6B', border: '1px solid #2E4470', borderTopRightRadius: '4px', color: 'var(--white)' },
  pdfBtn: { display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', background: 'transparent', border: '1px solid var(--navy-border)', borderRadius: '6px', color: 'var(--muted)', fontSize: '11px', cursor: 'pointer' },
  pdfBtnActive: { border: '1px solid rgba(201,168,67,0.4)', color: 'var(--gold)' },
  typing: { display: 'flex', gap: '4px', alignItems: 'center', padding: '2px 0' },
  dot: { width: '7px', height: '7px', borderRadius: '50%', background: 'var(--gold)', animation: 'blink 1.2s infinite' },
  inputArea: { padding: '16px 20px 20px', borderTop: '1px solid var(--navy-border)', background: 'var(--navy)' },
  inputWrap: { display: 'flex', gap: '10px', alignItems: 'flex-end', background: 'var(--navy-mid)', border: '1px solid var(--navy-border)', borderRadius: '12px', padding: '10px 12px' },
  textarea: { flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--white)', fontSize: '14px', resize: 'none', lineHeight: 1.6, maxHeight: '120px', overflowY: 'auto' },
  sendBtn: { background: 'var(--gold)', border: 'none', borderRadius: '8px', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--navy)', flexShrink: 0, cursor: 'pointer' },
  inputHint: { fontSize: '11px', color: 'var(--muted)', marginTop: '6px', paddingLeft: '2px', opacity: 0.6 },
}
