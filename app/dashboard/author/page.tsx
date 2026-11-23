"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { 
  BookOpen, 
  Users, 
  DollarSign, 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  Eye, 
  Download,
  Loader2,
  Clock,
  Headphones,
  TrendingUp
} from 'lucide-react'

export default function AuthorDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>({
    totalBooks: 0,
    publishedBooks: 0,
    totalViews: 0,
    totalDownloads: 0,
    averageRating: 0,
    totalReaders: 0,
    totalRevenue: 0,
    totalListens: 0
  })
  const [books, setBooks] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [revenue, setRevenue] = useState<any[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statsRes, booksRes, activityRes, revenueRes] = await Promise.all([
        fetch('/api/author/stats'),
        fetch('/api/author/books'),
        fetch('/api/author/activity'),
        fetch('/api/author/revenue')
      ])

      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data)
      }
      
      if (booksRes.ok) {
        const data = await booksRes.json()
        setBooks(data.books || [])
      }
      
      if (activityRes.ok) {
        const data = await activityRes.json()
        setActivities(data.activity || [])
      }
      
      if (revenueRes.ok) {
        const data = await revenueRes.json()
        setRevenue(data.revenue || [])
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBook = (bookId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce livre ?')) return
    toast({ title: 'Livre supprimé' })
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
          <h1 className="text-3xl font-bold">Tableau de bord auteur</h1>
          <p className="text-muted-foreground">Gérez vos publications</p>
        </div>
        <Button onClick={() => router.push('/publish')}>
          <Plus className="mr-2 h-4 w-4" />
          Publier un livre
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Livres publiés</p>
              <p className="text-2xl font-bold">{stats.publishedBooks || 0}</p>
            </div>
            <BookOpen className="h-8 w-8 text-muted-foreground/50" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Lecteurs</p>
              <p className="text-2xl font-bold">{stats.totalReaders || 0}</p>
            </div>
            <Users className="h-8 w-8 text-muted-foreground/50" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Revenus</p>
              <p className="text-2xl font-bold">{Math.round(stats.totalRevenue || 0).toLocaleString()} FCFA</p>
            </div>
            <DollarSign className="h-8 w-8 text-muted-foreground/50" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Note moyenne</p>
              <p className="text-2xl font-bold">{stats.averageRating?.toFixed(1) || '0.0'}</p>
            </div>
            <Star className="h-8 w-8 text-muted-foreground/50" />
          </div>
        </Card>
      </div>

      <Tabs defaultValue="books">
        <TabsList>
          <TabsTrigger value="books">Mes livres</TabsTrigger>
          <TabsTrigger value="stats">Statistiques</TabsTrigger>
          <TabsTrigger value="revenue">Revenus</TabsTrigger>
          <TabsTrigger value="activity">Activité</TabsTrigger>
        </TabsList>

        <TabsContent value="books" className="mt-6">
          {books.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {books.map((book) => (
                <Card key={book.id} className="p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-16 bg-muted rounded flex items-center justify-center overflow-hidden">
                        {book.coverImage ? (
                          <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                        ) : (
                          <BookOpen className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{book.title}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <Badge variant={book.status === 'PUBLISHED' ? 'success' : 'secondary'}>
                            {book.status}
                          </Badge>
                          <Badge variant="secondary">{book.type}</Badge>
                          {book.isFree && (
                            <Badge variant="success" className="bg-green-500">Gratuit</Badge>
                          )}
                          <span className="text-sm text-muted-foreground">{book.views || 0} vues</span>
                          {book.averageRating > 0 && (
                            <span className="text-sm flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                              {book.averageRating.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/books/${book.id}/edit`)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteBook(book.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun livre</h3>
              <p className="text-muted-foreground mb-4">Commencez à publier vos livres</p>
              <Button onClick={() => router.push('/publish')}>Publier un livre</Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Performance</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total vues</span>
                  <span className="font-medium">{stats.totalViews || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total écoutes</span>
                  <span className="font-medium">{stats.totalListens || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Téléchargements</span>
                  <span className="font-medium">{stats.totalDownloads || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Note moyenne</span>
                  <span className="font-medium">{stats.averageRating?.toFixed(1) || '0.0'} ★</span>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Top livres</h3>
              <div className="space-y-2">
                {books.slice(0, 3).map((book) => (
                  <div key={book.id} className="flex justify-between items-center">
                    <span className="text-sm truncate">{book.title}</span>
                    <span className="text-sm font-medium">{book.views || 0} vues</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="mt-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Historique des revenus</h3>
            {revenue.length > 0 ? (
              <div className="space-y-4">
                {revenue.map((item, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-3">
                    <div>
                      <p className="font-medium">{item.month}</p>
                      <p className="text-sm text-muted-foreground">{item.bookCount} livres</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{item.amount.toLocaleString()} FCFA</p>
                      <p className="text-sm text-muted-foreground">{item.sales} ventes</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucun revenu pour le moment</p>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Activité récente</h3>
            {activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 border-b pb-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      {activity.type === 'read' && <Eye className="h-4 w-4" />}
                      {activity.type === 'listen' && <Headphones className="h-4 w-4" />}
                      {activity.type === 'download' && <Download className="h-4 w-4" />}
                      {activity.type === 'review' && <Star className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.user?.name || 'Anonyme'} • {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucune activité récente</p>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}