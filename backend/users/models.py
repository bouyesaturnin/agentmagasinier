from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = [
        ('magasinier', 'Magasinier'),
        ('responsable', 'Responsable'),
        ('admin', 'Administrateur'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='magasinier')
    entrepot = models.CharField(max_length=100, default='LIDL_CAMPUS')

    class Meta:
        verbose_name = 'Utilisateur'
        verbose_name_plural = 'Utilisateurs'

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.get_role_display()})"
