"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const index_1 = require("./routes/index");
// Créer l'application Express
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware basique
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Route de base
app.get('/', (req, res) => {
    res.json({ message: 'Bienvenue sur l\'API de l\'application de suivi de lecture gamifiée' });
});
// Configurer les routes
(0, index_1.setupRoutes)(app);
// Gestion des erreurs 404
app.use((req, res) => {
    res.status(404).json({ message: 'Route non trouvée' });
});
// Gestion des erreurs globales
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Erreur serveur',
        error: err.message
    });
});
// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur en cours d'exécution sur le port ${PORT}`);
    console.log(`📚 API disponible sur http://localhost:${PORT}/api/v1`);
});
