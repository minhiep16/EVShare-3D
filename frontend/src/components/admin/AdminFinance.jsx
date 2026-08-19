import React, { useState, useEffect } from 'react';
import { getFinanceSummary, getVehicleFinanceStats } from '../../services/api';
import FinanceHologram3D from '../3d-architecture/FinanceHologram3D';

const AdminFinance = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [period, setPeriod] = useState('month'); // month, quarter, year
  const [summary, setSummary] = useState(null);
  const [groupsFinance, setGroupsFinance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [summaryData, groupsData] = await Promise.all([
          getFinanceSummary(),
          getVehicleFinanceStats()
        ]);
        
        setSummary(summaryData);
        
        const mappedGroups = groupsData.map(v => ({
          id: `#EV-2025-${v.vehicleId.toString().padStart(3, '0')}`,
          car: v.model,
          plate: v.licensePlate,
          balance: v.balance,
          cost: v.totalCost,
          charge: v.charge,
          efficiency: v.efficiency,
          status: v.balance > 5000000 ? 'Ổn định' : 'Cảnh báo thấp',
          badgeClass: v.balance > 5000000 ? 'bg-brand-50 text-brand-600' : 'bg-amber-50 text-amber-600'
        }));
        
        setGroupsFinance(mappedGroups);
      } catch (error) {
        console.error("Failed to fetch finance data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
  };

  const filteredGroups = groupsFinance.filter(g => 
    g.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.car.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.plate.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const donutData = [
    { label: 'VinFast', value: 45, color: '#22c55e' },
    { label: 'Tesla', value: 30, color: '#3b82f6' },
    { label: 'Hyundai', value: 15, color: '#f59e0b' },
    { label: 'Khác', value: 10, color: '#94a3b8' }
  ];

  const barData = [
    { label: 'Thứ 2', value: 45, color: '#3b82f6' },
    { label: 'Thứ 3', value: 55, color: '#3b82f6' },
    { label: 'Thứ 4', value: 85, color: '#22c55e' },
    { label: 'Thứ 5', value: 70, color: '#22c55e' },
    { label: 'Thứ 6', value: 92, color: '#22c55e' },
    { label: 'Thứ 7', value: 100, color: '#22c55e' },
    { label: 'CN', value: 65, color: '#f59e0b' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      {/* Top Stats Rows */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* GMV */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-bold text-slate-400 uppercase mb-2 tracking-wide">Tổng dòng tiền (GMV)</p>
          <p className="text-2xl font-bold text-ink">{summary ? formatCurrency(summary.gmv) : '0₫'}</p>
          <div className="mt-2 flex items-center gap-1 text-xs text-brand-600 font-semibold">
            <i className="ph ph-trend-up"></i> +12.4% <span className="text-slate-400 font-normal ml-1">với tháng trước</span>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-bold text-slate-400 uppercase mb-2 tracking-wide">Phí dịch vụ thu (Revenue)</p>
          <p className="text-2xl font-bold text-ink">{summary ? formatCurrency(summary.systemRevenue) : '0₫'}</p>
          <div className="mt-2 flex items-center gap-1 text-xs text-brand-600 font-semibold">
            <i className="ph ph-trend-up"></i> +8.2% <span className="text-slate-400 font-normal ml-1">với tháng trước</span>
          </div>
        </div>

        {/* Maintenance cost */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-bold text-slate-400 uppercase mb-2 tracking-wide">Chi phí bảo trì hệ thống</p>
          <p className="text-2xl font-bold text-ink">{summary ? formatCurrency(summary.totalCost) : '0₫'}</p>
          <div className="mt-2 flex items-center gap-1 text-xs text-red-500 font-semibold">
            <i className="ph ph-trend-up"></i> +4.1% <span className="text-slate-400 font-normal ml-1">do tăng bảo dưỡng</span>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-bold text-slate-400 uppercase mb-2 tracking-wide">Lợi nhuận ròng</p>
          <p className="text-2xl font-bold text-ink">{summary ? formatCurrency(summary.netProfit) : '0₫'}</p>
          <div className="mt-2 flex items-center gap-1 text-xs text-brand-600 font-semibold">
            <i className="ph ph-trend-up"></i> +9.8% <span className="text-slate-400 font-normal ml-1">tăng trưởng ổn định</span>
          </div>
        </div>
      </div>

      {/* Hologram Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 relative z-0">
        <FinanceHologram3D type="donut" data={donutData} title="Cơ Cấu Nhãn Hiệu" />
        <FinanceHologram3D type="bar" data={barData} title="Hiệu Suất (Tuần)" autoRotate={false} />
      </div>

      {/* Group Financials Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="text-base font-bold text-ink">Báo cáo tài chính theo từng nhóm xe</h3>
          <div className="relative">
            <i className="ph ph-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm tên nhóm, biển số..." 
              className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm w-64 focus:outline-none focus:border-violet-500 text-ink"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-400">
                <th className="text-left py-3 px-6 text-xs font-semibold uppercase tracking-wide">Nhóm xe</th>
                <th className="text-left py-3 px-6 text-xs font-semibold uppercase tracking-wide">Số dư quỹ chung</th>
                <th className="text-left py-3 px-6 text-xs font-semibold uppercase tracking-wide">Tổng chi tháng</th>
                <th className="text-left py-3 px-6 text-xs font-semibold uppercase tracking-wide">Phí sạc (kWh)</th>
                <th className="text-left py-3 px-6 text-xs font-semibold uppercase tracking-wide">Hiệu suất dùng</th>
                <th className="text-left py-3 px-6 text-xs font-semibold uppercase tracking-wide">Trạng thái quỹ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-ink">
              {filteredGroups.map((group) => (
                <tr key={group.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6">
                    <p className="font-bold text-slate-900">{group.id}</p>
                    <p className="text-xs text-slate-400 font-medium">{group.car} · {group.plate}</p>
                  </td>
                  <td className="py-4 px-6 font-semibold">{formatCurrency(group.balance)}</td>
                  <td className="py-4 px-6 text-red-500 font-medium">{formatCurrency(group.cost)}</td>
                  <td className="py-4 px-6 font-medium text-slate-600">{group.charge}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${group.efficiency < 50 ? 'bg-amber-500' : 'bg-brand-500'}`} 
                          style={{ width: `${group.efficiency}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-slate-700">{group.efficiency}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${group.badgeClass}`}>
                      {group.status}
                    </span>
                  </td>
                </tr>
              ))}

              {filteredGroups.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">Không tìm thấy nhóm xe nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminFinance;
