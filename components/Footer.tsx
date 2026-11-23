import Link from 'next/link'
import { BookOpen, Mail, Phone, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">AppBook</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Une bibliothèque numérique panafricaine pour découvrir, lire, écouter et apprendre.
            </p>
            <div className="flex gap-4 mt-4 text-2xl">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                🌐
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                🐦
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                📸
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                ▶️
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/books" className="text-muted-foreground hover:text-primary transition-colors">
                  Bibliothèque
                </Link>
              </li>
              <li>
                <Link href="/authors" className="text-muted-foreground hover:text-primary transition-colors">
                  Auteurs
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-muted-foreground hover:text-primary transition-colors">
                  Catégories
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-muted-foreground hover:text-primary transition-colors">
                  Abonnements
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Pour les auteurs</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/publish" className="text-muted-foreground hover:text-primary transition-colors">
                  Publier un livre
                </Link>
              </li>
              <li>
                <Link href="/royalties" className="text-muted-foreground hover:text-primary transition-colors">
                  Droits d'auteur
                </Link>
              </li>
              <li>
                <Link href="/guidelines" className="text-muted-foreground hover:text-primary transition-colors">
                  Directives
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                contact@appbook.com
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                +221 78 123 45 67
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                Dakar, Sénégal
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} AppBook. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  )
}