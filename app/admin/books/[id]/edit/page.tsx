"use client"

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Upload, 
  Music, 
  FileText, 
  File,
  X,
  User,
  Video,
  Image
} from 'lucide-react'

export default function AdminBookEditPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [authors, setAuthors] = useState<any[]>([])
  const [loadingAuthors, setLoadingAuthors] = useState(true)
  const [bookFile, setBookFile] = useState<File | null>(null)
  const [existingFileUrl, setExistingFileUrl] = useState<string | null>(null)
  const [existingFileType, setExistingFileType] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    language: 'fr',
    type: 'EBOOK',
    price: 0,
    isFree: false,
    isPremium: false,
    pageCount: '',
    duration: '',
    publisher: '',
    publicationYear: '',
    status: 'DRAFT',
    authorId: '',
    fileUrl: '',
    fileFormat: '',
    fileSize: 0
  })

  useEffect(() => {
    if (params.id) {
      fetchBook()
      fetchAuthors()
    }
  }, [params.id])

  const fetchAuthors = async () => {
    try {
      const response = await fetch('/api/authors')
      const data = await response.json()
      setAuthors(data.authors || [])
    } catch (error) {
      console.error('Failed to fetch authors:', error)
    } finally {
      setLoadingAuthors(false)
    }
  }

  const fetchBook = async () => {
    try {
      const response = await fetch(`/api/books/${params.id}`)
      const data = await response.json()
      setFormData({
        title: data.title || '',
        subtitle: data.subtitle || '',
        description: data.description || '',
        language: data.language || 'fr',
        type: data.type || 'EBOOK',
        price: data.price || 0,
        isFree: data.isFree || false,
        isPremium: data.isPremium || false,
        pageCount: data.pageCount?.toString() || '',
        duration: data.duration?.toString() || '',
        publisher: data.publisher || '',
        publicationYear: data.publicationYear?.toString() || '',
        status: data.status || 'DRAFT',
        authorId: data.author?.id || '',
        fileUrl: data.fileUrl || '',
        fileFormat: data.fileFormat || '',
        fileSize: data.fileSize || 0
      })
      setExistingFileUrl(data.fileUrl || null)
      setExistingFileType(data.fileFormat || null)
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setBookFile(file)
    }
  }

  const removeFile = () => {
    setBookFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getBucketForFile = (file: File): string => {
    const type = file.type
    if (type.startsWith('image/')) return 'covers'
    if (type.startsWith('audio/') || type.includes('mpeg') || type.includes('mp3') || type.includes('m4a')) return 'audio'
    if (type.startsWith('video/')) return 'videos'
    return 'books'
  }

  const getFileIcon = (file: File) => {
    const type = file.type
    if (type.startsWith('image/')) return <Image className="h-8 w-8 text-blue-500" />
    if (type.startsWith('audio/')) return <Music className="h-8 w-8 text-green-500" />
    if (type.startsWith('video/')) return <Video className="h-8 w-8 text-red-500" />
    if (type === 'application/pdf') return <FileText className="h-8 w-8 text-red-500" />
    if (type === 'application/epub+zip') return <FileText className="h-8 w-8 text-purple-500" />
    return <File className="h-8 w-8 text-gray-500" />
  }

  const uploadFile = async (file: File, bucket: string) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('bucket', bucket)
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Upload failed')
    }
    
    const data = await response.json()
    return data.url
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setUploading(true)

    try {
      let fileUrl = formData.fileUrl
      let fileFormat = formData.fileFormat
      let fileSize = formData.fileSize

      if (bookFile) {
        const bucket = getBucketForFile(bookFile)
        console.log('Uploading book file to bucket:', bucket)
        fileUrl = await uploadFile(bookFile, bucket)
        // Récupérer l'extension du fichier et la mettre en majuscule
        const extension = bookFile.name.split('.').pop()?.toUpperCase() || ''
        // Valider que l'extension est valide pour ContentFormat
        const validFormats = ['EPUB', 'PDF', 'MOBI', 'MP3', 'AAC', 'M4A', 'IMAGE', 'VIDEO']
        fileFormat = validFormats.includes(extension) ? extension : ''
        fileSize = bookFile.size
      }

      // Préparer les données à envoyer
      const updateData = {
        title: formData.title,
        subtitle: formData.subtitle || undefined,
        description: formData.description || undefined,
        language: formData.language,
        type: formData.type,
        price: parseFloat(formData.price as any) || 0,
        isFree: formData.isFree,
        isPremium: formData.isPremium,
        pageCount: formData.pageCount ? parseInt(formData.pageCount) : undefined,
        duration: formData.duration ? parseInt(formData.duration) : undefined,
        publisher: formData.publisher || undefined,
        publicationYear: formData.publicationYear ? parseInt(formData.publicationYear) : undefined,
        status: formData.status,
        fileUrl: fileUrl || undefined,
        fileFormat: fileFormat || undefined,
        fileSize: fileSize || undefined,
        ...(formData.authorId && { authorId: formData.authorId })
      }

      console.log('Sending update data:', updateData)

      const response = await fetch(`/api/books/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        toast({ 
          title: 'Livre mis à jour avec succès',
          description: 'Les modifications ont été sauvegardées'
        })
        router.push(`/admin/books/${params.id}`)
      } else {
        const data = await response.json()
        toast({ title: 'Erreur', description: data.error || 'Une erreur est survenue', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Error updating book:', error)
      toast({ 
        title: 'Erreur', 
        description: error instanceof Error ? error.message : 'Impossible de mettre à jour le livre', 
        variant: 'destructive' 
      })
    } finally {
      setSaving(false)
      setUploading(false)
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
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push(`/admin/books/${params.id}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Modifier le livre</h2>
          <p className="text-muted-foreground">Modifiez les informations du livre</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informations du livre</CardTitle>
            <CardDescription>Modifiez les champs pour mettre à jour le livre</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Sélecteur d'auteur */}
            <div className="space-y-2">
              <Label htmlFor="authorId">Auteur</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <select
                  id="authorId"
                  className="w-full pl-10 pr-3 py-2 border rounded-md bg-background appearance-none"
                  value={formData.authorId}
                  onChange={(e) => setFormData({ ...formData, authorId: e.target.value })}
                >
                  <option value="">Auteur connecté</option>
                  {loadingAuthors ? (
                    <option value="" disabled>Chargement des auteurs...</option>
                  ) : (
                    authors.map((author) => (
                      <option key={author.id} value={author.id}>
                        {author.user?.name || 'Auteur inconnu'} ({author.user?.email})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subtitle">Sous-titre</Label>
                <Input
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="language">Langue</Label>
                <select
                  id="language"
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                >
                  <option value="fr">Français</option>
                  <option value="en">Anglais</option>
                  <option value="es">Espagnol</option>
                  <option value="ar">Arabe</option>
                  <option value="pt">Portugais</option>
                  <option value="wo">Wolof</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <select
                  id="type"
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="EBOOK">Ebook</option>
                  <option value="AUDIOBOOK">Livre audio</option>
                  <option value="BD">Bande dessinée</option>
                  <option value="PODCAST">Podcast</option>
                  <option value="DOCUMENT">Document</option>
                  <option value="MAGAZINE">Magazine</option>
                  <option value="JOURNAL">Journal</option>
                  <option value="COURSE">Cours</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Statut</Label>
                <select
                  id="status"
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="DRAFT">Brouillon</option>
                  <option value="PENDING_REVIEW">En attente</option>
                  <option value="APPROVED">Approuvé</option>
                  <option value="REJECTED">Refusé</option>
                  <option value="PUBLISHED">Publié</option>
                  <option value="UNPUBLISHED">Dépublié</option>
                  <option value="ARCHIVED">Archivé</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Prix (FCFA)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pageCount">Pages</Label>
                <Input
                  id="pageCount"
                  type="number"
                  value={formData.pageCount}
                  onChange={(e) => setFormData({ ...formData, pageCount: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Durée (secondes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="publisher">Éditeur</Label>
                <Input
                  id="publisher"
                  value={formData.publisher}
                  onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="publicationYear">Année de publication</Label>
                <Input
                  id="publicationYear"
                  type="number"
                  value={formData.publicationYear}
                  onChange={(e) => setFormData({ ...formData, publicationYear: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFree}
                  onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
                  className="h-4 w-4"
                />
                Gratuit
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPremium}
                  onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
                  className="h-4 w-4"
                />
                Premium
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Upload du fichier */}
        <Card>
          <CardHeader>
            <CardTitle>Fichier du livre</CardTitle>
            <CardDescription>Uploader un fichier audio, PDF ou EPUB</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Fichier existant */}
              {existingFileUrl && !bookFile && (
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    {existingFileType?.toUpperCase() === 'MP3' || existingFileType?.toUpperCase() === 'M4A' ? (
                      <Music className="h-6 w-6 text-green-500" />
                    ) : existingFileType?.toUpperCase() === 'PDF' ? (
                      <FileText className="h-6 w-6 text-red-500" />
                    ) : existingFileType?.toUpperCase() === 'EPUB' ? (
                      <FileText className="h-6 w-6 text-purple-500" />
                    ) : (
                      <File className="h-6 w-6 text-gray-500" />
                    )}
                    <div>
                      <p className="font-medium">Fichier existant</p>
                      <p className="text-sm text-muted-foreground">
                        {existingFileType || 'Fichier'} • {formData.fileSize ? `${Math.round(formData.fileSize / 1024)} KB` : ''}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(existingFileUrl, '_blank')}
                  >
                    Voir
                  </Button>
                </div>
              )}

              {/* Upload nouveau fichier */}
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.epub,.mp3,.m4a,.mp4,.m4v,.zip,.wav,.ogg"
              />
              <div 
                className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {bookFile ? (
                  <div className="flex items-center justify-center gap-4">
                    {getFileIcon(bookFile)}
                    <div className="text-left">
                      <p className="font-medium">{bookFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {Math.round(bookFile.size / 1024)} KB
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Bucket: {getBucketForFile(bookFile)}
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeFile()
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Supprimer
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Cliquez pour choisir un fichier
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Formats: MP3, M4A, PDF, EPUB, MP4, WAV, OGG
                    </p>
                    {existingFileUrl && (
                      <p className="text-xs text-green-600 mt-2">
                        ✅ Un fichier existe déjà. Uploader un nouveau fichier pour le remplacer.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" disabled={saving || uploading}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {uploading ? 'Upload en cours...' : 'Sauvegarde...'}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Sauvegarder les modifications
            </>
          )}
        </Button>
      </form>
    </div>
  )
}