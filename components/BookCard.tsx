import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getContentTypeIcon, formatDuration } from '@/lib/utils'

interface BookCardProps {
  book: {
    id: string
    title: string
    coverImage?: string
    type: string
    isFree?: boolean
    isPremium?: boolean
    duration?: number
    author?: {
      id: string
      name: string
      avatar?: string
    }
    averageRating?: number
    reviewsCount?: number
  }
}

export function BookCard({ book }: BookCardProps) {
  const typeIcon = getContentTypeIcon(book.type)
  const isAudio = book.type === 'AUDIOBOOK'
  
  return (
    <Link href={`/books/${book.id}`}>
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
        <div className="relative aspect-[3/4] overflow-hidden rounded-t-lg bg-muted">
          {book.coverImage ? (
            <Image
              src={book.coverImage}
              alt={book.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-primary/10 to-background">
              <span className="text-6xl">{typeIcon}</span>
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {book.isFree && (
              <Badge variant="secondary" className="bg-green-500 text-white">
                Gratuit
              </Badge>
            )}
            {book.isPremium && (
              <Badge variant="secondary" className="bg-yellow-500 text-white">
                Premium
              </Badge>
            )}
            {isAudio && (
              <Badge variant="secondary" className="bg-blue-500 text-white">
                🎧 Audio
              </Badge>
            )}
          </div>
          
          {/* Duration badge for audio */}
          {isAudio && book.duration && (
            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              {formatDuration(book.duration)}
            </div>
          )}
        </div>
        
        <CardContent className="p-3">
          <h3 className="font-semibold line-clamp-1 text-sm group-hover:text-primary transition-colors">
            {book.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
            {book.author?.name || 'Auteur inconnu'}
          </p>
          
          {book.averageRating && book.averageRating > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-yellow-500 text-sm">★</span>
              <span className="text-xs text-muted-foreground">
                {book.averageRating.toFixed(1)} ({book.reviewsCount || 0})
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}