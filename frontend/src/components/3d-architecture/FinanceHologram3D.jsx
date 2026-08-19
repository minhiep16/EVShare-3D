import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Html, Float, Sparkles, Box, Cylinder } from '@react-three/drei';

const formatCurrency = (value) => {
  if (value >= 1000000) return (value / 1000000).toFixed(1) + ' Tr';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
};

// 3D Donut Segment
const DonutSegment = ({ color, thetaStart, thetaLength, radius, tube, position }) => {
  const ref = useRef();
  
  useFrame((state) => {
    // Slight breathing effect
    if (ref.current) {
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 2 + thetaStart) * 0.05;
    }
  });

  return (
    <group position={position} ref={ref}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        {/* We use a cylinder with hole or a Torus. Torus is better for rounded edges, but Cylinder is easier to segment perfectly. */}
        <torusGeometry args={[radius, tube, 16, 100, thetaLength]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} emissive={color} emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
};

// 3D Donut Chart (Energy Rings)
const HologramDonut = ({ data, title }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  let currentAngle = 0;

  return (
    <group position={[0, 1, 0]}>
      {/* Floating Center Title */}
      <Float speed={2} rotationIntensity={0} floatIntensity={0.5}>
        <Html center transform sprite distanceFactor={10} zIndexRange={[50, 0]}>
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 p-4 rounded-full w-40 h-40 flex flex-col items-center justify-center text-center shadow-[0_0_30px_rgba(255,255,255,0.1)] pointer-events-none">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">{title}</p>
            <p className="text-xl font-bold text-white font-mono">{formatCurrency(total)}</p>
          </div>
        </Html>
      </Float>

      {/* Energy Rings */}
      {data.map((item, idx) => {
        const thetaLength = (item.value / total) * Math.PI * 2;
        const start = currentAngle;
        currentAngle += thetaLength;
        
        // Add a tiny gap between segments
        const gap = 0.05;
        const adjustedLength = Math.max(0, thetaLength - gap);
        
        // Label position (midpoint of the arc)
        const midAngle = start + adjustedLength / 2;
        const labelRadius = 4;
        const lx = Math.cos(midAngle) * labelRadius;
        const lz = Math.sin(midAngle) * labelRadius;

        return (
          <group key={item.label} rotation={[0, -start, 0]}>
            <DonutSegment 
              color={item.color} 
              thetaStart={start} 
              thetaLength={adjustedLength} 
              radius={2.5} 
              tube={0.4} 
              position={[0, 0, 0]} 
            />
            
            {/* Label for segment */}
            {item.value > 0 && (
              <Html position={[lx, 0, lz]} transform sprite distanceFactor={8} zIndexRange={[50, 0]}>
                <div className="bg-slate-900/90 backdrop-blur-sm border rounded-lg p-2 flex flex-col items-center pointer-events-none" style={{ borderColor: item.color, boxShadow: `0 0 15px ${item.color}40` }}>
                  <span className="text-[10px] font-bold text-white mb-0.5">{item.label}</span>
                  <span className="text-sm font-black" style={{ color: item.color }}>{((item.value / total) * 100).toFixed(1)}%</span>
                </div>
              </Html>
            )}
          </group>
        );
      })}
      
      {/* Central Ambient Glow */}
      <Sparkles count={50} scale={6} size={3} speed={0.4} opacity={0.3} color="#ffffff" />
    </group>
  );
};

// 3D Bar Chart (Data City)
const HologramBarChart = ({ data, title }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const maxHeight = 5;
  const spacing = 2;
  const startX = -((data.length - 1) * spacing) / 2;

  return (
    <group position={[0, -1, 0]}>
      {/* Base Grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#020617" roughness={0.8} />
      </mesh>
      <gridHelper args={[20, 20, '#1e293b', '#0f172a']} position={[0, 0.01, 0]} />

      {/* Floating Title */}
      <Html position={[0, 6, -3]} transform sprite distanceFactor={15}>
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 px-6 py-3 rounded-2xl shadow-xl pointer-events-none">
          <p className="text-lg font-bold text-white uppercase tracking-widest">{title}</p>
        </div>
      </Html>

      {data.map((item, idx) => {
        const height = (item.value / maxValue) * maxHeight || 0.1;
        const x = startX + idx * spacing;
        
        return (
          <group key={item.label} position={[x, 0, 0]}>
            {/* The Bar */}
            <mesh position={[0, height / 2, 0]} castShadow>
              <boxGeometry args={[1, height, 1]} />
              <meshStandardMaterial 
                color={item.color} 
                metalness={0.5} 
                roughness={0.2}
                emissive={item.color}
                emissiveIntensity={0.4}
                transparent
                opacity={0.9}
              />
            </mesh>
            
            {/* Inner glowing core for the bar */}
            <mesh position={[0, height / 2, 0]}>
              <boxGeometry args={[0.5, height + 0.1, 0.5]} />
              <meshBasicMaterial color={item.color} />
            </mesh>
            
            {/* Hologram Label above the bar */}
            <Float speed={2} rotationIntensity={0} floatIntensity={0.5} position={[0, height + 0.8, 0]}>
              <Html center transform sprite distanceFactor={8} zIndexRange={[50, 0]}>
                <div className="bg-slate-900/90 backdrop-blur-sm border-l-2 p-2 flex flex-col items-center pointer-events-none" style={{ borderColor: item.color }}>
                  <span className="text-[10px] text-slate-400 font-bold mb-0.5 uppercase">{item.label}</span>
                  <span className="text-sm font-black text-white">{formatCurrency(item.value)}</span>
                </div>
              </Html>
            </Float>
            
            {/* Label on the floor */}
            <Html position={[0, 0, 1.5]} center transform rotation={[-Math.PI/2, 0, 0]} sprite={false}>
              <div className="text-[10px] font-bold text-slate-500 uppercase">{item.label}</div>
            </Html>
          </group>
        );
      })}
    </group>
  );
};

const FinanceHologram3D = ({ type = 'donut', data = [], title = 'Phân tích Dữ liệu', autoRotate = true }) => {
  return (
    <div className="w-full h-[500px] rounded-3xl overflow-hidden relative shadow-2xl border border-slate-700 bg-slate-950">
      
      {/* 2D Overlay UI Context */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-widest bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20">
          <i className="ph-fill ph-chart-polar"></i>
          Hologram Analytics
        </div>
      </div>
      
      <div className="absolute bottom-4 right-4 z-10 text-white/40 text-xs font-semibold tracking-widest uppercase pointer-events-none">
        <i className="ph ph-arrows-out-cardinal"></i> Xoay chuột để quan sát 3D
      </div>

      <Canvas
        shadows
        camera={{ position: [0, 5, 12], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#020617']} />
        <fog attach="fog" args={['#020617', 5, 25]} />
        
        <ambientLight intensity={0.4} />
        <directionalLight castShadow position={[5, 10, 5]} intensity={1.5} shadow-mapSize={[1024, 1024]} />
        <pointLight position={[0, 5, 0]} intensity={1} color="#ffffff" distance={10} />
        <Environment preset="night" />

        <OrbitControls 
          enablePan={false}
          maxPolarAngle={Math.PI / 2 - 0.1}
          minDistance={5}
          maxDistance={20}
          autoRotate={autoRotate}
          autoRotateSpeed={0.5}
        />

        {type === 'donut' ? (
          <HologramDonut data={data} title={title} />
        ) : (
          <HologramBarChart data={data} title={title} />
        )}
        
      </Canvas>
    </div>
  );
};

export default FinanceHologram3D;
