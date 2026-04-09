import Link from 'next/link'
import { Instagram, Facebook, Youtube } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-[rgba(255,255,255,0.06)] py-12 px-6 md:px-16 lg:px-24">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="font-display text-3xl tracking-widest text-[#EEEEFC] mb-3">
              WOB<span className="text-[#C8FF00]">.</span>ART
            </div>
            <p className="text-[#6B6B8A] text-sm leading-relaxed max-w-xs">
              Atelier premium de car wrapping, PPF și detailing. Pasionați de perfecțiune,
              dedicați mașinii tale.
            </p>
            <div className="flex gap-4 mt-5">
              {[Instagram, Facebook, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 glass rounded-sm flex items-center justify-center text-[#6B6B8A] hover:text-[#C8FF00] hover:border-[#C8FF00]/30 transition-all"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <div className="font-label text-xs tracking-[0.3em] uppercase text-[#C8FF00] mb-4">
              Servicii
            </div>
            {['Car Wrapping', 'PPF', 'Detailing', 'Tinting'].map((s) => (
              <div key={s} className="mb-2">
                <Link
                  href="#servicii"
                  className="text-[#6B6B8A] text-sm hover:text-[#EEEEFC] transition-colors"
                >
                  {s}
                </Link>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div>
            <div className="font-label text-xs tracking-[0.3em] uppercase text-[#C8FF00] mb-4">
              Contact
            </div>
            <div className="space-y-2 text-[#6B6B8A] text-sm">
              <p>București, România</p>
              <a href="tel:+40700000000" className="hover:text-[#EEEEFC] transition-colors block">
                +40 700 000 000
              </a>
              <a
                href="mailto:contact@wobart.ro"
                className="hover:text-[#EEEEFC] transition-colors block"
              >
                contact@wobart.ro
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-[rgba(255,255,255,0.06)] pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-label text-xs text-[#6B6B8A] tracking-wider">
            © 2026 WOB ART. Toate drepturile rezervate.
          </span>
          <div className="flex gap-6">
            {['Termeni', 'Confidențialitate', 'Cookie-uri'].map((l) => (
              <Link
                key={l}
                href="#"
                className="font-label text-xs tracking-wider text-[#6B6B8A] hover:text-[#EEEEFC] transition-colors uppercase"
              >
                {l}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
