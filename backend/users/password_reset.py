from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
import resend

from .models import User


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip()
        if not email:
            return Response({'error': 'Email requis.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # On renvoie toujours un succès pour ne pas révéler si l'email existe
            return Response({'message': 'Si cet email existe, un lien a été envoyé.'})

        # Générer le token
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        # Lien de réinitialisation
        reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"

        # Envoyer l'email via Resend
        resend.api_key = settings.RESEND_API_KEY

        html_content = f"""
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 32px; background: #ffffff;">
            <div style="margin-bottom: 28px; padding-bottom: 16px; border-bottom: 2px solid #1B2A4A;">
                <span style="background: #1B2A4A; color: #C9A843; font-weight: 700; font-size: 13px; letter-spacing: 2px; padding: 6px 12px; border-radius: 4px;">AGENT API</span>
                <span style="color: #6B7280; font-size: 12px; margin-left: 10px;">LIDL_CAMPUS</span>
            </div>

            <h2 style="color: #1B2A4A; font-size: 20px; font-weight: 600; margin: 0 0 12px;">Réinitialisation de mot de passe</h2>
            <p style="color: #374151; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
                Bonjour <strong>{user.get_full_name() or user.username}</strong>,<br><br>
                Vous avez demandé la réinitialisation de votre mot de passe pour votre compte <strong>Agent API — LIDL_CAMPUS</strong>.
            </p>

            <a href="{reset_url}" style="display: inline-block; background: #C9A843; color: #1B2A4A; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 8px; text-decoration: none; margin-bottom: 24px;">
                Réinitialiser mon mot de passe
            </a>

            <p style="color: #6B7280; font-size: 12px; line-height: 1.6; margin: 0;">
                Ce lien est valable <strong>24 heures</strong>. Si vous n'avez pas fait cette demande, ignorez cet email.<br><br>
                Pour des raisons de sécurité, ne partagez jamais ce lien.
            </p>

            <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #E5E7EB;">
                <span style="color: #9CA3AF; font-size: 11px;">Document généré par Agent API — LIDL_CAMPUS · Confidentiel</span>
            </div>
        </div>
        """

        try:
            resend.Emails.send({
                "from": settings.DEFAULT_FROM_EMAIL,
                "to": [email],
                "subject": "Réinitialisation de votre mot de passe — Agent API LIDL_CAMPUS",
                "html": html_content,
            })
        except Exception as e:
            return Response({'error': f'Erreur envoi email : {str(e)}'}, status=status.HTTP_502_BAD_GATEWAY)

        return Response({'message': 'Si cet email existe, un lien a été envoyé.'})


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        uid = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('password', '')

        if not all([uid, token, new_password]):
            return Response({'error': 'Données manquantes.'}, status=status.HTTP_400_BAD_REQUEST)

        if len(new_password) < 8:
            return Response({'error': 'Le mot de passe doit contenir au moins 8 caractères.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
        except (User.DoesNotExist, ValueError, TypeError):
            return Response({'error': 'Lien invalide.'}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({'error': 'Lien expiré ou invalide.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()

        return Response({'message': 'Mot de passe réinitialisé avec succès.'})
