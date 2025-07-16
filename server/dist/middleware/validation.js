"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUUID = exports.validatePagination = exports.validateBadgeData = exports.validateUserLogin = exports.validateUserRegistration = exports.validateProgressUpdate = exports.validateBookUpdate = exports.validateBookData = exports.validateUsername = exports.validatePassword = exports.validateEmail = void 0;
const enums_1 = require("../models/enums");
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.validateEmail = validateEmail;
const validatePassword = (password) => {
    return Boolean(password && password.length >= 6);
};
exports.validatePassword = validatePassword;
const validateUsername = (username) => {
    return Boolean(username && username.length >= 3 && username.length <= 50);
};
exports.validateUsername = validateUsername;
const validateBookData = (req, res, next) => {
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
    if (!category || !Object.values(enums_1.BookCategory).includes(category)) {
        res.status(400).json({
            success: false,
            message: 'Catégorie invalide',
        });
        return;
    }
    next();
};
exports.validateBookData = validateBookData;
const validateBookUpdate = (req, res, next) => {
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
    if (category !== undefined && !Object.values(enums_1.BookCategory).includes(category)) {
        res.status(400).json({
            success: false,
            message: 'Catégorie invalide',
        });
        return;
    }
    if (status !== undefined && !Object.values(enums_1.BookStatus).includes(status)) {
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
exports.validateBookUpdate = validateBookUpdate;
const validateProgressUpdate = (req, res, next) => {
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
exports.validateProgressUpdate = validateProgressUpdate;
const validateUserRegistration = (req, res, next) => {
    const { email, username, password } = req.body;
    if (!email || !(0, exports.validateEmail)(email)) {
        res.status(400).json({
            success: false,
            message: 'Email valide requis',
        });
        return;
    }
    if (!username || !(0, exports.validateUsername)(username)) {
        res.status(400).json({
            success: false,
            message: 'Nom d\'utilisateur requis (3-50 caractères)',
        });
        return;
    }
    if (!password || !(0, exports.validatePassword)(password)) {
        res.status(400).json({
            success: false,
            message: 'Mot de passe requis (minimum 6 caractères)',
        });
        return;
    }
    next();
};
exports.validateUserRegistration = validateUserRegistration;
const validateUserLogin = (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !(0, exports.validateEmail)(email)) {
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
exports.validateUserLogin = validateUserLogin;
const validateBadgeData = (req, res, next) => {
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
    if (!rarity || !Object.values(enums_1.BadgeRarity).includes(rarity)) {
        res.status(400).json({
            success: false,
            message: 'Rareté invalide',
        });
        return;
    }
    next();
};
exports.validateBadgeData = validateBadgeData;
const validatePagination = (req, res, next) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
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
exports.validatePagination = validatePagination;
const validateUUID = (paramName) => {
    return (req, res, next) => {
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
exports.validateUUID = validateUUID;
