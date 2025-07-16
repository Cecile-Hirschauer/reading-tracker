# 📊 Modèles de Données - Reading Tracker

Ce dossier contient tous les modèles Sequelize pour l'application de suivi de lecture gamifiée.

## 📁 Structure des Fichiers

### Modèles Principaux
- **`User.ts`** - Modèle utilisateur avec authentification et statistiques
- **`Book.ts`** - Modèle livre avec progression et calcul de points
- **`Badge.ts`** - Modèle badge avec système de rareté
- **`UserBadge.ts`** - Table de liaison pour les badges utilisateur

### Fichiers de Configuration
- **`enums.ts`** - Énumérations pour les catégories, statuts et raretés
- **`index.ts`** - Point d'entrée avec associations entre modèles
- **`types.ts`** - Types TypeScript pour l'API et les interfaces
- **`badgeData.ts`** - Données prédéfinies des badges
- **`seeders.ts`** - Fonctions d'initialisation de la base de données

## 🔗 Relations entre Modèles

```
User (1) ──────── (N) Book
  │
  │ (N)
  │
  └─── UserBadge ──── (N) Badge
```

### Relations Détaillées

1. **User → Book** (One-to-Many)
   - Un utilisateur peut avoir plusieurs livres
   - Suppression en cascade

2. **User ↔ Badge** (Many-to-Many via UserBadge)
   - Un utilisateur peut avoir plusieurs badges
   - Un badge peut être obtenu par plusieurs utilisateurs
   - Table de liaison avec date de déblocage

## 📋 Modèles

### User
```typescript
interface UserAttributes {
  id: string
  email: string
  password: string (hashé)
  username: string
  createdAt: Date
  updatedAt: Date
}
```

**Méthodes:**
- `getTotalPoints()` - Calcule les points totaux (livres + badges)
- `getUserLevel()` - Détermine le niveau selon les points
- `getStats()` - Retourne les statistiques complètes

### Book
```typescript
interface BookAttributes {
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
}
```

**Propriétés calculées:**
- `progress` - Pourcentage de progression (0-100)
- `points` - Points gagnés selon le nombre de pages

**Méthodes:**
- `updateProgress(newPage)` - Met à jour la progression

### Badge
```typescript
interface BadgeAttributes {
  id: string
  name: string
  description: string
  condition: string
  icon: string
  rarity: BadgeRarity
  createdAt: Date
  updatedAt: Date
}
```

**Méthodes:**
- `getRarityColor()` - Couleur selon la rareté
- `getRarityPoints()` - Points selon la rareté

### UserBadge
```typescript
interface UserBadgeAttributes {
  id: string
  userId: string
  badgeId: string
  unlockedAt: Date
  createdAt: Date
  updatedAt: Date
}
```

**Méthodes:**
- `isRecentlyUnlocked(days)` - Vérifie si récemment débloqué
- `getTimeSinceUnlock()` - Temps écoulé depuis le déblocage

## 🎯 Système de Points

### Livres
- **Livre court** (< 150 pages) : 10 points
- **Livre moyen** (150-300 pages) : 20 points
- **Livre long** (> 300 pages) : 30 points

### Badges
- **Common** : 5 points
- **Rare** : 10 points
- **Epic** : 20 points
- **Legendary** : 50 points

### Niveaux Utilisateur
- **Beginner** : 0-50 points
- **Amateur** : 51-150 points
- **Confirmed** : 151-300 points
- **Expert** : 301+ points

## 🏆 Badges Prédéfinis

### Badges de Quantité
- **Première Lecture** (1 livre) - Common
- **Lecteur Assidu** (5 livres) - Rare
- **Bibliophile** (20 livres) - Epic
- **Maître Lecteur** (50 livres) - Legendary

### Badges de Diversité
- **Explorer les Genres** (3 genres) - Common
- **Aventurier Littéraire** (5 genres) - Rare
- **Collectionneur de Genres** (tous genres) - Legendary

### Badges de Performance
- **Lecture Rapide** (5 livres en 2 semaines) - Epic
- **Marathon de Lecture** (livre > 300 pages) - Rare
- **Dévoreur de Pavés** (livre > 500 pages) - Epic

### Badges d'Objectifs
- **Lecteur du Mois** (10 livres/mois) - Epic
- **Défi Annuel** (30 livres/an) - Legendary

## 🚀 Utilisation

### Initialisation
```typescript
import { initializeDatabase } from './models/seeders';

// Initialiser la base de données
await initializeDatabase();

// Réinitialiser complètement (développement)
await initializeDatabase(true);
```

### Import des Modèles
```typescript
import { User, Book, Badge, UserBadge } from './models';
// ou
import models from './models';
```

### Import des Types
```typescript
import {
  UserAttributes,
  BookAttributes,
  BookCategory,
  BookStatus,
  UserStats
} from './models/types';
```

## 🧪 Tests et Développement

### Créer un Utilisateur de Test
```typescript
import { createTestUser } from './models/seeders';

const testUser = await createTestUser();
// Email: test@example.com
// Mot de passe: password123
```

### Nettoyer la Base de Données
```typescript
import { cleanDatabase } from './models/seeders';

await cleanDatabase();
```

## 📝 Notes Importantes

1. **Dépendances Circulaires** : Les imports dynamiques sont utilisés dans les méthodes pour éviter les dépendances circulaires
2. **Validation** : Tous les modèles incluent des validations Sequelize
3. **Index** : Index unique sur `(userId, badgeId)` pour UserBadge
4. **Timestamps** : Tous les modèles utilisent les timestamps automatiques
5. **UUID** : Tous les IDs utilisent des UUID v4 pour la sécurité

## 🔧 Configuration Requise

- **Node.js** : v16+
- **TypeScript** : v4+
- **Sequelize** : v6+
- **SQLite3** : Pour le développement
- **bcryptjs** : Pour le hashage des mots de passe
