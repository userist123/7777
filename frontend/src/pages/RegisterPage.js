import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Parolele nu coincid');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Parola trebuie să aibă minim 6 caractere');
      return;
    }

    setLoading(true);
    
    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });
      toast.success('Cont creat cu succes!');
      navigate('/dashboard');
    } catch (error) {
      const detail = error.response?.data?.detail;
      let message = 'Eroare la înregistrare';
      if (typeof detail === 'string') {
        message = detail;
      } else if (Array.isArray(detail)) {
        message = detail.map(e => e.msg).join(' ');
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-10">
      {/* Holographic background */}
      <div 
        className="holo-bg"
        style={{
          backgroundImage: `url(https://static.prod-images.emergentagent.com/jobs/557de4fb-5a61-415a-bff2-a49d2d8adece/images/8f762d8075a0263aa1e303bb8157256732349c9578c1f8697ae054989647b5ec.png)`
        }}
      />
      
      {/* Back button */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 flex items-center gap-2 text-[#A1A1AA] hover:text-white transition-colors z-10"
        data-testid="back-to-home"
      >
        <ArrowLeft size={20} />
        <span className="text-sm">Înapoi</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.6 }}
        className="glass-strong rounded-2xl p-8 w-full max-w-md mx-4 relative"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-gradient-cyan">WOB ART</h1>
          <p className="text-[#71717A] text-sm mt-2">Creează cont nou</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[#A1A1AA] mb-2">Nume complet</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ion Popescu"
              className="w-full"
              required
              data-testid="register-name"
            />
          </div>

          <div>
            <label className="block text-sm text-[#A1A1AA] mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="email@exemplu.ro"
              className="w-full"
              required
              data-testid="register-email"
            />
          </div>

          <div>
            <label className="block text-sm text-[#A1A1AA] mb-2">Telefon</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+40 7xx xxx xxx"
              className="w-full"
              data-testid="register-phone"
            />
          </div>

          <div>
            <label className="block text-sm text-[#A1A1AA] mb-2">Parolă</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minim 6 caractere"
                className="w-full pr-10"
                required
                data-testid="register-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-[#A1A1AA] mb-2">Confirmă parola</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repetă parola"
              className="w-full"
              required
              data-testid="register-confirm-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-6"
            data-testid="register-submit"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Se creează contul...
              </>
            ) : (
              'Creează cont'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[#71717A] text-sm">
            Ai deja cont?{' '}
            <Link 
              to="/login" 
              className="text-[#00F0FF] hover:underline"
              data-testid="login-link"
            >
              Autentifică-te
            </Link>
          </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#BD00FF]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#00FFA3]/10 rounded-full blur-3xl pointer-events-none" />
      </motion.div>
    </div>
  );
}
