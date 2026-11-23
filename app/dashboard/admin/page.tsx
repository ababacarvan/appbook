"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  PieChart
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function AdminDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [books, setBooks] = useState([])
  const [pendingBooks, setPendingBooks] = useState([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBooks: 0,
    totalRevenue: 0,
    totalSubscriptions: 0,
    activeUsers: 0
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [usersRes, booksRes, pendingRes, statsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/books'),
        fetch('/api/admin/pending-books'),
        fetch('/api/admin/stats')
      ])

      const usersData = await usersRes.json()
      const booksData = await booksRes.json()
      const pendingData = await pendingRes.json()
      const statsData = await statsRes.json()

      setUsers(usersData.users || [])
      setBooks(booksData.books || [])
      setPendingBooks(pendingData.books || [])
      setStats(statsData)
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
        toast({
          title: 'Livre approuvé',
          description: 'Le livre a été publié avec succès'
        })
        fetchDashboardData()
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'approuver le livre',
        variant: 'destructive'
      })
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
        toast({
          title: 'Livre refusé',
          description: 'Le livre a été refusé'
        })
        fetchDashboardData()
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de refuser le livre',
        variant: 'destructive'
      })
    }
  }

  const handleSuspendUser = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir suspendre cet utilisateur ?')) return

    try {
      const response = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: 'POST'
      })
      if (response.ok) {
        toast({
          title: 'Utilisateur suspendu',
          description: 'L\'utilisateur a été suspendu'
        })
        fetchDashboardData()
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de suspendre l\'utilisateur',
        variant: 'destructive'
      })
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Administration</h1>
          <p className="text-muted-foreground">Gérez la plateforme AppBook</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/dashboard/admin/settings')}>
            <Settings className="mr-2 h-4 w-4" />
            Paramètres
          </Button>
          <Button onClick={() => router.push('/dashboard/admin/export')}>
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
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
                <p className="text-sm text-muted-foreground">Livres</p>
                <p className="text-2xl font-bold">{stats.totalBooks}</p>
                <p className="text-xs text-yellow-500">{pendingBooks.length} en attente</p>
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
                <p className="text-xs text-muted-foreground">Tous types confondus</p>
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
                <p className="text-2xl font-bold">{stats.totalRevenue} FCFA</p>
                <p className="text-xs text-green-500">+12% ce mois</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold">{pendingBooks.length}</p>
                <p className="text-xs text-yellow-500">Modération requise</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">À modérer ({pendingBooks.length})</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="books">Tous les livres</TabsTrigger>
          <TabsTrigger value="reports">Signalements</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {pendingBooks.length > 0 ? (
            <div className="space-y-4">
              {pendingBooks.map((book: any) => (
                <Card key={book.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
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
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {book.description}
                          </p>
                          <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                            <span>📄 {book.pages || 0} pages</span>
                            <span>📅 {book.publicationYear || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
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

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Gestion des utilisateurs</CardTitle>
                <div className="flex items-center gap-2">
                  <Input placeholder="Rechercher..." className="w-64" />
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="font-semibold">{user.name?.[0] || user.email[0]}</span>
                      </div>
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
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleSuspendUser(user.id)}>
                        <Ban className="h-4 w-4 text-destructive" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="books">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
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
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {books.map((book: any) => (
                  <div key={book.id} className="flex items-center justify-between border-b pb-3">
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
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun signalement</h3>
              <p className="text-muted-foreground">Tous les contenus respectent les règles de la plateforme</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}