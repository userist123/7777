'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { SERVICES } from '@/lib/constants'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { useReveal } from '@/hooks/useReveal'

export function ServicesSection() {
  const [active, setActive] = useState(0)
  const [modal, setModal] = useState<number | null>(null)
  const headRef = useReveal<HTMLDivElement>()
  const listRef = useRef<HTMLDivElement>(null)

  /* ── Scroll cu rotița prin servicii ── */
  const onWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    setActive(prev => {
      if (e.deltaY > 0) return Math.min(prev + 1, SERVICES.length - 1)
      return Math.max(prev - 1, 0)
    })
  }, [])

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [onWheel])

  /* ── Blochează scroll pagina când modalul e deschis ── */
  useEffect(() => {
    document.body.style.overflow = modal !== null ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [modal])

  return (
    <section id="services" className="bg-[#0A0A0A] py-20 md:py-28 px-5 sm:px-8 md:px-12">
      <div className="max-w-[1400px] mx-auto">
        <div ref={headRef} className="reveal mb-12 md:mb-16">
          <p className="font-label text-[11px] tracking-[0.4em] text-[#555555] uppercase mb-3">Serviciile Noastre</p>
          <h2 className="font-display text-[clamp(36px,6vw,72px)] text-[#F0F0F0] leading-none">CE FACEM</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border border-white/[0.07] rounded overflow-hidden">
          {/* Stânga: listă servicii */}
          <div ref={listRef} className="border-b lg:border-b-0 lg:border-r border-white/[0.07]">
            {SERVICES.map((svc, i) => (
              <button
                key={svc.num}
                onMouseEnter={() => setActive(i)}
                onClick={() => setModal(i)}
                className="group w-full text-left py-5 md:py-6 px-5 md:px-8 border-b border-white/[0.07] last:border-b-0 relative overflow-hidden transition-colors duration-300 hover:bg-white/[0.02]"
              >
                {/* Bară progres galbenă jos */}
                <div
                  className="absolute bottom-0 left-0 h-[1px] bg-[#E8FF00] transition-all duration-500"
                  style={{ width: active === i ? '100%' : '0%' }}
                />
                <div className="flex items-baseline gap-3 md:gap-4">
                  <span
                    className="font-mono text-[11px] tracking-widest transition-colors duration-300 shrink-0"
                    style={{ color: active === i ? '#E8FF00' : '#333' }}
                  >
                    {svc.num}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3
                      className="font-display leading-none transition-all duration-300 truncate"
                      style={{
                        fontSize: active === i ? 'clamp(24px,3.2vw,44px)' : 'clamp(20px,2.4vw,32px)',
                        color: active === i ? '#F0F0F0' : '#333333',
                      }}
                    >
                      {svc.title}
                    </h3>
                    <p
                      className="font-sans text-xs md:text-sm mt-1 transition-opacity duration-300 text-[#555]"
                      style={{ opacity: active === i ? 1 : 0.5 }}
                    >
                      {svc.tagline}
                    </p>
                  </div>
                  <span
                    className="ml-auto font-label text-[10px] tracking-widest shrink-0 transition-all duration-300 hidden sm:block"
                    style={{ color: active === i ? '#E8FF00' : 'transparent' }}
                  >
                    DETALII →
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Dreapta: panou imagine */}
          <div className="relative aspect-[4/3] lg:aspect-auto overflow-hidden min-h-[220px] lg:min-h-0">
            {SERVICES.map((svc, i) => (
              <div
                key={svc.num}
                className="absolute inset-0 transition-all duration-700"
                style={{
                  clipPath: active === i
                    ? 'inset(0% 0 0% 0)'
                    : i < active
                    ? 'inset(0 0 100% 0)'
                    : 'inset(100% 0 0% 0)',
                }}
              >
                <Image
                  src={svc.image}
                  alt={svc.title}
                  fill
                  className="object-cover"
                  sizes="(max-width:1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 right-4 text-right">
                  <p className="font-label text-[10px] tracking-widest text-white/50 uppercase">De la</p>
                  <p className="font-display text-[clamp(28px,3.5vw,48px)] text-[#E8FF00] leading-none">{svc.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center mt-4 font-sans text-xs text-[#333333] lg:hidden">
          Apasă pe orice serviciu pentru detalii
        </p>
      </div>

      {/* ── Modal ── */}
      {modal !== null && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 md:p-8"
          style={{ background: 'rgba(0,0,0,0.85)' }}
          onClick={() => setModal(null)}
        >
          <div
            className="relative bg-[#111111] w-full max-w-lg rounded-lg overflow-hidden shadow-2xl"
            style={{ maxHeight: 'min(92dvh, 700px)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Imagine header */}
            <div className="relative aspect-[16/7] w-full">
              <Image
                src={SERVICES[modal].image}
                alt={SERVICES[modal].title}
                fill
                className="object-cover"
                sizes="(max-width:640px) 100vw, 512px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/20 to-transparent" />
            </div>

            {/* Buton închidere */}
            <button
              onClick={() => setModal(null)}
              aria-label="Închide"
              className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center bg-black/70 text-[#F0F0F0] hover:text-[#E8FF00] rounded-full text-xl transition-colors border border-white/10"
            >
              ×
            </button>

            {/* Conținut modal */}
            <div className="px-6 sm:px-8 pb-7 pt-1 overflow-y-auto" style={{ maxHeight: 340 }}>
              <p className="font-mono text-[11px] tracking-widest text-[#E8FF00] mb-2">{SERVICES[modal].num}</p>
              <h2 className="font-display text-[clamp(32px,6vw,56px)] text-[#F0F0F0] leading-none mb-4">
                {SERVICES[modal].title}
              </h2>
              <ul className="space-y-2.5 mb-6">
                {SERVICES[modal].inclusions.map(inc => (
                  <li key={inc} className="flex items-start gap-3 font-sans text-sm text-[#888888]">
                    <span className="text-[#E8FF00] shrink-0 mt-0.5">—</span>
                    {inc}
                  </li>
                ))}
              </ul>
              <p className="font-display text-[clamp(24px,4vw,40px)] text-[#E8FF00] mb-6">
                DE LA {SERVICES[modal].price}
              </p>
              <MagneticButton variant="accent" size="lg" href="#quote" onClick={() => setModal(null)}>
                Solicită Ofertă
              </MagneticButton>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
