"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchResult {
  id: string
  title: string
  type: string
  coverImage?: string
  author?: {
    name: string
  }
}

export function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.length >= 2) {
        searchBooks()
      } else {
        setResults([])
        setShowResults(false)
      }
    }, 300)

    return () => clearTimeout(delayDebounce)
  }, [query])

  const searchBooks = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/books?search=${encodeURIComponent(query)}&limit=5`)
      const data = await response.json()
      setResults(data.books || [])
      setShowResults(true)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/books?search=${encodeURIComponent(query)}`)
      setShowResults(false)
    }
  }

  const handleResultClick = (id: string) => {
    router.push(`/books/${id}`)
    setShowResults(false)
    setQuery('')
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    setShowResults(false)
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Rechercher des livres, auteurs, catégories..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          className="pl-10 pr-20 h-12"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-16 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <Button
          type="submit"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-10"
          disabled={!query.trim()}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Rechercher'}
        </Button>
      </form>

      {/* Results dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            {results.map((result) => (
              <button
                key={result.id}
                onClick={() => handleResultClick(result.id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left"
              >
                <div className="w-10 h-14 bg-muted rounded flex items-center justify-center flex-shrink-0">
                  {result.coverImage ? (
                    <img src={result.coverImage} alt={result.title} className="w-full h-full object-cover rounded" />
                  ) : (
                    <span className="text-xl">📖</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{result.title}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {result.author?.name || 'Auteur inconnu'} • {result.type}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </button>
            ))}
          </div>
          <div className="border-t p-2 bg-muted/50">
            <Button 
              variant="ghost" 
              className="w-full justify-center text-sm"
              onClick={() => router.push(`/books?search=${encodeURIComponent(query)}`)}
            >
              Voir tous les résultats
            </Button>
          </div>
        </div>
      )}

      {showResults && results.length === 0 && query.length >= 2 && !loading && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50 p-6 text-center">
          <p className="text-muted-foreground">Aucun résultat trouvé pour "{query}"</p>
        </div>
      )}
    </div>
  )
}