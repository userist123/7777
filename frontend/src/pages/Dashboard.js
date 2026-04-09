import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';
import { 
  LayoutDashboard, ClipboardList, Plus, LogOut, Bell, User,
  Car, ChevronRight, X, ArrowLeft, ArrowRight, CreditCard,
  Clock, CheckCircle2, Wrench, PackageCheck, AlertCircle, Loader2
} from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const STATUS_CONFIG = {
  PENDING: { label: 'În așteptare', color: '#A1A1AA', icon: Clock, badge: 'badge-pending' },
  APPROVED: { label: 'Aprobat', color: '#00F0FF', icon: CheckCircle2, badge: 'badge-approved' },
  IN_PROGRESS: { label: 'În lucru', color: '#FFB000', icon: Wrench, badge: 'badge-progress' },
  QUALITY_CHECK: { label: 'Control calitate', color: '#BD00FF', icon: AlertCircle, badge: 'badge-progress' },
  COMPLETED: { label: 'Finalizat', color: '#00FFA3', icon: PackageCheck, badge: 'badge-completed' }
};

const STATUS_STEPS = ['PENDING', 'APPROVED', 'IN_PROGRESS', 'QUALITY_CHECK', 'COMPLETED'];

const SERVICE_OPTIONS = [
  { id: 'WRAP_COMPLET', label: 'Car Wrapping', desc: 'de la 2.400 €' },
  { id: 'PPF', label: 'PPF Protecție', desc: 'de la 1.800 €' },
  { id: 'CHROME_DELETE', label: 'Ștergere Crom', desc: 'de la 480 €' },
  { id: 'INTERIOR', label: 'Wrap Interior', desc: 'de la 950 €' },
  { id: 'TINTING', label: 'Geamuri Fumurii', desc: 'de la 350 €' },
  { id: 'DETAILING', label: 'Detailing', desc: 'de la 250 €' }
];

