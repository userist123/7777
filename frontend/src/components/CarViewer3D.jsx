import React, { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Center, Html } from '@react-three/drei';
import * as THREE from 'three';

// Car models - using reliable sources
const CAR_MODELS = {
  sedan: {
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/ToyCar/glTF-Binary/ToyCar.glb',
    name: 'Sedan',
    scale: 30,
    position: [0, 0, 0],
  },
  suv: {
    url: 'https://raw.githubusercontent.com/CesiumGS/cesium/main/Apps/SampleData/models/GroundVehicle/GroundVehicle.glb',
    name: 'SUV',
    scale: 0.015,
    position: [0, 0, 0],
  },
  sports: {
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/ToyCar/glTF-Binary/ToyCar.glb',
    name: 'Sports',
    scale: 35,
    position: [0, 0, 0],
  },
};

// Finish properties for materials
const FINISH_PROPERTIES = {
  gloss: { metalness: 0.4, roughness: 0.15 },
  matte: { metalness: 0.05, roughness: 0.9 },
  satin: { metalness: 0.2, roughness: 0.5 },
  metallic: { metalness: 0.85, roughness: 0.25 },
  chrome: { metalness: 1.0, roughness: 0.05 },
};

// Loading component
function Loader() {
  return (
    <Html center>
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin mb-4" />
        <p className="text-white/70 text-sm">Se incarca modelul 3D...</p>
      </div>
    </Html>
  );
}

// Car model component
function CarModel({ carType, color, finish }) {
  const modelConfig = CAR_MODELS[carType] || CAR_MODELS.sedan;
  const { scene } = useGLTF(modelConfig.url);
  const modelRef = useRef();
  
  // Clone the scene to avoid mutating the cached original
  const clonedScene = React.useMemo(() => scene.clone(), [scene]);

  // Apply color to car body
  useEffect(() => {
    if (!clonedScene) return;
    
    const newColor = new THREE.Color(color);
    const finishProps = FINISH_PROPERTIES[finish] || FINISH_PROPERTIES.gloss;
    
    clonedScene.traverse((child) => {
      if (child.isMesh && child.material) {
        const name = child.name.toLowerCase();
        
        // Apply color to body parts (not wheels, glass, lights)
        const isBodyPart = !name.includes('wheel') && 
                          !name.includes('tire') && 
                          !name.includes('glass') && 
                          !name.includes('window') &&
                          !name.includes('light');
        
        if (isBodyPart) {
          if (Array.isArray(child.material)) {
            child.material = child.material.map(mat => {
              const newMat = mat.clone();
              newMat.color = newColor;
              newMat.metalness = finishProps.metalness;
              newMat.roughness = finishProps.roughness;
              newMat.needsUpdate = true;
              return newMat;
            });
          } else {
            const newMat = child.material.clone();
            newMat.color = newColor;
            newMat.metalness = finishProps.metalness;
            newMat.roughness = finishProps.roughness;
            newMat.needsUpdate = true;
            child.material = newMat;
          }
        }
        
        // Enable shadows
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [clonedScene, color, finish]);

  // Auto-rotate
  useFrame((state, delta) => {
    if (modelRef.current) {
      modelRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <group ref={modelRef}>
      <Center>
        <primitive 
          object={clonedScene} 
          scale={modelConfig.scale}
          position={modelConfig.position}
        />
      </Center>
    </group>
  );
}

// Ground component
function Ground() {
  return (
    <>
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <circleGeometry args={[10, 64]} />
        <meshStandardMaterial color="#080808" roughness={0.9} metalness={0.1} />
      </mesh>
      
      {/* Neon ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.49, 0]}>
        <ringGeometry args={[2.8, 3, 64]} />
        <meshBasicMaterial color="#ff1493" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Grid */}
      <gridHelper args={[20, 40, '#1a1a1a', '#0f0f0f']} position={[0, -0.48, 0]} />
    </>
  );
}

// Scene setup
function Scene({ carType, color, finish }) {
  return (
    <>
      {/* Lights */}
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[10, 15, 10]} 
        intensity={1.5} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight position={[-10, 5, -10]} intensity={0.4} color="#ff69b4" />
      <directionalLight position={[0, 5, -15]} intensity={0.3} color="#00bfff" />
      <hemisphereLight intensity={0.5} groundColor="#444444" />
      
      {/* Environment for reflections */}
      <Environment preset="city" />
      
      {/* Ground */}
      <Ground />
      
      {/* Car model */}
      <Suspense fallback={<Loader />}>
        <CarModel carType={carType} color={color} finish={finish} />
      </Suspense>
      
      {/* Controls */}
      <OrbitControls 
        enablePan={false}
        minDistance={3}
        maxDistance={12}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 2.1}
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
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-background/90">
        <p className="text-destructive mb-4">Nu s-a putut incarca modelul 3D</p>
        <button 
          onClick={() => {
            setHasError(false);
            window.location.reload();
          }}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
        >
          Reincearca
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        camera={{ position: [5, 3, 5], fov: 45 }}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        }}
        onError={() => setHasError(true)}
        style={{ background: 'linear-gradient(to bottom, #0a0a0a, #151515)' }}
      >
        <Scene carType={carType} color={color} finish={finish} />
      </Canvas>
      
      {/* Instructions */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 text-xs text-white/60 bg-black/50 backdrop-blur px-3 py-1.5 rounded-full">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
        <span>Trage pentru a roti • Scroll pentru zoom</span>
      </div>
    </div>
  );
}

// Preload models
useGLTF.preload(CAR_MODELS.sedan.url);
useGLTF.preload(CAR_MODELS.suv.url);

export default CarViewer3D;
