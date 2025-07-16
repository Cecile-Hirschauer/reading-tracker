// Export de tous les types et interfaces des modèles
export type { UserAttributes } from './User';
export type { BookAttributes } from './Book';
export type { BadgeAttributes } from './Badge';
export type { UserBadgeAttributes } from './UserBadge';

// Export des enums
export {
  BookCategory,
  BookStatus,
  BadgeRarity,
  UserLevel
} from './enums';

// Export des données de badges
export type { BadgeData } from './badgeData';
export {
  PREDEFINED_BADGES,
  getBadgeByCondition,
  getBadgesByRarity,
  calculateBadgePoints
} from './badgeData';

// Types utilitaires pour l'API
export interface UserStats {
  totalBooks: number;
  completedBooks: number;
  currentlyReading: number;
  totalPages: number;
  totalPoints: number;
  level: string;
  badgesCount: number;
}

export interface BookProgress {
  bookId: string;
  currentPage: number;
  progress: number;
  status: string;
}

export interface BadgeUnlock {
  badgeId: string;
  userId: string;
  unlockedAt: Date;
  badge: {
    name: string;
    description: string;
    icon: string;
    rarity: string;
  };
}

// Types pour les requêtes API
export interface CreateBookRequest {
  title: string;
  author: string;
  pages: number;
  category: string;
}

export interface UpdateBookRequest {
  title?: string;
  author?: string;
  pages?: number;
  category?: string;
  status?: string;
  currentPage?: number;
}

export interface UpdateProgressRequest {
  currentPage: number;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Types pour les réponses API
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    username: string;
  };
  token: string;
}

export interface BookResponse {
  id: string;
  title: string;
  author: string;
  pages: number;
  category: string;
  status: string;
  currentPage: number;
  progress: number;
  points: number;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface BadgeResponse {
  id: string;
  name: string;
  description: string;
  condition: string;
  icon: string;
  rarity: string;
  unlockedAt?: Date;
}

export interface DashboardResponse {
  user: {
    id: string;
    username: string;
    level: string;
    totalPoints: number;
  };
  stats: UserStats;
  recentBooks: BookResponse[];
  recentBadges: BadgeResponse[];
  currentlyReading: BookResponse[];
}
