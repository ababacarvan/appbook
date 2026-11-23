import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'
import { z } from 'zod'

const progressSchema = z.object({
  bookId: z.string(),
  position: z.number(),
  percentage: z.number().min(0).max(100),
  chapterId: z.string().optional().nullable() // Permettre null
})

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
    const { bookId, position, percentage, chapterId } = progressSchema.parse(body)

    const progress = await prisma.listeningProgress.upsert({
      where: {
        userId_bookId: {
          userId: user.id,
          bookId
        }
      },
      update: {
        position,
        percentage,
        chapterId: chapterId || null,
        lastListenedAt: new Date()
      },
      create: {
        userId: user.id,
        bookId,
        position,
        percentage,
        chapterId: chapterId || null
      }
    })

    return NextResponse.json({ progress })
  } catch (error) {
    console.error('Save listening progress error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to save progress' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
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

    const progress = await prisma.listeningProgress.findUnique({
      where: {
        userId_bookId: {
          userId: user.id,
          bookId
        }
      }
    })

    if (!progress) {
      return NextResponse.json(
        { error: 'Progress not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ progress })
  } catch (error) {
    console.error('Get listening progress error:', error)
    return NextResponse.json(
      { error: 'Failed to get progress' },
      { status: 500 }
    )
  }
}