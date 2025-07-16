"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTestUser = exports.cleanDatabase = exports.initializeDatabase = exports.seedBadges = void 0;
const index_1 = require("./index");
const badgeData_1 = require("./badgeData");
/**
 * Fonction pour initialiser les badges prédéfinis dans la base de données
 */
const seedBadges = async () => {
    try {
        console.log('🌱 Initialisation des badges prédéfinis...');
        for (const badgeData of badgeData_1.PREDEFINED_BADGES) {
            // Vérifier si le badge existe déjà
            const existingBadge = await index_1.Badge.findOne({
                where: { condition: badgeData.condition }
            });
            if (!existingBadge) {
                await index_1.Badge.create(badgeData);
                console.log(`✅ Badge créé: ${badgeData.name}`);
            }
            else {
                console.log(`⏭️  Badge déjà existant: ${badgeData.name}`);
            }
        }
        console.log('🎉 Initialisation des badges terminée !');
    }
    catch (error) {
        console.error('❌ Erreur lors de l\'initialisation des badges:', error);
        throw error;
    }
};
exports.seedBadges = seedBadges;
/**
 * Fonction pour synchroniser la base de données et initialiser les données
 */
const initializeDatabase = async (force = false) => {
    try {
        const { sequelize } = await Promise.resolve().then(() => __importStar(require('../config/database')));
        console.log('🔄 Synchronisation de la base de données...');
        // Synchroniser les modèles avec la base de données
        await sequelize.sync({ force });
        if (force) {
            console.log('🗑️  Base de données réinitialisée');
        }
        else {
            console.log('✅ Base de données synchronisée');
        }
        // Initialiser les badges prédéfinis
        await (0, exports.seedBadges)();
        console.log('🚀 Base de données prête !');
    }
    catch (error) {
        console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
        throw error;
    }
};
exports.initializeDatabase = initializeDatabase;
/**
 * Fonction pour nettoyer la base de données (utile pour les tests)
 */
const cleanDatabase = async () => {
    try {
        const { sequelize } = await Promise.resolve().then(() => __importStar(require('../config/database')));
        console.log('🧹 Nettoyage de la base de données...');
        // Supprimer toutes les tables
        await sequelize.drop();
        console.log('✅ Base de données nettoyée');
    }
    catch (error) {
        console.error('❌ Erreur lors du nettoyage de la base de données:', error);
        throw error;
    }
};
exports.cleanDatabase = cleanDatabase;
/**
 * Fonction pour créer un utilisateur de test avec des données d'exemple
 */
const createTestUser = async () => {
    try {
        const bcrypt = require('bcryptjs');
        const { User, Book } = await Promise.resolve().then(() => __importStar(require('./index')));
        const { BookCategory, BookStatus } = await Promise.resolve().then(() => __importStar(require('./enums')));
        console.log('👤 Création d\'un utilisateur de test...');
        // Créer un utilisateur de test
        const hashedPassword = await bcrypt.hash('password123', 10);
        const testUser = await User.create({
            email: 'test@example.com',
            username: 'testuser',
            password: hashedPassword,
        });
        // Ajouter quelques livres d'exemple
        const sampleBooks = [
            {
                title: 'Le Petit Prince',
                author: 'Antoine de Saint-Exupéry',
                pages: 96,
                category: BookCategory.FICTION,
                status: BookStatus.COMPLETED,
                currentPage: 96,
                userId: testUser.id,
                completedAt: new Date(),
            },
            {
                title: 'Sapiens',
                author: 'Yuval Noah Harari',
                pages: 512,
                category: BookCategory.HISTORY,
                status: BookStatus.READING,
                currentPage: 250,
                userId: testUser.id,
            },
            {
                title: '1984',
                author: 'George Orwell',
                pages: 328,
                category: BookCategory.FICTION,
                status: BookStatus.NOT_STARTED,
                currentPage: 0,
                userId: testUser.id,
            },
        ];
        for (const bookData of sampleBooks) {
            await Book.create(bookData);
        }
        console.log('✅ Utilisateur de test créé avec succès');
        console.log(`📧 Email: test@example.com`);
        console.log(`🔑 Mot de passe: password123`);
        return testUser;
    }
    catch (error) {
        console.error('❌ Erreur lors de la création de l\'utilisateur de test:', error);
        throw error;
    }
};
exports.createTestUser = createTestUser;
