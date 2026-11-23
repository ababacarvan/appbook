"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Loader2, CreditCard, Calendar, CheckCircle, XCircle, Clock, Smartphone } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Payment {
  id: string
  amount: number
  currency: string
  method: string
  status: string
  createdAt: string
  metadata: {
    bookId?: string
    bookTitle?: string
  }
}

export default function PaymentsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [payments, setPayments] = useState<Payment[]>([])

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/payments')
      const data = await response.json()
      setPayments(data.payments || [])
    } catch (error) {
      console.error('Failed to fetch payments:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible de charger votre historique',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <Badge variant="success" className="bg-green-500">✅ Réussi</Badge>
      case 'PENDING':
        return <Badge variant="warning" className="bg-yellow-500">⏳ En attente</Badge>
      case 'FAILED':
        return <Badge variant="destructive">❌ Échoué</Badge>
      case 'REFUNDED':
        return <Badge variant="secondary">↩️ Remboursé</Badge>
      case 'CANCELLED':
        return <Badge variant="secondary">🚫 Annulé</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'card':
        return <CreditCard className="h-4 w-4" />
      case 'mobile_money':
        return <Smartphone className="h-4 w-4" />
      default:
        return <CreditCard className="h-4 w-4" />
    }
  }

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'card':
        return 'Carte bancaire'
      case 'mobile_money':
        return 'Mobile Money'
      case 'bank_transfer':
        return 'Virement bancaire'
      default:
        return method
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Mes paiements</h1>
          <p className="text-muted-foreground">
            {payments.length} paiement{payments.length > 1 ? 's' : ''} effectué{payments.length > 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push('/books')}>
          Explorer la bibliothèque
        </Button>
      </div>

      {payments.length > 0 ? (
        <div className="space-y-4">
          {payments.map((payment) => (
            <Card key={payment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      {getMethodIcon(payment.method)}
                    </div>
                    <div>
                      <p className="font-medium">
                        {payment.metadata?.bookTitle || 'Achat de livre'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground">
                          {formatDate(new Date(payment.createdAt))}
                        </span>
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground capitalize">
                          {getMethodLabel(payment.method)}
                        </span>
                        {payment.metadata?.bookId && (
                          <>
                            <span className="text-sm text-muted-foreground">•</span>
                            <button
                              onClick={() => router.push(`/books/${payment.metadata?.bookId}`)}
                              className="text-sm text-primary hover:underline"
                            >
                              Voir le livre
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold text-lg">{payment.amount.toLocaleString()} {payment.currency}</p>
                      {getStatusBadge(payment.status)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <CreditCard className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">Aucun paiement</h3>
              <p className="text-muted-foreground">
                Vous n'avez pas encore effectué de paiement
              </p>
              <Button className="mt-4" onClick={() => router.push('/books')}>
                Acheter un livre
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}