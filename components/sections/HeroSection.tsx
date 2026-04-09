'use client'
import Image from 'next/image'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { Marquee } from '@/components/ui/Marquee'
import { useReveal } from '@/hooks/useReveal'

export function HeroSection() {
  const taglineRef = useReveal<HTMLParagraphElement>({ delay: 0 })
  const h1Ref = useReveal<HTMLHeadingElement>({ delay: 100 })
  const h2Ref = useReveal<HTMLHeadingElement>({ delay: 200 })
  const ctaRef = useReveal<HTMLDivElement>({ delay: 320 })
  const subRef = useReveal<HTMLDivElement>({ delay: 420 })

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-[#0A0A0A]">
      {/* Imagine fundal */}
      <div className="absolute inset-0 z-[1]">
        <Image
          src="/images/hero-car.jpg"
          alt=""
          fill
          priority
          className="object-cover object-center opacity-40"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/80 via-transparent to-[#0A0A0A]/40" />
      </div>

      {/* Lumină ambientală */}
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[300px] bg-[#E8FF00]/5 blur-[120px] rounded-full z-[1] pointer-events-none" />

      {/* Conținut */}
      <div className="relative z-[2] max-w-[1400px] mx-auto px-5 sm:px-8 md:px-12 pt-28 md:pt-32 pb-16 md:pb-20">
        <div className="max-w-3xl">
          <p ref={taglineRef} className="reveal font-label text-[11px] tracking-[0.4em] text-[#E8FF00] uppercase mb-5 md:mb-6">
            Atelier Premium — București · Est. 2018
          </p>
          <h1 ref={h1Ref} className="reveal font-display text-[clamp(56px,12vw,160px)] leading-[0.88] text-[#F0F0F0] mb-2 tracking-tight">
            MAȘINA TA.
          </h1>
          <h2 ref={h2Ref} className="reveal font-display text-[clamp(44px,9vw,120px)] leading-[0.88] text-[#E8FF00] mb-8 md:mb-10 tracking-tight">
            REINVENTATĂ.
          </h2>
          <div ref={ctaRef} className="reveal flex flex-wrap gap-3 md:gap-4 items-center mb-8 md:mb-12">
            <MagneticButton variant="accent" size="lg" href="#quote">Solicită Ofertă</MagneticButton>
            <MagneticButton variant="ghost" size="lg" href="#portfolio">Lucrările Noastre</MagneticButton>
          </div>
          <div ref={subRef} className="reveal flex items-center gap-3">
            <div className="flex -space-x-0.5">
              {[...Array(5)].map((_, i) => (
                <svg key={i} width="14" height="14" viewBox="0 0 16 16" fill="#E8FF00">
                  <path d="M8 1l1.854 3.756L14 5.382l-3 2.924.708 4.131L8 10.354l-3.708 2.083L5 8.306 2 5.382l4.146-.626L8 1z" />
                </svg>
              ))}
            </div>
            <span className="font-sans text-sm text-[#555555]">
              <strong className="text-[#F0F0F0]">847</strong> vehicule transformate
            </span>
          </div>
        </div>
      </div>

      {/* Bandă animată */}
      <div className="relative z-[2] mt-auto">
        <Marquee text="WRAP COMPLET · PPF · ȘTERGERE CROM · COLOR SHIFT · SATIN · GLOSS · MATTE · AVERY DENNISON · 3M · KPMF ·" />
      </div>
    </section>
  )
}
