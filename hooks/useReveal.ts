'use client'
import { useEffect, useRef } from 'react'

interface UseRevealOptions {
  delay?: number
  threshold?: number
}

/**
 * Attaches IntersectionObserver to an element.
 * When visible, adds `reveal-visible` class (defined in globals.css).
 * transitionDelay is set via a CSS custom property to avoid shorthand conflict.
 */
export function useReveal<T extends HTMLElement>(options: UseRevealOptions = {}) {
  const { delay = 0, threshold = 0.15 } = options
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Use CSS custom property instead of inline transitionDelay to avoid
    // browser warning about shorthand/longhand conflict
    if (delay) {
      el.style.setProperty('--reveal-delay', `${delay}ms`)
      el.style.transitionDelay = `${delay}ms`
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
