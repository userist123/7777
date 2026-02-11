import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Car model URL - Khronos sample
const MODEL_URL = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/ToyCar/glTF-Binary/ToyCar.glb';

// Scale based on car type
const CAR_SCALES = {
  sedan: 25,
  suv: 30,
  sports: 35,
};

// Finish properties
const FINISH_PROPS = {
  gloss: { metalness: 0.4, roughness: 0.15 },
  matte: { metalness: 0.05, roughness: 0.9 },
  satin: { metalness: 0.2, roughness: 0.5 },
  metallic: { metalness: 0.85, roughness: 0.25 },
  chrome: { metalness: 1.0, roughness: 0.05 },
};

export function CarViewer3D({ carType = 'sedan', color = '#ff1493', finish = 'gloss' }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const carRef = useRef(null);
  const frameIdRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  // Apply color to model
  const applyColor = useCallback((model, hexColor, finishType) => {
    if (!model) return;
    const col = new THREE.Color(hexColor);
    const fp = FINISH_PROPS[finishType] || FINISH_PROPS.gloss;
    
    model.traverse((child) => {
      if (child.isMesh && child.material) {
        const n = (child.name || '').toLowerCase();
        const isBody = !n.includes('wheel') && !n.includes('tire') && 
                      !n.includes('glass') && !n.includes('window') && !n.includes('light');
        if (isBody) {
          const mat = child.material.clone();
          mat.color = col;
          mat.metalness = fp.metalness;
          mat.roughness = fp.roughness;
          mat.needsUpdate = true;
          child.material = mat;
        }
      }
    });
  }, []);

  // Initialize scene
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const w = container.clientWidth;
    const h = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    camera.position.set(4, 2.5, 4);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 10;
    controls.maxPolarAngle = Math.PI / 2.1;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1;
    controlsRef.current = controls;

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(10, 10, 5);
    mainLight.castShadow = true;
    scene.add(mainLight);
    
    const pinkLight = new THREE.DirectionalLight(0xff69b4, 0.4);
    pinkLight.position.set(-5, 5, -5);
    scene.add(pinkLight);

    // Ground
    const groundGeo = new THREE.CircleGeometry(8, 64);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x080808, roughness: 0.9 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    ground.receiveShadow = true;
    scene.add(ground);

    // Neon ring
    const ringGeo = new THREE.RingGeometry(2.5, 2.7, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xff1493, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -0.49;
    scene.add(ring);

    // Animation
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const onResize = () => {
      if (!container) return;
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', onResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(frameIdRef.current);
      controls.dispose();
      renderer.dispose();
      if (container && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Load model
  useEffect(() => {
    if (!sceneRef.current) return;
    
    setLoading(true);
    setError(null);
    setProgress(0);

    // Remove old car
    if (carRef.current) {
      sceneRef.current.remove(carRef.current);
      carRef.current = null;
    }

    const loader = new GLTFLoader();
    loader.load(
      MODEL_URL,
      (gltf) => {
        const model = gltf.scene;
        const scale = CAR_SCALES[carType] || 25;
        model.scale.setScalar(scale);
        model.position.set(0, -0.5, 0);
        
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        
        applyColor(model, color, finish);
        sceneRef.current.add(model);
        carRef.current = model;
        
        setLoading(false);
        setProgress(100);
      },
      (xhr) => {
        if (xhr.total) {
          setProgress(Math.round((xhr.loaded / xhr.total) * 100));
        }
      },
      (err) => {
        console.error('Model load error:', err);
        setError('Nu s-a putut incarca modelul 3D');
        setLoading(false);
      }
    );
  }, [carType, applyColor]);

  // Update color/finish
  useEffect(() => {
    if (carRef.current) {
      applyColor(carRef.current, color, finish);
    }
  }, [color, finish, applyColor]);

  return (
    <div className="w-full h-full relative">
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10">
          <div className="w-16 h-16 mb-4 relative">
            <div className="absolute inset-0 border-4 border-pink-500/30 rounded-full" />
            <div className="absolute inset-0 border-4 border-transparent border-t-pink-500 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center text-pink-500 font-bold text-sm">
              {progress}%
            </div>
          </div>
          <p className="text-white/70">Se incarca modelul 3D...</p>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition"
          >
            Reincearca
          </button>
        </div>
      )}

      {/* 3D Container */}
      <div ref={containerRef} className="w-full h-full" style={{ touchAction: 'none' }} />

      {/* Instructions */}
      {!loading && !error && (
        <div className="absolute bottom-4 left-4 flex items-center gap-2 text-xs text-white/60 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full pointer-events-none">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
          <span>Trage pentru a roti • Scroll pentru zoom</span>
        </div>
      )}
    </div>
  );
}

export default CarViewer3D;
