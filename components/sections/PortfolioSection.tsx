'use client'
import { useState } from 'react'
import Image from 'next/image'
import { PORTFOLIO } from '@/lib/constants'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { useReveal } from '@/hooks/useReveal'

function PortfolioCard({
  item,
  index,
  onOpen,
}: {
  item: typeof PORTFOLIO[0]
  index: number
  onOpen: () => void
}) {
  const ref = useReveal<HTMLButtonElement>({ delay: (index % 3) * 80 })
  return (
    <button
      ref={ref}
      onClick={onOpen}
      className="reveal group relative aspect-[4/3] overflow-hidden rounded cursor-pointer text-left w-full"
    >
      <Image
        src={item.img}
        alt={`${item.make} ${item.model}`}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
        sizes="(max-width:768px) 100vw,(max-width:1024px) 50vw,33vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <span className="inline-block font-label text-[10px] tracking-widest text-[#0A0A0A] bg-[#E8FF00] px-2 py-0.5 rounded mb-2">
          {item.badge}
        </span>
        <p className="font-display text-lg md:text-xl text-white">{item.make} {item.model}</p>
        <p className="font-sans text-xs text-white/60">{item.wrap}</p>
      </div>
    </button>
  )
}

export function PortfolioSection() {
  const [expanded, setExpanded] = useState<number | null>(null)
  const headRef = useReveal<HTMLDivElement>()
  const item = expanded !== null ? PORTFOLIO[expanded] : null

  return (
    <section id="portfolio" className="bg-[#111111] py-20 md:py-28 px-5 sm:px-8 md:px-12">
      <div className="max-w-[1400px] mx-auto">
        <div ref={headRef} className="reveal flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 md:mb-14">
          <div>
            <p className="font-label text-[11px] tracking-[0.4em] text-[#555555] uppercase mb-3">Portofoliu</p>
            <h2 className="font-display text-[clamp(36px,6vw,72px)] text-[#F0F0F0] leading-none">LUCRĂRI RECENTE</h2>
          </div>
          <p className="font-sans text-sm text-[#555555] sm:max-w-[240px] sm:text-right">
            Fiecare wrap este unic. Fiecare finisaj, impecabil.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {PORTFOLIO.map((p, i) => (
            <PortfolioCard key={p.id} item={p} index={i} onOpen={() => setExpanded(i)} />
          ))}
        </div>
      </div>

      {/* Modal */}
      {item && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
          style={{ background: 'rgba(0,0,0,0.90)' }}
          onClick={() => setExpanded(null)}
        >
          <div
            className="relative bg-[#111111] w-full max-w-2xl rounded-lg overflow-hidden shadow-2xl"
            style={{ maxHeight: 'min(92dvh, 700px)' }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setExpanded(null)}
              aria-label="Închide"
              className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center bg-black/70 text-[#F0F0F0] hover:text-[#E8FF00] rounded-full text-xl transition-colors border border-white/10"
            >
              ×
            </button>
            <div className="relative aspect-[16/9]">
              <Image
                src={item.img}
                alt={`${item.make} ${item.model}`}
                fill
                className="object-cover"
                sizes="(max-width:640px) 100vw, 768px"
              />
            </div>
            <div className="p-5 md:p-7 overflow-y-auto">
              <span className="font-label text-[10px] tracking-widest text-[#0A0A0A] bg-[#E8FF00] px-2 py-0.5 rounded">
                {item.badge}
              </span>
              <h3 className="font-display text-[clamp(28px,4vw,48px)] text-[#F0F0F0] mt-3 leading-none">
                {item.make} {item.model}
              </h3>
              <div className="grid grid-cols-3 gap-4 mt-4 mb-5 text-sm">
                <div>
                  <p className="text-[#555555] text-[11px] uppercase tracking-widest mb-1">Finisaj</p>
                  <p className="text-[#F0F0F0]">{item.wrap}</p>
                </div>
                <div>
                  <p className="text-[#555555] text-[11px] uppercase tracking-widest mb-1">An</p>
                  <p className="text-[#F0F0F0]">{item.year}</p>
                </div>
                <div>
                  <p className="text-[#555555] text-[11px] uppercase tracking-widest mb-1">Material</p>
                  <p className="text-[#F0F0F0]">Avery Dennison</p>
                </div>
              </div>
              <MagneticButton variant="accent" href="#quote" onClick={() => setExpanded(null)}>
                Solicită Similar
              </MagneticButton>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
