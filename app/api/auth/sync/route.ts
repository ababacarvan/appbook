import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function POST() {
  try {
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Récupérer tous les utilisateurs de la base
    const users = await prisma.user.findMany()

    let created = 0
    let failed = 0

    for (const user of users) {
      try {
        // Vérifier si l'utilisateur existe déjà dans Supabase
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
        const exists = existingUsers?.users?.some(u => u.email === user.email)

        if (!exists && user.password) {
          // Créer l'utilisateur dans Supabase Auth
          const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email: user.email,
            password: user.password,
            email_confirm: true,
            user_metadata: {
              name: user.name,
              role: user.role
            }
          })

          if (error) {
            console.error(`Erreur pour ${user.email}:`, error.message)
            failed++
          } else {
            console.log(`✅ Utilisateur créé dans Supabase: ${user.email}`)
            created++
          }
        } else {
          console.log(`ℹ️ Utilisateur déjà existant: ${user.email}`)
        }
      } catch (error) {
        console.error(`Erreur pour ${user.email}:`, error)
        failed++
      }
    }

    return NextResponse.json({
      success: true,
      message: `${created} utilisateurs créés, ${failed} échecs`,
      created,
      failed
    })
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json(
      { error: 'Failed to sync users' },
      { status: 500 }
    )
  }
}