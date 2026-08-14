import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Sky, ContactShadows, BakeShadows } from '@react-three/drei';
import VirtualGarage from './VirtualGarage';

/**
 * 🌌 App3D - The Core Spatial Computing Environment
 * Thay thế hoàn toàn kiến trúc DOM 2D truyền thống bằng một môi trường Fullscreen Canvas.
 */
const App3D = ({ onExit }) => {
  return (
    <div className="w-screen h-screen bg-[#0b0f19] fixed inset-0 z-50 overflow-hidden">
      
      {/* Nút thoát khỏi Không gian 3D (Floating DOM UI) */}
      <button 
        onClick={onExit}
        className="absolute top-6 left-6 z-10 bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-white/20 transition-all font-semibold"
      >
        <i className="ph ph-arrow-left text-xl"></i> Thoát Không Gian 3D
      </button>

      {/* R3F WebGL Canvas - Toàn bộ thế giới ảo diễn ra tại đây */}
      <Canvas
        shadows
        camera={{ position: [0, 2, 8], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]} // Performance scaling
      >
        {/* Môi trường Ánh sáng (Lighting Environment) */}
        <color attach="background" args={['#0f172a']} />
        <fog attach="fog" args={['#0f172a', 10, 30]} />
        <ambientLight intensity={0.5} />
        <directionalLight 
          castShadow 
          position={[5, 10, 5]} 
          intensity={1.5} 
          shadow-mapSize={[1024, 1024]}
        />
        <Environment preset="city" />
        <Sky sunPosition={[100, 20, 100]} turbidity={0.1} rayleigh={0.5} />

        {/* Hệ thống tương tác Camera (Spatial Navigation) */}
        <OrbitControls 
          enablePan={false} 
          maxPolarAngle={Math.PI / 2 - 0.05} // Không cho phép nhìn xuyên lòng đất
          minDistance={3}
          maxDistance={15}
        />

        {/* Hệ thống đổ bóng tối ưu (Performance Shadows) */}
        <BakeShadows />
        <ContactShadows position={[0, -0.01, 0]} opacity={0.4} scale={20} blur={2} far={4} />

        {/* Các Component trong Không gian Ảo (Spatial UI & Models) */}
        <Suspense fallback={null}>
          <VirtualGarage />
        </Suspense>

      </Canvas>
    </div>
  );
};

export default App3D;
