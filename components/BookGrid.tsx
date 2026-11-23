import { BookCard } from './BookCard'

interface BookGridProps {
  books: any[]
  columns?: number
}

export function BookGrid({ books, columns = 4 }: BookGridProps) {
  if (!books || books.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Aucun livre trouvé</p>
      </div>
    )
  }

  const gridClasses = {
    2: 'grid-cols-2 sm:grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
    6: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'
  }

  return (
    <div className={`grid ${gridClasses[columns as keyof typeof gridClasses] || gridClasses[4]} gap-4 md:gap-6`}>
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  )
}