import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        username: string;
      };
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ 
        error: 'Token d\'accès requis',
        message: 'Vous devez être connecté pour accéder à cette ressource.' 
      });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET is not defined in environment variables');
      res.status(500).json({ 
        error: 'Erreur de configuration du serveur' 
      });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, jwtSecret) as { userId: string };

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
      },
    });

    if (!user) {
      res.status(401).json({ 
        error: 'Utilisateur non trouvé',
        message: 'Le token fait référence à un utilisateur qui n\'existe plus.' 
      });
      return;
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ 
        error: 'Token invalide',
        message: 'Le token d\'authentification n\'est pas valide.' 
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ 
        error: 'Token expiré',
        message: 'Votre session a expiré. Veuillez vous reconnecter.' 
      });
      return;
    }

    console.error('Erreur d\'authentification:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur' 
    });
  }
};