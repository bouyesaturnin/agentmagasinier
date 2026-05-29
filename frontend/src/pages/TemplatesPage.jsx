import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import ReactMarkdown from 'react-markdown'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

// ─── Définition des templates ───────────────────────────────────────────────

const TEMPLATES = [
  {
    id: 'nc',
    icon: '⚠️',
    title: 'Fiche de Non-Conformité',
    desc: 'Signaler une livraison endommagée, manquante ou non conforme',
    color: '#E05252',
    fields: [
      { name: 'fournisseur', label: 'Fournisseur', placeholder: 'Nom du fournisseur', required: true },
      { name: 'numero_bl', label: 'N° Bon de livraison', placeholder: 'BL-2024-XXXX', required: true },
      { name: 'date_livraison', label: 'Date de livraison', type: 'date', required: true },
      { name: 'produits', label: 'Produits concernés', placeholder: 'Ex: 50 colis de yaourts, réf. YAO-001', required: true, textarea: true },
      { name: 'type_nc', label: 'Type de non-conformité', type: 'select', options: ['Produits endommagés', 'Quantité manquante', 'Produits périmés', 'Erreur de référence', 'Conditionnement défectueux', 'Température non respectée'], required: true },
      { name: 'description', label: 'Description détaillée', placeholder: 'Décrivez précisément le problème constaté...', required: true, textarea: true },
      { name: 'quantite_nc', label: 'Quantité non conforme', placeholder: 'Ex: 12 colis sur 50', required: true },
      { name: 'agent', label: 'Agent réceptionnaire', placeholder: 'Prénom Nom', required: true },
    ],
    buildPrompt: (data) => `Tu es Agent API, assistant logistique LIDL_CAMPUS. Génère une fiche de non-conformité professionnelle et complète avec les informations suivantes :

- Fournisseur : ${data.fournisseur}
- N° BL : ${data.numero_bl}
- Date de livraison : ${data.date_livraison}
- Produits concernés : ${data.produits}
- Type de NC : ${data.type_nc}
- Description : ${data.description}
- Quantité non conforme : ${data.quantite_nc}
- Agent réceptionnaire : ${data.agent}

La fiche doit inclure : en-tête LIDL_CAMPUS, numéro de dossier (généré automatiquement), toutes les informations fournies, les actions correctives recommandées, les réserves à émettre sur le BL, le suivi à effectuer, et la section archivage. Format professionnel avec sections numérotées.`
  },
  {
    id: 'bl',
    icon: '📦',
    title: 'Bon de Réception',
    desc: 'Enregistrer et valider la réception d\'une livraison fournisseur',
    color: '#3CB97A',
    fields: [
      { name: 'fournisseur', label: 'Fournisseur', placeholder: 'Nom du fournisseur', required: true },
      { name: 'numero_commande', label: 'N° Commande', placeholder: 'CMD-2024-XXXX', required: true },
      { name: 'date_reception', label: 'Date de réception', type: 'date', required: true },
      { name: 'heure_reception', label: 'Heure de réception', type: 'time', required: true },
      { name: 'transporteur', label: 'Transporteur', placeholder: 'Nom du transporteur', required: false },
      { name: 'produits', label: 'Produits reçus', placeholder: 'Liste des produits, références et quantités...', required: true, textarea: true },
      { name: 'etat_livraison', label: 'État de la livraison', type: 'select', options: ['Conforme — RAS', 'Conforme avec réserves mineures', 'Non conforme — réserves émises', 'Refus partiel', 'Refus total'], required: true },
      { name: 'observations', label: 'Observations', placeholder: 'Remarques, réserves éventuelles...', required: false, textarea: true },
      { name: 'agent', label: 'Agent réceptionnaire', placeholder: 'Prénom Nom', required: true },
    ],
    buildPrompt: (data) => `Tu es Agent API, assistant logistique LIDL_CAMPUS. Génère un bon de réception professionnel et complet avec les informations suivantes :

- Fournisseur : ${data.fournisseur}
- N° Commande : ${data.numero_commande}
- Date de réception : ${data.date_reception}
- Heure : ${data.heure_reception}
- Transporteur : ${data.transporteur || 'Non renseigné'}
- Produits reçus : ${data.produits}
- État de la livraison : ${data.etat_livraison}
- Observations : ${data.observations || 'Aucune'}
- Agent réceptionnaire : ${data.agent}

Le bon de réception doit inclure : en-tête LIDL_CAMPUS, numéro BR (généré), tableau récapitulatif des produits, contrôles effectués (quantité, qualité, température, DLC), statut de conformité, actions à effectuer, et validation. Format professionnel.`
  },
  {
    id: 'inventaire',
    icon: '📋',
    title: 'Rapport d\'Inventaire',
    desc: 'Générer un rapport de comptage et d\'écarts de stock',
    color: '#60A5FA',
    fields: [
      { name: 'zone', label: 'Zone inventoriée', placeholder: 'Ex: Allée A, Zone Frais, Entrepôt principal...', required: true },
      { name: 'date_inventaire', label: 'Date d\'inventaire', type: 'date', required: true },
      { name: 'type_inventaire', label: 'Type d\'inventaire', type: 'select', options: ['Inventaire tournant', 'Inventaire partiel', 'Inventaire complet', 'Inventaire surprise', 'Inventaire de clôture'], required: true },
      { name: 'articles', label: 'Articles comptés (référence, stock théorique, stock réel)', placeholder: 'Ex:\n- REF001 : théorique 100, réel 98, écart -2\n- REF002 : théorique 50, réel 52, écart +2', required: true, textarea: true },
      { name: 'ecarts', label: 'Écarts significatifs constatés', placeholder: 'Décrivez les écarts importants et leurs causes supposées...', required: false, textarea: true },
      { name: 'agent_1', label: 'Agent compteur 1', placeholder: 'Prénom Nom', required: true },
      { name: 'agent_2', label: 'Agent compteur 2 (contrôle)', placeholder: 'Prénom Nom', required: false },
      { name: 'observations', label: 'Observations générales', placeholder: 'Conditions de l\'inventaire, anomalies constatées...', required: false, textarea: true },
    ],
    buildPrompt: (data) => `Tu es Agent API, assistant logistique LIDL_CAMPUS. Génère un rapport d'inventaire professionnel et complet avec les informations suivantes :

- Zone inventoriée : ${data.zone}
- Date : ${data.date_inventaire}
- Type d'inventaire : ${data.type_inventaire}
- Articles comptés : ${data.articles}
- Écarts constatés : ${data.ecarts || 'Aucun écart significatif'}
- Agent compteur 1 : ${data.agent_1}
- Agent compteur 2 : ${data.agent_2 || 'Inventaire solo'}
- Observations : ${data.observations || 'Aucune'}

Le rapport doit inclure : en-tête LIDL_CAMPUS, résumé exécutif, tableau des articles avec écarts calculés en %, analyse des écarts (causes probables), taux de fiabilité du stock, actions correctives recommandées, et validation. Format professionnel avec indicateurs chiffrés.`
  }
]

