"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { FolderOpen, BookOpen, Loader2, ChevronRight } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  parentId: string | null
  bookCount: number
  books?: Array<{
    id: string
    title: string
    coverImage: string | null
    type: string
  }>
  children?: Category[]
}

export default function CategoriesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/categories')
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des catégories')
      }
      
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      setError('Impossible de charger les catégories')
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les catégories',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-2">Erreur</h2>
          <p className="text-muted-foreground">{error}</p>
          <button 
            onClick={fetchCategories}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  // Grouper les catégories par parent
  const mainCategories = categories.filter(c => !c.parentId)
  const subCategories = categories.filter(c => c.parentId)

  // Catégories avec des livres
  const categoriesWithBooks = categories.filter(c => (c.bookCount || 0) > 0)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Catégories</h1>
        <p className="text-muted-foreground">Explorez notre catalogue par catégorie</p>
        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
          <span>{categories.length} catégories</span>
          <span>•</span>
          <span>{categoriesWithBooks.length} avec des livres</span>
        </div>
      </div>

      {categories.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <FolderOpen className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">Aucune catégorie</h3>
              <p className="text-muted-foreground">
                Aucune catégorie n'est encore disponible
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mainCategories.map((category) => {
            const children = subCategories.filter(c => c.parentId === category.id)
            const hasBooks = (category.bookCount || 0) > 0
            
            return (
              <Card 
                key={category.id} 
                className={`p-6 hover:shadow-lg transition-shadow cursor-pointer ${!hasBooks ? 'opacity-60' : ''}`}
                onClick={() => router.push(`/books?category=${category.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{category.icon || '📚'}</span>
                    <div>
                      <h3 className="font-semibold text-lg">{category.name}</h3>
                      {category.description && (
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      )}
                    </div>
                  </div>
                  <Badge variant={hasBooks ? 'default' : 'secondary'}>
                    {category.bookCount || 0} livre{category.bookCount !== 1 ? 's' : ''}
                  </Badge>
                </div>
                
                {children.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {children.slice(0, 5).map((child) => (
                      <Badge 
                        key={child.id} 
                        variant="outline" 
                        className="hover:bg-muted cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/books?category=${child.id}`)
                        }}
                      >
                        {child.icon} {child.name}
                      </Badge>
                    ))}
                    {children.length > 5 && (
                      <Badge variant="outline">+{children.length - 5}</Badge>
                    )}
                  </div>
                )}

                {hasBooks && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Voir les livres</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {/* Catégories populaires */}
      {categoriesWithBooks.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Catégories populaires</h2>
          <div className="flex flex-wrap gap-3">
            {categoriesWithBooks.slice(0, 12).map((category) => (
              <Link key={category.id} href={`/books?category=${category.id}`}>
                <Badge variant="secondary" className="text-sm py-2 px-4 hover:bg-primary/20 cursor-pointer">
                  {category.icon} {category.name} ({category.bookCount})
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}