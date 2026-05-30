from rest_framework import serializers
from .models import Produit, MouvementStock


class ProduitSerializer(serializers.ModelSerializer):
    statut = serializers.ReadOnlyField()
    taux_remplissage = serializers.ReadOnlyField()

    class Meta:
        model = Produit
        fields = '__all__'


class MouvementStockSerializer(serializers.ModelSerializer):
    produit_nom = serializers.CharField(source='produit.nom', read_only=True)
    produit_ref = serializers.CharField(source='produit.reference', read_only=True)

    class Meta:
        model = MouvementStock
        fields = '__all__'
        read_only_fields = ['stock_avant', 'stock_apres']