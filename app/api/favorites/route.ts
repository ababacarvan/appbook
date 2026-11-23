import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'
import { z } from 'zod'

const favoriteSchema = z.object({
  bookId: z.string()
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

    const favorites = await prisma.favorite.findMany({
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
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ favorites })
  } catch (error) {
    console.error('Get favorites error:', error)
    return NextResponse.json(
      { error: 'Failed to get favorites' },
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
    const { bookId } = favoriteSchema.parse(body)

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

    // Check if already favorited
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_bookId: {
          userId: user.id,
          bookId
        }
      }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Already favorited' },
        { status: 400 }
      )
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId: user.id,
        bookId
      }
    })

    return NextResponse.json({ favorite })
  } catch (error) {
    console.error('Add favorite error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to add favorite' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const bookId = searchParams.get('bookId')

    if (!bookId) {
      return NextResponse.json(
        { error: 'Book ID required' },
        { status: 400 }
      )
    }

    await prisma.favorite.delete({
      where: {
        userId_bookId: {
          userId: user.id,
          bookId
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Remove favorite error:', error)
    return NextResponse.json(
      { error: 'Failed to remove favorite' },
      { status: 500 }
    )
  }
}