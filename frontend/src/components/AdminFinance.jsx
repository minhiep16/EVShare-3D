import React, { useState, useEffect } from 'react';
import { getFinanceSummary, getVehicleGroups } from '../services/api';

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
          getVehicleGroups()
        ]);
        
        setSummary(summaryData);
        
        const mappedGroups = groupsData.map(g => ({
          id: `#EV-2025-${g.vehicle.id.toString().padStart(3, '0')}`,
          car: g.vehicle.model,
          plate: g.vehicle.licensePlate,
          balance: g.vehicle.jointFundBalance || 0,
          cost: 0, // Should be calculated from transactions in real app
          charge: '0 kWh', // Mock
          efficiency: 85, // Mock
          status: g.vehicle.jointFundBalance > 5000000 ? 'Ổn định' : 'Cảnh báo thấp',
          badgeClass: g.vehicle.jointFundBalance > 5000000 ? 'bg-brand-50 text-brand-600' : 'bg-amber-50 text-amber-600'
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

  const filteredGroups = groupsFinance.filter(g => 
    g.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.car.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.plate.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Stats Rows */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* GMV */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-bold text-slate-400 uppercase mb-2 tracking-wide">Tổng dòng tiền (GMV)</p>
          <p className="text-2xl font-bold text-ink">{summary ? formatCurrency(summary.totalIn) : '0₫'}</p>
          <div className="mt-2 flex items-center gap-1 text-xs text-brand-600 font-semibold">
            <i className="ph ph-trend-up"></i> +12.4% <span className="text-slate-400 font-normal ml-1">với tháng 5</span>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-bold text-slate-400 uppercase mb-2 tracking-wide">Phí dịch vụ thu (Revenue)</p>
          <p className="text-2xl font-bold text-ink">{summary ? formatCurrency(summary.totalIn * 0.1) : '0₫'}</p>
          <div className="mt-2 flex items-center gap-1 text-xs text-brand-600 font-semibold">
            <i className="ph ph-trend-up"></i> +8.2% <span className="text-slate-400 font-normal ml-1">với tháng 5</span>
          </div>
        </div>

        {/* Maintenance cost */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-bold text-slate-400 uppercase mb-2 tracking-wide">Chi phí bảo trì hệ thống</p>
          <p className="text-2xl font-bold text-ink">{summary ? formatCurrency(summary.totalOut) : '0₫'}</p>
          <div className="mt-2 flex items-center gap-1 text-xs text-red-500 font-semibold">
            <i className="ph ph-trend-up"></i> +4.1% <span className="text-slate-400 font-normal ml-1">do tăng trạm sạc</span>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-bold text-slate-400 uppercase mb-2 tracking-wide">Lợi nhuận ròng</p>
          <p className="text-2xl font-bold text-ink">{summary ? formatCurrency((summary.totalIn * 0.1) - summary.totalOut) : '0₫'}</p>
          <div className="mt-2 flex items-center gap-1 text-xs text-brand-600 font-semibold">
            <i className="ph ph-trend-up"></i> +9.8% <span className="text-slate-400 font-normal ml-1">tăng trưởng ổn định</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Revenue Structure Donut */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <h3 className="text-base font-bold text-ink mb-4">Cơ cấu doanh thu theo loại xe</h3>
          <div className="flex-1 flex items-center justify-center py-6">
            <div className="relative w-52 h-52">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e2e8f0" strokeWidth="4"/>
                {/* VinFast: 45% (22c55e) */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#22c55e" strokeWidth="4" strokeDasharray="45 55" strokeLinecap="round"/>
                {/* Tesla: 30% (3b82f6) */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#3b82f6" strokeWidth="4" strokeDasharray="30 70" strokeDashoffset="-45" strokeLinecap="round"/>
                {/* Hyundai: 15% (f59e0b) */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f59e0b" strokeWidth="4" strokeDasharray="15 85" strokeDashoffset="-75" strokeLinecap="round"/>
                {/* Khác: 10% (94a3b8) */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#94a3b8" strokeWidth="4" strokeDasharray="10 90" strokeDashoffset="-90" strokeLinecap="round"/>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-xl font-bold tracking-tight text-ink">EVShare</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase">Cơ cấu</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs mt-4">
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#22c55e]"></span>VinFast</span>
              <span className="font-bold text-ink">45%</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span>Tesla</span>
              <span className="font-bold text-ink">30%</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400"></span>Hyundai</span>
              <span className="font-bold text-ink">15%</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-400"></span>Khác</span>
              <span className="font-bold text-ink">10%</span>
            </div>
          </div>
        </div>

        {/* Usage Frequency & System Performance */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-ink">Tần suất sử dụng & Hiệu suất nhóm</h3>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="text-[#cbd5e1]">-- Mục tiêu (70%)</span>
              <span className="text-[#22c55e]">— Thực tế</span>
            </div>
          </div>
          
          <div className="relative w-full h-[220px] mt-4">
            <svg viewBox="0 0 500 220" className="w-full h-full">
              {/* Horizontal gridlines */}
              <line x1="40" y1="30" x2="480" y2="30" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="80" x2="480" y2="80" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="130" x2="480" y2="130" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="180" x2="480" y2="180" stroke="#cbd5e1" strokeWidth="1.5" />

              {/* Y Axis Values */}
              <text x="30" y="34" textAnchor="end" className="text-[9px] fill-slate-400 font-semibold">100%</text>
              <text x="30" y="84" textAnchor="end" className="text-[9px] fill-slate-400 font-semibold">70%</text>
              <text x="30" y="134" textAnchor="end" className="text-[9px] fill-slate-400 font-semibold">40%</text>
              <text x="30" y="184" textAnchor="end" className="text-[9px] fill-slate-400 font-semibold">0%</text>

              {/* X Axis Labels */}
              <text x="40" y="202" textAnchor="start" className="text-[9px] fill-slate-400 font-semibold">Ngày 1</text>
              <text x="260" y="202" textAnchor="middle" className="text-[9px] fill-slate-400 font-semibold">Ngày 15</text>
              <text x="480" y="202" textAnchor="end" className="text-[9px] fill-slate-400 font-semibold">Ngày 30</text>

              {/* Target Line (Dashed) */}
              <line x1="40" y1="80" x2="480" y2="80" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="5 5" />

              {/* Actual Line (SVG path) */}
              {/* Plotting points dynamically */}
              <path 
                d="M 40,90 Q 76,70 112,95 T 184,80 T 256,65 T 328,105 T 400,60 T 480,72 L 480,180 L 40,180 Z"
                fill="rgba(34,197,94,0.08)"
              />
              <path 
                d="M 40,90 Q 76,70 112,95 T 184,80 T 256,65 T 328,105 T 400,60 T 480,72"
                fill="none"
                stroke="#22c55e"
                strokeWidth="2.5"
              />

              {/* Dots on line */}
              <circle cx="112" cy="95" r="3" className="fill-[#22c55e]" />
              <circle cx="256" cy="65" r="3" className="fill-[#22c55e]" />
              <circle cx="400" cy="60" r="3" className="fill-[#22c55e]" />
            </svg>
          </div>
          <p className="text-[11px] text-slate-400 text-center mt-3">Đồ thị thống kê tự động dựa trên 30 ngày hoạt động liên tục gần nhất</p>
        </div>
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
