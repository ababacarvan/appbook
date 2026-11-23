"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { Loader2, DollarSign } from 'lucide-react'

interface Subscription {
  id: string
  user: {
    name: string | null
    email: string
  }
  plan: string
  status: string
  startDate: string
  endDate: string | null
  autoRenew: boolean
}

export default function AdminSubscriptionsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch('/api/admin/subscriptions')
      const data = await response.json()
      setSubscriptions(data.subscriptions || [])
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les abonnements',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Abonnements</h2>
        <p className="text-muted-foreground">Gérez les abonnements des utilisateurs</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Tous les abonnements</CardTitle>
            <Badge variant="secondary">{subscriptions.length} abonnements</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Début</TableHead>
                <TableHead>Fin</TableHead>
                <TableHead>Renouvellement</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Aucun abonnement trouvé
                  </TableCell>
                </TableRow>
              ) : (
                subscriptions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{sub.user.name || 'Anonyme'}</p>
                        <p className="text-sm text-muted-foreground">{sub.user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{sub.plan}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        sub.status === 'ACTIVE' ? 'success' :
                        sub.status === 'TRIAL' ? 'warning' :
                        sub.status === 'CANCELLED' ? 'secondary' :
                        'destructive'
                      }>
                        {sub.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(sub.startDate).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell className="text-sm">
                      {sub.endDate ? new Date(sub.endDate).toLocaleDateString('fr-FR') : '—'}
                    </TableCell>
                    <TableCell>
                      {sub.autoRenew ? (
                        <Badge variant="success" className="bg-green-500">Auto</Badge>
                      ) : (
                        <Badge variant="secondary">Manuel</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}