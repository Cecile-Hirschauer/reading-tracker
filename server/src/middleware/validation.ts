import { Request, Response, NextFunction } from 'express';
import { BookCategory, BookStatus, BadgeRarity } from '../models/enums';

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return Boolean(password && password.length >= 6);
};

export const validateUsername = (username: string): boolean => {
  return Boolean(username && username.length >= 3 && username.length <= 50);
};

export const validateBookData = (req: Request, res: Response, next: NextFunction): void => {
  const { title, author, pages, category } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    res.status(400).json({
      success: false,
      message: 'Le titre est requis et doit être une chaîne non vide',
    });
    return;
  }

  if (!author || typeof author !== 'string' || author.trim().length === 0) {
    res.status(400).json({
      success: false,
      message: 'L\'auteur est requis et doit être une chaîne non vide',
    });
    return;
  }

  if (!pages || typeof pages !== 'number' || pages <= 0) {
    res.status(400).json({
      success: false,
      message: 'Le nombre de pages doit être un nombre positif',
    });
    return;
  }

  if (!category || !Object.values(BookCategory).includes(category)) {
    res.status(400).json({
      success: false,
      message: 'Catégorie invalide',
    });
    return;
  }

  next();
};

export const validateBookUpdate = (req: Request, res: Response, next: NextFunction): void => {
  const { title, author, pages, category, status, currentPage } = req.body;

  if (title !== undefined && (typeof title !== 'string' || title.trim().length === 0)) {
    res.status(400).json({
      success: false,
      message: 'Le titre doit être une chaîne non vide',
    });
    return;
  }

  if (author !== undefined && (typeof author !== 'string' || author.trim().length === 0)) {
    res.status(400).json({
      success: false,
      message: 'L\'auteur doit être une chaîne non vide',
    });
    return;
  }

  if (pages !== undefined && (typeof pages !== 'number' || pages <= 0)) {
    res.status(400).json({
      success: false,
      message: 'Le nombre de pages doit être un nombre positif',
    });
    return;
  }

  if (category !== undefined && !Object.values(BookCategory).includes(category)) {
    res.status(400).json({
      success: false,
      message: 'Catégorie invalide',
    });
    return;
  }

  if (status !== undefined && !Object.values(BookStatus).includes(status)) {
    res.status(400).json({
      success: false,
      message: 'Statut invalide',
    });
    return;
  }

  if (currentPage !== undefined && (typeof currentPage !== 'number' || currentPage < 0)) {
    res.status(400).json({
      success: false,
      message: 'La page courante doit être un nombre positif ou zéro',
    });
    return;
  }

  next();
};

export const validateProgressUpdate = (req: Request, res: Response, next: NextFunction): void => {
  const { currentPage } = req.body;

  if (currentPage === undefined || typeof currentPage !== 'number' || currentPage < 0) {
    res.status(400).json({
      success: false,
      message: 'La page courante est requise et doit être un nombre positif ou zéro',
    });
    return;
  }

  next();
};

export const validateUserRegistration = (req: Request, res: Response, next: NextFunction): void => {
  const { email, username, password } = req.body;

  if (!email || !validateEmail(email)) {
    res.status(400).json({
      success: false,
      message: 'Email valide requis',
    });
    return;
  }

  if (!username || !validateUsername(username)) {
    res.status(400).json({
      success: false,
      message: 'Nom d\'utilisateur requis (3-50 caractères)',
    });
    return;
  }

  if (!password || !validatePassword(password)) {
    res.status(400).json({
      success: false,
      message: 'Mot de passe requis (minimum 6 caractères)',
    });
    return;
  }

  next();
};

export const validateUserLogin = (req: Request, res: Response, next: NextFunction): void => {
  const { email, password } = req.body;

  if (!email || !validateEmail(email)) {
    res.status(400).json({
      success: false,
      message: 'Email valide requis',
    });
    return;
  }

  if (!password || typeof password !== 'string') {
    res.status(400).json({
      success: false,
      message: 'Mot de passe requis',
    });
    return;
  }

  next();
};

export const validateBadgeData = (req: Request, res: Response, next: NextFunction): void => {
  const { name, description, condition, icon, rarity } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    res.status(400).json({
      success: false,
      message: 'Le nom est requis et doit être une chaîne non vide',
    });
    return;
  }

  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    res.status(400).json({
      success: false,
      message: 'La description est requise et doit être une chaîne non vide',
    });
    return;
  }

  if (!condition || typeof condition !== 'string' || condition.trim().length === 0) {
    res.status(400).json({
      success: false,
      message: 'La condition est requise et doit être une chaîne non vide',
    });
    return;
  }

  if (!icon || typeof icon !== 'string' || icon.trim().length === 0) {
    res.status(400).json({
      success: false,
      message: 'L\'icône est requise et doit être une chaîne non vide',
    });
    return;
  }

  if (!rarity || !Object.values(BadgeRarity).includes(rarity)) {
    res.status(400).json({
      success: false,
      message: 'Rareté invalide',
    });
    return;
  }

  next();
};

export const validatePagination = (req: Request, res: Response, next: NextFunction): void => {
  const page = parseInt(req.query.page as string);
  const limit = parseInt(req.query.limit as string);

  if (req.query.page && (isNaN(page) || page < 1)) {
    res.status(400).json({
      success: false,
      message: 'Le numéro de page doit être un entier positif',
    });
    return;
  }

  if (req.query.limit && (isNaN(limit) || limit < 1 || limit > 100)) {
    res.status(400).json({
      success: false,
      message: 'La limite doit être un entier entre 1 et 100',
    });
    return;
  }

  next();
};

export const validateUUID = (paramName: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const uuid = req.params[paramName];
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuid || !uuidRegex.test(uuid)) {
      res.status(400).json({
        success: false,
        message: `${paramName} invalide`,
      });
      return;
    }

    next();
  };
};
