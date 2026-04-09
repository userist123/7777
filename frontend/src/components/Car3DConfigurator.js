import { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows, Float, Html, Preload } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Sparkles } from 'lucide-react';

// Wrap Colors for Configurator
const WRAP_COLORS = [
  { id: 'matte-black', name: 'Matte Black', hex: '#1a1a1a', metalness: 0.1, roughness: 0.8 },
  { id: 'satin-blue', name: 'Satin Midnight Blue', hex: '#1e3a5f', metalness: 0.3, roughness: 0.5 },
  { id: 'gloss-white', name: 'Gloss Pearl White', hex: '#f5f5f5', metalness: 0.4, roughness: 0.1 },
  { id: 'military-green', name: 'Military Green', hex: '#4a5d23', metalness: 0.2, roughness: 0.6 },
  { id: 'color-shift', name: 'Color Shift Purple', hex: '#8b5cf6', metalness: 0.8, roughness: 0.2 },
  { id: 'neon-orange', name: 'Neon Orange', hex: '#ff6b00', metalness: 0.5, roughness: 0.3 },
  { id: 'steel-brush', name: 'Brushed Steel', hex: '#9ca3af', metalness: 0.9, roughness: 0.4 },
  { id: 'cherry-red', name: 'Cherry Red', hex: '#dc2626', metalness: 0.6, roughness: 0.2 },
];

// 3D Car Model Component
function CarModel({ color, autoRotate, onLoaded }) {
  const groupRef = useRef();
  const { scene } = useGLTF('/models/car.glb');
  const [modelReady, setModelReady] = useState(false);

  useEffect(() => {
    if (scene) {
      // Clone the scene to avoid mutations
      const clonedScene = scene.clone();
      
      // Apply color to all meshes
      clonedScene.traverse((child) => {
        if (child.isMesh && child.material) {
          // Create a new material for each mesh to avoid shared state
          const newMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(color.hex),
            metalness: color.metalness,
            roughness: color.roughness,
            envMapIntensity: 1.5,
          });
          
          // Keep original material for windows/glass (typically darker)
          if (child.material.name && (
            child.material.name.toLowerCase().includes('glass') ||
            child.material.name.toLowerCase().includes('window')
          )) {
            child.material = new THREE.MeshStandardMaterial({
              color: new THREE.Color('#111111'),
              metalness: 0.9,
              roughness: 0.1,
              transparent: true,
              opacity: 0.8,
            });
          } else if (child.material.name && (
            child.material.name.toLowerCase().includes('tire') ||
            child.material.name.toLowerCase().includes('wheel') ||
            child.material.name.toLowerCase().includes('rubber')
          )) {
            // Keep tires black
            child.material = new THREE.MeshStandardMaterial({
              color: new THREE.Color('#1a1a1a'),
              metalness: 0.1,
              roughness: 0.9,
            });
          } else {
            // Apply wrap color to body
            child.material = newMaterial;
          }
          
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      if (groupRef.current) {
        // Clear previous children
        while (groupRef.current.children.length > 0) {
          groupRef.current.remove(groupRef.current.children[0]);
        }
        groupRef.current.add(clonedScene);
        setModelReady(true);
        onLoaded?.();
      }
    }
  }, [scene, color, onLoaded]);

  // Auto-rotation
  useFrame((state, delta) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <group ref={groupRef} scale={[2, 2, 2]} position={[0, -0.5, 0]} />
  );
}

// Fallback simple car if model fails to load
function FallbackCar({ color }) {
  const meshRef = useRef();
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Car body */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[2, 0.5, 1]} />
        <meshStandardMaterial color={color.hex} metalness={color.metalness} roughness={color.roughness} />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <boxGeometry args={[1.2, 0.4, 0.9]} />
        <meshStandardMaterial color={color.hex} metalness={color.metalness} roughness={color.roughness} />
      </mesh>
      {/* Wheels */}
      {[[-0.7, 0, 0.5], [0.7, 0, 0.5], [-0.7, 0, -0.5], [0.7, 0, -0.5]].map((pos, i) => (
        <mesh key={i} position={pos} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 0.1, 32]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.3} roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

// Loading spinner
function LoadingSpinner() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2">
        <div className="w-12 h-12 border-4 border-[#00f5ff]/20 border-t-[#00f5ff] rounded-full animate-spin" />
        <span className="text-[#00f5ff] text-sm font-mono">Se încarcă modelul 3D...</span>
      </div>
    </Html>
  );
}

