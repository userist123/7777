import React, { Suspense, useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Car models - using reliable Khronos sample
const CAR_MODELS = {
  sedan: {
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/ToyCar/glTF-Binary/ToyCar.glb',
    name: 'Sedan',
    scale: 25,
  },
  suv: {
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/ToyCar/glTF-Binary/ToyCar.glb',
    name: 'SUV',
    scale: 30,
  },
  sports: {
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/ToyCar/glTF-Binary/ToyCar.glb',
    name: 'Sports',
    scale: 35,
  },
};

// Finish properties
const FINISH_PROPERTIES = {
  gloss: { metalness: 0.4, roughness: 0.15 },
  matte: { metalness: 0.05, roughness: 0.9 },
  satin: { metalness: 0.2, roughness: 0.5 },
  metallic: { metalness: 0.85, roughness: 0.25 },
  chrome: { metalness: 1.0, roughness: 0.05 },
};

// Car model component
function CarModel({ carType, color, finish }) {
  const modelConfig = CAR_MODELS[carType] || CAR_MODELS.sedan;
  const { scene } = useGLTF(modelConfig.url);
  const groupRef = useRef();
  
  // Clone scene to avoid mutation issues
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    return clone;
  }, [scene]);

  // Apply color
  useEffect(() => {
    if (!clonedScene) return;
    
    const newColor = new THREE.Color(color);
    const finishProps = FINISH_PROPERTIES[finish] || FINISH_PROPERTIES.gloss;
    
    clonedScene.traverse((child) => {
      if (child.isMesh && child.material) {
        const name = child.name.toLowerCase();
        const isBodyPart = !name.includes('wheel') && 
                          !name.includes('tire') && 
                          !name.includes('glass') && 
                          !name.includes('window') &&
                          !name.includes('light');
        
        if (isBodyPart && child.material) {
          const mat = child.material.clone();
          mat.color = newColor;
          mat.metalness = finishProps.metalness;
          mat.roughness = finishProps.roughness;
          mat.needsUpdate = true;
          child.material = mat;
        }
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [clonedScene, color, finish]);

  // Auto-rotate
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.5, 0]}>
      <primitive object={clonedScene} scale={modelConfig.scale} />
    </group>
  );
}

// Loading indicator
function LoadingIndicator() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#ff1493" wireframe />
    </mesh>
  );
}

// Ground and effects
function Ground() {
  return (
    <group>
      {/* Ground circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <circleGeometry args={[8, 64]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
      </mesh>
      
      {/* Neon ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.49, 0]}>
        <ringGeometry args={[2.5, 2.7, 64]} />
        <meshBasicMaterial color="#ff1493" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Grid */}
      <gridHelper args={[16, 32, '#222222', '#111111']} position={[0, -0.48, 0]} />
    </group>
  );
}

// Main scene
function Scene({ carType, color, finish }) {
  return (
    <>
      {/* Lights */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} castShadow />
      <directionalLight position={[-5, 5, -5]} intensity={0.5} color="#ff69b4" />
      <pointLight position={[0, 8, 0]} intensity={0.8} color="#ffffff" />
      
      {/* Ground */}
      <Ground />
      
      {/* Car */}
      <Suspense fallback={<LoadingIndicator />}>
        <CarModel carType={carType} color={color} finish={finish} />
      </Suspense>
      
      {/* Controls */}
      <OrbitControls 
        enablePan={false}
        minDistance={2}
        maxDistance={10}
        minPolarAngle={0.3}
        maxPolarAngle={Math.PI / 2.2}
        enableDamping
        dampingFactor={0.05}
      />
    </>
  );
}

// Main component
export function CarViewer3D({ 
  carType = 'sedan', 
  color = '#ff1493', 
  finish = 'gloss',
}) {
  return (
    <div className="w-full h-full relative">
      <Canvas
        shadows
        camera={{ position: [4, 2.5, 4], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'linear-gradient(180deg, #0a0a0a 0%, #151515 100%)' }}
      >
        <Scene carType={carType} color={color} finish={finish} />
      </Canvas>
      
      {/* Instructions */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 text-xs text-white/60 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full pointer-events-none">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
        <span>Trage pentru a roti • Scroll pentru zoom</span>
      </div>
    </div>
  );
}

// Preload the model
useGLTF.preload(CAR_MODELS.sedan.url);

export default CarViewer3D;
