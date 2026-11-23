"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { 
  ChevronLeft, 
  ChevronRight,
  Settings,
  Bookmark,
  Search,
  Moon,
  Sun,
  Type,
  Maximize2,
  Minimize2,
  Home,
  List,
  X,
  Loader2
} from 'lucide-react'
import { Document, Page, pdfjs } from 'react-pdf'

// Configuration du worker PDF
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

export default function ReaderPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [book, setBook] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(1)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [showToc, setShowToc] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [bookmarks, setBookmarks] = useState<number[]>([])
  const [progress, setProgress] = useState(0)
  const [pdfFile, setPdfFile] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchBook()
      loadProgress()
      loadBookmarks()
    }
  }, [params.id])

  const fetchBook = async () => {
    try {
      const response = await fetch(`/api/books/${params.id}`)
      const data = await response.json()
      setBook(data)
      
      // Si le livre a un fichier PDF
      if (data.fileUrl && data.fileFormat === 'PDF') {
        setPdfFile(data.fileUrl)
      } else if (data.fileUrl) {
        // Pour EPUB ou autres formats, utiliser le fichier direct
        setPdfFile(data.fileUrl)
      }
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

  const loadProgress = async () => {
    try {
      const response = await fetch(`/api/reading-progress?bookId=${params.id}`)
      if (response.ok) {
        const data = await response.json()
        if (data.progress) {
          setPageNumber(data.progress.currentPage || 1)
          setProgress(data.progress.percentage || 0)
        }
      }
    } catch (error) {
      console.error('Failed to load progress:', error)
    }
  }

  const loadBookmarks = async () => {
    try {
      const response = await fetch(`/api/bookmarks?bookId=${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setBookmarks(data.bookmarks || [])
      }
    } catch (error) {
      console.error('Failed to load bookmarks:', error)
    }
  }

  const saveProgress = async (page: number) => {
    try {
      const totalPages = numPages || 100
      const percentage = (page / totalPages) * 100
      await fetch('/api/reading-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId: params.id,
          currentPage: page,
          percentage
        })
      })
      setProgress(percentage)
    } catch (error) {
      console.error('Failed to save progress:', error)
    }
  }

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    // Si la page sauvegardée est plus grande que le nombre de pages, revenir à la page 1
    if (pageNumber > numPages) {
      setPageNumber(1)
    }
  }

  const goToPage = (page: number) => {
    if (page < 1) page = 1
    if (numPages && page > numPages) page = numPages
    setPageNumber(page)
    saveProgress(page)
  }

  const toggleBookmark = () => {
    setBookmarks(prev => {
      if (prev.includes(pageNumber)) {
        return prev.filter(p => p !== pageNumber)
      } else {
        return [...prev, pageNumber]
      }
    })
    toast({
      title: bookmarks.includes(pageNumber) ? 'Marque-page supprimé' : 'Marque-page ajouté'
    })
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  const toggleControls = () => {
    setShowControls(!showControls)
  }

  const zoomIn = () => setScale(prev => Math.min(prev + 0.25, 3))
  const zoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5))

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Livre non trouvé</h2>
          <Button onClick={() => router.push('/books')}>
            Retour à la bibliothèque
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={cn(
        "min-h-screen transition-colors duration-300",
        isDarkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"
      )}
    >
      {/* Reader Toolbar */}
      <div 
        className={cn(
          "fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b transition-transform duration-300",
          showControls ? "translate-y-0" : "-translate-y-full"
        )}
      >
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.push(`/books/${params.id}`)}>
              <Home className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setShowToc(!showToc)}>
              <List className="h-5 w-5" />
            </Button>
            <span className="text-sm font-medium line-clamp-1 max-w-[200px]">
              {book.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setShowSearch(!showSearch)}>
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleBookmark}>
              <Bookmark className={cn(
                "h-5 w-5",
                bookmarks.includes(pageNumber) && "fill-primary text-primary"
              )} />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsDarkMode(!isDarkMode)}>
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={zoomOut}>
              <Minimize2 className="h-5 w-5" />
            </Button>
            <span className="text-sm">{Math.round(scale * 100)}%</span>
            <Button variant="ghost" size="icon" onClick={zoomIn}>
              <Maximize2 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
              <Maximize2 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleControls}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="border-t p-2 bg-background/95">
            <div className="container mx-auto flex gap-2">
              <input
                type="text"
                placeholder="Rechercher dans le livre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-md bg-background"
                onKeyDown={(e) => e.key === 'Enter' && toast({ title: 'Recherche: ' + searchQuery })}
              />
              <Button onClick={() => toast({ title: 'Recherche: ' + searchQuery })}>
                Rechercher
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setShowSearch(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* TOC Sidebar */}
      <div 
        className={cn(
          "fixed left-0 top-0 bottom-0 z-40 w-72 bg-background border-r transform transition-transform duration-300 overflow-y-auto",
          showToc ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Table des matières</h3>
            <Button variant="ghost" size="icon" onClick={() => setShowToc(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {numPages && Array.from({ length: Math.min(numPages, 50) }).map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  goToPage(i + 1)
                  setShowToc(false)
                }}
                className={cn(
                  "w-full text-left px-3 py-2 rounded hover:bg-muted transition-colors",
                  pageNumber === i + 1 && "bg-muted font-medium"
                )}
              >
                Page {i + 1}
                {bookmarks.includes(i + 1) && (
                  <Bookmark className="inline-block ml-2 h-3 w-3 fill-primary text-primary" />
                )}
              </button>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {bookmarks.length} marque-pages
            </div>
          </div>
        </div>
      </div>

      {/* Reader Content */}
      <div 
        className={cn(
          "container max-w-4xl mx-auto px-4 pt-20 pb-32 transition-all duration-300",
          showToc && "ml-72"
        )}
      >
        <div className="flex justify-center">
          {pdfFile ? (
            <Document
              file={pdfFile}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<Loader2 className="h-8 w-8 animate-spin text-primary" />}
              error={
                <div className="text-center py-12">
                  <p className="text-red-500">Erreur de chargement du PDF</p>
                  <Button className="mt-4" onClick={() => window.open(pdfFile, '_blank')}>
                    Ouvrir le PDF directement
                  </Button>
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                renderTextLayer={true}
                renderAnnotationLayer={false}
                className={cn(
                  "shadow-lg",
                  isDarkMode ? "filter invert" : ""
                )}
              />
            </Document>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Aucun fichier PDF disponible</p>
              {book.fileUrl && (
                <Button className="mt-4" onClick={() => window.open(book.fileUrl, '_blank')}>
                  Ouvrir le fichier
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Page Navigation */}
        <div className="fixed bottom-16 left-0 right-0 px-4">
          <div className="container max-w-3xl mx-auto">
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="outline"
                onClick={() => goToPage(pageNumber - 1)}
                disabled={pageNumber <= 1}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Précédent
              </Button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {pageNumber} / {numPages || '...'}
                </span>
                <div className="w-32 h-1 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => goToPage(pageNumber + 1)}
                disabled={numPages ? pageNumber >= numPages : false}
              >
                Suivant
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div 
        className={cn(
          "fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t transition-transform duration-300",
          showControls ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="container mx-auto px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Page {pageNumber}
            </span>
            <input
              type="number"
              value={pageNumber}
              onChange={(e) => {
                const page = parseInt(e.target.value)
                if (!isNaN(page) && page > 0) {
                  goToPage(page)
                }
              }}
              className="w-16 text-center border rounded px-2 py-1 text-sm bg-background"
              min={1}
              max={numPages || 100}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowControls(!showControls)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}