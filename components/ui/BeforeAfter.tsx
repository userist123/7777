'use client'
import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'

interface BeforeAfterProps {
  before: string
  after: string
  label?: string
}

export function BeforeAfter({ before, after, label }: BeforeAfterProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [pct, setPct] = useState(50)
  const dragging = useRef(false)

  const update = (clientX: number) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    setPct(x * 100)
  }

  useEffect(() => {
    const onUp = () => { dragging.current = false }
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!dragging.current) return
      e.preventDefault()
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      update(clientX)
    }
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchend', onUp)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('touchmove', onMove, { passive: false })
    return () => {
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchend', onUp)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchmove', onMove)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[560/380] overflow-hidden rounded select-none cursor-ew-resize"
      data-cursor="DRAG"
      onMouseDown={(e) => {
        dragging.current = true
        update(e.clientX)
      }}
      onMouseMove={(e) => {
        if (dragging.current) update(e.clientX)
      }}
      onClick={(e) => {
        update(e.clientX)
      }}
      onTouchStart={(e) => {
        dragging.current = true
        update(e.touches[0].clientX)
      }}
    >
      {/* After (full) */}
      <Image src={after} alt="After" fill className="object-cover" sizes="560px" />

      {/* Before (clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}
      >
        <Image src={before} alt="Before" fill className="object-cover" sizes="560px" />
      </div>

      {/* Divider */}
      <div
        className="absolute top-0 bottom-0 w-[2px] bg-[#E8FF00] pointer-events-none"
        style={{ left: `${pct}%`, transform: 'translateX(-50%)' }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-[#E8FF00] bg-[#0A0A0A] flex items-center justify-center">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 6H9M3 6L1 4M3 6L1 8M9 6L11 4M9 6L11 8" stroke="#E8FF00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Labels */}
      <span className="absolute top-3 left-3 text-[10px] font-label tracking-widest text-white/50 uppercase bg-black/40 px-2 py-1 rounded">BEFORE</span>
      <span className="absolute top-3 right-3 text-[10px] font-label tracking-widest text-[#E8FF00] uppercase bg-black/40 px-2 py-1 rounded">AFTER</span>

      {label && (
        <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[11px] font-label tracking-widest text-white/60 uppercase bg-black/50 px-3 py-1 rounded">
          {label}
        </span>
      )}
    </div>
  )
}
