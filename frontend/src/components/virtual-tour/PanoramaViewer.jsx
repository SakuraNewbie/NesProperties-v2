import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const HOTSPOT_ICON = "data:image/svg+xml;utf8,<svg width='32' height='32' xmlns='http://www.w3.org/2000/svg'><circle cx='16' cy='16' r='14' fill='%23f43f5e' stroke='white' stroke-width='3'/></svg>";

const PanoramaViewer = ({
  mountRef,
  imageUrl,
  hotspots = [],
  gyroEnabled,
  setLonState,
  setShowInfo,
  setLoading,
}) => {
  const lonRef = useRef(0);
  const latRef = useRef(0);

  useEffect(() => {
    if (!imageUrl) return;

    const mount = mountRef.current;
    let width = mount.clientWidth;
    let height = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 0, 0.1);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    function handleResize() {
      width = mount.clientWidth;
      height = mount.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
    window.addEventListener("resize", handleResize);

    let animationId;
    let mesh = null;
    let hotspotObjects = [];

    let isUserInteracting = false,
      lon = 0,
      lat = 0,
      phi = 0,
      theta = 0,
      onPointerDownPointerX = 0,
      onPointerDownPointerY = 0,
      onPointerDownLon = 0,
      onPointerDownLat = 0,
      velocityLon = 0,
      velocityLat = 0,
      lastClientX = 0,
      lastClientY = 0;

    lonRef.current = lon;
    latRef.current = lat;

    const SENSITIVITY = 0.3;
    let lastTouchDist = null;
    let lastTap = 0;

    const raycaster = new THREE.Raycaster();
    let mouse = new THREE.Vector2();

    // The imageUrl should already be a full URL from the parent component
    // No need to modify it further
    const loader = new THREE.TextureLoader();
    loader.load(
      imageUrl,
      (texture) => {
        const geometry = new THREE.SphereGeometry(500, 60, 40);
        geometry.scale(-1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ map: texture });
        mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // Add hotspots from data
        const hotspotTexture = new THREE.TextureLoader().load(HOTSPOT_ICON);
        hotspots.forEach((hotspot, index) => {
          const hotspotMaterial = new THREE.SpriteMaterial({ map: hotspotTexture });
          const hotspotObject = new THREE.Sprite(hotspotMaterial);
          
          // Position the hotspot based on data or default position
          const position = hotspot.position || { x: 400, y: 0, z: 0 };
          hotspotObject.position.set(position.x, position.y, position.z);
          hotspotObject.scale.set(40, 40, 1);
          hotspotObject.userData = { 
            index,
            title: hotspot.title || 'Feature',
            description: hotspot.description || 'Point of interest'
          };
          scene.add(hotspotObject);
          hotspotObjects.push(hotspotObject);
        });

        setLoading(false);

        function onPointerDown(event) {
          isUserInteracting = true;
          onPointerDownPointerX = event.clientX || event.touches?.[0]?.clientX;
          onPointerDownPointerY = event.clientY || event.touches?.[0]?.clientY;
          onPointerDownLon = lon;
          onPointerDownLat = lat;
          lastClientX = onPointerDownPointerX;
          lastClientY = onPointerDownPointerY;
        }

        function onPointerMove(event) {
          if (isUserInteracting) {
            const clientX = event.clientX || event.touches?.[0]?.clientX;
            const clientY = event.clientY || event.touches?.[0]?.clientY;
            lon =
              (onPointerDownPointerX - clientX) * SENSITIVITY + onPointerDownLon;
            lat =
              (clientY - onPointerDownPointerY) * SENSITIVITY + onPointerDownLat;
            velocityLon = clientX - lastClientX;
            velocityLat = clientY - lastClientY;
            lastClientX = clientX;
            lastClientY = clientY;
            lonRef.current = lon;
            latRef.current = lat;
          }
        }

        function onPointerUp() {
          isUserInteracting = false;
        }

        function getTouchDist(e) {
          if (e.touches.length < 2) return null;
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          return Math.sqrt(dx * dx + dy * dy);
        }
        
        function onTouchMove(e) {
          if (e.touches.length === 2) {
            const dist = getTouchDist(e);
            if (lastTouchDist && dist) {
              camera.fov += (lastTouchDist - dist) * 0.05;
              camera.fov = Math.max(30, Math.min(100, camera.fov));
              camera.updateProjectionMatrix();
            }
            lastTouchDist = dist;
          }
        }
        
        function onTouchEnd(e) {
          lastTouchDist = null;
        }

        function onDoubleTap(e) {
          const now = Date.now();
          if (now - lastTap < 300) {
            lon = 0;
            lat = 0;
            camera.fov = 75;
            camera.updateProjectionMatrix();
            lonRef.current = lon;
            latRef.current = lat;
          }
          lastTap = now;
        }

        mount.addEventListener("pointerdown", onPointerDown);
        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerUp);
        mount.addEventListener("touchstart", onPointerDown);
        window.addEventListener("touchmove", onPointerMove);
        window.addEventListener("touchend", onPointerUp);

        mount.addEventListener("touchmove", onTouchMove);
        mount.addEventListener("touchend", onTouchEnd);
        mount.addEventListener("dblclick", onDoubleTap);

        function onWheel(event) {
          camera.fov += event.deltaY * 0.05;
          camera.fov = Math.max(30, Math.min(100, camera.fov));
          camera.updateProjectionMatrix();
        }
        mount.addEventListener("wheel", onWheel);

        function onClick(event) {
          const rect = renderer.domElement.getBoundingClientRect();
          mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
          mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
          raycaster.setFromCamera(mouse, camera);
          
          // Check for intersections with all hotspots
          const intersects = raycaster.intersectObjects(hotspotObjects);
          if (intersects.length > 0) {
            const hotspotData = intersects[0].object.userData;
            // Update InfoWindow with hotspot data
            setShowInfo(true);
            setTimeout(() => setShowInfo(false), 3000);
          }
        }
        mount.addEventListener("click", onClick);

        function animate() {
          animationId = requestAnimationFrame(animate);

          if (gyroEnabled) {
            lon = lonRef.current;
            lat = latRef.current;
          } else if (!isUserInteracting) {
            lon -= velocityLon * 0.05;
            lat += velocityLat * 0.05;
            velocityLon *= 0.92;
            velocityLat *= 0.92;
            if (Math.abs(velocityLon) < 0.01) velocityLon = 0;
            if (Math.abs(velocityLat) < 0.01) velocityLat = 0;
          }

          lat = Math.max(-85, Math.min(85, lat));
          phi = THREE.MathUtils.degToRad(90 - lat);
          theta = THREE.MathUtils.degToRad(lon);

          camera.target = new THREE.Vector3(
            500 * Math.sin(phi) * Math.cos(theta),
            500 * Math.cos(phi),
            500 * Math.sin(phi) * Math.sin(theta)
          );
          camera.lookAt(camera.target);

          renderer.render(scene, camera);

          setLonState(lon);
        }
        animate();

        renderer._cleanup = () => {
          mount.removeEventListener("pointerdown", onPointerDown);
          window.removeEventListener("pointermove", onPointerMove);
          window.removeEventListener("pointerup", onPointerUp);
          mount.removeEventListener("touchstart", onPointerDown);
          window.removeEventListener("touchmove", onPointerMove);
          window.removeEventListener("touchend", onPointerUp);
          mount.removeEventListener("touchmove", onTouchMove);
          mount.removeEventListener("touchend", onTouchEnd);
          mount.removeEventListener("dblclick", onDoubleTap);
          mount.removeEventListener("wheel", onWheel);
          window.removeEventListener("resize", handleResize);
          mount.removeEventListener("click", onClick);
          
          if (mesh) {
            scene.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();
          }
          
          // Clean up all hotspots
          hotspotObjects.forEach(hotspot => {
            scene.remove(hotspot);
            hotspot.material.dispose();
          });
          
          if (animationId) cancelAnimationFrame(animationId);
        };
      },
      undefined,
      (error) => {
        console.error('Error loading panorama image:', error);
        setLoading(false);
      }
    );

    return () => {
      if (renderer._cleanup) renderer._cleanup();
      if (mount && renderer.domElement && mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [imageUrl, hotspots, gyroEnabled, setLonState, setShowInfo, setLoading, mountRef]);

  // Gyroscope event listener (only when enabled)
  useEffect(() => {
    function handleOrientation(event) {
      if (!gyroEnabled) return;
      if (typeof event.alpha === "number" && typeof event.beta === "number") {
        lonRef.current = -event.alpha;
        latRef.current = event.beta - 90;
      }
    }
    if (gyroEnabled) {
      window.addEventListener("deviceorientation", handleOrientation, true);
    }
    return () => {
      window.removeEventListener("deviceorientation", handleOrientation, true);
    };
  }, [gyroEnabled]);

  return null;
};

export default PanoramaViewer;