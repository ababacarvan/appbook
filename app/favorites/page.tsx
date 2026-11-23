"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { BookGrid } from '@/components/BookGrid'
import { Card } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Heart, Loader2 } from 'lucide-react'

export default function FavoritesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<any[]>([])

  useEffect(() => {
    fetchFavorites()
  }, [])

  const fetchFavorites = async () => {
    try {
      const response = await fetch('/api/favorites')
      const data = await response.json()
      setFavorites(data.favorites?.map((f: any) => f.book) || [])
    } catch (error) {
      console.error('Failed to fetch favorites:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible de charger vos favoris',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const removeFavorite = async (bookId: string) => {
    try {
      const response = await fetch(`/api/favorites?bookId=${bookId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({ title: 'Retiré des favoris' })
        fetchFavorites()
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="h-8 w-8 fill-red-500 text-red-500" />
        <div>
          <h1 className="text-3xl font-bold">Mes favoris</h1>
          <p className="text-muted-foreground">
            {favorites.length} livre{favorites.length > 1 ? 's' : ''} favori{favorites.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {favorites.length > 0 ? (
        <BookGrid books={favorites} />
      ) : (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <Heart className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">Aucun favori</h3>
              <p className="text-muted-foreground">
                Ajoutez des livres à vos favoris pour les retrouver facilement
              </p>
              <Button className="mt-4" onClick={() => router.push('/books')}>
                Explorer la bibliothèque
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}