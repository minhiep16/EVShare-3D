import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Html, Float } from '@react-three/drei';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import CarModel3D from '../3d-architecture/CarModel3D';

// Custom styles for this specific dashboard
const dashboardStyles = `
  .glass-panel-new {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.8);
      transition: all 0.3s ease;
  }
  .glass-panel-new:hover {
      border-color: rgba(16, 185, 129, 0.4);
      background: rgba(255, 255, 255, 0.05);
      transform: translateY(-2px);
  }
  .text-glow {
      text-shadow: 0 0 15px rgba(16, 185, 129, 0.5);
  }
  .ui-layer {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 10;
      pointer-events: none;
  }
  .floating {
      animation: floating 6s ease-in-out infinite;
  }
  @keyframes floating {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
  }
  .booking-row:hover {
      background: rgba(255, 255, 255, 0.05);
  }
  .custom-scroll::-webkit-scrollbar {
      width: 4px;
      display: block;
  }
  .custom-scroll::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 4px;
  }
`;

const SatelliteNode = ({ index, total, owner }) => {
  const radius = 5;
  const angle = (index / total) * Math.PI * 2;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  const color = owner.ownershipPercentage >= 40 ? "#10b981" : "#3b82f6";

  const groupRef = useRef();
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh position={[x, 1, z]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshPhongMaterial color={color} emissive={color} emissiveIntensity={0.5} />
        <pointLight color={color} intensity={1} distance={5} />
        <Html position={[0, 0.8, 0]} transform sprite center distanceFactor={8}>
          <div className="flex flex-col items-center">
            <img src={owner.avatarUrl || 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg'} alt={owner.name} className="w-8 h-8 rounded-full border-2" style={{ borderColor: color }} />
            <div className="bg-slate-900/80 rounded px-2 py-0.5 mt-1 border border-white/20">
              <p className="text-[10px] font-bold text-white">{owner.name}</p>
              <p className="text-[8px]" style={{ color }}>{owner.ownershipPercentage}%</p>
            </div>
          </div>
        </Html>
      </mesh>
    </group>
  );
};


const UserDashboard3D = ({
  vehicle,
  bookings,
  coOwners,
  currentUserInfo,
  onBookNow
}) => {
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN').format(value || 0) + '₫';
  };

  const costData = [
    { name: 'Sạc điện', value: 450, color: '#10b981' },
    { name: 'Bảo dưỡng', value: 320, color: '#3b82f6' },
    { name: 'Bảo hiểm', value: 280, color: '#f59e0b' },
    { name: 'Khác', value: 140, color: '#94a3b8' },
  ];

  const adminOwner = coOwners?.find(o => o.ownershipPercentage >= 40) || coOwners?.[0];
  const fundBalance = vehicle?.jointFundBalance || 15800000;

  // Render bookings
  const upcomingBookings = (bookings || []).filter(b => b.status === 'CONFIRMED' && new Date(b.startTime) >= new Date()).slice(0, 3);
  const getMonthDate = (dateString) => {
    const d = new Date(dateString);
    return { date: d.getDate(), month: `TH${d.getMonth() + 1}` };
  };

  return (
    <div className="w-full h-full min-h-[90vh] bg-[#030712] relative overflow-hidden text-white font-sans rounded-3xl border border-slate-800/50" style={{ userSelect: 'none' }}>
      <style>{dashboardStyles}</style>

      {/* 3D Scene Background */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
        <Canvas camera={{ position: [8, 6, 12], fov: 45 }} gl={{ alpha: true }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[5, 5, 5]} intensity={2} distance={50} color="#10b981" />
          <pointLight position={[-5, 2, 2]} intensity={2} distance={50} color="#3b82f6" />
          <Environment preset="night" />

          <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
            <CarModel3D vehicle={vehicle} />
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

          <OrbitControls enableZoom={true} enablePan={false} maxPolarAngle={Math.PI / 2 + 0.1} minDistance={5} maxDistance={20} />
        </Canvas>
      </div>

      {/* UI Overlay Layer */}
      <div className="ui-layer flex flex-col p-6 lg:p-10 pointer-events-none">

        {/* TOP: App Header & Vehicle Info */}
        <header className="flex flex-wrap items-start justify-between gap-6 pointer-events-auto">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center text-white shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <i className="ph-fill ph-lightning-bolt text-3xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tighter">EV<span className="text-brand-400">SHARE</span></h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Co-ownership Hub</p>
            </div>
          </div>

          {/* Vehicle Info Overlay */}
          <div className="glass-panel-new rounded-[32px] px-8 py-5 hidden md:flex items-center gap-10 overflow-hidden">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Mô hình</span>
              <span className="text-lg font-extrabold">{vehicle?.model || 'Tesla Model 3'} <span className="text-brand-400">Plaid</span></span>
            </div>
            <div className="h-10 w-[1px] bg-white/10"></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Biển số</span>
              <span className="text-lg font-extrabold">{vehicle?.licensePlate || 'Chưa cấp biển'}</span>
            </div>
            <div className="h-10 w-[1px] bg-white/10"></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Trạng thái pin</span>
              <div className="flex items-center gap-3">
                <span className="text-lg font-extrabold text-brand-400">84%</span>
                <div className="w-12 h-2.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-500 rounded-full" style={{ width: '84%' }}></div>
                </div>
              </div>
            </div>
            <button onClick={onBookNow} className="ml-4 bg-brand-500 hover:bg-brand-600 text-white px-8 py-3.5 rounded-2xl text-sm font-extrabold transition-all shadow-[0_0_25px_rgba(16,185,129,0.4)] pointer-events-auto">
              ĐẶT LỊCH NGAY
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden lg:block">
              <p className="text-sm font-bold">{adminOwner?.name || adminOwner?.username}</p>
              <p className="text-[11px] text-slate-500 font-medium">Chủ nhóm sở hữu</p>
            </div>
            <img src={adminOwner?.avatarUrl || 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg'} className="w-14 h-14 rounded-2xl object-cover border border-white/10 shadow-2xl" alt="avatar" />
          </div>
        </header>

        {/* CENTER: Empty Spacer for 3D Scene */}
        <div className="flex-1 relative pointer-events-none"></div>

        {/* BOTTOM: Floating Panels */}
        <div className="grid grid-cols-12 gap-4 items-end pointer-events-none pb-0">

          {/* LEFT: Stats & Chart */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-3 floating pointer-events-auto" style={{ animationDelay: '-1s' }}>
            <div className="glass-panel-new rounded-2xl p-3">
              <h3 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">Thống kê hoạt động</h3>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <p className="text-xl font-black text-white">342<span className="text-brand-400 text-xs font-bold ml-1">km</span></p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">Đã di chuyển</p>
                </div>
                <div>
                  <p className="text-xl font-black text-white">{bookings?.length || 0}<span className="text-blue-400 text-xs font-bold ml-1">lần</span></p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">Đặt lịch tháng này</p>
                </div>
              </div>
              <div className="h-[1px] w-full bg-white/5 mb-3"></div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">Quỹ chung hiện tại</p>
                  <p className="text-lg font-black text-glow">{formatCurrency(fundBalance)}</p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <i className="ph ph-trend-up text-brand-400 text-lg"></i>
                </div>
              </div>
            </div>

            <div className="glass-panel-new rounded-2xl p-3 hidden md:block">
              <h3 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Cơ cấu chi phí</h3>
              <div className="h-24 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={costData} cx="50%" cy="50%" innerRadius={30} outerRadius={45} paddingAngle={2} dataKey="value" stroke="none">
                      {costData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px', color: 'white', fontSize: '10px', padding: '2px 6px' }} itemStyle={{ color: 'white', padding: 0 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* MIDDLE: Hidden spacer for 3D model focus */}
          <div className="col-span-12 lg:col-span-4 hidden lg:block"></div>

          {/* RIGHT: Bookings */}
          <div className="col-span-12 lg:col-span-4 floating pointer-events-auto" style={{ animationDelay: '-2s' }}>
            <div className="glass-panel-new rounded-2xl p-3 flex flex-col max-h-[350px]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Lịch đặt sắp tới</h3>
                <span className="px-2 py-0.5 bg-brand-500/10 text-brand-400 text-[9px] font-extrabold rounded-full border border-brand-500/20">{upcomingBookings.length} CHUYẾN</span>
              </div>

              <div className="space-y-2 overflow-y-auto pr-1 custom-scroll max-h-[250px]">
                {upcomingBookings.length > 0 ? upcomingBookings.map((b, i) => {
                  const { date, month } = getMonthDate(b.startTime);
                  const colorClass = i % 3 === 0 ? "bg-brand-500/20 border-brand-500/30 text-brand-400" : i % 3 === 1 ? "bg-blue-500/20 border-blue-500/30 text-blue-400" : "bg-amber-500/20 border-amber-500/30 text-amber-400";
                  return (
                    <div key={b.id} className="booking-row p-3 rounded-xl border border-white/5 bg-white/5 flex items-center gap-3 transition-all cursor-pointer">
                      <div className={`w-10 h-10 rounded-xl border flex flex-col items-center justify-center shrink-0 ${colorClass}`}>
                        <span className="text-sm font-black leading-none">{date}</span>
                        <span className="text-[8px] font-bold uppercase">{month}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate">{b.purpose}</p>
                        <p className="text-[9px] text-slate-500 mt-0.5 truncate">
                          {new Date(b.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          {' '}–{' '}
                          {new Date(b.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <i className="ph ph-caret-right text-slate-600 text-xs"></i>
                    </div>
                  );
                }) : (
                  <div className="text-center text-[10px] text-slate-500 py-6 font-bold border border-white/5 rounded-xl bg-white/5">
                    Không có lịch trình sắp tới
                  </div>
                )}
              </div>

              <button className="mt-4 w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-[9px] font-bold uppercase tracking-widest border border-white/10 transition-all">
                Xem toàn bộ lịch
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard3D;
