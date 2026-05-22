from django.urls import path
from .views import CustomTokenObtainPairView, MeView
from .password_reset import ForgotPasswordView, ResetPasswordView

urlpatterns = [
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('me/', MeView.as_view(), name='me'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),
]
