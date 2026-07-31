import React from 'react';

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
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500">
            <i className="ph ph-receipt text-xl"></i>
          </div>
          <span className="inline-flex items-center gap-0.5 text-xs font-medium text-red-500 bg-red-50 px-1.5 py-0.5 rounded-md">
            <i className="ph-bold ph-arrow-up-right"></i>+{kpi.costChangePercentage}%
          </span>
        </div>
        <p className="text-2xl font-bold tracking-tight">{formatCurrency(kpi.totalCostThisMonth)}</p>
        <p className="text-xs text-slate-500 font-medium mt-0.5">Tổng chi phí tháng này</p>
        <p className="text-[11px] text-slate-400 mt-1">so với tháng trước</p>
      </div>

      {/* Driven Kilometers */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600">
            <i className="ph ph-route text-xl"></i>
          </div>
          <span className="inline-flex items-center gap-0.5 text-xs font-medium text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded-md">
            <i className="ph-bold ph-arrow-up-right"></i>+{kpi.kmChangePercentage}%
          </span>
        </div>
        <p className="text-2xl font-bold tracking-tight">{kpi.drivenKmThisMonth} km</p>
        <p className="text-xs text-slate-500 font-medium mt-0.5">Số km đã sử dụng</p>
        <p className="text-[11px] text-slate-400 mt-1">Tỉ lệ sở hữu: 40%</p>
      </div>

      {/* Booking Count */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500">
            <i className="ph ph-calendar-check text-xl"></i>
          </div>
          <span className="inline-flex items-center gap-0.5 text-xs font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">Tháng 6</span>
        </div>
        <p className="text-2xl font-bold tracking-tight">{kpi.bookingCountThisMonth} lần</p>
        <p className="text-xs text-slate-500 font-medium mt-0.5">Số lần đặt xe</p>
        <p className="text-[11px] text-slate-400 mt-1">Tháng 6/2025</p>
      </div>

      {/* Joint Fund */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600">
            <i className="ph ph-piggy-bank text-xl"></i>
          </div>
          <span className="inline-flex items-center gap-0.5 text-xs font-medium text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mr-1 animate-pulse"></span>{kpi.jointFundStatus}
          </span>
        </div>
        <p className="text-2xl font-bold tracking-tight">{formatCurrency(kpi.jointFundBalance)}</p>
        <p className="text-xs text-slate-500 font-medium mt-0.5">Quỹ chung</p>
        <p className="text-[11px] text-slate-400 mt-1">Số dư hiện tại</p>
      </div>
    </section>
  );
};

export default KPICards;
