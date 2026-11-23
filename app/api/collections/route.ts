import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'
import { z } from 'zod'

const collectionSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  isPublic: z.boolean().default(true),
  bookIds: z.array(z.string()).optional()
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

    const collections = await prisma.collection.findMany({
      where: {
        OR: [
          { userId: user.id },
          { isPublic: true }
        ]
      },
      include: {
        books: {
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
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ collections })
  } catch (error) {
    console.error('Get collections error:', error)
    return NextResponse.json(
      { error: 'Failed to get collections' },
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
    const { name, description, isPublic, bookIds } = collectionSchema.parse(body)

    const collection = await prisma.collection.create({
      data: {
        name,
        description,
        isPublic,
        userId: user.id,
        books: bookIds ? {
          create: bookIds.map(bookId => ({
            bookId
          }))
        } : undefined
      },
      include: {
        books: {
          include: {
            book: true
          }
        }
      }
    })

    return NextResponse.json({ collection })
  } catch (error) {
    console.error('Create collection error:', error)
    return NextResponse.json(
      { error: 'Failed to create collection' },
      { status: 500 }
    )
  }
}