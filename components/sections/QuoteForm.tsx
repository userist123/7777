'use client'
import { useState, useRef } from 'react'
import { MagneticButton } from '@/components/ui/MagneticButton'

const SERVICII_LISTA = ['Wrap Complet', 'PPF', 'Wrap Parțial', 'Cromate & Accente', 'Wrap Interior']
const FINISAJE_LISTA = ['Gloss Negru', 'Matte Midnight Blue', 'Satin Oțel Periat', 'Ștergere Crom', 'Color-Shift Cameleon']

export function QuoteForm() {
  const [submitted, setSubmitted] = useState(false)
  const [serviciu, setServiciu] = useState('')
  const [finisaj, setFinisaj] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState('')

  const validate = (form: HTMLFormElement) => {
    const data = new FormData(form)
    const errs: Record<string, string> = {}
    if (!data.get('name')) errs.name = 'Numele este obligatoriu'
    if (!data.get('email')) errs.email = 'Email-ul este obligatoriu'
    else if (!/\S+@\S+\.\S+/.test(data.get('email') as string)) errs.email = 'Introdu un email valid'
    if (!data.get('phone')) errs.phone = 'Numărul de telefon este obligatoriu'
    if (!serviciu) errs.serviciu = 'Alege un serviciu'
    return errs
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const errs = validate(e.currentTarget)
    setErrors(errs)
    if (Object.keys(errs).length === 0) setTimeout(() => setSubmitted(true), 300)
  }

  const Camp = ({ name, label, type = 'text', placeholder = '' }: {
    name: string; label: string; type?: string; placeholder?: string
  }) => (
    <div>
      <label className="block font-label text-[11px] tracking-widest text-[#555555] uppercase mb-2">{label}</label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        className="w-full bg-transparent border-b border-white/10 text-[#F0F0F0] font-sans text-sm py-2.5 focus:outline-none focus:border-[#E8FF00]/60 transition-colors placeholder:text-[#555555]/50"
        onChange={() => errors[name] && setErrors(prev => { const n = { ...prev }; delete n[name]; return n })}
      />
      {errors[name] && <p className="text-[#FF3B30] text-[11px] mt-1">{errors[name]}</p>}
    </div>
  )

  return (
    <section id="quote" className="bg-[#111111] py-20 md:py-28 px-5 sm:px-8 md:px-12">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
        {/* Stânga */}
        <div>
          <p className="font-label text-[11px] tracking-[0.4em] text-[#555555] uppercase mb-4">Contact</p>
          <h2 className="font-display text-[clamp(36px,5vw,72px)] text-[#F0F0F0] leading-[0.9] mb-8 md:mb-10">
            GATA SĂ TRANSFORMI MAȘINA?
          </h2>
          <ul className="space-y-4">
            {['Consultație gratuită', 'Răspuns în aceeași zi', 'Fără angajament', 'Garanție 5 ani la instalare'].map(t => (
              <li key={t} className="flex items-center gap-3 font-sans text-sm text-[#555555]">
                <span className="w-5 h-5 rounded-full bg-[#E8FF00]/10 border border-[#E8FF00]/30 flex items-center justify-center shrink-0">
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="#E8FF00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                {t}
              </li>
            ))}
          </ul>
          <div className="mt-10 md:mt-12 pt-7 md:pt-8 border-t border-white/[0.07]">
            <p className="font-sans text-sm text-[#555555] mb-1">Locație atelier</p>
            <p className="font-label text-sm text-[#F0F0F0] tracking-wide">București, România</p>
            <p className="font-mono text-xs text-[#555555] mt-1">contact@wobart.ro</p>
          </div>
        </div>

        {/* Dreapta */}
        <div>
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-16 md:py-20 text-center">
              <div className="w-16 h-16 rounded-full border-2 border-[#E8FF00] flex items-center justify-center mb-6">
                <svg width="28" height="22" viewBox="0 0 28 22" fill="none">
                  <path d="M2 11L10 19L26 3" stroke="#E8FF00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="font-display text-[40px] text-[#F0F0F0] mb-3">CERERE TRIMISĂ</h3>
              <p className="font-sans text-sm text-[#555555]">Îți răspundem în aceeași zi lucrătoare.</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-6" noValidate>
              <div className="grid grid-cols-1 gap-6">
                <Camp name="name" label="Nume Complet" placeholder="Ion Popescu" />
                <Camp name="email" label="Email" type="email" placeholder="ion@email.ro" />
                <Camp name="phone" label="Telefon" type="tel" placeholder="+40 7xx xxx xxx" />
              </div>
              <div className="grid grid-cols-3 gap-3 md:gap-4">
                <Camp name="make" label="Marcă" placeholder="BMW" />
                <Camp name="model" label="Model" placeholder="M4" />
                <Camp name="year" label="An" placeholder="2024" />
              </div>

              {/* Serviciu */}
              <div>
                <label className="block font-label text-[11px] tracking-widest text-[#555555] uppercase mb-3">Serviciu Dorit</label>
                <div className="grid grid-cols-2 gap-2">
                  {SERVICII_LISTA.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => { setServiciu(s); setErrors(p => { const n = { ...p }; delete n.serviciu; return n }) }}
                      className={`py-2.5 px-3 rounded border font-label text-xs tracking-widest uppercase transition-all
                        ${serviciu === s ? 'border-[#E8FF00] text-[#E8FF00] bg-[#E8FF00]/5' : 'border-white/10 text-[#555555] hover:border-white/20'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                {errors.serviciu && <p className="text-[#FF3B30] text-[11px] mt-1">{errors.serviciu}</p>}
              </div>

              {/* Finisaj dorit */}
              <div>
                <label className="block font-label text-[11px] tracking-widest text-[#555555] uppercase mb-3">Finisaj Dorit</label>
                <div className="flex flex-wrap gap-2">
                  {FINISAJE_LISTA.map(f => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFinisaj(f)}
                      className={`py-2 px-3 rounded border font-label text-xs tracking-widest uppercase transition-all
                        ${finisaj === f ? 'border-[#E8FF00] text-[#E8FF00]' : 'border-white/10 text-[#555555]'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mesaj */}
              <div>
                <label className="block font-label text-[11px] tracking-widest text-[#555555] uppercase mb-2">Mesaj</label>
                <textarea
                  name="message"
                  rows={3}
                  placeholder="Detalii suplimentare despre vehicul sau dorințe specifice..."
                  className="w-full bg-transparent border-b border-white/10 text-[#F0F0F0] font-sans text-sm py-2.5 focus:outline-none focus:border-[#E8FF00]/60 transition-colors placeholder:text-[#555555]/50 resize-none"
                />
              </div>

              {/* Încărcare fotografii */}
              <div>
                <label className="block font-label text-[11px] tracking-widest text-[#555555] uppercase mb-2">Fotografii (opțional)</label>
                <div
                  onDragOver={e => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) setFileName(f.name) }}
                  onClick={() => fileRef.current?.click()}
                  className={`border border-dashed rounded p-5 md:p-6 text-center cursor-pointer transition-colors
                    ${dragging ? 'border-[#E8FF00]/60 bg-[#E8FF00]/5' : 'border-white/10 hover:border-white/20'}`}
                >
                  <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
                    onChange={e => setFileName(e.target.files?.[0]?.name || '')} />
                  <p className="font-sans text-sm text-[#555555]">
                    {fileName || 'Trage fotografii aici sau apasă pentru a selecta'}
                  </p>
                </div>
              </div>

              <MagneticButton variant="accent" size="lg" type="submit" className="w-full justify-center">
                TRIMITE CEREREA
              </MagneticButton>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
