from django.contrib import admin
from .models import Produit, MouvementStock


@admin.register(Produit)
class ProduitAdmin(admin.ModelAdmin):
    list_display = ['reference', 'nom', 'categorie', 'emplacement', 'stock_actuel', 'stock_minimum', 'statut']
    list_filter = ['categorie', 'actif']
    search_fields = ['reference', 'nom', 'emplacement']
    list_editable = ['stock_actuel']


@admin.register(MouvementStock)
class MouvementAdmin(admin.ModelAdmin):
    list_display = ['produit', 'type_mouvement', 'quantite', 'stock_avant', 'stock_apres', 'agent', 'created_at']
    list_filter = ['type_mouvement']
    readonly_fields = ['stock_avant', 'stock_apres', 'created_at']
