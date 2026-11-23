import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'
import { z } from 'zod'

const librarySchema = z.object({
  bookId: z.string(),
  status: z.enum(['reading', 'completed', 'want_to_read']).optional()
})

export async function GET(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const libraries = await prisma.library.findMany({
      where: { userId: user.id },
      include: {
        book: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            },
            reviews: {
              select: {
                rating: true
              }
            }
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json({ libraries })
  } catch (error) {
    console.error('Get library error:', error)
    return NextResponse.json(
      { error: 'Failed to get library' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { bookId, status = 'reading' } = librarySchema.parse(body)

    // Check if book exists
    const book = await prisma.book.findUnique({
      where: { id: bookId }
    })

    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      )
    }

    // Check if already in library
    const existing = await prisma.library.findUnique({
      where: {
        userId_bookId: {
          userId: user.id,
          bookId
        }
      }
    })

    if (existing) {
      // Update status
      const updated = await prisma.library.update({
        where: { id: existing.id },
        data: { status }
      })
      return NextResponse.json({ library: updated })
    }

    // Add to library
    const library = await prisma.library.create({
      data: {
        userId: user.id,
        bookId,
        status
      }
    })

    return NextResponse.json({ library })
  } catch (error) {
    console.error('Add to library error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to add to library' },
      { status: 500 }
    )
  }
}