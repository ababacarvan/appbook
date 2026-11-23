import { PrismaClient, UserRole, BookStatus, ContentType, SubscriptionStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Début du seeding...')

  // 1. Créer les utilisateurs
  console.log('👤 Création des utilisateurs...')
  
  const adminPassword = await bcrypt.hash('admin123', 10)
  const authorPassword = await bcrypt.hash('author123', 10)
  const userPassword = await bcrypt.hash('user123', 10)

  // Créer l'admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@appbook.com' },
    update: {},
    create: {
      email: 'admin@appbook.com',
      password: adminPassword,
      name: 'Admin AppBook',
      role: UserRole.SUPER_ADMIN,
      emailVerified: new Date(),
      isActive: true
    }
  })
  console.log(`✅ Admin créé: ${admin.email}`)

  // Créer l'auteur 1
  const author = await prisma.user.upsert({
    where: { email: 'author@appbook.com' },
    update: {},
    create: {
      email: 'author@appbook.com',
      password: authorPassword,
      name: 'Aminata Diallo',
      role: UserRole.AUTHOR,
      emailVerified: new Date(),
      isActive: true,
      bio: 'Auteure passionnée par la littérature africaine contemporaine. Je raconte des histoires qui résonnent avec notre réalité.'
    }
  })
  console.log(`✅ Auteur 1 créé: ${author.email}`)

  // Créer l'auteur 2
  const author2 = await prisma.user.upsert({
    where: { email: 'author2@appbook.com' },
    update: {},
    create: {
      email: 'author2@appbook.com',
      password: authorPassword,
      name: 'Mamadou Sarr',
      role: UserRole.AUTHOR,
      emailVerified: new Date(),
      isActive: true,
      bio: 'Écrivain et poète sénégalais. Mes textes explorent les thèmes de l\'identité, de la migration et de la mémoire.'
    }
  })
  console.log(`✅ Auteur 2 créé: ${author2.email}`)

  // Créer l'utilisateur 1
  const user1 = await prisma.user.upsert({
    where: { email: 'user1@appbook.com' },
    update: {},
    create: {
      email: 'user1@appbook.com',
      password: userPassword,
      name: 'Fatou Ndiaye',
      role: UserRole.USER,
      emailVerified: new Date(),
      isActive: true
    }
  })
  console.log(`✅ Utilisateur 1 créé: ${user1.email}`)

  // Créer l'utilisateur 2
  const user2 = await prisma.user.upsert({
    where: { email: 'user2@appbook.com' },
    update: {},
    create: {
      email: 'user2@appbook.com',
      password: userPassword,
      name: 'Oumar Kane',
      role: UserRole.USER,
      emailVerified: new Date(),
      isActive: true
    }
  })
  console.log(`✅ Utilisateur 2 créé: ${user2.email}`)

  // 2. Créer les profils auteurs
  console.log('📝 Création des profils auteurs...')

  const authorProfile = await prisma.author.upsert({
    where: { userId: author.id },
    update: {},
    create: {
      userId: author.id,
      bio: 'Auteure passionnée par la littérature africaine contemporaine.',
      isVerified: true,
      website: 'https://aminatadiallo.com',
      socialLinks: {
        twitter: '@aminata_diallo',
        instagram: '@aminata_diallo'
      }
    }
  })
  console.log('✅ Profil auteur 1 créé')

  const authorProfile2 = await prisma.author.upsert({
    where: { userId: author2.id },
    update: {},
    create: {
      userId: author2.id,
      bio: 'Écrivain et poète sénégalais.',
      isVerified: true,
      website: 'https://mamadousarr.com'
    }
  })
  console.log('✅ Profil auteur 2 créé')

  // 3. Créer les catégories
  console.log('📚 Création des catégories...')

  const categoriesData = [
    { name: 'Littérature', slug: 'litterature', icon: '📚' },
    { name: 'Romans', slug: 'romans', icon: '📖' },
    { name: 'Science-fiction', slug: 'science-fiction', icon: '🚀' },
    { name: 'Fantasy', slug: 'fantasy', icon: '🐉' },
    { name: 'Éducation', slug: 'education', icon: '🎓' },
    { name: 'Mathématiques', slug: 'mathematiques', icon: '📐' },
    { name: 'Informatique', slug: 'informatique', icon: '💻' },
    { name: 'Développement personnel', slug: 'developpement-personnel', icon: '💪' },
    { name: 'Afrique', slug: 'afrique', icon: '🌍' },
    { name: 'Bandes dessinées', slug: 'bd', icon: '🎨' },
    { name: 'Jeunesse', slug: 'jeunesse', icon: '🧒' },
    { name: 'Poésie', slug: 'poesie', icon: '✍️' },
    { name: 'Histoire', slug: 'histoire', icon: '📜' },
    { name: 'Philosophie', slug: 'philosophie', icon: '🤔' },
    { name: 'Santé', slug: 'sante', icon: '🏥' },
    { name: 'Cuisine', slug: 'cuisine', icon: '🍳' },
    { name: 'Voyage', slug: 'voyage', icon: '✈️' },
    { name: 'Business', slug: 'business', icon: '💼' }
  ]

  const createdCategories = []
  for (const cat of categoriesData) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat
    })
    createdCategories.push(category)
  }
  console.log(`✅ ${createdCategories.length} catégories créées`)

  // 4. Créer les tags
  console.log('🏷️ Création des tags...')

  const tagsData = [
    'Africain', 'Francophone', 'Best-seller', 'Prix littéraire',
    'Contemporain', 'Classique', 'Essai', 'Biographie',
    'Guide pratique', 'Manuel scolaire', 'Cours', 'Mémoire',
    'Spiritualité', 'Développement', 'Leadership', 'Innovation',
    'Tradition', 'Modernité', 'Féminisme', 'Identité'
  ]

  const createdTags = []
  for (const tagName of tagsData) {
    const tag = await prisma.tag.upsert({
      where: { slug: tagName.toLowerCase().replace(/ /g, '-') },
      update: {},
      create: {
        name: tagName,
        slug: tagName.toLowerCase().replace(/ /g, '-')
      }
    })
    createdTags.push(tag)
  }
  console.log(`✅ ${createdTags.length} tags créés`)

  // 5. Créer les livres
  console.log('📖 Création des livres...')

  // Récupérer l'ID de l'auteur
  const authorUser = await prisma.user.findUnique({
    where: { email: 'author@appbook.com' }
  })

  if (!authorUser) {
    throw new Error('Author not found')
  }

  // Récupérer le profil auteur
  const authorProf = await prisma.author.findUnique({
    where: { userId: authorUser.id }
  })

  if (!authorProf) {
    throw new Error('Author profile not found')
  }

  const booksData = [
    {
      title: 'La Promesse de l\'Aube',
      subtitle: 'Roman',
      description: 'Un roman captivant sur l\'espoir et la résilience dans l\'Afrique contemporaine. L\'histoire de Sarah, une jeune femme qui doit faire face aux défis de la vie moderne tout en restant fidèle à ses racines.',
      coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop',
      language: 'fr',
      type: ContentType.EBOOK,
      pageCount: 320,
      price: 1500,
      isFree: false,
      isPremium: true,
      status: BookStatus.PUBLISHED,
      publishedAt: new Date('2025-01-15'),
      authorId: authorProf.id,
      categories: ['romans', 'litterature', 'afrique'],
      tags: ['Africain', 'Francophone', 'Contemporain', 'Best-seller']
    },
    {
      title: 'Les Oiseaux du Soleil',
      subtitle: 'Recueil de poèmes',
      description: 'Un voyage poétique à travers les paysages africains. Chaque poème est une invitation à découvrir la beauté et la complexité du continent.',
      coverImage: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=600&fit=crop',
      language: 'fr',
      type: ContentType.EBOOK,
      pageCount: 180,
      price: 0,
      isFree: true,
      isPremium: false,
      status: BookStatus.PUBLISHED,
      publishedAt: new Date('2025-02-01'),
      authorId: authorProf.id,
      categories: ['poesie', 'afrique'],
      tags: ['Poésie', 'Africain', 'Francophone']
    },
    {
      title: 'L\'Éveil de l\'Esprit',
      subtitle: 'Guide de développement personnel',
      description: 'Un guide pratique pour transformer sa vie et atteindre ses objectifs. Basé sur des principes de psychologie positive et de sagesse africaine.',
      coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop',
      language: 'fr',
      type: ContentType.EBOOK,
      pageCount: 250,
      price: 1200,
      isFree: false,
      isPremium: false,
      status: BookStatus.PUBLISHED,
      publishedAt: new Date('2025-02-15'),
      authorId: authorProf.id,
      categories: ['developpement-personnel'],
      tags: ['Guide pratique', 'Francophone', 'Développement']
    },
    {
      title: 'Contes de la Savane',
      subtitle: 'Histoires pour enfants',
      description: 'Des contes traditionnels africains pour enfants. Des histoires qui transmettent des valeurs et des leçons de vie à travers des personnages attachants.',
      coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop',
      language: 'fr',
      type: ContentType.AUDIOBOOK,
      duration: 3600,
      price: 500,
      isFree: true,
      isPremium: false,
      status: BookStatus.PUBLISHED,
      publishedAt: new Date('2025-03-01'),
      authorId: authorProf.id,
      categories: ['jeunesse', 'afrique'],
      tags: ['Contes', 'Africain', 'Francophone']
    },
    {
      title: 'Algorithmes et Structures de Données',
      subtitle: 'Cours complet',
      description: 'Un cours approfondi sur les algorithmes pour étudiants en informatique. De la théorie à la pratique avec des exercices corrigés.',
      coverImage: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=600&fit=crop',
      language: 'fr',
      type: ContentType.DOCUMENT,
      pageCount: 450,
      price: 2000,
      isFree: false,
      isPremium: true,
      status: BookStatus.PUBLISHED,
      publishedAt: new Date('2025-03-15'),
      authorId: authorProf.id,
      categories: ['informatique', 'education'],
      tags: ['Cours', 'Manuel scolaire', 'Informatique']
    },
    {
      title: 'La Sagesse des Anciens',
      subtitle: 'Philosophie africaine',
      description: 'Une exploration des systèmes de pensée traditionnels africains et leur pertinence dans le monde moderne.',
      coverImage: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400&h=600&fit=crop',
      language: 'fr',
      type: ContentType.EBOOK,
      pageCount: 280,
      price: 1800,
      isFree: false,
      isPremium: true,
      status: BookStatus.PUBLISHED,
      publishedAt: new Date('2025-04-01'),
      authorId: authorProf.id,
      categories: ['philosophie', 'afrique'],
      tags: ['Philosophie', 'Africain', 'Essai']
    },
    {
      title: 'Le Jardin de l\'Âme',
      subtitle: 'Poésie contemporaine',
      description: 'Un recueil de poèmes qui explore les thèmes de l\'amour, de la nature et de la spiritualité.',
      coverImage: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&h=600&fit=crop',
      language: 'fr',
      type: ContentType.EBOOK,
      pageCount: 150,
      price: 800,
      isFree: false,
      isPremium: false,
      status: BookStatus.PUBLISHED,
      publishedAt: new Date('2025-04-15'),
      authorId: authorProf.id,
      categories: ['poesie'],
      tags: ['Poésie', 'Contemporain']
    },
    {
      title: 'Cuisine Africaine Moderne',
      subtitle: 'Recettes traditionnelles revisitées',
      description: 'Un livre de cuisine qui revisite les recettes traditionnelles africaines avec une touche moderne.',
      coverImage: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&h=600&fit=crop',
      language: 'fr',
      type: ContentType.EBOOK,
      pageCount: 200,
      price: 1500,
      isFree: false,
      isPremium: false,
      status: BookStatus.PUBLISHED,
      publishedAt: new Date('2025-05-01'),
      authorId: authorProf.id,
      categories: ['cuisine', 'afrique'],
      tags: ['Cuisine', 'Africain', 'Guide pratique']
    },
    {
      title: 'Le Voyage Intérieur',
      subtitle: 'Guide de méditation',
      description: 'Un guide pratique pour découvrir la méditation et ses bienfaits dans la vie quotidienne.',
      coverImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=600&fit=crop',
      language: 'fr',
      type: ContentType.AUDIOBOOK,
      duration: 5400,
      price: 2000,
      isFree: false,
      isPremium: true,
      status: BookStatus.PUBLISHED,
      publishedAt: new Date('2025-05-15'),
      authorId: authorProf.id,
      categories: ['developpement-personnel'],
      tags: ['Spiritualité', 'Développement']
    },
    {
      title: 'Histoire de l\'Afrique',
      subtitle: 'Des origines à nos jours',
      description: 'Une histoire complète de l\'Afrique, des premières civilisations aux défis contemporains.',
      coverImage: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400&h=600&fit=crop',
      language: 'fr',
      type: ContentType.EBOOK,
      pageCount: 500,
      price: 2500,
      isFree: false,
      isPremium: true,
      status: BookStatus.PUBLISHED,
      publishedAt: new Date('2025-06-01'),
      authorId: authorProf.id,
      categories: ['histoire', 'afrique'],
      tags: ['Histoire', 'Africain', 'Essai']
    }
  ]

  const createdBooks = []
  for (const bookData of booksData) {
    const { categories: catSlugs, tags: tagNames, ...rest } = bookData
    
    const book = await prisma.book.create({
      data: {
        ...rest,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    // Add categories
    for (const catSlug of catSlugs) {
      const category = await prisma.category.findUnique({
        where: { slug: catSlug }
      })
      if (category) {
        await prisma.bookCategory.create({
          data: {
            bookId: book.id,
            categoryId: category.id
          }
        })
      }
    }

    // Add tags
    for (const tagName of tagNames) {
      const tag = await prisma.tag.findUnique({
        where: { name: tagName }
      })
      if (tag) {
        await prisma.bookTag.create({
          data: {
            bookId: book.id,
            tagId: tag.id
          }
        })
      }
    }

    createdBooks.push(book)
  }

  console.log(`✅ ${createdBooks.length} livres créés`)

  // 6. Créer des chapitres audio pour les livres audio
  console.log('🎧 Création des chapitres audio...')

  const audioBooks = await prisma.book.findMany({
    where: { type: ContentType.AUDIOBOOK }
  })

  for (const book of audioBooks) {
    const chapters = [
      { title: 'Introduction', duration: 300 },
      { title: 'Chapitre 1', duration: 600 },
      { title: 'Chapitre 2', duration: 720 },
      { title: 'Chapitre 3', duration: 540 },
      { title: 'Conclusion', duration: 240 }
    ]

    for (let i = 0; i < chapters.length; i++) {
      await prisma.audioChapter.create({
        data: {
          bookId: book.id,
          title: chapters[i].title,
          fileUrl: `https://example.com/audio/${book.id}/chapter-${i+1}.mp3`,
          duration: chapters[i].duration,
          order: i + 1
        }
      })
    }
  }

  console.log('✅ Chapitres audio créés')

  // 7. Créer des abonnements
  console.log('💳 Création des abonnements...')

  const subscriptions = [
    { userId: user1.id, plan: 'premium', status: SubscriptionStatus.ACTIVE },
    { userId: user2.id, plan: 'free', status: SubscriptionStatus.ACTIVE },
    { userId: author.id, plan: 'premium', status: SubscriptionStatus.ACTIVE }
  ]

  for (const sub of subscriptions) {
    await prisma.subscription.create({
      data: {
        userId: sub.userId,
        plan: sub.plan,
        status: sub.status,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        autoRenew: true
      }
    })
  }

  console.log('✅ Abonnements créés')

  // 8. Créer des avis
  console.log('⭐ Création des avis...')

  const reviews = [
    { userId: user1.id, bookId: createdBooks[0].id, rating: 5, comment: 'Excellent livre ! Une histoire captivante.' },
    { userId: user2.id, bookId: createdBooks[0].id, rating: 4, comment: 'Très bon roman, je recommande.' },
    { userId: user1.id, bookId: createdBooks[1].id, rating: 5, comment: 'Des poèmes magnifiques.' },
    { userId: user2.id, bookId: createdBooks[2].id, rating: 3, comment: 'Intéressant mais un peu long.' },
    { userId: user1.id, bookId: createdBooks[3].id, rating: 5, comment: 'Mes enfants ont adoré ces contes !' },
    { userId: user2.id, bookId: createdBooks[4].id, rating: 4, comment: 'Très bon cours, bien structuré.' },
    { userId: user1.id, bookId: createdBooks[5].id, rating: 4, comment: 'Une réflexion profonde sur la philosophie africaine.' },
    { userId: user2.id, bookId: createdBooks[6].id, rating: 5, comment: 'Magnifique recueil de poésie.' }
  ]

  for (const review of reviews) {
    await prisma.review.create({
      data: review
    })
  }

  console.log('✅ Avis créés')

  // 9. Créer des favoris
  console.log('❤️ Création des favoris...')

  const favorites = [
    { userId: user1.id, bookId: createdBooks[0].id },
    { userId: user1.id, bookId: createdBooks[3].id },
    { userId: user2.id, bookId: createdBooks[1].id },
    { userId: user2.id, bookId: createdBooks[5].id },
    { userId: user1.id, bookId: createdBooks[7].id }
  ]

  for (const fav of favorites) {
    await prisma.favorite.create({
      data: fav
    })
  }

  console.log('✅ Favoris créés')

  // 10. Créer des bibliothèques
  console.log('📚 Création des bibliothèques...')

  const libraries = [
    { userId: user1.id, bookId: createdBooks[0].id, status: 'reading' },
    { userId: user1.id, bookId: createdBooks[2].id, status: 'completed' },
    { userId: user1.id, bookId: createdBooks[5].id, status: 'want_to_read' },
    { userId: user2.id, bookId: createdBooks[1].id, status: 'reading' },
    { userId: user2.id, bookId: createdBooks[3].id, status: 'completed' },
    { userId: user2.id, bookId: createdBooks[4].id, status: 'reading' }
  ]

  for (const lib of libraries) {
    await prisma.library.create({
      data: lib
    })
  }

  console.log('✅ Bibliothèques créées')

  // 11. Créer des progressions de lecture
  console.log('📖 Création des progressions de lecture...')

  const readingProgress = [
    { userId: user1.id, bookId: createdBooks[0].id, currentPage: 150, percentage: 47 },
    { userId: user1.id, bookId: createdBooks[2].id, currentPage: 250, percentage: 100 },
    { userId: user2.id, bookId: createdBooks[1].id, currentPage: 80, percentage: 44 },
    { userId: user2.id, bookId: createdBooks[4].id, currentPage: 200, percentage: 44 }
  ]

  for (const progress of readingProgress) {
    await prisma.readingProgress.create({
      data: progress
    })
  }

  console.log('✅ Progressions de lecture créées')

  // 12. Créer des progressions d'écoute
  console.log('🎵 Création des progressions d\'écoute...')

  const listeningProgress = [
    { userId: user1.id, bookId: createdBooks[3].id, position: 1200, percentage: 33 },
    { userId: user2.id, bookId: createdBooks[8].id, position: 2400, percentage: 44 }
  ]

  for (const progress of listeningProgress) {
    await prisma.listeningProgress.create({
      data: progress
    })
  }

  console.log('✅ Progressions d\'écoute créées')

  // 13. Créer des notifications
  console.log('🔔 Création des notifications...')

  const notifications = [
    { userId: user1.id, type: 'welcome', title: 'Bienvenue sur AppBook !', message: 'Découvrez notre bibliothèque de livres et livres audio.' },
    { userId: user1.id, type: 'book_published', title: 'Nouveau livre', message: 'Un nouveau livre de votre auteur préféré est disponible.' },
    { userId: user2.id, type: 'welcome', title: 'Bienvenue sur AppBook !', message: 'Découvrez notre bibliothèque de livres et livres audio.' }
  ]

  for (const notif of notifications) {
    await prisma.notification.create({
      data: notif
    })
  }

  console.log('✅ Notifications créées')

  // 14. Créer des logs d'activité
  console.log('📋 Création des logs d\'activité...')

  const activities = [
    { userId: admin.id, action: 'user_login', details: { ip: '127.0.0.1' } },
    { userId: author.id, action: 'book_published', details: { bookId: createdBooks[0].id } },
    { userId: user1.id, action: 'book_read', details: { bookId: createdBooks[0].id } },
    { userId: user2.id, action: 'review_added', details: { bookId: createdBooks[0].id } },
    { userId: admin.id, action: 'user_created', details: { userId: user1.id } }
  ]

  for (const activity of activities) {
    await prisma.activityLog.create({
      data: activity
    })
  }

  console.log('✅ Logs d\'activité créés')

  console.log('🎉 Seeding terminé avec succès !')
  console.log('📊 Résumé :')
  console.log(`   - ${await prisma.user.count()} utilisateurs`)
  console.log(`   - ${await prisma.author.count()} auteurs`)
  console.log(`   - ${await prisma.book.count()} livres`)
  console.log(`   - ${await prisma.category.count()} catégories`)
  console.log(`   - ${await prisma.tag.count()} tags`)
  console.log(`   - ${await prisma.review.count()} avis`)
  console.log(`   - ${await prisma.subscription.count()} abonnements`)
  console.log(`   - ${await prisma.favorite.count()} favoris`)
  console.log(`   - ${await prisma.library.count()} bibliothèques`)
  console.log(`   - ${await prisma.notification.count()} notifications`)
  console.log('')
  console.log('🔑 Identifiants de connexion :')
  console.log('   Admin  : admin@appbook.com / admin123')
  console.log('   Auteur : author@appbook.com / author123')
  console.log('   User 1 : user1@appbook.com / user123')
  console.log('   User 2 : user2@appbook.com / user123')
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })