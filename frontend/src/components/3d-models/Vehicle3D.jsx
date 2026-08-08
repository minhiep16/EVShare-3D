import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const Vehicle3D = ({ vehicle, coOwners, ownershipPercentage }) => {
  const mountRef = useRef(null);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const idleTimeoutRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Get container dimensions
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight || 300;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    // Soft transparent background to match design
    scene.background = null; 

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(6, 3, 7);

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 8, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const dirLight2 = new THREE.DirectionalLight(0x3b82f6, 0.4); // Subtle blue fill light
    dirLight2.position.set(-5, 3, -5);
    scene.add(dirLight2);

    // 5. Creating a stylized Tesla Model 3
    const carGroup = new THREE.Group();
    scene.add(carGroup);

    // Materials
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x16a34a, // Brand Green
      metalness: 0.9,
      roughness: 0.1,
      name: 'body'
    });

    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.9,
      roughness: 0.05,
      transparent: true,
      opacity: 0.75
    });

    const wheelMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.8
    });

    const rimMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.9,
      roughness: 0.2
    });

    const lightMatWhite = new THREE.MeshBasicMaterial({
      color: 0xffffff
    });

    const lightMatRed = new THREE.MeshBasicMaterial({
      color: 0xef4444
    });

    // Body chassis
    const bodyGeo = new THREE.BoxGeometry(4.2, 0.7, 1.8);
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.y = 0.45;
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    carGroup.add(bodyMesh);

    // Cabin glass top
    const cabinGeo = new THREE.BoxGeometry(2.4, 0.65, 1.5);
    const cabinMesh = new THREE.Mesh(cabinGeo, glassMat);
    cabinMesh.position.set(-0.2, 1.05, 0);
    cabinMesh.castShadow = true;
    carGroup.add(cabinMesh);

    // Spoiler/Back shape
    const backGeo = new THREE.BoxGeometry(0.8, 0.4, 1.7);
    const backMesh = new THREE.Mesh(backGeo, bodyMat);
    backMesh.position.set(-2.0, 0.5, 0);
    carGroup.add(backMesh);

    // Headlights
    const lightGeo = new THREE.BoxGeometry(0.1, 0.15, 0.35);
    const rightLight = new THREE.Mesh(lightGeo, lightMatWhite);
    rightLight.position.set(2.1, 0.65, 0.65);
    const leftLight = rightLight.clone();
    leftLight.position.set(2.1, 0.65, -0.65);
    carGroup.add(rightLight, leftLight);

    // Taillights
    const tailLightGeo = new THREE.BoxGeometry(0.1, 0.1, 0.4);
    const rightTail = new THREE.Mesh(tailLightGeo, lightMatRed);
    rightTail.position.set(-2.4, 0.6, 0.6);
    const leftTail = rightTail.clone();
    leftTail.position.set(-2.4, 0.6, -0.6);
    carGroup.add(rightTail, leftTail);

    // Wheels
    const wheels = [];
    const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.32, 24);
    wheelGeo.rotateX(Math.PI / 2); // rotate cylinder to lie horizontally

    const rimGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.34, 16);
    rimGeo.rotateX(Math.PI / 2);

    const wheelPositions = [
      { x: 1.25, z: 0.95 },   // Front Right
      { x: 1.25, z: -0.95 },  // Front Left
      { x: -1.25, z: 0.95 },  // Rear Right
      { x: -1.25, z: -0.95 }  // Rear Left
    ];

    wheelPositions.forEach((pos) => {
      const wheelGroup = new THREE.Group();
      wheelGroup.position.set(pos.x, 0.42, pos.z);

      const tyre = new THREE.Mesh(wheelGeo, wheelMat);
      const rim = new THREE.Mesh(rimGeo, rimMat);
      wheelGroup.add(tyre, rim);

      carGroup.add(wheelGroup);
      wheels.push(wheelGroup);
    });

    // 6. Interactive Hotspots (3D spheres)
    const hotspotGeo = new THREE.SphereGeometry(0.15, 16, 16);
    const hotspotMat = new THREE.MeshBasicMaterial({
      color: 0x22c55e,
      transparent: true,
      opacity: 0.8
    });

    const createHotspot = (x, y, z, id, color = 0x22c55e) => {
      const mat = hotspotMat.clone();
      mat.color.setHex(color);
      const mesh = new THREE.Mesh(hotspotGeo, mat);
      mesh.position.set(x, y, z);
      mesh.name = `hotspot_${id}`;
      carGroup.add(mesh);
      return mesh;
    };

    const batteryHotspot = createHotspot(0, 0.2, 0, 'battery', 0x22c55e);      // Green underbody
    const wheelHotspot = createHotspot(1.25, 0.95, 1.05, 'wheel', 0x3b82f6);   // Blue front wheel
    const cabinHotspot = createHotspot(-0.2, 1.4, 0, 'cabin', 0xf59e0b);       // Amber glass roof

    // LED Neon Underglow Setup
    const batteryPct = vehicle?.batteryPercentage || 78;
    let neonColorHex = 0x22c55e;
    if (batteryPct < 30) {
      neonColorHex = 0xef4444;
    } else if (batteryPct <= 70) {
      neonColorHex = 0xf59e0b;
    }

    const underglowLight = new THREE.PointLight(neonColorHex, 2.5, 3.5);
    underglowLight.position.set(0, 0.1, 0);
    carGroup.add(underglowLight);

    const neonGeo = new THREE.PlaneGeometry(3.6, 1.6);
    const neonMat = new THREE.MeshBasicMaterial({
      color: neonColorHex,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    const neonMesh = new THREE.Mesh(neonGeo, neonMat);
    neonMesh.rotateX(-Math.PI / 2);
    neonMesh.position.set(0, 0.02, 0);
    carGroup.add(neonMesh);

    // 7. Grid Floor
    const grid = new THREE.GridHelper(15, 15, 0x16a34a, 0xe2e8f0);
    grid.position.y = 0.01;
    scene.add(grid);

    // 7.5. Ownership Segmented Ring
    const ownershipGroup = new THREE.Group();
    scene.add(ownershipGroup);

    const ringPalette = [0x22c55e, 0x3b82f6, 0xf59e0b, 0xec4899, 0x8b5cf6, 0x06b6d4];
    const activeCoOwners = coOwners && coOwners.length > 0 ? coOwners : [
      { id: '1', name: 'Bạn', ownershipPercentage: ownershipPercentage || 40 },
      { id: '2', name: 'Thành viên B', ownershipPercentage: 35 },
      { id: '3', name: 'Thành viên C', ownershipPercentage: 25 }
    ];

    let currentAngle = 0;
    activeCoOwners.forEach((owner, idx) => {
      const pct = owner.ownershipPercentage || 0;
      if (pct <= 0) return;

      const segmentAngle = (pct / 100.0) * (Math.PI * 2);
      
      const ringGeo = new THREE.RingGeometry(2.35, 2.45, 64, 1, currentAngle, segmentAngle);
      const ringMat = new THREE.MeshBasicMaterial({
        color: ringPalette[idx % ringPalette.length],
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
      });
      const segmentMesh = new THREE.Mesh(ringGeo, ringMat);
      segmentMesh.rotateX(-Math.PI / 2);
      segmentMesh.position.set(0, 0.03, 0);
      ownershipGroup.add(segmentMesh);

      const midAngle = currentAngle + (segmentAngle / 2);
      const radius = 2.4;
      const markerGeo = new THREE.SphereGeometry(0.08, 16, 16);
      const markerMat = new THREE.MeshBasicMaterial({
        color: ringPalette[idx % ringPalette.length]
      });
      const markerMesh = new THREE.Mesh(markerGeo, markerMat);
      markerMesh.position.set(Math.cos(midAngle) * radius, 0.05, Math.sin(midAngle) * radius);
      markerMesh.name = `owner_marker_${owner.id}_${pct}_${owner.name}`;
      ownershipGroup.add(markerMesh);

      currentAngle += segmentAngle;
    });

    // 8. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.1; // Don't let users go below ground
    controls.minDistance = 3.5;
    controls.maxDistance = 12;

    // Detect interactions to pause auto-rotation
    controls.addEventListener('start', () => {
      setIsInteracting(true);
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    });

    controls.addEventListener('end', () => {
      idleTimeoutRef.current = setTimeout(() => {
        setIsInteracting(false);
      }, 5000); // Resume auto-rotation after 5s idle
    });

    // 9. Raycasting for clicks
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleMouseClick = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        const clickedObj = intersects[0].object;
        if (clickedObj.name.startsWith('hotspot_')) {
          const id = clickedObj.name.replace('hotspot_', '');
          setActiveTooltip(id);
        } else if (clickedObj.name.startsWith('owner_marker_')) {
          const parts = clickedObj.name.split('_');
          const ownerId = parts[2];
          const pct = parts[3];
          const name = parts[4];
          setActiveTooltip({ type: 'owner', id: ownerId, pct: pct, name: name });
        }
      }
    };

    renderer.domElement.addEventListener('click', handleMouseClick);

    // 10. Animation Loop
    let angle = 0;
    const animate = () => {
      requestAnimationFrame(animate);

      // Auto rotation if not interacting
      if (!isInteracting) {
        carGroup.rotation.y += 0.006;
      }
      
      // Auto rotation of ownership ring (always rotates slowly)
      ownershipGroup.rotation.y += 0.003;

      // Rotate wheels to simulate movement
      const isMoving = vehicle?.status === 'IN_USE';
      const rotationSpeed = isMoving ? 0.15 : 0.02;
      wheels.forEach((w) => {
        w.children[0].rotation.z += rotationSpeed;
        w.children[1].rotation.z += rotationSpeed;
      });

      // Pulsing effect for hotspots & underglow neon
      angle += 0.05;
      const pulse = 0.8 + Math.sin(angle) * 0.25;
      batteryHotspot.scale.set(pulse, pulse, pulse);
      wheelHotspot.scale.set(pulse, pulse, pulse);
      cabinHotspot.scale.set(pulse, pulse, pulse);
      
      if (neonMat) {
        neonMat.opacity = 0.45 + Math.sin(angle * 1.5) * 0.2;
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 11. Resize handler
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight || 300;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    };
  }, [isInteracting, vehicle, coOwners, ownershipPercentage]);

  const closeTooltip = () => setActiveTooltip(null);

  return (
    <div className="w-full h-full relative min-h-[280px]">
      <div ref={mountRef} className="w-full h-full min-h-[280px] bg-slate-900/10 rounded-xl" />
      
      {/* Help Instructions Overlay */}
      <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur text-[10px] text-slate-200 px-2 py-1 rounded select-none pointer-events-none flex items-center gap-1">
        <i className="ph ph-hand-swipe text-xs"></i>
        <span>Kéo để xoay 3D · Click điểm sáng để xem thông số</span>
      </div>

      {/* Dynamic Overlay Tooltips */}
      {activeTooltip && (
        <div className="absolute top-4 left-4 right-4 bg-white/95 backdrop-blur border border-slate-200 p-3.5 rounded-xl shadow-lg z-20 animate-fade-in flex items-start justify-between">
          <div className="flex gap-2.5">
            {activeTooltip === 'battery' && (
              <>
                <div className="w-9 h-9 rounded-lg bg-green-50 text-brand-600 flex items-center justify-center text-lg"><i className="ph ph-battery-charging"></i></div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-400">Trạng thái Pin</h4>
                  <p className="text-sm font-bold text-ink">{vehicle?.batteryPercentage || 78}% · Sức khỏe Pin tốt</p>
                </div>
              </>
            )}
            {activeTooltip === 'wheel' && (
              <>
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-lg"><i className="ph ph-gauge"></i></div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-400">Hành trình xe (Odo)</h4>
                  <p className="text-sm font-bold text-ink">{new Intl.NumberFormat('vi-VN').format(vehicle?.odometer || 12400)} km · Lốp trước 2.3 bar</p>
                </div>
              </>
            )}
            {activeTooltip === 'cabin' && (
              <>
                <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-lg"><i className="ph ph-users-three"></i></div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-400">Tỉ lệ sở hữu xe</h4>
                  <p className="text-sm font-bold text-ink">{ownershipPercentage || 40}% (Bạn) · Quyền sở hữu đồng thuận</p>
                </div>
              </>
            )}
            {activeTooltip?.type === 'owner' && (
              <>
                <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg"><i className="ph ph-user"></i></div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-400">Cổ đông phương tiện</h4>
                  <p className="text-sm font-bold text-ink">{activeTooltip.name} · {activeTooltip.pct}% cổ phần</p>
                </div>
              </>
            )}
          </div>
          <button 
            onClick={closeTooltip}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <i className="ph ph-x text-sm"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default Vehicle3D;
