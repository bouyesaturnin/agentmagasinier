from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db.models import Q
from .models import Produit, MouvementStock
from .serializers import ProduitSerializer, MouvementStockSerializer


class StockListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = Produit.objects.filter(actif=True)

        # Filtres
        categorie = request.query_params.get('categorie')
        statut = request.query_params.get('statut')
        search = request.query_params.get('search')

        if categorie:
            queryset = queryset.filter(categorie=categorie)
        if search:
            queryset = queryset.filter(
                Q(reference__icontains=search) |
                Q(nom__icontains=search) |
                Q(emplacement__icontains=search)
            )
        if statut == 'rupture':
            queryset = queryset.filter(stock_actuel=0)
        elif statut == 'critique':
            queryset = queryset.filter(stock_actuel__gt=0, stock_actuel__lte=models.F('stock_minimum'))
        elif statut == 'ok':
            queryset = queryset.filter(stock_actuel__gt=models.F('stock_minimum'))

        serializer = ProduitSerializer(queryset, many=True)
        return Response(serializer.data)


class StockDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            produit = Produit.objects.get(pk=pk, actif=True)
        except Produit.DoesNotExist:
            return Response({'error': 'Produit introuvable'}, status=status.HTTP_404_NOT_FOUND)
        serializer = ProduitSerializer(produit)
        return Response(serializer.data)

    def patch(self, request, pk):
        try:
            produit = Produit.objects.get(pk=pk, actif=True)
        except Produit.DoesNotExist:
            return Response({'error': 'Produit introuvable'}, status=status.HTTP_404_NOT_FOUND)

        nouveau_stock = request.data.get('stock_actuel')
        if nouveau_stock is not None:
            stock_avant = produit.stock_actuel
            produit.stock_actuel = int(nouveau_stock)
            produit.save()
            MouvementStock.objects.create(
                produit=produit,
                type_mouvement='inventaire',
                quantite=abs(produit.stock_actuel - stock_avant),
                stock_avant=stock_avant,
                stock_apres=produit.stock_actuel,
                motif=request.data.get('motif', 'Correction manuelle'),
                agent=request.user.get_full_name() or request.user.username,
            )

        serializer = ProduitSerializer(produit)
        return Response(serializer.data)


class MouvementView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        produit_id = request.data.get('produit_id')
        type_mouvement = request.data.get('type_mouvement')
        quantite = int(request.data.get('quantite', 0))

        try:
            produit = Produit.objects.get(pk=produit_id, actif=True)
        except Produit.DoesNotExist:
            return Response({'error': 'Produit introuvable'}, status=status.HTTP_404_NOT_FOUND)

        stock_avant = produit.stock_actuel
        if type_mouvement == 'entree':
            produit.stock_actuel += quantite
        elif type_mouvement == 'sortie':
            if produit.stock_actuel < quantite:
                return Response({'error': 'Stock insuffisant'}, status=status.HTTP_400_BAD_REQUEST)
            produit.stock_actuel -= quantite
        produit.save()

        mouvement = MouvementStock.objects.create(
            produit=produit,
            type_mouvement=type_mouvement,
            quantite=quantite,
            stock_avant=stock_avant,
            stock_apres=produit.stock_actuel,
            motif=request.data.get('motif', ''),
            agent=request.user.get_full_name() or request.user.username,
        )

        return Response(MouvementStockSerializer(mouvement).data, status=status.HTTP_201_CREATED)


class StockSummaryView(APIView):
    """Résumé pour l'agent IA — données concises."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        produits = Produit.objects.filter(actif=True)
        ruptures = [p for p in produits if p.statut == 'rupture']
        critiques = [p for p in produits if p.statut == 'critique']
        bas = [p for p in produits if p.statut == 'bas']

        return Response({
            'total_produits': produits.count(),
            'ruptures': [{'ref': p.reference, 'nom': p.nom, 'emplacement': p.emplacement} for p in ruptures],
            'critiques': [{'ref': p.reference, 'nom': p.nom, 'stock': p.stock_actuel, 'minimum': p.stock_minimum, 'emplacement': p.emplacement} for p in critiques],
            'bas': [{'ref': p.reference, 'nom': p.nom, 'stock': p.stock_actuel, 'minimum': p.stock_minimum} for p in bas],
            'nb_ruptures': len(ruptures),
            'nb_critiques': len(critiques),
            'nb_bas': len(bas),
        })
