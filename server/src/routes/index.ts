import { Express } from 'express';

export const setupRoutes = (app: Express): void => {
  // Route de base pour vérifier que l'API fonctionne
  app.get('/api/v1', (req, res) => {
    res.json({
      success: true,
      message: 'Reading Tracker API v1.0',
      timestamp: new Date().toISOString(),
    });
  });

  // Route de test simple
  app.get('/api/v1/test', (req, res) => {
    res.json({
      success: true,
      message: 'Test route works!',
    });
  });

  // Route 404 pour les endpoints non trouvés
  app.use('/api/v1/*', (req, res) => {
    res.status(404).json({
      success: false,
      message: 'Endpoint non trouvé',
      path: req.path,
    });
  });

  console.log('✅ Routes setup completed');
};
