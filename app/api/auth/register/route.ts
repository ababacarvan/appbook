import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(['USER', 'AUTHOR']).optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, role = 'USER' } = registerSchema.parse(body)
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password)
    
    // Create user in Supabase Auth
    const supabase = createClient()
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role
        }
      }
    })
    
    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }
    
    // Create user in database
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role as any,
        emailVerified: new Date()
      }
    })
    
    // If role is AUTHOR, create author profile
    if (role === 'AUTHOR') {
      await prisma.author.create({
        data: {
          userId: user.id,
          bio: '',
          isVerified: false
        }
      })
    }
    
    // Create free subscription
    await prisma.subscription.create({
      data: {
        userId: user.id,
        plan: 'free',
        status: 'ACTIVE'
      }
    })
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    )
  }
}