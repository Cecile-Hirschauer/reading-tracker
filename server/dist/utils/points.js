"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatReadingTime = exports.estimateReadingTime = exports.isShortBook = exports.isLongBook = exports.calculateProgress = exports.calculateTotalBookPoints = exports.calculateBookPoints = void 0;
const enums_1 = require("../models/enums");
/**
 * Calcule les points gagnés pour un livre selon le nombre de pages
 */
const calculateBookPoints = (pages) => {
    if (pages < 150)
        return 10; // Livre court
    if (pages <= 300)
        return 20; // Livre moyen
    return 30; // Livre long
};
exports.calculateBookPoints = calculateBookPoints;
/**
 * Calcule les points totaux d'une liste de livres complétés
 */
const calculateTotalBookPoints = (books) => {
    return books
        .filter(book => book.status === enums_1.BookStatus.COMPLETED)
        .reduce((total, book) => total + (0, exports.calculateBookPoints)(book.pages), 0);
};
exports.calculateTotalBookPoints = calculateTotalBookPoints;
/**
 * Calcule le pourcentage de progression d'un livre
 */
const calculateProgress = (currentPage, totalPages) => {
    if (totalPages === 0)
        return 0;
    return Math.round((currentPage / totalPages) * 100);
};
exports.calculateProgress = calculateProgress;
/**
 * Détermine si un livre est considéré comme "long"
 */
const isLongBook = (pages) => {
    return pages > 300;
};
exports.isLongBook = isLongBook;
/**
 * Détermine si un livre est considéré comme "court"
 */
const isShortBook = (pages) => {
    return pages < 150;
};
exports.isShortBook = isShortBook;
/**
 * Calcule le temps de lecture estimé en heures (basé sur 250 mots/minute)
 */
const estimateReadingTime = (pages, wordsPerPage = 250) => {
    const totalWords = pages * wordsPerPage;
    const wordsPerMinute = 250; // Vitesse de lecture moyenne
    const minutes = totalWords / wordsPerMinute;
    return Math.round(minutes / 60 * 10) / 10; // Arrondi à 1 décimale
};
exports.estimateReadingTime = estimateReadingTime;
/**
 * Formate le temps de lecture pour l'affichage
 */
const formatReadingTime = (hours) => {
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
exports.formatReadingTime = formatReadingTime;
