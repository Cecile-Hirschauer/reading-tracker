# 📚 Application de Suivi de Lecture Gamifiée

## 🏗️ Architecture Générale

Cette application est construite avec une architecture moderne **fullstack** comprenant :

### Backend (API)
- **Framework** : Node.js avec Express.js
- **Langage** : TypeScript
- **Base de données** : SQLite avec Sequelize ORM
- **Authentification** : JWT (JSON Web Tokens)
- **Sécurité** : Helmet, CORS, Rate limiting
- **Validation** : express-validator
- **Logging** : Morgan

### Frontend
- **Framework** : Next.js 15 (React)
- **Langage** : TypeScript
- **Styling** : Tailwind CSS (recommandé)
- **Gestion d'état** : Context API ou Redux Toolkit

## 🗂️ Structure des Dossiers

```
reading-tracker/
├── server/                 # Backend API
│   ├── src/
│   │   ├── config/        # Configuration (DB, JWT)
│   │   ├── controllers/   # Contrôleurs
│   │   ├── middleware/    # Middleware personnalisé
│   │   ├── models/        # Modèles Sequelize
│   │   ├── routes/        # Routes API
│   │   ├── services/      # Logique métier
│   │   ├── utils/         # Utilitaires
│   │   ├── validators/    # Validation des données
│   │   └── index.ts       # Point d'entrée
│   ├── tests/             # Tests unitaires
│   └── package.json
├── client/                # Frontend Next.js
│   ├── src/
│   │   ├── app/          # App Router Next.js
│   │   ├── components/   # Composants React
│   │   ├── contexts/     # Contextes React
│   │   ├── hooks/        # Hooks personnalisés
│   │   ├── services/     # Services API
│   │   └── types/        # Types TypeScript
│   └── package.json
└── README.md
```

## 🎯 Modèle de Données

### Entités Principales

#### **User (Utilisateur)**
```typescript
interface User {
  id: string
  email: string
  password: string (hashé)
  username: string
  createdAt: Date
  updatedAt: Date
  // Relations
  books: Book[]
  userBadges: UserBadge[]
}
```

#### **Book (Livre)**
```typescript
interface Book {
  id: string
  title: string
  author: string
  pages: number
  category: BookCategory
  status: BookStatus
  currentPage: number
  userId: string
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
  // Propriétés calculées
  progress: number // Pourcentage de progression
  points: number // Points gagnés (calculé selon les pages)
}
```

#### **Badge (Badge)**
```typescript
interface Badge {
  id: string
  name: string
  description: string
  condition: BadgeCondition
  icon: string
  rarity: BadgeRarity
  createdAt: Date
  updatedAt: Date
}
```

#### **UserBadge (Badge Utilisateur)**
```typescript
interface UserBadge {
  id: string
  userId: string
  badgeId: string
  unlockedAt: Date
  // Relations
  user: User
  badge: Badge
}
```

### Enums

```typescript
enum BookCategory {
  FICTION = 'fiction',
  NON_FICTION = 'non_fiction',
  SCIENCE = 'science',
  HISTORY = 'history',
  BIOGRAPHY = 'biography',
  FANTASY = 'fantasy',
  MYSTERY = 'mystery',
  ROMANCE = 'romance',
  THRILLER = 'thriller',
  SELF_HELP = 'self_help'
}

enum BookStatus {
  NOT_STARTED = 'not_started',
  READING = 'reading',
  COMPLETED = 'completed',
  PAUSED = 'paused'
}

enum BadgeRarity {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

enum UserLevel {
  BEGINNER = 'beginner',      // 0-50 points
  AMATEUR = 'amateur',        // 51-150 points
  CONFIRMED = 'confirmed',    // 151-300 points
  EXPERT = 'expert'          // 301+ points
}
```

## 🔐 Authentification et Sécurité

### JWT Authentication
- **Access Token** : Durée courte (15 minutes)
- **Refresh Token** : Durée longue (7 jours)
- **Stockage** : HttpOnly cookies pour la sécurité

### Sécurité
- **Hashage mot de passe** : bcryptjs
- **Rate limiting** : 100 requêtes par 15 minutes
- **CORS** : Configuration stricte
- **Helmet** : Protection headers HTTP
- **Validation** : express-validator sur toutes les entrées

## 🎮 Système de Gamification

