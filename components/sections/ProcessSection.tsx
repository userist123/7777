'use client'
import { useReveal } from '@/hooks/useReveal'

const PASI = [
  {
    num: '01',
    title: 'ALEGE-ȚI ASPECTUL',
    body: 'Răsfoiește catalogul nostru de finisaje sau aduce propria viziune. Te ghidăm prin opțiunile de material 3M, Avery Dennison și KPMF — gloss, matte, satin, crom sau color-shift complet.',
  },
  {
    num: '02',
    title: 'PRIMEȘTI OFERTA',
    body: 'Răspuns detaliat în aceeași zi. Inspecționăm vehiculul, confirmăm finisajul și trimitem o ofertă transparentă, fără costuri ascunse.',
  },
  {
    num: '03',
    title: 'TRANSFORMAREA',
    body: 'Aduci vehiculul la atelierul nostru din București. Tehnicienii noștri certificați realizează întreaga instalare. Ridici mașina în 3–5 zile, cu garanție 5 ani la fiecare wrap.',
  },
]

function CardPas({ pas, i }: { pas: typeof PASI[0]; i: number }) {
  const ref = useReveal<HTMLDivElement>({ delay: i * 120 })
  return (
    <div ref={ref} className="reveal bg-[#0A0A0A] border border-white/[0.07] rounded p-6 md:p-8 relative overflow-hidden">
      <span
        className="absolute top-4 right-4 font-display text-[100px] md:text-[120px] leading-none select-none pointer-events-none"
        style={{ color: i === 0 ? 'rgba(232,255,0,0.04)' : 'rgba(255,255,255,0.03)' }}
      >
        {pas.num}
      </span>
      <div className="relative z-10">
        <span className="font-mono text-[11px] tracking-widest text-[#E8FF00]">{pas.num}</span>
        <h3 className="font-display text-[clamp(26px,3vw,40px)] text-[#F0F0F0] leading-none mt-3 mb-4">{pas.title}</h3>
        <p className="font-sans text-sm text-[#555555] leading-relaxed">{pas.body}</p>
      </div>
    </div>
  )
}

export function ProcessSection() {
  const headRef = useReveal<HTMLDivElement>()
  return (
    <section id="process" className="bg-[#111111] py-20 md:py-28 px-5 sm:px-8 md:px-12">
      <div className="max-w-[1400px] mx-auto">
        <div ref={headRef} className="reveal text-center mb-12 md:mb-16">
          <p className="font-label text-[11px] tracking-[0.4em] text-[#555555] uppercase mb-4">Cum Funcționează</p>
          <h2 className="font-display text-[clamp(36px,6vw,72px)] text-[#F0F0F0] leading-none">PROCESUL NOSTRU</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {PASI.map((pas, i) => <CardPas key={pas.num} pas={pas} i={i} />)}
        </div>
      </div>
    </section>
  )
}
