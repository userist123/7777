'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  LogOut,
  CheckCircle2,
  Clock,
  Wrench,
  PackageCheck,
  AlertCircle,
  Search,
  Filter,
  Eye,
  Check,
  X,
  ChevronDown,
  Banknote,
  Car,
  Upload,
  Image as ImageIcon,
  Video,
  Trash2,
} from 'lucide-react'

/* ─── Types ─── */
type OrderStatus = 'PENDING' | 'APPROVED' | 'IN_PROGRESS' | 'QUALITY_CHECK' | 'COMPLETED'

interface MediaFile {
  id: string
  url: string
  type: 'image' | 'video'
  name: string
  status: OrderStatus
}

interface Order {
  id: string
  orderNumber: string
  clientName: string
  clientEmail: string
  carBrand: string
  carModel: string
  carYear: number
  carPlate: string
  serviceType: string
  status: OrderStatus
  estimatedPrice: number | null
  description: string
  createdAt: string
  media: MediaFile[]
}

/* ─── Date mock ─── */
const allOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'WOB-2026-001',
    clientName: 'Alexandru Munteanu',
    clientEmail: 'alex@email.ro',
    carBrand: 'BMW',
    carModel: 'M4 Competition',
    carYear: 2023,
    carPlate: 'B 01 BMW',
    serviceType: 'CAR WRAPPING',
    status: 'IN_PROGRESS',
    estimatedPrice: 2800,
    description: 'Wrap complet Matte Black 3M. Include plafon, capotă și bara față.',
    createdAt: '2026-01-10',
    media: [],
  },
  {
    id: '2',
    orderNumber: 'WOB-2026-002',
    clientName: 'Maria Ionescu',
    clientEmail: 'maria@email.ro',
    carBrand: 'Porsche',
    carModel: '911 Carrera',
    carYear: 2022,
    carPlate: 'B 99 POR',
    serviceType: 'PPF',
    status: 'QUALITY_CHECK',
    estimatedPrice: 1600,
    description: 'PPF full front — capotă, aripi, bară, oglinzi.',
    createdAt: '2026-01-14',
    media: [],
  },
  {
    id: '3',
    orderNumber: 'WOB-2026-003',
    clientName: 'Bogdan Popa',
    clientEmail: 'bogdan@email.ro',
    carBrand: 'Mercedes',
    carModel: 'GLE 63 AMG',
    carYear: 2024,
    carPlate: 'B 22 AMG',
    serviceType: 'DETAILING',
    status: 'PENDING',
    estimatedPrice: null,
    description: 'Pachet detailing complet interior + exterior + acoperire ceramică.',
    createdAt: '2026-01-20',
    media: [],
  },
  {
    id: '4',
    orderNumber: 'WOB-2026-004',
    clientName: 'Andreea Rusu',
    clientEmail: 'andreea@email.ro',
    carBrand: 'Audi',
    carModel: 'RS7',
    carYear: 2023,
    carPlate: 'IS 44 AUD',
    serviceType: 'TINTING',
    status: 'PENDING',
    estimatedPrice: null,
    description: 'Foliere geamuri laterale + parbriz cu folie ceramică 35%.',
    createdAt: '2026-01-21',
    media: [],
  },
  {
    id: '5',
    orderNumber: 'WOB-2025-089',
    clientName: 'Ion Georgescu',
    clientEmail: 'ion@email.ro',
    carBrand: 'Range Rover',
    carModel: 'Sport',
    carYear: 2021,
    carPlate: 'B 05 RR',
    serviceType: 'DETAILING',
    status: 'COMPLETED',
    estimatedPrice: 450,
    description: 'Detailing complet exterior + polish 2 etape.',
    createdAt: '2025-12-20',
    media: [],
  },
  {
    id: '6',
    orderNumber: 'WOB-2026-005',
    clientName: 'Radu Stancu',
    clientEmail: 'radu@email.ro',
    carBrand: 'Ferrari',
    carModel: 'SF90',
    carYear: 2024,
    carPlate: 'B 01 FER',
    serviceType: 'CAR WRAPPING',
    status: 'APPROVED',
    estimatedPrice: 5200,
    description: 'Wrap parțial — dungi + accente satin cromat. Design personalizat.',
    createdAt: '2026-01-18',
    media: [],
  },
]

