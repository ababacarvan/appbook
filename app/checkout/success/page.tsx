"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, BookOpen, Home } from 'lucide-react'

export default function CheckoutSuccessPage() {
  const router = useRouter()

  useEffect(() => {
    // Rediriger après 5 secondes
    const timer = setTimeout(() => {
      router.push('/library')
    }, 5000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Paiement réussi !</CardTitle>
          <CardDescription>
            Votre achat a été confirmé avec succès.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Le livre a été ajouté à votre bibliothèque. Vous pouvez le lire dès maintenant.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Vous serez redirigé dans quelques secondes...
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button className="w-full" onClick={() => router.push('/library')}>
            <BookOpen className="mr-2 h-4 w-4" />
            Aller à ma bibliothèque
          </Button>
          <Button variant="outline" className="w-full" onClick={() => router.push('/')}>
            <Home className="mr-2 h-4 w-4" />
            Accueil
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}