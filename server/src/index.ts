import 'reflect-metadata';
import dotenv from 'dotenv';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { sequelize } from './config/database';
import { setupRoutes } from './routes';

// Charger les variables d'environnement
dotenv.config();

// Créer l'application Express
const app: Express = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Limiteur de taux pour les requêtes API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite chaque IP à 100 requêtes par fenêtre
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

// Route de base
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Bienvenue sur l\'API de l\'application de suivi de lecture gamifiée' });
});

// Configurer les routes
setupRoutes(app);

// Gestion des erreurs 404
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

// Gestion des erreurs globales
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Erreur serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
  });
});

// Synchroniser la base de données et démarrer le serveur
const startServer = async (): Promise<void> => {
  try {
    await sequelize.sync({ force: false });
    console.log('Base de données synchronisée');
    
    app.listen(PORT, () => {
      console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
    });
  } catch (error) {
    console.error('Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

startServer();