from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
import traceback

from .models import Conversation, Message
from .serializers import (
    ConversationSerializer, ConversationListSerializer, ChatRequestSerializer
)
from .services import get_anthropic_response
from .stock_alert import detect_stock_alert, send_stock_alert


class ConversationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        convs = Conversation.objects.filter(user=request.user)
        serializer = ConversationListSerializer(convs, many=True)
        return Response(serializer.data)

    def post(self, request):
        conv = Conversation.objects.create(user=request.user)
        serializer = ConversationSerializer(conv)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ConversationDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        conv = get_object_or_404(Conversation, pk=pk, user=request.user)
        serializer = ConversationSerializer(conv)
        return Response(serializer.data)

    def delete(self, request, pk):
        conv = get_object_or_404(Conversation, pk=pk, user=request.user)
        conv.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ChatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChatRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user_message = serializer.validated_data['message']
        conversation_id = serializer.validated_data.get('conversation_id')

        if conversation_id:
            conv = get_object_or_404(Conversation, pk=conversation_id, user=request.user)
        else:
            conv = Conversation.objects.create(user=request.user)

        Message.objects.create(conversation=conv, role='user', content=user_message)

        if conv.messages.filter(role='user').count() == 1:
            conv.generate_title()

        history = [
            {'role': msg.role, 'content': msg.content}
            for msg in conv.messages.filter(role__in=['user', 'assistant'])
        ]

        try:
            reply = get_anthropic_response(history, user=request.user)
        except Exception as e:
            print(f"ERREUR CHAT : {type(e).__name__} — {e}")
            traceback.print_exc()
            return Response(
                {'error': f'Erreur : {str(e)}'},
                status=status.HTTP_502_BAD_GATEWAY
            )

        assistant_msg = Message.objects.create(
            conversation=conv, role='assistant', content=reply
        )

        stock_alert_sent = False
        try:
            if detect_stock_alert(reply):
                stock_alert_sent = send_stock_alert(
                    user=request.user,
                    message_content=reply,
                    conversation_title=conv.title,
                )
        except Exception as e:
            print(f"ERREUR ALERTE STOCK : {e}")

        return Response({
            'conversation_id': conv.id,
            'conversation_title': conv.title,
            'stock_alert_sent': stock_alert_sent,
            'message': {
                'id': assistant_msg.id,
                'role': assistant_msg.role,
                'content': assistant_msg.content,
                'created_at': assistant_msg.created_at,
            }
        }, status=status.HTTP_200_OK)
