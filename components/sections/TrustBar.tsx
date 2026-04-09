'use client'
import { useEffect, useRef } from 'react'
import { useReveal } from '@/hooks/useReveal'

const STATS = [
  { value: 847, suffix: '+', label: 'Vehicule Transformate' },
  { value: 7,   suffix: '',  label: 'Ani de Experiență' },
  { value: 3,   suffix: 'M', label: 'Certificare Avery' },
  { value: 5,   suffix: ' ani', label: 'Garanție Montaj' },
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
