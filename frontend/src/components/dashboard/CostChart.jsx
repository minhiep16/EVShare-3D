import React from 'react';

const CostChart = ({ transactions }) => {
  const totalCost = transactions.reduce((acc, t) => acc + t.amount, 0);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const getIconClassForCategory = (type) => {
    switch (type) {
      case 'CHARGE': return 'ph ph-lightning text-brand-500';
      case 'MAINTENANCE': return 'ph ph-wrench text-blue-500';
      case 'INSURANCE': return 'ph ph-shield-check text-amber-500';
      default: return 'ph ph-folder text-slate-400';
    }
  };

  const formatDate = (dateString) => {
    // Format "yyyy-MM-dd" to "dd/MM"
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}`;
    }
    return dateString;
  };

  return (
    <div className="xl:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
      <h3 className="text-base font-semibold mb-1">Chi phí tháng 6</h3>
      <p className="text-xs text-slate-400 font-medium mb-4">Phân bổ theo loại chi tiêu</p>
      
      {/* SVG Donut Chart */}
      <div className="flex-1 flex items-center justify-center py-2">
        <div className="relative w-48 h-48">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e2e8f0" strokeWidth="3"/>
            {/* Charging: 45% (stroke-dasharray="45 55") */}
            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#22c55e" strokeWidth="3" strokeDasharray="45 55" strokeLinecap="round"/>
            {/* Maintenance: 25% (stroke-dasharray="25 75" offset="-45") */}
            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#3b82f6" strokeWidth="3" strokeDasharray="25 75" strokeDashoffset="-45" strokeLinecap="round"/>
            {/* Insurance: 20% (stroke-dasharray="20 80" offset="-70") */}
            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="20 80" strokeDashoffset="-70" strokeLinecap="round"/>
            {/* Other: 10% (stroke-dasharray="10 90" offset="-90") */}
            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#94a3b8" strokeWidth="3" strokeDasharray="10 90" strokeDashoffset="-90" strokeLinecap="round"/>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-xl font-bold tracking-tight">{(totalCost / 1000).toLocaleString()}k</p>
            <p className="text-[11px] text-slate-400 font-medium">Tổng chi phí</p>
          </div>
        </div>
      </div>
      
      {/* Category Breakdown */}
      <div className="space-y-2.5 mt-2">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-sm bg-brand-500"></span>Phí sạc điện (45%)
          </span>
          <span className="font-semibold">{formatCurrency(totalCost * 0.45)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-500"></span>Bảo dưỡng (25%)
          </span>
          <span className="font-semibold">{formatCurrency(totalCost * 0.25)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span>Bảo hiểm (20%)
          </span>
          <span className="font-semibold">{formatCurrency(totalCost * 0.20)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-400"></span>Khác (10%)
          </span>
          <span className="font-semibold">{formatCurrency(totalCost * 0.10)}</span>
        </div>
      </div>
      
      {/* Recent Transactions */}
      <div className="mt-5 pt-4 border-t border-slate-100 space-y-2.5">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Giao dịch gần đây</p>
        {transactions.slice(0, 3).map((t) => (
          <div key={t.id} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-slate-600">
              <i className={getIconClassForCategory(t.type)}></i>
              {t.description}
            </span>
            <span className="font-medium text-slate-500">
              {formatCurrency(t.amount)} · {formatDate(t.date)}
            </span>
          </div>
        ))}
        {transactions.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-2">Chưa có giao dịch nào</p>
        )}
      </div>
      
      <button className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer">
        <i className="ph ph-file-pdf text-red-500"></i>
        Xem báo cáo đầy đủ
      </button>
    </div>
  );
};

export default CostChart;
