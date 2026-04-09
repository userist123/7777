import pathlib

# All files that need to be overwritten with clean content (no gsap/lenis/three)

files = {}

# ── LenisProvider ──────────────────────────────────────────────────────────────
files['components/LenisProvider.tsx'] = """\
'use client'
// No-op: native scroll-behavior: smooth applied via CSS
export function LenisProvider() {
  return null
}
"""

# ── three-particles stub (no three import) ─────────────────────────────────────
files['lib/three-particles.ts'] = """\
// Stub: three.js removed. File kept to satisfy any cached import traces.
export {}
"""

# ── TrustBar ───────────────────────────────────────────────────────────────────
files['components/sections/TrustBar.tsx'] = """\
'use client'
import { useEffect, useRef } from 'react'
import { useReveal } from '@/hooks/useReveal'

const STATS = [
  { value: 847, suffix: '+', label: 'Vehicles Wrapped' },
  { value: 7,   suffix: '',  label: 'Years in Business' },
  { value: 3,   suffix: 'M', label: 'Avery Certified' },
  { value: 5,   suffix: 'yr',label: 'Warranty' },
]

function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const elRef = useRef<HTMLSpanElement>(null)
  const didRun = useRef(false)
  useEffect(() => {
    const el = elRef.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || didRun.current) return
      didRun.current = true
      observer.disconnect()
      const duration = 1800
      const start = performance.now()
      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1)
        const ease = 1 - Math.pow(1 - t, 3)
        el.textContent = Math.round(ease * target).toString()
        if (t < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, { threshold: 0.5 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [target])
  return <span className="tabular-nums"><span ref={elRef}>0</span>{suffix}</span>
}

export function TrustBar() {
  const ref = useReveal<HTMLElement>()
  return (
    <section ref={ref} className="reveal bg-[#111111] border-y border-white/[0.07] py-12 md:py-16">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 md:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 md:divide-x md:divide-white/[0.07]">
          {STATS.map(stat => (
            <div key={stat.label} className="flex flex-col items-center text-center px-4 md:px-8 py-4">
              <div className="font-display text-[clamp(44px,6vw,72px)] leading-none text-[#E8FF00]">
                <CountUp target={stat.value} suffix={stat.suffix} />
              </div>
              <p className="font-sans text-[11px] tracking-[0.25em] text-[#555555] uppercase mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
"""

