import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: (name, value, options) => {
          req.cookies.set(name, value)
          res.cookies.set(name, value, options)
        },
        remove: (name, options) => {
          req.cookies.delete(name)
          res.cookies.delete(name, options)
        },
      },
    }
  )
  
  const { data: { session } } = await supabase.auth.getSession()
  const url = req.nextUrl.pathname
  
  // 🔥 EXEMPTER les routes admin/login et admin de la protection
  // pour éviter les boucles de redirection
  if (url === '/admin/login' || url === '/admin') {
    // Si déjà connecté, rediriger vers dashboard
    if (session) {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: dbUser } = await supabase
            .from('users')
            .select('role')
            .eq('email', user.email)
            .single()
          
          if (dbUser && (dbUser.role === 'ADMIN' || dbUser.role === 'SUPER_ADMIN')) {
            return NextResponse.redirect(new URL('/admin/dashboard', req.url))
          }
        }
      } catch (error) {
        // Si erreur, rester sur la page de login
      }
    }
    // Si pas de session ou pas admin, laisser passer
    return res
  }
  
  // Routes publiques (ne nécessitent pas d'authentification)
  const publicRoutes = ['/login', '/register', '/', '/books', '/authors', '/categories', '/pricing']
  const isPublicRoute = publicRoutes.some(route => url === route || url.startsWith(route + '/'))
  
  // Routes protégées (nécessitent une authentification)
  const protectedRoutes = ['/dashboard', '/library', '/favorites', '/collections', '/profile', '/publish']
  const isProtectedRoute = protectedRoutes.some(route => url === route || url.startsWith(route + '/'))
  
  // Routes admin (nécessitent un rôle ADMIN ou SUPER_ADMIN)
  const adminRoutes = ['/admin/dashboard', '/admin/users', '/admin/books', '/admin/reviews', '/admin/subscriptions', '/admin/settings']
  const isAdminRoute = adminRoutes.some(route => url === route || url.startsWith(route + '/'))
  
  // Routes author (nécessitent un rôle AUTHOR, ADMIN ou SUPER_ADMIN)
  const authorRoutes = ['/dashboard/author']
  const isAuthorRoute = authorRoutes.some(route => url === route || url.startsWith(route + '/'))
  
  // Rediriger vers login si route protégée sans session
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  
  // Rediriger vers home si page auth avec session
  if ((url === '/login' || url === '/register') && session) {
    return NextResponse.redirect(new URL('/', req.url))
  }
  
  // Vérification des routes admin
  if (isAdminRoute) {
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return NextResponse.redirect(new URL('/admin/login', req.url))
      }
      
      const { data: dbUser, error } = await supabase
        .from('users')
        .select('role')
        .eq('email', user.email)
        .single()
      
      if (error || !dbUser) {
        return NextResponse.redirect(new URL('/admin/login', req.url))
      }
      
      const userRole = dbUser.role || 'USER'
      
      if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
        return NextResponse.redirect(new URL('/', req.url))
      }
    } catch (error) {
      console.error('Admin check error:', error)
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }
  
  // Vérification des routes author
  if (isAuthorRoute) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return NextResponse.redirect(new URL('/login', req.url))
      }
      
      const { data: dbUser, error } = await supabase
        .from('users')
        .select('role')
        .eq('email', user.email)
        .single()
      
      if (error || !dbUser) {
        return NextResponse.redirect(new URL('/login', req.url))
      }
      
      const userRole = dbUser.role || 'USER'
      
      if (userRole !== 'AUTHOR' && userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
        return NextResponse.redirect(new URL('/', req.url))
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }
  
  return res
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|public|.*\\..*).*)'
  ]
}