import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'
import { z } from 'zod'

const progressSchema = z.object({
  bookId: z.string(),
  currentPage: z.number(),
  percentage: z.number().min(0).max(100)
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
    const { bookId, currentPage, percentage } = progressSchema.parse(body)

    const progress = await prisma.readingProgress.upsert({
      where: {
        userId_bookId: {
          userId: user.id,
          bookId
        }
      },
      update: {
        currentPage,
        percentage,
        lastReadAt: new Date()
      },
      create: {
        userId: user.id,
        bookId,
        currentPage,
        percentage
      }
    })

    return NextResponse.json({ progress })
  } catch (error) {
    console.error('Save reading progress error:', error)
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

    const progress = await prisma.readingProgress.findUnique({
      where: {
        userId_bookId: {
          userId: user.id,
          bookId
        }
      }
    })

    return NextResponse.json({ progress })
  } catch (error) {
    console.error('Get reading progress error:', error)
    return NextResponse.json(
      { error: 'Failed to get progress' },
      { status: 500 }
    )
  }
}