import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding...');

  // Nettoyage des données existantes (attention : supprime tout !)
  await prisma.badge.deleteMany({});
  await prisma.book.deleteMany({});
  await prisma.user.deleteMany({});
  
  console.log('✨ Base de données nettoyée');

  // Création d'un utilisateur de test
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  const testUser = await prisma.user.create({
    data: {
      email: 'test@example.com',
      username: 'lecteur_test',
      password: hashedPassword,
      totalPoints: 0,
      currentLevel: 1,
    },
  });

  console.log('👤 Utilisateur de test créé:', testUser.email);

  // Création de livres d'exemple
  const sampleBooks = [
    {
      title: 'Le Petit Prince',
      author: 'Antoine de Saint-Exupéry',
      totalPages: 96,
      currentPage: 96,
      category: 'Fiction',
      status: 'COMPLETED' as const,
      pointsEarned: 10, // livre court
    },
    {
      title: '1984',
      author: 'George Orwell',
      totalPages: 328,
      currentPage: 328,
      category: 'Dystopie',
      status: 'COMPLETED' as const,
      pointsEarned: 30, // livre long
    },
    {
      title: 'L\'Étranger',
      author: 'Albert Camus',
      totalPages: 159,
      currentPage: 159,
      category: 'Philosophie',
      status: 'COMPLETED' as const,
      pointsEarned: 20, // livre moyen
    },
    {
      title: 'Dune',
      author: 'Frank Herbert',
      totalPages: 688,
      currentPage: 350,
      category: 'Science-Fiction',
      status: 'READING' as const,
      pointsEarned: 0,
    },
    {
      title: 'Sapiens',
      author: 'Yuval Noah Harari',
      totalPages: 431,
      currentPage: 0,
      category: 'Histoire',
      status: 'READING' as const,
      pointsEarned: 0,
    },
  ];

  for (const bookData of sampleBooks) {
    await prisma.book.create({
      data: {
        ...bookData,
        userId: testUser.id,
        completedDate: bookData.status === 'COMPLETED' ? new Date() : null,
      },
    });
  }

  // Mise à jour des points de l'utilisateur
  const totalPoints = sampleBooks
    .filter(book => book.status === 'COMPLETED')
    .reduce((sum, book) => sum + book.pointsEarned, 0);

  await prisma.user.update({
    where: { id: testUser.id },
    data: { 
      totalPoints,
      currentLevel: totalPoints >= 51 ? 2 : 1 // Amateur si >= 51 points
    },
  });

  // Création de badges pour l'utilisateur de test
  await prisma.badge.create({
    data: {
      userId: testUser.id,
      type: 'FIRST_BOOK',
      name: 'Première Lecture',
      description: 'Félicitations pour votre premier livre terminé !',
    },
  });

  await prisma.badge.create({
    data: {
      userId: testUser.id,
      type: 'GENRE_EXPLORER_3',
      name: 'Explorer les genres',
      description: 'Vous avez lu dans 3 genres différents',
    },
  });

  await prisma.badge.create({
    data: {
      userId: testUser.id,
      type: 'MARATHON_READER',
      name: 'Marathon de lecture',
      description: 'Vous avez terminé un livre de plus de 300 pages',
    },
  });

  console.log('📚 Livres d\'exemple créés');
  console.log('🏆 Badges d\'exemple créés');

  // Création d'un deuxième utilisateur vide pour les tests
  const emptyUser = await prisma.user.create({
    data: {
      email: 'nouveau@example.com',
      username: 'nouveau_lecteur',
      password: hashedPassword,
      totalPoints: 0,
      currentLevel: 1,
    },
  });

  console.log('👤 Utilisateur vide créé:', emptyUser.email);

  // Statistiques finales
  const userCount = await prisma.user.count();
  const bookCount = await prisma.book.count();
  const badgeCount = await prisma.badge.count();

  console.log('\n📊 Statistiques du seeding:');
  console.log(`   👥 Utilisateurs: ${userCount}`);
  console.log(`   📖 Livres: ${bookCount}`);
  console.log(`   🏆 Badges: ${badgeCount}`);
  console.log('\n🎉 Seeding terminé avec succès !');
  
  console.log('\n🔐 Comptes de test créés:');
  console.log('   Email: test@example.com');
  console.log('   Email: nouveau@example.com');
  console.log('   Password: password123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Erreur durant le seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });