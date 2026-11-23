import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser, requireAuth } from '@/lib/auth'
import { z } from 'zod'

const createBookSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  isbn: z.string().optional(),
  coverImage: z.string().optional(),
  fileUrl: z.string().optional(),
  fileFormat: z.enum(['EPUB', 'PDF', 'MOBI', 'MP3', 'AAC', 'M4A', 'IMAGE', 'VIDEO']).optional(),
  fileSize: z.number().optional(),
  pageCount: z.number().optional(),
  duration: z.number().optional(),
  language: z.string().default('fr'),
  publisher: z.string().optional(),
  publicationYear: z.number().optional(),
  price: z.number().default(0),
  isFree: z.boolean().default(false),
  isPremium: z.boolean().default(false),
  type: z.enum(['EBOOK', 'AUDIOBOOK', 'BD', 'PODCAST', 'DOCUMENT', 'MAGAZINE', 'JOURNAL', 'COURSE']).default('EBOOK'),
  status: z.enum(['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'PUBLISHED', 'UNPUBLISHED', 'ARCHIVED']).optional(),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional()
})

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || ''
    const category = searchParams.get('category')
    const language = searchParams.get('language')
    const sort = searchParams.get('sort') || 'createdAt'
    const order = searchParams.get('order') || 'desc'
    const priceFilter = searchParams.get('price')
    
    const where: any = {
      status: 'PUBLISHED'
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { author: { user: { name: { contains: search, mode: 'insensitive' } } } },
        { publisher: { contains: search, mode: 'insensitive' } },
        { isbn: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (type && type !== 'all' && type !== '') {
      where.type = type
    }
    
    if (category && category !== '') {
      where.categories = {
        some: {
          categoryId: category
        }
      }
    }
    
    if (language && language !== '') {
      where.language = language
    }
    
    if (priceFilter === 'free') {
      where.OR = [
        { isFree: true },
        { price: 0 }
      ]
    } else if (priceFilter === 'premium') {
      where.isPremium = true
    }
    
    let orderBy: any = {}
    if (sort === 'popular') {
      orderBy = { views: 'desc' }
    } else if (sort === 'rating') {
      orderBy = { averageRating: 'desc' }
    } else if (sort === 'price') {
      orderBy = { price: order === 'desc' ? 'desc' : 'asc' }
    } else {
      orderBy = { [sort]: order }
    }
    
    const skip = (page - 1) * limit
    
    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        include: {
          author: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
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
            select: {
              rating: true
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.book.count({ where })
    ])
    
    const booksWithRating = books.map(book => {
      const ratings = book.reviews.map(r => r.rating)
      const avgRating = ratings.length > 0 
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
        : 0
      
      return {
        ...book,
        author: {
          id: book.author.id,
          name: book.author.user?.name || 'Auteur inconnu',
          avatar: book.author.user?.avatar,
          bio: book.author.user?.bio || book.author.bio
        },
        averageRating: avgRating,
        reviewsCount: book.reviews.length,
        reviews: undefined
      }
    })
    
    return NextResponse.json({
      books: booksWithRating,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get books error:', error)
    return NextResponse.json(
      { error: 'Failed to get books' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/books - Starting...')
    
    // Vérifier que l'utilisateur est authentifié
    const user = await getUser()
    if (!user) {
      console.log('User not authenticated')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    console.log('User:', user.id, user.email, user.role)
    
    // Vérifier que l'utilisateur est author ou admin
    if (user.role !== 'AUTHOR' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      console.log('User not authorized:', user.role)
      return NextResponse.json(
        { error: 'Insufficient permissions. Author, Admin or Super Admin required.' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    console.log('Request body:', JSON.stringify(body, null, 2))
    
    // Valider les données
    const validatedData = createBookSchema.parse(body)
    console.log('Validated data:', JSON.stringify(validatedData, null, 2))
    
    // Récupérer le profil author ou utiliser l'ID utilisateur
    let authorId = user.id
    
    if (user.role === 'AUTHOR') {
      const authorProfile = await prisma.author.findUnique({
        where: { userId: user.id }
      })
      
      if (!authorProfile) {
        console.log('Author profile not found for user:', user.id)
        return NextResponse.json(
          { error: 'Author profile not found. Please complete your author profile.' },
          { status: 404 }
        )
      }
      
      authorId = authorProfile.id
    }
    
    console.log('Author ID:', authorId)
    
    // Créer le livre
    const book = await prisma.book.create({
      data: {
        title: validatedData.title,
        subtitle: validatedData.subtitle,
        description: validatedData.description,
        isbn: validatedData.isbn,
        coverImage: validatedData.coverImage,
        fileUrl: validatedData.fileUrl,
        fileFormat: validatedData.fileFormat,
        fileSize: validatedData.fileSize,
        pageCount: validatedData.pageCount,
        duration: validatedData.duration,
        language: validatedData.language,
        publisher: validatedData.publisher,
        publicationYear: validatedData.publicationYear,
        price: validatedData.price,
        isFree: validatedData.isFree,
        isPremium: validatedData.isPremium,
        type: validatedData.type,
        status: validatedData.status || 'PUBLISHED',
        authorId: authorId,
        publishedAt: validatedData.status === 'PUBLISHED' ? new Date() : undefined
      },
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
    
    console.log('Book created:', book.id)
    
    // Ajouter les catégories
    if (validatedData.categories && validatedData.categories.length > 0) {
      for (const categoryId of validatedData.categories) {
        await prisma.bookCategory.create({
          data: {
            bookId: book.id,
            categoryId
          }
        })
      }
      console.log('Categories added:', validatedData.categories.length)
    }
    
    // Ajouter les tags
    if (validatedData.tags && validatedData.tags.length > 0) {
      for (const tagId of validatedData.tags) {
        await prisma.bookTag.create({
          data: {
            bookId: book.id,
            tagId
          }
        })
      }
      console.log('Tags added:', validatedData.tags.length)
    }
    
    // Créer une notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'book_published',
        title: 'Livre publié',
        message: `Votre livre "${book.title}" a été publié avec succès.`,
        data: { bookId: book.id }
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Book created successfully',
      book
    })
  } catch (error) {
    console.error('Create book error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create book' },
      { status: 500 }
    )
  }
}