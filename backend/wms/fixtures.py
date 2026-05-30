# Script à lancer une fois pour peupler la base avec des produits LIDL_CAMPUS
# python manage.py shell < wms/fixtures.py

from wms.models import Produit

produits = [
    # Produits frais
    {'reference': 'FRS-001', 'nom': 'Yaourts nature 125g x4', 'categorie': 'frais', 'emplacement': 'A-01', 'stock_actuel': 0, 'stock_minimum': 20, 'stock_maximum': 200, 'fournisseur': 'Danone', 'dlc_jours': 21},
    {'reference': 'FRS-002', 'nom': 'Lait demi-écrémé 1L', 'categorie': 'frais', 'emplacement': 'A-02', 'stock_actuel': 8, 'stock_minimum': 30, 'stock_maximum': 300, 'fournisseur': 'Lactel', 'dlc_jours': 14},
    {'reference': 'FRS-003', 'nom': 'Beurre doux 250g', 'categorie': 'frais', 'emplacement': 'A-03', 'stock_actuel': 45, 'stock_minimum': 20, 'stock_maximum': 150, 'fournisseur': 'Président', 'dlc_jours': 60},
    {'reference': 'FRS-004', 'nom': 'Fromage râpé 200g', 'categorie': 'frais', 'emplacement': 'A-04', 'stock_actuel': 12, 'stock_minimum': 15, 'stock_maximum': 100, 'fournisseur': 'Entremont', 'dlc_jours': 30},
    {'reference': 'FRS-005', 'nom': 'Œufs frais x12', 'categorie': 'frais', 'emplacement': 'A-05', 'stock_actuel': 60, 'stock_minimum': 24, 'stock_maximum': 240, 'fournisseur': 'Local', 'dlc_jours': 28},

    # Épicerie sèche
    {'reference': 'SEC-001', 'nom': 'Pâtes spaghetti 500g', 'categorie': 'sec', 'emplacement': 'B-01', 'stock_actuel': 120, 'stock_minimum': 30, 'stock_maximum': 500, 'fournisseur': 'Panzani'},
    {'reference': 'SEC-002', 'nom': 'Riz long grain 1kg', 'categorie': 'sec', 'emplacement': 'B-02', 'stock_actuel': 5, 'stock_minimum': 20, 'stock_maximum': 300, 'fournisseur': 'Uncle Ben\'s'},
    {'reference': 'SEC-003', 'nom': 'Farine T45 1kg', 'categorie': 'sec', 'emplacement': 'B-03', 'stock_actuel': 0, 'stock_minimum': 15, 'stock_maximum': 200, 'fournisseur': 'Francine'},
    {'reference': 'SEC-004', 'nom': 'Sucre en poudre 1kg', 'categorie': 'sec', 'emplacement': 'B-04', 'stock_actuel': 80, 'stock_minimum': 20, 'stock_maximum': 250, 'fournisseur': 'Béghin-Say'},
    {'reference': 'SEC-005', 'nom': 'Huile de tournesol 1L', 'categorie': 'sec', 'emplacement': 'B-05', 'stock_actuel': 35, 'stock_minimum': 25, 'stock_maximum': 200, 'fournisseur': 'Lesieur'},

    # Surgelés
    {'reference': 'SUR-001', 'nom': 'Frites 1kg', 'categorie': 'surgele', 'emplacement': 'C-01', 'stock_actuel': 0, 'stock_minimum': 20, 'stock_maximum': 150, 'fournisseur': 'McCain'},
    {'reference': 'SUR-002', 'nom': 'Poisson pané x8', 'categorie': 'surgele', 'emplacement': 'C-02', 'stock_actuel': 18, 'stock_minimum': 10, 'stock_maximum': 80, 'fournisseur': 'Findus'},
    {'reference': 'SUR-003', 'nom': 'Pizza Margherita', 'categorie': 'surgele', 'emplacement': 'C-03', 'stock_actuel': 25, 'stock_minimum': 12, 'stock_maximum': 100, 'fournisseur': 'Dr. Oetker'},

    # Boissons
    {'reference': 'BOI-001', 'nom': 'Eau minérale 1,5L x6', 'categorie': 'boisson', 'emplacement': 'D-01', 'stock_actuel': 48, 'stock_minimum': 24, 'stock_maximum': 240, 'fournisseur': 'Evian'},
    {'reference': 'BOI-002', 'nom': 'Jus d\'orange 1L', 'categorie': 'boisson', 'emplacement': 'D-02', 'stock_actuel': 6, 'stock_minimum': 12, 'stock_maximum': 96, 'fournisseur': 'Tropicana'},
    {'reference': 'BOI-003', 'nom': 'Soda cola 1,5L', 'categorie': 'boisson', 'emplacement': 'D-03', 'stock_actuel': 72, 'stock_minimum': 24, 'stock_maximum': 200, 'fournisseur': 'Coca-Cola'},

    # Hygiène
    {'reference': 'HYG-001', 'nom': 'Papier toilette x12', 'categorie': 'hygiene', 'emplacement': 'E-01', 'stock_actuel': 0, 'stock_minimum': 10, 'stock_maximum': 100, 'fournisseur': 'Lotus'},
    {'reference': 'HYG-002', 'nom': 'Lessive liquide 2L', 'categorie': 'hygiene', 'emplacement': 'E-02', 'stock_actuel': 14, 'stock_minimum': 8, 'stock_maximum': 60, 'fournisseur': 'Ariel'},
    {'reference': 'HYG-003', 'nom': 'Savon liquide 500ml', 'categorie': 'hygiene', 'emplacement': 'E-03', 'stock_actuel': 30, 'stock_minimum': 10, 'stock_maximum': 80, 'fournisseur': 'Palmolive'},
]

created = 0
for p in produits:
    obj, is_new = Produit.objects.get_or_create(reference=p['reference'], defaults=p)
    if is_new:
        created += 1

print(f"✅ {created} produits créés, {len(produits)-created} déjà existants")
