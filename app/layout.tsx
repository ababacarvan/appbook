import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AppBook - Bibliothèque numérique',
  description: 'Une bibliothèque numérique panafricaine pour découvrir, lire, écouter et apprendre.',
  keywords: 'livres, livres audio, éducation, Afrique, lecture, bibliothèque numérique',
  authors: [{ name: 'AppBook' }],
  openGraph: {
    title: 'AppBook - Bibliothèque numérique',
    description: 'Une bibliothèque numérique panafricaine pour découvrir, lire, écouter et apprendre.',
    url: 'https://appbook.com',
    siteName: 'AppBook',
    images: [
      {
        url: 'https://appbook.com/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AppBook - Bibliothèque numérique',
    description: 'Une bibliothèque numérique panafricaine pour découvrir, lire, écouter et apprendre.',
    images: ['https://appbook.com/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}