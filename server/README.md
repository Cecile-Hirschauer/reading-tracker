# 🚀 Reading Tracker API - Documentation

## 📋 État Actuel du Projet

### ✅ Composants Créés et Fonctionnels

#### 🗄️ Modèles (Models)
- **User.ts** - Modèle utilisateur avec authentification et statistiques
- **Book.ts** - Modèle livre avec progression et calcul de points
- **Badge.ts** - Modèle badge avec système de rareté
- **UserBadge.ts** - Table de liaison pour les badges utilisateur
- **enums.ts** - Énumérations pour les catégories, statuts et raretés
- **types.ts** - Types TypeScript pour l'API
- **badgeData.ts** - Données prédéfinies des badges
- **seeders.ts** - Fonctions d'initialisation de la base de données

#### 🔧 Services
- **UserService.ts** - Service pour la gestion des utilisateurs
- **BookService.ts** - Service pour la gestion des livres
- **BadgeService.ts** - Service pour la gestion des badges

#### 🎮 Contrôleurs
- **UserController.ts** - Contrôleur pour les routes utilisateur
- **BookController.ts** - Contrôleur pour les routes livre
- **BadgeController.ts** - Contrôleur pour les routes badge

#### 🛡️ Middleware
- **auth.ts** - Middleware d'authentification JWT
- **validation.ts** - Middleware de validation des données

#### 🛠️ Utilitaires
- **points.ts** - Calcul des points et niveaux
- **levels.ts** - Gestion des niveaux utilisateur
- **validation.ts** - Fonctions de validation

### 🔧 Configuration
- **database.ts** - Configuration Sequelize pour SQLite
- **package.json** - Dépendances et scripts
- **tsconfig.json** - Configuration TypeScript

## 🚧 Problème Actuel

### Erreur `path-to-regexp`
Le serveur rencontre une erreur avec la bibliothèque `path-to-regexp` lors du démarrage :
```
TypeError: Missing parameter name at 9: https://git.new/pathToRegexpError
```

### Cause Identifiée
- Le serveur de base fonctionne sans problème
- L'erreur survient lors de l'import des routes qui utilisent des paramètres
- Probablement un conflit dans la définition des routes Express

### Solutions Testées
1. ✅ Serveur minimal fonctionne
2. ✅ Serveur avec routes simples fonctionne
3. ❌ Problème avec l'import des contrôleurs/middleware dans les routes

## 🎯 Prochaines Étapes

### 1. Résoudre le Problème de Routes
- Identifier la route problématique
- Corriger la syntaxe des paramètres de route
- Tester progressivement chaque route

### 2. Finaliser l'API
- Ajouter l'initialisation de la base de données
- Configurer l'authentification JWT
- Tester toutes les routes CRUD

### 3. Fonctionnalités Complètes

#### Routes Utilisateur (`/api/v1/users`)
- `POST /register` - Inscription
- `POST /login` - Connexion
- `GET /profile` - Profil utilisateur
- `PUT /profile` - Mise à jour profil
- `GET /stats` - Statistiques utilisateur
- `DELETE /account` - Suppression compte

#### Routes Livre (`/api/v1/books`)
- `POST /` - Créer un livre
- `GET /` - Liste des livres (avec filtres)
- `GET /:bookId` - Détails d'un livre
- `PUT /:bookId` - Mettre à jour un livre
- `PUT /:bookId/progress` - Mettre à jour la progression
- `POST /:bookId/complete` - Marquer comme terminé
- `DELETE /:bookId` - Supprimer un livre
- `GET /stats` - Statistiques de lecture
- `GET /categories` - Livres par catégorie
- `GET /reading` - Livres en cours
- `GET /completed` - Livres terminés
- `GET /search` - Recherche de livres

#### Routes Badge (`/api/v1/badges`)
- `GET /` - Liste des badges
- `GET /:badgeId` - Détails d'un badge
- `GET /user/my-badges` - Badges de l'utilisateur
- `GET /user/available` - Badges disponibles
- `GET /rarity/:rarity` - Badges par rareté
- `GET /stats` - Statistiques des badges
- `GET /recent` - Badges récents
- `GET /leaderboard` - Classement des badges

#### Routes Admin
- Gestion des badges
- Attribution manuelle de badges
- Statistiques globales

## 🏗️ Architecture

### Structure des Dossiers
```
server/
├── src/
│   ├── config/          # Configuration (DB, etc.)
│   ├── controllers/     # Contrôleurs Express
│   ├── middleware/      # Middleware personnalisé
│   ├── models/          # Modèles Sequelize
│   ├── routes/          # Définition des routes
│   ├── services/        # Logique métier
│   ├── utils/           # Fonctions utilitaires
│   └── index.ts         # Point d'entrée
├── controllers/         # Contrôleurs (à déplacer)
└── package.json
```

### Technologies Utilisées
- **Express.js** - Framework web
- **TypeScript** - Langage typé
- **Sequelize** - ORM pour base de données
- **SQLite** - Base de données (développement)
- **JWT** - Authentification
- **bcryptjs** - Hashage des mots de passe
- **cors** - Gestion CORS
- **helmet** - Sécurité
- **morgan** - Logging
- **express-rate-limit** - Limitation de taux

## 🎮 Système de Gamification

### Points
- **Livres courts** (< 150 pages) : 10 points
- **Livres moyens** (150-300 pages) : 20 points
- **Livres longs** (> 300 pages) : 30 points

### Badges
- **Common** : 5 points
- **Rare** : 10 points
- **Epic** : 20 points
- **Legendary** : 50 points

### Niveaux
- **Beginner** : 0-50 points
- **Amateur** : 51-150 points
- **Confirmed** : 151-300 points
- **Expert** : 301+ points

## 🧪 Tests

### Commandes Utiles
```bash
# Compilation TypeScript
npm run build

# Vérification TypeScript
npx tsc --noEmit

# Démarrage développement
npm run dev

# Serveur minimal (test)
npx ts-node src/minimal-server.ts
```

## 📝 Notes de Développement

### Problèmes Résolus
1. ✅ Structure des dossiers organisée
2. ✅ Modèles Sequelize créés
3. ✅ Services implémentés
4. ✅ Contrôleurs créés
5. ✅ Middleware configuré
6. ✅ Types TypeScript définis

### Problèmes en Cours
1. ❌ Erreur `path-to-regexp` dans les routes
2. ⏳ Initialisation de la base de données
3. ⏳ Tests des endpoints

### Améliorations Futures
- Tests unitaires et d'intégration
- Documentation API (Swagger)
- Validation avancée des données
- Système de cache (Redis)
- Monitoring et logging avancé
- Déploiement (Docker, CI/CD)
