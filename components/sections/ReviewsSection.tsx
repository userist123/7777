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
          <p className="font-label text-[11px] tracking-[0.4em] text-[#555555] uppercase mb-4">Recenzii</p>
          <h2 className="font-display text-[clamp(30px,5vw,64px)] text-[#F0F0F0] leading-none">
            REZULTATE REALE. CLIENȚI REALI.
          </h2>
        </div>
        <div
          ref={trackRef}
          onMouseDown={onMouseDown}
          className="flex gap-4 md:gap-6 overflow-x-auto pb-4 cursor-grab select-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {REVIEWS.map(r => (
            <div
              key={r.name}
              className="flex-shrink-0 w-[280px] sm:w-[320px] bg-[#111111] border-l-2 border-[#E8FF00] p-5 md:p-7 rounded"
            >
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
