'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, ArrowRight, ChevronLeft, Check } from 'lucide-react'

const benefits = [
  'Cereri de ofertă online în 2 minute',
  'Urmărire status comandă în timp real',
  'Notificări instant la fiecare actualizare',
  'Istoric complet al lucrărilor',
]

export default function RegisterPage() {
  const [showPass, setShowPass] = useState(false)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })

  useEffect(() => { setMounted(true) }, [])

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 1) { setStep(2); return }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    setLoading(false)
    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen bg-[#05050A] flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 80% 70% at 70% 50%, rgba(78,110,255,0.07) 0%, rgba(200,255,0,0.04) 50%, transparent 70%)',
        }} />
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-reg" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#4E6EFF" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-reg)" />
        </svg>
        <div className="relative z-10 px-16">
          <Link href="/" className="font-display text-4xl tracking-widest text-[#EEEEFC] block mb-12 text-center">
            WOB<span className="text-[#C8FF00]">.</span>ART
          </Link>
          <div className="mb-8">
            <div className="font-display text-3xl text-[#EEEEFC] mb-2">DE CE SĂ</div>
            <div className="font-display text-3xl text-[#C8FF00]">TE ÎNREGISTREZI?</div>
          </div>
          <div className="space-y-4">
            {benefits.map((b, i) => (
              <div
                key={b}
                className="flex items-center gap-3"
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? 'translateX(0)' : 'translateX(-20px)',
                  transition: `opacity 0.5s ease ${i * 0.12}s, transform 0.5s ease ${i * 0.12}s`,
                }}
              >
                <div className="w-5 h-5 rounded-sm bg-[#C8FF00]/10 flex items-center justify-center flex-shrink-0">
                  <Check size={12} className="text-[#C8FF00]" />
                </div>
                <span className="text-[#EEEEFC] text-sm">{b}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-1.5 text-[#6B6B8A] hover:text-[#EEEEFC] transition-colors text-sm font-label uppercase tracking-widest mb-10">
            <ChevronLeft size={14} /> Înapoi la site
          </Link>

          <div
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(24px)',
              transition: 'opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            {/* Progress steps */}
            <div className="flex items-center gap-3 mb-6">
              {[1, 2].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-sm flex items-center justify-center text-xs font-mono transition-all ${
                    step >= s ? 'bg-[#C8FF00] text-[#05050A]' : 'bg-[#0C0C14] border border-[rgba(255,255,255,0.07)] text-[#6B6B8A]'
                  }`}>{s}</div>
                  {s < 2 && <div className={`w-12 h-px transition-colors ${step > s ? 'bg-[#C8FF00]' : 'bg-[rgba(255,255,255,0.07)]'}`} />}
                </div>
              ))}
              <span className="font-label text-xs tracking-wider uppercase text-[#6B6B8A] ml-2">
                {step === 1 ? 'Date personale' : 'Setare parolă'}
              </span>
            </div>

            <div className="flex items-center gap-3 mb-2">
              <div className="w-6 h-px bg-[#C8FF00]" />
              <span className="font-label text-xs tracking-[0.3em] uppercase text-[#C8FF00]">Cont nou</span>
            </div>
            <h1 className="font-display text-5xl text-[#EEEEFC] mb-2">
              {step === 1 ? 'ÎNREGISTRARE' : 'SECURITATE'}
            </h1>
            <p className="text-[#6B6B8A] text-sm mb-8">
              Ai deja cont?{' '}
              <Link href="/login" className="text-[#C8FF00] hover:underline">Autentifică-te</Link>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {step === 1 ? (
                <>
                  {[
                    { key: 'name', label: 'Nume complet', type: 'text', placeholder: 'Ion Popescu' },
                    { key: 'email', label: 'Email', type: 'email', placeholder: 'email@exemplu.ro' },
                    { key: 'phone', label: 'Telefon', type: 'tel', placeholder: '+40 7xx xxx xxx' },
                  ].map(({ key, label, type, placeholder }) => (
                    <div key={key}>
                      <label className="font-label text-xs tracking-[0.2em] uppercase text-[#6B6B8A] block mb-2">{label}</label>
                      <input
                        type={type}
                        value={form[key as keyof typeof form]}
                        onChange={update(key as keyof typeof form)}
                        required={key !== 'phone'}
                        placeholder={placeholder}
                        className="w-full bg-[#0C0C14] border border-[rgba(255,255,255,0.07)] rounded-sm px-4 py-3.5 text-[#EEEEFC] placeholder-[#6B6B8A] text-sm focus:outline-none focus:border-[#C8FF00]/40 transition-colors"
                      />
                    </div>
                  ))}
                </>
              ) : (
                <div>
                  <label className="font-label text-xs tracking-[0.2em] uppercase text-[#6B6B8A] block mb-2">Parolă</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={form.password}
                      onChange={update('password')}
                      required
                      minLength={8}
                      placeholder="Minim 8 caractere"
                      className="w-full bg-[#0C0C14] border border-[rgba(255,255,255,0.07)] rounded-sm px-4 py-3.5 text-[#EEEEFC] placeholder-[#6B6B8A] text-sm focus:outline-none focus:border-[#C8FF00]/40 transition-colors pr-12"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B8A] hover:text-[#EEEEFC] transition-colors">
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {form.password.length > 0 && (
                    <div className="mt-2 flex gap-1">
                      {[4, 6, 8, 10].map((min) => (
                        <div key={min} className={`h-1 flex-1 rounded-full transition-colors ${form.password.length >= min ? 'bg-[#C8FF00]' : 'bg-[#1A1A2A]'}`} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                {step === 2 && (
                  <button type="button" onClick={() => setStep(1)}
                    className="flex-1 border border-[rgba(255,255,255,0.1)] text-[#EEEEFC] font-label uppercase tracking-widest text-sm py-4 rounded-sm hover:border-[#C8FF00]/30 transition-all">
                    Înapoi
                  </button>
                )}
                <button type="submit" disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#C8FF00] text-[#05050A] font-label font-bold uppercase tracking-widest text-sm py-4 rounded-sm hover:bg-white transition-all duration-300 disabled:opacity-60">
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-[#05050A]/30 border-t-[#05050A] rounded-full animate-spin" />
                  ) : (
                    <>{step === 1 ? 'Continuă' : 'Creează cont'} <ArrowRight size={16} /></>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
