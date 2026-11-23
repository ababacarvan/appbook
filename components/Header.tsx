"use client"

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from './ui/button'
import { Input } from './ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { 
  Search, 
  Menu, 
  BookOpen, 
  Headphones, 
  Plus, 
  User, 
  LogOut, 
  Settings,
  X,
  Loader2,
  CreditCard,
  Home,
  Library,
  Users,
  FolderOpen,
  ChevronRight,
  History,
  Star
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface SearchResult {
  id: string
  title: string
  type: string
  coverImage?: string
  author?: {
    name: string
  }
}

export function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getUser()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false)
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchBooks()
      } else {
        setSearchResults([])
        setShowSearchResults(false)
      }
    }, 300)

    return () => clearTimeout(delayDebounce)
  }, [searchQuery])

  const getUser = async () => {
    try {
      const response = await fetch('/api/auth/user')
      const data = await response.json()
      setUser(data.user)
    } catch (error) {
      console.error('Failed to get user:', error)
    } finally {
      setLoading(false)
    }
  }

  const searchBooks = async () => {
    setSearchLoading(true)
    try {
      const response = await fetch(`/api/books?search=${encodeURIComponent(searchQuery)}&limit=5`)
      const data = await response.json()
      setSearchResults(data.books || [])
      setShowSearchResults(true)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setSearchLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/books?search=${encodeURIComponent(searchQuery)}`)
      setShowSearchResults(false)
      setSearchQuery('')
    }
  }

  const handleResultClick = (id: string) => {
    router.push(`/books/${id}`)
    setShowSearchResults(false)
    setSearchQuery('')
  }

  const handleClear = () => {
    setSearchQuery('')
    setSearchResults([])
    setShowSearchResults(false)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    
    toast({
      title: 'Déconnexion réussie',
      description: 'À bientôt sur AppBook !'
    })
    
    router.push('/')
    router.refresh()
    setMobileMenuOpen(false)
  }

  const navLinks = [
    { href: '/', label: 'Accueil', icon: Home },
    { href: '/books', label: 'Bibliothèque', icon: Library },
    { href: '/authors', label: 'Auteurs', icon: Users },
    { href: '/categories', label: 'Catégories', icon: FolderOpen },
    { href: '/pricing', label: 'Abonnements', icon: CreditCard },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl hidden sm:inline">AppBook</span>
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center gap-6 text-sm">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "hover:text-primary transition-colors",
                    isActive && "text-primary font-medium"
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Search Bar */}
          <div ref={searchRef} className="hidden lg:block relative">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher des livres, auteurs..."
                className="pl-9 pr-20 w-80"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-16 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <Button
                type="submit"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8"
                disabled={!searchQuery.trim()}
              >
                {searchLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Rechercher'}
              </Button>
            </form>

            {/* Search Results Dropdown */}
            {showSearchResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50 overflow-hidden">
                {searchLoading ? (
                  <div className="p-4 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </div>
                ) : searchResults.length > 0 ? (
                  <>
                    <div className="max-h-80 overflow-y-auto">
                      {searchResults.map((result) => (
                        <button
                          key={result.id}
                          onClick={() => handleResultClick(result.id)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left"
                        >
                          <div className="w-10 h-14 bg-muted rounded flex items-center justify-center flex-shrink-0">
                            {result.coverImage ? (
                              <img src={result.coverImage} alt={result.title} className="w-full h-full object-cover rounded" />
                            ) : (
                              <span className="text-xl">📖</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{result.title}</p>
                            <p className="text-sm text-muted-foreground truncate">
                              {result.author?.name || 'Auteur inconnu'} • {result.type}
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                    <div className="border-t p-2 bg-muted/50">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-center text-sm"
                        onClick={() => {
                          router.push(`/books?search=${encodeURIComponent(searchQuery)}`)
                          setShowSearchResults(false)
                          setSearchQuery('')
                        }}
                      >
                        Voir tous les résultats
                      </Button>
                    </div>
                  </>
                ) : searchQuery.length >= 2 && (
                  <div className="p-6 text-center text-muted-foreground">
                    Aucun résultat trouvé pour "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Search Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden"
            onClick={() => router.push('/books')}
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* User Menu */}
          {!loading && (
            <>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>
                          {user.name?.[0] || user.email?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name || 'Utilisateur'}</p>
                        <p className="text-xs leading-none text-muted-foreground truncate">
                          {user.email}
                        </p>
                        <span className="text-xs text-muted-foreground mt-1">
                          {user.role || 'USER'}
                        </span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    {/* Mes livres */}
                    <DropdownMenuItem onClick={() => router.push('/library')}>
                      <Library className="mr-2 h-4 w-4" />
                      Ma bibliothèque
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/favorites')}>
                      <Star className="mr-2 h-4 w-4" />
                      Favoris
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    {/* Mes paiements */}
                    <DropdownMenuItem onClick={() => router.push('/payments')}>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Mes paiements
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      Profil
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    {/* Auteur */}
                    {user.role === 'AUTHOR' && (
                      <>
                        <DropdownMenuItem onClick={() => router.push('/dashboard/author')}>
                          <Plus className="mr-2 h-4 w-4" />
                          Tableau de bord auteur
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push('/publish')}>
                          <Plus className="mr-2 h-4 w-4" />
                          Publier un livre
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    
                    {/* Admin */}
                    {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                      <>
                        <DropdownMenuItem onClick={() => router.push('/admin/dashboard')}>
                          <Settings className="mr-2 h-4 w-4" />
                          Administration
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Déconnexion
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm">Connexion</Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm">Inscription</Button>
                  </Link>
                </div>
              )}
            </>
          )}

          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div 
          ref={mobileMenuRef}
          className="md:hidden fixed inset-0 z-50 bg-background/95 backdrop-blur animate-in slide-in-from-top"
        >
          <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-6">
              <span className="font-bold text-lg">Menu</span>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <nav className="space-y-4">
              {navLinks.map((link) => {
                const Icon = link.icon
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors",
                      isActive && "bg-muted font-medium"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                )
              })}
            </nav>

            {user && (
              <>
                <div className="border-t my-6 pt-6">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name?.[0] || user.email?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name || 'Utilisateur'}</p>
                      <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      router.push('/library')
                      setMobileMenuOpen(false)
                    }}
                    className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <Library className="h-5 w-5" />
                    Ma bibliothèque
                  </button>
                  <button
                    onClick={() => {
                      router.push('/favorites')
                      setMobileMenuOpen(false)
                    }}
                    className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <Star className="h-5 w-5" />
                    Favoris
                  </button>
                  <button
                    onClick={() => {
                      router.push('/payments')
                      setMobileMenuOpen(false)
                    }}
                    className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <CreditCard className="h-5 w-5" />
                    Mes paiements
                  </button>
                  <button
                    onClick={() => {
                      router.push('/profile')
                      setMobileMenuOpen(false)
                    }}
                    className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <User className="h-5 w-5" />
                    Profil
                  </button>
                  
                  {user.role === 'AUTHOR' && (
                    <>
                      <button
                        onClick={() => {
                          router.push('/dashboard/author')
                          setMobileMenuOpen(false)
                        }}
                        className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-muted transition-colors"
                      >
                        <Plus className="h-5 w-5" />
                        Tableau de bord auteur
                      </button>
                      <button
                        onClick={() => {
                          router.push('/publish')
                          setMobileMenuOpen(false)
                        }}
                        className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-muted transition-colors"
                      >
                        <Plus className="h-5 w-5" />
                        Publier un livre
                      </button>
                    </>
                  )}
                  
                  {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                    <button
                      onClick={() => {
                        router.push('/admin/dashboard')
                        setMobileMenuOpen(false)
                      }}
                      className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Settings className="h-5 w-5" />
                      Administration
                    </button>
                  )}
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-destructive/10 transition-colors text-destructive"
                  >
                    <LogOut className="h-5 w-5" />
                    Déconnexion
                  </button>
                </div>
              </>
            )}

            {!user && (
              <div className="border-t mt-6 pt-6 space-y-3">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">Connexion</Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Inscription</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}