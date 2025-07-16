"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = exports.closeConnection = exports.testConnection = void 0;
const sequelize_1 = require("sequelize");
const path_1 = __importDefault(require("path"));
// Configuration de la base de données SQLite avec Sequelize
const sequelize = new sequelize_1.Sequelize({
    dialect: 'sqlite',
    storage: path_1.default.join(__dirname, '../../database.sqlite'),
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
        timestamps: true,
        underscored: false, // Utiliser camelCase au lieu de snake_case
    },
});
exports.sequelize = sequelize;
// Fonction pour tester la connexion à la base de données
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connexion à la base de données établie avec succès.');
    }
    catch (error) {
        console.error('❌ Impossible de se connecter à la base de données:', error);
        throw error;
    }
};
exports.testConnection = testConnection;
// Fonction pour fermer la connexion à la base de données
const closeConnection = async () => {
    try {
        await sequelize.close();
        console.log('✅ Connexion à la base de données fermée.');
    }
    catch (error) {
        console.error('❌ Erreur lors de la fermeture de la connexion:', error);
        throw error;
    }
};
exports.closeConnection = closeConnection;
