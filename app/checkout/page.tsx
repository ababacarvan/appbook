"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { 
  ArrowLeft, 
  ShoppingCart, 
  CreditCard, 
  Smartphone, 
  Banknote,
  Loader2,
  CheckCircle,
  Zap,
  Shield
} from 'lucide-react'

interface Book {
  id: string
  title: string
  subtitle: string | null
  coverImage: string | null
  price: number
  type: string
  author: {
    name: string
  }
  duration?: number
  pageCount?: number
}

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [book, setBook] = useState<Book | null>(null)
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
    mobileNumber: '',
    provider: ''
  })

  const bookId = searchParams?.get('bookId')

  useEffect(() => {
    if (bookId) {
      fetchBook()
    }
  }, [bookId])

  const fetchBook = async () => {
    try {
      const response = await fetch(`/api/books/${bookId}`)
      const data = await response.json()
      setBook(data)
    } catch (error) {
      console.error('Failed to fetch book:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible de charger le livre',
        variant: 'destructive'
      })
      router.push('/books')
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)

    try {
      // Simuler un paiement
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Créer le paiement dans la base de données
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId: book?.id,
          amount: book?.price,
          method: paymentMethod,
          status: 'SUCCESS'
        })
      })

      if (!response.ok) {
        throw new Error('Payment failed')
      }

      // Ajouter le livre à la bibliothèque
      await fetch('/api/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: book?.id })
      })

      toast({
        title: 'Paiement réussi !',
        description: `Vous avez acheté "${book?.title}" avec succès.`
      })

      router.push(`/books/${book?.id}`)
    } catch (error) {
      toast({
        title: 'Erreur de paiement',
        description: 'Le paiement a échoué. Veuillez réessayer.',
        variant: 'destructive'
      })
    } finally {
      setProcessing(false)
    }
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
          <Button onClick={() => router.push('/books')}>Retour</Button>
        </div>
      </div>
    )
  }

  const paymentMethods = [
    { id: 'card', label: 'Carte bancaire', icon: CreditCard },
    { id: 'mobile_money', label: 'Mobile Money', icon: Smartphone },
    { id: 'bank_transfer', label: 'Virement bancaire', icon: Banknote }
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour
      </Button>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Résumé de la commande */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Résumé
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-20 bg-muted rounded overflow-hidden flex-shrink-0">
                {book.coverImage ? (
                  <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-2xl">📖</span>
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-medium">{book.title}</h3>
                <p className="text-sm text-muted-foreground">{book.author?.name}</p>
                <Badge variant="secondary" className="mt-1">{book.type}</Badge>
              </div>
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sous-total</span>
                <span>{book.price} FCFA</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Frais</span>
                <span>0 FCFA</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total</span>
                <span>{book.price} FCFA</span>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-3 text-sm">
              <p className="flex items-center gap-2 text-green-600">
                <Shield className="h-4 w-4" />
                Paiement sécurisé
              </p>
              <p className="text-muted-foreground text-xs mt-1">
                Vos informations de paiement sont cryptées et sécurisées.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Formulaire de paiement */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Paiement</CardTitle>
            <CardDescription>Choisissez votre méthode de paiement</CardDescription>
          </CardHeader>
          <form onSubmit={handlePayment}>
            <CardContent className="space-y-6">
              {/* Méthodes de paiement */}
              <div className="grid grid-cols-3 gap-2">
                {paymentMethods.map((method) => {
                  const Icon = method.icon
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className={`p-3 border rounded-lg text-center transition-all ${
                        paymentMethod === method.id
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-muted-foreground'
                      }`}
                    >
                      <Icon className={`h-6 w-6 mx-auto ${
                        paymentMethod === method.id ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                      <p className="text-xs mt-1">{method.label}</p>
                    </button>
                  )
                })}
              </div>

              {/* Formulaire selon la méthode */}
              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Numéro de carte</Label>
                    <Input
                      placeholder="1234 5678 9012 3456"
                      value={formData.cardNumber}
                      onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nom sur la carte</Label>
                    <Input
                      placeholder="John Doe"
                      value={formData.cardName}
                      onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date d'expiration</Label>
                      <Input
                        placeholder="MM/YY"
                        value={formData.expiry}
                        onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>CVV</Label>
                      <Input
                        type="password"
                        placeholder="123"
                        value={formData.cvv}
                        onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'mobile_money' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Opérateur</Label>
                    <select
                      className="w-full px-3 py-2 border rounded-md bg-background"
                      value={formData.provider}
                      onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                      required
                    >
                      <option value="">Sélectionnez un opérateur</option>
                      <option value="orange">Orange Money</option>
                      <option value="wave">Wave</option>
                      <option value="mtn">MTN Mobile Money</option>
                      <option value="free">Free Money</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Numéro de téléphone</Label>
                    <Input
                      type="tel"
                      placeholder="77 123 45 67"
                      value={formData.mobileNumber}
                      onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                      required
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'bank_transfer' && (
                <div className="space-y-4">
                  <div className="bg-muted/30 rounded-lg p-4 text-sm">
                    <p className="font-medium">Coordonnées bancaires</p>
                    <div className="mt-2 space-y-1 text-muted-foreground">
                      <p>Banque : EcoBank Sénégal</p>
                      <p>Compte : 123 456 789</p>
                      <p>IBAN : SN 1234 5678 9012 3456</p>
                      <p>BIC : ECOCSNXX</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Veuillez effectuer le virement et nous envoyer le reçu.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter>
              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={processing}
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Traitement en cours...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Payer {book.price} FCFA
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}