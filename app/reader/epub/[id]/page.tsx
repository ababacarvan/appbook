"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

export default function EpubReaderPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [book, setBook] = useState<any>(null)
  const [content, setContent] = useState<string>('')
  const [currentSection, setCurrentSection] = useState(0)
  const [sections, setSections] = useState<string[]>([])

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
      
      // Pour un EPUB, on devrait parser le fichier
      // Ici on simule avec le contenu
      if (data.fileUrl) {
        // Simulation de contenu
        const simulatedContent = `
          <h1>${data.title}</h1>
          <p>${data.description || 'Aucune description'}</p>
          <p>Contenu du livre simulé. Dans une vraie implémentation, le fichier EPUB serait parsé.</p>
        `
        setSections([simulatedContent])
        setContent(simulatedContent)
      }
    } catch (error) {
      toast({ title: 'Erreur', variant: 'destructive' })
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
          <h2 className="text-2xl font-bold">Livre non trouvé</h2>
          <Button onClick={() => router.push('/books')}>Retour</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => router.push(`/books/${params.id}`)}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <h1 className="text-xl font-bold">{book.title}</h1>
          <div className="w-20" />
        </div>

        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content }} />

        <div className="flex justify-center gap-4 mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
            disabled={currentSection === 0}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Précédent
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentSection(Math.min(sections.length - 1, currentSection + 1))}
            disabled={currentSection === sections.length - 1}
          >
            Suivant
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}