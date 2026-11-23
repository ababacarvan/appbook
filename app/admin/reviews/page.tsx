"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Star, CheckCircle, XCircle } from 'lucide-react'

interface Review {
  id: string
  rating: number
  comment: string | null
  isModerated: boolean
  createdAt: string
  user: {
    name: string | null
    avatar: string | null
  }
  book: {
    title: string
  }
}

export default function AdminReviewsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState<Review[]>([])

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/admin/reviews')
      const data = await response.json()
      setReviews(data.reviews || [])
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les avis',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleModerate = async (reviewId: string, approve: boolean) => {
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approve })
      })
      if (response.ok) {
        toast({ title: approve ? 'Avis approuvé' : 'Avis rejeté' })
        fetchReviews()
      }
    } catch (error) {
      toast({ title: 'Erreur', variant: 'destructive' })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Avis</h2>
        <p className="text-muted-foreground">Modérez les avis des utilisateurs</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Tous les avis</CardTitle>
            <Badge variant="secondary">{reviews.length} avis</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Livre</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Commentaire</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Aucun avis trouvé
                  </TableCell>
                </TableRow>
              ) : (
                reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={review.user.avatar || undefined} />
                          <AvatarFallback>{review.user.name?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                        <span>{review.user.name || 'Anonyme'}</span>
                      </div>
                    </TableCell>
                    <TableCell>{review.book.title}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                        {review.rating}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {review.comment || '—'}
                    </TableCell>
                    <TableCell>
                      {review.isModerated ? (
                        <Badge variant="success" className="bg-green-500">Approuvé</Badge>
                      ) : (
                        <Badge variant="warning">En attente</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell className="text-right">
                      {!review.isModerated && (
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleModerate(review.id, true)}
                          >
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleModerate(review.id, false)}
                          >
                            <XCircle className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}