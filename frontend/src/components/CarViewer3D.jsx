import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

// Real 3D car models from Khronos glTF Sample Assets (CC0/CC-BY licensed)
const CAR_MODELS = {
  toycar: {
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/ToyCar/glTF-Binary/ToyCar.glb',
    name: 'Toy Car',
    scale: 25,
    position: [0, -0.5, 0],
    rotation: [0, 0, 0],
  },
  concept: {
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/CarConcept/glTF-Binary/CarConcept.glb',
    name: 'Concept Car',
    scale: 1.5,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },
  // Fallback simple car model from Cesium
  milktruck: {
    url: 'https://raw.githubusercontent.com/CesiumGS/cesium/main/Apps/SampleData/models/CesiumMilkTruck/CesiumMilkTruck.glb',
    name: 'Truck',
    scale: 0.8,
    position: [0, 0, 0],
    rotation: [0, Math.PI, 0],
  }
};

// Vinyl wrap finishes and their material properties
const FINISH_PROPERTIES = {
  gloss: { metalness: 0.4, roughness: 0.15, clearcoat: 0.8, clearcoatRoughness: 0.1 },
  matte: { metalness: 0.05, roughness: 0.9, clearcoat: 0, clearcoatRoughness: 0 },
  satin: { metalness: 0.2, roughness: 0.5, clearcoat: 0.3, clearcoatRoughness: 0.3 },
  metallic: { metalness: 0.85, roughness: 0.25, clearcoat: 0.5, clearcoatRoughness: 0.1 },
  chrome: { metalness: 1.0, roughness: 0.05, clearcoat: 1.0, clearcoatRoughness: 0.05 },
};

