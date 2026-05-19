from django.db import models
from users.models import User


class Conversation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='conversations')
    title = models.CharField(max_length=200, default='Nouvelle conversation')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']
        verbose_name = 'Conversation'
        verbose_name_plural = 'Conversations'

    def __str__(self):
        return f"{self.user.username} — {self.title}"

    def generate_title(self):
        first_user_msg = self.messages.filter(role='user').first()
        if first_user_msg:
            text = first_user_msg.content[:60]
            self.title = text + ('…' if len(first_user_msg.content) > 60 else '')
            self.save(update_fields=['title'])


class Message(models.Model):
    ROLE_CHOICES = [('user', 'Utilisateur'), ('assistant', 'Agent API')]

    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
        verbose_name = 'Message'
        verbose_name_plural = 'Messages'

    def __str__(self):
        return f"[{self.role}] {self.content[:50]}"
