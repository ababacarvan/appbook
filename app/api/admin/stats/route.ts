import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  try {
    // Vérifier que l'utilisateur est admin
    await requireAuth('ADMIN')

    const [
      totalUsers,
      activeUsers,
      totalBooks,
      totalRevenue,
      totalSubscriptions,
      pendingBooks,
      totalAuthors,
      totalReviews
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.book.count({ where: { status: 'PUBLISHED' } }),
      prisma.payment.aggregate({
        where: { status: 'SUCCESS' },
        _sum: { amount: true }
      }),
      prisma.subscription.count({
        where: { status: { in: ['ACTIVE', 'TRIAL'] } }
      }),
      prisma.book.count({ where: { status: 'PENDING_REVIEW' } }),
      prisma.author.count(),
      prisma.review.count()
    ])

    return NextResponse.json({
      totalUsers,
      activeUsers,
      totalBooks,
      totalRevenue: totalRevenue._sum.amount || 0,
      totalSubscriptions,
      pendingBooks,
      totalAuthors,
      totalReviews
    })
  } catch (error) {
    console.error('Get stats error:', error)
    return NextResponse.json(
      { error: 'Failed to get stats' },
      { status: 500 }
    )
  }
}