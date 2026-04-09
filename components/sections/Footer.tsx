export function Footer() {
  return (
    <footer className="bg-[#0A0A0A] border-t border-white/[0.07] py-10 px-5 sm:px-8 md:px-12">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <span className="font-display text-2xl text-[#E8FF00] tracking-wider">WOB ART</span>

          {/* Navigație */}
          <nav className="flex flex-wrap gap-5 sm:gap-6 items-center justify-center">
            {[
              { label: 'Servicii', href: '#services' },
              { label: 'Portofoliu', href: '#portfolio' },
              { label: 'Proces', href: '#process' },
              { label: 'Estimare', href: '#estimator' },
              { label: 'Ofertă', href: '#quote' },
            ].map(item => (
              <a
                key={item.href}
                href={item.href}
                className="font-label text-[11px] tracking-widest text-[#555555] uppercase hover:text-[#F0F0F0] transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Rețele sociale */}
          <div className="flex gap-3">
            {[
              { label: 'IG', href: '#' },
              { label: 'FB', href: '#' },
              { label: 'TT', href: '#' },
            ].map(s => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="w-8 h-8 border border-white/10 rounded flex items-center justify-center font-mono text-[10px] text-[#555555] hover:border-[#E8FF00]/40 hover:text-[#E8FF00] transition-colors"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/[0.07] flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="font-sans text-xs text-[#555555]">© 2026 WOB ART. Toate drepturile rezervate.</p>
          <div className="flex gap-6">
            <a href="#" className="font-sans text-xs text-[#555555] hover:text-[#F0F0F0] transition-colors">Politică de Confidențialitate</a>
            <a href="#" className="font-sans text-xs text-[#555555] hover:text-[#F0F0F0] transition-colors">Termeni și Condiții</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