const statusConfig: Record<OrderStatus, { label: string; color: string; bg: string; icon: React.FC<{ size?: number }> }> = {
  PENDING:       { label: 'În așteptare',     color: '#6B6B8A', bg: 'rgba(107,107,138,0.12)', icon: Clock },
  APPROVED:      { label: 'Aprobat',          color: '#4E6EFF', bg: 'rgba(78,110,255,0.12)',  icon: CheckCircle2 },
  IN_PROGRESS:   { label: 'În lucru',         color: '#C8FF00', bg: 'rgba(200,255,0,0.1)',    icon: Wrench },
  QUALITY_CHECK: { label: 'Control calitate', color: '#FF9500', bg: 'rgba(255,149,0,0.12)',   icon: AlertCircle },
  COMPLETED:     { label: 'Finalizat',        color: '#00FF94', bg: 'rgba(0,255,148,0.1)',    icon: PackageCheck },
}

const statusFlow: OrderStatus[] = ['PENDING', 'APPROVED', 'IN_PROGRESS', 'QUALITY_CHECK', 'COMPLETED']

/* ─── Status Badge ─── */
function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = statusConfig[status]
  const Icon = cfg.icon
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm font-label text-xs font-bold uppercase tracking-wider whitespace-nowrap"
      style={{ color: cfg.color, backgroundColor: cfg.bg, border: `1px solid ${cfg.color}30` }}
    >
      <Icon size={10} />
      {cfg.label}
    </span>
  )
}

