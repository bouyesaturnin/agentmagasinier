from django.urls import path
from .views import CustomTokenObtainPairView, MeView

urlpatterns = [
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('me/', MeView.as_view(), name='me'),
]
