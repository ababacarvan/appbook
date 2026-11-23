"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Plus, Trash2, Tag, Loader2 } from 'lucide-react'

interface Promotion {
  id: string
  code: string
  discount: number
  type: 'percentage' | 'fixed'
  expiresAt: string
  isActive: boolean
}

export default function AdminPromotionsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [newPromotion, setNewPromotion] = useState({
    code: '',
    discount: 10,
    type: 'percentage' as 'percentage' | 'fixed',
    expiresAt: ''
  })

  const handleAddPromotion = async () => {
    if (!newPromotion.code || !newPromotion.expiresAt) {
      toast({ title: 'Erreur', description: 'Veuillez remplir tous les champs', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPromotion)
      })

      if (response.ok) {
        toast({ title: 'Promotion créée' })
        setNewPromotion({ code: '', discount: 10, type: 'percentage', expiresAt: '' })
        // fetchPromotions()
      }
    } catch (error) {
      toast({ title: 'Erreur', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePromotion = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette promotion ?')) return

    try {
      const response = await fetch(`/api/admin/promotions/${id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        toast({ title: 'Promotion supprimée' })
        // fetchPromotions()
      }
    } catch (error) {
      toast({ title: 'Erreur', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Promotions</h2>
        <p className="text-muted-foreground">Gérez les codes de réduction</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Nouvelle promotion
          </CardTitle>
          <CardDescription>Créez un nouveau code de réduction</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Code</Label>
              <Input
                placeholder="EX: SUMMER2024"
                value={newPromotion.code}
                onChange={(e) => setNewPromotion({ ...newPromotion, code: e.target.value.toUpperCase() })}
              />
            </div>
            <div className="space-y-2">
              <Label>Réduction (%)</Label>
              <Input
                type="number"
                value={newPromotion.discount}
                onChange={(e) => setNewPromotion({ ...newPromotion, discount: parseInt(e.target.value) || 0 })}
                min={0}
                max={100}
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <select
                className="w-full px-3 py-2 border rounded-md"
                value={newPromotion.type}
                onChange={(e) => setNewPromotion({ ...newPromotion, type: e.target.value as 'percentage' | 'fixed' })}
              >
                <option value="percentage">Pourcentage</option>
                <option value="fixed">Montant fixe</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Date d'expiration</Label>
              <Input
                type="date"
                value={newPromotion.expiresAt}
                onChange={(e) => setNewPromotion({ ...newPromotion, expiresAt: e.target.value })}
              />
            </div>
          </div>
          <Button onClick={handleAddPromotion} className="mt-4" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            Ajouter la promotion
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Promotions actives</CardTitle>
        </CardHeader>
        <CardContent>
          {promotions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Aucune promotion active</p>
          ) : (
            <div className="space-y-2">
              {promotions.map((promo) => (
                <div key={promo.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Tag className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{promo.code}</p>
                      <p className="text-sm text-muted-foreground">
                        {promo.discount}% de réduction - Expire le {new Date(promo.expiresAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDeletePromotion(promo.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}