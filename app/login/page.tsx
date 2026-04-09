'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, ArrowRight, ChevronLeft } from 'lucide-react'

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 900))
    setLoading(false)
    // MVP routing: admin@demo.ro → admin panel, others → client dashboard
    if (email === 'admin@demo.ro') {
      window.location.href = '/admin'
    } else {
      window.location.href = '/dashboard'
    }
  }

  return (
    <div className="min-h-screen bg-[#05050A] flex">
      {/* Left panel — 3D visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        {/* Ambient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 70% at 30% 50%, rgba(200,255,0,0.06) 0%, rgba(78,110,255,0.04) 50%, transparent 70%)',
          }}
        />
        {/* Grid */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-login" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#C8FF00" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-login)" />
        </svg>

        {/* Content */}
        <div className="relative z-10 px-16 text-center">
          <Link href="/" className="font-display text-4xl tracking-widest text-[#EEEEFC] block mb-12">
            WOB<span className="text-[#C8FF00]">.</span>ART
          </Link>

          {/* Decorative circles */}
          <div className="relative w-72 h-72 mx-auto mb-12">
            <div className="absolute inset-0 rounded-full border border-[rgba(200,255,0,0.15)] animate-spin" style={{ animationDuration: '20s' }} />
            <div className="absolute inset-8 rounded-full border border-[rgba(78,110,255,0.12)] animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
            <div className="absolute inset-16 rounded-full border border-[rgba(200,255,0,0.2)]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display text-7xl text-[#C8FF00]/30">W</span>
            </div>
          </div>

          <p className="text-[#6B6B8A] text-sm leading-relaxed max-w-xs mx-auto">
            Urmărește statusul comenzii, cere oferte noi și gestionează vehiculele tale — totul dintr-un singur loc.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        <div className="w-full max-w-md">
          {/* Back to home */}
          <Link
            href="/"
            className="flex items-center gap-1.5 text-[#6B6B8A] hover:text-[#EEEEFC] transition-colors text-sm font-label uppercase tracking-widest mb-10"
          >
            <ChevronLeft size={14} /> Înapoi la site
          </Link>

          <div
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(24px)',
              transition: 'opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
              <div className="w-6 h-px bg-[#C8FF00]" />
              <span className="font-label text-xs tracking-[0.3em] uppercase text-[#C8FF00]">
                Autentificare
              </span>
            </div>
            <h1 className="font-display text-5xl text-[#EEEEFC] mb-2">BUN VENIT</h1>
            <p className="text-[#6B6B8A] text-sm mb-8">
              Nu ai cont?{' '}
              <Link href="/register" className="text-[#C8FF00] hover:underline">
                Înregistrează-te
              </Link>
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="font-label text-xs tracking-[0.2em] uppercase text-[#6B6B8A] block mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="email@exemplu.ro"
                  className="w-full bg-[#0C0C14] border border-[rgba(255,255,255,0.07)] rounded-sm px-4 py-3.5 text-[#EEEEFC] placeholder-[#6B6B8A] text-sm focus:outline-none focus:border-[#C8FF00]/40 transition-colors"
                />
              </div>

              <div>
                <label className="font-label text-xs tracking-[0.2em] uppercase text-[#6B6B8A] block mb-2">
                  Parolă
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-[#0C0C14] border border-[rgba(255,255,255,0.07)] rounded-sm px-4 py-3.5 text-[#EEEEFC] placeholder-[#6B6B8A] text-sm focus:outline-none focus:border-[#C8FF00]/40 transition-colors pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B8A] hover:text-[#EEEEFC] transition-colors"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <a href="#" className="font-label text-xs tracking-wider text-[#6B6B8A] hover:text-[#C8FF00] transition-colors uppercase">
                  Ai uitat parola?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#C8FF00] text-[#05050A] font-label font-bold uppercase tracking-widest text-sm px-8 py-4 rounded-sm hover:bg-white transition-all duration-300 disabled:opacity-60 mt-2"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-[#05050A]/30 border-t-[#05050A] rounded-full animate-spin" />
                ) : (
                  <>
                    Intră în cont <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Demo accounts */}
            <div className="mt-8 p-4 glass rounded-sm">
              <p className="font-label text-xs tracking-wider uppercase text-[#6B6B8A] mb-3">
                Demo rapid:
              </p>
              <div className="space-y-1.5">
                {[
                  { label: 'Client', email: 'client@demo.ro', dest: '/dashboard' },
                  { label: 'Admin', email: 'admin@demo.ro', dest: '/admin' },
                ].map((acc) => (
                  <button
                    key={acc.label}
                    type="button"
                    onClick={() => {
                      setEmail(acc.email)
                      setPassword('demo1234')
                    }}
                    className="w-full flex items-center justify-between glass px-3 py-2 rounded-sm text-xs font-label tracking-wide hover:border-[#C8FF00]/20 transition-colors"
                  >
                    <span className="text-[#EEEEFC]">{acc.label}</span>
                    <span className="text-[#6B6B8A] font-mono">{acc.email}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
