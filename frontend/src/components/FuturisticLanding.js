import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { X, Zap, Activity, Users, Shield, Star, ArrowRight, Play, ChevronRight, Sparkles, Award, Pause, RotateCcw } from 'lucide-react';

// Wrap Colors for Configurator
const WRAP_COLORS = [
  { id: 'matte-black', name: 'Matte Black', hex: '#1a1a1a', gradient: 'linear-gradient(135deg, #1a1a1a 0%, #333 100%)' },
  { id: 'satin-blue', name: 'Satin Midnight Blue', hex: '#1e3a5f', gradient: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8a 100%)' },
  { id: 'gloss-white', name: 'Gloss Pearl White', hex: '#f5f5f5', gradient: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)' },
  { id: 'military-green', name: 'Military Green', hex: '#4a5d23', gradient: 'linear-gradient(135deg, #4a5d23 0%, #6b7d3a 100%)' },
  { id: 'color-shift', name: 'Color Shift Chameleon', hex: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #06b6d4 100%)' },
  { id: 'neon-orange', name: 'Neon Orange', hex: '#ff6b00', gradient: 'linear-gradient(135deg, #ff6b00 0%, #ff9500 100%)' },
  { id: 'steel-brush', name: 'Brushed Steel', hex: '#71717a', gradient: 'linear-gradient(135deg, #71717a 0%, #a1a1aa 50%, #71717a 100%)' },
  { id: 'cherry-red', name: 'Cherry Red', hex: '#dc2626', gradient: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)' },
];

// Custom Cursor Component
function CustomCursor() {
  const cursorRef = useRef(null);
  const trailRefs = useRef([]);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const cursor = cursorRef.current;
    const trails = trailRefs.current;
    let mouseX = 0, mouseY = 0;
    let trailPositions = trails.map(() => ({ x: 0, y: 0 }));

    const moveCursor = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const animate = () => {
      if (cursor) {
        cursor.style.transform = `translate(${mouseX - 12}px, ${mouseY - 12}px)`;
      }
      
      // Trail animation
      trails.forEach((trail, i) => {
        if (trail) {
          const delay = (i + 1) * 0.08;
          trailPositions[i].x += (mouseX - trailPositions[i].x) * (1 - delay);
          trailPositions[i].y += (mouseY - trailPositions[i].y) * (1 - delay);
          trail.style.transform = `translate(${trailPositions[i].x - 6}px, ${trailPositions[i].y - 6}px)`;
          trail.style.opacity = 1 - (i * 0.2);
        }
      });
      
      requestAnimationFrame(animate);
    };

    const handleHover = (e) => {
      const target = e.target;
      if (target.closest('button, a, [data-hover]')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    document.addEventListener('mousemove', moveCursor);
    document.addEventListener('mouseover', handleHover);
    animate();

    return () => {
      document.removeEventListener('mousemove', moveCursor);
      document.removeEventListener('mouseover', handleHover);
    };
  }, []);

  return (
    <>
      {/* Trail dots */}
      {[...Array(5)].map((_, i) => (
        <div
          key={`trail-${i}`}
          ref={el => trailRefs.current[i] = el}
          className="fixed top-0 left-0 w-3 h-3 rounded-full pointer-events-none z-[9999] mix-blend-difference"
          style={{
            background: `rgba(0, 245, 255, ${0.3 - i * 0.05})`,
            boxShadow: `0 0 ${10 - i * 2}px rgba(0, 245, 255, 0.3)`,
          }}
        />
      ))}
      {/* Main cursor */}
      <div
        ref={cursorRef}
        className={`fixed top-0 left-0 w-6 h-6 rounded-full pointer-events-none z-[10000] transition-all duration-150 ${
          isHovering ? 'scale-150' : 'scale-100'
        }`}
        style={{
          background: isHovering 
            ? 'radial-gradient(circle, rgba(240,21,127,0.8) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(0,245,255,0.8) 0%, transparent 70%)',
          boxShadow: isHovering 
            ? '0 0 30px rgba(240,21,127,0.5)' 
            : '0 0 20px rgba(0,245,255,0.5)',
        }}
      />
    </>
  );
}

// Magnetic Button Component
function MagneticButton({ children, className = '', onClick, href }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) {
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = (e.clientX - centerX) * 0.3;
      const deltaY = (e.clientY - centerY) * 0.3;
      x.set(deltaX);
      y.set(deltaY);
    }
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const Component = href ? motion.a : motion.button;

  return (
    <Component
      ref={ref}
      href={href}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={`relative overflow-hidden group ${className}`}
      data-hover
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Animated gradient border */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-0 rounded-xl animate-border-spin" style={{
          background: 'linear-gradient(90deg, #00f5ff, #7c3aed, #f0157f, #00f5ff)',
          backgroundSize: '300% 100%',
        }} />
        <div className="absolute inset-[2px] rounded-xl bg-[#0a0f1e]" />
      </div>
      
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ boxShadow: '0 0 30px rgba(0,245,255,0.4), inset 0 0 30px rgba(0,245,255,0.1)' }}
      />
      
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </Component>
  );
}

