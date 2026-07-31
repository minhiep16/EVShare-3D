import React from 'react';
import Vehicle3D from './Vehicle3D';

const VehicleHero = ({ vehicle, coOwnersCount, ownershipPercentage, onBookNow }) => {
  if (!vehicle) return null;

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="relative h-64 lg:h-auto bg-slate-950 flex items-center justify-center overflow-hidden">
          <Vehicle3D />
          <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-white/95 backdrop-blur px-3 py-1.5 rounded-full text-xs font-medium text-brand-600 z-10">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse"></span>
            {vehicle.status || 'Sẵn sàng'}
          </span>
        </div>
        
        <div className="p-6 lg:p-8 flex flex-col justify-center">
          <p className="text-xs font-medium text-slate-400 mb-1">Xe của bạn</p>
          <h2 className="text-2xl font-bold tracking-tight mb-1">{vehicle.model} ({vehicle.year || 2024})</h2>
          <p className="text-slate-500 text-sm mb-5 font-medium">
            Biển số: <span className="text-ink font-semibold">{vehicle.licensePlate}</span>
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <i className="ph ph-users-three text-slate-400 mb-1 text-lg"></i>
              <p className="text-sm text-slate-500 mb-0.5">Đồng sở hữu</p>
              <p className="text-base font-bold">{coOwnersCount} người</p>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <i className="ph ph-percent text-slate-400 mb-1 text-lg"></i>
              <p className="text-sm text-slate-500 mb-0.5">Tỉ lệ của bạn</p>
              <p className="text-base font-bold text-brand-600">{ownershipPercentage}%</p>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <i className="ph ph-battery-charging text-brand-500 mb-1 text-lg"></i>
              <p className="text-sm text-slate-500 mb-0.5">Pin hiện tại</p>
              <p className="text-base font-bold">{vehicle.batteryPercentage}%</p>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <i className="ph ph-gauge text-slate-400 mb-1 text-lg"></i>
              <p className="text-sm text-slate-500 mb-0.5">Odometer</p>
              <p className="text-base font-bold">{vehicle.odometer >= 1000 ? `${(vehicle.odometer / 1000).toFixed(1)}k` : vehicle.odometer} km</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={onBookNow}
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              <i className="ph ph-calendar-plus"></i>
              Đặt lịch ngay
            </button>
            <button className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer">
              <i className="ph ph-info"></i>
              Xem chi tiết
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VehicleHero;
