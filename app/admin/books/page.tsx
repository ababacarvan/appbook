"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import { 
  Search, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  Loader2,
  BookOpen
} from 'lucide-react'

interface Book {
  id: string
  title: string
  coverImage: string | null
  type: string
  status: string
  views: number
  downloads: number
  createdAt: string
  author: {
    name: string
  }
}

export default function AdminBooksPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [books, setBooks] = useState<Book[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchBooks()
  }, [])

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/admin/books/recent')
      const data = await response.json()
      setBooks(data.books || [])
    } catch (error) {
      console.error('Failed to fetch books:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les livres',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (bookId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce livre ?')) return

    try {
      const response = await fetch(`/api/books/${bookId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        toast({ title: 'Livre supprimé' })
        fetchBooks()
      }
    } catch (error) {
      toast({ title: 'Erreur', variant: 'destructive' })
    }
  }

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.name.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || book.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Livres</h2>
          <p className="text-muted-foreground">Gérez les livres de la plateforme</p>
        </div>
        <Button onClick={() => router.push('/admin/books/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un livre
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un livre..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="px-3 py-2 border rounded-md bg-background"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              <option value="PUBLISHED">Publiés</option>
              <option value="PENDING_REVIEW">En attente</option>
              <option value="DRAFT">Brouillons</option>
              <option value="REJECTED">Refusés</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Livre</TableHead>
                <TableHead>Auteur</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Vues</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBooks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Aucun livre trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredBooks.map((book) => (
                  <TableRow key={book.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-14 bg-muted rounded flex items-center justify-center">
                          {book.coverImage ? (
                            <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover rounded" />
                          ) : (
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <span className="font-medium">{book.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>{book.author.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{book.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        book.status === 'PUBLISHED' ? 'success' :
                        book.status === 'PENDING_REVIEW' ? 'warning' :
                        book.status === 'REJECTED' ? 'destructive' :
                        'secondary'
                      }>
                        {book.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{book.views}</TableCell>
                    <TableCell className="text-sm">
                      {new Date(book.createdAt).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/admin/books/${book.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Voir
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/admin/books/${book.id}/edit`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(book.id)} className="text-red-500">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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