import React, { useState, useEffect } from 'react';
import { getUnassignedUsers, getAllVehicles, addMemberToVehicle, getVehicleGroups } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AdminDashboard = () => {
  const [disputes, setDisputes] = useState([
    { id: 1, group: 'Nhóm #EV-2025-005', priority: 'Ưu tiên cao', text: 'Tranh chấp lịch sử dụng: T.A.Khoa chiếm dụng giờ của N.T.Lan', bg: 'bg-red-50 border-red-100', textColors: 'text-red-800 text-red-700 bg-red-100', solved: false },
    { id: 2, group: 'Nhóm #EV-2024-018', priority: 'Vừa', text: 'Tranh chấp phân chia chi phí sửa chữa sau va chạm nhẹ', bg: 'bg-amber-50 border-amber-100', textColors: 'text-amber-800 text-amber-700 bg-amber-100', solved: false }
  ]);

  const [unassignedUsers, setUnassignedUsers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [vehicleGroups, setVehicleGroups] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [ownershipShare, setOwnershipShare] = useState('');

  const revenueData = [
    { name: 'T1', doanhThu: 120, chiPhi: 40 },
    { name: 'T2', doanhThu: 150, chiPhi: 60 },
    { name: 'T3', doanhThu: 130, chiPhi: 50 },
    { name: 'T4', doanhThu: 160, chiPhi: 70 },
    { name: 'T5', doanhThu: 180, chiPhi: 65 },
    { name: 'T6', doanhThu: 176, chiPhi: 80 }
  ];

  const vehicleData = [
    { name: 'Sẵn sàng', value: 16, color: '#22c55e' },
    { name: 'Đang dùng', value: 8, color: '#3b82f6' },
    { name: 'Bảo dưỡng', value: 3, color: '#f59e0b' },
    { name: 'Sự cố', value: 1, color: '#ef4444' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const users = await getUnassignedUsers();
      setUnassignedUsers(users);
      const vehs = await getAllVehicles();
      setVehicles(vehs);
      const groups = await getVehicleGroups();
      setVehicleGroups(groups);
    } catch (err) {
      console.error('Failed to fetch admin data', err);
    }
  };

  const handleAssignMember = async (e) => {
    e.preventDefault();
    if (!selectedUser || !selectedVehicle || !ownershipShare) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }
    
    try {
      await addMemberToVehicle(selectedVehicle, selectedUser, parseFloat(ownershipShare));
      alert('Gán thành viên thành công!');
      setSelectedUser('');
      setSelectedVehicle('');
      setOwnershipShare('');
      fetchData(); // Refresh list
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi gán thành viên');
    }
  };

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
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <RechartsTooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="doanhThu" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={16} name="Doanh thu (Triệu)" />
                <Bar dataKey="chiPhi" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={16} name="Chi phí (Triệu)" />
              </BarChart>
            </ResponsiveContainer>
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
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={vehicleData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {vehicleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
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
                {vehicleGroups.map((group) => {
                  const v = group.vehicle;
                  const members = group.members || [];
                  return (
                    <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3">
                        <div>
                          <p className="font-bold">{v.model}</p>
                          <p className="text-xs text-slate-400">{v.licensePlate}</p>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-500">#EV-2025-{v.id.toString().padStart(3, '0')}</td>
                      <td className="py-3 px-3">
                        <div className="flex -space-x-1.5">
                          {members.length === 0 ? (
                            <span className="text-xs text-slate-400">Trống</span>
                          ) : (
                            members.slice(0, 3).map((m, idx) => (
                              <img key={m.id} src={m.avatarUrl || "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg"} className="w-6 h-6 rounded-full border-2 border-white object-cover" title={m.fullName} />
                            ))
                          )}
                          {members.length > 3 && (
                            <span className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 text-[9px] flex items-center justify-center font-bold text-slate-500">
                              +{members.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        {members.length > 0 ? (
                          <span className="text-xs text-[#16a34a] font-semibold">✓ HĐ hợp lệ</span>
                        ) : (
                          <span className="text-xs text-amber-600 font-semibold">⏳ Chờ TV</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          v.status === 'AVAILABLE' ? 'text-[#16a34a] bg-[#ecfdf5]' :
                          v.status === 'IN_USE' ? 'text-blue-600 bg-blue-50' :
                          v.status === 'MAINTENANCE' ? 'text-amber-600 bg-amber-50' :
                          'text-red-500 bg-red-50'
                        }`}>
                          {v.status === 'AVAILABLE' ? 'Sẵn sàng' : v.status === 'IN_USE' ? 'Đang dùng' : v.status === 'MAINTENANCE' ? 'Bảo dưỡng' : 'Sự cố'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <button className="text-slate-400 hover:text-[#22c55e] transition-colors cursor-pointer">
                          <i className="ph ph-arrow-square-out text-lg"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })}
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

      {/* Member Assignment Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <i className="ph ph-user-plus text-blue-500 text-xl"></i>
          <h3 className="text-base font-semibold text-ink">Gán Xe Cho Thành Viên Mới</h3>
        </div>
        
        <form onSubmit={handleAssignMember} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-500 mb-1">Thành viên chờ</label>
            <select 
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="">-- Chọn thành viên --</option>
              {unassignedUsers.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.phone})</option>
              ))}
            </select>
          </div>
          
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-500 mb-1">Nhóm Xe</label>
            <select 
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="">-- Chọn xe --</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.model} ({v.licensePlate})</option>
              ))}
            </select>
          </div>
          
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-500 mb-1">% Cổ phần</label>
            <div className="relative">
              <input 
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={ownershipShare}
                onChange={(e) => setOwnershipShare(e.target.value)}
                placeholder="Nhập % cổ phần"
                className="w-full px-3 py-2 pr-8 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
              <span className="absolute right-3 top-2 text-sm text-slate-400">%</span>
            </div>
          </div>
          
          <button 
            type="submit"
            disabled={unassignedUsers.length === 0}
            className={`w-full py-2 rounded-lg text-sm font-semibold text-white transition-colors cursor-pointer ${
              unassignedUsers.length === 0 ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            Thêm Thành Viên
          </button>
        </form>
        
        {unassignedUsers.length === 0 && (
          <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
            <i className="ph ph-check-circle text-green-500"></i> Hiện không có thành viên nào đang chờ gán nhóm.
          </p>
        )}
      </div>

    </div>
  );
};

export default AdminDashboard;
