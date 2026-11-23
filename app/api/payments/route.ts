import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'
import { z } from 'zod'

const paymentSchema = z.object({
  bookId: z.string(),
  amount: z.number(),
  method: z.string(),
  status: z.enum(['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED', 'CANCELLED'])
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
    const { bookId, amount, method, status } = paymentSchema.parse(body)

    // Vérifier que le livre existe
    const book = await prisma.book.findUnique({
      where: { id: bookId }
    })

    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      )
    }

    // Créer le paiement
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        amount,
        currency: 'XOF',
        method,
        status,
        transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        metadata: {
          bookId,
          bookTitle: book.title,
          userEmail: user.email
        }
      }
    })

    // Si le paiement est réussi, ajouter le livre à la bibliothèque
    if (status === 'SUCCESS') {
      await prisma.library.create({
        data: {
          userId: user.id,
          bookId,
          status: 'reading'
        }
      })

      // Incrémenter les téléchargements
      await prisma.book.update({
        where: { id: bookId },
        data: { downloads: { increment: 1 } }
      })
    }

    return NextResponse.json({
      success: true,
      payment
    })
  } catch (error) {
    console.error('Payment error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Payment failed' },
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

    const payments = await prisma.payment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ payments })
  } catch (error) {
    console.error('Get payments error:', error)
    return NextResponse.json(
      { error: 'Failed to get payments' },
      { status: 500 }
    )
  }
}