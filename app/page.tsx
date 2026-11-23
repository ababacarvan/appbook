import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { BookCard } from '@/components/BookCard'
import { Header } from '@/components/Header'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

const categories = [
  { id: 'romans', name: 'Romans', icon: '📖', count: 0 },
  { id: 'afrique', name: 'Afrique', icon: '🌍', count: 0 },
  { id: 'developpement-personnel', name: 'Développement', icon: '💪', count: 0 },
  { id: 'poesie', name: 'Poésie', icon: '✍️', count: 0 },
  { id: 'education', name: 'Éducation', icon: '🎓', count: 0 },
  { id: 'bd', name: 'BD', icon: '🎨', count: 0 },
]

export default async function Home() {
  const [newBooks, popularBooks, freeBooks, audioBooks, africanBooks, educationalBooks] = await Promise.all([
    prisma.book.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        author: {
          include: {
            user: {
              select: { name: true, avatar: true }
            }
          }
        },
        reviews: { select: { rating: true } },
        categories: { include: { category: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 8
    }),
    prisma.book.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        author: {
          include: {
            user: {
              select: { name: true, avatar: true }
            }
          }
        },
        reviews: { select: { rating: true } },
        categories: { include: { category: true } }
      },
      orderBy: { views: 'desc' },
      take: 8
    }),
    prisma.book.findMany({
      where: { 
        status: 'PUBLISHED',
        OR: [{ isFree: true }, { price: 0 }]
      },
      include: {
        author: {
          include: {
            user: {
              select: { name: true, avatar: true }
            }
          }
        },
        reviews: { select: { rating: true } },
        categories: { include: { category: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 8
    }),
    prisma.book.findMany({
      where: { 
        status: 'PUBLISHED',
        type: 'AUDIOBOOK'
      },
      include: {
        author: {
          include: {
            user: {
              select: { name: true, avatar: true }
            }
          }
        },
        reviews: { select: { rating: true } },
        categories: { include: { category: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 8
    }),
    prisma.book.findMany({
      where: { 
        status: 'PUBLISHED',
        categories: {
          some: {
            category: {
              slug: 'afrique'
            }
          }
        }
      },
      include: {
        author: {
          include: {
            user: {
              select: { name: true, avatar: true }
            }
          }
        },
        reviews: { select: { rating: true } },
        categories: { include: { category: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 8
    }),
    prisma.book.findMany({
      where: { 
        status: 'PUBLISHED',
        categories: {
          some: {
            category: {
              slug: 'education'
            }
          }
        }
      },
      include: {
        author: {
          include: {
            user: {
              select: { name: true, avatar: true }
            }
          }
        },
        reviews: { select: { rating: true } },
        categories: { include: { category: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 8
    })
  ])

  const transformBooks = (books: any[]) => {
    return books.map(book => {
      const ratings = book.reviews.map((r: any) => r.rating)
      const avgRating = ratings.length > 0 
        ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length 
        : 0
      
      return {
        ...book,
        author: {
          id: book.author?.id,
          name: book.author?.user?.name || 'Auteur inconnu',
          avatar: book.author?.user?.avatar
        },
        averageRating: avgRating,
        reviewsCount: book.reviews.length,
        reviews: undefined
      }
    })
  }

  const sections = [
    { 
      title: '📚 Nouveautés', 
      books: transformBooks(newBooks), 
      seeAll: '/books?sort=new',
      description: 'Découvrez les dernières parutions'
    },
    { 
      title: '🔥 Les plus populaires', 
      books: transformBooks(popularBooks), 
      seeAll: '/books?sort=popular',
      description: 'Les livres les plus lus du moment'
    },
    { 
      title: '🎁 Gratuits', 
      books: transformBooks(freeBooks), 
      seeAll: '/books?filter=free',
      description: 'Des livres gratuits à découvrir'
    },
    { 
      title: '🎧 Livres audio', 
      books: transformBooks(audioBooks), 
      seeAll: '/books?type=AUDIOBOOK',
      description: 'Écoutez vos livres préférés'
    },
    { 
      title: '🌍 Afrique', 
      books: transformBooks(africanBooks), 
      seeAll: '/books?category=afrique',
      description: 'La littérature africaine à l\'honneur'
    },
    { 
      title: '🎓 Éducation', 
      books: transformBooks(educationalBooks), 
      seeAll: '/books?category=education',
      description: 'Apprenez avec les meilleurs contenus'
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background rounded-2xl p-8 md:p-12">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Découvrez, lisez et écoutez
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                Une bibliothèque numérique panafricaine avec des milliers de livres,
                livres audio et contenus éducatifs.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/books">
                  <Button size="lg">
                    Explorer la bibliothèque
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="outline" size="lg">
                    Voir les abonnements
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Book Sections */}
        {sections.map((section) => (
          <section key={section.title} className="mb-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold">{section.title}</h2>
                {section.description && (
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                )}
              </div>
              <Link href={section.seeAll} className="mt-2 sm:mt-0">
                <Button variant="ghost" className="gap-1">
                  Voir tout <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6">
              {section.books.length > 0 ? (
                section.books.map((book: any) => (
                  <BookCard key={book.id} book={book} />
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  Aucun livre disponible pour le moment
                </div>
              )}
            </div>
          </section>
        ))}

        {/* Categories Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold">Catégories populaires</h2>
              <p className="text-sm text-muted-foreground">Explorez par thème</p>
            </div>
            <Link href="/categories">
              <Button variant="ghost" className="gap-1">
                Voir tout <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/books?category=${category.id}`}
                className="p-4 rounded-lg border hover:border-primary hover:shadow-md transition-all text-center group"
              >
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{category.icon || '📚'}</div>
                <span className="text-sm font-medium">{category.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary/5 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Vous êtes auteur ?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Publiez vos livres sur AppBook et touchez des milliers de lecteurs
            à travers l'Afrique et le monde.
          </p>
          <Link href="/publish">
            <Button size="lg">
              Devenir auteur
            </Button>
          </Link>
        </section>
      </main>
    </div>
  )
}