'use client'

import { useState } from 'react'
import Link from 'next/link'

import {
  LayoutDashboard, ClipboardList, Plus, LogOut, Bell,
  CheckCircle2, Clock, Wrench, PackageCheck, AlertCircle,
  Car, ChevronRight, X, ArrowLeft, ArrowRight
} from 'lucide-react'

/* ─── Types ─── */
type OrderStatus = 'PENDING' | 'APPROVED' | 'IN_PROGRESS' | 'QUALITY_CHECK' | 'COMPLETED'

interface Order {
  id: string
  orderNumber: string
  carBrand: string
  carModel: string
  carYear: number
  serviceType: string
  status: OrderStatus
  estimatedPrice: number
  createdAt: string
}

/* ─── Mock data ─── */
const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'WOB-2025-001',
    carBrand: 'BMW',
    carModel: 'M4 Competition',
    carYear: 2023,
    serviceType: 'CAR WRAPPING',
    status: 'IN_PROGRESS',
    estimatedPrice: 2800,
    createdAt: '2025-01-10',
  },
  {
    id: '2',
    orderNumber: 'WOB-2025-002',
    carBrand: 'Porsche',
    carModel: '911 Carrera',
    carYear: 2022,
    serviceType: 'PPF',
    status: 'QUALITY_CHECK',
    estimatedPrice: 1600,
    createdAt: '2025-01-14',
  },
  {
    id: '3',
    orderNumber: 'WOB-2024-089',
    carBrand: 'Range Rover',
    carModel: 'Sport',
    carYear: 2021,
    serviceType: 'DETAILING',
    status: 'COMPLETED',
    estimatedPrice: 450,
    createdAt: '2024-12-20',
  },
]

/* ─── Status config ─── */
const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.FC<{ size?: number }> }> = {
  PENDING: { label: 'În așteptare', color: '#6B6B8A', icon: Clock },
  APPROVED: { label: 'Aprobat', color: '#4E6EFF', icon: CheckCircle2 },
  IN_PROGRESS: { label: 'În lucru', color: '#C8FF00', icon: Wrench },
  QUALITY_CHECK: { label: 'Control calitate', color: '#FF9500', icon: AlertCircle },
  COMPLETED: { label: 'Finalizat', color: '#00FF94', icon: PackageCheck },
}

const statusSteps: OrderStatus[] = ['PENDING', 'APPROVED', 'IN_PROGRESS', 'QUALITY_CHECK', 'COMPLETED']

/* ─── New Order Form ─── */
const serviceOptions = [
  { id: 'WRAP_COMPLET', label: 'Car Wrapping', desc: 'de la 1.800 €' },
  { id: 'PPF', label: 'PPF', desc: 'de la 900 €' },
  { id: 'DETAILING', label: 'Detailing', desc: 'de la 250 €' },
  { id: 'TINTING', label: 'Tinting', desc: 'de la 350 €' },
]

function NewOrderModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    carBrand: '',
    carModel: '',
    carYear: '',
    carPlate: '',
    serviceType: '',
    description: '',
    date: '',
  })

  const update = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }))

  const steps = [
    { label: 'Vehicul', num: 1 },
    { label: 'Serviciu', num: 2 },
    { label: 'Programare', num: 3 },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#05050A]/80 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-lg glass-strong rounded-lg p-8"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-[#6B6B8A] hover:text-[#EEEEFC] transition-colors">
          <X size={18} />
        </button>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-sm flex items-center justify-center text-xs font-mono transition-all ${step >= s.num ? 'bg-[#C8FF00] text-[#05050A]' : 'bg-[#1A1A2A] text-[#6B6B8A]'}`}>
                {s.num}
              </div>
              <span className={`font-label text-xs uppercase tracking-wider ${step === s.num ? 'text-[#EEEEFC]' : 'text-[#6B6B8A]'}`}>
                {s.label}
              </span>
              {i < steps.length - 1 && <div className={`w-8 h-px ${step > s.num ? 'bg-[#C8FF00]' : 'bg-[rgba(255,255,255,0.08)]'}`} />}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div>
          {step === 1 && (
            <div key="step1">
              <h3 className="font-display text-3xl text-[#EEEEFC] mb-6">DATE VEHICUL</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-label text-xs tracking-widest uppercase text-[#6B6B8A] block mb-1.5">Marcă</label>
                    <input type="text" value={form.carBrand} onChange={(e) => update('carBrand', e.target.value)} placeholder="BMW" className="w-full bg-[#0C0C14] border border-[rgba(255,255,255,0.07)] rounded-sm px-3 py-3 text-[#EEEEFC] placeholder-[#6B6B8A] text-sm focus:outline-none focus:border-[#C8FF00]/40 transition-colors" />
                  </div>
                  <div>
                    <label className="font-label text-xs tracking-widest uppercase text-[#6B6B8A] block mb-1.5">Model</label>
                    <input type="text" value={form.carModel} onChange={(e) => update('carModel', e.target.value)} placeholder="M4" className="w-full bg-[#0C0C14] border border-[rgba(255,255,255,0.07)] rounded-sm px-3 py-3 text-[#EEEEFC] placeholder-[#6B6B8A] text-sm focus:outline-none focus:border-[#C8FF00]/40 transition-colors" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-label text-xs tracking-widest uppercase text-[#6B6B8A] block mb-1.5">An fabricație</label>
                    <input type="number" value={form.carYear} onChange={(e) => update('carYear', e.target.value)} placeholder="2023" min="1990" max="2025" className="w-full bg-[#0C0C14] border border-[rgba(255,255,255,0.07)] rounded-sm px-3 py-3 text-[#EEEEFC] placeholder-[#6B6B8A] text-sm focus:outline-none focus:border-[#C8FF00]/40 transition-colors" />
                  </div>
                  <div>
                    <label className="font-label text-xs tracking-widest uppercase text-[#6B6B8A] block mb-1.5">Nr. înmatriculare</label>
                    <input type="text" value={form.carPlate} onChange={(e) => update('carPlate', e.target.value)} placeholder="CJ 01 WOB" className="w-full bg-[#0C0C14] border border-[rgba(255,255,255,0.07)] rounded-sm px-3 py-3 text-[#EEEEFC] placeholder-[#6B6B8A] text-sm focus:outline-none focus:border-[#C8FF00]/40 transition-colors" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div key="step2">
              <h3 className="font-display text-3xl text-[#EEEEFC] mb-6">SERVICIU DORIT</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {serviceOptions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => update('serviceType', s.id)}
                    className={`p-4 rounded-sm border text-left transition-all ${form.serviceType === s.id ? 'border-[#C8FF00] bg-[#C8FF00]/5' : 'border-[rgba(255,255,255,0.07)] bg-[#0C0C14] hover:border-[rgba(255,255,255,0.15)]'}`}
                  >
                    <div className={`font-label text-sm font-bold uppercase tracking-wider mb-1 ${form.serviceType === s.id ? 'text-[#C8FF00]' : 'text-[#EEEEFC]'}`}>{s.label}</div>
                    <div className="font-mono text-xs text-[#6B6B8A]">{s.desc}</div>
                  </button>
                ))}
              </div>
              <div>
                <label className="font-label text-xs tracking-widest uppercase text-[#6B6B8A] block mb-1.5">Detalii suplimentare</label>
                <textarea
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  placeholder="Descrie ce îți dorești exact..."
                  rows={3}
                  className="w-full bg-[#0C0C14] border border-[rgba(255,255,255,0.07)] rounded-sm px-3 py-3 text-[#EEEEFC] placeholder-[#6B6B8A] text-sm focus:outline-none focus:border-[#C8FF00]/40 transition-colors resize-none"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div key="step3">
              <h3 className="font-display text-3xl text-[#EEEEFC] mb-6">PROGRAMARE</h3>
              <div>
                <label className="font-label text-xs tracking-widest uppercase text-[#6B6B8A] block mb-1.5">Data dorită</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => update('date', e.target.value)}
                  className="w-full bg-[#0C0C14] border border-[rgba(255,255,255,0.07)] rounded-sm px-3 py-3 text-[#EEEEFC] text-sm focus:outline-none focus:border-[#C8FF00]/40 transition-colors"
                />
              </div>
              <div className="mt-6 p-4 glass rounded-sm">
                <div className="font-label text-xs tracking-widest uppercase text-[#C8FF00] mb-3">Sumar cerere</div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#6B6B8A]">Vehicul</span>
                    <span className="text-[#EEEEFC] font-mono">{form.carBrand} {form.carModel} {form.carYear}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B6B8A]">Serviciu</span>
                    <span className="text-[#EEEEFC] font-mono">{form.serviceType || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B6B8A]">Nr. înmatriculare</span>
                    <span className="text-[#EEEEFC] font-mono">{form.carPlate || '—'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="flex items-center gap-1.5 border border-[rgba(255,255,255,0.1)] text-[#EEEEFC] font-label uppercase tracking-widest text-xs px-5 py-3 rounded-sm hover:border-[#C8FF00]/30 transition-all">
              <ArrowLeft size={14} /> Înapoi
            </button>
          )}
          <button
            onClick={() => step < 3 ? setStep(step + 1) : onClose()}
            className="flex-1 flex items-center justify-center gap-1.5 bg-[#C8FF00] text-[#05050A] font-label font-bold uppercase tracking-widest text-xs py-3 rounded-sm hover:bg-white transition-all"
          >
            {step < 3 ? 'Continuă' : 'Trimite cererea'} <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Status Card ─── */
function StatusCard({ order }: { order: Order }) {
  const currentIndex = statusSteps.indexOf(order.status)
  const cfg = statusConfig[order.status]
  const Icon = cfg.icon

  return (
    <div className="glass rounded-lg p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="font-mono text-xs text-[#6B6B8A] mb-1">{order.orderNumber}</div>
          <div className="font-label font-bold text-[#EEEEFC]">{order.carBrand} {order.carModel}</div>
          <div className="font-label text-xs tracking-wider uppercase text-[#6B6B8A]">{order.serviceType}</div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm" style={{ backgroundColor: `${cfg.color}15`, border: `1px solid ${cfg.color}30` }}>
          <Icon size={12} style={{ color: cfg.color }} />
          <span className="font-label text-xs font-bold tracking-wider uppercase" style={{ color: cfg.color }}>
            {cfg.label}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="font-label text-xs uppercase tracking-wider text-[#6B6B8A]">Progress</span>
          <span className="font-mono text-xs text-[#C8FF00]">{Math.round(((currentIndex + 1) / statusSteps.length) * 100)}%</span>
        </div>
        <div className="h-1 bg-[#1A1A2A] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / statusSteps.length) * 100}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full rounded-full bg-[#C8FF00]"
          />
        </div>
      </div>

      {/* Steps */}
      <div className="flex items-center justify-between">
        {statusSteps.map((s, i) => {
          const sCfg = statusConfig[s]
          const SIcon = sCfg.icon
          const done = i <= currentIndex
          return (
            <div key={s} className="flex items-center">
              <div
                className="w-6 h-6 rounded-sm flex items-center justify-center transition-all"
                style={{
                  backgroundColor: done ? `${cfg.color}20` : '#1A1A2A',
                  border: `1px solid ${done ? cfg.color + '50' : 'rgba(255,255,255,0.05)'}`,
                }}
                title={sCfg.label}
              >
                <SIcon size={11} style={{ color: done ? cfg.color : '#6B6B8A' }} />
              </div>
              {i < statusSteps.length - 1 && (
                <div className={`w-full h-px flex-1 mx-1 ${i < currentIndex ? 'bg-[#C8FF00]/30' : 'bg-[rgba(255,255,255,0.05)]'}`} style={{ minWidth: '12px' }} />
              )}
            </div>
          )
        })}
      </div>

      {/* Price */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-[rgba(255,255,255,0.05)]">
        <span className="font-label text-xs uppercase tracking-wider text-[#6B6B8A]">Estimat</span>
        <span className="font-mono text-[#C8FF00]">{order.estimatedPrice.toLocaleString('ro-RO')} €</span>
      </div>
    </div>
  )
}

/* ─── Main Dashboard ─── */
export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders'>('overview')
  const [showNewOrder, setShowNewOrder] = useState(false)

  const kpis = [
    { label: 'Comenzi Active', value: '2', sub: 'în desfășurare', color: '#C8FF00' },
    { label: 'Total Investit', value: '4.250 €', sub: 'în toate lucrările', color: '#4E6EFF' },
    { label: 'Comenzi Finalizate', value: '1', sub: 'în ultimul an', color: '#00FF94' },
    { label: 'Notificări', value: '3', sub: 'necitite', color: '#FF9500' },
  ]

  return (
    <div className="min-h-screen bg-[#05050A] flex">
      {/* Sidebar */}
      <aside className="w-16 lg:w-60 border-r border-[rgba(255,255,255,0.06)] flex flex-col py-6">
        {/* Logo */}
        <div className="px-4 lg:px-6 mb-10">
          <Link href="/" className="font-display text-xl tracking-widest text-[#EEEEFC] hidden lg:block">
            WOB<span className="text-[#C8FF00]">.</span>ART
          </Link>
          <Link href="/" className="font-display text-xl tracking-widest text-[#C8FF00] lg:hidden">W</Link>
        </div>

        <nav className="flex flex-col gap-1 px-2 flex-1">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'orders', label: 'Comenzi', icon: ClipboardList },
          ].map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as 'overview' | 'orders')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-sm transition-all ${
                  activeTab === item.id
                    ? 'bg-[#C8FF00]/10 text-[#C8FF00]'
                    : 'text-[#6B6B8A] hover:text-[#EEEEFC] hover:bg-[#0C0C14]'
                }`}
              >
                <Icon size={18} />
                <span className="hidden lg:block font-label text-sm uppercase tracking-wider">{item.label}</span>
              </button>
            )
          })}

          <button
            onClick={() => setShowNewOrder(true)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-[#6B6B8A] hover:text-[#C8FF00] transition-all mt-2"
          >
            <Plus size={18} />
            <span className="hidden lg:block font-label text-sm uppercase tracking-wider">Cerere nouă</span>
          </button>
        </nav>

        {/* Bottom */}
        <div className="px-2 mt-auto space-y-1">
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-[#6B6B8A] hover:text-[#EEEEFC] transition-all w-full">
            <Bell size={18} />
            <span className="hidden lg:block font-label text-sm uppercase tracking-wider">Notificări</span>
          </button>
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-[#6B6B8A] hover:text-[#EEEEFC] transition-all">
            <LogOut size={18} />
            <span className="hidden lg:block font-label text-sm uppercase tracking-wider">Ieșire</span>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-10 glass border-b border-[rgba(255,255,255,0.06)] px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl text-[#EEEEFC]">
              {activeTab === 'overview' ? 'BUNĂ ZIUA, ION' : 'COMENZILE MELE'}
            </h1>
            <p className="text-[#6B6B8A] text-xs font-label uppercase tracking-wider">
              {new Date().toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <button
            onClick={() => setShowNewOrder(true)}
            className="flex items-center gap-2 bg-[#C8FF00] text-[#05050A] font-label font-bold uppercase tracking-widest text-xs px-5 py-2.5 rounded-sm hover:bg-white transition-all"
          >
            <Plus size={14} /> Cerere nouă
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi, i) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="glass rounded-lg p-5"
              >
                <div className="font-mono text-3xl font-bold mb-1" style={{ color: kpi.color }}>
                  {kpi.value}
                </div>
                <div className="font-label text-xs uppercase tracking-wider text-[#EEEEFC] mb-0.5">
                  {kpi.label}
                </div>
                <div className="text-[#6B6B8A] text-xs">{kpi.sub}</div>
              </motion.div>
            ))}
          </div>

          {/* Orders */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-2xl text-[#EEEEFC]">URMĂRIRE COMENZI</h2>
              <button
                onClick={() => setActiveTab('orders')}
                className="font-label text-xs uppercase tracking-widest text-[#6B6B8A] hover:text-[#C8FF00] transition-colors flex items-center gap-1"
              >
                Vezi toate <ChevronRight size={12} />
              </button>
            </div>

            <div className="space-y-4">
              {mockOrders.map((order, i) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <StatusCard order={order} />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="glass rounded-lg p-6">
            <h3 className="font-display text-xl text-[#EEEEFC] mb-4">ACȚIUNI RAPIDE</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { icon: Car, label: 'Cerere Car Wrapping', accent: '#C8FF00' },
                { icon: ClipboardList, label: 'Cerere PPF', accent: '#4E6EFF' },
                { icon: Plus, label: 'Alt serviciu', accent: '#6B6B8A' },
              ].map((action) => {
                const Icon = action.icon
                return (
                  <button
                    key={action.label}
                    onClick={() => setShowNewOrder(true)}
                    className="flex items-center gap-3 p-4 rounded-sm border border-[rgba(255,255,255,0.07)] hover:border-[rgba(255,255,255,0.15)] transition-all text-left"
                  >
                    <div className="w-8 h-8 rounded-sm flex items-center justify-center" style={{ backgroundColor: `${action.accent}15` }}>
                      <Icon size={16} style={{ color: action.accent }} />
                    </div>
                    <span className="font-label text-sm uppercase tracking-wider text-[#EEEEFC]">{action.label}</span>
                    <ChevronRight size={14} className="ml-auto text-[#6B6B8A]" />
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </main>

      {/* New Order Modal */}
      <AnimatePresence>
        {showNewOrder && <NewOrderModal onClose={() => setShowNewOrder(false)} />}
      </AnimatePresence>
    </div>
  )
}
