import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box, Environment, ContactShadows, Text, Html, useProgress } from '@react-three/drei';
import { getVehicleGroups, checkoutVehicle, checkinVehicle, getAdminCheckinLogs } from '../services/api';

const Loader = () => {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center text-white bg-slate-900/80 px-6 py-4 rounded-xl backdrop-blur-md">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="font-semibold text-sm">{progress.toFixed(0)}% Loading 3D Engine...</p>
      </div>
    </Html>
  );
};

const CarModel = ({ onClickPart }) => {
  return (
    <group>
      {/* Main Body */}
      <Box 
        args={[2, 0.8, 4.5]} 
        position={[0, 0.6, 0]} 
        castShadow 
        onClick={(e) => { e.stopPropagation(); onClickPart('Thân xe (Cánh cửa/Sườn xe)'); }}
        onPointerOver={(e) => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={(e) => { document.body.style.cursor = 'auto'; }}
      >
        <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.8} />
      </Box>

      {/* Cabin/Roof */}
      <Box 
        args={[1.8, 0.6, 2.2]} 
        position={[0, 1.3, -0.2]} 
        castShadow
        onClick={(e) => { e.stopPropagation(); onClickPart('Nóc xe / Kính lái'); }}
        onPointerOver={(e) => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={(e) => { document.body.style.cursor = 'auto'; }}
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
          onPointerOver={(e) => { document.body.style.cursor = 'pointer'; }}
          onPointerOut={(e) => { document.body.style.cursor = 'auto'; }}
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
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [mode, setMode] = useState('CHECKIN'); // CHECKIN (Nhận xe) or CHECKOUT (Giao xe)
  const [selectedPart, setSelectedPart] = useState(null);
  const [damages, setDamages] = useState([]);
  const [notes, setNotes] = useState('');
  const [severity, setSeverity] = useState('LIGHT');
  const [battery, setBattery] = useState(100);
  const [odo, setOdo] = useState(0);
  const [timestamp, setTimestamp] = useState(() => {
    const tzOffset = new Date().getTimezoneOffset() * 60000;
    return new Date(Date.now() - tzOffset).toISOString().slice(0, 16);
  });
  const [submitting, setSubmitting] = useState(false);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [activeTrips, setActiveTrips] = useState([]);

  useEffect(() => {
    fetchVehicles();
    fetchHistory();
    checkActiveTrips();
    
    window.addEventListener('evshare_trip_update', checkActiveTrips);
    return () => window.removeEventListener('evshare_trip_update', checkActiveTrips);
  }, []);

  const checkActiveTrips = () => {
    const saved = localStorage.getItem('evshare_activeTrips');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setActiveTrips(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        setActiveTrips([]);
      }
    } else {
      setActiveTrips([]);
    }
  };

  const idleVehicles = vehicles.filter(v => !activeTrips.find(t => t.vehicleId.toString() === v.vehicle.id.toString()));
  const runningVehicles = vehicles.filter(v => activeTrips.find(t => t.vehicleId.toString() === v.vehicle.id.toString()));

  const selectVehicleForMode = (vid, m) => {
    setMode(m);
    setSelectedVehicleId(vid);
    const vData = vehicles.find(x => x.vehicle.id.toString() === vid.toString());
    if (vData) {
      setBattery(vData.vehicle.batteryPercentage);
      setOdo(vData.vehicle.odometer);
      
      if (m === 'CHECKIN') {
        const trip = activeTrips.find(t => t.vehicleId.toString() === vid.toString());
        if (trip && trip.userId) {
          setSelectedUserId(trip.userId);
        } else if (vData.members && vData.members.length > 0) {
          setSelectedUserId(vData.members[0].id);
        }
      } else {
        if (vData.members && vData.members.length > 0) {
          setSelectedUserId(vData.members[0].id);
        } else {
          setSelectedUserId('');
        }
      }
    }
  };

  const fetchHistory = async () => {
    try {
      const data = await getAdminCheckinLogs();
      setHistoryLogs(data);
    } catch (err) {
      console.error("Failed to load history logs", err);
    }
  };

  const fetchVehicles = async () => {
    try {
      const data = await getVehicleGroups();
      setVehicles(data);
      if (data && data.length > 0) {
        const firstVehicle = data[0].vehicle;
        setSelectedVehicleId(firstVehicle.id);
        if (data[0].members && data[0].members.length > 0) {
          setSelectedUserId(data[0].members[0].id);
        }
        setBattery(firstVehicle.batteryPercentage);
        setOdo(firstVehicle.odometer);
      }
    } catch (err) {
      console.error("Failed to load vehicles:", err);
    }
  };

  const handlePartClick = (partName) => {
    setSelectedPart(partName);
  };

  const addDamage = () => {
    if (selectedPart && notes) {
      setDamages([...damages, { part: selectedPart, notes, severity, timestamp: new Date().toISOString() }]);
      setNotes('');
      setSeverity('LIGHT');
      setSelectedPart(null);
    }
  };

  const removeDamage = (index) => {
    setDamages(damages.filter((_, i) => i !== index));
  };

  const selectedVehicleData = vehicles.find(v => v.vehicle.id.toString() === selectedVehicleId.toString());
  const vehicleObj = selectedVehicleData?.vehicle;
  const vehicleMembers = selectedVehicleData?.members || [];

  const handleSubmit = async () => {
    if (!selectedVehicleId || !selectedUserId) {
      alert("Vui lòng chọn xe và người dùng!");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        userId: selectedUserId,
        batteryPercentage: battery,
        odometer: odo,
        damages: JSON.stringify(damages),
        timestamp: timestamp
      };

      if (mode === 'CHECKOUT') {
        const isRunning = activeTrips.some(t => t.vehicleId.toString() === selectedVehicleId.toString());
        if (isRunning) {
          alert("Xe này đang được giao cho người khác. Không thể giao xe!");
          setSubmitting(false);
          return;
        }

        await checkoutVehicle(selectedVehicleId, payload);
        const userName = vehicleMembers.find(m => m.id.toString() === selectedUserId.toString())?.name || "Thành viên";
        
        let existing = [];
        try { existing = JSON.parse(localStorage.getItem('evshare_activeTrips') || '[]'); if (!Array.isArray(existing)) existing = []; } catch(e) {}
        
        // Remove any existing trip for this vehicle just in case
        existing = existing.filter(t => t.vehicleId.toString() !== selectedVehicleId.toString());
        
        existing.push({
          vehicleId: selectedVehicleId,
          vehiclePlate: vehicleObj?.licensePlate || vehicleObj?.model,
          userId: selectedUserId,
          userName: userName,
          startTime: timestamp
        });
        
        localStorage.setItem('evshare_activeTrips', JSON.stringify(existing));
        window.dispatchEvent(new Event('evshare_trip_update'));
        
        alert(`Đã hoàn tất Giao xe (Check-out) thành công!\nXe: ${vehicleObj?.licensePlate}\nPin: ${battery}%\nODO: ${odo} km\nNgười nhận: ${userName}`);
      } else {
        const res = await checkinVehicle(selectedVehicleId, payload);
        const cost = res.cost || 0;
        
        let existing = [];
        try { existing = JSON.parse(localStorage.getItem('evshare_activeTrips') || '[]'); if (!Array.isArray(existing)) existing = []; } catch(e) {}
        
        const filtered = existing.filter(t => t.vehicleId.toString() !== selectedVehicleId.toString());
        localStorage.setItem('evshare_activeTrips', JSON.stringify(filtered));
        window.dispatchEvent(new Event('evshare_trip_update'));
        
        alert(`Đã hoàn tất Nhận xe (Check-in) thành công!\nXe: ${vehicleObj?.licensePlate}\nPin: ${battery}%\nODO: ${odo} km\nNgười trả: ${vehicleMembers.find(m => m.id.toString() === selectedUserId.toString())?.name}\n\nChi phí phát sinh (nếu có): ${cost.toLocaleString()} VNĐ`);
      }
      setDamages([]);
      fetchVehicles();
      fetchHistory();
    } catch (err) {
      console.error(err);
      alert(err.response?.data || "Đã xảy ra lỗi");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6">
      {/* 3D Viewer Area */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Top bar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-bold text-lg text-ink flex items-center gap-2">
            <i className="ph-fill ph-car-profile text-brand-500 text-xl"></i>
            Hệ thống Giao / Nhận xe 3D
          </h2>
          
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setMode('CHECKIN')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${mode !== 'HISTORY' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <i className="ph ph-cube mr-2"></i>Mô hình 3D
            </button>
            <button 
              onClick={() => setMode('HISTORY')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'HISTORY' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <i className="ph ph-clock-counter-clockwise mr-2"></i>Lịch sử
            </button>
          </div>
        </div>

        {/* Vehicle Status Panel */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-sm text-slate-700 mb-3 uppercase tracking-wider">Trạng thái xe hiện tại</h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Xe Trống */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">XE TRỐNG (SẴN SÀNG GIAO)</span>
                <span className="bg-white px-2 py-0.5 rounded-full text-xs font-bold text-slate-600 shadow-sm">{idleVehicles.length}</span>
              </div>
              <div className="space-y-2 max-h-[150px] overflow-y-auto">
                {idleVehicles.map(v => (
                  <button key={v.vehicle.id} onClick={() => selectVehicleForMode(v.vehicle.id, 'CHECKOUT')} className="w-full text-left bg-white border border-slate-200 hover:border-brand-300 p-2 rounded-lg text-sm transition-colors flex justify-between items-center group">
                    <span className="font-bold text-ink">{v.vehicle.licensePlate}</span>
                    <i className="ph ph-sign-out text-slate-400 group-hover:text-brand-500"></i>
                  </button>
                ))}
                {idleVehicles.length === 0 && <p className="text-xs text-slate-400 text-center py-2">Không có xe trống</p>}
              </div>
            </div>
            
            {/* Xe Đang Chạy */}
            <div className="bg-brand-50 rounded-xl p-3 border border-brand-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-brand-700">ĐANG CHẠY (CHỜ NHẬN)</span>
                <span className="bg-white px-2 py-0.5 rounded-full text-xs font-bold text-brand-600 shadow-sm">{runningVehicles.length}</span>
              </div>
              <div className="space-y-2 max-h-[150px] overflow-y-auto">
                {runningVehicles.map(v => {
                  const tripInfo = activeTrips.find(t => t.vehicleId.toString() === v.vehicle.id.toString());
                  return (
                    <button key={v.vehicle.id} onClick={() => selectVehicleForMode(v.vehicle.id, 'CHECKIN')} className="w-full text-left bg-white border border-brand-200 hover:border-brand-400 p-2 rounded-lg text-sm transition-colors flex justify-between items-center group shadow-sm shadow-brand-500/5">
                      <div>
                        <span className="font-bold text-brand-700 block">{v.vehicle.licensePlate}</span>
                        <span className="text-[10px] text-brand-500/80 font-medium block">{tripInfo?.userName}</span>
                      </div>
                      <i className="ph ph-sign-in text-brand-400 group-hover:text-brand-600 text-lg"></i>
                    </button>
                  );
                })}
                {runningVehicles.length === 0 && <p className="text-xs text-brand-400/70 text-center py-2">Không có xe đang chạy</p>}
              </div>
            </div>
          </div>
        </div>

        {/* 3D Canvas OR History */}
        {mode === 'HISTORY' ? (
          <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[450px]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-ink">Lịch sử Giao/Nhận xe</h3>
              <span className="text-xs bg-slate-100 text-slate-500 px-3 py-1 rounded-full font-bold">{historyLogs.length} giao dịch</span>
            </div>
            <div className="flex-1 overflow-auto p-0">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-xs uppercase">Thời gian</th>
                    <th className="px-4 py-3 font-semibold text-xs uppercase">Người dùng</th>
                    <th className="px-4 py-3 font-semibold text-xs uppercase">Loại</th>
                    <th className="px-4 py-3 font-semibold text-xs uppercase">Biển số</th>
                    <th className="px-4 py-3 font-semibold text-xs uppercase">ODO/Pin</th>
                    <th className="px-4 py-3 font-semibold text-xs uppercase">Chi phí phạt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {historyLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString('vi-VN')}
                      </td>
                      <td className="px-4 py-3 font-semibold text-ink">{log.userName || "Hệ thống"}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${log.type === 'CHECKIN' ? 'bg-brand-50 text-brand-600' : 'bg-blue-50 text-blue-600'}`}>
                          {log.type === 'CHECKIN' ? 'Nhận xe' : 'Giao xe'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold">{log.vehiclePlate ? `${log.vehicleModel || 'Xe'} - ${log.vehiclePlate}` : (log.vehicle?.licensePlate || "Xe mặc định")}</td>
                      <td className="px-4 py-3 text-slate-600 text-xs">
                        <span className="text-blue-600 font-bold">{log.odometer} km</span> <br/>
                        <span className="text-brand-600 font-bold">{log.batteryPercentage}% pin</span>
                      </td>
                      <td className="px-4 py-3 font-bold text-red-500">
                        {log.cost > 0 ? log.cost.toLocaleString() + 'đ' : '-'}
                      </td>
                    </tr>
                  ))}
                  {historyLogs.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-slate-400">Không có dữ liệu lịch sử</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-slate-900 rounded-2xl overflow-hidden relative shadow-lg min-h-[450px]">
            <div className="absolute top-4 left-4 z-10">
              <div className="bg-slate-800/80 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 text-white flex flex-col gap-1 shadow-2xl">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <i className="ph-fill ph-cube text-brand-400"></i> Scanner 3D
                </h3>
                <p className="text-xs text-slate-300">Dùng chuột xoay, kéo, và click trực tiếp vào bộ phận xe để ghi nhận tình trạng.</p>
              </div>
            </div>
            
            <Canvas shadows camera={{ position: [5, 4, 6], fov: 45 }}>
              <color attach="background" args={['#0f172a']} />
              <ambientLight intensity={0.5} />
              <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
              <Environment preset="city" />
              
              <Suspense fallback={<Loader />}>
                <CarModel onClickPart={handlePartClick} />
                <ContactShadows position={[0, 0, 0]} opacity={0.6} scale={12} blur={2.5} far={4} />
              </Suspense>
              
              <OrbitControls makeDefault autoRotate autoRotateSpeed={0.5} enablePan={false} maxPolarAngle={Math.PI/2 + 0.1}/>
            </Canvas>
          </div>
        )}
      </div>

      {/* Control Panel - Only show if not HISTORY */}
      {mode !== 'HISTORY' && (
      <div className="w-full lg:w-96 flex flex-col gap-4">
        
        {/* Vehicle Stats Input */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <div className="mb-5 pb-4 border-b border-slate-100">
            <h3 className={`font-bold text-lg flex items-center gap-2 mb-2 ${mode === 'CHECKIN' ? 'text-brand-600' : 'text-blue-600'}`}>
              <i className={mode === 'CHECKIN' ? 'ph-fill ph-sign-in' : 'ph-fill ph-sign-out'}></i> 
              THỦ TỤC {mode === 'CHECKIN' ? 'NHẬN XE' : 'GIAO XE'}
            </h3>
            <p className="text-sm font-bold text-ink bg-slate-50 p-2 rounded-lg border border-slate-200 inline-block">
              {vehicleObj?.licensePlate} - {vehicleObj?.model}
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-500 mb-1">Thành viên {mode === 'CHECKIN' ? 'trả xe' : 'nhận xe'}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="ph ph-user text-slate-400"></i>
              </div>
              <select 
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                disabled={mode === 'CHECKIN'}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-ink focus:outline-none focus:ring-2 focus:border-brand-500 disabled:bg-slate-50 disabled:text-slate-500"
              >
                {vehicleMembers.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name || "Không rõ tên"}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2 text-slate-700 mt-5">
            <i className="ph-fill ph-gauge text-slate-400"></i> Thông số kỹ thuật
          </h3>
          
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-500 mb-1">Ngày giờ {mode === 'CHECKIN' ? 'Nhận xe' : 'Giao xe'}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="ph ph-calendar-blank text-brand-500"></i>
              </div>
              <input 
                type="datetime-local" 
                value={timestamp}
                onChange={(e) => setTimestamp(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-ink focus:outline-none focus:ring-2 focus:border-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Mức Pin (%)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="ph ph-battery-full text-brand-500"></i>
                </div>
                <input 
                  type="number" 
                  min="0" max="100"
                  value={battery}
                  onChange={(e) => setBattery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-ink focus:outline-none focus:ring-2 focus:border-brand-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Số ODO (km)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="ph ph-speedometer text-blue-500"></i>
                </div>
                <input 
                  type="number" 
                  value={odo}
                  onChange={(e) => setOdo(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-ink focus:outline-none focus:ring-2 focus:border-brand-500"
                />
              </div>
            </div>
          </div>
        </div>

        {selectedPart ? (
          <div className="bg-brand-50 p-5 rounded-2xl shadow-sm border border-brand-200 animate-fade-in-up">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-brand-800 flex items-center gap-2">
                <i className="ph-fill ph-warning-circle text-brand-600 text-lg"></i>
                Ghi nhận tình trạng
              </h3>
              <button onClick={() => setSelectedPart(null)} className="text-brand-400 hover:text-brand-600">
                <i className="ph ph-x font-bold"></i>
              </button>
            </div>
            
            <p className="text-sm font-bold text-white mb-4 bg-brand-600 px-3 py-1.5 rounded-lg inline-block shadow-sm shadow-brand-500/20">
              {selectedPart}
            </p>
            
            <label className="block text-xs font-semibold text-brand-700 mb-1">Mô tả chi tiết</label>
            <textarea 
              className="w-full border border-brand-200 bg-white rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all mb-3 placeholder-brand-300"
              rows="2"
              placeholder="Vd: Trầy xước dài 5cm, móp nhẹ..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            
            <label className="block text-xs font-semibold text-brand-700 mb-1">Mức độ hư hỏng (Phụ phí)</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full border border-brand-200 bg-white rounded-lg p-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all mb-4 text-brand-800 font-medium"
            >
              <option value="LIGHT">Nhẹ (Trầy xước) + 500k</option>
              <option value="MEDIUM">Vừa (Móp méo) + 2Tr</option>
              <option value="HEAVY">Nặng (Vỡ/Hỏng) + 5Tr</option>
            </select>
            
            <button 
              onClick={addDamage}
              disabled={!notes.trim()}
              className={`w-full font-bold py-2.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${notes.trim() ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/30' : 'bg-brand-200 text-brand-400 cursor-not-allowed shadow-none'}`}
            >
              <i className="ph ph-plus-circle text-lg"></i> Thêm vào danh sách
            </button>
          </div>
        ) : (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 text-center flex flex-col items-center justify-center min-h-[120px] cursor-pointer hover:border-brand-300 transition-colors">
            <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-2">
              <i className="ph ph-hand-pointing text-xl"></i>
            </div>
            <p className="text-sm text-slate-500 font-medium">Click vào mô hình 3D để thêm tình trạng</p>
          </div>
        )}

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex-1 overflow-y-auto flex flex-col">
          <h3 className="font-bold text-base mb-4 flex items-center justify-between">
            Tình trạng xe
            <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full font-bold">{damages.length} mục</span>
          </h3>
          
          <div className="flex-1">
            {damages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                <i className="ph ph-check-circle text-4xl text-green-500 mb-2"></i>
                <p className="text-sm text-slate-500">Chưa ghi nhận vấn đề nào.</p>
                <p className="text-xs text-slate-400">Tình trạng xe hoàn hảo</p>
              </div>
            ) : (
              <div className="space-y-3">
                {damages.map((dmg, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200 p-3 rounded-xl relative group">
                    <button 
                      onClick={() => removeDamage(idx)}
                      className="absolute top-3 right-3 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <i className="ph-fill ph-trash"></i>
                    </button>
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-bold text-ink pr-6">{dmg.part}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${dmg.severity === 'HEAVY' ? 'bg-red-100 text-red-600' : (dmg.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600')}`}>
                        {dmg.severity === 'HEAVY' ? 'Nặng' : (dmg.severity === 'MEDIUM' ? 'Vừa' : 'Nhẹ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 bg-white p-2 rounded-lg border border-slate-100">
                      {dmg.notes}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-2 font-medium">{new Date(dmg.timestamp).toLocaleTimeString('vi-VN')} - {new Date(dmg.timestamp).toLocaleDateString('vi-VN')}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <button 
            onClick={handleSubmit}
            disabled={submitting}
            className={`w-full mt-4 font-bold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${
              submitting ? 'bg-slate-400 cursor-not-allowed shadow-none' : 
              mode === 'CHECKIN' ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-brand-500/20' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
            }`}
          >
            {submitting ? (
              <><i className="ph ph-spinner animate-spin text-xl"></i> Đang xử lý...</>
            ) : (
              <><i className="ph ph-check-square-offset text-xl"></i> Hoàn tất {mode === 'CHECKIN' ? 'Nhận xe' : 'Giao xe'}</>
            )}
          </button>
          
          {mode === 'CHECKIN' && damages.length > 0 && (
            <button 
              onClick={async () => {
                const title = prompt("Nhập tiêu đề sự cố:");
                if (!title) return;
                try {
                  setSubmitting(true);
                  const token = localStorage.getItem('evshare_jwt_token');
                  const desc = damages.map(d => `- ${d.part} (${d.severity}): ${d.notes}`).join('\n');
                  const imgUrl = prompt("Nhập link ảnh bằng chứng (nếu có):", "https://img.freepik.com/free-photo/car-crash-accident_1150-13725.jpg");
                  const data = {
                    vehicleId: selectedVehicleId,
                    title: title,
                    description: desc,
                    priority: damages.some(d => d.severity === 'HEAVY') ? 'HIGH' : 'MEDIUM',
                    imageUrl: imgUrl
                  };
                  
                  const response = await fetch(`http://localhost:8080/api/disputes`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(data)
                  });
                  if(response.ok) {
                    alert("Đã gửi Báo cáo sự cố lên Admin!");
                  } else {
                    alert("Gửi báo cáo thất bại");
                  }
                } catch(e) {
                  alert("Lỗi mạng!");
                } finally {
                  setSubmitting(false);
                }
              }}
              disabled={submitting}
              className="w-full mt-3 font-bold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white shadow-red-500/20"
            >
              <i className="ph ph-warning-circle text-xl"></i> Báo cáo Tranh chấp / Sự cố
            </button>
          )}
        </div>
      </div>
      )}
    </div>
  );
};

export default VehicleCheckin3D;
