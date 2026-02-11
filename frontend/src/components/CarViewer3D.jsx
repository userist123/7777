import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, useProgress } from '@react-three/drei';
import * as THREE from 'three';

// Car body component - simplified 3D car shape
function CarBody({ color, finish }) {
  // Create material based on finish type
  const getMaterial = () => {
    const baseColor = new THREE.Color(color);
    
    switch (finish) {
      case 'chrome':
        return { color: baseColor, metalness: 1, roughness: 0.1 };
      case 'matte':
        return { color: baseColor, metalness: 0.1, roughness: 0.9 };
      case 'satin':
        return { color: baseColor, metalness: 0.3, roughness: 0.5 };
      case 'metallic':
        return { color: baseColor, metalness: 0.8, roughness: 0.3 };
      case 'gloss':
      default:
        return { color: baseColor, metalness: 0.5, roughness: 0.2 };
    }
  };

  const materialProps = getMaterial();

  return (
    <group>
      {/* Main body */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 0.8, 1.8]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>
      
      {/* Hood */}
      <mesh position={[1.2, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.3, 1.7]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>
      
      {/* Cabin/Roof */}
      <mesh position={[-0.3, 1, 0]} castShadow receiveShadow>
        <boxGeometry args={[2, 0.7, 1.6]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>
      
      {/* Trunk */}
      <mesh position={[-1.5, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1, 0.4, 1.7]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>
      
      {/* Bumpers */}
      <mesh position={[2.1, 0.25, 0]} castShadow>
        <boxGeometry args={[0.3, 0.5, 1.9]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[-2.1, 0.25, 0]} castShadow>
        <boxGeometry args={[0.3, 0.5, 1.9]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.3} />
      </mesh>
      
      {/* Windows */}
      <mesh position={[-0.3, 1, 0.81]}>
        <boxGeometry args={[1.8, 0.5, 0.02]} />
        <meshStandardMaterial color="#111133" metalness={0.9} roughness={0.1} transparent opacity={0.7} />
      </mesh>
      <mesh position={[-0.3, 1, -0.81]}>
        <boxGeometry args={[1.8, 0.5, 0.02]} />
        <meshStandardMaterial color="#111133" metalness={0.9} roughness={0.1} transparent opacity={0.7} />
      </mesh>
      
      {/* Headlights */}
      <mesh position={[2.05, 0.45, 0.6]}>
        <boxGeometry args={[0.1, 0.2, 0.3]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[2.05, 0.45, -0.6]}>
        <boxGeometry args={[0.1, 0.2, 0.3]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
      </mesh>
      
      {/* Taillights */}
      <mesh position={[-2.05, 0.45, 0.6]}>
        <boxGeometry args={[0.1, 0.15, 0.25]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[-2.05, 0.45, -0.6]}>
        <boxGeometry args={[0.1, 0.15, 0.25]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.5} />
      </mesh>
      
      {/* Grille */}
      <mesh position={[2.05, 0.3, 0]}>
        <boxGeometry args={[0.1, 0.3, 1]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
}

// Wheel component
function Wheel({ position }) {
  return (
    <group position={position}>
      {/* Tire */}
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.25, 32]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
      {/* Rim */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.25, 0.25, 0.26, 16]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
}

// Complete car models
function Sedan({ color, finish }) {
  const carRef = useRef();
  
  useFrame((state) => {
    if (carRef.current) {
      carRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    }
  });

  return (
    <group ref={carRef}>
      <CarBody color={color} finish={finish} />
      <Wheel position={[1.3, 0, 0.95]} />
      <Wheel position={[1.3, 0, -0.95]} />
      <Wheel position={[-1.3, 0, 0.95]} />
      <Wheel position={[-1.3, 0, -0.95]} />
    </group>
  );
}

function SUV({ color, finish }) {
  const carRef = useRef();
  
  const getMaterial = () => {
    const baseColor = new THREE.Color(color);
    switch (finish) {
      case 'chrome': return { color: baseColor, metalness: 1, roughness: 0.1 };
      case 'matte': return { color: baseColor, metalness: 0.1, roughness: 0.9 };
      case 'satin': return { color: baseColor, metalness: 0.3, roughness: 0.5 };
      case 'metallic': return { color: baseColor, metalness: 0.8, roughness: 0.3 };
      default: return { color: baseColor, metalness: 0.5, roughness: 0.2 };
    }
  };

  const materialProps = getMaterial();
  
  useFrame((state) => {
    if (carRef.current) {
      carRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    }
  });

  return (
    <group ref={carRef}>
      {/* SUV body - taller */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[4.2, 1.2, 2]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>
      <mesh position={[-0.2, 1.5, 0]} castShadow>
        <boxGeometry args={[2.5, 0.9, 1.9]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>
      <mesh position={[1.8, 0.5, 0]} castShadow>
        <boxGeometry args={[0.5, 0.8, 2]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>
      {/* Bumpers */}
      <mesh position={[2.2, 0.35, 0]}>
        <boxGeometry args={[0.3, 0.5, 2.1]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[-2.2, 0.35, 0]}>
        <boxGeometry args={[0.3, 0.5, 2.1]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Windows */}
      <mesh position={[-0.2, 1.5, 0.96]}>
        <boxGeometry args={[2.3, 0.7, 0.02]} />
        <meshStandardMaterial color="#111133" metalness={0.9} roughness={0.1} transparent opacity={0.7} />
      </mesh>
      {/* Lights */}
      <mesh position={[2.15, 0.6, 0.7]}>
        <boxGeometry args={[0.1, 0.25, 0.35]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[2.15, 0.6, -0.7]}>
        <boxGeometry args={[0.1, 0.25, 0.35]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[-2.15, 0.6, 0.7]}>
        <boxGeometry args={[0.1, 0.2, 0.3]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[-2.15, 0.6, -0.7]}>
        <boxGeometry args={[0.1, 0.2, 0.3]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.5} />
      </mesh>
      {/* Wheels */}
      <Wheel position={[1.4, 0, 1.05]} />
      <Wheel position={[1.4, 0, -1.05]} />
      <Wheel position={[-1.4, 0, 1.05]} />
      <Wheel position={[-1.4, 0, -1.05]} />
    </group>
  );
}

function SportsCar({ color, finish }) {
  const carRef = useRef();
  
  const getMaterial = () => {
    const baseColor = new THREE.Color(color);
    switch (finish) {
      case 'chrome': return { color: baseColor, metalness: 1, roughness: 0.1 };
      case 'matte': return { color: baseColor, metalness: 0.1, roughness: 0.9 };
      case 'satin': return { color: baseColor, metalness: 0.3, roughness: 0.5 };
      case 'metallic': return { color: baseColor, metalness: 0.8, roughness: 0.3 };
      default: return { color: baseColor, metalness: 0.5, roughness: 0.2 };
    }
  };

  const materialProps = getMaterial();
  
  useFrame((state) => {
    if (carRef.current) {
      carRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    }
  });

  return (
    <group ref={carRef}>
      {/* Sports car - low and wide */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[4.5, 0.5, 2]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>
      <mesh position={[1.5, 0.35, 0]} rotation={[0, 0, -0.1]} castShadow>
        <boxGeometry args={[1.5, 0.2, 1.9]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>
      <mesh position={[-0.3, 0.7, 0]} castShadow>
        <boxGeometry args={[1.8, 0.5, 1.7]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>
      <mesh position={[-1.8, 0.4, 0]} castShadow>
        <boxGeometry args={[1, 0.4, 1.9]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>
      {/* Spoiler */}
      <mesh position={[-2.1, 0.7, 0]}>
        <boxGeometry args={[0.1, 0.3, 1.8]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Bumper */}
      <mesh position={[2.3, 0.2, 0]}>
        <boxGeometry args={[0.2, 0.3, 2.1]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Windows */}
      <mesh position={[-0.3, 0.7, 0.86]}>
        <boxGeometry args={[1.6, 0.35, 0.02]} />
        <meshStandardMaterial color="#111133" metalness={0.9} roughness={0.1} transparent opacity={0.7} />
      </mesh>
      {/* Lights */}
      <mesh position={[2.25, 0.35, 0.7]}>
        <boxGeometry args={[0.1, 0.15, 0.4]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[2.25, 0.35, -0.7]}>
        <boxGeometry args={[0.1, 0.15, 0.4]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[-2.25, 0.5, 0.7]}>
        <boxGeometry args={[0.1, 0.1, 0.3]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[-2.25, 0.5, -0.7]}>
        <boxGeometry args={[0.1, 0.1, 0.3]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.6} />
      </mesh>
      {/* Wheels */}
      <Wheel position={[1.5, 0, 1.05]} />
      <Wheel position={[1.5, 0, -1.05]} />
      <Wheel position={[-1.3, 0, 1.05]} />
      <Wheel position={[-1.3, 0, -1.05]} />
    </group>
  );
}

// Loading component
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin mb-4" />
        <p className="text-pink-500 font-medium">{progress.toFixed(0)}% loaded</p>
      </div>
    </Html>
  );
}

// Scene setup - simplified without Environment
function Scene({ carType, color, finish }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
      <directionalLight position={[-10, 10, -5]} intensity={0.8} />
      <pointLight position={[0, 8, 0]} intensity={0.5} />
      <hemisphereLight intensity={0.4} groundColor="#0a0a0a" />
      
      {/* Select car based on type */}
      {carType === 'sedan' && <Sedan color={color} finish={finish} />}
      {carType === 'suv' && <SUV color={color} finish={finish} />}
      {carType === 'sports' && <SportsCar color={color} finish={finish} />}
      
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.35, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#080808" roughness={0.9} metalness={0.1} />
      </mesh>
      
      {/* Grid helper for visual reference */}
      <gridHelper args={[20, 40, '#1a1a1a', '#0f0f0f']} position={[0, -0.34, 0]} />
    </>
  );
}

// Main component export
export function CarViewer3D({ carType = 'sedan', color = '#ff1493', finish = 'gloss' }) {
  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        camera={{ position: [6, 3, 6], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'linear-gradient(180deg, #0a0a0a 0%, #151515 100%)' }}
      >
        <Suspense fallback={<Loader />}>
          <Scene carType={carType} color={color} finish={finish} />
          <OrbitControls 
            enablePan={false}
            enableZoom={true}
            minDistance={4}
            maxDistance={12}
            minPolarAngle={0.3}
            maxPolarAngle={Math.PI / 2.2}
            autoRotate
            autoRotateSpeed={0.5}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default CarViewer3D;
