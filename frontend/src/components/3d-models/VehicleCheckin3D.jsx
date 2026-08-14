import React, { useRef, useState, useEffect, Suspense, memo } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box, Environment, ContactShadows, Text, Html, useProgress } from '@react-three/drei';
import { getVehicleGroups, checkoutVehicle, checkinVehicle, getAdminCheckinLogs } from '../../services/api';
import CarModel3D from '../3d-architecture/CarModel3D';

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

// Extracted Hologram UI to prevent re-rendering the 3D Canvas on form input
const CheckoutHologram = ({ vehicleObj, vehicleMembers, mode, activeTrips, onClose, onSubmit, selectedPart, onClearPart }) => {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [battery, setBattery] = useState(100);
  const [odo, setOdo] = useState(0);
  const [timestamp, setTimestamp] = useState(() => {
    const tzOffset = new Date().getTimezoneOffset() * 60000;
    return new Date(Date.now() - tzOffset).toISOString().slice(0, 16);
  });
  const [damages, setDamages] = useState([]);
  const [notes, setNotes] = useState('');
  const [severity, setSeverity] = useState('LIGHT');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (vehicleObj) {
      setBattery(vehicleObj.batteryPercentage || 100);
      setOdo(vehicleObj.odometer || 0);
      if (mode === 'CHECKIN') {
        const trip = activeTrips.find(t => t.vehicleId.toString() === vehicleObj.id.toString());
        if (trip && trip.userId) setSelectedUserId(trip.userId);
        else if (vehicleMembers && vehicleMembers.length > 0) setSelectedUserId(vehicleMembers[0].id);
      } else {
        if (vehicleMembers && vehicleMembers.length > 0) setSelectedUserId(vehicleMembers[0].id);
        else setSelectedUserId('');
      }
      setDamages([]);
      setNotes('');
      setSeverity('LIGHT');
      onClearPart();
    }
  }, [vehicleObj, mode]);

  const addDamage = () => {
    if (selectedPart && notes) {
      setDamages([...damages, { part: selectedPart, notes, severity, timestamp: new Date().toISOString() }]);
      setNotes('');
      setSeverity('LIGHT');
      onClearPart();
    }
  };

  const removeDamage = (index) => setDamages(damages.filter((_, i) => i !== index));

  const handleConfirm = async () => {
    setSubmitting(true);
    await onSubmit({ userId: selectedUserId, battery, odo, damages, timestamp });
    setSubmitting(false);
  };

  const handleDispute = async () => {
    const title = prompt("Nhập tiêu đề sự cố:");
    if (!title) return;
    try {
      setSubmitting(true);
      const token = localStorage.getItem('evshare_jwt_token');
      const desc = damages.map(d => `- ${d.part} (${d.severity}): ${d.notes}`).join('\n');
      const imgUrl = prompt("Nhập link ảnh bằng chứng (nếu có):", "https://img.freepik.com/free-photo/car-crash-accident_1150-13725.jpg");
      const data = {
        vehicleId: vehicleObj.id,
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
  };

  return (
    <div className="w-[420px] bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-2xl p-5 shadow-[0_0_50px_rgba(0,0,0,0.5)] text-white flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
      
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div>
          <h3 className={`font-black text-xl flex items-center gap-2 ${mode === 'CHECKIN' ? 'text-brand-400' : 'text-blue-400'}`}>
            <i className={mode === 'CHECKIN' ? 'ph-fill ph-sign-in' : 'ph-fill ph-sign-out'}></i> 
            THỦ TỤC {mode === 'CHECKIN' ? 'NHẬN XE' : 'GIAO XE'}
          </h3>
          <p className="text-sm font-medium text-slate-300 mt-1">
            {vehicleObj.licensePlate} - {vehicleObj.model}
          </p>
        </div>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors cursor-pointer">
          <i className="ph ph-x"></i>
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Thành viên {mode === 'CHECKIN' ? 'trả xe' : 'nhận xe'}</label>
          <div className="relative">
            <i className="ph ph-user text-slate-400 absolute left-3 top-2.5"></i>
            <select 
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              disabled={mode === 'CHECKIN'}
              className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm font-bold text-white focus:outline-none focus:ring-2 focus:border-brand-500 disabled:bg-slate-800/50 disabled:text-slate-500"
            >
              {vehicleMembers.map(m => (
                <option key={m.id} value={m.id}>{m.name || "Không rõ tên"}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Pin (%)</label>
            <div className="relative">
              <i className="ph ph-battery-full text-brand-400 absolute left-3 top-2.5"></i>
              <input 
                type="number" min="0" max="100" value={battery} onChange={(e) => setBattery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm font-bold text-white focus:outline-none focus:ring-2 focus:border-brand-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">ODO (km)</label>
            <div className="relative">
              <i className="ph ph-speedometer text-blue-400 absolute left-3 top-2.5"></i>
              <input 
                type="number" value={odo} onChange={(e) => setOdo(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm font-bold text-white focus:outline-none focus:ring-2 focus:border-brand-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Damage Recorder */}
      {selectedPart && (
        <div className="bg-slate-800 border border-brand-500/30 p-4 rounded-xl shadow-inner animate-fade-in-up mt-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-brand-400 flex items-center gap-2 text-sm">
              <i className="ph-fill ph-warning-circle"></i> Ghi nhận: {selectedPart}
            </h3>
            <button onClick={onClearPart} className="text-slate-400 hover:text-white"><i className="ph ph-x"></i></button>
          </div>
          
          <textarea 
            className="w-full border border-slate-700 bg-slate-900 rounded-lg p-2 text-xs focus:ring-1 focus:ring-brand-500 outline-none mb-2 placeholder-slate-500 text-white"
            rows="2" placeholder="Mô tả xước/móp..." value={notes} onChange={(e) => setNotes(e.target.value)}
          />
          
          <div className="flex gap-2">
            <select
              value={severity} onChange={(e) => setSeverity(e.target.value)}
              className="flex-1 border border-slate-700 bg-slate-900 rounded-lg p-2 text-xs focus:ring-1 focus:ring-brand-500 outline-none text-white font-medium"
            >
              <option value="LIGHT">Nhẹ (+500k)</option>
              <option value="MEDIUM">Vừa (+2Tr)</option>
              <option value="HEAVY">Nặng (+5Tr)</option>
            </select>
            <button onClick={addDamage} disabled={!notes.trim()} className={`px-3 rounded-lg text-xs font-bold transition-all ${notes.trim() ? 'bg-brand-500 hover:bg-brand-600 text-white' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}>
              Thêm
            </button>
          </div>
        </div>
      )}

      {/* Damages List */}
      {damages.length > 0 && (
        <div className="bg-slate-800/50 rounded-xl p-3 border border-white/5 max-h-[150px] overflow-y-auto">
          <h4 className="text-xs font-bold text-slate-300 mb-2">Tình trạng ghi nhận ({damages.length})</h4>
          <div className="space-y-2">
            {damages.map((dmg, idx) => (
              <div key={idx} className="bg-slate-900/80 p-2 rounded-lg relative group text-xs border border-white/5">
                <button onClick={() => removeDamage(idx)} className="absolute top-2 right-2 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100"><i className="ph-fill ph-trash"></i></button>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-white">{dmg.part}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${dmg.severity === 'HEAVY' ? 'bg-red-500/20 text-red-400' : (dmg.severity === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-300')}`}>{dmg.severity}</span>
                </div>
                <p className="text-slate-400">{dmg.notes}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <button 
        onClick={handleConfirm} disabled={submitting}
        className={`w-full font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 mt-2 transition-all ${
          submitting ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 
          mode === 'CHECKIN' ? 'bg-brand-500 hover:bg-brand-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {submitting ? <><i className="ph ph-spinner animate-spin"></i> Xử lý...</> : <><i className="ph ph-check-circle text-lg"></i> XÁC NHẬN {mode === 'CHECKIN' ? 'NHẬN XE' : 'GIAO XE'}</>}
      </button>

      {mode === 'CHECKIN' && damages.length > 0 && (
        <button 
          onClick={handleDispute}
          disabled={submitting}
          className="w-full mt-1 font-bold py-2.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white shadow-red-500/20 text-sm"
        >
          <i className="ph ph-warning-circle text-lg"></i> Báo cáo Sự cố
        </button>
      )}

    </div>
  );
};

const VehicleCheckin3D = () => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [mode, setMode] = useState('CHECKIN'); 
  const [selectedPart, setSelectedPart] = useState(null);
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

  const selectVehicleForMode = (vid, m) => {
    setMode(m);
    setSelectedVehicleId(vid);
    setSelectedPart(null);
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
    } catch (err) {
      console.error("Failed to load vehicles:", err);
    }
  };

  const handlePartClick = (partName) => {
    setSelectedPart(partName);
  };

  const handleSubmitHologram = async ({ userId, battery, odo, damages, timestamp }) => {
    if (!selectedVehicleId || !userId) {
      alert("Vui lòng chọn xe và người dùng!");
      return;
    }

    try {
      const payload = {
        userId: userId,
        batteryPercentage: battery,
        odometer: odo,
        damages: JSON.stringify(damages),
        timestamp: timestamp
      };

      const vehicleData = vehicles.find(v => v.vehicle.id.toString() === selectedVehicleId.toString());
      const vehicleObj = vehicleData?.vehicle || { model: 'Xe', licensePlate: '---' };
      const vehicleMembers = vehicleData?.members || [];

      if (mode === 'CHECKOUT') {
        const isRunning = activeTrips.some(t => t.vehicleId.toString() === selectedVehicleId.toString());
        if (isRunning) {
          alert("Xe này đang được giao cho người khác. Không thể giao xe!");
          return;
        }

        await checkoutVehicle(selectedVehicleId, payload);
        const userName = vehicleMembers.find(m => m.id.toString() === userId.toString())?.name || "Thành viên";
        
        let existing = [];
        try { existing = JSON.parse(localStorage.getItem('evshare_activeTrips') || '[]'); if (!Array.isArray(existing)) existing = []; } catch(e) {}
        
        existing = existing.filter(t => t.vehicleId.toString() !== selectedVehicleId.toString());
        existing.push({
          vehicleId: selectedVehicleId,
          vehiclePlate: vehicleObj.licensePlate || vehicleObj.model,
          userId: userId,
          userName: userName,
          startTime: timestamp
        });
        
        localStorage.setItem('evshare_activeTrips', JSON.stringify(existing));
        window.dispatchEvent(new Event('evshare_trip_update'));
        
        alert(`Đã hoàn tất Giao xe (Check-out) thành công!\nXe: ${vehicleObj.licensePlate}\nPin: ${battery}%\nODO: ${odo} km\nNgười nhận: ${userName}`);
      } else {
        const res = await checkinVehicle(selectedVehicleId, payload);
        const cost = res.cost || 0;
        
        let existing = [];
        try { existing = JSON.parse(localStorage.getItem('evshare_activeTrips') || '[]'); if (!Array.isArray(existing)) existing = []; } catch(e) {}
        
        const filtered = existing.filter(t => t.vehicleId.toString() !== selectedVehicleId.toString());
        localStorage.setItem('evshare_activeTrips', JSON.stringify(filtered));
        window.dispatchEvent(new Event('evshare_trip_update'));
        
        alert(`Đã hoàn tất Nhận xe (Check-in) thành công!\nXe: ${vehicleObj.licensePlate}\nPin: ${battery}%\nODO: ${odo} km\nNgười trả: ${vehicleMembers.find(m => m.id.toString() === userId.toString())?.name}\n\nChi phí phát sinh (nếu có): ${cost.toLocaleString()} VNĐ`);
      }
      
      setSelectedVehicleId('');
      fetchVehicles();
      fetchHistory();
    } catch (err) {
      console.error(err);
      alert(err.response?.data || "Đã xảy ra lỗi");
    }
  };

  return (
    <div className="flex flex-col h-full gap-4 relative">
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
              <div className="bg-slate-800/80 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 text-white flex flex-col gap-1 shadow-2xl pointer-events-none">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <i className="ph-fill ph-cube text-brand-400"></i> Scanner 3D
                </h3>
                <p className="text-xs text-slate-300">Dùng chuột xoay, kéo, và click trực tiếp vào bộ phận xe để ghi nhận tình trạng.</p>
              </div>
            </div>

            {/* Absolute Hologram Panel outside Canvas */}
            {selectedVehicleId && (
              <div className="absolute top-4 right-4 z-20 pointer-events-auto animate-fade-in-right">
                {vehicles.find(v => v.vehicle.id.toString() === selectedVehicleId.toString()) && (
                  <CheckoutHologram 
                    vehicleObj={vehicles.find(v => v.vehicle.id.toString() === selectedVehicleId.toString()).vehicle}
                    vehicleMembers={vehicles.find(v => v.vehicle.id.toString() === selectedVehicleId.toString()).members || []}
                    mode={mode}
                    activeTrips={activeTrips}
                    selectedPart={selectedPart}
                    onClearPart={() => setSelectedPart(null)}
                    onClose={() => setSelectedVehicleId('')}
                    onSubmit={handleSubmitHologram}
                  />
                )}
              </div>
            )}
            
            <Canvas shadows camera={{ position: [5, 4, 6], fov: 45 }} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
              <color attach="background" args={['#0f172a']} />
              <ambientLight intensity={0.5} />
              <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
              <Environment preset="city" />
              
              <Suspense fallback={<Loader />}>
                <group position={[0, -0.5, 0]}>
                  {vehicles.map((v, i) => {
                    const isRunning = activeTrips.find(t => t.vehicleId.toString() === v.vehicle.id.toString());
                    const modeForCar = isRunning ? 'CHECKIN' : 'CHECKOUT';
                    const isSelected = selectedVehicleId?.toString() === v.vehicle.id.toString();
                    const xPos = (i - (vehicles.length - 1) / 2) * 5;
                    
                    return (
                      <group key={v.vehicle.id} position={[xPos, 0, 0]}>
                        {/* Floor Parking Slot Ring */}
                        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                          <ringGeometry args={[2.5, 2.8, 32]} />
                          <meshBasicMaterial color={isRunning ? '#3b82f6' : '#22c55e'} transparent opacity={isSelected ? 0.8 : 0.3} side={THREE.DoubleSide} />
                        </mesh>
                        
                        <CarModel3D 
                           vehicle={v.vehicle} 
                           onPartClick={(part) => {
                             if (!isSelected) selectVehicleForMode(v.vehicle.id, modeForCar);
                             else handlePartClick(part);
                           }} 
                           isShowroom={false} 
                        />
                        
                        {/* Floating Hologram Label (Only when NOT selected) */}
                        {!isSelected && (
                          <Html position={[0, 3.2, 0]} center>
                            <div 
                              className={`px-3 py-2 rounded-xl text-xs font-bold text-white shadow-lg cursor-pointer whitespace-nowrap border-2 backdrop-blur-md transition-all hover:scale-105 ${isRunning ? 'bg-blue-600/80 border-blue-400' : 'bg-emerald-600/80 border-emerald-400'}`}
                              onClick={() => selectVehicleForMode(v.vehicle.id, modeForCar)}
                            >
                              <div className="flex flex-col items-center gap-0.5">
                                <span className="text-sm font-black tracking-wider">{v.vehicle.licensePlate}</span>
                                <span className="text-[10px] uppercase font-semibold text-white/90">
                                  {isRunning ? 'CHỜ NHẬN XE' : 'SẴN SÀNG GIAO'}
                                </span>
                              </div>
                            </div>
                          </Html>
                        )}
                      </group>
                    );
                  })}
                </group>
                <ContactShadows position={[0, -0.49, 0]} opacity={0.6} scale={20} blur={2.5} far={4} />
              </Suspense>
              
              <OrbitControls makeDefault enablePan={true} maxPolarAngle={Math.PI/2 - 0.05} minDistance={5} maxDistance={20}/>
            </Canvas>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleCheckin3D;