# ── ServicesSection ────────────────────────────────────────────────────────────
files['components/sections/ServicesSection.tsx'] = """\
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

  return (
    <section id="services" className="bg-[#0A0A0A] py-20 md:py-28 px-5 sm:px-8 md:px-12">
      <div className="max-w-[1400px] mx-auto">
        <div ref={headRef} className="reveal mb-12 md:mb-16">
          <p className="font-label text-[11px] tracking-[0.4em] text-[#555555] uppercase mb-3">Our Services</p>
          <h2 className="font-display text-[clamp(36px,6vw,72px)] text-[#F0F0F0] leading-none">WHAT WE DO</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border border-white/[0.07] rounded overflow-hidden">
          <div ref={listRef} className="border-b lg:border-b-0 lg:border-r border-white/[0.07]">
            {SERVICES.map((svc, i) => (
              <button
                key={svc.num}
                onMouseEnter={() => setActive(i)}
                onClick={() => setModal(i)}
                className="group w-full text-left py-5 md:py-6 px-6 md:px-8 border-b border-white/[0.07] last:border-b-0 relative overflow-hidden transition-colors duration-300 hover:bg-white/[0.02]"
              >
                <div
                  className="absolute bottom-0 left-0 h-[1px] bg-[#E8FF00] transition-all duration-500"
                  style={{ width: active === i ? '100%' : '0%' }}
                />
                <div className="flex items-baseline gap-4">
                  <span
                    className="font-mono text-[11px] tracking-widest transition-colors duration-300 shrink-0"
                    style={{ color: active === i ? '#E8FF00' : '#333' }}
                  >{svc.num}</span>
                  <div className="min-w-0">
                    <h3
                      className="font-display leading-none transition-all duration-300"
                      style={{
                        fontSize: active === i ? 'clamp(28px,3.5vw,48px)' : 'clamp(22px,2.5vw,36px)',
                        color: active === i ? '#F0F0F0' : '#333333',
                      }}
                    >{svc.title}</h3>
                    <p className="font-sans text-sm mt-1 text-[#555]" style={{ opacity: active === i ? 1 : 0.5 }}>
                      {svc.tagline}
                    </p>
                  </div>
                  <span
                    className="ml-auto font-label text-[11px] tracking-widest shrink-0 transition-colors duration-300"
                    style={{ color: active === i ? '#E8FF00' : 'transparent' }}
                  >TAP →</span>
                </div>
              </button>
            ))}
          </div>

          <div className="relative aspect-[4/3] lg:aspect-auto overflow-hidden min-h-[240px]">
            {SERVICES.map((svc, i) => (
              <div
                key={svc.num}
                className="absolute inset-0 transition-all duration-700"
                style={{
                  clipPath: active === i ? 'inset(0% 0 0% 0)' : i < active ? 'inset(0 0 100% 0)' : 'inset(100% 0 0% 0)',
                }}
              >
                <Image src={svc.image} alt={svc.title} fill className="object-cover" sizes="(max-width:1024px) 100vw, 50vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-5 right-5 text-right">
                  <p className="font-label text-[10px] tracking-widest text-white/50 uppercase">Starting from</p>
                  <p className="font-display text-[clamp(28px,3.5vw,48px)] text-[#E8FF00] leading-none">{svc.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-center mt-5 font-sans text-xs text-[#333] md:hidden">Apasa pe serviciu pentru detalii</p>
      </div>

      {modal !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/80"
          onClick={() => setModal(null)}
        >
          <div
            className="relative bg-[#111111] w-full sm:max-w-2xl sm:rounded overflow-hidden max-h-[92dvh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative aspect-[16/7] w-full">
              <Image src={SERVICES[modal].image} alt={SERVICES[modal].title} fill className="object-cover" sizes="(max-width:640px) 100vw, 672px" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent" />
            </div>
            <button
              onClick={() => setModal(null)}
              aria-label="Close"
              className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center bg-black/60 text-[#F0F0F0] hover:text-[#E8FF00] rounded-full text-xl transition-colors"
            >×</button>
            <div className="px-6 sm:px-10 pb-8 pt-2">
              <p className="font-mono text-[11px] tracking-widest text-[#E8FF00] mb-3">{SERVICES[modal].num}</p>
              <h2 className="font-display text-[clamp(40px,7vw,72px)] text-[#F0F0F0] leading-none mb-5">{SERVICES[modal].title}</h2>
              <ul className="space-y-3 mb-7">
                {SERVICES[modal].inclusions.map(inc => (
                  <li key={inc} className="flex items-start gap-3 font-sans text-sm text-[#888]">
                    <span className="text-[#E8FF00] shrink-0 mt-0.5">—</span>{inc}
                  </li>
                ))}
              </ul>
              <p className="font-display text-[clamp(28px,4vw,44px)] text-[#E8FF00] mb-7">FROM {SERVICES[modal].price}</p>
              <MagneticButton variant="accent" size="lg" href="#quote" onClick={() => setModal(null)}>Get a Quote</MagneticButton>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
"""

