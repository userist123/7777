import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import FuturisticLanding from '@/components/FuturisticLanding';
import {
  ArrowRight, Star, Check, ChevronRight, ChevronDown, Play,
  Phone, Mail, MapPin, Globe, Send, MessageCircle,
  Shield, Zap, Award, Clock, Car, Sparkles, Loader2
} from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

// Services data
const SERVICES = [
  {
    id: 'WRAP_COMPLET',
    title: 'WRAP COMPLET',
    desc: 'Transformare totală a vehiculului cu folie premium 3M, Avery Dennison sau KPMF.',
    price: '2.400 €',
    features: ['Folie premium 5 ani garanție', 'Demontare parțială', 'Kit îngrijire inclus'],
    image: 'https://static.prod-images.emergentagent.com/jobs/557de4fb-5a61-415a-bff2-a49d2d8adece/images/9d17908be93deda312c67c3c3083d5166f0898e99f2026b2c21a4ee88d4951c4.png'
  },
  {
    id: 'PPF',
    title: 'PPF PROTECȚIE',
    desc: 'Folie de protecție invizibilă cu auto-vindecare. XPEL sau SunTek.',
    price: '1.800 €',
    features: ['Auto-vindecare termică', 'Garanție 10 ani', 'Strat hidrofob'],
    image: 'https://static.prod-images.emergentagent.com/jobs/557de4fb-5a61-415a-bff2-a49d2d8adece/images/9d17908be93deda312c67c3c3083d5166f0898e99f2026b2c21a4ee88d4951c4.png'
  },
  {
    id: 'CHROME_DELETE',
    title: 'ȘTERGERE CROM',
    desc: 'Eliminare ornamente și insigne crom pentru un look stealth.',
    price: '480 €',
    features: ['Stâlpi geamuri', 'Ornamente exterior', 'Insigne delete'],
    image: null
  },
  {
    id: 'DETAILING',
    title: 'DETAILING',
    desc: 'Curățare și protecție profesională interior și exterior.',
    price: '250 €',
    features: ['Corecție vopsea', 'Ceramică coating', 'Curățare interior'],
    image: null
  }
];

const REVIEWS = [
  { name: 'Alexandru M.', car: 'BMW M4 — Matte Black', stars: 5, text: 'Absolut impecabil. Echipa WOB ART este profesionistă și livrează exact ce promite.' },
  { name: 'Mihai D.', car: 'Porsche 911 — Satin Blue', stars: 5, text: 'Finisajul satin este perfect, fără bule sau margini vizibile. Recomand!' },
  { name: 'Cristina P.', car: 'Range Rover — Color Shift', stars: 5, text: 'Folie color-shift - toată lumea se întoarce după mine. Calitate incredibilă.' },
  { name: 'Răzvan C.', car: 'Audi RS6 — Steel Brush', stars: 5, text: 'Experiență premium de la început până la sfârșit. Termenul respectat.' }
];

