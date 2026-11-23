import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const authors = await prisma.author.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            bio: true
          }
        },
        books: {
          select: {
            id: true,
            title: true,
            coverImage: true,
            status: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Formater les données
    const formattedAuthors = authors.map(author => ({
      id: author.id,
      userId: author.userId,
      bio: author.bio,
      website: author.website,
      socialLinks: author.socialLinks,
      isVerified: author.isVerified,
      createdAt: author.createdAt,
      updatedAt: author.updatedAt,
      user: {
        id: author.user.id,
        name: author.user.name || 'Auteur inconnu',
        email: author.user.email,
        avatar: author.user.avatar,
        bio: author.user.bio
      },
      books: author.books.map(book => ({
        id: book.id,
        title: book.title,
        coverImage: book.coverImage,
        status: book.status
      })),
      bookCount: author.books.length,
      publishedBooks: author.books.filter(b => b.status === 'PUBLISHED').length
    }))

    return NextResponse.json({ 
      authors: formattedAuthors,
      total: formattedAuthors.length
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des auteurs:', error)
    return NextResponse.json(
      { error: 'Impossible de charger les auteurs' },
      { status: 500 }
    )
  }
}