import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Vérifier si l'utilisateur a un profil auteur
    const author = await prisma.author.findUnique({
      where: { userId: user.id },
      include: {
        books: {
          include: {
            reviews: true
          }
        }
      }
    })

    if (!author) {
      return NextResponse.json({ error: 'Author profile not found' }, { status: 404 })
    }

    const publishedBooks = author.books.filter(b => b.status === 'PUBLISHED')
    const totalViews = author.books.reduce((sum, b) => sum + (b.views || 0), 0)
    const totalDownloads = author.books.reduce((sum, b) => sum + (b.downloads || 0), 0)
    
    // Calculer la note moyenne
    const allRatings = author.books.flatMap(b => b.reviews.map(r => r.rating))
    const avgRating = allRatings.length > 0 
      ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length 
      : 0

    // Compter les lecteurs uniques (simulation)
    const totalReaders = author.books.reduce((sum, b) => sum + (b.views || 0) / 10, 0)

    return NextResponse.json({
      totalBooks: author.books.length,
      publishedBooks: publishedBooks.length,
      totalViews,
      totalListens: Math.floor(totalViews * 0.3), // Simulation
      totalDownloads,
      totalRevenue: publishedBooks.reduce((sum, b) => sum + (b.price || 0) * (b.downloads || 0) * 0.7, 0),
      averageRating: avgRating,
      totalReaders: Math.floor(totalReaders)
    })
  } catch (error) {
    console.error('Error fetching author stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}