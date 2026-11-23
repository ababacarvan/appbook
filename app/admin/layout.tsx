"use client"

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Star,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  DollarSign,
  Bell,
  Home,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

const navItems = [
  { icon: LayoutDashboard, label: 'Tableau de bord', href: '/admin/dashboard' },
  { icon: Users, label: 'Utilisateurs', href: '/admin/users' },
  { icon: BookOpen, label: 'Livres', href: '/admin/books' },
  { icon: Star, label: 'Avis', href: '/admin/reviews' },
  { icon: DollarSign, label: 'Abonnements', href: '/admin/subscriptions' },
  { icon: Settings, label: 'Paramètres', href: '/admin/settings' },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  // Ne pas exécuter sur la page de login
  const isLoginPage = pathname === '/admin/login' || pathname === '/admin'

  useEffect(() => {
    // Si on est sur la page de login, ne pas vérifier l'auth
    if (isLoginPage) {
      setLoading(false)
      return
    }
    
    checkAuth()
  }, [pathname])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/user')
      const data = await response.json()
      
      if (!data.user) {
        router.push('/admin/login')
        return
      }
      
      // Vérifier si l'utilisateur est admin
      if (data.user.role !== 'ADMIN' && data.user.role !== 'SUPER_ADMIN') {
        toast({
          title: 'Accès refusé',
          description: 'Vous n\'avez pas les droits d\'administration',
          variant: 'destructive'
        })
        router.push('/')
        return
      }
      
      setUser(data.user)
      setIsAdmin(true)
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/admin/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast({
      title: 'Déconnexion réussie',
      description: 'À bientôt !'
    })
    router.push('/admin/login')
  }

  // Si on est sur la page de login, ne pas afficher le layout
  if (isLoginPage) {
    return <>{children}</>
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user || !isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-background border-r transition-transform duration-300",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">Admin AppBook</span>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    className={cn(
                      "w-full justify-start",
                      isActive && "bg-primary text-primary-foreground"
                    )}
                  >
                    <Icon className="mr-3 h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t space-y-2">
            <Button variant="ghost" className="w-full justify-start" onClick={() => router.push('/')}>
              <Home className="mr-3 h-4 w-4" />
              Retour au site
            </Button>
            <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleLogout}>
              <LogOut className="mr-3 h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={cn(
        "transition-all duration-300",
        sidebarOpen ? "ml-64" : "ml-0"
      )}>
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background border-b">
          <div className="flex items-center justify-between px-4 h-16">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              <span className="text-sm text-muted-foreground hidden md:inline">
                Administration
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>{user?.name?.[0] || 'A'}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden md:inline">{user?.name}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4">
          {children}
        </main>
      </div>
    </div>
  )
}