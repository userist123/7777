'use client'
import { useState, useRef, useEffect } from 'react'
import { MagneticButton } from '@/components/ui/MagneticButton'

const MARCI = ['BMW', 'Mercedes', 'Audi', 'Porsche', 'Range Rover', 'Tesla', 'Ferrari', 'Lamborghini', 'Volkswagen', 'Skoda']
const SERVICII = ['Wrap Complet', 'PPF', 'Wrap Parțial', 'Accente'] as const
const FINISAJE = [
  { label: 'Gloss',       color: '#1a1a1a', border: '#444' },
  { label: 'Matte',       color: '#2d2d2d', border: '#555' },
  { label: 'Satin',       color: '#3a3a3a', border: '#666' },
  { label: 'Crom',        color: '#a0a0a0', border: '#ccc' },
  { label: 'Color-Shift', color: 'linear-gradient(135deg,#9B00FF,#00F5FF,#E8FF00)', border: '#E8FF00' },
]
const BAZA: Record<string, number> = { 'Wrap Complet': 2800, PPF: 2000, 'Wrap Parțial': 1200, Accente: 500 }
const MULT: Record<string, number> = { Gloss: 1, Matte: 1.05, Satin: 1.1, Crom: 1.35, 'Color-Shift': 1.5 }

export function EstimatorSection() {
  const [marca, setMarca] = useState('')
  const [serviciu, setServiciu] = useState<typeof SERVICII[number]>('Wrap Complet')
  const [finisaj, setFinisaj] = useState('Gloss')
  const [displayMin, setDisplayMin] = useState(0)
  const [displayMax, setDisplayMax] = useState(0)
  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const baza = BAZA[serviciu]
    const mult = MULT[finisaj]
    const min = Math.round(baza * mult)
    const max = Math.round(baza * mult * 1.45)
    if (animRef.current) clearTimeout(animRef.current)
    let frame = 0
    const FRAMES = 40
    const startMin = displayMin
    const startMax = displayMax
    const tick = () => {
      frame++
      const t = frame / FRAMES
      const ease = 1 - Math.pow(1 - t, 3)
      setDisplayMin(Math.round(startMin + (min - startMin) * ease))
      setDisplayMax(Math.round(startMax + (max - startMax) * ease))
      if (frame < FRAMES) animRef.current = setTimeout(tick, 16)
    }
    tick()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviciu, finisaj])

  return (
    <section id="estimator" className="bg-[#0A0A0A] py-20 md:py-28 px-5 sm:px-8 md:px-12">
      <div className="max-w-[640px] mx-auto text-center">
        <p className="font-label text-[11px] tracking-[0.4em] text-[#555555] uppercase mb-4">Prețuri</p>
        <h2 className="font-display text-[clamp(36px,6vw,72px)] text-[#F0F0F0] leading-none mb-10 md:mb-14">
          ESTIMEAZĂ COSTUL
        </h2>

        <div className="space-y-7 md:space-y-8 text-left">
          {/* Marcă */}
          <div>
            <label className="block font-label text-[11px] tracking-widest text-[#555555] uppercase mb-2">Marca Vehiculului</label>
            <select
              value={marca}
              onChange={e => setMarca(e.target.value)}
              className="w-full bg-[#111111] border border-white/[0.07] text-[#F0F0F0] font-sans text-sm px-4 py-3 rounded appearance-none focus:outline-none focus:border-[#E8FF00]/40"
            >
              <option value="">Selectează marca...</option>
              {MARCI.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          {/* Serviciu */}
          <div>
            <label className="block font-label text-[11px] tracking-widest text-[#555555] uppercase mb-3">Serviciu</label>
            <div className="grid grid-cols-2 gap-2 md:gap-3">
              {SERVICII.map(s => (
                <button
                  key={s}
                  onClick={() => setServiciu(s)}
                  className={`py-3 px-4 rounded border font-label text-xs md:text-sm tracking-widest uppercase transition-all
                    ${serviciu === s ? 'border-[#E8FF00] text-[#E8FF00] bg-[#E8FF00]/5' : 'border-white/10 text-[#555555] hover:border-white/20'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Finisaj */}
          <div>
            <label className="block font-label text-[11px] tracking-widests text-[#555555] uppercase mb-3">Finisaj</label>
            <div className="flex flex-wrap gap-2">
              {FINISAJE.map(f => (
                <button
                  key={f.label}
                  onClick={() => setFinisaj(f.label)}
                  className={`flex items-center gap-2 px-3 md:px-4 py-2.5 rounded border font-label text-xs md:text-sm tracking-widest uppercase transition-all
                    ${finisaj === f.label ? 'border-[#E8FF00] text-[#E8FF00]' : 'border-white/10 text-[#555555] hover:border-white/20'}`}
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ background: f.color, border: `1px solid ${f.border}` }}
                  />
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preț estimat */}
        <div className="mt-10 md:mt-12 py-7 md:py-8 border-t border-b border-white/[0.07]">
          <p className="font-label text-[11px] tracking-[0.3em] text-[#555555] uppercase mb-3">Preț Estimat</p>
          <p className="font-display text-[clamp(36px,6vw,64px)] text-[#E8FF00] leading-none tabular-nums">
            €{displayMin.toLocaleString('ro-RO')} — €{displayMax.toLocaleString('ro-RO')}
          </p>
          <p className="font-sans text-sm text-[#555555] mt-3">Prețul final depinde de dimensiunea și starea vehiculului.</p>
        </div>

        <div className="mt-7 md:mt-8">
          <MagneticButton variant="accent" size="lg" href="#quote">Solicită Ofertă Exactă</MagneticButton>
        </div>
      </div>
    </section>
  )
}
