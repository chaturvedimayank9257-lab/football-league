import type { Metadata } from 'next'
import { Space_Grotesk } from 'next/font/google'
import './globals.css'
import Nav from '@/components/Nav'

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Barely Premier League',
  description: 'Where ambition exceeds ability — Est. 2026',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.className} bg-navy text-cream min-h-screen`}>
        <Nav />
        {children}
      </body>
    </html>
  )
}
