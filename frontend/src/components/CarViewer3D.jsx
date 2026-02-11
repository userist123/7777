import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

// Simple 3D Car Viewer using pure Three.js
export function CarViewer3D({ carType = 'sedan', color = '#ff1493', finish = 'gloss' }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const carRef = useRef(null);
  const animationRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [previousMousePosition, setPreviousMousePosition] = useState({ x: 0, y: 0 });

  // Get material properties based on finish
  const getMaterialProps = (hexColor, finishType) => {
    const col = new THREE.Color(hexColor);
    switch (finishType) {
      case 'chrome':
        return { color: col, metalness: 1.0, roughness: 0.05 };
      case 'matte':
        return { color: col, metalness: 0.05, roughness: 0.95 };
      case 'satin':
        return { color: col, metalness: 0.25, roughness: 0.55 };
      case 'metallic':
        return { color: col, metalness: 0.85, roughness: 0.25 };
      default: // gloss
        return { color: col, metalness: 0.45, roughness: 0.15 };
    }
  };

  // Create car geometry based on type
  const createCar = (type, hexColor, finishType) => {
    const carGroup = new THREE.Group();
    const matProps = getMaterialProps(hexColor, finishType);
    const bodyMaterial = new THREE.MeshStandardMaterial(matProps);
    const blackMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.8, roughness: 0.3 });
    const glassMaterial = new THREE.MeshStandardMaterial({ color: 0x111133, metalness: 0.9, roughness: 0.1, transparent: true, opacity: 0.7 });
    const headlightMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.3 });
    const taillightMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 0.5 });
    const rimMaterial = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: 0.9, roughness: 0.2 });
    const tireMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.95 });

    // Create wheel function
    const createWheel = (x, y, z) => {
      const wheelGroup = new THREE.Group();
      
      const tireGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 24);
      const tire = new THREE.Mesh(tireGeometry, tireMaterial);
      tire.rotation.z = Math.PI / 2;
      wheelGroup.add(tire);
      
      const rimGeometry = new THREE.CylinderGeometry(0.22, 0.22, 0.26, 16);
      const rim = new THREE.Mesh(rimGeometry, rimMaterial);
      rim.rotation.z = Math.PI / 2;
      wheelGroup.add(rim);
      
      wheelGroup.position.set(x, y, z);
      return wheelGroup;
    };

    if (type === 'sedan') {
      // Main body
      const bodyGeom = new THREE.BoxGeometry(4, 0.8, 1.8);
      const body = new THREE.Mesh(bodyGeom, bodyMaterial);
      body.position.set(0, 0.4, 0);
      carGroup.add(body);

      // Hood
      const hoodGeom = new THREE.BoxGeometry(1.5, 0.3, 1.7);
      const hood = new THREE.Mesh(hoodGeom, bodyMaterial);
      hood.position.set(1.2, 0.5, 0);
      carGroup.add(hood);

      // Cabin
      const cabinGeom = new THREE.BoxGeometry(2, 0.7, 1.6);
      const cabin = new THREE.Mesh(cabinGeom, bodyMaterial);
      cabin.position.set(-0.3, 1, 0);
      carGroup.add(cabin);

      // Trunk
      const trunkGeom = new THREE.BoxGeometry(1, 0.4, 1.7);
      const trunk = new THREE.Mesh(trunkGeom, bodyMaterial);
      trunk.position.set(-1.5, 0.5, 0);
      carGroup.add(trunk);

      // Front bumper
      const fbGeom = new THREE.BoxGeometry(0.3, 0.5, 1.9);
      const fb = new THREE.Mesh(fbGeom, blackMaterial);
      fb.position.set(2.1, 0.25, 0);
      carGroup.add(fb);

      // Rear bumper
      const rbGeom = new THREE.BoxGeometry(0.3, 0.5, 1.9);
      const rb = new THREE.Mesh(rbGeom, blackMaterial);
      rb.position.set(-2.1, 0.25, 0);
      carGroup.add(rb);

      // Windows
      const wGeom = new THREE.BoxGeometry(1.8, 0.5, 0.02);
      const w1 = new THREE.Mesh(wGeom, glassMaterial);
      w1.position.set(-0.3, 1, 0.81);
      carGroup.add(w1);
      const w2 = new THREE.Mesh(wGeom, glassMaterial);
      w2.position.set(-0.3, 1, -0.81);
      carGroup.add(w2);

      // Headlights
      const hlGeom = new THREE.BoxGeometry(0.1, 0.2, 0.3);
      const hl1 = new THREE.Mesh(hlGeom, headlightMaterial);
      hl1.position.set(2.05, 0.45, 0.6);
      carGroup.add(hl1);
      const hl2 = new THREE.Mesh(hlGeom, headlightMaterial);
      hl2.position.set(2.05, 0.45, -0.6);
      carGroup.add(hl2);

      // Taillights
      const tlGeom = new THREE.BoxGeometry(0.1, 0.15, 0.25);
      const tl1 = new THREE.Mesh(tlGeom, taillightMaterial);
      tl1.position.set(-2.05, 0.45, 0.6);
      carGroup.add(tl1);
      const tl2 = new THREE.Mesh(tlGeom, taillightMaterial);
      tl2.position.set(-2.05, 0.45, -0.6);
      carGroup.add(tl2);

      // Grille
      const grGeom = new THREE.BoxGeometry(0.1, 0.3, 1);
      const gr = new THREE.Mesh(grGeom, blackMaterial);
      gr.position.set(2.05, 0.3, 0);
      carGroup.add(gr);

      // Wheels
      carGroup.add(createWheel(1.3, 0, 0.95));
      carGroup.add(createWheel(1.3, 0, -0.95));
      carGroup.add(createWheel(-1.3, 0, 0.95));
      carGroup.add(createWheel(-1.3, 0, -0.95));
    }
    
    else if (type === 'suv') {
      // Main body - taller
      const bodyGeom = new THREE.BoxGeometry(4.2, 1.2, 2);
      const body = new THREE.Mesh(bodyGeom, bodyMaterial);
      body.position.set(0, 0.6, 0);
      carGroup.add(body);

      // Cabin
      const cabinGeom = new THREE.BoxGeometry(2.5, 0.9, 1.9);
      const cabin = new THREE.Mesh(cabinGeom, bodyMaterial);
      cabin.position.set(-0.2, 1.5, 0);
      carGroup.add(cabin);

      // Front
      const frontGeom = new THREE.BoxGeometry(0.5, 0.8, 2);
      const front = new THREE.Mesh(frontGeom, bodyMaterial);
      front.position.set(1.8, 0.5, 0);
      carGroup.add(front);

      // Bumpers
      const fbGeom = new THREE.BoxGeometry(0.3, 0.5, 2.1);
      const fb = new THREE.Mesh(fbGeom, blackMaterial);
      fb.position.set(2.2, 0.35, 0);
      carGroup.add(fb);
      const rb = new THREE.Mesh(fbGeom, blackMaterial);
      rb.position.set(-2.2, 0.35, 0);
      carGroup.add(rb);

      // Windows
      const wGeom = new THREE.BoxGeometry(2.3, 0.7, 0.02);
      const w1 = new THREE.Mesh(wGeom, glassMaterial);
      w1.position.set(-0.2, 1.5, 0.96);
      carGroup.add(w1);
      const w2 = new THREE.Mesh(wGeom, glassMaterial);
      w2.position.set(-0.2, 1.5, -0.96);
      carGroup.add(w2);

      // Headlights
      const hlGeom = new THREE.BoxGeometry(0.1, 0.25, 0.35);
      const hl1 = new THREE.Mesh(hlGeom, headlightMaterial);
      hl1.position.set(2.15, 0.6, 0.7);
      carGroup.add(hl1);
      const hl2 = new THREE.Mesh(hlGeom, headlightMaterial);
      hl2.position.set(2.15, 0.6, -0.7);
      carGroup.add(hl2);

      // Taillights
      const tlGeom = new THREE.BoxGeometry(0.1, 0.2, 0.3);
      const tl1 = new THREE.Mesh(tlGeom, taillightMaterial);
      tl1.position.set(-2.15, 0.6, 0.7);
      carGroup.add(tl1);
      const tl2 = new THREE.Mesh(tlGeom, taillightMaterial);
      tl2.position.set(-2.15, 0.6, -0.7);
      carGroup.add(tl2);

      // Wheels - larger
      carGroup.add(createWheel(1.4, 0.05, 1.05));
      carGroup.add(createWheel(1.4, 0.05, -1.05));
      carGroup.add(createWheel(-1.4, 0.05, 1.05));
      carGroup.add(createWheel(-1.4, 0.05, -1.05));
    }
    
    else if (type === 'sports') {
      // Main body - low and wide
      const bodyGeom = new THREE.BoxGeometry(4.5, 0.5, 2);
      const body = new THREE.Mesh(bodyGeom, bodyMaterial);
      body.position.set(0, 0.3, 0);
      carGroup.add(body);

      // Hood - sloped
      const hoodGeom = new THREE.BoxGeometry(1.5, 0.2, 1.9);
      const hood = new THREE.Mesh(hoodGeom, bodyMaterial);
      hood.position.set(1.5, 0.35, 0);
      hood.rotation.z = -0.1;
      carGroup.add(hood);

      // Cabin - low
      const cabinGeom = new THREE.BoxGeometry(1.8, 0.5, 1.7);
      const cabin = new THREE.Mesh(cabinGeom, bodyMaterial);
      cabin.position.set(-0.3, 0.7, 0);
      carGroup.add(cabin);

      // Rear
      const rearGeom = new THREE.BoxGeometry(1, 0.4, 1.9);
      const rear = new THREE.Mesh(rearGeom, bodyMaterial);
      rear.position.set(-1.8, 0.4, 0);
      carGroup.add(rear);

      // Spoiler
      const spoilerGeom = new THREE.BoxGeometry(0.1, 0.35, 1.8);
      const spoiler = new THREE.Mesh(spoilerGeom, blackMaterial);
      spoiler.position.set(-2.1, 0.75, 0);
      carGroup.add(spoiler);

      // Bumper
      const fbGeom = new THREE.BoxGeometry(0.2, 0.3, 2.1);
      const fb = new THREE.Mesh(fbGeom, blackMaterial);
      fb.position.set(2.3, 0.2, 0);
      carGroup.add(fb);

      // Windows
      const wGeom = new THREE.BoxGeometry(1.6, 0.35, 0.02);
      const w1 = new THREE.Mesh(wGeom, glassMaterial);
      w1.position.set(-0.3, 0.7, 0.86);
      carGroup.add(w1);
      const w2 = new THREE.Mesh(wGeom, glassMaterial);
      w2.position.set(-0.3, 0.7, -0.86);
      carGroup.add(w2);

      // Headlights
      const hlGeom = new THREE.BoxGeometry(0.1, 0.15, 0.4);
      const hl1 = new THREE.Mesh(hlGeom, headlightMaterial);
      hl1.position.set(2.25, 0.35, 0.7);
      carGroup.add(hl1);
      const hl2 = new THREE.Mesh(hlGeom, headlightMaterial);
      hl2.position.set(2.25, 0.35, -0.7);
      carGroup.add(hl2);

      // Taillights
      const tlGeom = new THREE.BoxGeometry(0.1, 0.1, 0.3);
      const tl1 = new THREE.Mesh(tlGeom, taillightMaterial);
      tl1.position.set(-2.25, 0.5, 0.7);
      carGroup.add(tl1);
      const tl2 = new THREE.Mesh(tlGeom, taillightMaterial);
      tl2.position.set(-2.25, 0.5, -0.7);
      carGroup.add(tl2);

      // Wheels - wide stance
      carGroup.add(createWheel(1.5, 0, 1.05));
      carGroup.add(createWheel(1.5, 0, -1.05));
      carGroup.add(createWheel(-1.3, 0, 1.05));
      carGroup.add(createWheel(-1.3, 0, -1.05));
    }

    return carGroup;
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(6, 3, 6);
    camera.lookAt(0, 0.5, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight1.position.set(10, 10, 5);
    directionalLight1.castShadow = true;
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight2.position.set(-10, 10, -5);
    scene.add(directionalLight2);

    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.4);
    scene.add(hemisphereLight);

    // Ground
    const groundGeom = new THREE.PlaneGeometry(30, 30);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x080808, roughness: 0.9 });
    const ground = new THREE.Mesh(groundGeom, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.35;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid
    const gridHelper = new THREE.GridHelper(20, 40, 0x1a1a1a, 0x0f0f0f);
    gridHelper.position.y = -0.34;
    scene.add(gridHelper);

    // Create car
    const car = createCar(carType, color, finish);
    carRef.current = car;
    scene.add(car);

    setIsLoading(false);

    // Animation
    let rotationAngle = 0;
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      
      // Auto rotate
      rotationAngle += 0.003;
      if (car && !isDragging) {
        car.rotation.y = rotationAngle;
      }
      
      // Floating animation
      if (car) {
        car.position.y = Math.sin(Date.now() * 0.001) * 0.02;
      }
      
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
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [carType]);

  // Update car color and finish
  useEffect(() => {
    if (carRef.current && sceneRef.current) {
      sceneRef.current.remove(carRef.current);
      const newCar = createCar(carType, color, finish);
      newCar.rotation.y = carRef.current.rotation.y;
      carRef.current = newCar;
      sceneRef.current.add(newCar);
    }
  }, [color, finish]);

  // Mouse controls for rotation
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setPreviousMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !carRef.current) return;
    
    const deltaX = e.clientX - previousMousePosition.x;
    carRef.current.rotation.y += deltaX * 0.01;
    
    setPreviousMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setPreviousMousePosition({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !carRef.current || e.touches.length !== 1) return;
    
    const deltaX = e.touches[0].clientX - previousMousePosition.x;
    carRef.current.rotation.y += deltaX * 0.01;
    
    setPreviousMousePosition({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="w-full h-full relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-primary">Se incarca...</p>
          </div>
        </div>
      )}
      <div 
        ref={containerRef} 
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
    </div>
  );
}

export default CarViewer3D;