# ── ReviewsSection ─────────────────────────────────────────────────────────────
files['components/sections/ReviewsSection.tsx'] = """\
'use client'
import { useRef } from 'react'
import { REVIEWS } from '@/lib/constants'
import { useReveal } from '@/hooks/useReveal'

export function ReviewsSection() {
  const headRef = useReveal<HTMLDivElement>()
  const trackRef = useRef<HTMLDivElement>(null)

  const onMouseDown = (e: React.MouseEvent) => {
    const track = trackRef.current
    if (!track) return
    const startX = e.pageX - track.offsetLeft
    const scrollLeft = track.scrollLeft
    track.style.cursor = 'grabbing'
    const onMove = (ev: MouseEvent) => {
      const x = ev.pageX - track.offsetLeft
      track.scrollLeft = scrollLeft - (x - startX) * 1.5
    }
    const onUp = () => {
      track.style.cursor = 'grab'
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <section className="bg-[#0A0A0A] py-20 md:py-28 px-5 sm:px-8 md:px-12 overflow-hidden">
      <div className="max-w-[1400px] mx-auto">
        <div ref={headRef} className="reveal text-center mb-10 md:mb-14">
          <p className="font-label text-[11px] tracking-[0.4em] text-[#555555] uppercase mb-4">Reviews</p>
          <h2 className="font-display text-[clamp(30px,5vw,64px)] text-[#F0F0F0] leading-none">REAL RESULTS. REAL CLIENTS.</h2>
        </div>
        <div
          ref={trackRef}
          onMouseDown={onMouseDown}
          className="flex gap-4 md:gap-6 overflow-x-auto pb-4 cursor-grab select-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {REVIEWS.map(r => (
            <div key={r.name} className="flex-shrink-0 w-[280px] sm:w-[320px] bg-[#111111] border-l-2 border-[#E8FF00] p-5 md:p-7 rounded">
              <div className="flex gap-0.5 mb-4">
                {[...Array(r.stars)].map((_, i) => (
                  <svg key={i} width="13" height="13" viewBox="0 0 16 16" fill="#E8FF00">
                    <path d="M8 1l1.854 3.756L14 5.382l-3 2.924.708 4.131L8 10.354l-3.708 2.083L5 8.306 2 5.382l4.146-.626L8 1z" />
                  </svg>
                ))}
              </div>
              <p className="font-sans text-sm text-[#F0F0F0]/80 leading-relaxed mb-5">&ldquo;{r.quote}&rdquo;</p>
              <div>
                <p className="font-label text-sm tracking-wide text-[#F0F0F0]">{r.name}</p>
                <p className="font-sans text-xs text-[#555555] mt-0.5">{r.car}</p>
                <p className="font-mono text-[10px] text-[#555555]/60 mt-1">{r.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
"""

# ── HeroSection ────────────────────────────────────────────────────────────────
files['components/sections/HeroSection.tsx'] = """\
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
      <div className="absolute inset-0 z-[1]">
        <Image src="/images/hero-car.jpg" alt="" fill priority className="object-cover object-center opacity-40" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/80 via-transparent to-[#0A0A0A]/40" />
      </div>
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[300px] bg-[#E8FF00]/5 blur-[120px] rounded-full z-[1] pointer-events-none" />
      <div className="relative z-[2] max-w-[1400px] mx-auto px-5 sm:px-8 md:px-12 pt-28 md:pt-32 pb-16 md:pb-20">
        <div className="max-w-3xl">
          <p ref={taglineRef} className="reveal font-label text-[11px] tracking-[0.4em] text-[#E8FF00] uppercase mb-5 md:mb-6">
            Premium Atelier — București · Est. 2018
          </p>
          <h1 ref={h1Ref} className="reveal font-display text-[clamp(56px,12vw,160px)] leading-[0.88] text-[#F0F0F0] mb-2 tracking-tight">
            YOUR CAR.
          </h1>
          <h2 ref={h2Ref} className="reveal font-display text-[clamp(44px,9vw,120px)] leading-[0.88] text-[#E8FF00] mb-8 md:mb-10 tracking-tight">
            REIMAGINED.
          </h2>
          <div ref={ctaRef} className="reveal flex flex-wrap gap-3 md:gap-4 items-center mb-8 md:mb-12">
            <MagneticButton variant="accent" size="lg" href="#quote">Request Quote</MagneticButton>
            <MagneticButton variant="ghost" size="lg" href="#portfolio">Our Work</MagneticButton>
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
              <strong className="text-[#F0F0F0]">847</strong> vehicles transformed
            </span>
          </div>
        </div>
      </div>
      <div className="relative z-[2] mt-auto">
        <Marquee text="FULL WRAP · PPF · CHROME DELETE · COLOR SHIFT · SATIN · GLOSS · MATTE · AVERY DENNISON · 3M · KPMF ·" />
      </div>
    </section>
  )
}
"""

