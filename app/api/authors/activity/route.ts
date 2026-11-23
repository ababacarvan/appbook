import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Trouver le profil auteur
    const author = await prisma.author.findUnique({
      where: { userId: user.id },
      include: {
        books: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })

    if (!author) {
      return NextResponse.json({ error: 'Author profile not found' }, { status: 404 })
    }

    // Récupérer les activités récentes (simulation avec les données existantes)
    const activities = []

    // Récupérer les avis récents sur les livres de l'auteur
    const recentReviews = await prisma.review.findMany({
      where: {
        bookId: {
          in: author.books.map(b => b.id)
        }
      },
      include: {
        user: {
          select: {
            name: true,
            avatar: true
          }
        },
        book: {
          select: {
            title: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    // Ajouter les avis comme activités
    for (const review of recentReviews) {
      activities.push({
        id: `review-${review.id}`,
        type: 'review',
        message: `Nouvel avis sur "${review.book.title}" - ${review.rating} étoiles`,
        time: new Date(review.createdAt).toLocaleString('fr-FR'),
        user: review.user || { name: 'Anonyme' }
      })
    }

    // Si pas d'activités, ajouter des activités simulées
    if (activities.length === 0) {
      const bookTitles = author.books.map(b => b.title)
      const demoActivities = [
        {
          id: 'demo-1',
          type: 'read',
          message: `Quelqu'un a lu votre livre "${bookTitles[0] || 'Un livre'}"`,
          time: 'Il y a 2 heures',
          user: { name: 'Utilisateur' }
        },
        {
          id: 'demo-2',
          type: 'download',
          message: `Téléchargement de votre livre "${bookTitles[1] || bookTitles[0] || 'Un livre'}"`,
          time: 'Il y a 5 heures',
          user: { name: 'Jean' }
        }
      ]
      activities.push(...demoActivities)
    }

    return NextResponse.json({ activity: activities })
  } catch (error) {
    console.error('Error fetching activity:', error)
    return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 })
  }
}