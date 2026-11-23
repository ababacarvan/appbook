"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { BookGrid } from '@/components/BookGrid'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { BookOpen, CheckCircle, Clock, Heart, List, Loader2 } from 'lucide-react'

interface LibraryBook {
  id: string
  title: string
  coverImage: string | null
  type: string
  author: {
    id: string
    name: string
    avatar: string | null
  }
  status: string
  averageRating: number
  reviewsCount: number
  isFree: boolean
  isPremium: boolean
}

export default function LibraryPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [reading, setReading] = useState<LibraryBook[]>([])
  const [completed, setCompleted] = useState<LibraryBook[]>([])
  const [wantToRead, setWantToRead] = useState<LibraryBook[]>([])

  useEffect(() => {
    fetchLibrary()
  }, [])

  const fetchLibrary = async () => {
    try {
      const response = await fetch('/api/library')
      const data = await response.json()
      
      const library = data.libraries || []
      setReading(library.filter((l: any) => l.status === 'reading').map((l: any) => l.book))
      setCompleted(library.filter((l: any) => l.status === 'completed').map((l: any) => l.book))
      setWantToRead(library.filter((l: any) => l.status === 'want_to_read').map((l: any) => l.book))
    } catch (error) {
      console.error('Failed to fetch library:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible de charger votre bibliothèque',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const updateBookStatus = async (bookId: string, status: string) => {
    try {
      const response = await fetch('/api/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId, status })
      })

      if (response.ok) {
        toast({ title: 'Statut mis à jour' })
        fetchLibrary()
      }
    } catch (error) {
      toast({ title: 'Erreur', variant: 'destructive' })
    }
  }

  const removeFromLibrary = async (bookId: string) => {
    if (!confirm('Retirer ce livre de votre bibliothèque ?')) return

    try {
      const response = await fetch(`/api/library?bookId=${bookId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({ title: 'Livre retiré de la bibliothèque' })
        fetchLibrary()
      }
    } catch (error) {
      toast({ title: 'Erreur', variant: 'destructive' })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const sections = [
    { id: 'reading', label: 'En cours', icon: Clock, books: reading, count: reading.length },
    { id: 'completed', label: 'Terminés', icon: CheckCircle, books: completed, count: completed.length },
    { id: 'want-to-read', label: 'À lire', icon: Heart, books: wantToRead, count: wantToRead.length }
  ]

  const totalBooks = reading.length + completed.length + wantToRead.length

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Ma bibliothèque</h1>
          <p className="text-muted-foreground">Retrouvez tous vos livres en un seul endroit</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BookOpen className="h-4 w-4" />
          <span>{totalBooks} livre{totalBooks > 1 ? 's' : ''}</span>
        </div>
      </div>

      {totalBooks === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <BookOpen className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">Bibliothèque vide</h3>
              <p className="text-muted-foreground">
                Ajoutez des livres à votre bibliothèque pour les retrouver ici
              </p>
              <Button className="mt-4" onClick={() => router.push('/books')}>
                Explorer la bibliothèque
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Tabs defaultValue="reading" className="space-y-6">
          <TabsList>
            {sections.map((section) => (
              <TabsTrigger key={section.id} value={section.id} className="flex items-center gap-2">
                <section.icon className="h-4 w-4" />
                {section.label}
                <Badge variant="secondary" className="ml-1">
                  {section.count}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {sections.map((section) => (
            <TabsContent key={section.id} value={section.id}>
              {section.books.length > 0 ? (
                <div className="space-y-6">
                  <BookGrid books={section.books} />
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <section.icon className="h-12 w-12 text-muted-foreground" />
                    <div>
                      <h3 className="text-lg font-semibold">Aucun livre {section.label.toLowerCase()}</h3>
                      <p className="text-muted-foreground">
                        {section.id === 'reading' && 'Commencez à lire un nouveau livre dès maintenant'}
                        {section.id === 'completed' && 'Terminez vos lectures pour les voir apparaître ici'}
                        {section.id === 'want-to-read' && 'Ajoutez des livres à votre liste de souhaits'}
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  )
}