from django.db import models


class Produit(models.Model):
    CATEGORIE_CHOICES = [
        ('frais', 'Produits frais'),
        ('sec', 'Épicerie sèche'),
        ('surgele', 'Surgelés'),
        ('boisson', 'Boissons'),
        ('hygiene', 'Hygiène / Entretien'),
        ('autre', 'Autre'),
    ]

    reference = models.CharField(max_length=50, unique=True)
    nom = models.CharField(max_length=200)
    categorie = models.CharField(max_length=20, choices=CATEGORIE_CHOICES, default='autre')
    emplacement = models.CharField(max_length=50, help_text='Ex: A-12, B-03, Zone Frais')
    stock_actuel = models.IntegerField(default=0)
    stock_minimum = models.IntegerField(default=10, help_text='Seuil de rupture')
    stock_maximum = models.IntegerField(default=100)
    unite = models.CharField(max_length=20, default='unités')
    fournisseur = models.CharField(max_length=100, blank=True)
    prix_unitaire = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    dlc_jours = models.IntegerField(null=True, blank=True, help_text='Durée de vie en jours')
    actif = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['categorie', 'reference']
        verbose_name = 'Produit'
        verbose_name_plural = 'Produits'

    def __str__(self):
        return f"{self.reference} — {self.nom}"

    @property
    def statut(self):
        if self.stock_actuel == 0:
            return 'rupture'
        elif self.stock_actuel <= self.stock_minimum:
            return 'critique'
        elif self.stock_actuel <= self.stock_minimum * 1.5:
            return 'bas'
        return 'ok'

    @property
    def taux_remplissage(self):
        if self.stock_maximum == 0:
            return 0
        return round((self.stock_actuel / self.stock_maximum) * 100)


class MouvementStock(models.Model):
    TYPE_CHOICES = [
        ('entree', 'Entrée'),
        ('sortie', 'Sortie'),
        ('inventaire', 'Correction inventaire'),
        ('retour', 'Retour fournisseur'),
    ]

    produit = models.ForeignKey(Produit, on_delete=models.CASCADE, related_name='mouvements')
    type_mouvement = models.CharField(max_length=20, choices=TYPE_CHOICES)
    quantite = models.IntegerField()
    stock_avant = models.IntegerField()
    stock_apres = models.IntegerField()
    motif = models.CharField(max_length=200, blank=True)
    agent = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Mouvement de stock'
        verbose_name_plural = 'Mouvements de stock'

    def __str__(self):
        return f"{self.produit.reference} — {self.type_mouvement} {self.quantite}"
