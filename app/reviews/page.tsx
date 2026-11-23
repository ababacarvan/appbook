"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Star, Loader2, Edit, Trash2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Review {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  book: {
    id: string
    title: string
    coverImage: string | null
    type: string
  }
}

export default function ReviewsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState<Review[]>([])

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/reviews')
      const data = await response.json()
      setReviews(data.reviews || [])
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible de charger vos avis',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) return

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({ title: 'Avis supprimé' })
        fetchReviews()
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Mes avis</h1>
          <p className="text-muted-foreground">
            {reviews.length} avis posté{reviews.length > 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => router.push('/books')}>
          Donner un avis
        </Button>
      </div>

      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-16 bg-muted rounded flex items-center justify-center overflow-hidden">
                      {review.book.coverImage ? (
                        <img src={review.book.coverImage} alt={review.book.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">📖</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{review.book.title}</h3>
                      <Badge variant="secondary" className="text-xs">{review.book.type}</Badge>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? 'fill-yellow-500 text-yellow-500'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(new Date(review.createdAt))}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-sm mt-2 text-muted-foreground">{review.comment}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/books/${review.book.id}`)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteReview(review.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <Star className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">Aucun avis</h3>
              <p className="text-muted-foreground">
                Vous n'avez pas encore donné d'avis sur des livres
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