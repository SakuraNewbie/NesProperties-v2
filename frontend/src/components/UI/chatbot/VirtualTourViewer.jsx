import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const VirtualTourViewer = ({ panoramaUrl, onClose }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Set up Three.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);
    
    // Create 360° panorama sphere
    const geometry = new THREE.SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1); // Invert sphere so image is inside
    
    // Load panorama texture
    const texture = new THREE.TextureLoader().load(panoramaUrl);
    texture.mapping = THREE.EquirectangularReflectionMapping;
    
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);
    
    camera.position.set(0, 0, 0);
    
    // Handle OrbitControls for camera movement
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.rotateSpeed = 0.5;
    
    let lon = 0;
    let lat = 0;
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      lon += 0.05;
      lat = Math.max(-85, Math.min(85, lat));
      
      // Use phi and theta for camera rotation
      const phi = THREE.MathUtils.degToRad(90 - lat);
      const theta = THREE.MathUtils.degToRad(lon);
      
      // Apply rotation to camera
      camera.position.x = 500 * Math.sin(phi) * Math.cos(theta);
      camera.position.y = 500 * Math.cos(phi);
      camera.position.z = 500 * Math.sin(phi) * Math.sin(theta);
      camera.lookAt(0, 0, 0);
      
      controls.update();
      renderer.render(scene, camera);
    };
    
    animate();
    sceneRef.current = { scene, camera, renderer, controls };
    
    // Cleanup
    return () => {
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      
      renderer.dispose();
      controls.dispose();
    };
  }, [panoramaUrl]);
  
  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center">
      <div className="absolute top-4 right-4 z-10">
        <button 
          onClick={onClose}
          className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition"
          aria-label="Close virtual tour"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="w-full max-w-4xl h-[70vh] overflow-hidden rounded-lg" ref={containerRef}></div>
      
      <div className="mt-4 text-white text-center">
        <p className="text-sm">👆 Drag to look around the property</p>
      </div>
    </div>
  );
};

export default VirtualTourViewer;