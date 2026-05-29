# backend/agent/stock_alert.py
import resend
from django.conf import settings


RUPTURE_KEYWORDS = [
    'rupture de stock', 'rupture stock', 'stock épuisé', 'stock vide',
    'plus en stock', 'en rupture', 'stock insuffisant', 'stock critique',
    'réapprovisionnement urgent', 'stock à zéro', 'manque de stock',
    'pénurie', 'stock nul', 'rupture imminente', 'stock insuffisant',
]


def detect_stock_alert(message_content: str) -> bool:
    """Détecte si un message contient une alerte de rupture de stock."""
    content_lower = message_content.lower()
    return any(keyword in content_lower for keyword in RUPTURE_KEYWORDS)


def send_stock_alert(user, message_content: str, conversation_title: str):
    """Envoie une alerte email au responsable et au magasinier."""
    resend.api_key = settings.RESEND_API_KEY

    # Récupérer les responsables et admins
    from django.contrib.auth import get_user_model
    User = get_user_model()

    responsables = User.objects.filter(
        role__in=['responsable', 'admin'],
        is_active=True,
        email__isnull=False
    ).exclude(email='')

    recipients = list(responsables.values_list('email', flat=True))

    # Ajouter le magasinier qui a signalé
    if user.email and user.email not in recipients:
        recipients.append(user.email)

    if not recipients:
        return False

    # Extraire un extrait du message
    excerpt = message_content[:300] + '…' if len(message_content) > 300 else message_content

    html_content = f"""
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:560px;margin:0 auto;padding:40px 32px;background:#ffffff;">

      <div style="display:flex;align-items:center;gap:12px;margin-bottom:28px;padding-bottom:16px;border-bottom:2px solid #1B2A4A;">
        <div style="background:#1B2A4A;padding:8px 14px;border-radius:6px;">
          <span style="color:#C9A843;font-weight:700;font-size:13px;letter-spacing:2px;">AGENT API</span>
        </div>
        <div>
          <p style="margin:0;font-size:11px;color:#6B7280;">LIDL_CAMPUS · API_LIDL</p>
        </div>
      </div>

      <div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:10px;padding:16px 20px;margin-bottom:24px;display:flex;align-items:flex-start;gap:12px;">
        <span style="font-size:24px;">⚠️</span>
        <div>
          <p style="margin:0 0 4px;font-weight:700;color:#DC2626;font-size:15px;">Alerte Rupture de Stock</p>
          <p style="margin:0;font-size:13px;color:#7F1D1D;">Une rupture de stock a été détectée par Agent API</p>
        </div>
      </div>

      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <tr>
          <td style="padding:8px 12px;background:#F9FAFB;border:1px solid #E5E7EB;font-size:12px;color:#6B7280;font-weight:600;width:40%;">Signalé par</td>
          <td style="padding:8px 12px;border:1px solid #E5E7EB;font-size:13px;color:#111827;">{user.get_full_name() or user.username} ({user.get_role_display()})</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;background:#F9FAFB;border:1px solid #E5E7EB;font-size:12px;color:#6B7280;font-weight:600;">Conversation</td>
          <td style="padding:8px 12px;border:1px solid #E5E7EB;font-size:13px;color:#111827;">{conversation_title}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;background:#F9FAFB;border:1px solid #E5E7EB;font-size:12px;color:#6B7280;font-weight:600;">Entrepôt</td>
          <td style="padding:8px 12px;border:1px solid #E5E7EB;font-size:13px;color:#111827;">{user.entrepot}</td>
        </tr>
      </table>

      <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:16px;margin-bottom:24px;">
        <p style="margin:0 0 8px;font-size:12px;color:#64748B;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Extrait du message Agent API</p>
        <p style="margin:0;font-size:13px;color:#1E293B;line-height:1.6;">{excerpt}</p>
      </div>

      <div style="background:#FFF7ED;border:1px solid #FED7AA;border-radius:8px;padding:14px 16px;margin-bottom:28px;">
        <p style="margin:0;font-size:13px;color:#92400E;font-weight:600;">⚡ Action requise</p>
        <p style="margin:4px 0 0;font-size:13px;color:#92400E;">Veuillez vérifier le stock concerné et lancer le réapprovisionnement si nécessaire.</p>
      </div>

      <div style="padding-top:16px;border-top:1px solid #E5E7EB;display:flex;justify-content:space-between;">
        <span style="font-size:11px;color:#9CA3AF;">Agent API — LIDL_CAMPUS</span>
        <span style="font-size:11px;color:#9CA3AF;">Alerte automatique</span>
      </div>
    </div>
    """

    try:
        resend.Emails.send({
            "from": settings.DEFAULT_FROM_EMAIL,
            "to": recipients,
            "subject": f"⚠️ Alerte Rupture de Stock — LIDL_CAMPUS | {user.get_full_name() or user.username}",
            "html": html_content,
        })
        return True
    except Exception as e:
        print(f"Erreur envoi alerte stock : {e}")
        return False
