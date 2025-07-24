import type { Metadata } from 'next'
import { Inter, Fredoka } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const fredoka = Fredoka({ 
  weight: '400',
  subsets: ['latin'], 
  variable: '--font-fredoka' 
})

export const metadata: Metadata = {
  title: 'DiamondOS - Baseball League Management',
  description: 'Complete baseball league management platform for commissioners, managers, and players',
  keywords: ['baseball', 'league management', 'youth sports', 'scorekeeping', 'statistics'],
  authors: [{ name: 'DiamondOS Team' }],
  openGraph: {
    title: 'DiamondOS - Baseball League Management',
    description: 'Complete baseball league management platform',
    type: 'website',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DiamondOS - Baseball League Management',
    description: 'Complete baseball league management platform',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${fredoka.variable}`}>
      <body className={inter.className}>
        <div id="root" className="min-h-screen bg-background">
          {children}
        </div>
      </body>
    </html>
  )
}