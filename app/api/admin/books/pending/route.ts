import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  try {
    await requireAuth('ADMIN')

    const books = await prisma.book.findMany({
      where: { status: 'PENDING_REVIEW' },
      include: {
        author: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        categories: {
          include: {
            category: true
          }
        }
      },
      orderBy: { createdAt: 'asc' },
      take: 20
    })

    // Format the response
    const formattedBooks = books.map(book => ({
      ...book,
      author: {
        id: book.author?.id,
        name: book.author?.user?.name || 'Inconnu',
        email: book.author?.user?.email
      }
    }))

    return NextResponse.json({ books: formattedBooks })
  } catch (error) {
    console.error('Get pending books error:', error)
    return NextResponse.json(
      { error: 'Failed to get pending books' },
      { status: 500 }
    )
  }
}