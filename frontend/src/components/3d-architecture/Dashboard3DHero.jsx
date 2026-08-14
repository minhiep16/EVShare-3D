import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, BakeShadows, Sky } from '@react-three/drei';
import VirtualGarage from './VirtualGarage';

const Dashboard3DHero = () => {
  return (
    <div className="w-full h-[400px] rounded-3xl overflow-hidden relative shadow-sm border border-slate-200">
      
      <div className="absolute top-4 left-4 z-10 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-white font-bold drop-shadow-md flex items-center gap-2">
        <i className="ph ph-cube text-xl animate-pulse text-brand-400"></i>
        <span>EVShare 3D Command Center</span>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 text-white/70 text-xs font-semibold tracking-widest uppercase flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm pointer-events-none">
        <i className="ph ph-mouse-left"></i> Kéo để Xoay · Cuộn để Zoom
      </div>

      <Canvas
        shadows
        camera={{ position: [0, 3, 10], fov: 40 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#0f172a']} />
        <fog attach="fog" args={['#0f172a', 15, 30]} />
        <ambientLight intensity={0.6} />
        <directionalLight 
          castShadow 
          position={[5, 10, 5]} 
          intensity={1.2} 
          shadow-mapSize={[1024, 1024]}
        />
        <Environment preset="city" />
        
        <OrbitControls 
          enablePan={false} 
          maxPolarAngle={Math.PI / 2 - 0.05} 
          minDistance={4}
          maxDistance={12}
          autoRotate
          autoRotateSpeed={0.5}
        />

        <BakeShadows />
        <ContactShadows position={[0, -0.01, 0]} opacity={0.5} scale={20} blur={2} far={4} />

        <Suspense fallback={null}>
          <VirtualGarage />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Dashboard3DHero;
