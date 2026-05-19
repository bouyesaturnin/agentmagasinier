from django.contrib import admin
from .models import Conversation, Message


class MessageInline(admin.TabularInline):
    model = Message
    readonly_fields = ['role', 'content', 'created_at']
    extra = 0


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'created_at', 'updated_at']
    list_filter = ['user']
    inlines = [MessageInline]


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['conversation', 'role', 'content_preview', 'created_at']
    list_filter = ['role']

    def content_preview(self, obj):
        return obj.content[:60]
    content_preview.short_description = 'Contenu'
