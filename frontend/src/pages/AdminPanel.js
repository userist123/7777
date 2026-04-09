import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';
import {
  LayoutDashboard, Users, ClipboardList, Settings, LogOut, Search,
  TrendingUp, DollarSign, Package, Clock, ChevronDown, Eye, Edit,
  CheckCircle2, XCircle, ArrowRight, RefreshCw
} from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'În așteptare', color: '#A1A1AA' },
  { value: 'APPROVED', label: 'Aprobat', color: '#00F0FF' },
  { value: 'IN_PROGRESS', label: 'În lucru', color: '#FFB000' },
  { value: 'QUALITY_CHECK', label: 'Control calitate', color: '#BD00FF' },
  { value: 'COMPLETED', label: 'Finalizat', color: '#00FFA3' }
];

// Stats Card
function StatCard({ title, value, icon: Icon, color, trend }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[#71717A] text-sm mb-1">{title}</p>
          <p className="font-mono text-3xl font-bold" style={{ color }}>{value}</p>
          {trend && (
            <p className="text-xs text-[#00FFA3] mt-2 flex items-center gap-1">
              <TrendingUp size={12} /> {trend}
            </p>
          )}
        </div>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <Icon size={24} style={{ color }} />
        </div>
      </div>
    </motion.div>
  );
}