### Système de Points
```typescript
const calculatePoints = (pages: number): number => {
  if (pages < 150) return 10      // Livre court
  if (pages <= 300) return 20     // Livre moyen
  return 30                       // Livre long
}
```

### Niveaux d'Utilisateur
```typescript
const getUserLevel = (totalPoints: number): UserLevel => {
  if (totalPoints <= 50) return UserLevel.BEGINNER
  if (totalPoints <= 150) return UserLevel.AMATEUR
  if (totalPoints <= 300) return UserLevel.CONFIRMED
  return UserLevel.EXPERT
}
```

### Badges Prédéfinis
```typescript
const BADGES = [
  // Badges de quantité
  { name: "Première Lecture", condition: "complete_1_book" },
  { name: "Lecteur Assidu", condition: "complete_5_books" },
  { name: "Bibliophile", condition: "complete_20_books" },
  
  // Badges de diversité
  { name: "Explorer les genres", condition: "read_3_genres" },
  { name: "Aventurier Littéraire", condition: "read_5_genres" },
  
  // Badges de performance
  { name: "Lecture Rapide", condition: "complete_5_books_in_2_weeks" },
  { name: "Marathon de Lecture", condition: "complete_book_over_300_pages" },
  
  // Badges d'objectifs
  { name: "10 livres dans un mois", condition: "complete_10_books_in_month" },
  { name: "30 livres dans l'année", condition: "complete_30_books_in_year" }
]
```

## 📡 API Endpoints

### Authentification
```
POST /api/auth/register     # Inscription
POST /api/auth/login        # Connexion
POST /api/auth/logout       # Déconnexion
POST /api/auth/refresh      # Renouvellement token
```

### Utilisateurs
```
GET    /api/users/profile   # Profil utilisateur
PUT    /api/users/profile   # Mise à jour profil
DELETE /api/users/profile   # Suppression compte
GET    /api/users/stats     # Statistiques utilisateur
```

### Livres
```
GET    /api/books          # Liste des livres
POST   /api/books          # Ajouter un livre
GET    /api/books/:id      # Détails d'un livre
PUT    /api/books/:id      # Modifier un livre
DELETE /api/books/:id      # Supprimer un livre
PUT    /api/books/:id/progress  # Mettre à jour progression
```

### Badges
```
GET /api/badges            # Liste des badges disponibles
GET /api/badges/user       # Badges de l'utilisateur
```

### Statistiques
```
GET /api/stats/dashboard   # Données du tableau de bord
GET /api/stats/reading     # Statistiques de lecture
```

## 🧪 Tests et Qualité

### Tests Backend
- **Framework** : Jest + Supertest
- **Couverture** : Controllers, Services, Middleware
- **Base de données** : SQLite en mémoire pour les tests

### Tests Frontend
- **Framework** : Jest + React Testing Library
- **Couverture** : Composants, Hooks, Services

### Linting et Formatage
- **ESLint** : Configuration TypeScript
- **Prettier** : Formatage automatique
- **Husky** : Pre-commit hooks

## 🚀 Déploiement

### Développement
```bash
# Backend
cd server
npm install
npm run dev

# Frontend
cd client
npm install
npm run dev
```

### Production
```bash
# Backend
npm run build
npm start

# Frontend
npm run build
npm start
```

### Variables d'Environnement

#### Backend (.env)
```
NODE_ENV=development
PORT=5000
DATABASE_URL=./database.sqlite
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
CLIENT_URL=http://localhost:3000
```

#### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 🔧 Choix Techniques Justifiés

### SQLite
- **Avantages** : Simplicité, pas de serveur requis, idéal pour prototypage
- **Inconvénients** : Limité pour la production à grande échelle
- **Alternative** : PostgreSQL pour la production

### Sequelize ORM
- **Avantages** : TypeScript support, migrations, validations
- **Inconvénients** : Peut être verbeux
- **Alternative** : Prisma pour une approche plus moderne

### Express.js
- **Avantages** : Écosystème mature, flexibilité, middleware riche
- **Inconvénients** : Nécessite configuration sécurité manuelle
- **Alternative** : Fastify pour de meilleures performances

### Next.js
- **Avantages** : SSR/SSG, routing automatique, optimisations
- **Inconvénients** : Courbe d'apprentissage pour les débutants
- **Alternative** : Vite + React pour plus de simplicité

