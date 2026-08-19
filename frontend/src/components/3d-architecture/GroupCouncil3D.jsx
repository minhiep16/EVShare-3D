import React, { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, OrbitControls, Float, Text, Html } from '@react-three/drei';
import CarModel3D from './CarModel3D';

// 3D Contributor Marker
const ContributorMarker = ({ owner, position, delay }) => {
  const [hovered, setHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + delay) * 0.2;
    }
  });

  return (
    <group position={position} ref={meshRef}>
      <Html transform sprite>
        <div 
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          onClick={(e) => {
            e.stopPropagation();
            setShowDetails(!showDetails);
          }}
          className={`cursor-pointer transition-all duration-300 ${hovered || showDetails ? 'scale-125' : 'scale-100'}`}
        >
          <img 
            src={owner.avatarUrl || "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg"} 
            className={`w-12 h-12 rounded-full border-2 object-cover transition-colors ${owner.isGroupLeader ? 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.6)]' : 'border-brand-500 shadow-[0_0_15px_rgba(99,102,241,0.6)]'} ${showDetails && !owner.isGroupLeader ? 'border-brand-400' : ''}`}
            alt={owner.name}
          />
        </div>
      </Html>
      
      {/* Tooltip on hover */}
      {hovered && !showDetails && (
        <Html position={[0, 0.8, 0]} center>
          <div className="bg-slate-900/90 backdrop-blur-md border border-brand-500/50 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.5)] whitespace-nowrap">
            {owner.name || owner.username} - {owner.ownershipPercentage}%
          </div>
        </Html>
      )}

      {/* Detailed Board on click */}
      {showDetails && (
        <Html position={[0, 1.2, 0]} center>
          <div className="w-[200px] bg-slate-900/95 backdrop-blur-xl border border-amber-500/50 rounded-2xl p-4 shadow-[0_0_30px_rgba(245,158,11,0.3)] animate-fade-in relative">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowDetails(false); }}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs"
            >
              <i className="ph ph-x"></i>
            </button>
            <div className="text-center mb-3">
              <h4 className="text-sm font-bold text-white leading-tight">{owner.name || owner.username}</h4>
              <p className="text-[10px] text-amber-400 font-mono mt-1">Vai trò: {owner.isGroupLeader ? 'Nhóm Trưởng' : 'Đồng Sở Hữu'}</p>
            </div>
            <div className="bg-slate-950/50 rounded-lg p-2 border border-slate-800 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Cổ phần:</span>
                <span className="text-white font-bold">{owner.ownershipPercentage}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Đóng góp quỹ:</span>
                <span className="text-emerald-400 font-bold">Hoàn tất</span>
              </div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

// 3D Voting Hologram
const VotingHologram = ({ currentVote, coOwnersCount, onVoteCast, onDeleteVote }) => {
  if (!currentVote) return null;

  const isLeaderVote = currentVote.type === 'LEADER_ELECTION' || currentVote.title?.toLowerCase().includes('trưởng') || currentVote.title?.toLowerCase().includes('bầu');
  
  let logicText = '';
  if (isLeaderVote) {
    if (coOwnersCount <= 2) {
      logicText = "Thắng bằng tỷ lệ sở hữu cao hơn";
    } else if (coOwnersCount === 3) {
      logicText = "Yêu cầu 3/3 phiếu đồng thuận (100%)";
    } else {
      logicText = `Yêu cầu tối thiểu ${coOwnersCount - 1}/${coOwnersCount} phiếu`;
    }
  } else {
    logicText = `Yêu cầu ${currentVote.requiredVotes || Math.ceil(coOwnersCount / 2)} phiếu đồng ý để duyệt`;
  }

  return (
    <Html transform position={[3, 1, 0]} rotation={[0, -0.6, 0]}>
      <div className="w-[300px] bg-slate-900/80 backdrop-blur-md border border-brand-500 shadow-[0_0_40px_rgba(99,102,241,0.4)] rounded-2xl p-5 text-white animate-fade-in pointer-events-auto relative">
        <button 
          onClick={() => onDeleteVote(currentVote.id)}
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition-colors"
          title="Xóa đề xuất này"
        >
          <i className="ph ph-trash"></i>
        </button>
        <div className="flex items-center gap-2 mb-3 border-b border-slate-700 pb-3 pr-6">
          <i className="ph-fill ph-broadcast text-brand-500 animate-pulse text-xl"></i>
          <div>
            <h4 className="text-sm font-bold text-white leading-tight">{currentVote.title}</h4>
            <p className="text-[10px] text-brand-400 uppercase tracking-widest mt-0.5">ĐANG CHỜ PHIẾU BẦU</p>
          </div>
        </div>
        
        <div className="bg-slate-950/50 rounded-lg p-3 mb-4 border border-slate-800">
          <p className="text-xs text-slate-300 font-medium leading-relaxed">
            <span className="text-brand-400 font-bold">Quy tắc bầu:</span> {logicText}
          </p>
        </div>

        <div className="flex gap-2">
          <button onClick={() => onVoteCast(currentVote.id, true)} className="flex-1 bg-brand-500 hover:bg-brand-600 text-white py-2 rounded-lg text-sm font-bold shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all">
            ĐỒNG Ý
          </button>
          <button onClick={() => onVoteCast(currentVote.id, false)} className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 py-2 rounded-lg text-sm font-bold transition-all">
            PHẢN ĐỐI
          </button>
        </div>
      </div>
    </Html>
  );
};


// Component to display a recently deposited money marker
const DepositMarker = ({ deposit, position, delay }) => {
  const meshRef = useRef();
  const [showDetails, setShowDetails] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + delay) * 0.3;
    }
  });

  return (
    <group position={position} ref={meshRef}>
      <Html transform sprite>
        <div 
          onClick={(e) => { e.stopPropagation(); setShowDetails(!showDetails); }}
          className="w-14 h-14 rounded-full border-4 border-emerald-400/50 bg-emerald-500/20 flex items-center justify-center cursor-pointer hover:border-emerald-400 hover:scale-110 shadow-[0_0_20px_rgba(16,185,129,0.6)] transition-all duration-300"
        >
          <i className="ph-fill ph-currency-circle-dollar text-3xl text-emerald-400 animate-pulse"></i>
        </div>
      </Html>

      {showDetails && (
        <Html position={[0, 1.2, 0]} center>
          <div className="w-[220px] bg-slate-900/95 backdrop-blur-xl border border-emerald-500/50 rounded-2xl p-4 shadow-[0_0_30px_rgba(16,185,129,0.3)] animate-fade-in relative text-center">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowDetails(false); }}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs"
            >
              <i className="ph ph-x"></i>
            </button>
            <div className="w-12 h-12 mx-auto rounded-full overflow-hidden border-2 border-emerald-500 mb-2">
              <img src={deposit.avatarUrl || "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg"} alt="avatar" className="w-full h-full object-cover" />
            </div>
            <h4 className="text-sm font-bold text-white">{deposit.userName}</h4>
            <p className="text-xs text-slate-400 mt-0.5">Vừa nạp thành công</p>
            <div className="mt-2 text-lg font-bold font-mono text-emerald-400 glow-brand">
              +{formatCurrency(deposit.amount)}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
};