// Order Row
function OrderRow({ order, onUpdate, onView }) {
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState(order.status);
  const [price, setPrice] = useState(order.estimated_price || '');
  const [saving, setSaving] = useState(false);

  const statusCfg = STATUS_OPTIONS.find(s => s.value === order.status) || STATUS_OPTIONS[0];

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.patch(`${API}/api/admin/orders/${order.order_number}`, {
        status,
        estimated_price: price ? parseFloat(price) : null
      }, { withCredentials: true });
      toast.success('Comandă actualizată');
      onUpdate();
      setEditing(false);
    } catch (error) {
      toast.error('Eroare la actualizare');
    } finally {
      setSaving(false);
    }
  };

  return (
    <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
      <td className="py-4 px-4">
        <span className="font-mono text-sm text-[#00F0FF]">{order.order_number}</span>
      </td>
      <td className="py-4 px-4">
        <div className="text-sm text-white">{order.user_name}</div>
        <div className="text-xs text-[#71717A]">{order.user_email}</div>
      </td>
      <td className="py-4 px-4">
        <div className="text-sm text-white">{order.car_brand} {order.car_model}</div>
        <div className="text-xs text-[#71717A]">{order.car_year}</div>
      </td>
      <td className="py-4 px-4">
        <span className="text-sm text-[#A1A1AA]">{order.service_type}</span>
      </td>
      <td className="py-4 px-4">
        {editing ? (
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="text-sm py-1 px-2 rounded bg-[#0F0F13] border border-white/10"
            data-testid={`status-select-${order.order_number}`}
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        ) : (
          <span 
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium"
            style={{ backgroundColor: `${statusCfg.color}15`, color: statusCfg.color }}
          >
            {statusCfg.label}
          </span>
        )}
      </td>
      <td className="py-4 px-4">
        {editing ? (
          <input
            type="number"
            value={price}
            onChange={e => setPrice(e.target.value)}
            placeholder="0"
            className="w-24 text-sm py-1 px-2 rounded bg-[#0F0F13] border border-white/10"
            data-testid={`price-input-${order.order_number}`}
          />
        ) : (
          <span className="font-mono text-sm" style={{ color: order.estimated_price ? '#00FFA3' : '#71717A' }}>
            {order.estimated_price ? `${order.estimated_price} €` : '—'}
          </span>
        )}
      </td>
      <td className="py-4 px-4">
        {order.deposit_paid ? (
          <CheckCircle2 size={16} className="text-[#00FFA3]" />
        ) : (
          <XCircle size={16} className="text-[#71717A]" />
        )}
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className="text-[#00FFA3] hover:bg-[#00FFA3]/10 p-1.5 rounded transition-colors"
                data-testid={`save-order-${order.order_number}`}
              >
                <CheckCircle2 size={16} />
              </button>
              <button
                onClick={() => setEditing(false)}
                className="text-[#71717A] hover:bg-white/5 p-1.5 rounded transition-colors"
              >
                <XCircle size={16} />
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="text-[#71717A] hover:text-[#00F0FF] hover:bg-[#00F0FF]/10 p-1.5 rounded transition-colors"
              data-testid={`edit-order-${order.order_number}`}
            >
              <Edit size={16} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

// Main Admin Panel
export default function AdminPanel() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes, usersRes, quotesRes] = await Promise.all([
        axios.get(`${API}/api/admin/stats`, { withCredentials: true }),
        axios.get(`${API}/api/admin/orders`, { withCredentials: true }),
        axios.get(`${API}/api/admin/users`, { withCredentials: true }),
        axios.get(`${API}/api/admin/quotes`, { withCredentials: true })
      ]);
      setStats(statsRes.data);
      setOrders(ordersRes.data);
      setUsers(usersRes.data);
      setQuotes(quotesRes.data);
    } catch {
      toast.error('Eroare la încărcarea datelor');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const filteredOrders = orders.filter(order => {
    if (statusFilter && order.status !== statusFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        order.order_number.toLowerCase().includes(term) ||
        order.user_name?.toLowerCase().includes(term) ||
        order.user_email?.toLowerCase().includes(term) ||
        order.car_brand?.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const navItems = [
    { id: 'orders', label: 'Comenzi', icon: ClipboardList },
    { id: 'users', label: 'Utilizatori', icon: Users },
    { id: 'quotes', label: 'Cereri Ofertă', icon: Package }
  ];

  return (
    <div className="min-h-screen flex" data-testid="admin-panel">
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
            WOB<span className="text-[#BD00FF]">.</span>ADMIN
          </Link>
          <Link to="/" className="font-display text-xl font-bold text-[#BD00FF] lg:hidden">A</Link>
        </div>

        <nav className="flex flex-col gap-1 px-2 flex-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                activeTab === item.id
                  ? 'bg-[#BD00FF]/10 text-[#BD00FF]'
                  : 'text-[#71717A] hover:text-white hover:bg-white/5'
              }`}
              data-testid={`nav-${item.id}`}
            >
              <item.icon size={18} />
              <span className="hidden lg:block text-sm font-medium">{item.label}</span>
            </button>
          ))}

          <Link 
            to="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#71717A] hover:text-[#00F0FF] hover:bg-[#00F0FF]/5 transition-all mt-4"
          >
            <LayoutDashboard size={18} />
            <span className="hidden lg:block text-sm">Dashboard Client</span>
          </Link>
        </nav>

        <div className="px-2 mt-auto">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#71717A] hover:text-red-400 hover:bg-red-500/5 transition-all w-full"
            data-testid="admin-logout"
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
            <h1 className="font-display text-2xl text-white">
              {activeTab === 'orders' && 'GESTIUNE COMENZI'}
              {activeTab === 'users' && 'UTILIZATORI'}
              {activeTab === 'quotes' && 'CERERI OFERTĂ'}
            </h1>
            <p className="text-[#71717A] text-xs uppercase tracking-wider">
              Admin · {user?.name}
            </p>
          </div>
          <button
            onClick={fetchData}
            className="btn-secondary flex items-center gap-2 text-sm"
            data-testid="refresh-data"
          >
            <RefreshCw size={14} /> Reîncarcă
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="loader"></div>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard title="Total Comenzi" value={stats.total_orders} icon={Package} color="#00F0FF" />
                <StatCard title="În Așteptare" value={stats.pending_orders} icon={Clock} color="#A1A1AA" />
                <StatCard title="În Lucru" value={stats.in_progress} icon={Settings} color="#FFB000" />
                <StatCard title="Finalizate" value={stats.completed} icon={CheckCircle2} color="#00FFA3" />
                <StatCard title="Venituri" value={`${stats.total_revenue?.toLocaleString('ro-RO')} €`} icon={DollarSign} color="#BD00FF" />
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="glass rounded-2xl overflow-hidden">
                {/* Filters */}
                <div className="p-4 border-b border-white/5 flex flex-wrap gap-4">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
                    <input
                      type="text"
                      placeholder="Caută comenzi..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full pl-10 py-2 text-sm"
                      data-testid="search-orders"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="py-2 px-3 text-sm min-w-[150px]"
                    data-testid="filter-status"
                  >
                    <option value="">Toate statusurile</option>
                    {STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full" data-testid="orders-table">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-xs font-medium text-[#71717A] uppercase tracking-wider">Comandă</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-[#71717A] uppercase tracking-wider">Client</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-[#71717A] uppercase tracking-wider">Vehicul</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-[#71717A] uppercase tracking-wider">Serviciu</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-[#71717A] uppercase tracking-wider">Status</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-[#71717A] uppercase tracking-wider">Preț</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-[#71717A] uppercase tracking-wider">Avans</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-[#71717A] uppercase tracking-wider">Acțiuni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map(order => (
                        <OrderRow 
                          key={order.order_number} 
                          order={order} 
                          onUpdate={fetchData}
                        />
                      ))}
                    </tbody>
                  </table>
                  {filteredOrders.length === 0 && (
                    <div className="text-center py-12 text-[#71717A]">
                      Nicio comandă găsită
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="glass rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full" data-testid="users-table">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-xs font-medium text-[#71717A] uppercase tracking-wider">Nume</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-[#71717A] uppercase tracking-wider">Email</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-[#71717A] uppercase tracking-wider">Telefon</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-[#71717A] uppercase tracking-wider">Rol</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-[#71717A] uppercase tracking-wider">Înregistrat</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u._id} className="border-b border-white/5 hover:bg-white/[0.02]">
                          <td className="py-4 px-4 text-white">{u.name}</td>
                          <td className="py-4 px-4 text-[#A1A1AA]">{u.email}</td>
                          <td className="py-4 px-4 text-[#A1A1AA]">{u.phone || '—'}</td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 rounded text-xs ${u.role === 'admin' ? 'bg-[#BD00FF]/15 text-[#BD00FF]' : 'bg-[#00F0FF]/15 text-[#00F0FF]'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-mono text-xs text-[#71717A]">
                            {new Date(u.created_at).toLocaleDateString('ro-RO')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Quotes Tab */}
            {activeTab === 'quotes' && (
              <div className="glass rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full" data-testid="quotes-table">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-xs font-medium text-[#71717A] uppercase tracking-wider">Nume</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-[#71717A] uppercase tracking-wider">Contact</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-[#71717A] uppercase tracking-wider">Vehicul</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-[#71717A] uppercase tracking-wider">Serviciu</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-[#71717A] uppercase tracking-wider">Mesaj</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-[#71717A] uppercase tracking-wider">Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quotes.map((q, i) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                          <td className="py-4 px-4 text-white">{q.name}</td>
                          <td className="py-4 px-4">
                            <div className="text-[#A1A1AA] text-sm">{q.email}</div>
                            <div className="text-[#71717A] text-xs">{q.phone}</div>
                          </td>
                          <td className="py-4 px-4 text-[#A1A1AA]">
                            {q.car_brand && q.car_model ? `${q.car_brand} ${q.car_model}` : '—'}
                          </td>
                          <td className="py-4 px-4 text-[#A1A1AA]">{q.service_type}</td>
                          <td className="py-4 px-4 text-[#71717A] text-sm max-w-xs truncate">{q.message || '—'}</td>
                          <td className="py-4 px-4 font-mono text-xs text-[#71717A]">
                            {new Date(q.created_at).toLocaleDateString('ro-RO')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {quotes.length === 0 && (
                    <div className="text-center py-12 text-[#71717A]">
                      Nicio cerere de ofertă
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
