"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

export default function BDReaderPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [book, setBook] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [pages, setPages] = useState<string[]>([])

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
      
      // Charger les pages de la BD
      if (data.bookPages && data.bookPages.length > 0) {
        setPages(data.bookPages.map((p: any) => p.imageUrl || p.fileUrl).filter(Boolean))
      }
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de charger la BD', variant: 'destructive' })
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

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">BD non trouvée</h2>
          <Button onClick={() => router.push('/books')}>Retour</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black/95">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" className="text-white" onClick={() => router.push(`/books/${params.id}`)}>
            ← Retour
          </Button>
          <h1 className="text-white font-bold">{book.title}</h1>
          <span className="text-white text-sm">
            {currentPage + 1} / {pages.length}
          </span>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <div className="flex-1 max-w-4xl relative aspect-[3/4]">
            {pages[currentPage] && (
              <img
                src={pages[currentPage]}
                alt={`Page ${currentPage + 1}`}
                className="w-full h-full object-contain"
              />
            )}
          </div>

          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setCurrentPage(Math.min(pages.length - 1, currentPage + 1))}
            disabled={currentPage === pages.length - 1}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: Math.min(pages.length, 20) }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === currentPage ? 'bg-white' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}