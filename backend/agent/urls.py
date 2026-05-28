from django.urls import path
from .views import ConversationListView, ConversationDetailView, ChatView
from .dashboard import DashboardView

urlpatterns = [
    path('conversations/', ConversationListView.as_view(), name='conversations'),
    path('conversations/<int:pk>/', ConversationDetailView.as_view(), name='conversation-detail'),
    path('chat/', ChatView.as_view(), name='chat'),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
]

