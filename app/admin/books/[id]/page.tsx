"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { 
  ArrowLeft, 
  BookOpen, 
  User, 
  Calendar, 
  Eye, 
  Download,
  Star,
  Edit,
  Trash2,
  Loader2,
  FileText,
  Music,
  Image as ImageIcon,
  Video,
  File,
  Play,
  Headphones,
  Clock
} from 'lucide-react'
import { formatDate, formatDuration } from '@/lib/utils'

export default function AdminBookDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [book, setBook] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('details')

  useEffect(() => {
    if (params.id) {
      fetchBook()
    }
  }, [params.id])

  const fetchBook = async () => {
    try {
      const response = await fetch(`/api/books/${params.id}`)
      const data = await response.json()
      setBook(data)
    } catch (error) {
      console.error('Failed to fetch book:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible de charger le livre',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce livre ? Cette action est irréversible.')) return

    try {
      const response = await fetch(`/api/books/${params.id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        toast({ title: 'Livre supprimé avec succès' })
        router.push('/admin/books')
      } else {
        toast({ title: 'Erreur', description: 'Impossible de supprimer le livre', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Erreur', variant: 'destructive' })
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/books/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...book, status: newStatus })
      })
      if (response.ok) {
        toast({ title: 'Statut mis à jour' })
        fetchBook()
      }
    } catch (error) {
      toast({ title: 'Erreur', variant: 'destructive' })
    }
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'AUDIOBOOK':
      case 'PODCAST':
        return <Music className="h-8 w-8 text-green-500" />
      case 'EBOOK':
        return <FileText className="h-8 w-8 text-blue-500" />
      case 'BD':
        return <ImageIcon className="h-8 w-8 text-purple-500" />
      case 'VIDEO':
        return <Video className="h-8 w-8 text-red-500" />
      default:
        return <File className="h-8 w-8 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!book) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold">Livre non trouvé</h3>
        <Button className="mt-4" onClick={() => router.push('/admin/books')}>
          Retour
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Button variant="ghost" onClick={() => router.push('/admin/books')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <div className="flex flex-wrap gap-2">
          <select
            className="px-3 py-2 border rounded-md bg-background"
            value={book.status}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            <option value="DRAFT">Brouillon</option>
            <option value="PENDING_REVIEW">En attente</option>
            <option value="APPROVED">Approuvé</option>
            <option value="REJECTED">Refusé</option>
            <option value="PUBLISHED">Publié</option>
            <option value="UNPUBLISHED">Dépublié</option>
            <option value="ARCHIVED">Archivé</option>
          </select>
          <Button variant="outline" onClick={() => router.push(`/admin/books/${params.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Cover */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
              {book.coverImage ? (
                <Image
                  src={book.coverImage}
                  alt={book.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <BookOpen className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Statut</span>
                <Badge variant={
                  book.status === 'PUBLISHED' ? 'success' :
                  book.status === 'PENDING_REVIEW' ? 'warning' :
                  book.status === 'REJECTED' ? 'destructive' :
                  'secondary'
                }>
                  {book.status}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium">{book.type}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Langue</span>
                <span className="font-medium">{book.language?.toUpperCase()}</span>
              </div>
              {book.price !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Prix</span>
                  <span className="font-medium">
                    {book.isFree ? 'Gratuit' : `${book.price} FCFA`}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{book.title}</CardTitle>
                {book.subtitle && (
                  <CardDescription>{book.subtitle}</CardDescription>
                )}
              </div>
              <div className="flex gap-2">
                {book.isFree && <Badge variant="success" className="bg-green-500">Gratuit</Badge>}
                {book.isPremium && <Badge variant="warning" className="bg-yellow-500">Premium</Badge>}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Auteur</p>
                <p className="font-medium">{book.author?.name || 'Inconnu'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Éditeur</p>
                <p className="font-medium">{book.publisher || '—'}</p>
              </div>
              {book.pageCount && (
                <div>
                  <p className="text-sm text-muted-foreground">Pages</p>
                  <p className="font-medium">{book.pageCount}</p>
                </div>
              )}
              {book.duration && (
                <div>
                  <p className="text-sm text-muted-foreground">Durée</p>
                  <p className="font-medium">{formatDuration(book.duration)}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Publié le</p>
                <p className="font-medium">
                  {book.publishedAt ? formatDate(new Date(book.publishedAt)) : '—'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Créé le</p>
                <p className="font-medium">{formatDate(new Date(book.createdAt))}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vues</p>
                <p className="font-medium">{book.views || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Téléchargements</p>
                <p className="font-medium">{book.downloads || 0}</p>
              </div>
            </div>

            {book.description && (
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="mt-1 text-sm">{book.description}</p>
              </div>
            )}

            {/* Categories & Tags */}
            <div className="flex flex-wrap gap-2">
              {book.categories?.map((bc: any) => (
                <Badge key={bc.category.id} variant="secondary">
                  {bc.category.icon} {bc.category.name}
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {book.tags?.map((bt: any) => (
                <Badge key={bt.tag.id} variant="outline">
                  #{bt.tag.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs: Fichiers, Chapitres, Avis */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="files">Fichiers</TabsTrigger>
          <TabsTrigger value="chapters">Chapitres</TabsTrigger>
          <TabsTrigger value="reviews">Avis ({book.reviews?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="files">
          <Card>
            <CardHeader>
              <CardTitle>Fichiers du livre</CardTitle>
              <CardDescription>Gérez les fichiers associés à ce livre</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Fichier principal */}
              <div>
                <h4 className="text-sm font-medium mb-2">Fichier principal</h4>
                {book.fileUrl ? (
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getFileIcon(book.type)}
                      <div>
                        <p className="font-medium">
                          {book.fileFormat || 'Fichier'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {book.fileSize ? `${Math.round(book.fileSize / 1024)} KB` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href={book.fileUrl} target="_blank" rel="noopener noreferrer">
                          <Eye className="mr-2 h-4 w-4" />
                          Voir
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href={book.fileUrl} download>
                          <Download className="mr-2 h-4 w-4" />
                          Télécharger
                        </a>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Aucun fichier uploadé</p>
                )}
              </div>

              {/* Lecteur intégré */}
              {book.fileUrl && book.canAccess && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Aperçu</h4>
                  <div className="p-4 border rounded-lg bg-muted/20">
                    {book.type === 'AUDIOBOOK' || book.type === 'PODCAST' ? (
                      <audio controls className="w-full">
                        <source src={book.fileUrl} />
                        Votre navigateur ne supporte pas la lecture audio.
                      </audio>
                    ) : book.type === 'VIDEO' ? (
                      <video controls className="w-full max-h-96">
                        <source src={book.fileUrl} />
                        Votre navigateur ne supporte pas la lecture vidéo.
                      </video>
                    ) : book.type === 'EBOOK' || book.type === 'DOCUMENT' ? (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                        <p className="mt-2 text-muted-foreground">
                          {book.fileFormat || 'Document'} disponible
                        </p>
                        <Button variant="outline" className="mt-4" asChild>
                          <a href={book.fileUrl} target="_blank" rel="noopener noreferrer">
                            Ouvrir le document
                          </a>
                        </Button>
                      </div>
                    ) : book.type === 'BD' ? (
                      <div className="text-center py-8">
                        <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                        <p className="mt-2 text-muted-foreground">Bande dessinée disponible</p>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <File className="h-12 w-12 mx-auto text-muted-foreground" />
                        <p className="mt-2 text-muted-foreground">Fichier disponible</p>
                        <Button variant="outline" className="mt-4" asChild>
                          <a href={book.fileUrl} target="_blank" rel="noopener noreferrer">
                            Télécharger
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chapters">
          <Card>
            <CardHeader>
              <CardTitle>Chapitres</CardTitle>
              <CardDescription>Gérez les chapitres du livre</CardDescription>
            </CardHeader>
            <CardContent>
              {book.audioChapters && book.audioChapters.length > 0 ? (
                <div className="space-y-2">
                  {book.audioChapters.map((chapter: any, index: number) => (
                    <div key={chapter.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium w-8">{index + 1}.</span>
                        <div>
                          <p className="font-medium">{chapter.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDuration(chapter.duration)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {chapter.fileUrl && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={chapter.fileUrl} target="_blank" rel="noopener noreferrer">
                              <Play className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Music className="h-12 w-12 mx-auto mb-2" />
                  <p>Aucun chapitre disponible pour ce livre</p>
                  <p className="text-sm">Ajoutez des chapitres pour les livres audio et podcasts</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>Avis des utilisateurs</CardTitle>
              <CardDescription>Consultez et modérez les avis</CardDescription>
            </CardHeader>
            <CardContent>
              {book.reviews && book.reviews.length > 0 ? (
                <div className="space-y-4">
                  {book.reviews.map((review: any) => (
                    <div key={review.id} className="border-b pb-4 last:border-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
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
                          <span className="text-sm font-medium">
                            {review.user?.name || 'Anonyme'}
                          </span>
                        </div>
                        <Badge variant={review.isModerated ? 'success' : 'warning'}>
                          {review.isModerated ? 'Approuvé' : 'En attente'}
                        </Badge>
                      </div>
                      {review.comment && (
                        <p className="text-sm mt-2">{review.comment}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(new Date(review.createdAt))}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Star className="h-12 w-12 mx-auto mb-2" />
                  <p>Aucun avis pour ce livre</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Stats rapides */}
      <Card>
        <CardHeader>
          <CardTitle>Statistiques</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <Eye className="h-5 w-5 mx-auto text-muted-foreground" />
              <p className="text-2xl font-bold mt-1">{book.views || 0}</p>
              <p className="text-xs text-muted-foreground">Vues</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <Download className="h-5 w-5 mx-auto text-muted-foreground" />
              <p className="text-2xl font-bold mt-1">{book.downloads || 0}</p>
              <p className="text-xs text-muted-foreground">Téléchargements</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <Star className="h-5 w-5 mx-auto text-muted-foreground" />
              <p className="text-2xl font-bold mt-1">{book.averageRating?.toFixed(1) || 0}</p>
              <p className="text-xs text-muted-foreground">Note moyenne</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <FileText className="h-5 w-5 mx-auto text-muted-foreground" />
              <p className="text-2xl font-bold mt-1">{book.reviews?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Avis</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}