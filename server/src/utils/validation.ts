import { BookCategory, BookStatus, BadgeRarity } from '../models/enums';

/**
 * Valide une adresse email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valide un nom d'utilisateur
 */
export const isValidUsername = (username: string): boolean => {
  // Entre 3 et 50 caractères, lettres, chiffres, tirets et underscores uniquement
  const usernameRegex = /^[a-zA-Z0-9_-]{3,50}$/;
  return usernameRegex.test(username);
};

/**
 * Valide un mot de passe
 */
export const isValidPassword = (password: string): boolean => {
  // Au moins 6 caractères
  return password.length >= 6;
};

/**
 * Valide le titre d'un livre
 */
export const isValidBookTitle = (title: string): boolean => {
  return title.trim().length >= 1 && title.length <= 255;
};

/**
 * Valide le nom d'un auteur
 */
export const isValidAuthor = (author: string): boolean => {
  return author.trim().length >= 1 && author.length <= 255;
};

/**
 * Valide le nombre de pages d'un livre
 */
export const isValidPageCount = (pages: number): boolean => {
  return Number.isInteger(pages) && pages >= 1 && pages <= 10000;
};

/**
 * Valide la page actuelle d'un livre
 */
export const isValidCurrentPage = (currentPage: number, totalPages: number): boolean => {
  return Number.isInteger(currentPage) && currentPage >= 0 && currentPage <= totalPages;
};

/**
 * Valide une catégorie de livre
 */
export const isValidBookCategory = (category: string): boolean => {
  return Object.values(BookCategory).includes(category as BookCategory);
};

/**
 * Valide un statut de livre
 */
export const isValidBookStatus = (status: string): boolean => {
  return Object.values(BookStatus).includes(status as BookStatus);
};

/**
 * Valide une rareté de badge
 */
export const isValidBadgeRarity = (rarity: string): boolean => {
  return Object.values(BadgeRarity).includes(rarity as BadgeRarity);
};

/**
 * Valide le nom d'un badge
 */
export const isValidBadgeName = (name: string): boolean => {
  return name.trim().length >= 1 && name.length <= 100;
};

/**
 * Valide la description d'un badge
 */
export const isValidBadgeDescription = (description: string): boolean => {
  return description.trim().length >= 1 && description.length <= 500;
};

/**
 * Valide une condition de badge
 */
export const isValidBadgeCondition = (condition: string): boolean => {
  return condition.trim().length >= 1 && condition.length <= 100;
};

/**
 * Valide l'icône d'un badge
 */
export const isValidBadgeIcon = (icon: string): boolean => {
  return icon.trim().length >= 1 && icon.length <= 50;
};

/**
 * Valide un UUID
 */
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Nettoie et valide une chaîne de caractères
 */
export const sanitizeString = (str: string): string => {
  return str.trim().replace(/\s+/g, ' ');
};

/**
 * Valide les données de création d'un livre
 */
export const validateBookCreation = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.title || !isValidBookTitle(data.title)) {
    errors.push('Le titre du livre est requis et doit faire entre 1 et 255 caractères');
  }

  if (!data.author || !isValidAuthor(data.author)) {
    errors.push('Le nom de l\'auteur est requis et doit faire entre 1 et 255 caractères');
  }

  if (!data.pages || !isValidPageCount(data.pages)) {
    errors.push('Le nombre de pages doit être un entier entre 1 et 10000');
  }

  if (!data.category || !isValidBookCategory(data.category)) {
    errors.push('La catégorie du livre est invalide');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valide les données de mise à jour d'un livre
 */
export const validateBookUpdate = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (data.title !== undefined && !isValidBookTitle(data.title)) {
    errors.push('Le titre du livre doit faire entre 1 et 255 caractères');
  }

  if (data.author !== undefined && !isValidAuthor(data.author)) {
    errors.push('Le nom de l\'auteur doit faire entre 1 et 255 caractères');
  }

  if (data.pages !== undefined && !isValidPageCount(data.pages)) {
    errors.push('Le nombre de pages doit être un entier entre 1 et 10000');
  }

  if (data.category !== undefined && !isValidBookCategory(data.category)) {
    errors.push('La catégorie du livre est invalide');
  }

  if (data.status !== undefined && !isValidBookStatus(data.status)) {
    errors.push('Le statut du livre est invalide');
  }

  if (data.currentPage !== undefined && data.pages !== undefined && !isValidCurrentPage(data.currentPage, data.pages)) {
    errors.push('La page actuelle doit être entre 0 et le nombre total de pages');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valide les données d'inscription d'un utilisateur
 */
export const validateUserRegistration = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.email || !isValidEmail(data.email)) {
    errors.push('Une adresse email valide est requise');
  }

  if (!data.username || !isValidUsername(data.username)) {
    errors.push('Le nom d\'utilisateur doit faire entre 3 et 50 caractères et ne contenir que des lettres, chiffres, tirets et underscores');
  }

  if (!data.password || !isValidPassword(data.password)) {
    errors.push('Le mot de passe doit faire au moins 6 caractères');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