// New Order Modal
function NewOrderModal({ onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    car_brand: '', car_model: '', car_year: '', car_plate: '',
    service_type: '', finish_type: '', description: '', preferred_date: ''
  });

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await axios.post(`${API}/api/orders/`, {
        ...form,
        car_year: parseInt(form.car_year) || new Date().getFullYear()
      }, { withCredentials: true });
      toast.success('Cerere trimisă cu succes!');
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error('Eroare la trimiterea cererii');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { label: 'Vehicul', num: 1 },
    { label: 'Serviciu', num: 2 },
    { label: 'Detalii', num: 3 }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-lg glass-strong rounded-2xl p-6 md:p-8"
        data-testid="new-order-modal"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-[#71717A] hover:text-white transition-colors">
          <X size={20} />
        </button>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono font-bold transition-all ${
                step >= s.num ? 'bg-[#00F0FF] text-black' : 'bg-[#0F0F13] text-[#71717A]'
              }`}>
                {s.num}
              </div>
              <span className={`text-xs uppercase tracking-wider ${step === s.num ? 'text-white' : 'text-[#71717A]'}`}>
                {s.label}
              </span>
              {i < steps.length - 1 && <div className={`w-8 h-px ${step > s.num ? 'bg-[#00F0FF]' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h3 className="font-display text-2xl text-white mb-6">DATE VEHICUL</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[#71717A] uppercase tracking-wider mb-1.5">Marcă</label>
                    <input type="text" value={form.car_brand} onChange={e => update('car_brand', e.target.value)} 
                      placeholder="BMW" className="w-full" data-testid="order-car-brand" />
                  </div>
                  <div>
                    <label className="block text-xs text-[#71717A] uppercase tracking-wider mb-1.5">Model</label>
                    <input type="text" value={form.car_model} onChange={e => update('car_model', e.target.value)} 
                      placeholder="M4" className="w-full" data-testid="order-car-model" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[#71717A] uppercase tracking-wider mb-1.5">An fabricație</label>
                    <input type="number" value={form.car_year} onChange={e => update('car_year', e.target.value)} 
                      placeholder="2024" className="w-full" data-testid="order-car-year" />
                  </div>
                  <div>
                    <label className="block text-xs text-[#71717A] uppercase tracking-wider mb-1.5">Nr. înmatriculare</label>
                    <input type="text" value={form.car_plate} onChange={e => update('car_plate', e.target.value)} 
                      placeholder="B 01 WOB" className="w-full" data-testid="order-car-plate" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h3 className="font-display text-2xl text-white mb-6">SERVICIU DORIT</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {SERVICE_OPTIONS.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => update('service_type', s.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      form.service_type === s.id 
                        ? 'border-[#00F0FF] bg-[#00F0FF]/5' 
                        : 'border-white/5 bg-[#0F0F13] hover:border-white/20'
                    }`}
                    data-testid={`service-${s.id}`}
                  >
                    <div className={`text-sm font-semibold mb-1 ${form.service_type === s.id ? 'text-[#00F0FF]' : 'text-white'}`}>
                      {s.label}
                    </div>
                    <div className="font-mono text-xs text-[#71717A]">{s.desc}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h3 className="font-display text-2xl text-white mb-6">DETALII</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-[#71717A] uppercase tracking-wider mb-1.5">Finisaj dorit</label>
                  <input type="text" value={form.finish_type} onChange={e => update('finish_type', e.target.value)} 
                    placeholder="Matte Black, Satin Blue..." className="w-full" data-testid="order-finish" />
                </div>
                <div>
                  <label className="block text-xs text-[#71717A] uppercase tracking-wider mb-1.5">Data preferată</label>
                  <input type="date" value={form.preferred_date} onChange={e => update('preferred_date', e.target.value)} 
                    className="w-full" data-testid="order-date" />
                </div>
                <div>
                  <label className="block text-xs text-[#71717A] uppercase tracking-wider mb-1.5">Detalii suplimentare</label>
                  <textarea value={form.description} onChange={e => update('description', e.target.value)} 
                    placeholder="Descrie ce dorești..." rows={3} className="w-full resize-none" data-testid="order-description" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="btn-secondary flex items-center gap-1.5">
              <ArrowLeft size={16} /> Înapoi
            </button>
          )}
          <button
            onClick={() => step < 3 ? setStep(step + 1) : handleSubmit()}
            disabled={loading || (step === 1 && (!form.car_brand || !form.car_model)) || (step === 2 && !form.service_type)}
            className="btn-primary flex-1 flex items-center justify-center gap-1.5 disabled:opacity-50"
            data-testid="order-next-btn"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {!loading && (step < 3 ? 'Continuă' : 'Trimite cererea')}
            {!loading && <ArrowRight size={16} />}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Order Card
function OrderCard({ order, onPayDeposit }) {
  const currentIndex = STATUS_STEPS.indexOf(order.status);
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6 border-glow transition-all"
      data-testid={`order-card-${order.order_number}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="font-mono text-xs text-[#71717A] mb-1">{order.order_number}</div>
          <div className="font-semibold text-white">{order.car_brand} {order.car_model}</div>
          <div className="text-xs text-[#71717A] uppercase tracking-wider">
            {SERVICE_OPTIONS.find(s => s.id === order.service_type)?.label || order.service_type}
          </div>
        </div>
        <div className={`badge ${cfg.badge}`}>
          <Icon size={12} />
          {cfg.label}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-[#71717A] uppercase tracking-wider">Progress</span>
          <span className="font-mono text-xs" style={{ color: cfg.color }}>
            {Math.round(((currentIndex + 1) / STATUS_STEPS.length) * 100)}%
          </span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / STATUS_STEPS.length) * 100}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}80)` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="flex items-center justify-between mb-4">
        {STATUS_STEPS.map((s, i) => {
          const sCfg = STATUS_CONFIG[s];
          const SIcon = sCfg.icon;
          const done = i <= currentIndex;
          return (
            <div key={s} className="flex items-center">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                style={{
                  backgroundColor: done ? `${sCfg.color}20` : '#0F0F13',
                  border: `1px solid ${done ? `${sCfg.color}50` : 'rgba(255,255,255,0.05)'}`
                }}
                title={sCfg.label}
              >
                <SIcon size={12} style={{ color: done ? sCfg.color : '#71717A' }} />
              </div>
              {i < STATUS_STEPS.length - 1 && (
                <div className={`w-full h-px flex-1 mx-1 ${i < currentIndex ? 'bg-[#00F0FF]/30' : 'bg-white/5'}`} style={{ minWidth: '8px' }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div>
          <span className="text-xs text-[#71717A] uppercase tracking-wider">Estimat</span>
          <div className="font-mono text-lg" style={{ color: cfg.color }}>
            {order.estimated_price ? `${order.estimated_price.toLocaleString('ro-RO')} €` : '—'}
          </div>
        </div>
        {order.status === 'APPROVED' && !order.deposit_paid && order.estimated_price && (
          <button 
            onClick={() => onPayDeposit(order.order_number)}
            className="btn-primary text-sm flex items-center gap-2"
            data-testid={`pay-deposit-${order.order_number}`}
          >
            <CreditCard size={14} />
            Plătește avans
          </button>
        )}
        {order.deposit_paid && (
          <span className="badge badge-completed">
            <CheckCircle2 size={12} />
            Avans plătit
          </span>
        )}
      </div>
    </motion.div>
  );
}

// Main Dashboard
export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewOrder, setShowNewOrder] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/api/orders/`, { withCredentials: true });
      setOrders(response.data);
    } catch {
      // Error fetching orders - handled silently
    } finally {
      setLoading(false);
    }
  }, []);

  const checkPaymentStatus = useCallback(async (sessionId) => {
    try {
      const response = await axios.get(`${API}/api/payments/status/${sessionId}`, { withCredentials: true });
      if (response.data.payment_status === 'paid') {
        toast.success('Plată efectuată cu succes!');
        fetchOrders();
      }
    } catch {
      // Payment status check failed - handled silently
    }
  }, [fetchOrders]);

  useEffect(() => {
    fetchOrders();
    
    // Check for payment callback
    const payment = searchParams.get('payment');
    const sessionId = searchParams.get('session_id');
    if (payment === 'success' && sessionId) {
      checkPaymentStatus(sessionId);
    }
  }, [searchParams, fetchOrders, checkPaymentStatus]);

  const handlePayDeposit = async (orderNumber) => {
    try {
      const response = await axios.post(`${API}/api/payments/checkout`, {
        order_id: orderNumber,
        origin_url: window.location.origin
      }, { withCredentials: true });
      window.location.href = response.data.url;
    } catch (error) {
      toast.error('Eroare la inițierea plății');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const activeOrders = orders.filter(o => o.status !== 'COMPLETED');
  const completedOrders = orders.filter(o => o.status === 'COMPLETED');

  const kpis = [
    { label: 'Comenzi Active', value: activeOrders.length, color: '#00F0FF' },
    { label: 'Finalizate', value: completedOrders.length, color: '#00FFA3' },
    { label: 'Total Investit', value: orders.reduce((sum, o) => sum + (o.deposit_amount || 0), 0).toLocaleString('ro-RO') + ' €', color: '#BD00FF' }
  ];

  return (
    <div className="min-h-screen flex" data-testid="dashboard">
      {/* Holographic background */}
      <div 
        className="holo-bg"
        style={{
          backgroundImage: `url(https://static.prod-images.emergentagent.com/jobs/557de4fb-5a61-415a-bff2-a49d2d8adece/images/8f762d8075a0263aa1e303bb8157256732349c9578c1f8697ae054989647b5ec.png)`
        }}
      />

      {/* Sidebar */}
      <aside className="w-16 lg:w-64 glass-strong border-r border-white/5 flex flex-col py-6 relative z-10">
        <div className="px-4 lg:px-6 mb-10">
          <Link to="/" className="font-display text-xl font-bold tracking-tight text-white hidden lg:block">
            WOB<span className="text-[#00F0FF]">.</span>ART
          </Link>
          <Link to="/" className="font-display text-xl font-bold text-[#00F0FF] lg:hidden">W</Link>
        </div>

        <nav className="flex flex-col gap-1 px-2 flex-1">
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#00F0FF]/10 text-[#00F0FF]">
            <LayoutDashboard size={18} />
            <span className="hidden lg:block text-sm font-medium">Dashboard</span>
          </button>
          
          <button 
            onClick={() => setShowNewOrder(true)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#71717A] hover:text-white hover:bg-white/5 transition-all mt-2"
            data-testid="new-order-btn"
          >
            <Plus size={18} />
            <span className="hidden lg:block text-sm">Cerere nouă</span>
          </button>

          {user?.role === 'admin' && (
            <Link 
              to="/admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#71717A] hover:text-[#BD00FF] hover:bg-[#BD00FF]/5 transition-all mt-2"
              data-testid="admin-link"
            >
              <ClipboardList size={18} />
              <span className="hidden lg:block text-sm">Admin Panel</span>
            </Link>
          )}
        </nav>

        <div className="px-2 mt-auto space-y-1">
          <div className="flex items-center gap-3 px-3 py-2.5 text-[#71717A]">
            <User size={18} />
            <span className="hidden lg:block text-sm truncate">{user?.name}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#71717A] hover:text-red-400 hover:bg-red-500/5 transition-all w-full"
            data-testid="logout-btn"
          >
            <LogOut size={18} />
            <span className="hidden lg:block text-sm">Ieșire</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto relative z-10">
        {/* Top bar */}
        <div className="sticky top-0 z-20 glass border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl text-white">BUNĂ, {user?.name?.split(' ')[0]?.toUpperCase()}</h1>
            <p className="text-[#71717A] text-xs uppercase tracking-wider">
              {new Date().toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <button
            onClick={() => setShowNewOrder(true)}
            className="btn-primary flex items-center gap-2 text-sm"
            data-testid="new-order-btn-header"
          >
            <Plus size={16} /> Cerere nouă
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {kpis.map((kpi, i) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-6"
              >
                <div className="font-mono text-3xl font-bold mb-1" style={{ color: kpi.color }}>
                  {kpi.value}
                </div>
                <div className="text-sm text-[#71717A]">{kpi.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Orders */}
          <div>
            <h2 className="font-display text-xl text-white mb-4">COMENZILE MELE</h2>
            
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="loader"></div>
              </div>
            ) : orders.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass rounded-2xl p-12 text-center"
              >
                <Car size={48} className="mx-auto mb-4 text-[#71717A]" />
                <h3 className="font-display text-xl text-white mb-2">Nicio comandă</h3>
                <p className="text-[#71717A] text-sm mb-6">Începe prin a crea prima ta cerere de servicii</p>
                <button onClick={() => setShowNewOrder(true)} className="btn-primary">
                  <Plus size={16} className="mr-2 inline" />
                  Cerere nouă
                </button>
              </motion.div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {orders.map(order => (
                  <OrderCard 
                    key={order.order_number} 
                    order={order} 
                    onPayDeposit={handlePayDeposit}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* New Order Modal */}
      <AnimatePresence>
        {showNewOrder && (
          <NewOrderModal 
            onClose={() => setShowNewOrder(false)} 
            onSuccess={fetchOrders}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
