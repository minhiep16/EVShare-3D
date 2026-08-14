import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Float, Html } from '@react-three/drei';

/**
 * CarModel3D - A more realistic, curved procedural car model
 * Replacing the old sharp box geometry.
 */
const CarModel3D = ({ vehicle, damageLocation, isShowroom = false, onPartClick }) => {
  const group = useRef();
  
  // Model specific parameters
  const modelName = vehicle?.model || '';
  
  // Base dimensions
  let scale = [2.5, 0.7, 5]; 
  let roofScale = [1.8, 0.6, 2.2];
  let roofPos = [0, 0.65, -0.2];
  
  // Determine color based on vehicle info or random hash of ID if not specified
  let color = vehicle?.color || '#ffffff';
  
  if (!vehicle?.color) {
    // Generate a consistent color based on the model string to ensure it matches across tabs
    if (modelName.includes('VF 9')) {
      color = '#1e293b'; // Slate 800
    } else if (modelName.includes('e34')) {
      color = '#3b82f6'; // Blue 500
    } else if (modelName.includes('VF 8')) {
      color = '#0f172a'; // Dark slate
    } else {
      // Fallback hash based on ID if model doesn't match standard VinFast lineup
      const colors = ['#ffffff', '#0f172a', '#dc2626', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
      const colorIndex = vehicle?.id ? (vehicle.id % colors.length) : 0;
      color = colors[colorIndex];
    }
  }

  // Adjust proportions for VinFast models
  if (modelName.includes('VF 9')) {
    scale = [2.8, 0.9, 5.5];
    roofScale = [2.2, 0.7, 2.6];
    roofPos = [0, 0.8, -0.2];
  } else if (modelName.includes('e34')) {
    scale = [2.2, 0.7, 4.2];
    roofScale = [1.6, 0.6, 1.8];
    roofPos = [0, 0.65, -0.1];
  } else if (modelName.includes('VF 8')) {
    scale = [2.5, 0.8, 5];
    roofScale = [1.8, 0.6, 2.2];
    roofPos = [0, 0.7, -0.2];
  }

  // Override color if maintenance
  if (vehicle?.status === 'MAINTENANCE') {
    color = '#dc2626'; // Force Red
  }

  useFrame((state) => {
    if (group.current) {
      if (isShowroom) {
        // Only lerp scale for entrance effect, no rotation
        group.current.scale.lerp({ x: 1, y: 1, z: 1 }, 0.1);
      } else {
        group.current.scale.set(1, 1, 1);
      }
    }
  });

  // Damage marker logic
  let markerPos = null;
  let markerLabel = "";
  if (damageLocation === 'front') { markerPos = [0, 0.6, scale[2]/2]; markerLabel = "Hỏng Đầu xe"; }
  else if (damageLocation === 'back') { markerPos = [0, 0.6, -scale[2]/2]; markerLabel = "Móp Đuôi xe"; }
  else if (damageLocation === 'left') { markerPos = [-scale[0]/2, 0.6, 0]; markerLabel = "Xước Cửa trái"; }
  else if (damageLocation === 'right') { markerPos = [scale[0]/2, 0.6, 0]; markerLabel = "Xước Cửa phải"; }
  else if (damageLocation === 'wheel') { markerPos = [-scale[0]/2, 0.3, scale[2]/2 - 0.8]; markerLabel = "Xịt lốp"; }
  else if (damageLocation === 'roof') { markerPos = [0, roofPos[1] + roofScale[1], -0.2]; markerLabel = "Nứt Nóc/Kính"; }

  return (
    <group ref={group} scale={isShowroom ? [0, 0, 0] : [1, 1, 1]}>
      <Float speed={1.5} rotationIntensity={0.05} floatIntensity={0.2}>
        
        {/* Curvy Main Body */}
        <RoundedBox 
          args={scale} 
          radius={0.25} 
          smoothness={4} 
          position={[0, scale[1]/2 + 0.3, 0]} 
          castShadow 
          receiveShadow
          onClick={(e) => { e.stopPropagation(); if (onPartClick) onPartClick('Thân xe (Cánh cửa/Sườn xe)'); }}
          onPointerOver={(e) => { if (onPartClick) document.body.style.cursor = 'pointer'; }}
          onPointerOut={(e) => { if (onPartClick) document.body.style.cursor = 'auto'; }}
        >
          <meshStandardMaterial color={color} roughness={0.15} metalness={0.7} />
        </RoundedBox>

        {/* Curvy Cabin/Roof */}
        <RoundedBox 
          args={roofScale} 
          radius={0.3} 
          smoothness={4} 
          position={[roofPos[0], roofPos[1] + scale[1]/2 + 0.3, roofPos[2]]} 
          castShadow
          onClick={(e) => { e.stopPropagation(); if (onPartClick) onPartClick('Nóc xe / Kính lái'); }}
          onPointerOver={(e) => { if (onPartClick) document.body.style.cursor = 'pointer'; }}
          onPointerOut={(e) => { if (onPartClick) document.body.style.cursor = 'auto'; }}
        >
          <meshStandardMaterial color="#000000" roughness={0.05} metalness={0.9} transparent opacity={0.85} />
        </RoundedBox>

        {/* Headlights (Glowing) */}
        <mesh position={[-scale[0]/2 + 0.4, scale[1]/2 + 0.4, scale[2]/2 + 0.01]} castShadow>
          <capsuleGeometry args={[0.08, 0.4, 4, 8]} />
          <meshBasicMaterial color="#ffffff" />
          <pointLight color="#ffffff" intensity={0.5} distance={2} />
        </mesh>
        <mesh position={[scale[0]/2 - 0.4, scale[1]/2 + 0.4, scale[2]/2 + 0.01]} castShadow>
          <capsuleGeometry args={[0.08, 0.4, 4, 8]} />
          <meshBasicMaterial color="#ffffff" />
          <pointLight color="#ffffff" intensity={0.5} distance={2} />
        </mesh>

        {/* Taillights (Glowing Red strip) */}
        <mesh position={[0, scale[1]/2 + 0.4, -scale[2]/2 - 0.01]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <capsuleGeometry args={[0.05, scale[0] - 0.5, 4, 8]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>

        {/* Wheels */}
        {[-scale[0]/2 + 0.1, scale[0]/2 - 0.1].map((x, xIndex) => (
          [-scale[2]/2 + 0.8, scale[2]/2 - 0.8].map((z, zIndex) => {
            const wheelIdx = xIndex * 2 + zIndex + 1;
            return (
              <group 
                key={`${x}-${z}`} 
                position={[x, 0.4, z]}
                onClick={(e) => { e.stopPropagation(); if (onPartClick) onPartClick(`Bánh xe ${wheelIdx}`); }}
                onPointerOver={(e) => { if (onPartClick) document.body.style.cursor = 'pointer'; }}
                onPointerOut={(e) => { if (onPartClick) document.body.style.cursor = 'auto'; }}
              >
                {/* Tire */}
                <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
                  <cylinderGeometry args={[0.4, 0.4, 0.35, 32]} />
                  <meshStandardMaterial color="#111111" roughness={0.9} />
                </mesh>
                {/* Rim */}
                <mesh rotation={[Math.PI / 2, 0, 0]} position={[Math.sign(x) * 0.18, 0, 0]}>
                  <cylinderGeometry args={[0.25, 0.25, 0.02, 16]} />
                  <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
                </mesh>
              </group>
            );
          })
        ))}

        {/* Damage Hologram Marker */}
        {markerPos && (
          <Html position={markerPos} center distanceFactor={8} zIndexRange={[100, 0]}>
            <div className="relative flex items-center justify-center pointer-events-none">
              <div className="absolute w-12 h-12 bg-red-500/30 rounded-full animate-ping"></div>
              <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-[0_0_15px_#ef4444] z-10"></div>
              <div className="absolute top-6 whitespace-nowrap bg-red-900/80 backdrop-blur-md px-3 py-1 rounded border border-red-500/50 text-red-100 font-bold text-xs shadow-xl">
                {markerLabel}
              </div>
            </div>
          </Html>
        )}
      </Float>
    </group>
  );
};

export default CarModel3D;
