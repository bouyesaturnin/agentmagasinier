from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models import Count, Q
from datetime import timedelta
from .models import Conversation, Message

User = get_user_model()


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        now = timezone.now()
        today = now.date()
        week_ago = now - timedelta(days=7)
        month_ago = now - timedelta(days=30)

        # ── Stats globales ──
        total_conversations = Conversation.objects.count()
        total_messages = Message.objects.filter(role='assistant').count()
        total_users = User.objects.filter(is_active=True).count()

        # Documents générés = messages contenant des mots-clés de documents
        doc_keywords = ['fiche', 'bon de', 'rapport', 'inventaire', 'non-conformité', 'BL', 'NC']
        doc_filter = Q()
        for kw in doc_keywords:
            doc_filter |= Q(content__icontains=kw)
        total_documents = Message.objects.filter(role='assistant').filter(doc_filter).count()

        # ── Stats cette semaine ──
        conv_this_week = Conversation.objects.filter(created_at__gte=week_ago).count()
        docs_this_week = Message.objects.filter(
            role='assistant', created_at__gte=week_ago
        ).filter(doc_filter).count()

        # ── Utilisateurs actifs (ont eu une conversation ce mois) ──
        active_users = Conversation.objects.filter(
            created_at__gte=month_ago
        ).values('user').distinct().count()

        # ── Activité par jour sur 7 jours ──
        activity = []
        for i in range(6, -1, -1):
            day = today - timedelta(days=i)
            count = Conversation.objects.filter(created_at__date=day).count()
            activity.append({
                'date': day.strftime('%d/%m'),
                'conversations': count,
            })

        # ── Top utilisateurs (plus actifs ce mois) ──
        top_users = (
            Conversation.objects
            .filter(created_at__gte=month_ago)
            .values('user__username', 'user__first_name', 'user__last_name', 'user__role')
            .annotate(total=Count('id'))
            .order_by('-total')[:5]
        )
        top_users_list = [
            {
                'username': u['user__username'],
                'full_name': f"{u['user__first_name']} {u['user__last_name']}".strip() or u['user__username'],
                'role': u['user__role'],
                'conversations': u['total'],
            }
            for u in top_users
        ]

        # ── Mes stats personnelles ──
        my_conversations = Conversation.objects.filter(user=request.user).count()
        my_this_week = Conversation.objects.filter(user=request.user, created_at__gte=week_ago).count()

        return Response({
            'global': {
                'total_conversations': total_conversations,
                'total_documents': total_documents,
                'total_users': total_users,
                'active_users': active_users,
                'conv_this_week': conv_this_week,
                'docs_this_week': docs_this_week,
            },
            'activity': activity,
            'top_users': top_users_list,
            'my_stats': {
                'conversations': my_conversations,
                'this_week': my_this_week,
            }
        })
