import React, { useState } from 'react';

const HistoryPage = ({ currentUser }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [period, setPeriod] = useState('month'); // month, quarter, year

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // Static list of trips matching mockup
  const allTrips = [
    { id: 1, date: '08/06', time: '09:00 – 11:30', purpose: 'Đi công tác Q.1', icon: 'ph ph-briefcase', distance: 45, duration: 2.5, cost: 92000 },
    { id: 2, date: '06/06', time: '15:00 – 17:00', purpose: 'Đón con', icon: 'ph ph-baby', distance: 28, duration: 2.0, cost: 57400 },
    { id: 3, date: '03/06', time: '07:30 – 10:00', purpose: 'Siêu thị', icon: 'ph ph-shopping-cart', distance: 22, duration: 2.5, cost: 45100 },
    { id: 4, date: '28/05', time: '08:00 – 12:00', purpose: 'Du lịch ngắn ngày', icon: 'ph ph-map-pin', distance: 120, duration: 4.0, cost: 246000 },
    { id: 5, date: '22/05', time: '16:00 – 18:30', purpose: 'Khám bệnh', icon: 'ph ph-hospital', distance: 35, duration: 2.5, cost: 71750 },
    { id: 6, date: '18/05', time: '09:00 – 11:00', purpose: 'Họp đối tác', icon: 'ph ph-briefcase', distance: 55, duration: 2.0, cost: 112750 }
  ];

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
          <p className="text-2xl font-bold text-ink">342 km</p>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Tổng quãng đường</p>
          <div className="flex items-center gap-1 mt-1 text-[11px] text-[#16a34a] font-semibold">
            <i className="ph ph-arrow-up-right"></i>+8% vs tháng trước
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 mb-3">
            <i className="ph ph-clock text-xl"></i>
          </div>
          <p className="text-2xl font-bold text-ink">47.5 h</p>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Tổng thời gian sử dụng</p>
          <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-400 font-semibold">Tháng 6/2025</div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 mb-3">
            <i className="ph ph-calendar-check text-xl"></i>
          </div>
          <p className="text-2xl font-bold text-ink">8 chuyến</p>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Số lần sử dụng</p>
          <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-400 font-semibold">TB 42.8 km/chuyến</div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-500 mb-3">
            <i className="ph ph-chart-pie text-xl"></i>
          </div>
          <p className="text-2xl font-bold text-ink">85%</p>
          <p className="text-xs text-slate-500 font-medium mt-0.5">So với tỉ lệ sở hữu</p>
          <div className="flex items-center gap-1 mt-1 text-[11px] text-amber-500 font-semibold">
            <i className="ph ph-warning"></i>Ít hơn 15% định mức
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        
        {/* Line Chart Card (Distance and Hours Trends) */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-ink">Quãng đường & Thời gian sử dụng</h3>
              <p className="text-xs text-slate-400 mt-0.5">6 tháng gần nhất</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-8 h-0.5 bg-[#22c55e] inline-block rounded"></span>Quãng đường (km)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-8 h-0.5 bg-[#60a5fa] inline-block rounded"></span>Giờ sử dụng (h)
              </span>
            </div>
          </div>
          
          {/* Dual-axis SVG Line Chart */}
          <div className="relative w-full h-[260px]">
            <svg viewBox="0 0 600 260" className="w-full h-full">
              {/* Background horizontal grid lines */}
              <line x1="50" y1="30" x2="550" y2="30" stroke="#f8fafc" strokeWidth="1" />
              <line x1="50" y1="80" x2="550" y2="80" stroke="#f8fafc" strokeWidth="1" />
              <line x1="50" y1="130" x2="550" y2="130" stroke="#f8fafc" strokeWidth="1" />
              <line x1="50" y1="180" x2="550" y2="180" stroke="#f8fafc" strokeWidth="1" />
              <line x1="50" y1="220" x2="550" y2="220" stroke="#cbd5e1" strokeWidth="1.5" />

              {/* Y1 axis values (km) */}
              <text x="40" y="34" textAnchor="end" className="text-[10px] fill-brand-600 font-semibold">350</text>
              <text x="40" y="84" textAnchor="end" className="text-[10px] fill-brand-600 font-semibold">250</text>
              <text x="40" y="134" textAnchor="end" className="text-[10px] fill-brand-600 font-semibold">150</text>
              <text x="40" y="184" textAnchor="end" className="text-[10px] fill-brand-600 font-semibold">50</text>

              {/* Y2 axis values (hours) */}
              <text x="560" y="34" textAnchor="start" className="text-[10px] fill-blue-500 font-semibold">50h</text>
              <text x="560" y="84" textAnchor="start" className="text-[10px] fill-blue-500 font-semibold">35h</text>
              <text x="560" y="134" textAnchor="start" className="text-[10px] fill-blue-500 font-semibold">20h</text>
              <text x="560" y="184" textAnchor="start" className="text-[10px] fill-blue-500 font-semibold">5h</text>

              {/* X Axis Labels */}
              {['T1', 'T2', 'T3', 'T4', 'T5', 'T6'].map((m, idx) => (
                <text key={m} x={80 + idx * 85} y="242" textAnchor="middle" className="text-xs font-semibold fill-slate-400">{m}</text>
              ))}

              {/* Distance Area and Line (km) */}
              {/* Coordinates for km: T1(210) -> y: 104, T2(280) -> y: 69, T3(195) -> y: 111, T4(320) -> y: 49, T5(290) -> y: 64, T6(342) -> y: 38 */}
              <path 
                d="M 80,104 L 165,69 L 250,111 L 335,49 L 420,64 L 505,38 L 505,220 L 80,220 Z" 
                fill="rgba(34,197,94,0.08)" 
              />
              <path 
                d="M 80,104 L 165,69 L 250,111 L 335,49 L 420,64 L 505,38" 
                fill="none" 
                stroke="#22c55e" 
                strokeWidth="2.5" 
              />

              {/* Distance markers */}
              <circle cx="80" cy="104" r="3.5" className="fill-[#22c55e]" />
              <circle cx="165" cy="69" r="3.5" className="fill-[#22c55e]" />
              <circle cx="250" cy="111" r="3.5" className="fill-[#22c55e]" />
              <circle cx="335" cy="49" r="3.5" className="fill-[#22c55e]" />
              <circle cx="420" cy="64" r="3.5" className="fill-[#22c55e]" />
              <circle cx="505" cy="38" r="3.5" className="fill-[#22c55e]" />

              {/* Hours Line (hours) */}
              {/* Coordinates for hours: T1(28h) -> y: 106, T2(38h) -> y: 73, T3(26h) -> y: 112, T4(44h) -> y: 53, T5(39h) -> y: 70, T6(47.5h) -> y: 41 */}
              <path 
                d="M 80,106 L 165,73 L 250,112 L 335,53 L 420,70 L 505,41" 
                fill="none" 
                stroke="#60a5fa" 
                strokeWidth="2.5" 
              />

              {/* Hours markers */}
              <circle cx="80" cy="106" r="3.5" className="fill-[#60a5fa]" />
              <circle cx="165" cy="73" r="3.5" className="fill-[#60a5fa]" />
              <circle cx="250" cy="112" r="3.5" className="fill-[#60a5fa]" />
              <circle cx="335" cy="53" r="3.5" className="fill-[#60a5fa]" />
              <circle cx="420" cy="70" r="3.5" className="fill-[#60a5fa]" />
              <circle cx="505" cy="41" r="3.5" className="fill-[#60a5fa]" />
            </svg>
          </div>
        </div>

        {/* Compare Donut Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-ink mb-1">So sánh sử dụng</h3>
            <p className="text-xs text-slate-400 mb-3">% thực tế so với tỉ lệ sở hữu</p>
          </div>
          
          <div className="flex-1 flex items-center justify-center py-2">
            <div className="relative w-44 h-44">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e2e8f0" strokeWidth="3"/>
                {/* Mai: 33% (22c55e) */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#22c55e" strokeWidth="3" strokeDasharray="33 67" strokeLinecap="round"/>
                {/* Bình: 42% (3b82f6) */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#3b82f6" strokeWidth="3" strokeDasharray="42 58" strokeDashoffset="-33" strokeLinecap="round"/>
                {/* Tuấn: 25% (f59e0b) */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="25 75" strokeDashoffset="-75" strokeLinecap="round"/>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-lg font-bold tracking-tight text-ink">Thực tế</p>
                <p className="text-[10px] text-slate-400 font-medium">Đối sánh</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2 mt-2">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]"></span>N.T.Mai (sở hữu 40%)
              </span>
              <span className="font-semibold text-ink">33% thực tế</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>T.V.Bình (sở hữu 30%)
              </span>
              <span className="font-semibold text-ink">42% thực tế</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>L.M.Tuấn (sở hữu 30%)
              </span>
              <span className="font-semibold text-ink">25% thực tế</span>
            </div>
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
                    <span className="text-xs font-medium text-[#16a34a] bg-[#ecfdf5] px-2 py-0.5 rounded-full">
                      Hoàn thành
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
              2
            </button>
            <button className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-xs cursor-pointer font-medium">
              3
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
