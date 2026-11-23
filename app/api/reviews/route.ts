import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const reviews = await prisma.review.findMany({
      where: { userId: user.id },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            coverImage: true,
            type: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ reviews })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { bookId, rating, comment } = body

    if (!bookId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    const review = await prisma.review.create({
      data: {
        userId: user.id,
        bookId,
        rating,
        comment
      }
    })

    return NextResponse.json({ review })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }
}