"use client"

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { 
  ArrowLeft, 
  Plus, 
  Loader2, 
  Upload, 
  FileText, 
  Music, 
  Image, 
  Video,
  File,
  X,
  User
} from 'lucide-react'

export default function AdminBookNewPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [authors, setAuthors] = useState<any[]>([])
  const [loadingAuthors, setLoadingAuthors] = useState(true)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [bookFile, setBookFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
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
    authorId: ''
  })

  const coverInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchAuthors()
  }, [])

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

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setCoverPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleBookFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setBookFile(file)
    }
  }

  const removeCover = () => {
    setCoverFile(null)
    setCoverPreview(null)
    if (coverInputRef.current) {
      coverInputRef.current.value = ''
    }
  }

  const removeBookFile = () => {
    setBookFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
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

  const getBucketForFile = (file: File): string => {
    const type = file.type
    if (type.startsWith('image/')) return 'covers'
    if (type.startsWith('audio/') || type.includes('mpeg') || type.includes('mp3') || type.includes('m4a')) return 'audio'
    if (type.startsWith('video/')) return 'videos'
    return 'books'
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
    setLoading(true)
    setUploading(true)

    try {
      let coverUrl = ''
      let fileUrl = ''

      if (coverFile) {
        coverUrl = await uploadFile(coverFile, 'covers')
      }

      if (bookFile) {
        const bucket = getBucketForFile(bookFile)
        console.log('Uploading book file to bucket:', bucket)
        fileUrl = await uploadFile(bookFile, bucket)
      }

      const bookData = {
        ...formData,
        pageCount: formData.pageCount ? parseInt(formData.pageCount) : undefined,
        duration: formData.duration ? parseInt(formData.duration) : undefined,
        publicationYear: formData.publicationYear ? parseInt(formData.publicationYear) : undefined,
        price: parseFloat(formData.price as any),
        coverImage: coverUrl || undefined,
        fileUrl: fileUrl || undefined,
        fileFormat: bookFile ? bookFile.name.split('.').pop()?.toUpperCase() : undefined,
        fileSize: bookFile ? bookFile.size : undefined,
        status: 'PUBLISHED',
        ...(formData.authorId && { authorId: formData.authorId })
      }

      console.log('Submitting book data:', bookData)

      const response = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookData)
      })

      if (response.ok) {
        toast({ 
          title: 'Livre créé avec succès',
          description: 'Le livre a été ajouté à la bibliothèque'
        })
        router.push('/admin/books')
      } else {
        const data = await response.json()
        toast({ 
          title: 'Erreur', 
          description: data.error || 'Une erreur est survenue', 
          variant: 'destructive' 
        })
      }
    } catch (error) {
      console.error('Error creating book:', error)
      toast({ 
        title: 'Erreur', 
        description: error instanceof Error ? error.message : 'Impossible de créer le livre', 
        variant: 'destructive' 
      })
    } finally {
      setLoading(false)
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push('/admin/books')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Ajouter un livre</h2>
          <p className="text-muted-foreground">Créez un nouveau livre avec ses fichiers</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informations du livre</CardTitle>
            <CardDescription>Remplissez les champs pour créer un nouveau livre</CardDescription>
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
                  <option value="">Moi (auteur connecté)</option>
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
              <p className="text-xs text-muted-foreground">
                Laissez vide pour utiliser votre propre profil d'auteur
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Titre du livre"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subtitle">Sous-titre</Label>
                <Input
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Sous-titre du livre"
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
                placeholder="Description du livre"
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
                <Label htmlFor="price">Prix (FCFA)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pageCount">Pages</Label>
                <Input
                  id="pageCount"
                  type="number"
                  value={formData.pageCount}
                  onChange={(e) => setFormData({ ...formData, pageCount: e.target.value })}
                  placeholder="Nombre de pages"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Durée (secondes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="Durée en secondes"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="publicationYear">Année de publication</Label>
                <Input
                  id="publicationYear"
                  type="number"
                  value={formData.publicationYear}
                  onChange={(e) => setFormData({ ...formData, publicationYear: e.target.value })}
                  placeholder="2024"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="publisher">Éditeur</Label>
              <Input
                id="publisher"
                value={formData.publisher}
                onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                placeholder="Nom de l'éditeur"
              />
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

        {/* Upload Cover */}
        <Card>
          <CardHeader>
            <CardTitle>Couverture du livre</CardTitle>
            <CardDescription>Upload une image pour la couverture</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="relative w-32 h-40 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/20 overflow-hidden">
                {coverPreview ? (
                  <>
                    <img 
                      src={coverPreview} 
                      alt="Couverture" 
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeCover}
                      className="absolute top-1 right-1 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <X className="h-4 w-4 text-white" />
                    </button>
                  </>
                ) : (
                  <div className="text-center">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-xs text-muted-foreground mt-1">Upload</p>
                  </div>
                )}
              </div>
              <div>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => coverInputRef.current?.click()}
                >
                  Choisir une image
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Formats: JPG, PNG, WEBP. Max: 5MB
                </p>
                {coverFile && (
                  <p className="text-xs text-green-600 mt-1">
                    {coverFile.name} ({Math.round(coverFile.size / 1024)} KB)
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upload Book File */}
        <Card>
          <CardHeader>
            <CardTitle>Fichier du livre</CardTitle>
            <CardDescription>Upload le fichier du livre (PDF, EPUB, MP3, etc.)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleBookFileChange}
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
                            removeBookFile()
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
                        Cliquez pour choisir un fichier ou glissez-déposez
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Formats: PDF, EPUB, MP3, M4A, MP4, WAV, OGG, ZIP
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" disabled={loading || uploading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {uploading ? 'Upload en cours...' : 'Création...'}
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Créer le livre
            </>
          )}
        </Button>
      </form>
    </div>
  )
}