// Navbar Component
function Navbar() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useState(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { label: 'Servicii', href: '#services' },
    { label: 'Portofoliu', href: '#portfolio' },
    { label: 'Reviews', href: '#reviews' },
    { label: 'Contact', href: '#contact' }
  ];

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'glass-strong' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="font-display text-2xl font-bold text-white">
            WOB<span className="text-gradient-cyan">.</span>ART
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {links.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-[#A1A1AA] hover:text-white transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#00F0FF] group-hover:w-full transition-all" />
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="btn-primary text-sm" data-testid="dashboard-link">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm text-[#A1A1AA] hover:text-white transition-colors" data-testid="login-link">
                  Autentificare
                </Link>
                <Link to="/register" className="btn-primary text-sm" data-testid="register-link">
                  Începe Acum
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden flex flex-col gap-1.5 p-2"
            aria-label="Menu"
          >
            <span className={`w-6 h-0.5 bg-white transition-all ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`w-4 h-0.5 bg-white transition-all ${mobileOpen ? 'opacity-0' : ''}`} />
            <span className={`w-6 h-0.5 bg-white transition-all ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-[#050505] flex flex-col items-center justify-center gap-6 md:hidden"
          >
            {links.map(link => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="font-display text-4xl text-white hover:text-[#00F0FF] transition-colors"
              >
                {link.label}
              </a>
            ))}
            <Link 
              to={user ? '/dashboard' : '/login'}
              onClick={() => setMobileOpen(false)}
              className="btn-primary mt-8"
            >
              {user ? 'Dashboard' : 'Autentificare'}
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Hero Section
function HeroSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center overflow-hidden" data-testid="hero-section">
      {/* Background */}
      <motion.div style={{ y }} className="absolute inset-0 z-0">
        <img
          src="https://static.prod-images.emergentagent.com/jobs/557de4fb-5a61-415a-bff2-a49d2d8adece/images/7dfb4bbdffcda1e7b859ff6c0f440f0e08ee777884f5c39d49eef82da727d30e.png"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/80 via-transparent to-[#050505]/50" />
      </motion.div>

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#00F0FF]/10 rounded-full blur-[150px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#BD00FF]/10 rounded-full blur-[150px] animate-pulse-glow" style={{ animationDelay: '1s' }} />

      {/* Content */}
      <motion.div style={{ opacity }} className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-8 bg-[#00F0FF]" />
            <span className="text-[#00F0FF] text-sm font-medium tracking-widest uppercase">
              Premium Auto Studio · București
            </span>
          </div>

          <h1 className="font-display text-[clamp(48px,10vw,120px)] leading-[0.9] text-white mb-4">
            MAȘINA TA.
          </h1>
          <h2 className="font-display text-[clamp(40px,8vw,100px)] leading-[0.9] text-gradient mb-8">
            REINVENTATĂ.
          </h2>

          <p className="text-lg text-[#A1A1AA] max-w-lg mb-10">
            Car wrapping, PPF și detailing de nivel premium. 
            Transformăm vehiculele cu materiale de top și atenție la fiecare detaliu.
          </p>

          <div className="flex flex-wrap gap-4">
            <a href="#contact" className="btn-primary flex items-center gap-2 text-lg px-8 py-4">
              Solicită Ofertă <ArrowRight size={20} />
            </a>
            <a href="#portfolio" className="btn-secondary flex items-center gap-2 text-lg px-8 py-4">
              Vezi Lucrările
            </a>
          </div>

          {/* Trust badges */}
          <div className="flex items-center gap-8 mt-12 pt-8 border-t border-white/10">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="#FFB000" className="text-[#FFB000]" />
                ))}
              </div>
              <span className="text-sm text-[#A1A1AA]">
                <strong className="text-white">4.9</strong> · 120+ reviews
              </span>
            </div>
            <div className="text-sm text-[#A1A1AA]">
              <strong className="text-white font-mono">847+</strong> vehicule transformate
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-[#71717A] uppercase tracking-widest">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <ChevronDown size={20} className="text-[#00F0FF]" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// Services Section
function ServicesSection() {
  const [active, setActive] = useState(0);

  return (
    <section id="services" className="py-24 px-6 relative" data-testid="services-section">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-[#00F0FF] text-sm font-medium tracking-widest uppercase">Servicii</span>
          <h2 className="font-display text-5xl md:text-6xl text-white mt-4">CE FACEM</h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Services list */}
          <div className="space-y-4">
            {SERVICES.map((service, i) => (
              <motion.button
                key={service.id}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setActive(i)}
                className={`w-full text-left p-6 rounded-2xl transition-all ${
                  active === i 
                    ? 'glass border-[#00F0FF]/30' 
                    : 'bg-transparent hover:bg-white/5'
                }`}
                data-testid={`service-btn-${service.id}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className={`font-display text-2xl transition-colors ${
                      active === i ? 'text-white' : 'text-[#71717A]'
                    }`}>
                      {service.title}
                    </h3>
                    <p className={`text-sm mt-2 transition-colors ${
                      active === i ? 'text-[#A1A1AA]' : 'text-[#71717A]/60'
                    }`}>
                      {service.desc}
                    </p>
                  </div>
                  <span className={`font-mono text-lg transition-colors ${
                    active === i ? 'text-[#00F0FF]' : 'text-[#71717A]'
                  }`}>
                    de la {service.price}
                  </span>
                </div>
                
                <AnimatePresence>
                  {active === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 flex flex-wrap gap-2">
                        {service.features.map(feat => (
                          <span key={feat} className="flex items-center gap-1.5 text-xs text-[#00FFA3] bg-[#00FFA3]/10 px-3 py-1.5 rounded-full">
                            <Check size={12} /> {feat}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>

          {/* Service preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative aspect-[4/3] rounded-2xl overflow-hidden glass"
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={active}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                src={SERVICES[active].image || 'https://static.prod-images.emergentagent.com/jobs/557de4fb-5a61-415a-bff2-a49d2d8adece/images/9d17908be93deda312c67c3c3083d5166f0898e99f2026b2c21a4ee88d4951c4.png'}
                alt={SERVICES[active].title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <p className="font-display text-4xl text-white">{SERVICES[active].title}</p>
              <p className="font-mono text-2xl text-[#00F0FF] mt-2">de la {SERVICES[active].price}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Portfolio Section
function PortfolioSection() {
  const portfolio = [
    { brand: 'Porsche', model: '911 GT3', wrap: 'Satin Midnight Blue' },
    { brand: 'Mercedes', model: 'C63 AMG', wrap: 'Gloss White + Chrome Delete' },
    { brand: 'BMW', model: 'M4 Competition', wrap: 'Matte Military Green' },
    { brand: 'Audi', model: 'RS6 Avant', wrap: 'Brushed Steel' },
    { brand: 'Range Rover', model: 'Sport', wrap: 'Color Shift Chameleon' },
    { brand: 'Tesla', model: 'Model S Plaid', wrap: 'Carbon Fiber Gloss' }
  ];

  return (
    <section id="portfolio" className="py-24 px-6" data-testid="portfolio-section">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-[#BD00FF] text-sm font-medium tracking-widest uppercase">Portofoliu</span>
          <h2 className="font-display text-5xl md:text-6xl text-white mt-4">LUCRĂRILE NOASTRE</h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolio.map((item) => (
            <motion.div
              key={`${item.brand}-${item.model}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group relative aspect-[4/3] rounded-2xl overflow-hidden glass cursor-pointer"
            >
              <img
                src={`https://images.unsplash.com/photo-${1600000000000 + portfolio.indexOf(item) * 1000}?w=600&h=450&fit=crop&q=80`}
                alt={`${item.brand} ${item.model}`}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                onError={(e) => { e.target.src = 'https://static.prod-images.emergentagent.com/jobs/557de4fb-5a61-415a-bff2-a49d2d8adece/images/9d17908be93deda312c67c3c3083d5166f0898e99f2026b2c21a4ee88d4951c4.png'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 flex flex-col justify-end p-6 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                <p className="font-display text-2xl text-white">{item.brand} {item.model}</p>
                <p className="text-[#00F0FF] text-sm mt-1">{item.wrap}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Reviews Section
function ReviewsSection() {
  return (
    <section id="reviews" className="py-24 px-6 relative overflow-hidden" data-testid="reviews-section">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#00FFA3]/5 rounded-full blur-[200px]" />
      
      <div className="max-w-7xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-[#00FFA3] text-sm font-medium tracking-widest uppercase">Recenzii</span>
          <h2 className="font-display text-5xl md:text-6xl text-white mt-4">CE SPUN CLIENȚII</h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {REVIEWS.map((review) => (
            <motion.div
              key={`${review.name}-${review.car}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass rounded-2xl p-8 border-glow transition-all"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(review.stars)].map((_, j) => (
                  <Star key={`star-${j}`} size={16} fill="#FFB000" className="text-[#FFB000]" />
                ))}
              </div>
              <p className="text-[#A1A1AA] mb-6 leading-relaxed">"{review.text}"</p>
              <div>
                <p className="font-semibold text-white">{review.name}</p>
                <p className="text-sm text-[#71717A]">{review.car}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Contact Section
function ContactSection() {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', car_brand: '', car_model: '', car_year: '',
    service_type: '', finish_type: '', message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.post(`${API}/api/contact/quote`, formData);
      setSubmitted(true);
      toast.success('Cerere trimisă! Te contactăm în curând.');
    } catch (error) {
      toast.error('Eroare la trimitere. Încearcă din nou.');
    } finally {
      setLoading(false);
    }
  };

  const services = ['Wrap Complet', 'PPF', 'Ștergere Crom', 'Detailing', 'Tinting', 'Interior'];

  return (
    <section id="contact" className="py-24 px-6 relative" data-testid="contact-section">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-[#00F0FF] text-sm font-medium tracking-widest uppercase">Contact</span>
            <h2 className="font-display text-5xl md:text-6xl text-white mt-4 mb-8">
              GATA SĂ<br />TRANSFORMI<br />MAȘINA?
            </h2>

            <div className="space-y-6">
              {[
                { icon: Shield, text: 'Consultație gratuită' },
                { icon: Zap, text: 'Răspuns în aceeași zi' },
                { icon: Award, text: 'Garanție 5 ani la montaj' },
                { icon: Clock, text: 'Fără angajament' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#00F0FF]/10 flex items-center justify-center">
                    <item.icon size={20} className="text-[#00F0FF]" />
                  </div>
                  <span className="text-[#A1A1AA]">{item.text}</span>
                </div>
              ))}
            </div>

            <div className="mt-12 pt-8 border-t border-white/10 space-y-4">
              <a href="tel:+40700000000" className="flex items-center gap-3 text-[#A1A1AA] hover:text-white transition-colors">
                <Phone size={18} className="text-[#00F0FF]" />
                +40 700 000 000
              </a>
              <a href="mailto:contact@wobart.ro" className="flex items-center gap-3 text-[#A1A1AA] hover:text-white transition-colors">
                <Mail size={18} className="text-[#00F0FF]" />
                contact@wobart.ro
              </a>
              <div className="flex items-center gap-3 text-[#A1A1AA]">
                <MapPin size={18} className="text-[#00F0FF]" />
                București, România
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass rounded-2xl p-8"
          >
            {submitted ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-20 h-20 rounded-full bg-[#00FFA3]/20 flex items-center justify-center mb-6">
                  <Check size={40} className="text-[#00FFA3]" />
                </div>
                <h3 className="font-display text-3xl text-white mb-3">CERERE TRIMISĂ</h3>
                <p className="text-[#A1A1AA]">Îți răspundem în aceeași zi lucrătoare.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5" data-testid="contact-form">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#71717A] uppercase tracking-wider mb-1.5">Nume</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} 
                      placeholder="Ion Popescu" required className="w-full" data-testid="contact-name" />
                  </div>
                  <div>
                    <label className="block text-xs text-[#71717A] uppercase tracking-wider mb-1.5">Telefon</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} 
                      placeholder="+40 7xx xxx xxx" required className="w-full" data-testid="contact-phone" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-[#71717A] uppercase tracking-wider mb-1.5">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} 
                    placeholder="email@exemplu.ro" required className="w-full" data-testid="contact-email" />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-[#71717A] uppercase tracking-wider mb-1.5">Marcă</label>
                    <input type="text" name="car_brand" value={formData.car_brand} onChange={handleChange} 
                      placeholder="BMW" className="w-full" />
                  </div>
                  <div>
                    <label className="block text-xs text-[#71717A] uppercase tracking-wider mb-1.5">Model</label>
                    <input type="text" name="car_model" value={formData.car_model} onChange={handleChange} 
                      placeholder="M4" className="w-full" />
                  </div>
                  <div>
                    <label className="block text-xs text-[#71717A] uppercase tracking-wider mb-1.5">An</label>
                    <input type="text" name="car_year" value={formData.car_year} onChange={handleChange} 
                      placeholder="2024" className="w-full" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-[#71717A] uppercase tracking-wider mb-2">Serviciu</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {services.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, service_type: s }))}
                        className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                          formData.service_type === s 
                            ? 'bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/30' 
                            : 'bg-white/5 text-[#A1A1AA] border border-white/5 hover:border-white/20'
                        }`}
                        data-testid={`service-select-${s}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-[#71717A] uppercase tracking-wider mb-1.5">Mesaj</label>
                  <textarea name="message" value={formData.message} onChange={handleChange} 
                    placeholder="Detalii despre ce dorești..." rows={3} className="w-full resize-none" data-testid="contact-message" />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                  data-testid="contact-submit"
                >
                  {loading ? (
                    <><Loader2 size={18} className="animate-spin" /> Se trimite...</>
                  ) : (
                    <>Trimite Cererea <ArrowRight size={18} /></>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer className="border-t border-white/10 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="font-display text-xl font-bold text-white">
          WOB<span className="text-[#00F0FF]">.</span>ART
        </div>
        
        <div className="flex items-center gap-6">
          <a href="#" className="text-[#71717A] hover:text-[#00F0FF] transition-colors" aria-label="Globe">
            <Globe size={20} />
          </a>
          <a href="#" className="text-[#71717A] hover:text-[#00F0FF] transition-colors" aria-label="Send">
            <Send size={20} />
          </a>
          <a href="https://wa.me/40700000000" className="text-[#71717A] hover:text-[#00FFA3] transition-colors" aria-label="WhatsApp">
            <MessageCircle size={20} />
          </a>
        </div>

        <p className="text-[#71717A] text-sm">
          © 2026 WOB ART. Toate drepturile rezervate.
        </p>
      </div>
    </footer>
  );
}

// Main Landing Page
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050810]" data-testid="landing-page">
      <Navbar />
      {/* Futuristic Bento Grid Section */}
      <div className="pt-20">
        <FuturisticLanding />
      </div>
      <ServicesSection />
      <PortfolioSection />
      <ReviewsSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
