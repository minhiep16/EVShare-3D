import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import CarModel3D from './CarModel3D';



const DigitalTwinDispute = ({ dispute, onClose, onSolve }) => {
  const [penalty, setPenalty] = React.useState('');
  const [accusedId, setAccusedId] = React.useState('');

  if (!dispute) return null;

  // Simple keyword matching algorithm
  const desc = (dispute.desc || '').toLowerCase();
  let damageLocation = null;
  if (desc.includes('cửa trái') || desc.includes('bên trái')) damageLocation = 'left';
  else if (desc.includes('cửa phải') || desc.includes('bên phải')) damageLocation = 'right';
  else if (desc.includes('bánh') || desc.includes('lốp')) damageLocation = 'wheel';
  else if (desc.includes('đầu xe') || desc.includes('cản trước') || desc.includes('xước đầu')) damageLocation = 'front';
  else if (desc.includes('đuôi xe') || desc.includes('sau xe')) damageLocation = 'back';
  else if (desc.includes('kính') || desc.includes('nóc')) damageLocation = 'roof';

  // Mock up vehicle object from string
  const vehicleObj = {
    model: dispute.car,
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-slate-900/60 backdrop-blur-md">
      <div className="w-full max-w-6xl h-[85vh] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col md:flex-row relative animate-in zoom-in-95 duration-300">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 z-50 w-10 h-10 bg-black/40 hover:bg-red-500 rounded-full text-white flex items-center justify-center transition-colors border border-white/10 backdrop-blur-md cursor-pointer">
          <i className="ph ph-x text-lg"></i>
        </button>

        {/* 3D Canvas Area (Left Side) */}
        <div className="w-full md:w-2/3 h-64 md:h-full relative bg-gradient-to-b from-slate-800 to-slate-950 border-b md:border-b-0 md:border-r border-slate-700">
          
          <div className="absolute top-6 left-6 z-10 pointer-events-none">
            <h3 className="text-white text-xl font-bold font-mono tracking-tight flex items-center gap-2">
              <i className="ph-fill ph-target text-red-500"></i> DIGITAL TWIN SCAN
            </h3>
            <p className="text-slate-400 text-sm mt-1">
              Phân tích 3D: <span className="text-brand-400 font-bold">{dispute.car} ({dispute.plate})</span>
            </p>
          </div>

          <div className="absolute bottom-6 left-6 z-10 flex gap-2 pointer-events-none">
             <div className="bg-black/50 border border-slate-600 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300">
                AI SCAN: {damageLocation ? <span className="text-red-400">DETECTED</span> : <span className="text-green-400">CLEAN</span>}
             </div>
          </div>

          <Canvas
            shadows
            camera={{ position: [0, 5, 10], fov: 45 }}
            gl={{ antialias: true }}
            dpr={[1, 2]}
          >
            <color attach="background" args={['#0b0f19']} />
            <ambientLight intensity={0.5} />
            <directionalLight castShadow position={[5, 10, 5]} intensity={1.5} shadow-mapSize={[2048, 2048]} />
            <Environment preset="city" />

            <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2 - 0.1} minDistance={4} maxDistance={15} />
            <ContactShadows position={[0, -0.01, 0]} opacity={0.7} scale={20} blur={2.5} far={4} />

            <Suspense fallback={null}>
              <CarModel3D damageLocation={damageLocation} vehicle={vehicleObj} />
            </Suspense>
          </Canvas>
        </div>

        {/* Dispute Details & Resolution Panel (Right Side) */}
        <div className="w-full md:w-1/3 h-full bg-slate-900 flex flex-col p-6 overflow-y-auto">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                dispute.priority === 'Ưu tiên cao' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {dispute.priority}
              </span>
              <span className="text-slate-500 text-xs font-mono">{dispute.id}</span>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">{dispute.title}</h2>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed bg-slate-800/50 p-3 rounded-lg border border-slate-700">
              {dispute.desc}
            </p>

            <div className="flex items-center gap-3 p-3 bg-black/40 rounded-xl border border-slate-700 mb-8">
              <img src={dispute.complainantAvatar || 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg'} className="w-10 h-10 rounded-full" alt="avatar" />
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wider">Người báo cáo</p>
                <p className="text-white font-semibold text-sm">{dispute.complainant}</p>
              </div>
            </div>

            {/* Resolution Form */}
            <h3 className="text-brand-400 font-bold mb-4 flex items-center gap-2">
              <i className="ph-fill ph-gavel"></i> QUYẾT ĐỊNH PHÂN XỬ
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">ID Người vi phạm (Nếu có)</label>
                <input 
                  type="number" 
                  value={accusedId} 
                  onChange={(e) => setAccusedId(e.target.value)}
                  placeholder="Ví dụ: 2"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Tiền phạt (VNĐ)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">₫</span>
                  <input 
                    type="number" 
                    value={penalty} 
                    onChange={(e) => setPenalty(e.target.value)}
                    placeholder="0"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-4 py-2.5 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all outline-none font-mono text-lg font-bold"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Để trống nếu chỉ cảnh cáo.</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800">
            <button 
              onClick={() => onSolve(dispute, penalty, accusedId)}
              className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3.5 rounded-xl shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <i className="ph-fill ph-check-circle text-lg"></i> Thi hành Quyết định
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DigitalTwinDispute;
