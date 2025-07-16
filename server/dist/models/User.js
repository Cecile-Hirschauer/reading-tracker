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
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const enums_1 = require("./enums");
class User extends sequelize_1.Model {
    // Méthodes d'instance
    async getTotalPoints() {
        // Import dynamique pour éviter les dépendances circulaires
        const { Book, UserBadge, Badge } = await Promise.resolve().then(() => __importStar(require('./index')));
        // Calculer les points des livres complétés
        const books = await Book.findAll({
            where: {
                userId: this.id,
                status: enums_1.BookStatus.COMPLETED
            }
        });
        const bookPoints = books.reduce((total, book) => {
            return total + book.points;
        }, 0);
        // Calculer les points des badges
        const userBadges = await UserBadge.findAll({
            where: { userId: this.id },
            include: [{ model: Badge, as: 'badge' }]
        });
        const badgePoints = userBadges.reduce((total, userBadge) => {
            return total + (userBadge.badge?.getRarityPoints() || 0);
        }, 0);
        return bookPoints + badgePoints;
    }
    async getUserLevel() {
        const totalPoints = await this.getTotalPoints();
        if (totalPoints <= 50)
            return enums_1.UserLevel.BEGINNER;
        if (totalPoints <= 150)
            return enums_1.UserLevel.AMATEUR;
        if (totalPoints <= 300)
            return enums_1.UserLevel.CONFIRMED;
        return enums_1.UserLevel.EXPERT;
    }
    // Méthode pour obtenir les statistiques de l'utilisateur
    async getStats() {
        const { Book, Badge } = await Promise.resolve().then(() => __importStar(require('./index')));
        const books = await Book.findAll({ where: { userId: this.id } });
        const completedBooks = books.filter((book) => book.status === enums_1.BookStatus.COMPLETED);
        const readingBooks = books.filter((book) => book.status === enums_1.BookStatus.READING);
        const totalPages = completedBooks.reduce((total, book) => total + book.pages, 0);
        const totalPoints = await this.getTotalPoints();
        const level = await this.getUserLevel();
        const badges = await Badge.findAll({
            include: [{
                    model: User,
                    as: 'users',
                    where: { id: this.id },
                    through: { attributes: [] }
                }]
        });
        return {
            totalBooks: books.length,
            completedBooks: completedBooks.length,
            currentlyReading: readingBooks.length,
            totalPages,
            totalPoints,
            level,
            badgesCount: badges.length,
        };
    }
}
User.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [6, 255],
        },
    },
    username: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            len: [3, 50],
        },
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
}, {
    sequelize: database_1.sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
});
exports.default = User;
