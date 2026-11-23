import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  try {
    await requireAuth('ADMIN')

    const activities = await prisma.activityLog.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    // Format the response
    const formattedActivities = activities.map(activity => ({
      id: activity.id,
      type: activity.action.split('_')[0] || 'action',
      message: activity.action,
      user: activity.user,
      time: new Date(activity.createdAt).toLocaleString('fr-FR'),
      createdAt: activity.createdAt
    }))

    return NextResponse.json({ activity: formattedActivities })
  } catch (error) {
    console.error('Get recent activity error:', error)
    return NextResponse.json(
      { error: 'Failed to get activity' },
      { status: 500 }
    )
  }
}