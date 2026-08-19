import React, { useState, Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Html, Float } from '@react-three/drei';
import CarModel3D from './CarModel3D';



const VehicleShowroom3D = ({ vehicles, onAddMember }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!vehicles || vehicles.length === 0) return <div className="text-center p-10 bg-white rounded-2xl">Không có xe nào.</div>;

  const currentVehicleGroup = vehicles[currentIndex];
  const vehicle = currentVehicleGroup.vehicle || {};

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? vehicles.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === vehicles.length - 1 ? 0 : prev + 1));
  };



  return (
    <div className="relative w-full h-[600px] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700">

      {/* Navigation Controls (Kept in 2D for usability) */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white flex items-center justify-center transition-all cursor-pointer border border-white/20"
      >
        <i className="ph ph-caret-left text-2xl"></i>
      </button>

      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white flex items-center justify-center transition-all cursor-pointer border border-white/20"
      >
        <i className="ph ph-caret-right text-2xl"></i>
      </button>

      {/* 3D Environment */}
      <Canvas
        shadows
        camera={{ position: [0, 4, 12], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#0f172a']} />
        <ambientLight intensity={0.5} />
        <directionalLight
          castShadow
          position={[5, 10, 5]}
          intensity={1.5}
          shadow-mapSize={[2048, 2048]}
        />
        <Environment preset="city" />

        <OrbitControls
          enablePan={false}
          maxPolarAngle={Math.PI / 2 - 0.1}
          minDistance={5}
          maxDistance={15}
        />

        <ContactShadows position={[0, -0.01, 0]} opacity={0.6} scale={20} blur={2.5} far={4} />

        <Suspense fallback={null}>
          <group position={[0, -0.5, 0]}>
            {/* Showroom Platform / Turntable */}
            <mesh position={[0, 0, 0]} receiveShadow>
              <cylinderGeometry args={[4, 4.2, 0.2, 64]} />
              <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.2} />
            </mesh>

            {/* The Car */}
            <CarModel3D key={vehicle.id || currentIndex} vehicle={vehicle} isShowroom={true} />
            
            {/* 3D Interactive Spatial UI: Left Panel (Vehicle Stats) */}
            <Float speed={2} rotationIntensity={0.1} floatIntensity={0.5}>
              <Html position={[-4.5, 2.5, 0]} transform rotation={[0, Math.PI / 8, 0]} distanceFactor={8} zIndexRange={[40, 0]} className="pointer-events-none">
                <div className="w-[320px] bg-slate-900/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] text-white pointer-events-auto">
                  <h2 className="text-3xl font-bold tracking-tight mb-3 drop-shadow-md">{vehicle.model || 'Unknown Model'}</h2>
                  <div className="flex items-center gap-2 mb-6">
                    <span className="bg-brand-500/20 text-brand-400 px-3 py-1 rounded-full font-mono text-sm font-bold border border-brand-500/30">
                      {vehicle.licensePlate || 'Chưa cấp biển'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${vehicle.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                      vehicle.status === 'MAINTENANCE' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                        'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      }`}>
                      {vehicle.status === 'ACTIVE' ? 'Sẵn sàng' : vehicle.status === 'MAINTENANCE' ? 'Đang bảo dưỡng' : vehicle.status || 'Đang sử dụng'}
                    </span>
                  </div>
                  
                  <div className="space-y-5">
                    <div>
                      <p className="text-xs text-slate-400 mb-1 font-semibold tracking-wider">MỨC PIN (SoC)</p>
                      <div className="flex items-end justify-between mb-1">
                        <span className="text-2xl font-bold text-green-400 font-mono drop-shadow-sm">{vehicle.batteryPercentage || 0}%</span>
                        <i className="ph-fill ph-battery-high text-xl text-green-400"></i>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden shadow-inner">
                        <div className="bg-green-400 h-full shadow-[0_0_10px_#4ade80]" style={{ width: `${vehicle.batteryPercentage || 0}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1 font-semibold tracking-wider">QUÃNG ĐƯỜNG</p>
                      <p className="text-2xl font-bold text-white font-mono drop-shadow-sm">{new Intl.NumberFormat().format(vehicle.mileage || 0)} <span className="text-sm font-sans text-slate-300">km</span></p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1 font-semibold tracking-wider">TRỊ GIÁ TÀI SẢN</p>
                      <p className="text-2xl font-bold text-brand-400 font-mono drop-shadow-sm">{new Intl.NumberFormat('vi-VN').format(vehicle.currentValue || 800000000)} <span className="text-sm font-sans text-slate-300">VNĐ</span></p>
                    </div>
                  </div>
                </div>
              </Html>
            </Float>

            {/* 3D Interactive Spatial UI: Right Panel (Members) */}
            <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
              <Html position={[4.5, 2.5, 0]} transform rotation={[0, -Math.PI / 8, 0]} distanceFactor={8} zIndexRange={[40, 0]} className="pointer-events-none">
                <div className="w-[300px] bg-slate-900/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] text-white pointer-events-auto">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold tracking-wider uppercase mb-1">
                      <i className="ph ph-users"></i>
                      <span>Nhóm đồng sở hữu</span>
                    </div>
                    <p className="text-xl font-bold text-white drop-shadow-md">{currentVehicleGroup.name || 'Nhóm xe'}</p>
                    <p className="text-sm mt-1 text-green-500 font-semibold">{currentVehicleGroup.members?.length || 0} thành viên</p>
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white/20 mb-5">
                    {currentVehicleGroup.members?.length > 0 ? (
                      currentVehicleGroup.members.map(member => (
                        <div key={member.id} className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5">
                          <img src={member.avatarUrl || 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg'} className="w-10 h-10 rounded-full border border-white/20" alt="avatar" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-white">{member.name || member.username}</p>
                            <p className="text-xs text-slate-400">{member.phone || 'Chưa cập nhật số'}</p>
                          </div>
                          <span className="text-xs font-bold text-brand-400 bg-brand-500/20 px-2 py-1 rounded-lg border border-brand-500/30">
                            {member.ownershipPercentage}%
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400 italic text-center py-4">Chưa có thành viên nào.</p>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onAddMember) onAddMember(currentVehicleGroup.id);
                    }}
                    className="w-full bg-white/10 hover:bg-brand-500 text-white py-3 rounded-xl text-sm font-bold transition-all border border-white/20 hover:border-brand-400 flex items-center justify-center gap-2"
                  >
                    <i className="ph ph-user-plus text-lg"></i> Thêm thành viên
                  </button>
                </div>
              </Html>
            </Float>

          </group>
        </Suspense>
      </Canvas>
    </div>
  );
};

export default VehicleShowroom3D;
