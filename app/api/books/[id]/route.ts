import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'
import { getSignedUrl } from '@/lib/upload'
import { ContentFormat } from '@prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const book = await prisma.book.findUnique({
      where: { id: params.id },
      include: {
        author: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                bio: true
              }
            }
          }
        },
        categories: {
          include: {
            category: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        audioChapters: {
          orderBy: {
            order: 'asc'
          }
        },
        bookPages: {
          orderBy: {
            pageNumber: 'asc'
          }
        },
        readingProgress: true,
        listeningProgress: true
      }
    })
    
    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      )
    }
    
    const user = await getUser()
    let canAccess = false
    
    if (book.isFree || book.price === 0) {
      canAccess = true
    } else if (user) {
      const subscription = await prisma.subscription.findFirst({
        where: {
          userId: user.id,
          status: {
            in: ['ACTIVE', 'TRIAL']
          }
        }
      })
      
      if (subscription) {
        canAccess = true
      }
    }
    
    let fileUrl = book.fileUrl
    if (book.fileUrl && canAccess) {
      try {
        const urlParts = book.fileUrl.split('/')
        const bucket = urlParts[0]
        const path = urlParts.slice(1).join('/')
        const signedUrl = await getSignedUrl(bucket, path)
        fileUrl = signedUrl
      } catch {
        fileUrl = book.fileUrl
      }
    }
    
    const ratings = book.reviews.map(r => r.rating)
    const avgRating = ratings.length > 0 
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
      : 0
    
    const response = {
      ...book,
      fileUrl: canAccess ? fileUrl : null,
      averageRating: avgRating,
      reviewsCount: book.reviews.length,
      canAccess,
      author: {
        id: book.author.id,
        name: book.author.user.name || 'Auteur inconnu',
        avatar: book.author.user.avatar,
        bio: book.author.user.bio || book.author.bio,
        isVerified: book.author.isVerified,
        website: book.author.website
      }
    }
    
    await prisma.book.update({
      where: { id: params.id },
      data: { views: { increment: 1 } }
    })
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Get book error:', error)
    return NextResponse.json(
      { error: 'Failed to get book' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Check if user owns the book or is admin
    const book = await prisma.book.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: {
            userId: true
          }
        }
      }
    })
    
    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      )
    }
    
    if (book.author?.userId !== user.id && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    console.log('Update book data:', body)
    
    // Fonction pour convertir le format de fichier en enum ContentFormat
    const getFileFormat = (format: string | undefined): ContentFormat | undefined => {
      if (!format) return undefined
      
      const upperFormat = format.toUpperCase()
      // Vérifier si le format est valide dans l'enum
      const validFormats = ['EPUB', 'PDF', 'MOBI', 'MP3', 'AAC', 'M4A', 'IMAGE', 'VIDEO']
      if (validFormats.includes(upperFormat)) {
        return upperFormat as ContentFormat
      }
      return undefined
    }
    
    // Préparer les données de mise à jour
    const updateData: any = {}
    
    if (body.title !== undefined) updateData.title = body.title
    if (body.subtitle !== undefined) updateData.subtitle = body.subtitle
    if (body.description !== undefined) updateData.description = body.description
    if (body.isbn !== undefined) updateData.isbn = body.isbn
    if (body.coverImage !== undefined) updateData.coverImage = body.coverImage
    if (body.fileUrl !== undefined) updateData.fileUrl = body.fileUrl
    
    // Gérer fileFormat avec validation
    if (body.fileFormat !== undefined) {
      const validFormat = getFileFormat(body.fileFormat)
      if (validFormat) {
        updateData.fileFormat = validFormat
      } else if (body.fileFormat === '') {
        // Si vide, on peut le mettre à null ou undefined
        updateData.fileFormat = undefined
      }
    }
    
    if (body.fileSize !== undefined) updateData.fileSize = body.fileSize
    if (body.pageCount !== undefined) updateData.pageCount = body.pageCount
    if (body.duration !== undefined) updateData.duration = body.duration
    if (body.language !== undefined) updateData.language = body.language
    if (body.publisher !== undefined) updateData.publisher = body.publisher
    if (body.publicationYear !== undefined) updateData.publicationYear = body.publicationYear
    if (body.price !== undefined) updateData.price = body.price
    if (body.isFree !== undefined) updateData.isFree = body.isFree
    if (body.isPremium !== undefined) updateData.isPremium = body.isPremium
    if (body.type !== undefined) updateData.type = body.type
    if (body.status !== undefined) updateData.status = body.status
    
    // Si le statut est PUBLISHED et qu'il n'y a pas de date de publication, l'ajouter
    if (body.status === 'PUBLISHED' && !book.publishedAt) {
      updateData.publishedAt = new Date()
    }
    
    console.log('Update data prepared:', updateData)
    
    // Update book
    const updatedBook = await prisma.book.update({
      where: { id: params.id },
      data: updateData,
      include: {
        author: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          }
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      book: updatedBook
    })
  } catch (error) {
    console.error('Update book error:', error)
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update book' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const book = await prisma.book.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: {
            userId: true
          }
        }
      }
    })
    
    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      )
    }
    
    if (book.author?.userId !== user.id && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }
    
    await prisma.$transaction([
      prisma.bookCategory.deleteMany({ where: { bookId: params.id } }),
      prisma.bookTag.deleteMany({ where: { bookId: params.id } }),
      prisma.review.deleteMany({ where: { bookId: params.id } }),
      prisma.favorite.deleteMany({ where: { bookId: params.id } }),
      prisma.library.deleteMany({ where: { bookId: params.id } }),
      prisma.collectionBook.deleteMany({ where: { bookId: params.id } }),
      prisma.readingProgress.deleteMany({ where: { bookId: params.id } }),
      prisma.listeningProgress.deleteMany({ where: { bookId: params.id } }),
      prisma.audioChapter.deleteMany({ where: { bookId: params.id } }),
      prisma.bookPage.deleteMany({ where: { bookId: params.id } }),
      prisma.book.delete({ where: { id: params.id } })
    ])
    
    return NextResponse.json({
      success: true
    })
  } catch (error) {
    console.error('Delete book error:', error)
    return NextResponse.json(
      { error: 'Failed to delete book' },
      { status: 500 }
    )
  }
}