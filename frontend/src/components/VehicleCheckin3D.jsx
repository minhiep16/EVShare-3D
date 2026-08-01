import React, { useRef, useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box, Environment, ContactShadows, Text, Html, useProgress } from '@react-three/drei';

const Loader = () => {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center text-white bg-slate-900/80 px-6 py-4 rounded-xl backdrop-blur-md">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="font-semibold">{progress.toFixed(0)}% Loading...</p>
      </div>
    </Html>
  );
};

const CarModel = ({ onClickPart }) => {
  // TODO: When real 3D model is ready, uncomment this and install @react-three/drei's useGLTF
  // const { scene } = useGLTF('/car_model_compressed.glb'); // Compressed with Draco
  // return <primitive object={scene} onClick={(e) => { ... }} />
  
  // For now, returning a blocky representation of a car.
  return (
    <group>
      {/* Main Body */}
      <Box 
        args={[2, 0.8, 4.5]} 
        position={[0, 0.6, 0]} 
        castShadow 
        onClick={(e) => { e.stopPropagation(); onClickPart('Thân xe (Cánh cửa/Sườn xe)'); }}
      >
        <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.8} />
      </Box>

      {/* Cabin/Roof */}
      <Box 
        args={[1.8, 0.6, 2.2]} 
        position={[0, 1.3, -0.2]} 
        castShadow
        onClick={(e) => { e.stopPropagation(); onClickPart('Nóc xe / Kính lái'); }}
      >
        <meshStandardMaterial color="#000000" roughness={0.1} metalness={0.9} transparent opacity={0.8} />
      </Box>

      {/* Wheels */}
      {[
        [-1.1, 0.3, 1.5], [1.1, 0.3, 1.5], 
        [-1.1, 0.3, -1.5], [1.1, 0.3, -1.5]
      ].map((pos, idx) => (
        <mesh 
          key={idx} 
          position={pos} 
          rotation={[Math.PI / 2, 0, 0]} 
          castShadow
          onClick={(e) => { e.stopPropagation(); onClickPart(`Bánh xe ${idx + 1}`); }}
        >
          <cylinderGeometry args={[0.3, 0.3, 0.2, 32]} />
          <meshStandardMaterial color="#333333" roughness={0.9} />
        </mesh>
      ))}

      <Text position={[0, 0.6, 2.3]} fontSize={0.2} color="white">EVShare</Text>
    </group>
  );
};

const VehicleCheckin3D = () => {
  const [selectedPart, setSelectedPart] = useState(null);
  const [damages, setDamages] = useState([]);
  const [notes, setNotes] = useState('');

  const handlePartClick = (partName) => {
    setSelectedPart(partName);
  };

  const addDamage = () => {
    if (selectedPart && notes) {
      setDamages([...damages, { part: selectedPart, notes, timestamp: new Date().toISOString() }]);
      setNotes('');
      setSelectedPart(null);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6">
      {/* 3D Viewer */}
      <div className="flex-1 bg-slate-900 rounded-2xl overflow-hidden relative shadow-lg min-h-[500px]">
        <div className="absolute top-4 left-4 z-10 bg-slate-800/80 backdrop-blur-md px-4 py-2 rounded-lg text-white">
          <h3 className="font-bold">Không gian 3D Check-in</h3>
          <p className="text-xs text-slate-300">Dùng chuột xoay, kéo, và click vào bộ phận xe để đánh dấu lỗi.</p>
        </div>
        
        <Canvas shadows camera={{ position: [4, 3, 5], fov: 45 }}>
          <color attach="background" args={['#0f172a']} />
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
          <Environment preset="city" />
          
          <Suspense fallback={<Loader />}>
            <CarModel onClickPart={handlePartClick} />
            <ContactShadows position={[0, 0, 0]} opacity={0.5} scale={10} blur={2} far={4} />
          </Suspense>
          
          <OrbitControls makeDefault autoRotate autoRotateSpeed={0.5} />
        </Canvas>
      </div>

      {/* Control Panel */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        {selectedPart ? (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-lg mb-2">Đánh dấu hư hỏng</h3>
            <p className="text-sm font-medium text-brand-600 mb-4 bg-brand-50 px-3 py-1.5 rounded-md inline-block">
              {selectedPart}
            </p>
            
            <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả tình trạng</label>
            <textarea 
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all mb-3"
              rows="3"
              placeholder="Vd: Trầy xước dài 5cm..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            
            <div className="flex gap-2">
              <button 
                onClick={addDamage}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 rounded-lg transition-colors"
              >
                Ghi nhận lỗi
              </button>
              <button 
                onClick={() => setSelectedPart(null)}
                className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 rounded-lg transition-colors"
              >
                Hủy
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 text-center flex flex-col items-center justify-center min-h-[200px]">
            <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-3">
              <i className="ph ph-hand-pointing text-xl"></i>
            </div>
            <p className="text-sm text-slate-500">Click vào bộ phận xe trên mô hình 3D để bắt đầu kiểm tra.</p>
          </div>
        )}

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex-1 overflow-y-auto">
          <h3 className="font-bold text-lg mb-4 flex items-center justify-between">
            Lịch sử lỗi 
            <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">{damages.length}</span>
          </h3>
          
          {damages.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">Chưa ghi nhận hư hỏng nào.</p>
          ) : (
            <div className="space-y-3">
              {damages.map((dmg, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-100 p-3 rounded-lg text-sm">
                  <p className="font-semibold text-ink">{dmg.part}</p>
                  <p className="text-slate-500 mt-1">{dmg.notes}</p>
                  <p className="text-xs text-slate-400 mt-2">{new Date(dmg.timestamp).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
          
          <button className="w-full mt-4 bg-brand-500 hover:bg-brand-600 text-white font-medium py-2.5 rounded-lg transition-colors shadow-sm">
            Hoàn tất Check-in
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleCheckin3D;
