'use client'
import { useEffect, useRef } from 'react'

export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(pointer: coarse)').matches) return

    const dot = dotRef.current!
    const ring = ringRef.current!
    const label = labelRef.current!

    let ringX = 0; let ringY = 0
    let mouseX = 0; let mouseY = 0
    let raf = 0

    const lerp = (a: number, b: number, n: number) => a + (b - a) * n

    const tick = () => {
      ringX = lerp(ringX, mouseX, 0.12)
      ringY = lerp(ringY, mouseY, 0.12)
      ring.style.transform = `translate(${ringX - 18}px, ${ringY - 18}px)`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      dot.style.transform = `translate(${e.clientX - 3}px, ${e.clientY - 3}px)`
    }

    const onEnter = (e: Event) => {
      const el = e.currentTarget as HTMLElement
      const ctx = el.dataset.cursor || ''
      label.textContent = ctx
      ring.style.width = '72px'
      ring.style.height = '72px'
      if (ctx) ring.style.background = 'rgba(232,255,0,0.12)'
    }

    const onLeave = () => {
      label.textContent = ''
      ring.style.width = '36px'
      ring.style.height = '36px'
      ring.style.background = 'rgba(255,255,255,0.08)'
    }

    document.addEventListener('mousemove', onMove)

    const interactives = document.querySelectorAll<HTMLElement>('[data-cursor]')
    interactives.forEach(el => {
      el.addEventListener('mouseenter', onEnter)
      el.addEventListener('mouseleave', onLeave)
    })

    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('mousemove', onMove)
      interactives.forEach(el => {
        el.removeEventListener('mouseenter', onEnter)
        el.removeEventListener('mouseleave', onLeave)
      })
    }
  }, [])

  return (
    <>
      <div
        ref={dotRef}
        className="fixed top-0 left-0 z-[9999] w-[6px] h-[6px] rounded-full bg-[#E8FF00] pointer-events-none will-change-transform hidden md:block"
      />
      <div
        ref={ringRef}
        className="fixed top-0 left-0 z-[9998] w-[36px] h-[36px] rounded-full border border-white/20 bg-white/8 pointer-events-none will-change-transform transition-[width,height,background] duration-200 flex items-center justify-center hidden md:flex"
        style={{ background: 'rgba(255,255,255,0.08)' }}
      >
        <span ref={labelRef} className="text-[9px] font-label tracking-widest text-[#E8FF00] uppercase" />
      </div>
    </>
  )
}
