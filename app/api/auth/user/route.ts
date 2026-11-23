import { NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getUser()
    
    if (!user) {
      return NextResponse.json({ user: null })
    }
    
    // Don't send password
    const { password, ...userWithoutPassword } = user
    
    return NextResponse.json({
      user: userWithoutPassword
    })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Failed to get user' },
      { status: 500 }
    )
  }
}