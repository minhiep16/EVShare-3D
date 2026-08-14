import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Float, Environment, Line, Sphere, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// --- Sub-components for 3D Scene ---

const CentralCore = () => {
  const coreRef = useRef();
  
  useFrame((state) => {
    if (coreRef.current) {
      coreRef.current.rotation.y += 0.01;
      coreRef.current.rotation.x += 0.005;
    }
  });

  return (
    <group ref={coreRef}>
      {/* Outer energy shield */}
      <Sphere args={[1.5, 32, 32]}>
        <meshPhysicalMaterial 
          color="#3b82f6" 
          transparent 
          opacity={0.2} 
          roughness={0} 
          metalness={1} 
          transmission={0.9} 
          ior={1.5}
        />
      </Sphere>
      {/* Inner glowing core */}
      <Sphere args={[0.8, 32, 32]}>
        <meshBasicMaterial color="#60a5fa" wireframe />
      </Sphere>
      <Sparkles count={50} scale={4} size={2} speed={0.4} color="#93c5fd" />
    </group>
  );
};

const SatelliteNode = ({ index, total, owner }) => {
  // Calculate position in a circle around the center
  const radius = 4;
  const angle = (index / total) * Math.PI * 2;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  
  // A subtle floating effect
  return (
    <group>
      {/* Connection line to center */}
      <Line 
        points={[[0, 0, 0], [x, 0, z]]}
        color="#3b82f6"
        opacity={0.3}
        transparent
        lineWidth={1}
        dashed={true}
        dashSize={0.2}
        gapSize={0.1}
      />
      
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5} position={[x, 0, z]}>
        {/* Node visual marker */}
        <mesh position={[0, 0, 0]}>
          <octahedronGeometry args={[0.3, 0]} />
          <meshStandardMaterial color={owner.ownershipPercentage >= 40 ? "#22c55e" : "#3b82f6"} metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* Spatial UI Card */}
        <Html position={[0, 0.8, 0]} transform sprite distanceFactor={6}>
          <div className="w-48 bg-slate-900/80 backdrop-blur-md border border-white/20 rounded-xl p-3 shadow-2xl flex flex-col items-center text-center">
            <img 
              src={owner.avatarUrl || 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg'} 
              alt={owner.name} 
              className={`w-12 h-12 rounded-full mb-2 border-2 ${owner.ownershipPercentage >= 40 ? 'border-green-500' : 'border-blue-500'}`}
            />
            <p className="text-sm font-bold text-white truncate w-full">{owner.name || owner.username}</p>
            <div className="flex items-center gap-1 mt-1">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${owner.ownershipPercentage >= 40 ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                {owner.ownershipPercentage}% Cổ phần
              </span>
            </div>
            {owner.ownershipPercentage >= 40 && (
              <span className="text-[9px] mt-1 text-green-400 uppercase tracking-widest font-black">Group Admin</span>
            )}
          </div>
        </Html>
      </Float>
    </group>
  );
};

const VotingTerminal = ({ activeVotes, onVoteClick }) => {
  if (!activeVotes || activeVotes.length === 0) return null;

  return (
    <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2} position={[0, 3, 0]}>
      <Html transform center distanceFactor={8} className="pointer-events-none">
        <div className="w-80 bg-amber-900/30 backdrop-blur-xl border border-amber-500/40 rounded-2xl p-4 shadow-[0_0_30px_rgba(245,158,11,0.2)] pointer-events-auto">
          <div className="flex items-center gap-2 border-b border-amber-500/20 pb-2 mb-3">
            <i className="ph-fill ph-warning-circle text-amber-500 text-xl animate-pulse"></i>
            <h3 className="text-amber-500 font-bold uppercase tracking-wider text-sm">Trạm Bỏ Phiếu (Active Votes)</h3>
          </div>
          
          <div className="space-y-3">
            {activeVotes.map((vote) => (
              <div key={vote.id} className="bg-black/40 rounded-xl p-3 border border-amber-500/20">
                <p className="text-sm text-white font-medium mb-3">{vote.description}</p>
                {vote.status === 'OPEN' ? (
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onVoteClick(vote.id, true); }}
                      className="flex-1 bg-green-500/20 hover:bg-green-500 text-green-400 hover:text-white border border-green-500/30 hover:border-green-500 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      ĐỒNG Ý
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onVoteClick(vote.id, false); }}
                      className="flex-1 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 hover:border-red-500 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      TỪ CHỐI
                    </button>
                  </div>
                ) : (
                  <div className="text-center bg-slate-800/50 py-1.5 rounded-lg border border-slate-700">
                    <span className="text-xs text-slate-400 font-bold">ĐÃ ĐÓNG</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Html>
    </Float>
  );
};

// --- Main Component ---

const CoOwners3D = ({ coOwners, activeVotes, onVoteClick }) => {
  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-700 shadow-xl overflow-hidden h-[450px] relative">
      {/* 2D Overlay Title */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <h3 className="text-white font-bold text-lg flex items-center gap-2 drop-shadow-md">
          <i className="ph-fill ph-users-three text-brand-400"></i>
          Mạng lưới Đồng Sở Hữu 3D
        </h3>
        <p className="text-slate-400 text-xs mt-1">Sử dụng chuột để xoay và tương tác không gian</p>
      </div>

      <Canvas camera={{ position: [0, 4, 10], fov: 45 }}>
        <color attach="background" args={['#0b1120']} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} />
        <Environment preset="city" />
        
        <OrbitControls 
          enablePan={true}
          autoRotate={true}
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2 + 0.1}
          minDistance={3}
          maxDistance={15}
        />

        <group position={[0, -0.5, 0]}>
          {/* Cyberpunk Grid Floor */}
          <gridHelper args={[20, 20, '#1e293b', '#0f172a']} position={[0, -1.5, 0]} />
          
          <CentralCore />
          
          {/* Render all Co-owners in an orbit */}
          {coOwners.map((owner, idx) => (
            <SatelliteNode 
              key={owner.id} 
              index={idx} 
              total={coOwners.length} 
              owner={owner} 
            />
          ))}

          <VotingTerminal activeVotes={activeVotes} onVoteClick={onVoteClick} />
        </group>
      </Canvas>
    </div>
  );
};

export default CoOwners3D;
