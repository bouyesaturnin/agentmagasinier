from rest_framework import serializers
from .models import Conversation, Message


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'role', 'content', 'created_at']
        read_only_fields = ['id', 'created_at']


class ConversationSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    message_count = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'title', 'created_at', 'updated_at', 'message_count', 'last_message', 'messages']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_message_count(self, obj):
        return obj.messages.count()

    def get_last_message(self, obj):
        last = obj.messages.last()
        if last:
            return {'role': last.role, 'content': last.content[:80], 'created_at': last.created_at}
        return None


class ConversationListSerializer(serializers.ModelSerializer):
    message_count = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'title', 'created_at', 'updated_at', 'message_count', 'last_message']

    def get_message_count(self, obj):
        return obj.messages.count()

    def get_last_message(self, obj):
        last = obj.messages.last()
        if last:
            return {'role': last.role, 'content': last.content[:80], 'created_at': last.created_at}
        return None


class ChatRequestSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=4000)
    conversation_id = serializers.IntegerField(required=False, allow_null=True)
