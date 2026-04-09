'use client'
import { useEffect, useRef } from 'react'

export function useMagneticButton(strength = 0.3) {
  const ref = useRef<HTMLButtonElement | HTMLAnchorElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(pointer: coarse)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 80) {
        ;(el as HTMLElement).style.transform = `translate(${dx * strength}px, ${dy * strength}px)`
      }
    }
    const onLeave = () => {
      ;(el as HTMLElement).style.transition = 'transform 0.7s cubic-bezier(0.34,1.56,0.64,1)'
      ;(el as HTMLElement).style.transform = ''
      setTimeout(() => { (el as HTMLElement).style.transition = '' }, 700)
    }

    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [strength])

  return ref
}
