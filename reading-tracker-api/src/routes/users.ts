import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { getLevelInfo } from '../utils/gameLogic';
import bcrypt from 'bcrypt';

const router = Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authenticateToken);

// Get user dashboard data
router.get('/dashboard', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Get user with counts
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        totalPoints: true,
        currentLevel: true,
        createdAt: true,
        _count: {
          select: {
            books: true,
            badges: true,
          }
        }
      }
    });

    if (!user) {
      res.status(404).json({ error: 'Utilisateur non trouvé' });
      return;
    }

    // Get level information
    const levelInfo = getLevelInfo(user.totalPoints);

    // Get reading stats
    const [completedBooks, readingBooks, recentBooks] = await Promise.all([
      prisma.book.count({ where: { userId, status: 'COMPLETED' } }),
      prisma.book.count({ where: { userId, status: 'READING' } }),
      prisma.book.findMany({
        where: { userId, status: 'COMPLETED' },
        orderBy: { completedDate: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          author: true,
          completedDate: true,
          pointsEarned: true,
          category: true
        }
      })
    ]);

    // Get recent badges
    const recentBadges = await prisma.badge.findMany({
      where: { userId },
      orderBy: { unlockedAt: 'desc' },
      take: 3,
      select: {
        id: true,
        name: true,
        description: true,
        unlockedAt: true,
        type: true
      }
    });

    res.json({
      user: {
        ...user,
        levelInfo,
        stats: {
          totalBooks: user._count.books,
          completedBooks,
          readingBooks,
          totalBadges: user._count.badges
        }
      },
      recentBooks,
      recentBadges
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du dashboard:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Update user profile
router.put('/profile', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email } = req.body;
    const userId = req.user!.id;

    const updateData: any = {};
    
    if (username) {
      // Check if username is already taken
      const existingUser = await prisma.user.findFirst({
        where: {
          username,
          id: { not: userId }
        }
      });

      if (existingUser) {
        res.status(409).json({
          error: 'Nom d\'utilisateur déjà pris',
          message: 'Ce nom d\'utilisateur est déjà utilisé par un autre compte.'
        });
        return;
      }

      updateData.username = username.trim();
    }

    if (email) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          error: 'Format d\'email invalide',
          message: 'Veuillez fournir une adresse email valide.'
        });
        return;
      }

      // Check if email is already taken
      const existingUser = await prisma.user.findFirst({
        where: {
          email: email.toLowerCase(),
          id: { not: userId }
        }
      });

      if (existingUser) {
        res.status(409).json({
          error: 'Email déjà utilisé',
          message: 'Un compte avec cet email existe déjà.'
        });
        return;
      }

      updateData.email = email.toLowerCase();
    }

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({
        error: 'Aucune donnée à mettre à jour',
        message: 'Veuillez fournir au moins un champ à modifier.'
      });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        totalPoints: true,
        currentLevel: true,
        updatedAt: true
      }
    });

    res.json({
      message: 'Profil mis à jour avec succès',
      user: updatedUser
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Change password
router.put('/password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user!.id;

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        error: 'Mots de passe requis',
        message: 'Le mot de passe actuel et le nouveau mot de passe sont requis.'
      });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({
        error: 'Nouveau mot de passe trop faible',
        message: 'Le nouveau mot de passe doit contenir au moins 6 caractères.'
      });
      return;
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      res.status(404).json({ error: 'Utilisateur non trouvé' });
      return;
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      res.status(401).json({
        error: 'Mot de passe actuel incorrect',
        message: 'Le mot de passe actuel que vous avez saisi est incorrect.'
      });
      return;
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });

    res.json({
      message: 'Mot de passe modifié avec succès'
    });

  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Delete account
router.delete('/account', async (req: Request, res: Response): Promise<void> => {
  try {
    const { password } = req.body;
    const userId = req.user!.id;

    if (!password) {
      res.status(400).json({
        error: 'Mot de passe requis',
        message: 'Veuillez confirmer votre mot de passe pour supprimer le compte.'
      });
      return;
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      res.status(404).json({ error: 'Utilisateur non trouvé' });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        error: 'Mot de passe incorrect',
        message: 'Le mot de passe saisi est incorrect.'
      });
      return;
    }

    // Delete user (cascade will delete books and badges)
    await prisma.user.delete({
      where: { id: userId }
    });

    res.json({
      message: 'Compte supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du compte:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

export default router;