// ─── Export PDF ──────────────────────────────────────────────────────────────

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
    <div style="margin-top:40px;padding-top:14px;border-top:1px solid #E5E7EB;display:flex;justify-content:space-between;">
      <span style="font-size:11px;color:#9CA3AF;">Document généré par Agent API — LIDL_CAMPUS</span>
      <span style="font-size:11px;color:#9CA3AF;">Confidentiel</span>
    </div>
  `
  container.innerHTML = header + `<div>${styledContent}</div>` + footer
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

// ─── Composant principal ─────────────────────────────────────────────────────

export default function TemplatesPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [selected, setSelected] = useState(null)
  const [formData, setFormData] = useState({})
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState('')

  const handleLogout = () => { logout(); navigate('/login') }

  const handleSelect = (tpl) => {
    setSelected(tpl)
    setFormData({})
    setResult('')
    setError('')
  }

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setResult('')
    setLoading(true)

    const prompt = selected.buildPrompt(formData)

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 2000,
          messages: [{ role: 'user', content: prompt }],
        })
      })
      const data = await response.json()
      const text = data.content?.find(b => b.type === 'text')?.text || ''
      setResult(text)
    } catch {
      setError('Erreur lors de la génération. Vérifiez votre connexion.')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    setExporting(true)
    const filenames = { nc: 'fiche-non-conformite', bl: 'bon-reception', inventaire: 'rapport-inventaire' }
    await exportToPDF(result, filenames[selected.id])
    setExporting(false)
  }

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
          <button style={s.navBtn} onClick={() => navigate('/dashboard')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
            Dashboard
          </button>
          <div style={s.avatar}>{user?.full_name?.[0] || user?.username?.[0] || 'U'}</div>
          <button style={s.logoutBtn} onClick={handleLogout}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
          </button>
        </div>
      </div>

      <div style={s.content}>
        <div style={s.pageHeader}>
          <h1 style={s.pageTitle}>Templates de fiches</h1>
          <p style={s.pageDesc}>Remplissez le formulaire, l'IA génère le document complet</p>
        </div>

        {/* CARTES TEMPLATES */}
        {!selected && (
          <div style={s.cardsGrid}>
            {TEMPLATES.map(tpl => (
              <div key={tpl.id} style={s.card} onClick={() => handleSelect(tpl)}>
                <div style={{ ...s.cardIcon, background: `${tpl.color}18`, border: `1px solid ${tpl.color}30` }}>
                  <span style={{ fontSize: '24px' }}>{tpl.icon}</span>
                </div>
                <h2 style={s.cardTitle}>{tpl.title}</h2>
                <p style={s.cardDesc}>{tpl.desc}</p>
                <div style={{ ...s.cardBtn, borderColor: `${tpl.color}40`, color: tpl.color }}>
                  Remplir ce formulaire →
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FORMULAIRE */}
        {selected && !result && (
          <div style={s.formWrapper}>
            <button style={s.backBtn} onClick={() => setSelected(null)}>
              ← Retour aux templates
            </button>
            <div style={s.formHeader}>
              <span style={{ fontSize: '28px' }}>{selected.icon}</span>
              <div>
                <h2 style={s.formTitle}>{selected.title}</h2>
                <p style={s.formDesc}>{selected.desc}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={s.form}>
              {selected.fields.map(field => (
                <div key={field.name} style={s.field}>
                  <label style={s.label}>
                    {field.label}
                    {field.required && <span style={{ color: 'var(--danger)', marginLeft: '3px' }}>*</span>}
                  </label>
                  {field.textarea ? (
                    <textarea
                      style={{ ...s.input, minHeight: '80px', resize: 'vertical' }}
                      value={formData[field.name] || ''}
                      onChange={e => handleChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      required={field.required}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      style={s.input}
                      value={formData[field.name] || ''}
                      onChange={e => handleChange(field.name, e.target.value)}
                      required={field.required}
                    >
                      <option value="">Sélectionner...</option>
                      {field.options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      style={s.input}
                      type={field.type || 'text'}
                      value={formData[field.name] || ''}
                      onChange={e => handleChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      required={field.required}
                    />
                  )}
                </div>
              ))}

              {error && <p style={s.errorBox}>{error}</p>}

              <button
                type="submit"
                style={{ ...s.submitBtn, opacity: loading ? 0.7 : 1 }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                    Génération en cours…
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                    </svg>
                    Générer le document
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* RÉSULTAT */}
        {selected && result && (
          <div style={s.resultWrapper}>
            <div style={s.resultHeader}>
              <button style={s.backBtn} onClick={() => { setResult(''); setFormData({}) }}>
                ← Nouveau formulaire
              </button>
              <button
                style={{ ...s.exportBtn, opacity: exporting ? 0.7 : 1 }}
                onClick={handleExport}
                disabled={exporting}
              >
                {exporting ? (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                    Export…
                  </>
                ) : (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7,10 12,15 17,10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Exporter PDF
                  </>
                )}
              </button>
            </div>
            <div style={s.resultDoc} className="prose">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .prose p { margin: 6px 0; }
        .prose p:first-child { margin-top: 0; }
        .prose p:last-child { margin-bottom: 0; }
        .prose h1, .prose h2, .prose h3 { font-weight: 600; margin: 14px 0 6px; color: var(--gold); }
        .prose h1 { font-size: 16px; } .prose h2 { font-size: 15px; } .prose h3 { font-size: 14px; }
        .prose ul, .prose ol { padding-left: 20px; margin: 6px 0; }
        .prose li { margin: 4px 0; }
        .prose strong { color: var(--white); font-weight: 600; }
        .prose hr { border: none; border-top: 1px solid var(--navy-border); margin: 12px 0; }
        .prose table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 13px; }
        .prose th { background: var(--navy); color: var(--gold); padding: 6px 10px; text-align: left; border: 1px solid var(--navy-border); }
        .prose td { padding: 6px 10px; border: 1px solid var(--navy-border); }
        .prose tr:nth-child(even) td { background: rgba(255,255,255,0.02); }
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
  topbarRight: { display: 'flex', alignItems: 'center', gap: '10px' },
  navBtn: { display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--navy-light)', border: '1px solid var(--navy-border)', borderRadius: '8px', padding: '7px 12px', color: 'var(--white)', fontSize: '13px', cursor: 'pointer' },
  avatar: { width: '28px', height: '28px', borderRadius: '50%', background: 'var(--gold-dim)', border: '1px solid rgba(201,168,67,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, color: 'var(--gold)' },
  logoutBtn: { background: 'none', color: 'var(--muted)', padding: '4px', cursor: 'pointer', border: 'none' },
  content: { flex: 1, padding: '28px 24px', maxWidth: '900px', width: '100%', margin: '0 auto' },
  pageHeader: { marginBottom: '28px' },
  pageTitle: { fontSize: '22px', fontWeight: 600, color: 'var(--white)', margin: '0 0 4px' },
  pageDesc: { fontSize: '13px', color: 'var(--muted)', margin: 0 },
  cardsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' },
  card: { background: 'var(--navy-mid)', border: '1px solid var(--navy-border)', borderRadius: '14px', padding: '24px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'border-color 0.15s' },
  cardIcon: { width: '52px', height: '52px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: '16px', fontWeight: 600, color: 'var(--white)', margin: 0 },
  cardDesc: { fontSize: '13px', color: 'var(--muted)', margin: 0, lineHeight: 1.6, flex: 1 },
  cardBtn: { fontSize: '12px', padding: '7px 0', border: '1px solid', borderRadius: '6px', textAlign: 'center', marginTop: '4px', background: 'transparent' },
  backBtn: { background: 'none', border: 'none', color: 'var(--muted)', fontSize: '13px', cursor: 'pointer', padding: '0', marginBottom: '20px', display: 'block' },
  formWrapper: { maxWidth: '680px' },
  formHeader: { display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '24px', padding: '16px', background: 'var(--navy-mid)', borderRadius: '12px', border: '1px solid var(--navy-border)' },
  formTitle: { fontSize: '18px', fontWeight: 600, color: 'var(--white)', margin: '0 0 4px' },
  formDesc: { fontSize: '13px', color: 'var(--muted)', margin: 0 },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '12px', color: 'var(--muted)', fontWeight: 500, letterSpacing: '0.3px' },
  input: { background: 'var(--navy)', border: '1px solid var(--navy-border)', borderRadius: '8px', padding: '10px 14px', color: 'var(--white)', fontSize: '14px', outline: 'none', fontFamily: 'var(--font)' },
  errorBox: { fontSize: '13px', color: 'var(--danger)', padding: '10px 14px', background: 'rgba(224,82,82,0.1)', borderRadius: '8px', border: '1px solid rgba(224,82,82,0.2)' },
  submitBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'var(--gold)', color: 'var(--navy)', border: 'none', borderRadius: '10px', padding: '13px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', marginTop: '8px' },
  resultWrapper: { maxWidth: '800px' },
  resultHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' },
  resultDoc: { background: 'var(--navy-mid)', border: '1px solid var(--navy-border)', borderRadius: '12px', padding: '24px' },
  exportBtn: { display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--gold)', color: 'var(--navy)', border: 'none', borderRadius: '8px', padding: '9px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' },
}
