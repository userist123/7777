'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, ChevronRight } from 'lucide-react'

const navLinks = [
  { label: 'Servicii', href: '#servicii' },
  { label: 'Proces', href: '#proces' },
  { label: 'Galerie', href: '#galerie' },
  { label: 'Contact', href: '#contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'glass py-3' : 'py-5'}`}
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(-80px)',
          transition: 'opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1), background 0.5s, padding 0.3s',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-display text-2xl tracking-widest text-[#EEEEFC] group-hover:text-[#C8FF00] transition-colors">
              WOB<span className="text-[#C8FF00]">.</span>ART
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-label text-sm tracking-widest text-[#6B6B8A] hover:text-[#EEEEFC] transition-colors uppercase"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="font-label text-sm tracking-widest text-[#6B6B8A] hover:text-[#EEEEFC] transition-colors uppercase"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="flex items-center gap-1 bg-[#C8FF00] text-[#05050A] font-label font-bold text-sm tracking-widest uppercase px-5 py-2.5 rounded-sm hover:bg-white transition-colors"
            >
              Cerere Nouă <ChevronRight size={14} />
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-[#EEEEFC] p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        className="fixed inset-0 z-40 glass-strong flex flex-col items-center justify-center gap-8 md:hidden"
        style={{
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
        }}
      >
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="font-display text-5xl tracking-widest text-[#EEEEFC] hover:text-[#C8FF00] transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        <div className="flex gap-4 mt-4">
          <Link href="/login" className="font-label uppercase tracking-widest text-sm text-[#6B6B8A] hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>
            Login
          </Link>
          <Link href="/register" className="bg-[#C8FF00] text-[#05050A] font-label font-bold uppercase text-sm tracking-widest px-6 py-3 rounded-sm" onClick={() => setMenuOpen(false)}>
            Cerere Nouă
          </Link>
        </div>
      </div>
    </>
  )
}
