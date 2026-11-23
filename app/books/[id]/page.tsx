"use client"

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { useToast } from '@/hooks/use-toast'
import { 
  Heart, 
  BookOpen, 
  Headphones, 
  Download, 
  Share2, 
  Star,
  Clock,
  Calendar,
  Users,
  Play,
  Pause,
  Plus,
  FileText,
  Music,
  Image as ImageIcon,
  Video,
  File,
  CheckCircle,
  Loader2,
  ArrowLeft,
  ShoppingCart,
  Eye,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Zap
} from 'lucide-react'
import { formatDate, formatDuration, getContentTypeIcon } from '@/lib/utils'

export default function BookDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [book, setBook] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isInLibrary, setIsInLibrary] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [user, setUser] = useState<any>(null)
  
  // Audio player states
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (params.id) {
      fetchBook()
      checkUserInteractions()
      getCurrentUser()
    }
  }, [params.id])

  const getCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/user')
      const data = await response.json()
      setUser(data.user)
    } catch (error) {
      console.error('Failed to get user:', error)
    }
  }

  const fetchBook = async () => {
    try {
      const response = await fetch(`/api/books/${params.id}`)
      const data = await response.json()
      setBook(data)
      
      if (data.author && data.author.id) {
        setIsOwner(user?.id === data.author.id)
      }
      
      if (data.type === 'AUDIOBOOK' || data.type === 'PODCAST') {
        if (data.duration) {
          setDuration(data.duration)
        }
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

  const checkUserInteractions = async () => {
    try {
      const favRes = await fetch(`/api/favorites?bookId=${params.id}`)
      if (favRes.ok) {
        const data = await favRes.json()
        setIsFavorite(data.isFavorite || false)
      }

      const libRes = await fetch(`/api/library?bookId=${params.id}`)
      if (libRes.ok) {
        const data = await libRes.json()
        setIsInLibrary(data.inLibrary || false)
      }
    } catch (error) {
      console.error('Failed to check interactions:', error)
    }
  }

  // Audio controls
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleSeek = (value: number[]) => {
    const time = value[0]
    setCurrentTime(time)
    if (audioRef.current) {
      audioRef.current.currentTime = time
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const vol = value[0]
    setVolume(vol)
    if (audioRef.current) {
      audioRef.current.volume = vol
    }
    setIsMuted(vol === 0)
  }

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const skipForward = () => {
    const time = Math.min(currentTime + 30, duration)
    handleSeek([time])
  }

  const skipBackward = () => {
    const time = Math.max(currentTime - 15, 0)
    handleSeek([time])
  }

  const handleAddToLibrary = async () => {
    if (!user) {
      toast({
        title: 'Connectez-vous',
        description: 'Vous devez être connecté pour ajouter à votre bibliothèque',
        variant: 'destructive'
      })
      router.push('/login')
      return
    }

    try {
      const response = await fetch('/api/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: params.id })
      })
      
      if (response.ok) {
        setIsInLibrary(true)
        toast({
          title: 'Ajouté à la bibliothèque',
          description: 'Le livre a été ajouté à votre bibliothèque'
        })
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter à la bibliothèque',
        variant: 'destructive'
      })
    }
  }

  const handleToggleFavorite = async () => {
    if (!user) {
      toast({
        title: 'Connectez-vous',
        description: 'Vous devez être connecté pour ajouter aux favoris',
        variant: 'destructive'
      })
      router.push('/login')
      return
    }

    try {
      const response = await fetch('/api/favorites', {
        method: isFavorite ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: params.id })
      })
      
      if (response.ok) {
        setIsFavorite(!isFavorite)
        toast({
          title: isFavorite ? 'Retiré des favoris' : 'Ajouté aux favoris'
        })
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue',
        variant: 'destructive'
      })
    }
  }

  const handleRead = () => {
    if (!user) {
      toast({
        title: 'Connectez-vous',
        description: 'Vous devez être connecté pour lire ce livre',
        variant: 'destructive'
      })
      router.push('/login')
      return
    }

    if (book.fileFormat === 'PDF') {
      router.push(`/reader/${params.id}`)
    } else if (book.fileFormat === 'EPUB') {
      router.push(`/reader/epub/${params.id}`)
    } else if (book.fileUrl) {
      window.open(book.fileUrl, '_blank')
    } else {
      toast({
        title: 'Erreur',
        description: 'Aucun fichier disponible pour la lecture',
        variant: 'destructive'
      })
    }
  }

  const handleListen = () => {
    if (!user) {
      toast({
        title: 'Connectez-vous',
        description: 'Vous devez être connecté pour écouter ce livre',
        variant: 'destructive'
      })
      router.push('/login')
      return
    }

    if (book.fileUrl) {
      router.push(`/player/${params.id}`)
    } else {
      toast({
        title: 'Erreur',
        description: 'Aucun fichier audio disponible',
        variant: 'destructive'
      })
    }
  }

  const handleDownload = () => {
    if (!user) {
      toast({
        title: 'Connectez-vous',
        description: 'Vous devez être connecté pour télécharger',
        variant: 'destructive'
      })
      router.push('/login')
      return
    }

    if (book.fileUrl) {
      const link = document.createElement('a')
      link.href = book.fileUrl
      link.download = `${book.title}.${book.fileFormat?.toLowerCase() || 'pdf'}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast({
        title: 'Téléchargement',
        description: 'Le téléchargement a commencé'
      })
    } else {
      toast({
        title: 'Erreur',
        description: 'Aucun fichier disponible pour le téléchargement',
        variant: 'destructive'
      })
    }
  }

  const handlePreview = () => {
    if (book.fileUrl) {
      window.open(book.fileUrl, '_blank')
    }
  }

  const handleFollowAuthor = async () => {
    if (!user) {
      toast({
        title: 'Connectez-vous',
        description: 'Vous devez être connecté pour suivre un auteur',
        variant: 'destructive'
      })
      router.push('/login')
      return
    }

    try {
      const response = await fetch('/api/authors/follow', {
        method: isFollowing ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorId: book.author?.id })
      })

      if (response.ok) {
        setIsFollowing(!isFollowing)
        toast({
          title: isFollowing ? 'Auteur retiré des suivis' : 'Auteur suivi',
          description: isFollowing ? 'Vous ne suivez plus cet auteur' : 'Vous suivez maintenant cet auteur'
        })
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de suivre cet auteur',
        variant: 'destructive'
      })
    }
  }

  const handleBuy = () => {
    router.push(`/checkout?bookId=${params.id}`)
  }

  const renderAudioPlayer = () => {
    if (!book.fileUrl || (book.type !== 'AUDIOBOOK' && book.type !== 'PODCAST')) return null

    return (
      <div className="mt-4 p-4 border rounded-lg bg-muted/20">
        <audio
          ref={audioRef}
          src={book.fileUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          className="hidden"
        />
        
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{formatDuration(Math.floor(currentTime))}</span>
              <span>{formatDuration(Math.floor(duration))}</span>
            </div>
            <Slider
              value={[currentTime]}
              onValueChange={handleSeek}
              max={duration || 100}
              step={1}
              className="cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-center gap-4">
            <Button variant="ghost" size="icon" onClick={skipBackward}>
              <SkipBack className="h-5 w-5" />
            </Button>

            <Button 
              size="lg" 
              className="h-12 w-12 rounded-full"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6 ml-1" />
              )}
            </Button>

            <Button variant="ghost" size="icon" onClick={skipForward}>
              <SkipForward className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-2 ml-4">
              <Button variant="ghost" size="icon" onClick={toggleMute}>
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                onValueChange={handleVolumeChange}
                max={1}
                step={0.01}
                className="w-20"
              />
            </div>
          </div>
        </div>
      </div>
    )
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
          <h2 className="text-2xl font-bold mb-2">Livre non trouvé</h2>
          <p className="text-muted-foreground">Ce livre n'existe pas ou a été supprimé</p>
          <Button className="mt-4" onClick={() => router.push('/books')}>
            Retour à la bibliothèque
          </Button>
        </div>
      </div>
    )
  }

  const typeIcon = getContentTypeIcon(book.type)
  const isAudio = book.type === 'AUDIOBOOK' || book.type === 'PODCAST'
  const isVideo = book.type === 'VIDEO'
  const isBD = book.type === 'BD'
  const isDocument = book.type === 'DOCUMENT' || book.type === 'MAGAZINE' || book.type === 'JOURNAL'
  const isEbook = book.type === 'EBOOK'

  // Déterminer si l'utilisateur peut accéder au contenu
  const canAccess = book.canAccess || book.isFree || book.price === 0 || isInLibrary || isOwner
  const needsPurchase = !canAccess && book.price > 0

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button */}
      <div className="container mx-auto px-4 pt-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
      </div>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-background py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Cover Image */}
            <div className="flex-shrink-0 mx-auto md:mx-0">
              <div className="relative w-48 md:w-64 aspect-[3/4] rounded-lg overflow-hidden shadow-xl">
                {book.coverImage ? (
                  <Image
                    src={book.coverImage}
                    alt={book.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-primary/20 to-background">
                    <span className="text-6xl">{typeIcon}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Book Info */}
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {book.isFree && (
                  <Badge variant="success" className="bg-green-500">Gratuit</Badge>
                )}
                {book.isPremium && (
                  <Badge variant="warning" className="bg-yellow-500">Premium</Badge>
                )}
                <Badge variant="secondary">
                  {typeIcon} {book.type}
                </Badge>
                {book.status === 'PUBLISHED' && (
                  <Badge variant="success" className="bg-green-500">Publié</Badge>
                )}
                {isOwner && (
                  <Badge variant="default" className="bg-blue-500">Votre livre</Badge>
                )}
                {isInLibrary && (
                  <Badge variant="default" className="bg-purple-500">Dans ma bibliothèque</Badge>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold">{book.title}</h1>
              {book.subtitle && (
                <p className="text-lg text-muted-foreground">{book.subtitle}</p>
              )}

              <div className="flex flex-wrap items-center gap-4">
                <Link href={`/authors/${book.author?.id}`} className="flex items-center gap-2 hover:underline">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={book.author?.avatar} />
                    <AvatarFallback>{book.author?.name?.[0] || 'A'}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{book.author?.name || 'Auteur inconnu'}</span>
                </Link>
                {book.author?.isVerified && (
                  <Badge variant="secondary" className="text-xs">✓ Vérifié</Badge>
                )}
                {book.author && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleFollowAuthor}
                  >
                    {isFollowing ? 'Suivi' : 'Suivre'}
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {book.pageCount && (
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {book.pageCount} pages
                  </span>
                )}
                {book.duration && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatDuration(book.duration)}
                  </span>
                )}
                {book.publicationYear && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {book.publicationYear}
                  </span>
                )}
                {book.language && (
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {book.language.toUpperCase()}
                  </span>
                )}
                {book.views > 0 && (
                  <span className="flex items-center gap-1">
                    👁️ {book.views} vues
                  </span>
                )}
                {book.downloads > 0 && (
                  <span className="flex items-center gap-1">
                    ⬇️ {book.downloads} téléchargements
                  </span>
                )}
              </div>

              {book.averageRating > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                    <span className="ml-1 font-semibold">{book.averageRating.toFixed(1)}</span>
                  </div>
                  <span className="text-muted-foreground">
                    ({book.reviewsCount || 0} avis)
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4">
                {/* Boutons de lecture */}
                {canAccess && book.fileUrl && (
                  <>
                    {isAudio && (
                      <Button size="lg" onClick={handleListen}>
                        <Headphones className="mr-2 h-5 w-5" />
                        Écouter
                      </Button>
                    )}
                    {(isEbook || isDocument) && (
                      <Button size="lg" onClick={handleRead}>
                        <BookOpen className="mr-2 h-5 w-5" />
                        Lire
                      </Button>
                    )}
                    {isBD && (
                      <Button size="lg" onClick={() => router.push(`/reader/bd/${params.id}`)}>
                        <ImageIcon className="mr-2 h-5 w-5" />
                        Voir la BD
                      </Button>
                    )}
                    {isVideo && (
                      <Button size="lg" onClick={() => router.push(`/player/${params.id}`)}>
                        <Video className="mr-2 h-5 w-5" />
                        Regarder
                      </Button>
                    )}
                  </>
                )}
                
                {/* Bouton Acheter */}
                {needsPurchase && (
                  <Button 
                    size="lg" 
                    onClick={handleBuy}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Acheter {book.price} FCFA
                  </Button>
                )}

                {/* Bouton S'abonner Premium */}
                {book.isPremium && !canAccess && (
                  <Button 
                    size="lg"
                    onClick={() => router.push('/pricing')}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    <Zap className="mr-2 h-5 w-5" />
                    S'abonner Premium
                  </Button>
                )}

                {/* Téléchargement */}
                {canAccess && book.fileUrl && (
                  <Button variant="outline" size="lg" onClick={handleDownload}>
                    <Download className="mr-2 h-5 w-5" />
                    Télécharger
                  </Button>
                )}

                {/* Ajouter à la bibliothèque */}
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleAddToLibrary}
                  disabled={isInLibrary}
                >
                  <Plus className="mr-2 h-5 w-5" />
                  {isInLibrary ? 'Dans ma bibliothèque' : 'Ajouter'}
                </Button>

                {/* Favoris */}
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleToggleFavorite}
                >
                  <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>

                {/* Partager */}
                <Button variant="outline" size="lg" onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                  toast({ title: 'Lien copié !' })
                }}>
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>

              {/* Fichier info */}
              {book.fileUrl && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <File className="h-4 w-4" />
                  <span>Fichier: {book.fileFormat || 'Inconnu'}</span>
                  {book.fileSize && (
                    <span>• {Math.round(book.fileSize / 1024)} KB</span>
                  )}
                  {canAccess && (
                    <span>• <CheckCircle className="h-4 w-4 text-green-500 inline" /> Disponible</span>
                  )}
                </div>
              )}

              {/* Audio Player Intégré */}
              {isAudio && book.fileUrl && canAccess && renderAudioPlayer()}

              {/* Message si non accessible */}
              {!canAccess && !needsPurchase && book.isPremium && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800">
                    ⚠️ Ce livre est premium. <Link href="/pricing" className="underline font-medium">Abonnez-vous</Link> pour y accéder.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="description" className="space-y-6">
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="details">Détails</TabsTrigger>
            {(isAudio || book.type === 'PODCAST') && (
              <TabsTrigger value="chapters">Chapitres</TabsTrigger>
            )}
            <TabsTrigger value="reviews">Avis ({book.reviewsCount || 0})</TabsTrigger>
            <TabsTrigger value="similar">Similaires</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="space-y-4">
            <div className="prose max-w-none">
              <p>{book.description || 'Aucune description disponible'}</p>
            </div>
            
            {book.categories && book.categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium">Catégories:</span>
                {book.categories.map((bc: any) => (
                  <Link key={bc.category.id} href={`/books?category=${bc.category.id}`}>
                    <Badge variant="secondary" className="cursor-pointer hover:bg-primary/20">
                      {bc.category.icon} {bc.category.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
            
            {book.tags && book.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium">Tags:</span>
                {book.tags.map((bt: any) => (
                  <Link key={bt.tag.id} href={`/books?tag=${bt.tag.id}`}>
                    <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                      #{bt.tag.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="details">
            <Card>
              <CardContent className="space-y-3 pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Titre</p>
                    <p className="font-medium">{book.title}</p>
                  </div>
                  {book.subtitle && (
                    <div>
                      <p className="text-sm text-muted-foreground">Sous-titre</p>
                      <p className="font-medium">{book.subtitle}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Auteur</p>
                    <p className="font-medium">{book.author?.name}</p>
                  </div>
                  {book.publisher && (
                    <div>
                      <p className="text-sm text-muted-foreground">Éditeur</p>
                      <p className="font-medium">{book.publisher}</p>
                    </div>
                  )}
                  {book.isbn && (
                    <div>
                      <p className="text-sm text-muted-foreground">ISBN</p>
                      <p className="font-medium">{book.isbn}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Langue</p>
                    <p className="font-medium">{book.language?.toUpperCase()}</p>
                  </div>
                  {book.publicationYear && (
                    <div>
                      <p className="text-sm text-muted-foreground">Année</p>
                      <p className="font-medium">{book.publicationYear}</p>
                    </div>
                  )}
                  {book.pageCount && (
                    <div>
                      <p className="text-sm text-muted-foreground">Pages</p>
                      <p className="font-medium">{book.pageCount}</p>
                    </div>
                  )}
                  {book.duration && (
                    <div>
                      <p className="text-sm text-muted-foreground">Durée</p>
                      <p className="font-medium">{formatDuration(book.duration)}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-medium">{book.type}</p>
                  </div>
                  {book.fileSize && (
                    <div>
                      <p className="text-sm text-muted-foreground">Taille du fichier</p>
                      <p className="font-medium">{Math.round(book.fileSize / 1024)} KB</p>
                    </div>
                  )}
                  {book.fileFormat && (
                    <div>
                      <p className="text-sm text-muted-foreground">Format</p>
                      <p className="font-medium">{book.fileFormat}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Statut</p>
                    <p className="font-medium">
                      <Badge variant={book.status === 'PUBLISHED' ? 'success' : 'secondary'}>
                        {book.status}
                      </Badge>
                    </p>
                  </div>
                  {book.views !== undefined && (
                    <div>
                      <p className="text-sm text-muted-foreground">Vues</p>
                      <p className="font-medium">{book.views}</p>
                    </div>
                  )}
                  {book.downloads !== undefined && (
                    <div>
                      <p className="text-sm text-muted-foreground">Téléchargements</p>
                      <p className="font-medium">{book.downloads}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {(isAudio || book.type === 'PODCAST') && (
            <TabsContent value="chapters">
              {book.audioChapters && book.audioChapters.length > 0 ? (
                <div className="space-y-2">
                  {book.audioChapters.map((chapter: any) => (
                    <div key={chapter.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">{chapter.order}.</span>
                        <span>{chapter.title}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatDuration(chapter.duration)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Aucun chapitre disponible</p>
              )}
            </TabsContent>
          )}

          <TabsContent value="reviews">
            {book.reviews && book.reviews.length > 0 ? (
              <div className="space-y-4">
                {book.reviews.map((review: any) => (
                  <Card key={review.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar>
                          <AvatarImage src={review.user?.avatar} />
                          <AvatarFallback>{review.user?.name?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{review.user?.name || 'Anonyme'}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(new Date(review.createdAt))}
                          </p>
                        </div>
                        <div className="ml-auto flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? 'fill-yellow-500 text-yellow-500'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-muted-foreground">{review.comment}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Aucun avis pour ce livre</p>
                <Button className="mt-4" onClick={() => {
                  if (!user) {
                    toast({
                      title: 'Connectez-vous',
                      description: 'Vous devez être connecté pour donner un avis',
                      variant: 'destructive'
                    })
                    router.push('/login')
                    return
                  }
                  router.push(`/reviews/new?bookId=${params.id}`)
                }}>
                  Donner mon avis
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="similar">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Recommandations similaires à venir...</p>
              <p className="text-sm text-muted-foreground mt-2">
                Explorez d'autres livres dans les mêmes catégories
              </p>
              {book.categories && book.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center mt-4">
                  {book.categories.map((bc: any) => (
                    <Link key={bc.category.id} href={`/books?category=${bc.category.id}`}>
                      <Button variant="outline" size="sm">
                        {bc.category.icon} {bc.category.name}
                      </Button>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}