export function CarViewer3D({ 
  carType = 'toycar', 
  color = '#ff1493', 
  finish = 'gloss',
  onLoadProgress,
  onLoadComplete,
  onLoadError 
}) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const carRef = useRef(null);
  const animationRef = useRef(null);
  const mixerRef = useRef(null);
  const clockRef = useRef(new THREE.Clock());
  
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [error, setError] = useState(null);

  // Apply color to car body parts
  const applyColorToModel = useCallback((model, hexColor, finishType) => {
    if (!model) return;
    
    const newColor = new THREE.Color(hexColor);
    const finishProps = FINISH_PROPERTIES[finishType] || FINISH_PROPERTIES.gloss;
    
    model.traverse((child) => {
      if (child.isMesh && child.material) {
        // Check if this is a body part (not wheels, windows, lights)
        const name = child.name.toLowerCase();
        const isBodyPart = !name.includes('wheel') && 
                          !name.includes('tire') && 
                          !name.includes('glass') && 
                          !name.includes('window') &&
                          !name.includes('light') &&
                          !name.includes('headlight') &&
                          !name.includes('taillight') &&
                          !name.includes('chrome') &&
                          !name.includes('rim');
        
        if (isBodyPart) {
          // Clone material to avoid affecting other instances
          if (Array.isArray(child.material)) {
            child.material = child.material.map(mat => {
              const newMat = mat.clone();
              newMat.color = newColor;
              newMat.metalness = finishProps.metalness;
              newMat.roughness = finishProps.roughness;
              if (newMat.clearcoat !== undefined) {
                newMat.clearcoat = finishProps.clearcoat;
                newMat.clearcoatRoughness = finishProps.clearcoatRoughness;
              }
              newMat.needsUpdate = true;
              return newMat;
            });
          } else {
            const newMat = child.material.clone();
            newMat.color = newColor;
            newMat.metalness = finishProps.metalness;
            newMat.roughness = finishProps.roughness;
            if (newMat.clearcoat !== undefined) {
              newMat.clearcoat = finishProps.clearcoat;
              newMat.clearcoatRoughness = finishProps.clearcoatRoughness;
            }
            newMat.needsUpdate = true;
            child.material = newMat;
          }
        }
      }
    });
  }, []);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    scene.fog = new THREE.Fog(0x0a0a0a, 15, 30);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(5, 3, 5);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.minDistance = 2;
    controls.maxDistance = 15;
    controls.minPolarAngle = 0.2;
    controls.maxPolarAngle = Math.PI / 2.1;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controlsRef.current = controls;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(10, 15, 10);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 50;
    mainLight.shadow.camera.left = -10;
    mainLight.shadow.camera.right = 10;
    mainLight.shadow.camera.top = 10;
    mainLight.shadow.camera.bottom = -10;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xff69b4, 0.4);
    fillLight.position.set(-10, 5, -10);
    scene.add(fillLight);

    const backLight = new THREE.DirectionalLight(0x00bfff, 0.3);
    backLight.position.set(0, 5, -15);
    scene.add(backLight);

    // Hemisphere light for ambient
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.5);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    // Ground
    const groundGeometry = new THREE.CircleGeometry(15, 64);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x080808,
      roughness: 0.9,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid
    const gridHelper = new THREE.GridHelper(20, 40, 0x1a1a1a, 0x0f0f0f);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Neon ring on ground
    const ringGeometry = new THREE.RingGeometry(3.5, 3.7, 64);
    const ringMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xff1493,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.01;
    scene.add(ring);

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      
      const delta = clockRef.current.getDelta();
      
      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }
      
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationRef.current);
      controls.dispose();
      renderer.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Load car model
  useEffect(() => {
    if (!sceneRef.current) return;

    const modelConfig = CAR_MODELS[carType] || CAR_MODELS.toycar;
    
    setIsLoading(true);
    setLoadProgress(0);
    setError(null);

    // Remove existing car
    if (carRef.current) {
      sceneRef.current.remove(carRef.current);
      carRef.current = null;
    }

    // Setup loaders
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    
    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      modelConfig.url,
      (gltf) => {
        const model = gltf.scene;
        
        // Apply scale and position
        model.scale.setScalar(modelConfig.scale);
        model.position.set(...modelConfig.position);
        model.rotation.set(...modelConfig.rotation);
        
        // Enable shadows
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        // Apply color
        applyColorToModel(model, color, finish);

        // Setup animations if any
        if (gltf.animations && gltf.animations.length > 0) {
          mixerRef.current = new THREE.AnimationMixer(model);
          gltf.animations.forEach((clip) => {
            mixerRef.current.clipAction(clip).play();
          });
        }

        sceneRef.current.add(model);
        carRef.current = model;
        
        setIsLoading(false);
        setLoadProgress(100);
        
        if (onLoadComplete) onLoadComplete();
      },
      (progress) => {
        const percent = (progress.loaded / progress.total) * 100;
        setLoadProgress(Math.round(percent));
        if (onLoadProgress) onLoadProgress(percent);
      },
      (err) => {
        console.error('Error loading model:', err);
        setError('Nu s-a putut incarca modelul 3D');
        setIsLoading(false);
        if (onLoadError) onLoadError(err);
      }
    );

    return () => {
      dracoLoader.dispose();
    };
  }, [carType, applyColorToModel, onLoadComplete, onLoadProgress, onLoadError]);

  // Update color when it changes
  useEffect(() => {
    if (carRef.current) {
      applyColorToModel(carRef.current, color, finish);
    }
  }, [color, finish, applyColorToModel]);

  return (
    <div className="w-full h-full relative">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 z-10">
          <div className="relative w-20 h-20 mb-4">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
            <div 
              className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin"
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-primary font-bold text-sm">{loadProgress}%</span>
            </div>
          </div>
          <p className="text-muted-foreground">Se incarca modelul 3D...</p>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 z-10">
          <p className="text-destructive mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Reincearca
          </button>
        </div>
      )}

      {/* 3D Canvas Container */}
      <div 
        ref={containerRef} 
        className="w-full h-full"
        style={{ touchAction: 'none' }}
      />

      {/* Instructions overlay */}
      {!isLoading && !error && (
        <div className="absolute bottom-4 left-4 flex items-center gap-2 text-xs text-muted-foreground bg-background/50 backdrop-blur px-3 py-1.5 rounded-full">
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
