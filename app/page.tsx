// WOB ART — Homepage — v8 clean
import { Navbar } from '@/components/sections/Navbar'
import { HeroSection } from '@/components/sections/HeroSection'
import { TrustBar } from '@/components/sections/TrustBar'
import { ServicesSection } from '@/components/sections/ServicesSection'
import { BeforeAfterSection } from '@/components/sections/BeforeAfterSection'
import { PortfolioSection } from '@/components/sections/PortfolioSection'
import { EstimatorSection } from '@/components/sections/EstimatorSection'
import { ProcessSection } from '@/components/sections/ProcessSection'
import { ReviewsSection } from '@/components/sections/ReviewsSection'
import { QuoteForm } from '@/components/sections/QuoteForm'
import { CtaSection } from '@/components/sections/CtaSection'
import { Footer } from '@/components/sections/Footer'
import { Cursor } from '@/components/ui/Cursor'

export default function HomePage() {
  return (
    <main className="bg-[#0A0A0A] text-[#F0F0F0]">
      <Cursor />
      <Navbar />
      <HeroSection />
      <TrustBar />
      <ServicesSection />
      <BeforeAfterSection />
      <PortfolioSection />
      <EstimatorSection />
      <ProcessSection />
      <ReviewsSection />
      <QuoteForm />
      <CtaSection />
      <Footer />
    </main>
  )
}
