'use client'
import { useRef } from 'react'
import { BeforeAfter } from '@/components/ui/BeforeAfter'
import { useReveal } from '@/hooks/useReveal'

const SLIDE_URI = [
  { before: '/images/ba-before-1.jpg', after: '/images/ba-after-1.jpg', label: 'BMW Seria 5 — Negru Mat' },
  { before: '/images/ba-before-2.jpg', after: '/images/ba-after-2.jpg', label: 'Audi A4 — Satin Midnight Blue' },
  { before: '/images/ba-before-3.jpg', after: '/images/ba-after-3.jpg', label: 'Porsche Cayenne — Gloss Auriu' },
]

function CardBA({ s, i }: { s: typeof SLIDE_URI[0]; i: number }) {
  const ref = useReveal<HTMLDivElement>({ delay: i * 100 })
  return (
    <div ref={ref} className="reveal">
      <BeforeAfter before={s.before} after={s.after} label={s.label} />
    </div>
  )
}

export function BeforeAfterSection() {
  const headRef = useReveal<HTMLDivElement>()
  return (
    <section id="transformation" className="bg-[#0A0A0A] py-20 md:py-28 px-5 sm:px-8 md:px-12">
      <div className="max-w-[1400px] mx-auto">
        <div ref={headRef} className="reveal text-center mb-12 md:mb-16">
          <p className="font-label text-[11px] tracking-[0.4em] text-[#555555] uppercase mb-4">Lucrările Noastre</p>
          <h2 className="font-display text-[clamp(40px,8vw,96px)] text-[#F0F0F0] leading-none">TRANSFORMAREA</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {SLIDE_URI.map((s, i) => <CardBA key={s.label} s={s} i={i} />)}
        </div>
      </div>
    </section>
  )
}
