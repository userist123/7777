'use client'
import { useState, useEffect } from 'react'
import { MagneticButton } from '@/components/ui/MagneticButton'

const LINKS = [
  { label: 'Servicii', href: '#services' },
  { label: 'Portofoliu', href: '#portfolio' },
  { label: 'Proces', href: '#process' },
  { label: 'Estimare', href: '#estimator' },
  { label: 'Ofertă', href: '#quote' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Blochează scroll-ul când meniul e deschis
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-40 transition-all duration-500"
        style={{
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
          background: scrolled ? 'rgba(10,10,10,0.88)' : 'transparent',
        }}
      >
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 md:px-12 h-16 flex items-center justify-between">
          {/* Logo */}
          <a
            href="#"
            className="font-display text-2xl tracking-wider transition-colors duration-300 z-50 relative"
            style={{ color: menuOpen ? '#F0F0F0' : scrolled ? '#E8FF00' : '#F0F0F0' }}
          >
            WOB ART
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {LINKS.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="relative font-label text-[11px] tracking-widest text-[#555555] uppercase hover:text-[#F0F0F0] transition-colors group"
              >
                {link.label}
                <span className="absolute bottom-[-2px] left-1/2 -translate-x-1/2 h-[1px] bg-[#E8FF00] w-0 group-hover:w-full transition-all duration-300 origin-center" />
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <a href="/login" className="font-label text-[11px] tracking-widest text-[#555555] uppercase hover:text-[#F0F0F0] transition-colors">
              Cont
            </a>
            <MagneticButton variant="accent" size="sm" href="#quote">
              Ofertă
            </MagneticButton>
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col gap-[5px] p-2 relative z-50"
            aria-label="Deschide meniu"
          >
            <span
              className="block h-[1px] bg-[#F0F0F0] transition-all duration-300 origin-center"
              style={{ width: 24, transform: menuOpen ? 'rotate(45deg) translateY(6px)' : 'none' }}
            />
            <span
              className="block h-[1px] bg-[#F0F0F0] transition-all duration-300"
              style={{ width: menuOpen ? 0 : 16, opacity: menuOpen ? 0 : 1 }}
            />
            <span
              className="block h-[1px] bg-[#F0F0F0] transition-all duration-300 origin-center"
              style={{ width: 24, transform: menuOpen ? 'rotate(-45deg) translateY(-6px)' : 'none' }}
            />
          </button>
        </div>
      </header>

      {/* Meniu mobil fullscreen */}
      <div
        className="fixed inset-0 z-30 bg-[#0A0A0A] flex flex-col items-center justify-center gap-6 transition-all duration-500"
        style={{
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'auto' : 'none',
        }}
      >
        {LINKS.map((link, i) => (
          <a
            key={link.href}
            href={link.href}
            onClick={() => setMenuOpen(false)}
            className="font-display text-[clamp(40px,9vw,72px)] text-[#F0F0F0] hover:text-[#E8FF00] transition-colors"
            style={{
              opacity: menuOpen ? 1 : 0,
              transform: menuOpen ? 'translateY(0)' : 'translateY(20px)',
              transition: `opacity 0.4s ease ${i * 0.07}s, transform 0.4s ease ${i * 0.07}s, color 0.2s`,
            }}
          >
            {link.label}
          </a>
        ))}
        <a
          href="#quote"
          onClick={() => setMenuOpen(false)}
          className="mt-4 font-label text-sm tracking-widest text-[#E8FF00] border border-[#E8FF00]/30 px-8 py-3 rounded uppercase hover:bg-[#E8FF00]/5 transition-colors"
          style={{
            opacity: menuOpen ? 1 : 0,
            transition: `opacity 0.4s ease ${LINKS.length * 0.07 + 0.05}s`,
          }}
        >
          Solicită Ofertă
        </a>
      </div>
    </>
  )
}