/* ─── Media Upload Zone (per etapă) ─── */
function MediaUploadZone({
  status,
  media,
  onAdd,
  onRemove,
}: {
  status: OrderStatus
  media: MediaFile[]
  onAdd: (files: MediaFile[]) => void
  onRemove: (id: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const cfg = statusConfig[status]
  const statusMedia = media.filter((m) => m.status === status)

  function handleFiles(files: FileList | null) {
    if (!files) return
    const newFiles: MediaFile[] = Array.from(files).map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video') ? 'video' : 'image',
      name: file.name,
      status,
    }))
    onAdd(newFiles)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-label text-xs uppercase tracking-[0.2em]" style={{ color: cfg.color }}>
          {cfg.label}
        </span>
        <button
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1.5 text-[#6B6B8A] hover:text-[#EEEEFC] transition-colors text-xs font-label uppercase tracking-wider"
        >
          <Upload size={11} /> Adaugă
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {statusMedia.length === 0 ? (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full border border-dashed border-[rgba(255,255,255,0.08)] rounded-sm py-4 flex flex-col items-center gap-2 hover:border-[rgba(255,255,255,0.18)] transition-colors group"
        >
          <Upload size={16} className="text-[#6B6B8A] group-hover:text-[#EEEEFC] transition-colors" />
          <span className="text-[#6B6B8A] text-xs font-label">Fotografii sau clipuri</span>
        </button>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {statusMedia.map((m) => (
            <div key={m.id} className="relative group rounded-sm overflow-hidden bg-[#0C0C14] aspect-square">
              {m.type === 'image' ? (
                <img src={m.url} alt={m.name} className="w-full h-full object-cover" />
              ) : (
                <video src={m.url} className="w-full h-full object-cover" muted />
              )}
              <div className="absolute inset-0 bg-[#05050A]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {m.type === 'video' ? (
                  <Video size={14} className="text-[#C8FF00]" />
                ) : (
                  <ImageIcon size={14} className="text-[#C8FF00]" />
                )}
                <button onClick={() => onRemove(m.id)} className="text-[#FF2D55] hover:text-white transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={() => inputRef.current?.click()}
            className="aspect-square border border-dashed border-[rgba(255,255,255,0.08)] rounded-sm flex items-center justify-center hover:border-[rgba(255,255,255,0.18)] transition-colors group"
          >
            <Upload size={14} className="text-[#6B6B8A] group-hover:text-[#EEEEFC] transition-colors" />
          </button>
        </div>
      )}
    </div>
  )
}

/* ─── Modal comandă ─── */
function OrderModal({
  order,
  onClose,
  onUpdateStatus,
  onUpdateMedia,
}: {
  order: Order
  onClose: () => void
  onUpdateStatus: (id: string, status: OrderStatus, price?: number) => void
  onUpdateMedia: (id: string, media: MediaFile[]) => void
}) {
  const [price, setPrice] = useState<string>(order.estimatedPrice?.toString() || '')
  const [note, setNote] = useState('')
  const [activeMediaTab, setActiveMediaTab] = useState<OrderStatus>(order.status)
  const currentIndex = statusFlow.indexOf(order.status)
  const canAdvance = currentIndex < statusFlow.length - 1
  const canReject = order.status === 'PENDING'

  function handleAddMedia(files: MediaFile[]) {
    onUpdateMedia(order.id, [...order.media, ...files])
  }
  function handleRemoveMedia(mediaId: string) {
    onUpdateMedia(order.id, order.media.filter((m) => m.id !== mediaId))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#05050A]/85 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl max-h-[92dvh] overflow-y-auto glass-strong rounded-lg">

        {/* Header */}
        <div className="sticky top-0 z-10 glass-strong flex items-center justify-between px-6 py-5 border-b border-[rgba(255,255,255,0.06)]">
          <div>
            <div className="font-mono text-xs text-[#6B6B8A] mb-1">{order.orderNumber}</div>
            <h2 className="font-display text-3xl text-[#EEEEFC]">
              {order.carBrand} {order.carModel}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={order.status} />
            <button onClick={onClose} className="text-[#6B6B8A] hover:text-[#EEEEFC] transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Coloana stânga */}
          <div className="space-y-5">
            <div>
              <div className="font-label text-xs tracking-[0.2em] uppercase text-[#C8FF00] mb-2">Client</div>
              <div className="glass rounded-sm p-3 space-y-1">
                <div className="font-label text-sm text-[#EEEEFC]">{order.clientName}</div>
                <div className="font-mono text-xs text-[#6B6B8A]">{order.clientEmail}</div>
              </div>
            </div>

            <div>
              <div className="font-label text-xs tracking-[0.2em] uppercase text-[#C8FF00] mb-2">Vehicul</div>
              <div className="glass rounded-sm p-3 space-y-2">
                {[
                  ['Model', `${order.carBrand} ${order.carModel} ${order.carYear}`],
                  ['Nr. înmatriculare', order.carPlate],
                  ['Serviciu', order.serviceType],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-[#6B6B8A]">{label}</span>
                    <span className={`font-mono ${label === 'Serviciu' ? 'text-[#C8FF00]' : 'text-[#EEEEFC]'}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="font-label text-xs tracking-[0.2em] uppercase text-[#C8FF00] mb-2">Descriere comandă</div>
              <p className="text-[#6B6B8A] text-sm leading-relaxed">{order.description}</p>
            </div>

            <div>
              <div className="font-label text-xs tracking-[0.2em] uppercase text-[#C8FF00] mb-3">Etape lucrare</div>
              <div className="space-y-1.5">
                {statusFlow.map((s, i) => {
                  const cfg = statusConfig[s]
                  const Icon = cfg.icon
                  const current = s === order.status
                  const done = i < currentIndex
                  const mediaCount = order.media.filter((m) => m.status === s).length
                  return (
                    <div
                      key={s}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-sm transition-all ${
                        current
                          ? 'border border-[rgba(200,255,0,0.2)] bg-[rgba(200,255,0,0.04)]'
                          : done ? 'opacity-60' : 'opacity-30'
                      }`}
                    >
                      <Icon size={13} style={{ color: current || done ? cfg.color : '#6B6B8A' }} />
                      <span className="font-label text-xs uppercase tracking-wider" style={{ color: current ? cfg.color : done ? cfg.color : '#6B6B8A' }}>
                        {cfg.label}
                      </span>
                      {mediaCount > 0 && (
                        <span className="ml-auto flex items-center gap-1 font-mono text-[10px] text-[#6B6B8A]">
                          <ImageIcon size={10} /> {mediaCount}
                        </span>
                      )}
                      {current && (
                        <span className={`${mediaCount > 0 ? '' : 'ml-auto'} w-1.5 h-1.5 rounded-full animate-pulse`} style={{ backgroundColor: cfg.color }} />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="font-label text-xs tracking-[0.2em] uppercase text-[#C8FF00] mb-2">Preț ofertă (€)</div>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="ex: 2500"
                  className="w-full bg-[#0C0C14] border border-[rgba(255,255,255,0.07)] rounded-sm px-3 py-2.5 text-[#EEEEFC] placeholder-[#6B6B8A] text-sm font-mono focus:outline-none focus:border-[#C8FF00]/40 transition-colors"
                />
              </div>
              <div>
                <div className="font-label text-xs tracking-[0.2em] uppercase text-[#C8FF00] mb-2">Notă internă</div>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  placeholder="Observații, detalii tehnice..."
                  className="w-full bg-[#0C0C14] border border-[rgba(255,255,255,0.07)] rounded-sm px-3 py-2.5 text-[#EEEEFC] placeholder-[#6B6B8A] text-sm focus:outline-none focus:border-[#C8FF00]/40 transition-colors resize-none"
                />
              </div>
              <div className="space-y-2">
                {canAdvance && (
                  <button
                    onClick={() => {
                      onUpdateStatus(order.id, statusFlow[currentIndex + 1], price ? Number(price) : undefined)
                      onClose()
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-[#C8FF00] text-[#05050A] font-label font-bold uppercase tracking-widest text-xs py-3 rounded-sm hover:bg-white transition-all"
                  >
                    <Check size={14} />
                    {order.status === 'PENDING' ? 'Aprobă cererea' : `Avansează → ${statusConfig[statusFlow[currentIndex + 1]].label}`}
                  </button>
                )}
                {canReject && (
                  <button
                    onClick={onClose}
                    className="w-full flex items-center justify-center gap-2 border border-[rgba(255,45,85,0.3)] text-[#FF2D55] font-label font-bold uppercase tracking-widest text-xs py-2.5 rounded-sm hover:bg-[rgba(255,45,85,0.05)] transition-all"
                  >
                    <X size={14} /> Respinge cererea
                  </button>
                )}
                {order.status === 'COMPLETED' && (
                  <div className="flex items-center justify-center gap-2 text-[#00FF94] py-2">
                    <PackageCheck size={16} />
                    <span className="font-label text-xs uppercase tracking-wider">Comandă finalizată</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Coloana dreapta — media per etapă */}
          <div className="space-y-4">
            <div>
              <div className="font-label text-xs tracking-[0.2em] uppercase text-[#C8FF00] mb-3">
                Fotografii și clipuri per etapă
              </div>
              <div className="flex gap-1 mb-4 flex-wrap">
                {statusFlow.map((s) => {
                  const cfg = statusConfig[s]
                  const count = order.media.filter((m) => m.status === s).length
                  const isActive = activeMediaTab === s
                  return (
                    <button
                      key={s}
                      onClick={() => setActiveMediaTab(s)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-label uppercase tracking-wider transition-all"
                      style={{
                        backgroundColor: isActive ? `${cfg.color}18` : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${isActive ? `${cfg.color}40` : 'rgba(255,255,255,0.06)'}`,
                        color: isActive ? cfg.color : '#6B6B8A',
                      }}
                    >
                      {cfg.label.split(' ')[0]}
                      {count > 0 && (
                        <span className="w-4 h-4 rounded-full text-[10px] flex items-center justify-center" style={{ backgroundColor: `${cfg.color}30`, color: cfg.color }}>
                          {count}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
              <div className="glass rounded-sm p-4">
                <MediaUploadZone
                  status={activeMediaTab}
                  media={order.media}
                  onAdd={handleAddMedia}
                  onRemove={handleRemoveMedia}
                />
              </div>
              {order.media.length > 0 && (
                <div className="mt-3 flex items-center gap-4 text-xs text-[#6B6B8A] font-mono">
                  <span className="flex items-center gap-1">
                    <ImageIcon size={11} />
                    {order.media.filter((m) => m.type === 'image').length} fotografii
                  </span>
                  <span className="flex items-center gap-1">
                    <Video size={11} />
                    {order.media.filter((m) => m.type === 'video').length} clipuri
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Pagina principală Admin ─── */
export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>(allOrders)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'clients'>('dashboard')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'ALL'>('ALL')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showFilter, setShowFilter] = useState(false)

  const updateStatus = (id: string, status: OrderStatus, price?: number) => {
    setOrders((prev) =>
      prev.map((o) => o.id === id ? { ...o, status, estimatedPrice: price !== undefined ? price : o.estimatedPrice } : o)
    )
  }

  const updateMedia = (id: string, media: MediaFile[]) => {
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, media } : o))
    setSelectedOrder((prev) => prev && prev.id === id ? { ...prev, media } : prev)
  }

  const filtered = orders.filter((o) => {
    const matchSearch =
      !search ||
      o.clientName.toLowerCase().includes(search.toLowerCase()) ||
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.carBrand.toLowerCase().includes(search.toLowerCase()) ||
      o.carModel.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'ALL' || o.status === filterStatus
    return matchSearch && matchStatus
  })

  const kpis = [
    { label: 'Total Comenzi',  value: orders.length, sub: 'toate timpurile',  color: '#EEEEFC', icon: ClipboardList },
    { label: 'În așteptare',   value: orders.filter((o) => o.status === 'PENDING').length, sub: 'necesită atenție', color: '#FF9500', icon: Clock },
    { label: 'Active',         value: orders.filter((o) => ['APPROVED', 'IN_PROGRESS', 'QUALITY_CHECK'].includes(o.status)).length, sub: 'în desfășurare', color: '#C8FF00', icon: Wrench },
    { label: 'Venituri Est.',  value: orders.filter((o) => o.estimatedPrice).reduce((acc, o) => acc + (o.estimatedPrice || 0), 0).toLocaleString('ro-RO') + ' €', sub: 'total pipeline', color: '#4E6EFF', icon: Banknote },
  ]

  const pendingOrders = orders.filter((o) => o.status === 'PENDING')

  return (
    <div className="min-h-screen bg-[#05050A] flex">
      {/* Sidebar */}
      <aside className="w-16 lg:w-64 border-r border-[rgba(255,255,255,0.06)] flex flex-col py-6 bg-[#0C0C14]">
        <div className="px-4 lg:px-6 mb-10">
          <Link href="/" className="hidden lg:flex items-center gap-2">
            <span className="font-display text-xl tracking-widest text-[#EEEEFC]">WOB<span className="text-[#C8FF00]">.</span>ART</span>
            <span className="font-label text-[10px] tracking-[0.3em] uppercase text-[#6B6B8A] border border-[rgba(255,255,255,0.08)] px-2 py-0.5 rounded-sm">Admin</span>
          </Link>
          <Link href="/" className="lg:hidden font-display text-xl text-[#C8FF00]">W</Link>
        </div>

        <nav className="flex flex-col gap-0.5 px-2 flex-1">
          {[
            { id: 'dashboard', label: 'Dashboard',  icon: LayoutDashboard },
            { id: 'orders',    label: 'Comenzi',    icon: ClipboardList },
            { id: 'clients',   label: 'Clienți',    icon: Users },
          ].map((item) => {
            const Icon = item.icon
            const active = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as typeof activeTab)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-sm transition-all text-left ${active ? 'bg-[#C8FF00]/10 text-[#C8FF00] border border-[#C8FF00]/15' : 'text-[#6B6B8A] hover:text-[#EEEEFC] hover:bg-[#12121E]'}`}
              >
                <Icon size={17} />
                <span className="hidden lg:block font-label text-sm uppercase tracking-wider">{item.label}</span>
                {item.id === 'orders' && pendingOrders.length > 0 && (
                  <span className="hidden lg:flex ml-auto w-5 h-5 rounded-sm bg-[#FF9500] text-[#05050A] text-[10px] font-bold items-center justify-center">
                    {pendingOrders.length}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        <div className="px-2 mt-auto">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-[#6B6B8A] hover:text-[#EEEEFC] transition-all">
            <LogOut size={17} />
            <span className="hidden lg:block font-label text-sm uppercase tracking-wider">Ieșire</span>
          </Link>
        </div>
      </aside>

      {/* Conținut principal */}
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-20 bg-[#05050A]/90 backdrop-blur-sm border-b border-[rgba(255,255,255,0.06)] px-6 py-4 flex items-center justify-between gap-4">
          <h1 className="font-display text-2xl text-[#EEEEFC] uppercase">
            {activeTab === 'dashboard' ? 'Admin Dashboard' : activeTab === 'orders' ? 'Gestionare Comenzi' : 'Clienți'}
          </h1>
          <div className="flex items-center gap-2">
            <span className="font-label text-xs text-[#6B6B8A] tracking-wider hidden md:block">
              {new Date().toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            {pendingOrders.length > 0 && (
              <span className="flex items-center gap-1.5 bg-[#FF9500]/15 border border-[#FF9500]/30 text-[#FF9500] font-label text-xs uppercase tracking-wider px-3 py-1.5 rounded-sm">
                <Clock size={11} /> {pendingOrders.length} în așteptare
              </span>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((kpi) => {
                  const Icon = kpi.icon
                  return (
                    <div key={kpi.label} className="glass rounded-lg p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-8 h-8 rounded-sm flex items-center justify-center" style={{ backgroundColor: `${kpi.color}15` }}>
                          <Icon size={15} style={{ color: kpi.color }} />
                        </div>
                      </div>
                      <div className="font-mono text-3xl font-bold mb-1" style={{ color: kpi.color }}>{kpi.value}</div>
                      <div className="font-label text-xs uppercase tracking-wider text-[#EEEEFC] mb-0.5">{kpi.label}</div>
                      <div className="text-[#6B6B8A] text-xs">{kpi.sub}</div>
                    </div>
                  )
                })}
              </div>

              {pendingOrders.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-2 h-2 rounded-full bg-[#FF9500] animate-pulse" />
                    <h2 className="font-display text-2xl text-[#EEEEFC]">CERERI ÎN AȘTEPTARE</h2>
                    <span className="font-mono text-xs text-[#FF9500]">({pendingOrders.length})</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pendingOrders.map((order) => (
                      <div
                        key={order.id}
                        className="glass rounded-lg p-5 border border-[rgba(255,149,0,0.12)] hover:border-[rgba(255,149,0,0.25)] transition-all cursor-pointer"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="font-mono text-xs text-[#6B6B8A]">{order.orderNumber}</div>
                            <div className="font-label font-bold text-[#EEEEFC]">{order.clientName}</div>
                          </div>
                          <StatusBadge status={order.status} />
                        </div>
                        <div className="flex items-center gap-2 text-sm mb-3">
                          <Car size={13} className="text-[#6B6B8A]" />
                          <span className="text-[#EEEEFC] font-label">{order.carBrand} {order.carModel} {order.carYear}</span>
                          <span className="text-[#C8FF00] font-mono text-xs ml-auto">{order.serviceType}</span>
                        </div>
                        <p className="text-[#6B6B8A] text-xs leading-relaxed mb-4 line-clamp-2">{order.description}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); updateStatus(order.id, 'APPROVED') }}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-[#C8FF00]/10 border border-[#C8FF00]/30 text-[#C8FF00] font-label font-bold uppercase tracking-wider text-xs py-2 rounded-sm hover:bg-[#C8FF00]/20 transition-all"
                          >
                            <Check size={12} /> Aprobă
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedOrder(order) }}
                            className="px-3 flex items-center justify-center border border-[rgba(255,255,255,0.08)] text-[#6B6B8A] rounded-sm hover:text-[#EEEEFC] transition-all"
                          >
                            <Eye size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-2xl text-[#EEEEFC]">TOATE COMENZILE</h2>
                  <button onClick={() => setActiveTab('orders')} className="font-label text-xs uppercase tracking-widest text-[#6B6B8A] hover:text-[#C8FF00] transition-colors">
                    Vezi tabel complet
                  </button>
                </div>
                <div className="glass rounded-lg overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[rgba(255,255,255,0.05)]">
                        {['Nr. Comandă', 'Client', 'Vehicul', 'Serviciu', 'Status', 'Preț Est.'].map((h) => (
                          <th key={h} className="px-4 py-3 text-left font-label text-xs uppercase tracking-widest text-[#6B6B8A] whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 4).map((order) => (
                        <tr key={order.id} className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)] cursor-pointer transition-colors" onClick={() => setSelectedOrder(order)}>
                          <td className="px-4 py-3 font-mono text-xs text-[#6B6B8A]">{order.orderNumber}</td>
                          <td className="px-4 py-3 font-label text-sm text-[#EEEEFC]">{order.clientName}</td>
                          <td className="px-4 py-3 font-label text-sm text-[#EEEEFC]">{order.carBrand} {order.carModel}</td>
                          <td className="px-4 py-3 font-mono text-xs text-[#C8FF00]">{order.serviceType}</td>
                          <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                          <td className="px-4 py-3 font-mono text-sm text-[#EEEEFC]">{order.estimatedPrice ? `${order.estimatedPrice.toLocaleString('ro-RO')} €` : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Comenzi */}
          {activeTab === 'orders' && (
            <>
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B8A]" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Caută client, comandă, mașină..."
                    className="w-full bg-[#0C0C14] border border-[rgba(255,255,255,0.07)] rounded-sm pl-9 pr-4 py-3 text-[#EEEEFC] placeholder-[#6B6B8A] text-sm focus:outline-none focus:border-[#C8FF00]/40 transition-colors"
                  />
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowFilter(!showFilter)}
                    className="flex items-center gap-2 bg-[#0C0C14] border border-[rgba(255,255,255,0.07)] rounded-sm px-4 py-3 text-[#EEEEFC] text-sm hover:border-[rgba(255,255,255,0.15)] transition-colors"
                  >
                    <Filter size={14} />
                    <span className="font-label text-xs uppercase tracking-wider">{filterStatus === 'ALL' ? 'Toate statusurile' : statusConfig[filterStatus].label}</span>
                    <ChevronDown size={12} className={`transition-transform ${showFilter ? 'rotate-180' : ''}`} />
                  </button>
                  {showFilter && (
                    <div className="absolute right-0 top-full mt-1 glass-strong rounded-sm overflow-hidden z-10 min-w-[200px]">
                      {(['ALL', ...statusFlow] as (OrderStatus | 'ALL')[]).map((s) => (
                        <button
                          key={s}
                          onClick={() => { setFilterStatus(s); setShowFilter(false) }}
                          className={`w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-[rgba(255,255,255,0.04)] transition-colors ${filterStatus === s ? 'text-[#C8FF00]' : 'text-[#EEEEFC]'}`}
                        >
                          <span className="font-label text-xs uppercase tracking-wider">{s === 'ALL' ? 'Toate' : statusConfig[s].label}</span>
                          <span className="ml-auto font-mono text-xs text-[#6B6B8A]">{s === 'ALL' ? orders.length : orders.filter((o) => o.status === s).length}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="glass rounded-lg overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[rgba(255,255,255,0.06)]">
                      {['Nr. Comandă', 'Client', 'Vehicul', 'Nr. Înm.', 'Serviciu', 'Status', 'Media', 'Preț Est.', ''].map((h) => (
                        <th key={h} className="px-4 py-3.5 text-left font-label text-xs uppercase tracking-widest text-[#6B6B8A] whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((order) => (
                      <tr key={order.id} className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)] transition-colors group">
                        <td className="px-4 py-3.5 font-mono text-xs text-[#6B6B8A]">{order.orderNumber}</td>
                        <td className="px-4 py-3.5">
                          <div className="font-label text-sm text-[#EEEEFC]">{order.clientName}</div>
                          <div className="font-mono text-xs text-[#6B6B8A]">{order.clientEmail}</div>
                        </td>
                        <td className="px-4 py-3.5 font-label text-sm text-[#EEEEFC] whitespace-nowrap">{order.carBrand} {order.carModel} {order.carYear}</td>
                        <td className="px-4 py-3.5 font-mono text-xs text-[#6B6B8A]">{order.carPlate}</td>
                        <td className="px-4 py-3.5 font-mono text-xs text-[#C8FF00]">{order.serviceType}</td>
                        <td className="px-4 py-3.5"><StatusBadge status={order.status} /></td>
                        <td className="px-4 py-3.5">
                          {order.media.length > 0 ? (
                            <span className="flex items-center gap-1 font-mono text-xs text-[#6B6B8A]">
                              <ImageIcon size={11} /> {order.media.length}
                            </span>
                          ) : (
                            <span className="text-[#6B6B8A]/40 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-sm text-[#EEEEFC]">
                          {order.estimatedPrice ? `${order.estimatedPrice.toLocaleString('ro-RO')} €` : <span className="text-[#6B6B8A]">Nesetat</span>}
                        </td>
                        <td className="px-4 py-3.5">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 text-[#6B6B8A] hover:text-[#C8FF00] transition-all font-label text-xs uppercase tracking-wider"
                          >
                            <Eye size={13} /> Vezi
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={9} className="px-4 py-12 text-center text-[#6B6B8A] font-label text-sm uppercase tracking-wider">
                          Nu au fost găsite comenzi
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="font-mono text-xs text-[#6B6B8A]">{filtered.length} din {orders.length} comenzi</div>
            </>
          )}

          {/* Clienți */}
          {activeTab === 'clients' && (
            <div className="glass rounded-lg overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,0.06)]">
                    {['Client', 'Email', 'Comenzi', 'Total investit', 'Status ultim'].map((h) => (
                      <th key={h} className="px-4 py-3.5 text-left font-label text-xs uppercase tracking-widest text-[#6B6B8A]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from(
                    orders.reduce((map, o) => {
                      if (!map.has(o.clientEmail)) map.set(o.clientEmail, { name: o.clientName, email: o.clientEmail, orders: [] })
                      map.get(o.clientEmail)!.orders.push(o)
                      return map
                    }, new Map<string, { name: string; email: string; orders: Order[] }>())
                  ).map(([email, client]) => {
                    const total = client.orders.reduce((acc, o) => acc + (o.estimatedPrice || 0), 0)
                    const latest = [...client.orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
                    return (
                      <tr key={email} className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-sm bg-[#C8FF00]/10 flex items-center justify-center font-mono text-xs text-[#C8FF00]">
                              {client.name.charAt(0)}
                            </div>
                            <span className="font-label text-sm text-[#EEEEFC]">{client.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 font-mono text-xs text-[#6B6B8A]">{email}</td>
                        <td className="px-4 py-4 font-mono text-sm text-[#EEEEFC]">{client.orders.length}</td>
                        <td className="px-4 py-4 font-mono text-sm text-[#C8FF00]">{total > 0 ? `${total.toLocaleString('ro-RO')} €` : '—'}</td>
                        <td className="px-4 py-4"><StatusBadge status={latest.status} /></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {selectedOrder && (
        <OrderModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={updateStatus}
          onUpdateMedia={updateMedia}
        />
      )}
    </div>
  )
}
