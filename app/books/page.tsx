"use client"

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { BookGrid } from '@/components/BookGrid'
import { SearchBar } from '@/components/SearchBar'
import { Filters } from '@/components/Filters'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function BooksPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({ 
    page: 1, 
    total: 0, 
    pages: 0,
    limit: 20
  })
  const [filters, setFilters] = useState({
    search: searchParams?.get('search') || '',
    type: searchParams?.get('type') || 'all',
    category: searchParams?.get('category') || '',
    language: searchParams?.get('language') || '',
    sort: searchParams?.get('sort') || 'createdAt',
    price: searchParams?.get('price') || '',
    order: 'desc'
  })

  const fetchBooks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.append('page', pagination.page.toString())
      params.append('limit', pagination.limit.toString())
      
      if (filters.search) params.append('search', filters.search)
      if (filters.type && filters.type !== 'all') params.append('type', filters.type)
      if (filters.category) params.append('category', filters.category)
      if (filters.language) params.append('language', filters.language)
      if (filters.sort) params.append('sort', filters.sort)
      if (filters.price) params.append('price', filters.price)
      
      const response = await fetch(`/api/books?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      setBooks(data.books || [])
      setPagination(prev => ({
        ...prev,
        total: data.pagination?.total || 0,
        pages: data.pagination?.pages || 0
      }))
    } catch (error) {
      console.error('Failed to fetch books:', error)
      setError(error instanceof Error ? error.message : 'Une erreur est survenue')
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les livres',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [pagination.page, filters, toast])

  useEffect(() => {
    fetchBooks()
  }, [fetchBooks])

  const handleSearch = (search: string) => {
    setFilters({ ...filters, search })
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleFilterChange = (newFilters: any) => {
    setFilters({ ...filters, ...newFilters })
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleRetry = () => {
    fetchBooks()
  }

  // Rendu du statut de chargement initial
  if (loading && books.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Chargement des livres...</p>
          </div>
        </div>
      </div>
    )
  }

  // Rendu de l'erreur
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Une erreur est survenue</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={handleRetry}>Réessayer</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Bibliothèque</h1>
      
      <div className="mb-8">
        <SearchBar 
          onSearch={handleSearch} 
          initialValue={filters.search}
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 flex-shrink-0">
          <Filters 
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </aside>

        <main className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <Tabs 
              defaultValue="all" 
              value={filters.type}
              onValueChange={(value) => handleFilterChange({ type: value })}
            >
              <TabsList>
                <TabsTrigger value="all">Tous</TabsTrigger>
                <TabsTrigger value="EBOOK">Livres</TabsTrigger>
                <TabsTrigger value="AUDIOBOOK">Audio</TabsTrigger>
                <TabsTrigger value="BD">BD</TabsTrigger>
                <TabsTrigger value="PODCAST">Podcasts</TabsTrigger>
                <TabsTrigger value="DOCUMENT">Documents</TabsTrigger>
              </TabsList>
            </Tabs>
            <span className="text-sm text-muted-foreground">
              {pagination.total} livre{pagination.total > 1 ? 's' : ''}
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {books.length > 0 ? (
                <>
                  <BookGrid books={books} />
                  
                  {pagination.pages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                      >
                        Précédent
                      </Button>
                      <span className="text-sm">
                        Page {pagination.page} sur {pagination.pages}
                      </span>
                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.pages}
                      >
                        Suivant
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <BookOpen className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Aucun livre trouvé</h3>
                  <p className="text-muted-foreground">
                    Aucun livre ne correspond à vos critères de recherche.
                    Essayez de modifier vos filtres.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setFilters({
                        search: '',
                        type: 'all',
                        category: '',
                        language: '',
                        sort: 'createdAt',
                        price: '',
                        order: 'desc'
                      })
                      setPagination(prev => ({ ...prev, page: 1 }))
                    }}
                  >
                    Réinitialiser les filtres
                  </Button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}

// Importer BookOpen
import { BookOpen } from 'lucide-react'