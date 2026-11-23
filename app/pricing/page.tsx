"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Star, BookOpen, Headphones, Download, Users, Building, Crown } from 'lucide-react'

const plans = [
  {
    id: 'free',
    name: 'Gratuit',
    price: 0,
    currency: 'FCFA',
    description: 'Pour découvrir la plateforme',
    features: [
      'Contenus gratuits',
      'Extraits de livres',
      'Recherche basique',
      'Fonctionnalités limitées'
    ],
    icon: BookOpen,
    buttonText: 'Démarrer'
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 5000,
    currency: 'FCFA',
    description: 'Pour les lecteurs passionnés',
    features: [
      'Catalogue complet',
      'Lecture illimitée',
      'Écoute illimitée',
      'Téléchargement hors-ligne',
      'Fonctionnalités avancées',
      'Synchronisation multi-appareils'
    ],
    icon: Headphones,
    popular: true,
    buttonText: 'S\'abonner'
  },
  {
    id: 'annual',
    name: 'Annuel',
    price: 50000,
    currency: 'FCFA',
    description: 'Économisez 15%',
    features: [
      'Tous les avantages Premium',
      'Paiement annuel',
      '15% de réduction',
      'Accès illimité'
    ],
    icon: Star,
    buttonText: 'S\'abonner'
  },
  {
    id: 'student',
    name: 'Étudiant',
    price: 3000,
    currency: 'FCFA',
    description: 'Tarif préférentiel pour les étudiants',
    features: [
      'Tous les avantages Premium',
      'Tarif réduit',
      'Vérification étudiant requise'
    ],
    icon: Users,
    buttonText: 'S\'abonner'
  },
  {
    id: 'family',
    name: 'Famille',
    price: 8000,
    currency: 'FCFA',
    description: 'Pour toute la famille',
    features: [
      'Tous les avantages Premium',
      '5 profils inclus',
      'Contrôle parental',
      'Bibliothèque partagée'
    ],
    icon: Users,
    buttonText: 'S\'abonner'
  },
  {
    id: 'enterprise',
    name: 'Entreprise',
    price: 15000,
    currency: 'FCFA',
    description: 'Pour les organisations',
    features: [
      'Tous les avantages Premium',
      'Profils illimités',
      'Tableau de bord administrateur',
      'Rapports d\'utilisation',
      'Support prioritaire'
    ],
    icon: Building,
    buttonText: 'Contacter'
  }
]

export default function PricingPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const handleSubscribe = (planId: string) => {
    setSelectedPlan(planId)
    if (planId === 'free') {
      router.push('/register')
    } else if (planId === 'enterprise') {
      router.push('/contact')
    } else {
      router.push(`/checkout?plan=${planId}`)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choisissez votre formule</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Accédez à des milliers de livres, livres audio et contenus éducatifs 
          avec la formule qui vous convient le mieux.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const Icon = plan.icon
          return (
            <Card 
              key={plan.id} 
              className={`relative transition-all hover:shadow-lg ${
                plan.popular ? 'border-primary shadow-lg scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    <Crown className="h-3 w-3 mr-1" />
                    Populaire
                  </Badge>
                </div>
              )}
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-primary" />
                  <CardTitle>{plan.name}</CardTitle>
                </div>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-1">/mois</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={() => handleSubscribe(plan.id)}
                >
                  {plan.buttonText}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground">
          Tous les abonnements sont sans engagement. Vous pouvez annuler à tout moment.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Paiements sécurisés via Stripe, Orange Money, Wave, MTN Mobile Money.
        </p>
      </div>
    </div>
  )
}