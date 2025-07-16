import { Router } from 'express';

const router = Router();

// Route de test simple
router.get('/test', (req, res) => {
  res.json({ message: 'Test route works!' });
});

export default router;
