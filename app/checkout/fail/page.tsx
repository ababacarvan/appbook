"use client"

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react'

export default function CheckoutFailPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <XCircle className="h-16 w-16 text-red-500" />
          </div>
          <CardTitle className="text-2xl">Paiement échoué</CardTitle>
          <CardDescription>
            Une erreur est survenue lors du paiement.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Veuillez vérifier vos informations de paiement et réessayer.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Si le problème persiste, contactez notre support.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button className="w-full" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Réessayer
          </Button>
          <Button variant="outline" className="w-full" onClick={() => router.push('/books')}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retour à la bibliothèque
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}