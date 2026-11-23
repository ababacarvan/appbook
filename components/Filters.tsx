"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { X } from 'lucide-react'

interface FiltersProps {
  filters: {
    search: string
    type: string
    category: string
    language: string
    sort: string
    price: string
    order?: string
  }
  onFilterChange: (filters: any) => void
}

export function Filters({ filters, onFilterChange }: FiltersProps) {
  const [categories, setCategories] = useState<Array<{ id: string; name: string; icon: string | null }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (key: string, value: any) => {
    const updated = { ...filters, [key]: value }
    onFilterChange(updated)
  }

  const handleReset = () => {
    const reset = {
      search: '',
      type: 'all',
      category: '',
      language: '',
      sort: 'createdAt',
      price: '',
      order: 'desc'
    }
    onFilterChange(reset)
  }

  const languages = [
    { value: '', label: 'Toutes les langues' },
    { value: 'fr', label: 'Français' },
    { value: 'en', label: 'Anglais' },
    { value: 'es', label: 'Espagnol' },
    { value: 'ar', label: 'Arabe' },
    { value: 'pt', label: 'Portugais' },
    { value: 'sw', label: 'Swahili' }
  ]

  const sortOptions = [
    { value: 'createdAt', label: 'Date de publication' },
    { value: 'title', label: 'Titre' },
    { value: 'views', label: 'Popularité' },
    { value: 'price', label: 'Prix' }
  ]

  const typeOptions = [
    { value: 'all', label: 'Tous les types' },
    { value: 'EBOOK', label: 'Ebook' },
    { value: 'AUDIOBOOK', label: 'Livre audio' },
    { value: 'BD', label: 'Bande dessinée' },
    { value: 'PODCAST', label: 'Podcast' },
    { value: 'DOCUMENT', label: 'Document' }
  ]

  const priceOptions = [
    { value: '', label: 'Tous' },
    { value: 'free', label: 'Gratuit' },
    { value: 'premium', label: 'Premium' }
  ]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Filtres</CardTitle>
        <Button variant="ghost" size="sm" onClick={handleReset}>
          <X className="h-4 w-4 mr-1" />
          Réinitialiser
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Langue */}
        <div className="space-y-2">
          <Label>Langue</Label>
          <Select
            value={filters.language || ''}
            onValueChange={(value) => handleChange('language', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Toutes les langues" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Catégorie */}
        <div className="space-y-2">
          <Label>Catégorie</Label>
          <Select
            value={filters.category || ''}
            onValueChange={(value) => handleChange('category', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Toutes les catégories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toutes les catégories</SelectItem>
              {!loading && categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Type */}
        <div className="space-y-2">
          <Label>Type</Label>
          <Select
            value={filters.type || 'all'}
            onValueChange={(value) => handleChange('type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tous les types" />
            </SelectTrigger>
            <SelectContent>
              {typeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Trier par */}
        <div className="space-y-2">
          <Label>Trier par</Label>
          <Select
            value={filters.sort || 'createdAt'}
            onValueChange={(value) => handleChange('sort', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Prix */}
        <div className="space-y-2">
          <Label>Prix</Label>
          <div className="flex gap-2">
            {priceOptions.map((option) => (
              <Button
                key={option.value}
                variant={filters.price === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleChange('price', option.value)}
                className="flex-1"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}