# ── ProcessSection ─────────────────────────────────────────────────────────────
files['components/sections/ProcessSection.tsx'] = """\
'use client'
import { useReveal } from '@/hooks/useReveal'

const STEPS = [
  { num: '01', title: 'CHOOSE YOUR LOOK', body: 'Browse our finish catalogue or bring your own vision. We guide you through 3M, Avery Dennison and KPMF material options — gloss, matte, satin, chrome or full colour-shift.' },
  { num: '02', title: 'GET YOUR QUOTE',   body: 'Same-day detailed response. We inspect your vehicle, confirm the finish, and send a transparent quote with no hidden costs.' },
  { num: '03', title: 'TRANSFORM',        body: 'Drop off your vehicle at our București atelier. Our certified technicians handle the full installation. Pick up in 3–5 days with a 5-year warranty on every wrap.' },
]

function StepCard({ step, i }: { step: typeof STEPS[0]; i: number }) {
  const ref = useReveal<HTMLDivElement>({ delay: i * 120 })
  return (
    <div ref={ref} className="reveal bg-[#0A0A0A] border border-white/[0.07] rounded p-6 md:p-8 relative overflow-hidden">
      <span className="absolute top-4 right-4 font-display text-[100px] md:text-[120px] leading-none select-none pointer-events-none"
        style={{ color: i === 0 ? 'rgba(232,255,0,0.04)' : 'rgba(255,255,255,0.03)' }}>
        {step.num}
      </span>
      <div className="relative z-10">
        <span className="font-mono text-[11px] tracking-widest text-[#E8FF00]">{step.num}</span>
        <h3 className="font-display text-[clamp(26px,3vw,40px)] text-[#F0F0F0] leading-none mt-3 mb-4">{step.title}</h3>
        <p className="font-sans text-sm text-[#555555] leading-relaxed">{step.body}</p>
      </div>
    </div>
  )
}

export function ProcessSection() {
  const headRef = useReveal<HTMLDivElement>()
  return (
    <section id="process" className="bg-[#111111] py-20 md:py-28 px-5 sm:px-8 md:px-12">
      <div className="max-w-[1400px] mx-auto">
        <div ref={headRef} className="reveal text-center mb-12 md:mb-16">
          <p className="font-label text-[11px] tracking-[0.4em] text-[#555555] uppercase mb-4">How It Works</p>
          <h2 className="font-display text-[clamp(36px,6vw,72px)] text-[#F0F0F0] leading-none">THE PROCESS</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {STEPS.map((step, i) => <StepCard key={step.num} step={step} i={i} />)}
        </div>
      </div>
    </section>
  )
}
"""

# ── PortfolioSection ───────────────────────────────────────────────────────────
files['components/sections/PortfolioSection.tsx'] = """\
'use client'
import { useState } from 'react'
import Image from 'next/image'
import { PORTFOLIO } from '@/lib/constants'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { useReveal } from '@/hooks/useReveal'

function PortfolioCard({ item, index, onOpen }: { item: typeof PORTFOLIO[0]; index: number; onOpen: () => void }) {
  const ref = useReveal<HTMLButtonElement>({ delay: (index % 3) * 80 })
  return (
    <button ref={ref} onClick={onOpen}
      className="reveal group relative aspect-[4/3] overflow-hidden rounded cursor-pointer text-left w-full">
      <Image src={item.img} alt={`${item.make} ${item.model}`} fill
        className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
        sizes="(max-width:768px) 100vw,(max-width:1024px) 50vw,33vw" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <span className="inline-block font-label text-[10px] tracking-widest text-[#0A0A0A] bg-[#E8FF00] px-2 py-0.5 rounded mb-2">{item.badge}</span>
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
            <p className="font-label text-[11px] tracking-[0.4em] text-[#555555] uppercase mb-3">Portfolio</p>
            <h2 className="font-display text-[clamp(36px,6vw,72px)] text-[#F0F0F0] leading-none">RECENT WORK</h2>
          </div>
          <p className="font-sans text-sm text-[#555555] sm:max-w-[240px] sm:text-right">Every wrap is unique. Every finish, flawless.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {PORTFOLIO.map((p, i) => <PortfolioCard key={p.id} item={p} index={i} onOpen={() => setExpanded(i)} />)}
        </div>
      </div>

      {item && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/90" onClick={() => setExpanded(null)}>
          <div className="relative bg-[#111111] w-full sm:max-w-3xl sm:rounded overflow-hidden max-h-[92dvh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <button onClick={() => setExpanded(null)} aria-label="Close"
              className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center bg-black/60 text-[#F0F0F0] hover:text-[#E8FF00] rounded-full text-xl transition-colors">×</button>
            <div className="relative aspect-[16/9]">
              <Image src={item.img} alt={`${item.make} ${item.model}`} fill className="object-cover" sizes="(max-width:640px) 100vw, 768px" />
            </div>
            <div className="p-6 md:p-8">
              <span className="font-label text-[10px] tracking-widest text-[#0A0A0A] bg-[#E8FF00] px-2 py-0.5 rounded">{item.badge}</span>
              <h3 className="font-display text-[clamp(28px,4vw,48px)] text-[#F0F0F0] mt-3 leading-none">{item.make} {item.model}</h3>
              <div className="grid grid-cols-3 gap-4 mt-5 mb-6 text-sm">
                <div><p className="text-[#555] text-[11px] uppercase tracking-widest mb-1">Finish</p><p className="text-[#F0F0F0]">{item.wrap}</p></div>
                <div><p className="text-[#555] text-[11px] uppercase tracking-widest mb-1">Year</p><p className="text-[#F0F0F0]">{item.year}</p></div>
                <div><p className="text-[#555] text-[11px] uppercase tracking-widest mb-1">Material</p><p className="text-[#F0F0F0]">Avery Dennison</p></div>
              </div>
              <MagneticButton variant="accent" href="#quote" onClick={() => setExpanded(null)}>Request Similar</MagneticButton>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
"""

