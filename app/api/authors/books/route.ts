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
      where: { userId: user.id }
    })

    if (!author) {
      return NextResponse.json({ error: 'Author profile not found' }, { status: 404 })
    }

    // Récupérer tous les livres de l'auteur
    const books = await prisma.book.findMany({
      where: { authorId: author.id },
      include: {
        reviews: true,
        categories: {
          include: {
            category: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Formater les données
    const formattedBooks = books.map(book => {
      const ratings = book.reviews.map(r => r.rating)
      const avgRating = ratings.length > 0 
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
        : 0

      return {
        id: book.id,
        title: book.title,
        subtitle: book.subtitle,
        description: book.description,
        coverImage: book.coverImage,
        type: book.type,
        status: book.status,
        views: book.views,
        downloads: book.downloads,
        price: book.price,
        isFree: book.isFree,
        isPremium: book.isPremium,
        createdAt: book.createdAt,
        publishedAt: book.publishedAt,
        averageRating: avgRating,
        reviewsCount: book.reviews.length,
        categories: book.categories.map((bc: any) => ({
          id: bc.category.id,
          name: bc.category.name,
          slug: bc.category.slug,
          icon: bc.category.icon
        })),
        tags: book.tags.map((bt: any) => ({
          id: bt.tag.id,
          name: bt.tag.name,
          slug: bt.tag.slug
        }))
      }
    })

    return NextResponse.json({ books: formattedBooks })
  } catch (error) {
    console.error('Error fetching author books:', error)
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 })
  }
}