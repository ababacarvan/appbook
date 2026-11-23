import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        books: {
          include: {
            book: {
              select: {
                id: true,
                title: true
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Formater les données pour inclure le nombre de livres
    const formattedCategories = categories.map(category => ({
      ...category,
      bookCount: category.books.length
    }))

    return NextResponse.json({ 
      categories: formattedCategories,
      total: formattedCategories.length
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error)
    return NextResponse.json(
      { error: 'Impossible de charger les catégories' },
      { status: 500 }
    )
  }
}