"use client"

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  List,
  Download,
  Heart,
  X,
  ChevronDown
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { formatDuration } from '@/lib/utils'
import { cn } from '@/lib/utils'

export default function PlayerPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [book, setBook] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [currentChapter, setCurrentChapter] = useState(0)
  const [showChapters, setShowChapters] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [progress, setProgress] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2]

  useEffect(() => {
    if (params.id) {
      fetchBook()
      loadProgress()
    }
  }, [params.id])

  const fetchBook = async () => {
    try {
      const response = await fetch(`/api/books/${params.id}`)
      const data = await response.json()
      setBook(data)
      if (data.duration) {
        setDuration(data.duration)
      }
    } catch (error) {
      console.error('Failed to fetch book:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible de charger le livre audio',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const loadProgress = async () => {
    try {
      // CORRECTION: Utiliser bookId comme paramètre d'URL
      const response = await fetch(`/api/listening-progress?bookId=${params.id}`)
      if (response.ok) {
        const data = await response.json()
        if (data.progress) {
          setCurrentTime(data.progress.position || 0)
          setProgress(data.progress.percentage || 0)
          if (data.progress.chapterId) {
            setCurrentChapter(parseInt(data.progress.chapterId) || 0)
          }
        }
      }
    } catch (error) {
      console.error('Failed to load progress:', error)
    }
  }

  const saveProgress = async (position: number) => {
    try {
      const percentage = duration > 0 ? (position / duration) * 100 : 0
      const response = await fetch('/api/listening-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId: params.id,
          position: Math.floor(position),
          percentage,
          chapterId: currentChapter !== undefined ? String(currentChapter) : null
        })
      })
      
      if (response.ok) {
        setProgress(percentage)
      }
    } catch (error) {
      console.error('Failed to save progress:', error)
    }
  }

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
      const time = audioRef.current.currentTime
      setCurrentTime(time)
      // Sauvegarder toutes les 5 secondes
      if (Math.floor(time) % 5 === 0 && time > 0) {
        saveProgress(time)
      }
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
    saveProgress(time)
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

  const changeSpeed = () => {
    const currentIndex = speeds.indexOf(playbackRate)
    const nextIndex = (currentIndex + 1) % speeds.length
    setPlaybackRate(speeds[nextIndex])
    if (audioRef.current) {
      audioRef.current.playbackRate = speeds[nextIndex]
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

  const changeChapter = (index: number) => {
    setCurrentChapter(index)
    handleSeek([0])
  }

  const toggleFavorite = async () => {
    try {
      const method = isFavorite ? 'DELETE' : 'POST'
      await fetch('/api/favorites', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: params.id })
      })
      setIsFavorite(!isFavorite)
      toast({
        title: isFavorite ? 'Retiré des favoris' : 'Ajouté aux favoris'
      })
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    }
  }

  const handleEnded = () => {
    if (currentChapter < (book?.audioChapters?.length || 1) - 1) {
      changeChapter(currentChapter + 1)
    } else {
      setIsPlaying(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Livre audio non trouvé</h2>
          <Button onClick={() => router.push('/books')}>
            Retour à la bibliothèque
          </Button>
        </div>
      </div>
    )
  }

  const chapters = book.audioChapters || [
    { id: '0', title: 'Chapitre 1', duration: duration / 3 },
    { id: '1', title: 'Chapitre 2', duration: duration / 3 },
    { id: '2', title: 'Chapitre 3', duration: duration / 3 }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <audio
        ref={audioRef}
        src={book.fileUrl || undefined}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => router.push(`/books/${params.id}`)}>
            <ChevronDown className="h-5 w-5 mr-2" />
            Retour
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleFavorite}>
            <Heart className={cn("h-6 w-6", isFavorite && "fill-red-500 text-red-500")} />
          </Button>
        </div>

        {/* Book Info */}
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-8">
          <div className="relative w-48 h-48 rounded-lg overflow-hidden shadow-xl flex-shrink-0">
            {book.coverImage ? (
              <Image
                src={book.coverImage}
                alt={book.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-primary/20 to-background">
                <span className="text-6xl">🎧</span>
              </div>
            )}
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold">{book.title}</h1>
            <p className="text-muted-foreground">{book.author?.name}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
              <Badge variant="secondary">{book.type}</Badge>
              {book.language && (
                <Badge variant="outline">{book.language.toUpperCase()}</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-4 line-clamp-2">
              {book.description}
            </p>
          </div>
        </div>

        {/* Player */}
        <div className="bg-card rounded-lg shadow-lg p-6">
          {/* Progress */}
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

          {/* Controls */}
          <div className="flex items-center justify-center gap-2 md:gap-4 mt-6">
            <Button variant="ghost" size="icon" onClick={changeSpeed} className="text-sm font-medium min-w-[40px]">
              {playbackRate}x
            </Button>
            
            <Button variant="ghost" size="icon" onClick={skipBackward}>
              <SkipBack className="h-6 w-6" />
              <span className="sr-only">Reculer 15s</span>
            </Button>

            <Button 
              size="lg" 
              className="h-14 w-14 rounded-full"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause className="h-8 w-8" />
              ) : (
                <Play className="h-8 w-8 ml-1" />
              )}
            </Button>

            <Button variant="ghost" size="icon" onClick={skipForward}>
              <SkipForward className="h-6 w-6" />
              <span className="sr-only">Avancer 30s</span>
            </Button>

            <Button variant="ghost" size="icon" onClick={() => setShowChapters(!showChapters)}>
              <List className="h-6 w-6" />
            </Button>
          </div>

          {/* Volume */}
          <div className="flex items-center justify-center gap-3 mt-4">
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
              className="w-24"
            />
          </div>
        </div>

        {/* Chapters */}
        {showChapters && (
          <div className="mt-6 bg-card rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Chapitres</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowChapters(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {chapters.map((chapter: any, index: number) => (
                <button
                  key={chapter.id}
                  onClick={() => changeChapter(index)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors text-left",
                    currentChapter === index && "bg-muted"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{index + 1}.</span>
                    <span>{chapter.title}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatDuration(Math.floor(chapter.duration || 0))}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Download Button */}
        {book.canAccess && (
          <div className="mt-6 flex justify-center">
            <Button variant="outline" onClick={() => {
              toast({
                title: 'Téléchargement',
                description: 'Le téléchargement va commencer...'
              })
            }}>
              <Download className="mr-2 h-4 w-4" />
              Télécharger pour hors-ligne
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}