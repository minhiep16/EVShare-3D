import React, { useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Html, Float, Line, Sphere, Sparkles } from '@react-three/drei';
import CarModel3D from '../3d-architecture/CarModel3D';

// --- Sub-components for 3D Scene ---

const SatelliteNode = ({ index, total, owner }) => {
  const radius = 3.2; // Giảm bán kính để không vướng vào Hologram Panel
  const angle = (index / total) * Math.PI * 2;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;

  return (
    <group>
      <Line
        points={[[0, 0, 0], [x, 0, z]]}
        color="#3b82f6"
        opacity={0.2}
        transparent
        lineWidth={1}
        dashed={true}
        dashSize={0.2}
        gapSize={0.1}
      />

      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5} position={[x, 0.5, z]}>
        <mesh position={[0, 0, 0]}>
          <octahedronGeometry args={[0.2, 0]} />
          <meshStandardMaterial color={owner.ownershipPercentage >= 40 ? "#22c55e" : "#3b82f6"} metalness={0.8} roughness={0.2} />
        </mesh>

        <Html position={[0, 0.6, 0]} transform sprite distanceFactor={5}>
          <div className="w-40 bg-slate-900/80 backdrop-blur-md border border-white/20 rounded-xl p-2 shadow-2xl flex flex-col items-center text-center">
            <img
              src={owner.avatarUrl || 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg'}
              alt={owner.name}
              className={`w-10 h-10 rounded-full mb-1 border-2 ${owner.ownershipPercentage >= 40 ? 'border-green-500' : 'border-blue-500'}`}
            />
            <p className="text-xs font-bold text-white truncate w-full">{owner.name || owner.username}</p>
            <div className="flex items-center gap-1 mt-1">
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${owner.ownershipPercentage >= 40 ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                {owner.ownershipPercentage}% Cổ phần
              </span>
            </div>
            {owner.ownershipPercentage >= 40 && (
              <span className="text-[8px] mt-1 text-green-400 uppercase tracking-widest font-black">Admin</span>
            )}
          </div>
        </Html>
      </Float>
    </group>
  );
};

// VotingTerminal removed as per user request

// --- Main 3D Dashboard Component ---

const UserDashboard3D = ({
  vehicle,
  kpi,
  bookings,
  transactions,
  coOwners,
  activeVotes,
  suggestions,
  ownershipPercentage,
  onBookNow,
  onSelectAllBookings,
  onVoteClick,
  onAIChatClick
}) => {

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value).replace('₫', '₫');
  };

  return (
    <div className="w-full h-[calc(100vh-100px)] rounded-3xl overflow-hidden relative shadow-xl border border-slate-700 bg-slate-950">

      {/* 2D Overlay Header */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h2 className="text-3xl font-bold tracking-tight text-white drop-shadow-lg mb-2">
          {vehicle?.model || 'My Vehicle'} ({vehicle?.year || 2024})
        </h2>
        <div className="flex items-center gap-3">
          <span className="bg-brand-500/20 text-brand-400 px-3 py-1 rounded-full font-mono font-bold border border-brand-500/30 shadow-lg">
            {vehicle?.licensePlate || 'Chưa cấp biển'}
          </span>
          <span className="px-3 py-1 rounded-full text-sm font-bold border bg-green-500/20 text-green-400 border-green-500/30 shadow-lg flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            {vehicle?.status || 'Sẵn sàng'}
          </span>
        </div>
      </div>

      <div className="absolute top-6 right-6 z-10">
        <button
          onClick={onBookNow}
          className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-brand-500/25 flex items-center gap-2 cursor-pointer border border-brand-400"
        >
          <i className="ph ph-calendar-plus text-lg"></i>
          ĐẶT LỊCH NGAY
        </button>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-white/50 text-xs font-semibold tracking-widest uppercase flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full backdrop-blur-md pointer-events-none border border-white/10">
        <i className="ph ph-arrows-out-cardinal text-lg"></i> Kéo chuột để xoay (Giới hạn góc nhìn)
      </div>

      <Canvas
        shadows
        camera={{ position: [0, 4, 15], fov: 48 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#020617']} />
        <fog attach="fog" args={['#020617', 10, 30]} />
        <ambientLight intensity={0.4} />
        <directionalLight
          castShadow
          position={[5, 10, 5]}
          intensity={1.5}
          shadow-mapSize={[2048, 2048]}
        />
        <Environment preset="night" />

        <OrbitControls
          enablePan={false}
          maxPolarAngle={Math.PI / 2 - 0.05}
          minDistance={6}
          maxDistance={14}
          // GIỚI HẠN GÓC QUAY ĐỂ KHÔNG BỊ NGƯỢC CHỮ (MIRRORED) VÀ LỖI LAYOUT
          minAzimuthAngle={-Math.PI / 3}
          maxAzimuthAngle={Math.PI / 3}
        />

        <ContactShadows position={[0, -0.01, 0]} opacity={0.6} scale={20} blur={2.5} far={4} />

        <group position={[0, -0.5, 0]}>
          {/* Cybernetic Turntable */}
          <mesh position={[0, 0, 0]} receiveShadow>
            <cylinderGeometry args={[4.5, 4.8, 0.2, 64]} />
            <meshStandardMaterial color="#0f172a" metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.11, 0]}>
            <ringGeometry args={[3.8, 4.0, 64]} />
            <meshBasicMaterial color="#3b82f6" transparent opacity={0.3} side={THREE.DoubleSide} />
          </mesh>

          {/* Central Car Model */}
          {vehicle && <CarModel3D vehicle={vehicle} isShowroom={true} />}

          {/* Hologram Panel: Left (KPI Stats & AI) */}
          <Float speed={1.5} rotationIntensity={0.02} floatIntensity={0.1}>
            <Html position={[-6.8, 1.5, -1.5]} transform sprite distanceFactor={7.2} className="pointer-events-none">
              <div className="w-[360px] flex flex-col gap-5 pointer-events-auto">

                {/* AI Suggestions Card (Tạm ẩn theo yêu cầu)
                <div className="bg-slate-900/90 backdrop-blur-2xl border border-violet-500/50 rounded-3xl p-6 shadow-[0_0_50px_rgba(139,92,246,0.25)] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-violet-500/20 rounded-full blur-3xl pointer-events-none"></div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-violet-400 animate-pulse"><i className="ph-fill ph-sparkle text-xl"></i></span>
                    <h3 className="text-violet-100 font-bold text-base tracking-wider uppercase drop-shadow-[0_0_5px_rgba(139,92,246,0.8)]">AI Cố vấn</h3>
                  </div>
                  <div className="space-y-3 mb-5">
                    {suggestions?.slice(0, 2).map(s => (
                      <div key={s.id} className="flex gap-3 text-sm text-slate-200 bg-black/40 p-3 rounded-2xl border border-white/10">
                        <i className={`ph ${s.iconClass} text-violet-400 shrink-0 mt-0.5 text-lg`}></i>
                        <p className="leading-relaxed text-sm">{s.content}</p>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onAIChatClick(); }}
                    className="w-full bg-violet-600/30 hover:bg-violet-600 text-violet-200 hover:text-white border border-violet-500/50 hover:border-violet-400 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(139,92,246,0.4)]"
                  >
                    <i className="ph ph-chat-teardrop-text text-lg"></i> Chat với AI
                  </button>
                </div>
                */}

                {/* KPI Stats Panel */}
                <div className="bg-slate-900/90 backdrop-blur-2xl border border-brand-500/50 rounded-3xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.6)]">
                  <h3 className="text-brand-400 font-bold text-base tracking-wider uppercase mb-5 flex items-center gap-3 drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]">
                    <i className="ph ph-chart-bar text-xl"></i> Thống kê Tháng
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/60 p-4 rounded-2xl border border-white/10">
                      <p className="text-slate-400 text-xs uppercase font-bold mb-1.5">Chi phí</p>
                      <p className="text-white font-bold text-xl">{formatCurrency(kpi?.totalCostThisMonth || 0)}</p>
                      <p className="text-red-400 text-xs mt-1.5">+{kpi?.costChangePercentage}%</p>
                    </div>
                    <div className="bg-black/60 p-4 rounded-2xl border border-white/10">
                      <p className="text-slate-400 text-xs uppercase font-bold mb-1.5">Odometer</p>
                      <p className="text-white font-bold text-xl">{kpi?.drivenKmThisMonth || 0} <span className="text-sm font-normal text-slate-300">km</span></p>
                      <p className="text-green-400 text-xs mt-1.5">Sở hữu: {ownershipPercentage}%</p>
                    </div>
                    <div className="bg-black/60 p-4 rounded-2xl border border-white/10">
                      <p className="text-slate-400 text-xs uppercase font-bold mb-1.5">Số lần đặt</p>
                      <p className="text-white font-bold text-xl">{kpi?.bookingCountThisMonth || 0} <span className="text-sm font-normal text-slate-300">lần</span></p>
                    </div>
                    <div className="bg-black/60 p-4 rounded-2xl border border-brand-500/40 shadow-[inset_0_0_20px_rgba(59,130,246,0.15)]">
                      <p className="text-slate-400 text-xs uppercase font-bold mb-1.5">Quỹ chung</p>
                      <p className="text-green-400 font-bold text-xl">{formatCurrency(kpi?.jointFundBalance || 0)}</p>
                      <p className="text-green-400 text-xs mt-1.5">{kpi?.jointFundStatus}</p>
                    </div>
                  </div>
                </div>

              </div>
            </Html>
          </Float>

          {/* Hologram Panel: Right (Cost Chart & Booking) */}
          <Float speed={1.5} rotationIntensity={0.02} floatIntensity={0.1}>
            <Html position={[6.8, 1.5, -1.5]} transform sprite distanceFactor={7.2} className="pointer-events-none">
              <div className="w-[360px] flex flex-col gap-5 pointer-events-auto">

                {/* Cost Chart Breakdown */}
                <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.6)]">
                  <h3 className="text-white font-bold text-base tracking-wider uppercase mb-5 flex items-center gap-3">
                    <i className="ph ph-pie-chart text-brand-400 text-xl"></i> Cơ cấu Chi phí
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300 flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></div>Sạc điện</span>
                      <span className="text-sm font-bold text-white">45%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300 flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]"></div>Bảo dưỡng</span>
                      <span className="text-sm font-bold text-white">25%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300 flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]"></div>Bảo hiểm</span>
                      <span className="text-sm font-bold text-white">20%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300 flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-slate-400 shadow-[0_0_8px_#94a3b8]"></div>Khác</span>
                      <span className="text-sm font-bold text-white">10%</span>
                    </div>
                  </div>
                </div>

                {/* Upcoming Bookings */}
                <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.6)]">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-white font-bold text-base tracking-wider uppercase flex items-center gap-3">
                      <i className="ph ph-calendar text-brand-400 text-xl"></i> Lịch sắp tới
                    </h3>
                    <button onClick={(e) => { e.stopPropagation(); onSelectAllBookings(); }} className="text-xs text-brand-400 hover:text-brand-300 font-bold cursor-pointer transition-colors bg-brand-500/10 px-2 py-1 rounded-lg">XEM TẤT CẢ</button>
                  </div>

                  <div className="space-y-3 max-h-[160px] overflow-y-auto scrollbar-thin pr-2">
                    {bookings?.filter(b => b.purpose && b.status === 'CONFIRMED').slice(0, 3).map(b => (
                      <div key={b.id} className="bg-black/40 p-3 rounded-2xl border border-white/10 flex items-center gap-4 transition-all hover:bg-white/5">
                        <div className="w-10 h-10 rounded-xl bg-brand-500/30 text-brand-300 flex flex-col items-center justify-center border border-brand-500/40 shrink-0">
                          <span className="text-sm font-bold">{new Date(b.startTime).getDate()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">{b.user?.name || b.user?.username}</p>
                          <p className="text-xs text-slate-400 truncate mt-1">{b.purpose}</p>
                        </div>
                      </div>
                    ))}
                    {(!bookings || bookings.length === 0) && (
                      <div className="text-center text-sm text-slate-500 py-6">Trống lịch</div>
                    )}
                  </div>
                </div>

              </div>
            </Html>
          </Float>

          {/* Co-owners Satellites */}
          {coOwners?.map((owner, idx) => (
            <SatelliteNode
              key={owner.id}
              index={idx}
              total={coOwners.length}
              owner={owner}
            />
          ))}

        </group>
      </Canvas>
    </div>
  );
};

export default UserDashboard3D;
