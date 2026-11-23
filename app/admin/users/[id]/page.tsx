"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Shield,
  CheckCircle,
  XCircle,
  Edit,
  Save,
  Loader2
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function AdminUserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    role: ''
  })

  useEffect(() => {
    if (params.id) {
      fetchUser()
    }
  }, [params.id])

  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/admin/users/${params.id}`)
      const data = await response.json()
      setUser(data.user)
      setFormData({
        name: data.user.name || '',
        email: data.user.email || '',
        phone: data.user.phone || '',
        bio: data.user.bio || '',
        role: data.user.role || 'USER'
      })
    } catch (error) {
      console.error('Failed to fetch user:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible de charger l\'utilisateur',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/admin/users/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast({ title: 'Utilisateur mis à jour' })
        setEditing(false)
        fetchUser()
      }
    } catch (error) {
      toast({ title: 'Erreur', variant: 'destructive' })
    }
  }

  const handleSuspend = async () => {
    try {
      const response = await fetch(`/api/admin/users/${params.id}/suspend`, {
        method: 'POST'
      })
      if (response.ok) {
        toast({ title: user.isActive ? 'Utilisateur suspendu' : 'Utilisateur réactivé' })
        fetchUser()
      }
    } catch (error) {
      toast({ title: 'Erreur', variant: 'destructive' })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold">Utilisateur non trouvé</h3>
        <Button className="mt-4" onClick={() => router.push('/admin/users')}>
          Retour
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push('/admin/users')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditing(!editing)}>
            <Edit className="mr-2 h-4 w-4" />
            {editing ? 'Annuler' : 'Modifier'}
          </Button>
          <Button variant={user.isActive ? 'destructive' : 'default'} onClick={handleSuspend}>
            {user.isActive ? 'Suspendre' : 'Réactiver'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Profil</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="text-2xl">
                {user.name?.[0] || user.email[0]}
              </AvatarFallback>
            </Avatar>
            <h3 className="mt-4 text-xl font-semibold">{user.name || 'Anonyme'}</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              <Badge variant={user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? 'default' : 'secondary'}>
                {user.role}
              </Badge>
              {user.isActive ? (
                <Badge variant="success" className="bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Actif
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="h-3 w-3 mr-1" />
                  Suspendu
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informations</CardTitle>
            <CardDescription>Détails de l'utilisateur</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {editing ? (
              <>
                <div className="space-y-2">
                  <Label>Nom</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    type="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rôle</Label>
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="USER">Utilisateur</option>
                    <option value="AUTHOR">Auteur</option>
                    <option value="ADMIN">Admin</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Bio</Label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                  />
                </div>
                <Button onClick={handleSave} className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Sauvegarder
                </Button>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Nom</p>
                    <p className="font-medium">{user.name || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Téléphone</p>
                    <p className="font-medium">{user.phone || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Rôle</p>
                    <p className="font-medium">{user.role}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Membre depuis</p>
                    <p className="font-medium">{formatDate(new Date(user.createdAt))}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Statut</p>
                    <p className="font-medium">{user.isActive ? 'Actif' : 'Suspendu'}</p>
                  </div>
                </div>
                {user.bio && (
                  <div>
                    <p className="text-sm text-muted-foreground">Bio</p>
                    <p className="font-medium">{user.bio}</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {user.subscriptions && user.subscriptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Abonnements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {user.subscriptions.map((sub: any) => (
                <div key={sub.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{sub.plan}</p>
                    <p className="text-sm text-muted-foreground">
                      Depuis {formatDate(new Date(sub.startDate))}
                    </p>
                  </div>
                  <Badge variant={
                    sub.status === 'ACTIVE' ? 'success' :
                    sub.status === 'TRIAL' ? 'warning' :
                    'secondary'
                  }>
                    {sub.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}