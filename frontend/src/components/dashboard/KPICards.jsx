import React from 'react';
import Tilt3DCard from '../shared/Tilt3DCard';

const KPICards = ({ kpi }) => {
  if (!kpi) return null;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(value)
      .replace('₫', '₫');
  };

  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Cost */}
      <Tilt3DCard className="h-full">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 h-full flex flex-col transform-style-3d">
          <div className="flex items-start justify-between mb-3" style={{ transform: 'translateZ(20px)' }}>
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500 shadow-inner">
              <i className="ph ph-receipt text-xl drop-shadow-sm"></i>
            </div>
            <span className="inline-flex items-center gap-0.5 text-xs font-medium text-red-500 bg-red-50 px-1.5 py-0.5 rounded-md shadow-sm border border-red-100/50">
              <i className="ph-bold ph-arrow-up-right"></i>+{kpi.costChangePercentage}%
            </span>
          </div>
          <div className="mt-auto" style={{ transform: 'translateZ(30px)' }}>
            <p className="text-2xl font-bold tracking-tight drop-shadow-sm">{formatCurrency(kpi.totalCostThisMonth)}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5" style={{ transform: 'translateZ(-5px)' }}>Tổng chi phí tháng này</p>
            <p className="text-[11px] text-slate-400 mt-1" style={{ transform: 'translateZ(-10px)' }}>so với tháng trước</p>
          </div>
        </div>
      </Tilt3DCard>

      {/* Driven Kilometers */}
      <Tilt3DCard className="h-full">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 h-full flex flex-col transform-style-3d">
          <div className="flex items-start justify-between mb-3" style={{ transform: 'translateZ(20px)' }}>
            <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 shadow-inner">
              <i className="ph ph-route text-xl drop-shadow-sm"></i>
            </div>
            <span className="inline-flex items-center gap-0.5 text-xs font-medium text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded-md shadow-sm border border-brand-100/50">
              <i className="ph-bold ph-arrow-up-right"></i>+{kpi.kmChangePercentage}%
            </span>
          </div>
          <div className="mt-auto" style={{ transform: 'translateZ(30px)' }}>
            <p className="text-2xl font-bold tracking-tight drop-shadow-sm">{kpi.drivenKmThisMonth} km</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5" style={{ transform: 'translateZ(-5px)' }}>Số km đã sử dụng</p>
            <p className="text-[11px] text-slate-400 mt-1" style={{ transform: 'translateZ(-10px)' }}>Tỉ lệ sở hữu: 40%</p>
          </div>
        </div>
      </Tilt3DCard>

      {/* Booking Count */}
      <Tilt3DCard className="h-full">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 h-full flex flex-col transform-style-3d">
          <div className="flex items-start justify-between mb-3" style={{ transform: 'translateZ(20px)' }}>
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 shadow-inner">
              <i className="ph ph-calendar-check text-xl drop-shadow-sm"></i>
            </div>
            <span className="inline-flex items-center gap-0.5 text-xs font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md shadow-sm border border-blue-100/50">Tháng 6</span>
          </div>
          <div className="mt-auto" style={{ transform: 'translateZ(30px)' }}>
            <p className="text-2xl font-bold tracking-tight drop-shadow-sm">{kpi.bookingCountThisMonth} lần</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5" style={{ transform: 'translateZ(-5px)' }}>Số lần đặt xe</p>
            <p className="text-[11px] text-slate-400 mt-1" style={{ transform: 'translateZ(-10px)' }}>Tháng 6/2025</p>
          </div>
        </div>
      </Tilt3DCard>

      {/* Joint Fund */}
      <Tilt3DCard className="h-full">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 h-full flex flex-col transform-style-3d">
          <div className="flex items-start justify-between mb-3" style={{ transform: 'translateZ(20px)' }}>
            <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 shadow-inner">
              <i className="ph ph-piggy-bank text-xl drop-shadow-sm"></i>
            </div>
            <span className="inline-flex items-center gap-0.5 text-xs font-medium text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded-md shadow-sm border border-brand-100/50">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mr-1 animate-pulse"></span>{kpi.jointFundStatus}
            </span>
          </div>
          <div className="mt-auto" style={{ transform: 'translateZ(30px)' }}>
            <p className="text-2xl font-bold tracking-tight drop-shadow-sm">{formatCurrency(kpi.jointFundBalance)}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5" style={{ transform: 'translateZ(-5px)' }}>Quỹ chung</p>
            <p className="text-[11px] text-slate-400 mt-1" style={{ transform: 'translateZ(-10px)' }}>Số dư hiện tại</p>
          </div>
        </div>
      </Tilt3DCard>
    </section>
  );
};

export default KPICards;
