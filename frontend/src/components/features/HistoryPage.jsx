import React, { useState, useEffect } from 'react';
import { getUserCheckinLogs } from '../../services/api';

const HistoryPage = ({ currentUser, bookings }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [period, setPeriod] = useState('month'); // month, quarter, year
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const data = await getUserCheckinLogs();
      setLogs(data);
    } catch (err) {
      console.error(err);
    }
  };

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

  // Calculate dynamic KPIs based on Checkin Logs (real data)
  let actualTrips = 0;
  let actualDistance = 0;
  let actualDurationHours = 0;
  
  // Sort logs ascending to pair checkout and checkin
  const sortedLogs = [...logs].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  const vehicleLastCheckout = {};
  
  sortedLogs.forEach(l => {
    const vId = l.vehicle?.id;
    if (l.type === 'CHECKOUT') {
      vehicleLastCheckout[vId] = new Date(l.timestamp);
    } else if (l.type === 'CHECKIN') {
      actualTrips++;
      
      // Calculate duration
      if (vehicleLastCheckout[vId]) {
        const diffMs = new Date(l.timestamp) - vehicleLastCheckout[vId];
        actualDurationHours += (diffMs / (1000 * 60 * 60));
        vehicleLastCheckout[vId] = null;
      }
      
      // Calculate distance based on cost - penalty
      let penalty = 0;
      try {
        const damages = JSON.parse(l.damages || "[]");
        damages.forEach(d => {
          if (d.severity === 'HEAVY') penalty += 5000000;
          else if (d.severity === 'MEDIUM') penalty += 2000000;
          else if (d.severity === 'LIGHT') penalty += 500000;
        });
      } catch(e) {}
      
      const distanceCost = Math.max(0, (l.cost || 0) - penalty);
      actualDistance += (distanceCost / 2500);
    }
  });

  const avgDistance = actualTrips > 0 ? (actualDistance / actualTrips).toFixed(1) : 0;
  
  const ownership = currentUser?.ownershipPercentage || 33;
  const maxHoursAllowed = (ownership / 100.0) * 168.0; // Per week
  const actualUsagePercentage = maxHoursAllowed > 0 ? ((actualDurationHours / (maxHoursAllowed * 4)) * 100).toFixed(0) : 0; // Approx month usage vs allowance

  // Filtering logs based on search query
  const filteredLogs = logs.filter(t => 
    t.vehicle?.licensePlate?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.type?.toLowerCase().includes(searchQuery.toLowerCase())
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
          <p className="text-2xl font-bold text-ink">{actualDistance.toFixed(1)} km</p>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Tổng quãng đường</p>
          <div className="flex items-center gap-1 mt-1 text-[11px] text-[#16a34a] font-semibold">
            <i className="ph ph-check-circle"></i>Dữ liệu thực tế
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 mb-3">
            <i className="ph ph-clock text-xl"></i>
          </div>
          <p className="text-2xl font-bold text-ink">{actualDurationHours.toFixed(1)} h</p>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Tổng thời gian sử dụng</p>
          <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-400 font-semibold">
            Thực tế giao nhận
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 mb-3">
            <i className="ph ph-calendar-check text-xl"></i>
          </div>
          <p className="text-2xl font-bold text-ink">{actualTrips} chuyến</p>
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
          <h3 className="text-base font-semibold text-ink">Lịch sử Giao/Nhận xe thực tế</h3>
          <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-500 bg-slate-50">
            <i className="ph ph-magnifying-glass text-sm"></i>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm biển số..." 
              className="bg-transparent outline-none text-sm w-32 placeholder-slate-400 text-ink"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400">
                <th className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wide">Người dùng</th>
                <th className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wide">Thời gian</th>
                <th className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wide">Xe</th>
                <th className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wide">Loại</th>
                <th className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wide">Pin / ODO</th>
                <th className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wide">Tình trạng ghi nhận</th>
                <th className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wide">Chi phí phát sinh</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-50 text-ink">
              {filteredLogs.map((t) => {
                let damageList = [];
                try {
                  damageList = t.damages ? JSON.parse(t.damages) : [];
                } catch(e) {}
                
                return (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 whitespace-nowrap font-semibold text-ink">{t.userName || "Hệ thống"}</td>
                  <td className="py-3 px-3 text-slate-500 whitespace-nowrap">{new Date(t.timestamp).toLocaleString('vi-VN')}</td>
                  <td className="py-3 px-3 whitespace-nowrap font-bold text-ink">{t.vehiclePlate ? `${t.vehicleModel || 'Xe'} - ${t.vehiclePlate}` : (t.vehicle?.licensePlate || t.vehicle?.model || "Xe mặc định")}</td>
                  <td className="py-3 px-3">
                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase w-fit ${t.type === 'CHECKIN' ? 'bg-brand-50 text-brand-600' : 'bg-blue-50 text-blue-600'}`}>
                      <i className={t.type === 'CHECKIN' ? 'ph ph-sign-in' : 'ph ph-sign-out'}></i>
                      {t.type === 'CHECKIN' ? 'Nhận xe' : 'Giao xe'}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-xs">
                    <span className="text-brand-600">{t.batteryPercentage}% Pin</span> <br/>
                    <span className="text-blue-600">{t.odometer} km</span>
                  </td>
                  <td className="py-3 px-3 text-xs">
                    {damageList.length > 0 ? (
                      <span className="text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded-lg">Có {damageList.length} lỗi</span>
                    ) : (
                      <span className="text-green-600">Bình thường</span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-medium text-red-500">
                    {t.cost > 0 ? formatCurrency(t.cost) : '-'}
                  </td>
                </tr>
              )})}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">Chưa có lịch sử giao nhận xe nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
          <span>Hiển thị {filteredLogs.length} / {logs.length} giao dịch</span>
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
