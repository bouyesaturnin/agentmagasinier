# Agent API — LIDL_CAMPUS

Assistant IA logistique intégré, stack Django + React.

---

## 🏗️ Architecture

```
agent-api/
├── backend/          # Django 5 + DRF + JWT
│   ├── core/         # Settings, URLs, WSGI
│   ├── users/        # Auth JWT personnalisée
│   └── agent/        # Conversations, messages, appel Anthropic
└── frontend/         # React + Vite
    └── src/
        ├── pages/    # LoginPage, ChatPage
        ├── hooks/    # useAuth
        └── services/ # axios avec intercepteurs JWT
```

---

## 🚀 Démarrage rapide

### 1. Backend Django

```bash
cd backend

# Créer l'environnement virtuel
python -m venv venv
source venv/bin/activate       # Linux/Mac
venv\Scripts\activate          # Windows

# Installer les dépendances
pip install -r requirements.txt

# Configurer l'environnement
cp .env.example .env
# → Éditer .env et renseigner votre ANTHROPIC_API_KEY

# Migrations et superuser
python manage.py migrate
python manage.py createsuperuser

# Lancer le serveur
python manage.py runserver
```

### 2. Frontend React

```bash
cd frontend
npm install
npm run dev
```

L'app est accessible sur **http://localhost:5173**

---

## 🔑 Créer des utilisateurs

Via l'admin Django sur http://localhost:8000/admin :
- Créez des utilisateurs avec un rôle (magasinier, responsable, admin)
- Entrepôt par défaut : LIDL_CAMPUS

---

## 🌐 API Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/login/` | Connexion → access + refresh tokens |
| POST | `/api/auth/refresh/` | Rafraîchir l'access token |
| GET | `/api/auth/me/` | Profil utilisateur connecté |
| GET | `/api/agent/conversations/` | Liste des conversations |
| POST | `/api/agent/conversations/` | Créer une conversation |
| GET | `/api/agent/conversations/:id/` | Détail + messages |
| DELETE | `/api/agent/conversations/:id/` | Supprimer |
| POST | `/api/agent/chat/` | Envoyer un message à Agent API |

---

## 🚢 Déploiement

**Backend → Railway**
```bash
# Variables d'env à configurer sur Railway :
SECRET_KEY=...
DEBUG=False
ALLOWED_HOSTS=votre-app.railway.app
ANTHROPIC_API_KEY=sk-ant-...
CORS_ALLOWED_ORIGINS=https://votre-frontend.vercel.app
DATABASE_URL=postgresql://...  # Railway le fournit automatiquement
```

**Frontend → Vercel**
```bash
# Variable d'env Vercel :
VITE_API_URL=https://votre-backend.railway.app
# Puis dans vite.config.js, remplacer le proxy par :
# baseURL: import.meta.env.VITE_API_URL
```

---

## 🔒 Sécurité

- Tokens JWT (access 8h, refresh 7 jours avec rotation)
- CORS configuré (whitelist origines)
- Toutes les routes API protégées par `IsAuthenticated`
- Conversations isolées par utilisateur

---

## 📦 Stack technique

| Couche | Technologie |
|--------|-------------|
| Backend | Django 5 + Django REST Framework |
| Auth | JWT via `djangorestframework-simplejwt` |
| IA | Anthropic API (`claude-sonnet-4-20250514`) |
| Frontend | React 18 + Vite |
| HTTP client | Axios avec intercepteurs JWT |
| Routing | React Router v6 |
| Base de données | SQLite (dev) / PostgreSQL (prod) |
| Déploiement | Railway (backend) + Vercel (frontend) |
