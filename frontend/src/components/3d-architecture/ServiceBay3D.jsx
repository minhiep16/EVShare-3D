import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Html, Text, Float } from '@react-three/drei';
import CarModel3D from './CarModel3D';
import { startServiceRecord } from '../../services/api';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const ServiceBayCar = ({ service, position, onComplete, onRefresh }) => {
  const [hovered, setHovered] = useState(false);
  const group = useRef();

  const handleStart = async (e) => {
    e.stopPropagation();
    try {
      const res = await startServiceRecord(service.id);
      alert('⚙️ ' + res.message);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data || err.message));
    }
  };

  // Gentle float animation
  useFrame((state) => {
    if (group.current) {
      group.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.05;
    }
  });

  const isPending = service.status === 'PENDING';
  const ringColor = isPending ? '#f59e0b' : '#3b82f6'; // Amber for pending, Blue for in-progress

  // Mock vehicle object for CarModel3D
  const vehicleObj = {
    id: service.id,
    model: service.car
  };

  return (
    <group 
      ref={group} 
      position={position}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'; }}
    >
      {/* 3D Car */}
      <CarModel3D vehicle={vehicleObj} isShowroom={false} />

      {/* Hologram Base Ring */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.5, 2.7, 64]} />
        <meshBasicMaterial color={ringColor} transparent opacity={hovered ? 0.8 : 0.3} />
      </mesh>

      {/* 3D Label Floating Above Car */}
      <Text position={[0, 2.8, 0]} fontSize={0.3} color="white" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000">
        {service.plate}
      </Text>

      {/* Hologram UI Panel (Visible on Hover) */}
      {hovered && (
        <Html position={[0, 1.5, 2]} center transform occlude distanceFactor={8} zIndexRange={[100, 0]}>
          <div className="w-80 bg-slate-900/80 backdrop-blur-xl border border-white/20 p-5 rounded-2xl text-white shadow-[0_0_30px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{service.type}</p>
                <h3 className="font-bold text-lg leading-tight">{service.title}</h3>
              </div>
              <span className={`px-2 py-1 text-[10px] font-bold rounded border ${isPending ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'}`}>
                {isPending ? 'Đang chờ' : 'Đang xử lý'}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-black/40 rounded-xl border border-white/5">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Mã Dịch Vụ</p>
                <p className="text-sm font-mono text-slate-200">#{service.id}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Ngày lên lịch</p>
                <p className="text-sm font-semibold text-slate-200">{service.date}</p>
              </div>
              <div className="col-span-2 pt-2 border-t border-white/10">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider flex justify-between">
                  <span>Dự kiến chi phí</span>
                  <span className="text-brand-400 font-mono font-bold text-base">{formatCurrency(service.cost)}</span>
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              {isPending && (
                <button 
                  onClick={handleStart}
                  className="flex-1 bg-brand-600 hover:bg-brand-500 text-white py-2.5 rounded-lg text-sm font-bold transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] cursor-pointer"
                >
                  Bắt đầu xử lý
                </button>
              )}
              {!isPending && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onComplete(service.id); }}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg text-sm font-bold transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] cursor-pointer"
                >
                  Hoàn thành
                </button>
              )}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

const ServiceBay3D = ({ services, onComplete, onRefresh }) => {
  if (!services || services.length === 0) {
    return (
      <div className="w-full h-[500px] bg-slate-900 rounded-3xl flex flex-col items-center justify-center border border-slate-800 shadow-inner">
        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center text-4xl mb-4">
          <i className="ph ph-wrench text-slate-600"></i>
        </div>
        <h3 className="text-xl font-bold text-slate-300 mb-2">Xưởng Dịch vụ Trống</h3>
        <p className="text-slate-500">Không có xe nào đang nằm ở xưởng dịch vụ.</p>
      </div>
    );
  }

  // Calculate positions for cars to line them up in the bay
  // Space them by 6 units on the X axis
  const spacing = 6;
  const startX = -((services.length - 1) * spacing) / 2;

  return (
    <div className="relative w-full h-[550px] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700">
      
      {/* 2D Overlay HUD */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h2 className="text-white text-2xl font-bold font-mono tracking-tight flex items-center gap-2 drop-shadow-md">
          <i className="ph-fill ph-garage text-brand-500"></i> XƯỞNG DỊCH VỤ 3D
        </h2>
        <p className="text-slate-400 text-sm mt-1 bg-black/40 px-3 py-1 rounded-lg backdrop-blur-md inline-block border border-white/10">
          Kéo chuột để di chuyển camera. Rê chuột vào xe để thao tác.
        </p>
      </div>

      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [0, 8, 15], fov: 40 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#0b0f19']} />
        <ambientLight intensity={0.4} />
        <directionalLight castShadow position={[5, 10, 5]} intensity={1.5} shadow-mapSize={[2048, 2048]} />
        <Environment preset="city" />

        {/* Controls: Enable pan so user can drag left/right to see long lines of cars */}
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          maxPolarAngle={Math.PI / 2 - 0.05} 
          minDistance={5} 
          maxDistance={30} 
        />

        {/* Floor and Environment */}
        <ContactShadows position={[0, -0.01, 0]} opacity={0.6} scale={50} blur={2.5} far={4} />
        
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#0f172a" roughness={0.8} metalness={0.2} />
        </mesh>
        
        {/* Service Bay Markings */}
        <gridHelper args={[100, 100, '#1e293b', '#1e293b']} position={[0, -0.04, 0]} />

        {/* Render each service as a car in the bay */}
        {services.map((service, index) => {
          const posX = startX + (index * spacing);
          return (
            <ServiceBayCar 
              key={service.id} 
              service={service} 
              position={[posX, 0, 0]} 
              onComplete={onComplete}
              onRefresh={onRefresh}
            />
          );
        })}
      </Canvas>
    </div>
  );
};

export default ServiceBay3D;