// Kinetic Typography Component
function KineticText({ text, className = '', delay = 0 }) {
  const [displayText, setDisplayText] = useState('');
  const [isGlitching, setIsGlitching] = useState(true);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*';

  useEffect(() => {
    let iteration = 0;
    const finalText = text;
    
    const interval = setInterval(() => {
      setDisplayText(
        finalText
          .split('')
          .map((char, idx) => {
            if (idx < iteration) return finalText[idx];
            if (char === ' ') return ' ';
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('')
      );

      if (iteration >= finalText.length) {
        clearInterval(interval);
        setIsGlitching(false);
      }
      iteration += 1 / 3;
    }, 30);

    return () => clearInterval(interval);
  }, [text]);

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
      className={`inline-block ${className} ${isGlitching ? 'text-[#00f5ff]' : ''}`}
    >
      {displayText || text}
    </motion.span>
  );
}

// Bento Card Component
function BentoCard({ 
  children, 
  className = '', 
  span = 1, 
  rowSpan = 1, 
  expandable = false,
  onClick,
  index = 0 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (expandable) {
      setIsExpanded(!isExpanded);
    }
    onClick?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: 1,
        gridColumn: isExpanded ? 'span 2' : `span ${span}`,
        gridRow: isExpanded ? 'span 2' : `span ${rowSpan}`,
      }}
      transition={{ 
        delay: index * 0.1,
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1]
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleClick}
      className={`
        relative overflow-hidden rounded-2xl cursor-pointer
        backdrop-blur-xl bg-white/[0.03] border border-white/10
        transition-all duration-500 ease-out
        ${isHovered ? 'border-[#00f5ff]/50 shadow-[0_0_40px_rgba(0,245,255,0.15)]' : ''}
        ${expandable ? 'hover:scale-[1.02]' : ''}
        ${className}
      `}
      style={{
        gridColumn: isExpanded ? 'span 2' : `span ${span}`,
        gridRow: isExpanded ? 'span 2' : `span ${rowSpan}`,
      }}
    >
      {/* Animated border gradient */}
      <div className={`absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 ${isHovered ? 'opacity-100' : ''}`}>
        <div className="absolute inset-0 rounded-2xl animate-border-spin" style={{
          background: 'linear-gradient(90deg, #00f5ff, #7c3aed, #f0157f, #00f5ff)',
          backgroundSize: '400% 100%',
          padding: '1px',
        }}>
          <div className="absolute inset-[1px] rounded-2xl bg-[#0a0f1e]" />
        </div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 h-full p-6">
        {children}
        
        {/* Expand indicator */}
        {expandable && (
          <motion.div 
            className="absolute top-4 right-4 text-[#00f5ff]/50"
            animate={{ rotate: isExpanded ? 45 : 0 }}
          >
            {isExpanded ? <X size={20} /> : <ChevronRight size={20} />}
          </motion.div>
        )}
      </div>

      {/* Hover reveal overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-[#00f5ff]/10 to-transparent pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
      />
    </motion.div>
  );
}

// Animated Counter
function AnimatedCounter({ value, suffix = '', prefix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let start = 0;
          const end = parseInt(value);
          const duration = 2000;
          const stepTime = Math.abs(Math.floor(duration / end));
          
          const timer = setInterval(() => {
            start += 1;
            setCount(start);
            if (start >= end) clearInterval(timer);
          }, stepTime);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, hasAnimated]);

  return (
    <span ref={ref} className="font-mono tabular-nums">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

// Image Modal with FLIP animation
function ImageModal({ isOpen, onClose, imageSrc, imageAlt, originRect }) {
  useEffect(() => {
    const handleEsc = (e) => e.key === 'Escape' && onClose();
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-8"
          style={{ backdropFilter: 'blur(20px)' }}
        >
          <div className="absolute inset-0 bg-black/80" />
          
          <motion.div
            initial={{ 
              scale: 0.5, 
              opacity: 0,
              y: 50
            }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              y: 0
            }}
            exit={{ 
              scale: 0.5, 
              opacity: 0,
              y: 50
            }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 overflow-hidden"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
            
            <img src={imageSrc} alt={imageAlt} className="w-full h-auto" />
            
            <div className="p-6">
              <h3 className="font-display text-2xl text-white mb-2">{imageAlt}</h3>
              <p className="text-[#a1a1aa]">Premium wrap transformation cu materiale de top și finisaj impecabil.</p>
              <div className="flex gap-2 mt-4">
                {['Wrap Complet', 'Premium', '3M'].map(tag => (
                  <span key={tag} className="px-3 py-1 rounded-full text-xs bg-[#00f5ff]/10 text-[#00f5ff] border border-[#00f5ff]/20">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Car Color Configurator Component - Enhanced Sports Car SVG
function CarConfigurator() {
  const [selectedColor, setSelectedColor] = useState(WRAP_COLORS[0]);
  const [isRotating, setIsRotating] = useState(true);
  const [viewAngle, setViewAngle] = useState(0); // 0 = front-side, 1 = side, 2 = back-side
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isRotating) return;
    const interval = setInterval(() => {
      setViewAngle(prev => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, [isRotating]);

  // Porsche 911-style sports car SVG paths for different angles
  const carViews = {
    0: { // Front-side view
      body: "M30,130 Q30,125 40,120 L80,115 L120,90 Q140,75 180,70 L280,70 Q320,75 340,90 L370,115 Q380,120 380,130 L380,150 L30,150 Z",
      roof: "M125,90 Q145,70 175,68 L245,68 Q290,70 310,90 L280,95 L130,95 Z",
      windows: "M130,92 L280,92 Q295,80 285,72 L175,72 Q150,75 140,85 Z",
      hood: "M80,115 L120,90 L145,92 L145,115 Z",
      trunk: "M295,92 L340,115 L295,115 Z",
      bumperF: "M30,130 L30,145 L80,145 L85,130 Z",
      bumperR: "M320,130 L380,130 L380,145 L320,145 Z",
      lightF: "M40,125 Q45,120 55,122 L70,125 L70,135 L45,135 Z",
      lightR: "M340,125 L365,125 L365,135 L340,135 Q335,130 340,125 Z"
    },
    1: { // Pure side view  
      body: "M20,130 L40,130 L50,110 L100,85 L140,70 L280,70 L330,85 L370,110 L380,130 L400,130 L400,155 L20,155 Z",
      roof: "M145,70 L275,70 L275,72 L145,72 Z",
      windows: "M105,87 L135,72 L265,72 L300,87 Z",
      hood: "M50,110 L100,85 L105,87 L60,112 Z",
      trunk: "M300,87 L330,85 L345,110 L305,110 Z",
      bumperF: "M20,130 L20,150 L50,150 L55,130 Z",
      bumperR: "M360,130 L400,130 L400,150 L365,150 Z",
      lightF: "M25,128 L45,128 L45,140 L25,140 Z",
      lightR: "M370,128 L395,128 L395,140 L370,140 Z"
    },
    2: { // Back-side view
      body: "M30,130 Q30,125 40,120 L70,115 L100,95 Q140,80 180,75 L290,75 Q330,80 350,95 L370,115 Q380,120 380,130 L380,150 L30,150 Z",
      roof: "M120,95 Q145,75 175,73 L265,73 Q300,75 320,95 L290,100 L140,100 Z",
      windows: "M145,97 L290,97 Q305,85 295,77 L175,77 Q155,80 150,90 Z",
      hood: "M70,115 L100,95 L120,97 L90,115 Z",
      trunk: "M310,97 L350,95 L345,115 L315,115 Z",
      bumperF: "M30,130 L30,145 L70,145 L75,130 Z",
      bumperR: "M335,130 L380,130 L380,145 L340,145 Z",
      lightF: "M35,127 L60,127 L60,138 L35,138 Z",
      lightR: "M350,127 L375,127 L375,138 L350,138 Z"
    }
  };

  const currentView = carViews[viewAngle];

  return (
    <div className="relative h-full min-h-[500px] flex flex-col">
      {/* Car Display */}
      <div 
        ref={containerRef}
        className="flex-1 relative flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseEnter={() => setIsRotating(false)}
        onMouseLeave={() => setIsRotating(true)}
        onClick={() => setViewAngle((viewAngle + 1) % 3)}
      >
        {/* Background glow based on color */}
        <div 
          className="absolute inset-0 opacity-40 blur-[120px] transition-all duration-1000"
          style={{ background: selectedColor.gradient }}
        />
        
        {/* Grid floor effect */}
        <div className="absolute bottom-10 left-0 right-0 h-32 opacity-20"
          style={{
            background: 'linear-gradient(to bottom, transparent, rgba(0,245,255,0.1))',
            maskImage: 'linear-gradient(to bottom, transparent, black)'
          }}
        />

        {/* Sports Car SVG */}
        <motion.div
          key={viewAngle}
          initial={{ opacity: 0, scale: 0.9, rotateY: -30 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          exit={{ opacity: 0, scale: 0.9, rotateY: 30 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative w-full max-w-xl px-4"
        >
          <svg viewBox="0 0 420 180" className="w-full h-auto drop-shadow-2xl" style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))' }}>
            <defs>
              {/* Car body gradient */}
              <linearGradient id={`carBody-${selectedColor.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: selectedColor.hex, stopOpacity: 1 }} />
                <stop offset="40%" style={{ stopColor: selectedColor.hex, stopOpacity: 0.95 }} />
                <stop offset="100%" style={{ stopColor: selectedColor.hex, stopOpacity: 0.7 }} />
              </linearGradient>
              
              {/* Metallic shine */}
              <linearGradient id="metalShine" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'rgba(255,255,255,0.4)' }} />
                <stop offset="50%" style={{ stopColor: 'rgba(255,255,255,0)' }} />
                <stop offset="100%" style={{ stopColor: 'rgba(255,255,255,0.2)' }} />
              </linearGradient>
              
              {/* Glass gradient */}
              <linearGradient id="glassGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#1a1a2e', stopOpacity: 0.9 }} />
                <stop offset="100%" style={{ stopColor: '#0a0a15', stopOpacity: 0.95 }} />
              </linearGradient>
              
              {/* Glow filter */}
              <filter id="carGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="blur"/>
                <feMerge>
                  <feMergeNode in="blur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              
              {/* Neon glow for lights */}
              <filter id="neonGlow">
                <feGaussianBlur stdDeviation="3" result="blur"/>
                <feComposite in="SourceGraphic" in2="blur" operator="over"/>
              </filter>
            </defs>
            
            {/* Shadow under car */}
            <ellipse cx="210" cy="165" rx="150" ry="10" fill="rgba(0,0,0,0.4)" />
            
            {/* Main car body */}
            <path 
              d={currentView.body}
              fill={`url(#carBody-${selectedColor.id})`}
              className="transition-all duration-700"
            />
            
            {/* Metallic overlay */}
            <path 
              d={currentView.body}
              fill="url(#metalShine)"
              className="transition-all duration-700"
              opacity="0.3"
            />
            
            {/* Roof */}
            <path 
              d={currentView.roof}
              fill={`url(#carBody-${selectedColor.id})`}
              className="transition-all duration-700"
            />
            
            {/* Windows */}
            <path 
              d={currentView.windows}
              fill="url(#glassGradient)"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="0.5"
              className="transition-all duration-500"
            />
            
            {/* Hood panel line */}
            <path 
              d={currentView.hood}
              fill="none"
              stroke="rgba(0,0,0,0.3)"
              strokeWidth="1"
            />
            
            {/* Trunk panel line */}
            <path 
              d={currentView.trunk}
              fill="none"
              stroke="rgba(0,0,0,0.3)"
              strokeWidth="1"
            />
            
            {/* Front wheel */}
            <g className="transition-all duration-500">
              <circle cx="100" cy="148" r="28" fill="#0a0a0a" />
              <circle cx="100" cy="148" r="24" fill="#1a1a1a" stroke="#333" strokeWidth="2" />
              <circle cx="100" cy="148" r="18" fill="#222" />
            {/* Wheel spokes */}
              {[0, 72, 144, 216, 288].map((angle) => (
                <line key={`front-spoke-${angle}`} 
                  x1={100 + 8 * Math.cos(angle * Math.PI / 180)} 
                  y1={148 + 8 * Math.sin(angle * Math.PI / 180)}
                  x2={100 + 16 * Math.cos(angle * Math.PI / 180)} 
                  y2={148 + 16 * Math.sin(angle * Math.PI / 180)}
                  stroke="#444" strokeWidth="3" strokeLinecap="round"
                />
              ))}
              <circle cx="100" cy="148" r="6" fill="#333" />
              <circle cx="100" cy="148" r="3" fill="#555" />
            </g>
            
            {/* Rear wheel */}
            <g className="transition-all duration-500">
              <circle cx="320" cy="148" r="28" fill="#0a0a0a" />
              <circle cx="320" cy="148" r="24" fill="#1a1a1a" stroke="#333" strokeWidth="2" />
              <circle cx="320" cy="148" r="18" fill="#222" />
              {[0, 72, 144, 216, 288].map((angle) => (
                <line key={`rear-spoke-${angle}`} 
                  x1={320 + 8 * Math.cos(angle * Math.PI / 180)} 
                  y1={148 + 8 * Math.sin(angle * Math.PI / 180)}
                  x2={320 + 16 * Math.cos(angle * Math.PI / 180)} 
                  y2={148 + 16 * Math.sin(angle * Math.PI / 180)}
                  stroke="#444" strokeWidth="3" strokeLinecap="round"
                />
              ))}
              <circle cx="320" cy="148" r="6" fill="#333" />
              <circle cx="320" cy="148" r="3" fill="#555" />
            </g>
            
            {/* Front lights - Cyan LED */}
            <path d={currentView.lightF} fill="#00f5ff" opacity="0.9" filter="url(#neonGlow)" />
            <path d={currentView.lightF} fill="white" opacity="0.6" />
            
            {/* Rear lights - Red LED */}
            <path d={currentView.lightR} fill="#ff2d55" opacity="0.9" filter="url(#neonGlow)" />
            <path d={currentView.lightR} fill="#ff6b6b" opacity="0.5" />
            
            {/* Reflection highlight on body */}
            <path
              d="M60,120 Q120,100 200,100 Q280,100 340,115"
              fill="none"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            
            {/* Door line */}
            <line x1="190" y1="95" x2="200" y2="130" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
          </svg>
        </motion.div>

        {/* View indicator & controls */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4">
          <button 
            onClick={(e) => { e.stopPropagation(); setIsRotating(!isRotating); }}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              isRotating ? 'bg-[#00f5ff]/20 text-[#00f5ff]' : 'bg-white/10 text-[#71717a]'
            }`}
          >
            {isRotating ? <Pause size={14} /> : <Play size={14} />}
          </button>
          
          <div className="flex items-center gap-2 text-xs text-[#71717a] bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <RotateCcw size={12} className="text-[#00f5ff]" />
            <span>Click pentru rotire</span>
          </div>
          
          {/* View dots */}
          <div className="flex gap-1.5">
            {[0, 1, 2].map(viewNum => (
              <button
                key={`view-${viewNum}`}
                onClick={(e) => { e.stopPropagation(); setViewAngle(viewNum); }}
                className={`w-2 h-2 rounded-full transition-all ${
                  viewAngle === viewNum ? 'bg-[#00f5ff] w-4' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Color Selection */}
      <div className="p-6 border-t border-white/10 bg-black/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg text-white">Alege Culoarea Wrap</h3>
          <motion.span 
            key={selectedColor.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-mono"
            style={{ color: selectedColor.hex === '#f5f5f5' ? '#00f5ff' : selectedColor.hex }}
          >
            {selectedColor.name}
          </motion.span>
        </div>
        
        <div className="flex gap-3 flex-wrap">
          {WRAP_COLORS.map((color) => (
            <motion.button
              key={color.id}
              onClick={() => setSelectedColor(color)}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              className={`
                w-11 h-11 rounded-xl relative transition-all duration-300 shadow-lg
                ${selectedColor.id === color.id ? 'ring-2 ring-[#00f5ff] ring-offset-2 ring-offset-[#0a0f1e]' : ''}
              `}
              style={{ 
                background: color.gradient,
                boxShadow: selectedColor.id === color.id ? `0 0 25px ${color.hex}50` : 'none'
              }}
              aria-label={color.name}
              data-hover
            >
              {selectedColor.id === color.id && (
                <motion.div
                  layoutId="selected-color"
                  className="absolute inset-0 rounded-xl border-2 border-white/50"
                  transition={{ type: 'spring', bounce: 0.3 }}
                />
              )}
            </motion.button>
          ))}
        </div>

        {/* Price estimate */}
        <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-[#00f5ff]/10 to-[#7c3aed]/10 border border-[#00f5ff]/20">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[#a1a1aa] text-sm">Estimare wrap complet</span>
              <p className="text-xs text-[#71717a] mt-1">
                Preț final în funcție de vehicul
              </p>
            </div>
            <span className="font-mono text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00f5ff] to-[#7c3aed]">
              2.400 - 3.200 €
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Futuristic Landing Component
export default function FuturisticLanding() {
  const [modalImage, setModalImage] = useState(null);

  const galleryImages = [
    { src: 'https://static.prod-images.emergentagent.com/jobs/557de4fb-5a61-415a-bff2-a49d2d8adece/images/9d17908be93deda312c67c3c3083d5166f0898e99f2026b2c21a4ee88d4951c4.png', alt: 'Porsche 911 GT3 - Satin Blue' },
    { src: 'https://static.prod-images.emergentagent.com/jobs/557de4fb-5a61-415a-bff2-a49d2d8adece/images/7dfb4bbdffcda1e7b859ff6c0f440f0e08ee777884f5c39d49eef82da727d30e.png', alt: 'BMW M4 - Matte Black' },
    { src: 'https://static.prod-images.emergentagent.com/jobs/557de4fb-5a61-415a-bff2-a49d2d8adece/images/8f762d8075a0263aa1e303bb8157256732349c9578c1f8697ae054989647b5ec.png', alt: 'Studio Holographic' },
  ];

  const features = [
    { icon: Shield, title: 'Garanție 5 Ani', desc: 'Protecție extinsă pentru materialul și montajul wrap-ului', color: '#00f5ff' },
    { icon: Zap, title: 'Procesare Rapidă', desc: 'Livrare în 3-5 zile lucrătoare pentru wrap complet', color: '#f0157f' },
    { icon: Award, title: 'Materiale Premium', desc: '3M, Avery Dennison, XPEL - doar cele mai bune branduri', color: '#7c3aed' },
    { icon: Users, title: 'Expertiză', desc: 'Peste 847 vehicule transformate de echipa noastră', color: '#00ffa3' },
  ];

  return (
    <div className="min-h-screen bg-[#050810] text-white relative overflow-hidden" data-testid="futuristic-landing">
      {/* Custom Cursor */}
      <CustomCursor />

      {/* Grid Background */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(0,245,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,245,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
        {/* Dot pattern overlay */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(rgba(0,245,255,0.15) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }} />
      </div>

      {/* Ambient Glow Orbs */}
      <div className="fixed top-1/4 left-1/4 w-[600px] h-[600px] bg-[#7c3aed]/10 rounded-full blur-[200px] animate-pulse" />
      <div className="fixed bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#f0157f]/10 rounded-full blur-[200px] animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#00f5ff]/5 rounded-full blur-[250px]" />

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[200px]">
          
          {/* Hero Card - Large */}
          <BentoCard span={2} rowSpan={2} index={0} className="lg:col-span-2 lg:row-span-2">
            <div className="h-full flex flex-col justify-between">
              <div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 mb-4"
                >
                  <div className="h-px w-8 bg-[#00f5ff]" />
                  <span className="text-[#00f5ff] text-sm tracking-widest uppercase">Premium Auto Studio</span>
                </motion.div>
                
                <h1 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[0.9] mb-4">
                  <KineticText text="WRAP" className="block" />
                  <KineticText text="STUDIO" className="block text-transparent bg-clip-text bg-gradient-to-r from-[#00f5ff] via-[#7c3aed] to-[#f0157f]" delay={0.3} />
                </h1>
                
                <p className="text-[#a1a1aa] max-w-sm">
                  Transformă-ți vehiculul într-o operă de artă. Car wrapping, PPF și detailing de nivel premium.
                </p>
              </div>

              <div className="flex items-center gap-8">
                <div>
                  <div className="text-4xl font-mono font-bold text-[#00f5ff]">
                    <AnimatedCounter value="847" suffix="+" />
                  </div>
                  <div className="text-xs text-[#71717a] uppercase tracking-wider">Vehicule</div>
                </div>
                <div>
                  <div className="text-4xl font-mono font-bold text-[#f0157f]">
                    <AnimatedCounter value="5" suffix=" ani" />
                  </div>
                  <div className="text-xs text-[#71717a] uppercase tracking-wider">Garanție</div>
                </div>
                <div>
                  <div className="text-4xl font-mono font-bold text-[#7c3aed]">
                    <AnimatedCounter value="4.9" />
                  </div>
                  <div className="text-xs text-[#71717a] uppercase tracking-wider">Rating</div>
                </div>
              </div>
            </div>
          </BentoCard>

          {/* Car Configurator Card - Enhanced SVG Version */}
          <BentoCard span={2} rowSpan={3} index={1} className="lg:col-span-2 lg:row-span-3">
            <div className="h-full -m-6">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-[#00f5ff]" size={20} />
                  <h2 className="font-display text-xl">Configurator Culori</h2>
                </div>
                <p className="text-xs text-[#71717a] mt-1">Vizualizează mașina ta în diferite nuanțe</p>
              </div>
              <CarConfigurator />
            </div>
          </BentoCard>

          {/* Feature Cards with Hover Reveal */}
          {features.map((feature, i) => (
            <BentoCard key={feature.title} index={i + 2} expandable className="group">
              <div className="h-full flex flex-col">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${feature.color}15`, boxShadow: `0 0 20px ${feature.color}20` }}>
                  <feature.icon size={24} style={{ color: feature.color }} />
                </div>
                
                <h3 className="font-display text-lg text-white mb-2 group-hover:text-[#00f5ff] transition-colors">
                  {feature.title}
                </h3>
                
                {/* Hidden content - reveals on hover */}
                <motion.p 
                  className="text-sm text-[#71717a] overflow-hidden"
                  initial={{ opacity: 0, height: 0 }}
                  whileInView={{ opacity: 1, height: 'auto' }}
                  transition={{ delay: 0.2 }}
                >
                  {feature.desc}
                </motion.p>
              </div>
            </BentoCard>
          ))}

          {/* Gallery Card */}
          <BentoCard span={2} rowSpan={2} index={6} className="lg:col-span-2 lg:row-span-2">
            <div className="h-full flex flex-col">
              <h3 className="font-display text-xl mb-4">Portofoliu</h3>
              <div className="flex-1 grid grid-cols-3 gap-3">
                {galleryImages.map((img) => (
                  <motion.div
                    key={img.alt}
                    className="relative rounded-xl overflow-hidden cursor-pointer group"
                    whileHover={{ scale: 1.05, zIndex: 10 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setModalImage(img);
                    }}
                    data-hover
                  >
                    <img 
                      src={img.src} 
                      alt={img.alt}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 pointer-events-none"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 pointer-events-none">
                      <span className="text-xs text-white">{img.alt}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </BentoCard>

          {/* Live Data Stream Card */}
          <BentoCard index={7} className="overflow-hidden">
            <div className="h-full flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <Activity size={16} className="text-[#00ffa3]" />
                <span className="text-xs text-[#71717a] uppercase tracking-wider">Live Status</span>
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <div className="text-3xl font-mono font-bold text-[#00ffa3] mb-1">
                  <AnimatedCounter value="3" /> <span className="text-lg">în lucru</span>
                </div>
                <div className="text-sm text-[#71717a]">comenzi active acum</div>
              </div>
              {/* Animated bars */}
              <div className="flex gap-1 h-8">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={`bar-${i}`}
                    className="flex-1 bg-[#00ffa3]/20 rounded-full overflow-hidden"
                    initial={{ scaleY: 0.2 }}
                    animate={{ scaleY: [0.2, Math.random() * 0.8 + 0.2, 0.2] }}
                    transition={{ repeat: Infinity, duration: 1 + Math.random(), delay: i * 0.1 }}
                    style={{ originY: 1 }}
                  >
                    <div className="w-full h-full bg-[#00ffa3]" />
                  </motion.div>
                ))}
              </div>
            </div>
          </BentoCard>

          {/* CTA Card */}
          <BentoCard span={1} index={8}>
            <div className="h-full flex flex-col items-center justify-center text-center">
              <p className="text-sm text-[#a1a1aa] mb-4">Gata să începi transformarea?</p>
              <MagneticButton 
                href="#contact"
                className="bg-gradient-to-r from-[#00f5ff] to-[#7c3aed] text-black font-semibold px-6 py-3 rounded-xl"
              >
                Solicită Ofertă <ArrowRight size={16} />
              </MagneticButton>
            </div>
          </BentoCard>

          {/* Reviews Card */}
          <BentoCard span={2} index={9} className="lg:col-span-2">
            <div className="h-full flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <Star size={16} className="text-[#ffb000]" fill="#ffb000" />
                <span className="font-display text-lg">Recenzii Clienți</span>
              </div>
              <div className="flex-1 flex items-center gap-4 overflow-x-auto pb-2">
                {[
                  { name: 'Alexandru M.', text: 'Absolut impecabil!', rating: 5 },
                  { name: 'Mihai D.', text: 'Finisaj perfect', rating: 5 },
                  { name: 'Cristina P.', text: 'Recomand cu încredere', rating: 5 },
                ].map((review) => (
                  <motion.div
                    key={review.name}
                    className="flex-shrink-0 w-48 p-4 rounded-xl bg-white/5 border border-white/10"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                  >
                    <div className="flex gap-0.5 mb-2">
                      {[...Array(review.rating)].map((_, j) => (
                        <Star key={`star-${review.name}-${j}`} size={12} className="text-[#ffb000]" fill="#ffb000" />
                      ))}
                    </div>
                    <p className="text-sm text-white mb-2">"{review.text}"</p>
                    <p className="text-xs text-[#71717a]">{review.name}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </BentoCard>

        </div>
      </div>

      {/* Image Modal */}
      <ImageModal
        isOpen={!!modalImage}
        onClose={() => setModalImage(null)}
        imageSrc={modalImage?.src}
        imageAlt={modalImage?.alt}
      />

      {/* CSS for animated border */}
      <style>{`
        @keyframes border-spin {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-border-spin {
          animation: border-spin 3s linear infinite;
        }
        
        /* Hide default cursor on desktop */
        @media (pointer: fine) {
          * { cursor: none !important; }
        }
      `}</style>
    </div>
  );
}
