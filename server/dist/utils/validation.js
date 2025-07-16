"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUserRegistration = exports.validateBookUpdate = exports.validateBookCreation = exports.sanitizeString = exports.isValidUUID = exports.isValidBadgeIcon = exports.isValidBadgeCondition = exports.isValidBadgeDescription = exports.isValidBadgeName = exports.isValidBadgeRarity = exports.isValidBookStatus = exports.isValidBookCategory = exports.isValidCurrentPage = exports.isValidPageCount = exports.isValidAuthor = exports.isValidBookTitle = exports.isValidPassword = exports.isValidUsername = exports.isValidEmail = void 0;
const enums_1 = require("../models/enums");
/**
 * Valide une adresse email
 */
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.isValidEmail = isValidEmail;
/**
 * Valide un nom d'utilisateur
 */
const isValidUsername = (username) => {
    // Entre 3 et 50 caractères, lettres, chiffres, tirets et underscores uniquement
    const usernameRegex = /^[a-zA-Z0-9_-]{3,50}$/;
    return usernameRegex.test(username);
};
exports.isValidUsername = isValidUsername;
/**
 * Valide un mot de passe
 */
const isValidPassword = (password) => {
    // Au moins 6 caractères
    return password.length >= 6;
};
exports.isValidPassword = isValidPassword;
/**
 * Valide le titre d'un livre
 */
const isValidBookTitle = (title) => {
    return title.trim().length >= 1 && title.length <= 255;
};
exports.isValidBookTitle = isValidBookTitle;
/**
 * Valide le nom d'un auteur
 */
const isValidAuthor = (author) => {
    return author.trim().length >= 1 && author.length <= 255;
};
exports.isValidAuthor = isValidAuthor;
/**
 * Valide le nombre de pages d'un livre
 */
const isValidPageCount = (pages) => {
    return Number.isInteger(pages) && pages >= 1 && pages <= 10000;
};
exports.isValidPageCount = isValidPageCount;
/**
 * Valide la page actuelle d'un livre
 */
const isValidCurrentPage = (currentPage, totalPages) => {
    return Number.isInteger(currentPage) && currentPage >= 0 && currentPage <= totalPages;
};
exports.isValidCurrentPage = isValidCurrentPage;
/**
 * Valide une catégorie de livre
 */
const isValidBookCategory = (category) => {
    return Object.values(enums_1.BookCategory).includes(category);
};
exports.isValidBookCategory = isValidBookCategory;
/**
 * Valide un statut de livre
 */
const isValidBookStatus = (status) => {
    return Object.values(enums_1.BookStatus).includes(status);
};
exports.isValidBookStatus = isValidBookStatus;
/**
 * Valide une rareté de badge
 */
const isValidBadgeRarity = (rarity) => {
    return Object.values(enums_1.BadgeRarity).includes(rarity);
};
exports.isValidBadgeRarity = isValidBadgeRarity;
/**
 * Valide le nom d'un badge
 */
const isValidBadgeName = (name) => {
    return name.trim().length >= 1 && name.length <= 100;
};
exports.isValidBadgeName = isValidBadgeName;
/**
 * Valide la description d'un badge
 */
const isValidBadgeDescription = (description) => {
    return description.trim().length >= 1 && description.length <= 500;
};
exports.isValidBadgeDescription = isValidBadgeDescription;
/**
 * Valide une condition de badge
 */
const isValidBadgeCondition = (condition) => {
    return condition.trim().length >= 1 && condition.length <= 100;
};
exports.isValidBadgeCondition = isValidBadgeCondition;
/**
 * Valide l'icône d'un badge
 */
const isValidBadgeIcon = (icon) => {
    return icon.trim().length >= 1 && icon.length <= 50;
};
exports.isValidBadgeIcon = isValidBadgeIcon;
/**
 * Valide un UUID
 */
const isValidUUID = (uuid) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
};
exports.isValidUUID = isValidUUID;
/**
 * Nettoie et valide une chaîne de caractères
 */
const sanitizeString = (str) => {
    return str.trim().replace(/\s+/g, ' ');
};
exports.sanitizeString = sanitizeString;
/**
 * Valide les données de création d'un livre
 */
const validateBookCreation = (data) => {
    const errors = [];
    if (!data.title || !(0, exports.isValidBookTitle)(data.title)) {
        errors.push('Le titre du livre est requis et doit faire entre 1 et 255 caractères');
    }
    if (!data.author || !(0, exports.isValidAuthor)(data.author)) {
        errors.push('Le nom de l\'auteur est requis et doit faire entre 1 et 255 caractères');
    }
    if (!data.pages || !(0, exports.isValidPageCount)(data.pages)) {
        errors.push('Le nombre de pages doit être un entier entre 1 et 10000');
    }
    if (!data.category || !(0, exports.isValidBookCategory)(data.category)) {
        errors.push('La catégorie du livre est invalide');
    }
    return {
        isValid: errors.length === 0,
        errors
    };
};
exports.validateBookCreation = validateBookCreation;
/**
 * Valide les données de mise à jour d'un livre
 */
const validateBookUpdate = (data) => {
    const errors = [];
    if (data.title !== undefined && !(0, exports.isValidBookTitle)(data.title)) {
        errors.push('Le titre du livre doit faire entre 1 et 255 caractères');
    }
    if (data.author !== undefined && !(0, exports.isValidAuthor)(data.author)) {
        errors.push('Le nom de l\'auteur doit faire entre 1 et 255 caractères');
    }
    if (data.pages !== undefined && !(0, exports.isValidPageCount)(data.pages)) {
        errors.push('Le nombre de pages doit être un entier entre 1 et 10000');
    }
    if (data.category !== undefined && !(0, exports.isValidBookCategory)(data.category)) {
        errors.push('La catégorie du livre est invalide');
    }
    if (data.status !== undefined && !(0, exports.isValidBookStatus)(data.status)) {
        errors.push('Le statut du livre est invalide');
    }
    if (data.currentPage !== undefined && data.pages !== undefined && !(0, exports.isValidCurrentPage)(data.currentPage, data.pages)) {
        errors.push('La page actuelle doit être entre 0 et le nombre total de pages');
    }
    return {
        isValid: errors.length === 0,
        errors
    };
};
exports.validateBookUpdate = validateBookUpdate;
/**
 * Valide les données d'inscription d'un utilisateur
 */
const validateUserRegistration = (data) => {
    const errors = [];
    if (!data.email || !(0, exports.isValidEmail)(data.email)) {
        errors.push('Une adresse email valide est requise');
    }
    if (!data.username || !(0, exports.isValidUsername)(data.username)) {
        errors.push('Le nom d\'utilisateur doit faire entre 3 et 50 caractères et ne contenir que des lettres, chiffres, tirets et underscores');
    }
    if (!data.password || !(0, exports.isValidPassword)(data.password)) {
        errors.push('Le mot de passe doit faire au moins 6 caractères');
    }
    return {
        isValid: errors.length === 0,
        errors
    };
};
exports.validateUserRegistration = validateUserRegistration;
