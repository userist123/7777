import { MagneticButton } from '@/components/ui/MagneticButton'

export function CtaSection() {
  return (
    <section className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-5 sm:px-8 md:px-12 overflow-hidden bg-[#0A0A0A]">
      {/* Gradient ambiental */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(232,255,0,0.04) 0%, transparent 70%)',
          animation: 'meshPulse 8s ease-in-out infinite',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 80% at 20% 80%, rgba(232,255,0,0.03) 0%, transparent 60%)',
          animation: 'meshPulse 12s ease-in-out infinite reverse',
        }}
      />
      <style>{`
        @keyframes meshPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
      `}</style>

      <div className="relative z-10 max-w-5xl">
        <p className="font-label text-[11px] tracking-[0.4em] text-[#555555] uppercase mb-8">WOB ART — București</p>
        <h2
          className="font-display text-[#F0F0F0] leading-[0.88] mb-8"
          style={{ fontSize: 'clamp(52px, 10vw, 160px)' }}
        >
          MAȘINA TA MERITĂ MAI MULT.
        </h2>
        <p className="font-sans text-base md:text-lg text-[#555555] mb-12">
          Programează o consultație gratuită astăzi.
        </p>
        <MagneticButton variant="accent" size="lg" href="#quote">
          HAI SĂ ÎNCEPEM
        </MagneticButton>
      </div>
    </section>
  )
}
