"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { BookGrid } from '@/components/BookGrid'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Plus, FolderOpen, Trash2, Edit, Eye } from 'lucide-react'

export default function CollectionsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [collections, setCollections] = useState([])
  const [selectedCollection, setSelectedCollection] = useState<any>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newCollection, setNewCollection] = useState({
    name: '',
    description: '',
    isPublic: true
  })

  useEffect(() => {
    fetchCollections()
  }, [])

  const fetchCollections = async () => {
    try {
      const response = await fetch('/api/collections')
      const data = await response.json()
      setCollections(data.collections || [])
    } catch (error) {
      console.error('Failed to fetch collections:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible de charger vos collections',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCollection = async () => {
    try {
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCollection)
      })

      if (response.ok) {
        toast({
          title: 'Collection créée',
          description: 'Votre collection a été créée avec succès'
        })
        setIsCreating(false)
        setNewCollection({ name: '', description: '', isPublic: true })
        fetchCollections()
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la collection',
        variant: 'destructive'
      })
    }
  }

  const handleDeleteCollection = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette collection ?')) return

    try {
      const response = await fetch(`/api/collections/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: 'Collection supprimée',
          description: 'La collection a été supprimée'
        })
        fetchCollections()
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la collection',
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
          <h1 className="text-3xl font-bold">Mes collections</h1>
          <p className="text-muted-foreground">Organisez vos livres par thème ou sujet</p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle collection
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une nouvelle collection</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nom</label>
                <Input
                  placeholder="Ex: Mes livres préférés"
                  value={newCollection.name}
                  onChange={(e) => setNewCollection({ ...newCollection, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Décrivez votre collection..."
                  value={newCollection.description}
                  onChange={(e) => setNewCollection({ ...newCollection, description: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={newCollection.isPublic}
                  onChange={(e) => setNewCollection({ ...newCollection, isPublic: e.target.checked })}
                />
                <label htmlFor="isPublic" className="text-sm">Collection publique</label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreateCollection}>
                Créer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {collections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection: any) => (
            <Card key={collection.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{collection.name}</CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => router.push(`/collections/${collection.id}`)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteCollection(collection.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                {collection.description && (
                  <CardDescription>{collection.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {collection.books?.length || 0} livres
                  </Badge>
                  {collection.isPublic && (
                    <Badge variant="outline">Public</Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground">
                Créée le {new Date(collection.createdAt).toLocaleDateString('fr-FR')}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <FolderOpen className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">Aucune collection</h3>
              <p className="text-muted-foreground">
                Créez votre première collection pour organiser vos livres
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}