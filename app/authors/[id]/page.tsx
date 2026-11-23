"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { 
  ArrowLeft, 
  Users, 
  BookOpen, 
  Globe, 
  Mail,
  Calendar,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

// Composant BookCard simplifié pour cette page
function AuthorBookCard({ book }: { book: any }) {
  return (
    <Link href={`/books/${book.id}`}>
      <div className="group cursor-pointer">
        <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted">
          {book.coverImage ? (
            <img
              src={book.coverImage}
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-primary/10 to-background">
              <span className="text-4xl">📖</span>
            </div>
          )}
          {book.isFree && (
            <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
              Gratuit
            </div>
          )}
        </div>
        <div className="mt-2">
          <h4 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
            {book.title}
          </h4>
          <p className="text-xs text-muted-foreground">
            {book.type === 'AUDIOBOOK' ? '🎧 Audio' : '📖 Livre'}
          </p>
        </div>
      </div>
    </Link>
  )
}

interface Author {
  id: string
  userId: string
  bio: string | null
  website: string | null
  socialLinks: {
    twitter?: string
    instagram?: string
    linkedin?: string
  } | null
  isVerified: boolean
  createdAt: string
  updatedAt: string
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
    subtitle: string | null
    description: string | null
    coverImage: string | null
    type: string
    price: number | null
    isFree: boolean
    isPremium: boolean
    status: string
    averageRating: number | null
    pageCount: number | null
    duration: number | null
    createdAt: string
    publishedAt: string | null
  }>
  bookCount: number
  publishedBooks: number
  totalViews: number
  totalDownloads: number
}

export default function AuthorDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [author, setAuthor] = useState<Author | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isFollowing, setIsFollowing] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchAuthor()
    }
  }, [params.id])

  const fetchAuthor = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/authors/${params.id}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Auteur non trouvé')
        }
        throw new Error('Erreur lors du chargement de l\'auteur')
      }
      
      const data = await response.json()
      setAuthor(data.author)
    } catch (error) {
      console.error('Failed to fetch author:', error)
      setError(error instanceof Error ? error.message : 'Une erreur est survenue')
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de charger l\'auteur',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async () => {
    try {
      const response = await fetch('/api/authors/follow', {
        method: isFollowing ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorId: author?.id })
      })

      if (response.ok) {
        setIsFollowing(!isFollowing)
        toast({
          title: isFollowing ? 'Auteur retiré des suivis' : 'Auteur suivi',
          description: isFollowing ? 'Vous ne suivez plus cet auteur' : 'Vous suivez maintenant cet auteur'
        })
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de suivre cet auteur',
        variant: 'destructive'
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !author) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <Users className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Auteur non trouvé</h2>
          <p className="text-muted-foreground mb-4">
            {error || 'L\'auteur que vous recherchez n\'existe pas ou a été supprimé.'}
          </p>
          <Button onClick={() => router.push('/authors')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux auteurs
          </Button>
        </div>
      </div>
    )
  }

  const publishedBooks = author.books.filter(book => book.status === 'PUBLISHED')
  const totalBooks = publishedBooks.length

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => router.push('/authors')} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour aux auteurs
      </Button>

      {/* Author Header */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="h-24 w-24 md:h-32 md:w-32">
              <AvatarImage src={author.user.avatar || undefined} />
              <AvatarFallback className="text-4xl">
                {author.user.name?.[0] || 'A'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold">{author.user.name}</h1>
                {author.isVerified && (
                  <Badge variant="default" className="flex items-center gap-1 bg-green-500 hover:bg-green-600">
                    <CheckCircle className="h-3 w-3" />
                    Vérifié
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {totalBooks} livre{totalBooks > 1 ? 's' : ''}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {author.totalViews || 0} vues
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Membre depuis {formatDate(new Date(author.createdAt))}
                </span>
              </div>
              {author.user.bio && (
                <p className="mt-3 text-muted-foreground max-w-2xl">
                  {author.user.bio}
                </p>
              )}
              {author.bio && (
                <p className="mt-2 text-muted-foreground max-w-2xl">
                  {author.bio}
                </p>
              )}
            </div>

            <div className="flex flex-col items-end gap-2 w-full md:w-auto">
              <Button onClick={handleFollow} variant={isFollowing ? 'outline' : 'default'}>
                {isFollowing ? 'Suivi' : 'Suivre'}
              </Button>
              {author.website && (
                <a 
                  href={author.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                >
                  <Globe className="h-4 w-4" />
                  {author.website.replace(/^https?:\/\//, '')}
                </a>
              )}
              <div className="flex gap-2 mt-1">
                {author.socialLinks?.twitter && (
                  <a 
                    href={`https://twitter.com/${author.socialLinks.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <span className="text-sm">🐦</span>
                  </a>
                )}
                {author.socialLinks?.instagram && (
                  <a 
                    href={`https://instagram.com/${author.socialLinks.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <span className="text-sm">📸</span>
                  </a>
                )}
                {author.socialLinks?.linkedin && (
                  <a 
                    href={`https://linkedin.com/in/${author.socialLinks.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <span className="text-sm">💼</span>
                  </a>
                )}
                <a 
                  href={`mailto:${author.user.email}`}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Mail className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Books Section */}
      <div className="mt-8">
        <Tabs defaultValue="books" className="space-y-6">
          <TabsList>
            <TabsTrigger value="books">Livres ({totalBooks})</TabsTrigger>
            <TabsTrigger value="about">À propos</TabsTrigger>
          </TabsList>

          <TabsContent value="books">
            {totalBooks > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                {publishedBooks.map((book) => (
                  <AuthorBookCard key={book.id} book={book} />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <BookOpen className="h-12 w-12 text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-semibold">Aucun livre publié</h3>
                    <p className="text-muted-foreground">
                      Cet auteur n'a pas encore publié de livres
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="about">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Biographie</h3>
                  <p className="text-muted-foreground">
                    {author.bio || author.user.bio || 'Aucune biographie disponible.'}
                  </p>
                </div>
                
                {author.website && (
                  <div>
                    <h3 className="font-semibold mb-2">Site web</h3>
                    <a 
                      href={author.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {author.website}
                    </a>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-2">Statistiques</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="p-3 bg-muted rounded-lg text-center">
                      <p className="text-2xl font-bold">{totalBooks}</p>
                      <p className="text-sm text-muted-foreground">Livres</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg text-center">
                      <p className="text-2xl font-bold">{author.totalViews || 0}</p>
                      <p className="text-sm text-muted-foreground">Vues totales</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg text-center">
                      <p className="text-2xl font-bold">{author.totalDownloads || 0}</p>
                      <p className="text-sm text-muted-foreground">Téléchargements</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Membre depuis</h3>
                  <p className="text-muted-foreground">
                    {formatDate(new Date(author.createdAt))}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}