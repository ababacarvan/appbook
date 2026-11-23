import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const author = await prisma.author.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            bio: true
          }
        },
        books: {
          include: {
            reviews: {
              select: {
                rating: true
              }
            },
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
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!author) {
      return NextResponse.json(
        { error: 'Auteur non trouvé' },
        { status: 404 }
      )
    }

    // Calculer les statistiques
    const publishedBooks = author.books.filter(book => book.status === 'PUBLISHED')
    const totalViews = author.books.reduce((sum, book) => sum + (book.views || 0), 0)
    const totalDownloads = author.books.reduce((sum, book) => sum + (book.downloads || 0), 0)

    // Formater les livres avec leurs notes moyennes
    const formattedBooks = author.books.map(book => {
      const ratings = book.reviews.map(r => r.rating)
      const avgRating = ratings.length > 0
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : 0

      return {
        ...book,
        averageRating: avgRating,
        reviewsCount: book.reviews.length,
        reviews: undefined
      }
    })

    const formattedAuthor = {
      ...author,
      books: formattedBooks,
      bookCount: author.books.length,
      publishedBooks: publishedBooks.length,
      totalViews,
      totalDownloads
    }

    return NextResponse.json({ author: formattedAuthor })
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'auteur:', error)
    return NextResponse.json(
      { error: 'Impossible de charger l\'auteur' },
      { status: 500 }
    )
  }
}