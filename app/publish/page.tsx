"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Upload, FileText, Music, Image, X } from 'lucide-react'

export default function PublishPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    language: 'fr',
    type: 'EBOOK',
    price: 0,
    isFree: false,
    isPremium: false
  })
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [bookFile, setBookFile] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Upload cover
      let coverUrl = ''
      if (coverFile) {
        const formData = new FormData()
        formData.append('file', coverFile)
        formData.append('bucket', 'covers')
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        const uploadData = await uploadRes.json()
        if (uploadData.success) {
          coverUrl = uploadData.url
        }
      }

      // Upload book file
      let fileUrl = ''
      if (bookFile) {
        const formData = new FormData()
        formData.append('file', bookFile)
        formData.append('bucket', 'books')
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        const uploadData = await uploadRes.json()
        if (uploadData.success) {
          fileUrl = uploadData.url
        }
      }

      // Create book
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          coverImage: coverUrl,
          fileUrl: fileUrl
        })
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la publication')
      }

      toast({
        title: 'Livre publié !',
        description: 'Votre livre a été envoyé pour modération.'
      })

      router.push('/dashboard/author')
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de publier le livre',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Publier un livre</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informations du livre</CardTitle>
            <CardDescription>Remplissez les informations de votre livre</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Titre *</label>
              <Input
                placeholder="Titre de votre livre"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sous-titre</label>
              <Input
                placeholder="Sous-titre de votre livre"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description *</label>
              <Textarea
                placeholder="Description de votre livre"
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Langue</label>
                <Select
                  value={formData.language}
                  onValueChange={(value) => setFormData({ ...formData, language: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">Anglais</SelectItem>
                    <SelectItem value="es">Espagnol</SelectItem>
                    <SelectItem value="ar">Arabe</SelectItem>
                    <SelectItem value="pt">Portugais</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Type *</label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EBOOK">Ebook</SelectItem>
                    <SelectItem value="AUDIOBOOK">Livre audio</SelectItem>
                    <SelectItem value="BD">Bande dessinée</SelectItem>
                    <SelectItem value="PODCAST">Podcast</SelectItem>
                    <SelectItem value="DOCUMENT">Document</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Prix (FCFA)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isFree"
                  checked={formData.isFree}
                  onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
                  className="h-4 w-4"
                />
                <label htmlFor="isFree" className="text-sm">Gratuit</label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPremium"
                  checked={formData.isPremium}
                  onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
                  className="h-4 w-4"
                />
                <label htmlFor="isPremium" className="text-sm">Premium</label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fichiers</CardTitle>
            <CardDescription>Upload de la couverture et du fichier du livre</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <input
                type="file"
                id="cover"
                accept="image/*"
                onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <label htmlFor="cover" className="cursor-pointer">
                <div className="flex flex-col items-center gap-2">
                  <Image className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {coverFile ? coverFile.name : 'Télécharger la couverture'}
                  </span>
                  <span className="text-xs text-muted-foreground">PNG, JPG, WEBP</span>
                </div>
              </label>
            </div>

            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <input
                type="file"
                id="book"
                accept=".epub,.pdf,.mp3,.m4a,.zip"
                onChange={(e) => setBookFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <label htmlFor="book" className="cursor-pointer">
                <div className="flex flex-col items-center gap-2">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {bookFile ? bookFile.name : 'Télécharger le fichier'}
                  </span>
                  <span className="text-xs text-muted-foreground">EPUB, PDF, MP3, M4A</span>
                </div>
              </label>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? 'Publication en cours...' : 'Publier le livre'}
        </Button>
      </form>
    </div>
  )
}