# ── BeforeAfterSection ─────────────────────────────────────────────────────────
files['components/sections/BeforeAfterSection.tsx'] = """\
'use client'
import { BeforeAfter } from '@/components/ui/BeforeAfter'
import { useReveal } from '@/hooks/useReveal'

const SLIDERS = [
  { before: '/images/ba-before-1.jpg', after: '/images/ba-after-1.jpg', label: 'BMW 5 Series — Matte Black' },
  { before: '/images/ba-before-2.jpg', after: '/images/ba-after-2.jpg', label: 'Audi A4 — Satin Midnight Blue' },
  { before: '/images/ba-before-3.jpg', after: '/images/ba-after-3.jpg', label: 'Porsche Cayenne — Gloss Gold' },
]

function BACard({ s, i }: { s: typeof SLIDERS[0]; i: number }) {
  const ref = useReveal<HTMLDivElement>({ delay: i * 100 })
  return <div ref={ref} className="reveal"><BeforeAfter before={s.before} after={s.after} label={s.label} /></div>
}

export function BeforeAfterSection() {
  const headRef = useReveal<HTMLDivElement>()
  return (
    <section id="transformation" className="bg-[#0A0A0A] py-20 md:py-28 px-5 sm:px-8 md:px-12">
      <div className="max-w-[1400px] mx-auto">
        <div ref={headRef} className="reveal text-center mb-12 md:mb-16">
          <p className="font-label text-[11px] tracking-[0.4em] text-[#555555] uppercase mb-4">The Work</p>
          <h2 className="font-display text-[clamp(40px,8vw,96px)] text-[#F0F0F0] leading-none">THE TRANSFORMATION</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {SLIDERS.map((s, i) => <BACard key={s.label} s={s} i={i} />)}
        </div>
      </div>
    </section>
  )
}
"""

# ── useReveal hook ─────────────────────────────────────────────────────────────
files['hooks/useReveal.ts'] = """\
'use client'
import { useEffect, useRef } from 'react'

interface UseRevealOptions {
  delay?: number
  threshold?: number
}

export function useReveal<T extends HTMLElement>(options: UseRevealOptions = {}) {
  const { delay = 0, threshold = 0.15 } = options
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Set delay as individual properties to avoid shorthand conflict warning
    if (delay) {
      el.style.transitionDuration = '0.75s'
      el.style.transitionTimingFunction = 'cubic-bezier(0.16, 1, 0.3, 1)'
      el.style.transitionDelay = delay + 'ms'
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('reveal-visible')
          observer.disconnect()
        }
      },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [delay, threshold])

  return ref
}
"""

# Write all files
base = pathlib.Path('/vercel/share/v0-project')
for rel, content in files.items():
    path = base / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding='utf-8')
    size = len(content.encode('utf-8'))
    print(f"OK  {rel}  ({size} bytes)")

print("\\nAll files written.")
