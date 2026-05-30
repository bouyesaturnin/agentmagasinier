import anthropic
from django.conf import settings

SYSTEM_PROMPT_BASE = """Tu es Agent API, un assistant IA spécialisé dans la gestion d'entrepôt et les métiers de la logistique.
Tu travailles pour API_LIDL, au sein de l'entrepôt LIDL_CAMPUS.

=== DONNÉES STOCK TEMPS RÉEL ===
{stock_context}

=== MISSION PRINCIPALE ===
- Gestion et suivi des stocks (entrées, sorties, inventaires, alertes de rupture ou surstock)
- Réception et contrôle des marchandises (conformité, litiges fournisseurs, bons de livraison)
- Préparation et expédition des commandes (picking, conditionnement, traçabilité)
- Organisation et optimisation de l'espace de stockage au sein de LIDL_CAMPUS
- Gestion des documents administratifs (BL, étiquettes, fiches de traçabilité)
- Calculs logistiques (stock de sécurité, point de commande, taux de rotation)

=== RÈGLES ===
1. Langage clair, précis et professionnel. Terminologie logistique maîtrisée.
2. Toujours utiliser les données de stock réelles ci-dessus pour répondre.
3. Signaler immédiatement les ruptures et niveaux critiques avec les références exactes.
4. Proposer des actions concrètes basées sur les données réelles.
5. Pour les calculs : formule → données → résultat.
6. Rappeler les consignes de sécurité si activité risquée.

=== LIMITES ===
- Ne jamais inventer de données de stock. Utiliser uniquement les données fournies ci-dessus.
- Pour les décisions financières importantes, recommander le responsable hiérarchique."""


def build_stock_context(user=None):
    try:
        from wms.models import Produit
        import datetime
        produits = Produit.objects.filter(actif=True)

        ruptures = [p for p in produits if p.statut == 'rupture']
        critiques = [p for p in produits if p.statut == 'critique']
        bas = [p for p in produits if p.statut == 'bas']
        ok = [p for p in produits if p.statut == 'ok']

        context = f"Date/heure : {datetime.datetime.now().strftime('%d/%m/%Y %H:%M')}\n"
        context += f"Entrepôt : LIDL_CAMPUS — {produits.count()} références actives\n\n"

        if ruptures:
            context += "🔴 RUPTURES DE STOCK (stock = 0) :\n"
            for p in ruptures:
                context += f"  - {p.reference} | {p.nom} | Emplacement: {p.emplacement}\n"
            context += "\n"

        if critiques:
            context += "🟠 STOCKS CRITIQUES (sous le seuil minimum) :\n"
            for p in critiques:
                context += f"  - {p.reference} | {p.nom} | Stock: {p.stock_actuel} {p.unite} | Min: {p.stock_minimum} | Empl: {p.emplacement}\n"
            context += "\n"

        if bas:
            context += "🟡 STOCKS BAS (proche du seuil) :\n"
            for p in bas:
                context += f"  - {p.reference} | {p.nom} | Stock: {p.stock_actuel} {p.unite} | Min: {p.stock_minimum}\n"
            context += "\n"

        context += f"✅ STOCKS OK : {len(ok)} références\n\n"
        context += "Inventaire complet :\n"
        for p in produits:
            context += f"  - {p.reference} | {p.nom} | {p.get_categorie_display()} | Stock: {p.stock_actuel} {p.unite} | Min: {p.stock_minimum} | Max: {p.stock_maximum} | Empl: {p.emplacement} | Fournisseur: {p.fournisseur or 'N/A'}\n"

        return context

    except Exception as e:
        return f"⚠️ Données WMS non disponibles ({str(e)}). Réponds sur la base de tes connaissances générales."


def get_anthropic_response(messages_history: list, user=None) -> str:
    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    stock_context = build_stock_context(user)
    system_prompt = SYSTEM_PROMPT_BASE.format(stock_context=stock_context)

    response = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=1500,
        system=system_prompt,
        messages=messages_history,
    )
    return response.content[0].text

