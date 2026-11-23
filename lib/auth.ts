import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { UserRole } from '@prisma/client'

export async function getSession() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getUser() {
  const session = await getSession()
  if (!session?.user) return null
  
  // Récupérer l'utilisateur depuis la base de données avec Prisma
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: {
      author: true,
      subscriptions: {
        where: {
          status: {
            in: ['ACTIVE', 'TRIAL']
          }
        }
      }
    }
  })
  
  return user
}

export async function requireAuth(requiredRole?: UserRole | 'ADMIN' | 'SUPER_ADMIN') {
  const user = await getUser()
  
  if (!user) {
    throw new Error('Unauthorized - User not found')
  }
  
  // Si un rôle est requis, vérifier que l'utilisateur a ce rôle
  if (requiredRole) {
    const userRole = user.role as string
    
    // Si le rôle requis est ADMIN ou SUPER_ADMIN
    if (requiredRole === 'ADMIN' || requiredRole === 'SUPER_ADMIN') {
      if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
        throw new Error('Insufficient permissions - Admin required')
      }
    }
    // Si le rôle requis est AUTHOR
    else if (requiredRole === 'AUTHOR') {
      if (userRole !== 'AUTHOR' && userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
        throw new Error('Insufficient permissions - Author required')
      }
    }
    // Vérification exacte du rôle
    else if (userRole !== requiredRole) {
      throw new Error(`Insufficient permissions - ${requiredRole} required`)
    }
  }
  
  return user
}

export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import('bcryptjs')
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const bcrypt = await import('bcryptjs')
  return bcrypt.compare(password, hash)
}