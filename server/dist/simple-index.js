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
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Route de base
app.get('/', (req, res) => {
    res.json({ message: 'Simple server works!' });
});
// Configurer les routes
(0, index_1.setupRoutes)(app);
// Gestion des erreurs 404
app.use((req, res) => {
    res.status(404).json({ message: 'Route non trouvée' });
});
// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`🚀 Simple server running on port ${PORT}`);
});