const GroupCouncil3D = ({ 
  vehicle, 
  coOwners, 
  activeVotes, 
  currentUser, 
  fundBalance,
  onVoteCast,
  onDepositClick,
  onHistoryClick,
  onProposeClick,
  onLeaderClick,
  onSharesClick,
  recentDeposits
}) => {
  const [deletedVoteIds, setDeletedVoteIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('evshare_deleted_votes')) || [];
    } catch {
      return [];
    }
  });

  const handleDeleteVote = (id) => {
    const newDeleted = [...deletedVoteIds, id];
    setDeletedVoteIds(newDeleted);
    localStorage.setItem('evshare_deleted_votes', JSON.stringify(newDeleted));
  };

  // 3D Proposal Marker
  const ProposalMarker = ({ vote, position, delay, isSelected, onClick }) => {
    const meshRef = useRef();
    
    useFrame((state) => {
      if (meshRef.current) {
        meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + delay) * 0.3;
      }
    });

    return (
      <group position={position} ref={meshRef}>
        <Html transform sprite>
          <div 
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className={`w-14 h-14 rounded-full border-4 flex items-center justify-center cursor-pointer transition-all duration-300 ${isSelected ? 'border-brand-400 bg-brand-500/20 scale-125 shadow-[0_0_30px_rgba(99,102,241,0.8)]' : 'border-amber-400/50 bg-amber-500/10 hover:border-amber-400 hover:scale-110 shadow-[0_0_15px_rgba(245,158,11,0.5)]'}`}
          >
            <i className={`ph-fill ph-question text-2xl ${isSelected ? 'text-brand-400' : 'text-amber-400'} animate-pulse`}></i>
          </div>
        </Html>
      </group>
    );
  };

  const openVotes = (activeVotes || []).filter(v => v.status === 'OPEN' && !deletedVoteIds.includes(v.id) && !v.title?.toLowerCase().includes('fsdf'));
  const [selectedVoteId, setSelectedVoteId] = useState(null);
  const currentVote = openVotes.find(v => v.id === selectedVoteId);
  const chartData = [
    { value: fundBalance * 0.8 },
    { value: fundBalance * 0.85 },
    { value: fundBalance * 0.9 },
    { value: fundBalance * 0.95 },
    { value: fundBalance * 1.05 },
    { value: fundBalance * 1.1 },
    { value: fundBalance * 1.0 },
    { value: fundBalance }
  ];

  return (
    <div className="w-full relative min-h-screen font-sans text-white bg-[radial-gradient(120%_100%_at_50%_-20%,#0f1b3a_0%,#020617_55%)] rounded-3xl overflow-hidden p-6 md:p-8 flex flex-col gap-7 shadow-2xl border border-slate-800">
      
      <style>{`
        .glass-panel {
          background: linear-gradient(180deg, rgba(15,23,42,.85) 0%, rgba(2,6,23,.92) 100%);
          border: 1px solid rgba(30,41,59,.8);
          box-shadow: 0 24px 60px -30px rgba(0,0,0,.9), inset 0 1px 0 rgba(255,255,255,.03);
          backdrop-filter: blur(18px);
        }
        .holo-grid {
          background-image:
            linear-gradient(rgba(99,102,241,.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,.05) 1px, transparent 1px);
          background-size: 28px 28px;
        }
        .waveform { animation: wave 2.6s ease-in-out infinite alternate; }
        @keyframes wave { 0%{opacity:.55;transform:scaleY(.8)} 100%{opacity:1;transform:scaleY(1.15)} }
        .laser { position:absolute; height:1px; background:linear-gradient(90deg,rgba(99,102,241,.7),transparent); }
        @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }
        .glow-brand { text-shadow: 0 0 14px rgba(99,102,241,.55); }
        
        /* Custom scrollbar for small areas */
        ::-webkit-scrollbar { width: 0; height: 0; }
      `}</style>



      <main className="grid grid-cols-1 gap-7 flex-1">
        {/* MAIN CONTENT REGION */}
        <section className="flex flex-col gap-7">

          {/* Hero balance banner */}
          <div className="glass-panel rounded-3xl p-6 md:p-8 relative overflow-hidden min-h-[400px] flex flex-col justify-start">
            <div className="absolute inset-0 z-0 pointer-events-none">
              <Canvas camera={{ position: [0, 0, 5] }} gl={{ alpha: true }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1.5} color="#10b981" />
                <Environment preset="night" />
                {(recentDeposits || []).map((deposit, idx) => {
                  const x = (idx % 5 - 2) * 1.5; // Spread horizontally
                  const y = -1 + Math.floor(idx / 5) * -1.5; // Spread vertically if many
                  return (
                    <Float key={deposit.id} speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                      <DepositMarker 
                        deposit={deposit} 
                        position={[x, y, 0]} 
                        delay={idx * 0.5} 
                      />
                    </Float>
                  );
                })}
                <OrbitControls enableZoom={false} enablePan={false} />
              </Canvas>
            </div>
            <div className="absolute inset-0 holo-grid opacity-50 pointer-events-none z-0"></div>
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400 mb-2">Số Dư Quỹ Chung Đồng Sở Hữu</p>
                <h1 className="text-5xl md:text-6xl font-bold font-mono glow-brand text-brand-400">{formatCurrency(fundBalance)}</h1>
                <p className="text-sm text-slate-400 mt-2">Trên {coOwners.length} cổ đông · Tự động cân bằng smart contract</p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button onClick={onDepositClick} className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition whitespace-nowrap shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                  Nạp Tài Sản
                </button>
                <button onClick={onProposeClick} className="px-4 py-2.5 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-400 text-sm font-semibold hover:bg-brand-500/20 transition whitespace-nowrap">
                  Tạo Đề Xuất
                </button>
                <button onClick={onLeaderClick} className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-sm shadow-[0_0_15px_rgba(245,158,11,0.3)] transition whitespace-nowrap">
                  Bầu Nhóm Trưởng
                </button>
                <button onClick={onHistoryClick} className="px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm font-medium hover:bg-slate-700 transition whitespace-nowrap">
                  Lịch Sử Giao Dịch
                </button>
              </div>
            </div>
            <div className="relative -mt-2 pointer-events-none opacity-60 mix-blend-screen h-[120px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBrand" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.28}/>
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} fill="url(#colorBrand)" isAnimationActive={true} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* CINEMATIC 3D DIGITAL TWIN VIEWPORT */}
          <div className="glass-panel rounded-3xl p-6 flex flex-col w-full">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Bản Sao Số · Sơ Đồ Toàn Ảnh</p>
                  <h2 className="text-lg font-semibold mt-0.5">{vehicle?.model || 'EVShare Model X'} — Đơn Vị Đội Xe Chung</h2>
                </div>
                <span className="text-xs font-mono text-brand-400 bg-brand-500/10 border border-brand-500/30 rounded-full px-3 py-1">
                  PL: {vehicle?.licensePlate || 'N/A'}
                </span>
              </div>

              <div className="relative rounded-2xl overflow-hidden h-[420px] bg-slate-950/70 border border-slate-800 flex items-center justify-center group">
                <div className="absolute inset-0 holo-grid opacity-40"></div>
                {/* 3D Car Container with Perspective */}
                <div className="relative z-10 w-[88%] h-[88%] transition-transform duration-700 ease-out group-hover:scale-105" style={{ perspective: '1000px' }}>
                    <Canvas camera={{ position: [-5, 2, 6], fov: 45 }} gl={{ alpha: true }}>
                      <ambientLight intensity={0.5} />
                      <directionalLight position={[10, 10, 5]} intensity={1.5} color="#6366f1" />
                      <directionalLight position={[-10, 10, -5]} intensity={1} color="#14b8a6" />
                      <Environment preset="night" />
                      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                        <CarModel3D />
                      </Float>
                      {/* Floating Contributor Markers */}
                      {coOwners.map((owner, idx) => {
                        const angle = (idx / coOwners.length) * Math.PI * 2;
                        const radius = 3.5;
                        const x = Math.cos(angle) * radius;
                        const z = Math.sin(angle) * radius;
                        return (
                          <ContributorMarker key={owner.id} owner={owner} position={[x, 1, z]} delay={idx * 0.5} />
                        );
                      })}
                      
                      {openVotes.map((vote, idx) => {
                        const angle = (idx / openVotes.length) * Math.PI * 2;
                        const radius = 2.5;
                        const x = Math.cos(angle) * radius;
                        const z = Math.sin(angle) * radius;
                        return (
                          <ProposalMarker 
                            key={vote.id} 
                            vote={vote} 
                            position={[x, 2.5, z]} 
                            delay={idx * 0.7} 
                            isSelected={selectedVoteId === vote.id}
                            onClick={() => setSelectedVoteId(selectedVoteId === vote.id ? null : vote.id)}
                          />
                        );
                      })}
                      
                      {/* Voting Hologram (only visible when active vote) */}
                      {currentVote && (
                        <VotingHologram 
                          currentVote={currentVote} 
                          coOwnersCount={coOwners.length} 
                          onVoteCast={onVoteCast} 
                          onDeleteVote={(id) => {
                            handleDeleteVote(id);
                            setSelectedVoteId(null);
                          }} 
                        />
                      )}

                      <OrbitControls enableZoom={true} enablePan={true} maxPolarAngle={Math.PI/2} minDistance={2} maxDistance={10} />
                    </Canvas>
                </div>

                {/* laser guides */}
                <div className="laser absolute top-[38%] left-[18%] w-[26%] z-0 pointer-events-none"></div>
                <div className="laser absolute top-[58%] right-[22%] w-[22%] z-0 pointer-events-none" style={{ background: 'linear-gradient(270deg,rgba(99,102,241,.7),transparent)' }}></div>

                {/* floating glass overlays */}
                <div className="absolute top-[26%] left-[4%] z-30 glass-panel rounded-2xl px-4 py-2.5 flex items-center gap-3 animate-bounce-slow pointer-events-none">
                  <div className="w-9 h-9 rounded-full border-2 border-brand-500 flex items-center justify-center"><i className="ph-fill ph-battery-charging text-brand-500"></i></div>
                  <div><p className="text-[10px] text-slate-400 uppercase tracking-wide">Trạng Thái Pin</p><p className="text-sm font-bold font-mono text-brand-400">85%</p></div>
                </div>
                <div className="absolute bottom-[10%] right-[4%] z-30 glass-panel rounded-2xl px-4 py-2.5 flex items-center gap-3 animate-bounce-slow pointer-events-none" style={{ animationDelay: '1s' }}>
                  <div className="w-9 h-9 rounded-full border-2 border-teal-500 flex items-center justify-center"><i className="ph-fill ph-road-horizon text-teal-500"></i></div>
                  <div><p className="text-[10px] text-slate-400 uppercase tracking-wide">Quãng Đường Dự Kiến</p><p className="text-sm font-bold font-mono text-teal-400">420 km</p></div>
                </div>
              </div>
            </div>
        </section>
      </main>
    </div>
  );
};

export default GroupCouncil3D;
