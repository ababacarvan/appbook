import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = loginSchema.parse(body)

    console.log('Tentative de connexion admin:', email)

    // 1. Vérifier si l'utilisateur existe dans la base de données
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      console.log('Utilisateur non trouvé:', email)
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    console.log('Utilisateur trouvé:', user.email, 'Rôle:', user.role)

    // 2. Vérifier que l'utilisateur est admin
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      console.log('Utilisateur non admin:', user.role)
      return NextResponse.json(
        { error: 'Access denied. Admin only.' },
        { status: 403 }
      )
    }

    // 3. Vérifier le mot de passe
    if (!user.password) {
      console.log('Mot de passe non défini pour:', email)
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      console.log('Mot de passe invalide pour:', email)
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    console.log('Mot de passe valide pour:', email)

    // 4. Connecter avec Supabase
    const supabase = createClient()
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError) {
      console.log('Erreur Supabase auth:', authError.message)
      return NextResponse.json(
        { error: authError.message },
        { status: 401 }
      )
    }

    console.log('Connexion Supabase réussie pour:', email)

    // 5. Retourner la réponse
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar
      }
    })
  } catch (error) {
    console.error('Admin login error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}