// Ground plane with grid
function Ground() {
  return (
    <>
      <ContactShadows
        position={[0, -0.5, 0]}
        opacity={0.6}
        scale={10}
        blur={2}
        far={4}
      />
      {/* Reflective ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.51, 0]} receiveShadow>
        <circleGeometry args={[5, 64]} />
        <meshStandardMaterial
          color="#050810"
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={0.8}
        />
      </mesh>
      {/* Grid lines */}
      <gridHelper args={[10, 20, '#00f5ff', '#00f5ff']} position={[0, -0.5, 0]} material-opacity={0.1} material-transparent />
    </>
  );
}

// Main 3D Configurator Component
export default function Car3DConfigurator() {
  const [selectedColor, setSelectedColor] = useState(WRAP_COLORS[0]);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [modelError, setModelError] = useState(false);

  const handleModelLoaded = () => {
    setIsLoading(false);
  };

  return (
    <div className="relative h-full min-h-[500px] flex flex-col bg-gradient-to-b from-[#050810] to-[#0a0f1e] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="text-[#00f5ff]" size={20} />
          <h2 className="font-display text-xl text-white">Configurator 3D</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-2 rounded-lg transition-all ${
              autoRotate ? 'bg-[#00f5ff]/20 text-[#00f5ff]' : 'bg-white/5 text-[#71717a]'
            }`}
            title={autoRotate ? 'Oprește rotația' : 'Pornește rotația'}
          >
            {autoRotate ? <Pause size={16} /> : <Play size={16} />}
          </button>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="flex-1 relative">
        {/* Color glow effect */}
        <div 
          className="absolute inset-0 opacity-30 blur-[100px] transition-all duration-700 pointer-events-none"
          style={{ background: `radial-gradient(circle at center, ${selectedColor.hex}40, transparent 70%)` }}
        />

        <Canvas
          shadows
          camera={{ position: [4, 2, 5], fov: 50 }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
        >
          <Suspense fallback={<LoadingSpinner />}>
            {/* Lighting */}
            <ambientLight intensity={0.4} />
            <spotLight
              position={[10, 10, 10]}
              angle={0.15}
              penumbra={1}
              intensity={1}
              castShadow
              shadow-mapSize={[2048, 2048]}
            />
            <spotLight
              position={[-10, 10, -10]}
              angle={0.15}
              penumbra={1}
              intensity={0.5}
              color="#00f5ff"
            />
            <pointLight position={[0, 5, 0]} intensity={0.5} color="#7c3aed" />

            {/* Environment for reflections */}
            <Environment preset="city" />

            {/* Car Model */}
            <Float speed={0} rotationIntensity={0} floatIntensity={0}>
              {modelError ? (
                <FallbackCar color={selectedColor} />
              ) : (
                <CarModel 
                  color={selectedColor} 
                  autoRotate={autoRotate}
                  onLoaded={handleModelLoaded}
                />
              )}
            </Float>

            {/* Ground */}
            <Ground />

            {/* Controls */}
            <OrbitControls
              enablePan={false}
              enableZoom={true}
              minDistance={3}
              maxDistance={10}
              minPolarAngle={Math.PI / 6}
              maxPolarAngle={Math.PI / 2.2}
              autoRotate={false}
            />

            <Preload all />
          </Suspense>
        </Canvas>

        {/* Instructions overlay */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-xs text-[#71717a] bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
          <RotateCcw size={12} className="text-[#00f5ff]" />
          <span>Drag pentru rotire • Scroll pentru zoom</span>
        </div>
      </div>

      {/* Color Selection */}
      <div className="p-6 border-t border-white/10 bg-black/30">
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
                w-12 h-12 rounded-xl relative transition-all duration-300 shadow-lg
                ${selectedColor.id === color.id ? 'ring-2 ring-[#00f5ff] ring-offset-2 ring-offset-[#0a0f1e]' : ''}
              `}
              style={{ 
                background: color.hex,
                boxShadow: selectedColor.id === color.id ? `0 0 20px ${color.hex}60` : 'none'
              }}
              aria-label={color.name}
              data-hover
            >
              {selectedColor.id === color.id && (
                <motion.div
                  layoutId="selected-color-3d"
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
                Preț final în funcție de marca și modelul vehiculului
              </p>
            </div>
            <div className="text-right">
              <span className="font-mono text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00f5ff] to-[#7c3aed]">
                2.400 - 3.200 €
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Preload the model
useGLTF.preload('/models/car.glb');
