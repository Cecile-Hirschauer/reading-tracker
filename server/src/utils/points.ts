import { BookStatus } from '../models/enums';
import type { BookAttributes } from '../models/types';

/**
 * Calcule les points gagnés pour un livre selon le nombre de pages
 */
export const calculateBookPoints = (pages: number): number => {
  if (pages < 150) return 10;      // Livre court
  if (pages <= 300) return 20;     // Livre moyen
  return 30;                       // Livre long
};

/**
 * Calcule les points totaux d'une liste de livres complétés
 */
export const calculateTotalBookPoints = (books: BookAttributes[]): number => {
  return books
    .filter(book => book.status === BookStatus.COMPLETED)
    .reduce((total, book) => total + calculateBookPoints(book.pages), 0);
};

/**
 * Calcule le pourcentage de progression d'un livre
 */
export const calculateProgress = (currentPage: number, totalPages: number): number => {
  if (totalPages === 0) return 0;
  return Math.round((currentPage / totalPages) * 100);
};

/**
 * Détermine si un livre est considéré comme "long"
 */
export const isLongBook = (pages: number): boolean => {
  return pages > 300;
};

/**
 * Détermine si un livre est considéré comme "court"
 */
export const isShortBook = (pages: number): boolean => {
  return pages < 150;
};

/**
 * Calcule le temps de lecture estimé en heures (basé sur 250 mots/minute)
 */
export const estimateReadingTime = (pages: number, wordsPerPage: number = 250): number => {
  const totalWords = pages * wordsPerPage;
  const wordsPerMinute = 250; // Vitesse de lecture moyenne
  const minutes = totalWords / wordsPerMinute;
  return Math.round(minutes / 60 * 10) / 10; // Arrondi à 1 décimale
};

/**
 * Formate le temps de lecture pour l'affichage
 */
export const formatReadingTime = (hours: number): string => {
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
  
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  
  if (minutes === 0) {
    return `${wholeHours} heure${wholeHours > 1 ? 's' : ''}`;
  }
  
  return `${wholeHours}h${minutes.toString().padStart(2, '0')}`;
};
