import { Badge } from './index';
import { PREDEFINED_BADGES } from './badgeData';

/**
 * Fonction pour initialiser les badges prédéfinis dans la base de données
 */
export const seedBadges = async (): Promise<void> => {
  try {
    console.log('🌱 Initialisation des badges prédéfinis...');
    
    for (const badgeData of PREDEFINED_BADGES) {
      // Vérifier si le badge existe déjà
      const existingBadge = await Badge.findOne({
        where: { condition: badgeData.condition }
      });

      if (!existingBadge) {
        await Badge.create(badgeData);
        console.log(`✅ Badge créé: ${badgeData.name}`);
      } else {
        console.log(`⏭️  Badge déjà existant: ${badgeData.name}`);
      }
    }
    
    console.log('🎉 Initialisation des badges terminée !');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des badges:', error);
    throw error;
  }
};

/**
 * Fonction pour synchroniser la base de données et initialiser les données
 */
export const initializeDatabase = async (force: boolean = false): Promise<void> => {
  try {
    const { sequelize } = await import('../config/database');
    
    console.log('🔄 Synchronisation de la base de données...');
    
    // Synchroniser les modèles avec la base de données
    await sequelize.sync({ force });
    
    if (force) {
      console.log('🗑️  Base de données réinitialisée');
    } else {
      console.log('✅ Base de données synchronisée');
    }
    
    // Initialiser les badges prédéfinis
    await seedBadges();
    
    console.log('🚀 Base de données prête !');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
    throw error;
  }
};

/**
 * Fonction pour nettoyer la base de données (utile pour les tests)
 */
export const cleanDatabase = async (): Promise<void> => {
  try {
    const { sequelize } = await import('../config/database');
    
    console.log('🧹 Nettoyage de la base de données...');
    
    // Supprimer toutes les tables
    await sequelize.drop();
    
    console.log('✅ Base de données nettoyée');
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage de la base de données:', error);
    throw error;
  }
};

/**
 * Fonction pour créer un utilisateur de test avec des données d'exemple
 */
export const createTestUser = async (): Promise<any> => {
  try {
    const bcrypt = require('bcryptjs');
    const { User, Book } = await import('./index');
    const { BookCategory, BookStatus } = await import('./enums');
    
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
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'utilisateur de test:', error);
    throw error;
  }
};
