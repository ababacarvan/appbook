import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  try {
    await requireAuth('ADMIN')

    const books = await prisma.book.findMany({
      select: {
        id: true,
        title: true,
        coverImage: true,
        type: true,
        status: true,
        views: true,
        downloads: true,
        createdAt: true,
        author: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    const formattedBooks = books.map(book => ({
      ...book,
      author: {
        name: book.author?.user?.name || 'Inconnu'
      }
    }))

    return NextResponse.json({ books: formattedBooks })
  } catch (error) {
    console.error('Get recent books error:', error)
    return NextResponse.json(
      { error: 'Failed to get books' },
      { status: 500 }
    )
  }
}