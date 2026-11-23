"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Search, Users, BookOpen, Loader2 } from 'lucide-react'

interface Author {
  id: string
  userId: string
  bio: string | null
  website: string | null
  socialLinks: any
  isVerified: boolean
  user: {
    id: string
    name: string
    email: string
    avatar: string | null
    bio: string | null
  }
  books: Array<{
    id: string
    title: string
    coverImage: string | null
    status: string
  }>
  bookCount: number
  publishedBooks: number
}

export default function AuthorsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [authors, setAuthors] = useState<Author[]>([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAuthors()
  }, [])

  const fetchAuthors = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/authors')
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des auteurs')
      }
      
      const data = await response.json()
      setAuthors(data.authors || [])
    } catch (error) {
      console.error('Failed to fetch authors:', error)
      setError('Impossible de charger les auteurs')
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les auteurs',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredAuthors = authors.filter((author) => {
    const searchLower = search.toLowerCase()
    return (
      author.user.name?.toLowerCase().includes(searchLower) ||
      author.bio?.toLowerCase().includes(searchLower) ||
      author.books.some(book => book.title.toLowerCase().includes(searchLower))
    )
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-2">Erreur</h2>
          <p className="text-muted-foreground">{error}</p>
          <button 
            onClick={fetchAuthors}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Auteurs</h1>
          <p className="text-muted-foreground">Découvrez les auteurs de la communauté</p>
          <p className="text-sm text-muted-foreground mt-1">
            {authors.length} auteur{authors.length > 1 ? 's' : ''} inscrit{authors.length > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{authors.length} auteurs</span>
        </div>
      </div>

      <div className="relative max-w-md mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un auteur..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {authors.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <Users className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">Aucun auteur</h3>
              <p className="text-muted-foreground">
                Aucun auteur n'est encore inscrit sur la plateforme
              </p>
            </div>
          </div>
        </Card>
      ) : filteredAuthors.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <Search className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">Aucun résultat</h3>
              <p className="text-muted-foreground">
                Aucun auteur ne correspond à votre recherche
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAuthors.map((author) => (
            <Link key={author.id} href={`/authors/${author.id}`}>
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={author.user.avatar || undefined} />
                      <AvatarFallback className="text-2xl">
                        {author.user.name?.[0] || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">
                        {author.user.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="secondary" className="text-xs">
                          {author.publishedBooks} livre{author.publishedBooks > 1 ? 's' : ''}
                        </Badge>
                        {author.isVerified && (
                          <Badge variant="outline" className="text-xs">
                            ✓ Vérifié
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {author.bio && (
                    <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                      {author.bio}
                    </p>
                  )}
                  {author.books.length > 0 && (
                    <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      <span>Dernier livre: {author.books[0]?.title || 'Aucun'}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}