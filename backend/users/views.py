# Ajoute ces imports en haut de backend/users/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import status
from .serializers import CustomTokenObtainPairSerializer, UserSerializer
from .models import User


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data

        # Vérifications
        if User.objects.filter(username=data.get('username', '')).exists():
            return Response({'username': 'Ce nom d\'utilisateur est déjà pris.'}, status=status.HTTP_400_BAD_REQUEST)

        if data.get('email') and User.objects.filter(email=data.get('email')).exists():
            return Response({'email': 'Cet email est déjà utilisé.'}, status=status.HTTP_400_BAD_REQUEST)

        if len(data.get('password', '')) < 8:
            return Response({'password': 'Minimum 8 caractères.'}, status=status.HTTP_400_BAD_REQUEST)

        # Seuls magasinier et responsable peuvent s'inscrire librement
        role = data.get('role', 'magasinier')
        if role not in ['magasinier', 'responsable']:
            role = 'magasinier'

        user = User.objects.create_user(
            username=data.get('username'),
            password=data.get('password'),
            email=data.get('email', ''),
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', ''),
            role=role,
            entrepot=data.get('entrepot', 'LIDL_CAMPUS'),
        )

        return Response({
            'message': 'Compte créé avec succès.',
            'user': {
                'id': user.id,
                'username': user.username,
                'full_name': user.get_full_name(),
                'role': user.role,
                'entrepot': user.entrepot,
            }
        }, status=status.HTTP_201_CREATED)
