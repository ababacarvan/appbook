import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Trouver le profil auteur
    const author = await prisma.author.findUnique({
      where: { userId: user.id },
      include: {
        books: {
          include: {
            reviews: true
          }
        }
      }
    })

    if (!author) {
      return NextResponse.json({ error: 'Author profile not found' }, { status: 404 })
    }

    // Calculer les revenus par mois (simulation avec les données existantes)
    const monthlyRevenue = []
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin']
    
    for (let i = 0; i < 6; i++) {
      const monthIndex = (new Date().getMonth() - i + 12) % 12
      const monthName = months[monthIndex] || `Mois ${i+1}`
      
      // Simuler des revenus
      const revenue = Math.floor(Math.random() * 50000) + 5000
      const sales = Math.floor(Math.random() * 10) + 1
      
      monthlyRevenue.push({
        month: `${monthName} ${new Date().getFullYear()}`,
        amount: revenue,
        sales: sales,
        bookCount: author.books.length || 1
      })
    }

    return NextResponse.json({ revenue: monthlyRevenue })
  } catch (error) {
    console.error('Error fetching revenue:', error)
    return NextResponse.json({ error: 'Failed to fetch revenue' }, { status: 500 })
  }
}