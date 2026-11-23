"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Settings,
  UserPlus,
  Filter,
  Search,
  Eye,
  MoreVertical,
  Ban,
  Shield,
  Mail,
  Download,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  Star,
  Heart,
  Headphones,
  FileText,
  Trash2,
  Edit,
  Plus
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function AdminDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalBooks: 0,
    totalRevenue: 0,
    totalSubscriptions: 0,
    pendingBooks: 0,
    totalAuthors: 0,
    totalReviews: 0
  })
  const [recentUsers, setRecentUsers] = useState([])
  const [recentBooks, setRecentBooks] = useState([])
  const [pendingBooks, setPendingBooks] = useState([])
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, usersRes, booksRes, pendingRes, activityRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users/recent'),
        fetch('/api/admin/books/recent'),
        fetch('/api/admin/books/pending'),
        fetch('/api/admin/activity/recent')
      ])

      const statsData = await statsRes.json()
      const usersData = await usersRes.json()
      const booksData = await booksRes.json()
      const pendingData = await pendingRes.json()
      const activityData = await activityRes.json()

      setStats(statsData)
      setRecentUsers(usersData.users || [])
      setRecentBooks(booksData.books || [])
      setPendingBooks(pendingData.books || [])
      setRecentActivity(activityData.activity || [])
    } catch (error) {
      console.error('Failed to fetch dashboard:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible de charger le tableau de bord',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApproveBook = async (bookId: string) => {
    try {
      const response = await fetch(`/api/admin/books/${bookId}/approve`, {
        method: 'POST'
      })
      if (response.ok) {
        toast({ title: 'Livre approuvé', description: 'Le livre a été publié avec succès' })
        fetchDashboardData()
      }
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible d\'approuver le livre', variant: 'destructive' })
    }
  }

  const handleRejectBook = async (bookId: string) => {
    const reason = prompt('Motif du refus :')
    if (!reason) return

    try {
      const response = await fetch(`/api/admin/books/${bookId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      })
      if (response.ok) {
        toast({ title: 'Livre refusé', description: 'Le livre a été refusé' })
        fetchDashboardData()
      }
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de refuser le livre', variant: 'destructive' })
    }
  }

  const handleSuspendUser = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir suspendre cet utilisateur ?')) return

    try {
      const response = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: 'POST'
      })
      if (response.ok) {
        toast({ title: 'Utilisateur suspendu', description: 'L\'utilisateur a été suspendu' })
        fetchDashboardData()
      }
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de suspendre l\'utilisateur', variant: 'destructive' })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer définitivement cet utilisateur ?')) return

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        toast({ title: 'Utilisateur supprimé', description: 'L\'utilisateur a été supprimé' })
        fetchDashboardData()
      }
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de supprimer l\'utilisateur', variant: 'destructive' })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Tableau de bord</h1>
            <p className="text-muted-foreground">Gérez votre plateforme AppBook</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push('/admin/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Paramètres
            </Button>
            <Button onClick={() => router.push('/admin/export')}>
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Utilisateurs</p>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  <p className="text-xs text-green-500">{stats.activeUsers} actifs</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Auteurs</p>
                  <p className="text-2xl font-bold">{stats.totalAuthors}</p>
                </div>
                <Shield className="h-8 w-8 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Livres</p>
                  <p className="text-2xl font-bold">{stats.totalBooks}</p>
                  <p className="text-xs text-yellow-500">{stats.pendingBooks} en attente</p>
                </div>
                <BookOpen className="h-8 w-8 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Abonnements</p>
                  <p className="text-2xl font-bold">{stats.totalSubscriptions}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Revenus</p>
                  <p className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()} FCFA</p>
                </div>
                <DollarSign className="h-8 w-8 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="overview">Aperçu</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="books">Livres</TabsTrigger>
            <TabsTrigger value="pending">À modérer ({pendingBooks.length})</TabsTrigger>
            <TabsTrigger value="reviews">Avis</TabsTrigger>
            <TabsTrigger value="activity">Activité</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Activité récente</CardTitle>
                    <CardDescription>Dernières actions sur la plateforme</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity.slice(0, 5).map((activity: any) => (
                        <div key={activity.id} className="flex items-start gap-3 border-b pb-3">
                          <div className="p-2 bg-primary/10 rounded-full">
                            {activity.type === 'user' && <Users className="h-4 w-4" />}
                            {activity.type === 'book' && <BookOpen className="h-4 w-4" />}
                            {activity.type === 'review' && <Star className="h-4 w-4" />}
                            {activity.type === 'subscription' && <DollarSign className="h-4 w-4" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm">{activity.message}</p>
                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Livres en attente de modération</CardTitle>
                    <CardDescription>Contenus à valider</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {pendingBooks.slice(0, 3).map((book: any) => (
                      <div key={book.id} className="flex items-center justify-between border-b pb-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-14 bg-muted rounded flex items-center justify-center">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{book.title}</p>
                            <p className="text-xs text-muted-foreground">Par {book.author?.name}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => handleApproveBook(book.id)}>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleRejectBook(book.id)}>
                            <XCircle className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Statistiques rapides</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total avis</span>
                      <span className="font-semibold">{stats.totalReviews}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Note moyenne</span>
                      <span className="font-semibold">4.2 ★</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Taux de conversion</span>
                      <span className="font-semibold">12.5%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Chiffre d'affaires mensuel</span>
                      <span className="font-semibold">{Math.round(stats.totalRevenue / 12).toLocaleString()} FCFA</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Actions rapides</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/admin/users/new')}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Ajouter un utilisateur
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/admin/books/new')}>
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter un livre
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/admin/promotions')}>
                      <DollarSign className="mr-2 h-4 w-4" />
                      Créer une promotion
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <CardTitle>Gestion des utilisateurs</CardTitle>
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <Input placeholder="Rechercher..." className="w-full md:w-64" />
                    <Button variant="outline" size="icon">
                      <Search className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => router.push('/admin/users/new')}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Ajouter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentUsers.map((user: any) => (
                    <div key={user.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-3 gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.name?.[0] || user.email[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name || 'Anonyme'}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                              {user.role}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {user.subscription?.status || 'Aucun abonnement'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/users/${user.id}`)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleSuspendUser(user.id)}>
                          <Ban className="h-4 w-4 text-yellow-500" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Books Tab */}
          <TabsContent value="books">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <CardTitle>Gestion des livres</CardTitle>
                  <div className="flex items-center gap-2">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filtrer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="published">Publiés</SelectItem>
                        <SelectItem value="pending">En attente</SelectItem>
                        <SelectItem value="rejected">Refusés</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentBooks.map((book: any) => (
                    <div key={book.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-3 gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-16 bg-muted rounded flex items-center justify-center">
                          {book.coverImage ? (
                            <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover rounded" />
                          ) : (
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{book.title}</p>
                          <p className="text-sm text-muted-foreground">Par {book.author?.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={book.status === 'PUBLISHED' ? 'success' : 'secondary'}>
                              {book.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {book.views || 0} vues
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {book.downloads || 0} téléchargements
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/books/${book.id}`)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/books/${book.id}/edit`)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Tab */}
          <TabsContent value="pending">
            {pendingBooks.length > 0 ? (
              <div className="space-y-4">
                {pendingBooks.map((book: any) => (
                  <Card key={book.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-24 bg-muted rounded flex items-center justify-center">
                            {book.coverImage ? (
                              <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover rounded" />
                            ) : (
                              <BookOpen className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold">{book.title}</h3>
                            <p className="text-sm text-muted-foreground">Par {book.author?.name}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <Badge variant="secondary">{book.type}</Badge>
                              <Badge variant="outline">{book.language}</Badge>
                              <Badge variant="warning">En attente</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2 max-w-md">
                              {book.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleApproveBook(book.id)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approuver
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleRejectBook(book.id)}>
                            <XCircle className="mr-2 h-4 w-4" />
                            Refuser
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucun livre en attente</h3>
                  <p className="text-muted-foreground">Tous les livres ont été modérés</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des avis</CardTitle>
                <CardDescription>Modérez les avis des utilisateurs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.filter((a: any) => a.type === 'review').slice(0, 10).map((review: any) => (
                    <div key={review.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-3 gap-2">
                      <div className="flex items-start gap-3">
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`} />
                          ))}
                        </div>
                        <div>
                          <p className="text-sm">{review.comment || 'Aucun commentaire'}</p>
                          <p className="text-xs text-muted-foreground">
                            Par {review.user?.name} sur {review.book?.title}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <XCircle className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Journal d'activité</CardTitle>
                <CardDescription>Toutes les actions sur la plateforme</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map((activity: any) => (
                    <div key={activity.id} className="flex items-start gap-3 border-b pb-3">
                      <div className="p-2 bg-primary/10 rounded-full">
                        {activity.type === 'user' && <Users className="h-4 w-4" />}
                        {activity.type === 'book' && <BookOpen className="h-4 w-4" />}
                        {activity.type === 'review' && <Star className="h-4 w-4" />}
                        {activity.type === 'subscription' && <DollarSign className="h-4 w-4" />}
                        {activity.type === 'login' && <Shield className="h-4 w-4" />}
                        {activity.type === 'upload' && <FileText className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{activity.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.user?.name || 'Système'} - {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}