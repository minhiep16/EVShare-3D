import React, { useState } from 'react';

const HistoryPage = ({ currentUser, bookings }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [period, setPeriod] = useState('month'); // month, quarter, year

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // Map bookings to trips
  const allTrips = (bookings || []).filter(b => b.status === 'COMPLETED' || b.status === 'PENDING').map(b => {
    const start = new Date(b.startTime);
    const end = new Date(b.endTime);
    const diffHours = (end - start) / (1000 * 60 * 60);
    return {
      id: b.id,
      date: start.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
      time: `${start.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`,
      purpose: b.purpose || 'Không rõ',
      icon: 'ph ph-map-pin',
      distance: Math.round(diffHours * 20), // Estimate distance based on duration
      duration: diffHours.toFixed(1),
      cost: Math.round(diffHours * 25000), // Estimate cost
      status: b.status
    };
  });

  // Calculate dynamic KPIs
  const totalTripsCount = allTrips.length;
  const totalDuration = allTrips.reduce((acc, t) => acc + parseFloat(t.duration), 0);
  const totalDistance = allTrips.reduce((acc, t) => acc + t.distance, 0);
  const avgDistance = totalTripsCount > 0 ? (totalDistance / totalTripsCount).toFixed(1) : 0;
  
  const ownership = currentUser?.ownershipPercentage || 33;
  const maxHoursAllowed = (ownership / 100.0) * 168.0; // Per week
  const actualUsagePercentage = maxHoursAllowed > 0 ? ((totalDuration / (maxHoursAllowed * 4)) * 100).toFixed(0) : 0; // Approx month usage vs allowance

  // Filtering trips based on search query
  const filteredTrips = allTrips.filter(t => 
    t.purpose.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="w-10 h-10 rounded-xl bg-[#ecfdf5] flex items-center justify-center text-[#22c55e] mb-3">
            <i className="ph ph-route text-xl"></i>
          </div>
          <p className="text-2xl font-bold text-ink">{totalDistance} km</p>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Tổng quãng đường</p>
          <div className="flex items-center gap-1 mt-1 text-[11px] text-[#16a34a] font-semibold">
            <i className="ph ph-arrow-up-right"></i>Ước tính
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 mb-3">
            <i className="ph ph-clock text-xl"></i>
          </div>
          <p className="text-2xl font-bold text-ink">{totalDuration.toFixed(1)} h</p>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Tổng thời gian sử dụng</p>
          <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-400 font-semibold">
            Tháng {new Date().getMonth() + 1}/{new Date().getFullYear()}
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 mb-3">
            <i className="ph ph-calendar-check text-xl"></i>
          </div>
          <p className="text-2xl font-bold text-ink">{totalTripsCount} chuyến</p>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Số lần sử dụng</p>
          <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-400 font-semibold">TB {avgDistance} km/chuyến</div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-500 mb-3">
            <i className="ph ph-chart-pie text-xl"></i>
          </div>
          <p className="text-2xl font-bold text-ink">{actualUsagePercentage}%</p>
          <p className="text-xs text-slate-500 font-medium mt-0.5">So với tỉ lệ sở hữu</p>
          <div className="flex items-center gap-1 mt-1 text-[11px] text-violet-500 font-semibold">
            Định mức tháng
          </div>
        </div>
      </div>

      {/* Trip Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-ink">Chi tiết chuyến đi</h3>
          <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-500 bg-slate-50">
            <i className="ph ph-magnifying-glass text-sm"></i>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm chuyến đi..." 
              className="bg-transparent outline-none text-sm w-32 placeholder-slate-400 text-ink"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400">
                <th className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wide">Ngày</th>
                <th className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wide">Khung giờ</th>
                <th className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wide">Mục đích</th>
                <th className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wide">Quãng đường</th>
                <th className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wide">Thời gian</th>
                <th className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wide">Chi phí</th>
                <th className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wide">Trạng thái</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-50 text-ink">
              {filteredTrips.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 text-slate-500 whitespace-nowrap">{t.date}</td>
                  <td className="py-3 px-3 whitespace-nowrap">{t.time}</td>
                  <td className="py-3 px-3">
                    <span className="flex items-center gap-1.5">
                      <i className={t.icon}></i>
                      {t.purpose}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold">{t.distance} km</td>
                  <td className="py-3 px-3 text-slate-500">{t.duration} giờ</td>
                  <td className="py-3 px-3 font-medium text-red-500">{formatCurrency(t.cost)}</td>
                  <td className="py-3 px-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      t.status === 'COMPLETED' ? 'text-[#16a34a] bg-[#ecfdf5]' : 'text-amber-600 bg-amber-50'
                    }`}>
                      {t.status === 'COMPLETED' ? 'Hoàn thành' : 'Đang chờ'}
                    </span>
                  </td>
                </tr>
              ))}

              {filteredTrips.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">Không tìm thấy chuyến đi nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
          <span>Hiển thị {filteredTrips.length} / {allTrips.length} chuyến</span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-xs cursor-pointer font-medium">
              ← Trước
            </button>
            <button className="px-3 py-1.5 bg-[#22c55e] text-white rounded-lg text-xs font-semibold cursor-pointer">
              1
            </button>
            <button className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-xs cursor-pointer font-medium">
              Sau →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
