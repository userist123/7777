import type { Metadata, Viewport } from 'next'
import { Bebas_Neue, Barlow_Condensed, DM_Sans, JetBrains_Mono } from 'next/font/google'
import { LenisProvider } from '@/components/LenisProvider'
import './globals.css'

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas-neue',
  display: 'swap',
})

const barlowCondensed = Barlow_Condensed({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-barlow-condensed',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'WOB ART — Premium Car Wrapping, PPF & Detailing | București',
  description:
    'Atelier premium de car wrapping, PPF și detailing în București. Transformăm vehiculele cu materiale 3M, Avery Dennison și KPMF. 847+ vehicule transformate. Garanție 5 ani.',
  keywords:
    'car wrapping, PPF, detailing, folie auto, protectie vopsea, wrap masina, WOB ART, Bucuresti',
  openGraph: {
    title: 'WOB ART — Premium Car Wrapping',
    description: 'Your car. Reimagined. Premium wrapping studio in București.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#0A0A0A',
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ro"
      data-scroll-behavior="smooth"
      className={`${bebasNeue.variable} ${barlowCondensed.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased bg-[#0A0A0A] text-[#F0F0F0]">
        <LenisProvider />
        {children}
      </body>
    </html>
  )
}
