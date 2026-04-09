import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const user = await login(email, password);
      toast.success('Autentificare reușită!');
      
      // Redirect based on role
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        const redirect = searchParams.get('redirect') || '/dashboard';
        navigate(redirect);
      }
    } catch (error) {
      const detail = error.response?.data?.detail;
      let message = 'Eroare la autentificare';
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
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
        className="absolute top-6 left-6 flex items-center gap-2 text-[#A1A1AA] hover:text-white transition-colors"
        data-testid="back-to-home"
      >
        <ArrowLeft size={20} />
        <span className="text-sm">Înapoi</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.6 }}
        className="glass-strong rounded-2xl p-8 w-full max-w-md mx-4"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-gradient-cyan">WOB ART</h1>
          <p className="text-[#71717A] text-sm mt-2">Intră în cont</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-[#A1A1AA] mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplu.ro"
              className="w-full"
              required
              data-testid="login-email"
            />
          </div>

          <div>
            <label className="block text-sm text-[#A1A1AA] mb-2">Parolă</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pr-10"
                required
                data-testid="login-password"
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

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
            data-testid="login-submit"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Se autentifică...
              </>
            ) : (
              'Intră în cont'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[#71717A] text-sm">
            Nu ai cont?{' '}
            <Link 
              to="/register" 
              className="text-[#00F0FF] hover:underline"
              data-testid="register-link"
            >
              Înregistrează-te
            </Link>
          </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#00F0FF]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#BD00FF]/10 rounded-full blur-3xl pointer-events-none" />
      </motion.div>
    </div>
  );
}
