import React, { useState } from 'react';

const AdminDashboard = () => {
  const [disputes, setDisputes] = useState([
    { id: 1, group: 'Nhóm #EV-2025-005', priority: 'Ưu tiên cao', text: 'Tranh chấp lịch sử dụng: T.A.Khoa chiếm dụng giờ của N.T.Lan', bg: 'bg-red-50 border-red-100', textColors: 'text-red-800 text-red-700 bg-red-100', solved: false },
    { id: 2, group: 'Nhóm #EV-2024-018', priority: 'Vừa', text: 'Tranh chấp phân chia chi phí sửa chữa sau va chạm nhẹ', bg: 'bg-amber-50 border-amber-100', textColors: 'text-amber-800 text-amber-700 bg-amber-100', solved: false }
  ]);

  const handleSolveDispute = (id, groupName) => {
    setDisputes(prev => prev.map(d => d.id === id ? { ...d, solved: true } : d));
    alert(`⚖️ Đã gửi phương án phân giải cho ${groupName}. Chờ các bên phản hồi xác nhận.`);
  };

  const activeDisputesCount = disputes.filter(d => !d.solved).length;

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active groups */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#ecfdf5] flex items-center justify-center text-[#22c55e]">
              <i className="ph ph-cars text-xl"></i>
            </div>
            <span className="text-xs font-semibold text-[#16a34a] bg-[#ecfdf5] px-1.5 py-0.5 rounded-md">+3 tháng này</span>
          </div>
          <p className="text-3xl font-bold text-ink">24</p>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Nhóm xe đang hoạt động</p>
        </div>

        {/* Co owners */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
              <i className="ph ph-users text-xl"></i>
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">+12</span>
          </div>
          <p className="text-3xl font-bold text-ink">87</p>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Tổng Co-owners</p>
        </div>

        {/* Disputes */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
              <i className="ph ph-scales text-xl"></i>
            </div>
            {activeDisputesCount > 0 ? (
              <span className="text-xs font-semibold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-md">⚠️ {activeDisputesCount} mới</span>
            ) : (
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-md">Sạch sẽ</span>
            )}
          </div>
          <p className="text-3xl font-bold text-ink">{activeDisputesCount}</p>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Tranh chấp đang xử lý</p>
        </div>

        {/* Revenue */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-500">
              <i className="ph ph-chart-line-up text-xl"></i>
            </div>
            <span className="text-xs font-semibold text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded-md">+18%</span>
          </div>
          <p className="text-3xl font-bold text-ink">176M₫</p>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Doanh thu tháng 6</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        
        {/* Revenue SVG Bar Chart */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-ink">Doanh thu & Chi phí vận hành</h3>
              <p className="text-xs text-slate-400 mt-0.5">6 tháng gần nhất (đơn vị: triệu đồng)</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#22c55e] inline-block"></span>Doanh thu
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-slate-200 inline-block"></span>Chi phí
              </span>
            </div>
          </div>
          
          <div className="relative w-full h-[250px]">
            <svg viewBox="0 0 600 250" className="w-full h-full">
              {/* Horizontal Gridlines */}
              <line x1="50" y1="30" x2="570" y2="30" stroke="#f8fafc" strokeWidth="1" />
              <line x1="50" y1="80" x2="570" y2="80" stroke="#f8fafc" strokeWidth="1" />
              <line x1="50" y1="130" x2="570" y2="130" stroke="#f8fafc" strokeWidth="1" />
              <line x1="50" y1="180" x2="570" y2="180" stroke="#f8fafc" strokeWidth="1" />
              <line x1="50" y1="210" x2="570" y2="210" stroke="#cbd5e1" strokeWidth="1.5" />

              {/* Y Axis Values */}
              <text x="40" y="34" textAnchor="end" className="text-[10px] fill-slate-400 font-bold">200M</text>
              <text x="40" y="84" textAnchor="end" className="text-[10px] fill-slate-400 font-bold">150M</text>
              <text x="40" y="134" textAnchor="end" className="text-[10px] fill-slate-400 font-bold">100M</text>
              <text x="40" y="184" textAnchor="end" className="text-[10px] fill-slate-400 font-bold">50M</text>
              <text x="40" y="214" textAnchor="end" className="text-[10px] fill-slate-400 font-bold">0</text>

              {/* T1 */}
              <rect x="75" y="82.2" width="16" height="127.8" rx="2" className="fill-[#22c55e]" />
              <rect x="93" y="157.8" width="16" height="52.2" rx="2" className="fill-slate-200" />
              <text x="92" y="232" textAnchor="middle" className="text-xs font-semibold fill-slate-400">T1</text>
              
              {/* T2 */}
              <rect x="155" y="70.5" width="16" height="139.5" rx="2" className="fill-[#22c55e]" />
              <rect x="173" y="153.3" width="16" height="56.7" rx="2" className="fill-slate-200" />
              <text x="172" y="232" textAnchor="middle" className="text-xs font-semibold fill-slate-400">T2</text>
              
              {/* T3 */}
              <rect x="235" y="76.8" width="16" height="133.2" rx="2" className="fill-[#22c55e]" />
              <rect x="253" y="160.5" width="16" height="49.5" rx="2" className="fill-slate-200" />
              <text x="252" y="232" textAnchor="middle" className="text-xs font-semibold fill-slate-400">T3</text>
              
              {/* T4 */}
              <rect x="315" y="65.1" width="16" height="144.9" rx="2" className="fill-[#22c55e]" />
              <rect x="333" y="147" width="16" height="63" rx="2" className="fill-slate-200" />
              <text x="332" y="232" textAnchor="middle" className="text-xs font-semibold fill-slate-400">T4</text>
              
              {/* T5 */}
              <rect x="395" y="57.9" width="16" height="152.1" rx="2" className="fill-[#22c55e]" />
              <rect x="413" y="148.8" width="16" height="61.2" rx="2" className="fill-slate-200" />
              <text x="412" y="232" textAnchor="middle" className="text-xs font-semibold fill-slate-400">T5</text>
              
              {/* T6 */}
              <rect x="475" y="51.6" width="16" height="158.4" rx="2" className="fill-[#22c55e]" />
              <rect x="493" y="145.2" width="16" height="64.8" rx="2" className="fill-slate-200" />
              <text x="492" y="232" textAnchor="middle" className="text-xs font-semibold fill-slate-400">T6</text>
            </svg>
          </div>
        </div>

        {/* Vehicle Status Donut Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-ink mb-1">Trạng thái xe</h3>
            <p className="text-xs text-slate-400 mb-3">Tổng 28 xe trong hệ thống</p>
          </div>
          
          <div className="flex-1 flex items-center justify-center py-2">
            <div className="relative w-44 h-44">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e2e8f0" strokeWidth="3"/>
                {/* Sẵn sàng (16/28 = 57.1%) */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#22c55e" strokeWidth="3" strokeDasharray="57.1 42.9" strokeLinecap="round"/>
                {/* Đang dùng (8/28 = 28.6%) */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#3b82f6" strokeWidth="3" strokeDasharray="28.6 71.4" strokeDashoffset="-57.1" strokeLinecap="round"/>
                {/* Bảo dưỡng (3/28 = 10.7%) */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="10.7 89.3" strokeDashoffset="-85.7" strokeLinecap="round"/>
                {/* Sự cố (1/28 = 3.6%) */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#ef4444" strokeWidth="3" strokeDasharray="3.6 96.4" strokeDashoffset="-96.4" strokeLinecap="round"/>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-xl font-bold tracking-tight text-ink">28 xe</p>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Hệ thống</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-1.5 mt-2">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]"></span>Sẵn sàng</span>
              <span className="font-bold text-ink">16 xe</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>Đang sử dụng</span>
              <span className="font-bold text-ink">8 xe</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>Bảo dưỡng</span>
              <span className="font-bold text-ink">3 xe</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>Sự cố</span>
              <span className="font-bold text-ink">1 xe</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Groups and Disputes/Services */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        
        {/* Active vehicle groups table */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-ink">Nhóm xe đang hoạt động</h3>
            <a href="#" className="text-sm text-[#22c55e] font-semibold hover:text-[#16a34a]">Xem tất cả</a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400">
                  <th className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wide">Xe</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wide">Nhóm</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wide">Members</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wide">HĐ pháp lý</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wide">Trạng thái</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wide"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-ink">
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3">
                    <div>
                      <p className="font-bold">Tesla Model 3</p>
                      <p className="text-xs text-slate-400">51G-888.99</p>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-500">#EV-2025-001</td>
                  <td className="py-3 px-3">
                    <div className="flex -space-x-1.5">
                      <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg" className="w-6 h-6 rounded-full border-2 border-white object-cover" />
                      <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg" className="w-6 h-6 rounded-full border-2 border-white object-cover" />
                      <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg" className="w-6 h-6 rounded-full border-2 border-white object-cover" />
                    </div>
                  </td>
                  <td className="py-3 px-3"><span className="text-xs text-[#16a34a] font-semibold">✓ HĐ hợp lệ</span></td>
                  <td className="py-3 px-3">
                    <span className="text-xs font-medium text-[#16a34a] bg-[#ecfdf5] px-2 py-0.5 rounded-full">Sẵn sàng</span>
                  </td>
                  <td className="py-3 px-3">
                    <button className="text-slate-400 hover:text-[#22c55e] transition-colors cursor-pointer">
                      <i className="ph ph-arrow-square-out text-lg"></i>
                    </button>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3">
                    <div>
                      <p className="font-bold">VinFast VF9</p>
                      <p className="text-xs text-slate-400">51K-123.45</p>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-500">#EV-2025-002</td>
                  <td className="py-3 px-3">
                    <div className="flex -space-x-1.5">
                      <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg" className="w-6 h-6 rounded-full border-2 border-white object-cover" />
                      <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg" className="w-6 h-6 rounded-full border-2 border-white object-cover" />
                      <span className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 text-[9px] flex items-center justify-center font-bold text-slate-500">+2</span>
                    </div>
                  </td>
                  <td className="py-3 px-3"><span className="text-xs text-[#16a34a] font-semibold">✓ HĐ hợp lệ</span></td>
                  <td className="py-3 px-3">
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Đang dùng</span>
                  </td>
                  <td className="py-3 px-3">
                    <button className="text-slate-400 hover:text-[#22c55e] transition-colors cursor-pointer">
                      <i className="ph ph-arrow-square-out text-lg"></i>
                    </button>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3">
                    <div>
                      <p className="font-bold">Hyundai Ioniq 6</p>
                      <p className="text-xs text-slate-400">79A-456.78</p>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-500">#EV-2025-003</td>
                  <td className="py-3 px-3">
                    <div className="flex -space-x-1.5">
                      <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg" className="w-6 h-6 rounded-full border-2 border-white object-cover" />
                      <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg" className="w-6 h-6 rounded-full border-2 border-white object-cover" />
                      <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-7.jpg" className="w-6 h-6 rounded-full border-2 border-white object-cover" />
                    </div>
                  </td>
                  <td className="py-3 px-3"><span className="text-xs text-amber-600 font-semibold">⏳ HĐ chờ ký</span></td>
                  <td className="py-3 px-3">
                    <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Bảo dưỡng</span>
                  </td>
                  <td className="py-3 px-3">
                    <button className="text-slate-400 hover:text-[#22c55e] transition-colors cursor-pointer">
                      <i className="ph ph-arrow-square-out text-lg"></i>
                    </button>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3">
                    <div>
                      <p className="font-bold">BYD Atto 3</p>
                      <p className="text-xs text-slate-400">43C-789.01</p>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-500">#EV-2024-018</td>
                  <td className="py-3 px-3">
                    <div className="flex -space-x-1.5">
                      <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg" className="w-6 h-6 rounded-full border-2 border-white object-cover" />
                      <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-9.jpg" className="w-6 h-6 rounded-full border-2 border-white object-cover" />
                    </div>
                  </td>
                  <td className="py-3 px-3"><span className="text-xs text-[#16a34a] font-semibold">✓ HĐ hợp lệ</span></td>
                  <td className="py-3 px-3">
                    <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Sự cố</span>
                  </td>
                  <td className="py-3 px-3">
                    <button className="text-slate-400 hover:text-[#22c55e] transition-colors cursor-pointer">
                      <i className="ph ph-arrow-square-out text-lg"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column: Disputes + Pending services */}
        <div className="space-y-5">
          {/* Active disputes */}
          <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <i className="ph ph-scales text-red-500 text-xl"></i>
              <h3 className="text-base font-semibold text-ink">Tranh chấp đang xử lý</h3>
              {activeDisputesCount > 0 && (
                <span className="ml-auto text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full font-semibold">
                  {activeDisputesCount} mới
                </span>
              )}
            </div>
            
            <div className="space-y-3">
              {disputes.map((d) => {
                if (d.solved) return null;
                const isHigh = d.priority === 'Ưu tiên cao';
                
                return (
                  <div key={d.id} className={`p-3 rounded-xl border ${d.bg}`}>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className={`text-xs font-semibold ${isHigh ? 'text-red-800' : 'text-amber-800'}`}>
                        {d.group}
                      </p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold whitespace-nowrap ${
                        isHigh ? 'text-red-600 bg-red-100' : 'text-amber-600 bg-amber-100'
                      }`}>
                        {d.priority}
                      </span>
                    </div>
                    <p className={`text-xs ${isHigh ? 'text-red-700' : 'text-amber-700'} leading-relaxed`}>
                      {d.text}
                    </p>
                    <div className="flex gap-2 mt-2.5">
                      <button 
                        onClick={() => handleSolveDispute(d.id, d.group)}
                        className={`text-[11px] text-white px-2.5 py-1 rounded-lg font-semibold cursor-pointer ${
                          isHigh ? 'bg-red-500 hover:bg-red-600' : 'bg-amber-500 hover:bg-amber-600'
                        }`}
                      >
                        Xử lý
                      </button>
                      <button 
                        onClick={() => alert(`🔍 Đang hiển thị biên bản ghi nhận tranh chấp cho ${d.group}`)}
                        className={`text-[11px] border px-2.5 py-1 rounded-lg font-semibold cursor-pointer ${
                          isHigh ? 'border-red-200 text-red-600 hover:bg-red-100/50' : 'border-amber-200 text-amber-600 hover:bg-amber-100/50'
                        }`}
                      >
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                );
              })}

              {activeDisputesCount === 0 && (
                <div className="text-center py-6 text-slate-400 text-sm">
                  <i className="ph ph-check-circle text-2xl text-[#22c55e] mb-1 block"></i>
                  Không có tranh chấp nào cần xử lý
                </div>
              )}
            </div>
          </div>

          {/* Pending services list */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-ink">Dịch vụ chờ thực hiện</h3>
              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-md font-medium">5 việc</span>
            </div>

            <div className="space-y-2">
              {/* Service 1 */}
              <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <i className="ph ph-wrench text-blue-500 text-sm"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate text-ink">Bảo dưỡng – Tesla Model 3</p>
                  <p className="text-[11px] text-slate-400">Hạn: 15/06/2025</p>
                </div>
                <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                  Sắp đến hạn
                </span>
              </div>

              {/* Service 2 */}
              <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-[#ecfdf5] flex items-center justify-center shrink-0">
                  <i className="ph ph-car text-[#22c55e] text-sm"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate text-ink">Đăng kiểm – VinFast VF9</p>
                  <p className="text-[11px] text-slate-400">Hạn: 20/06/2025</p>
                </div>
                <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                  Đang chờ
                </span>
              </div>

              {/* Service 3 */}
              <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center shrink-0">
                  <i className="ph ph-drop text-cyan-500 text-sm"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate text-ink">Vệ sinh – Hyundai Ioniq 6</p>
                  <p className="text-[11px] text-slate-400">Hạn: 12/06/2025</p>
                </div>
                <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                  Sắp đến hạn
                </span>
              </div>

              {/* Service 4 */}
              <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                  <i className="ph ph-warning text-red-500 text-sm"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate text-ink">Sửa chữa – BYD Atto 3</p>
                  <p className="text-[11px] text-red-500 font-semibold">Khẩn cấp</p>
                </div>
                <span className="text-[10px] font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                  Khẩn cấp
                </span>
              </div>
            </div>
            
            <button className="mt-3 w-full inline-flex items-center justify-center gap-2 border border-[#22c55e] text-[#16a34a] py-2 rounded-lg text-sm font-semibold hover:bg-[#ecfdf5] transition-colors cursor-pointer">
              <i className="ph ph-list-checks"></i>Xem tất cả dịch vụ
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
