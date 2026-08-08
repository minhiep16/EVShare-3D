import React, { useState, useEffect } from 'react';
import { getAdminDisputes, solveDispute } from '../services/api';

const AdminDisputes = () => {
  const [activeDisputes, setActiveDisputes] = useState([]);
  const [resolvedDisputes, setResolvedDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDisputes = async () => {
      try {
        setLoading(true);
        const data = await getAdminDisputes();
        
        const active = data.filter(d => d.status !== 'RESOLVED').map(d => ({
          id: `DS-${d.id.toString().padStart(4, '0')}`,
          priority: d.priority === 'HIGH' ? 'Ưu tiên cao' : (d.priority === 'MEDIUM' ? 'Vừa' : 'Thấp'),
          openTime: d.createdAt ? new Date(d.createdAt).toLocaleString('vi-VN', {hour: '2-digit', minute:'2-digit', day: '2-digit', month: '2-digit'}) : 'Unknown',
          car: d.vehicle?.model || 'Unknown',
          plate: d.vehicle?.licensePlate || 'Unknown',
          title: d.title,
          desc: d.description,
          defendant: 'Hệ thống tự động',
          defendantAvatar: null,
          complainant: d.createdBy?.name || 'Người dùng',
          complainantAvatar: d.createdBy?.avatarUrl || null,
          dbId: d.id
        }));

        const resolved = data.filter(d => d.status === 'RESOLVED').map(d => ({
          id: `DS-${d.id.toString().padStart(4, '0')}`,
          title: d.title,
          car: d.vehicle?.model || 'Unknown',
          result: 'Đã giải quyết',
          date: d.updatedAt ? new Date(d.updatedAt).toLocaleDateString('vi-VN') : 'Unknown',
          staff: 'Admin EVShare',
          avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-9.jpg'
        }));

        setActiveDisputes(active);
        setResolvedDisputes(resolved);
      } catch (error) {
        console.error("Failed to fetch disputes", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDisputes();
  }, []);

  const handleResolveImmediately = async (dispute) => {
    const penaltyStr = prompt(
      `⚖️ BẮT ĐẦU PHÂN GIẢI VỤ VIỆC #${dispute.id}:\n"${dispute.title}"\n\n` +
      `Nhập số tiền phạt (VNĐ) để khấu trừ từ ví của người vi phạm.\n(Để trống hoặc nhập 0 nếu chỉ cảnh cáo)`
    );

    if (penaltyStr !== null) {
      const penaltyAmount = parseFloat(penaltyStr) || 0;
      
      const accusedUserId = prompt(`Nhập ID của người vi phạm để trừ tiền (nếu có, ví dụ: 2):`, '2');

      try {
        const resolution = `Đã phân xử. Phạt ${new Intl.NumberFormat('vi-VN').format(penaltyAmount)} VNĐ.`;
        await solveDispute(dispute.dbId, resolution, penaltyAmount, accusedUserId ? parseInt(accusedUserId) : null);
        
        // Move to resolved disputes
        const newResolved = {
          id: dispute.id,
          title: dispute.title,
          car: dispute.car,
          result: resolution,
          date: new Date().toLocaleDateString('vi-VN'),
          staff: 'Admin EVShare',
          avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-9.jpg'
        };

        setResolvedDisputes(prev => [newResolved, ...prev]);
        setActiveDisputes(prev => prev.filter(d => d.id !== dispute.id));
        alert(`🎉 Đã giải quyết thành công vụ việc #${dispute.id} và khấu trừ tiền phạt!`);
      } catch (err) {
        console.error("Failed to solve dispute", err);
        alert(`❌ Lỗi khi xử lý vụ việc #${dispute.id}.`);
      }
    } else {
      alert(`🕵️ Đã hủy thao tác phân giải.`);
    }
  };

  const activeCount = activeDisputes.length;
  const highPriorityCount = activeDisputes.filter(d => d.priority === 'Ưu tiên cao').length;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
              <i className="ph ph-scales"></i>
            </div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Đang chờ xử lý</p>
          </div>
          <p className="text-3xl font-bold text-ink">{activeCount < 10 ? `0${activeCount}` : activeCount}</p>
          <p className={`text-xs mt-1 font-medium ${highPriorityCount > 0 ? 'text-red-500' : 'text-slate-400'}`}>
            {highPriorityCount > 0 ? `${highPriorityCount} yêu cầu ưu tiên cao` : 'Không có yêu cầu khẩn cấp'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <i className="ph ph-clock"></i>
            </div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Thời gian trung bình</p>
          </div>
          <p className="text-3xl font-bold text-ink">4.2h</p>
          <p className="text-xs text-brand-600 mt-1 font-semibold">Giảm 15% so với tuần trước</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
              <i className="ph ph-check-circle"></i>
            </div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tỉ lệ hòa giải</p>
          </div>
          <p className="text-3xl font-bold text-ink">92%</p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Dựa trên 45 vụ việc tháng này</p>
        </div>
      </div>

      {/* Active Disputes List */}
      <div className="space-y-6">
        <h2 className="text-base font-bold flex items-center gap-2 text-slate-900">
          <i className="ph ph-lightning text-amber-500 animate-pulse"></i> Tranh chấp đang hoạt động
        </h2>

        {activeDisputes.map((dis) => {
          const isHigh = dis.priority === 'Ưu tiên cao';
          
          return (
            <div 
              key={dis.id} 
              className={`bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row border ${
                isHigh ? 'border-2 border-red-100' : 'border-slate-200'
              }`}
            >
              {/* Left sidebar card in row */}
              <div className={`w-full md:w-64 p-6 border-b md:border-b-0 md:border-r flex flex-col justify-between ${
                isHigh ? 'bg-red-50/50 border-red-100' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <span className={`inline-flex items-center px-2 py-1 text-[10px] font-bold uppercase rounded mb-3 ${
                    isHigh ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                  }`}>
                    {dis.priority}
                  </span>
                  <h3 className={`text-lg font-bold ${isHigh ? 'text-red-900' : 'text-slate-900'}`}>#{dis.id}</h3>
                  <p className={`text-xs font-medium mt-1 ${isHigh ? 'text-red-700' : 'text-slate-500'}`}>Mở lúc: {dis.openTime}</p>
                </div>
                
                <div className="mt-6 md:mt-0">
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">Nhóm xe</p>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-white flex items-center justify-center border ${
                      isHigh ? 'border-red-100' : 'border-slate-200'
                    }`}>
                      <i className={`ph ph-car text-xl ${isHigh ? 'text-red-500' : 'text-slate-400'}`}></i>
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${isHigh ? 'text-red-900' : 'text-slate-950'}`}>{dis.car}</p>
                      <p className={`text-xs ${isHigh ? 'text-red-700' : 'text-slate-500'}`}>{dis.plate}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main content body in row */}
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 mb-2 text-base">{dis.title}</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">{dis.desc}</p>
                    
                    <div className="mt-4 flex flex-wrap gap-4">
                      <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-2.5 py-1.5 border border-slate-200">
                        {dis.defendantAvatar ? (
                          <img src={dis.defendantAvatar} className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold">G18</div>
                        )}
                        <span className="text-xs font-medium text-slate-600">{dis.defendant}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-2.5 py-1.5 border border-slate-200">
                        {dis.complainantAvatar ? (
                          <img src={dis.complainantAvatar} className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold">G18</div>
                        )}
                        <span className="text-xs font-medium text-slate-600">{dis.complainant}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0 self-stretch md:self-auto justify-end">
                    <button 
                      onClick={() => handleResolveImmediately(dis)}
                      className={`px-6 py-2.5 text-white text-sm font-bold rounded-xl transition-all shadow-sm cursor-pointer ${
                        isHigh ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-slate-900 hover:bg-slate-800'
                      }`}
                    >
                      {isHigh ? 'Xử lý ngay' : 'Điều tra'}
                    </button>
                    
                    <button 
                      onClick={() => alert(`📩 Đã gửi tin nhắn nhắc nhở/thông báo hòa giải tới các bên của nhóm xe ${dis.car}.`)}
                      className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      {isHigh ? 'Gửi thông báo' : 'Hòa giải nhanh'}
                    </button>
                  </div>
                </div>

                {isHigh && (
                  <div className="mt-6 pt-6 border-t border-slate-100 flex items-center gap-4 overflow-x-auto pb-2">
                    <div 
                      onClick={() => alert('📊 Log GPS thể hiện xe di chuyển trễ và check-out muộn 2 giờ 12 phút.')}
                      className="w-16 h-16 rounded-lg bg-slate-100 flex flex-col items-center justify-center text-slate-500 border border-slate-200 shrink-0 cursor-pointer hover:bg-slate-200 hover:text-ink transition-colors"
                    >
                      <i className="ph ph-clock-countdown text-xl mb-0.5"></i>
                      <span className="text-[9px] font-bold">Lịch trình</span>
                    </div>
                    
                    <div 
                      onClick={() => alert('💬 Đoạn chat nhóm thể hiện anh Khoa phản hồi trễ và xác nhận trả muộn.')}
                      className="w-16 h-16 rounded-lg bg-slate-100 flex flex-col items-center justify-center text-slate-500 border border-slate-200 shrink-0 cursor-pointer hover:bg-slate-200 hover:text-ink transition-colors"
                    >
                      <i className="ph ph-chat-text text-xl mb-0.5"></i>
                      <span className="text-[9px] font-bold">Tin nhắn</span>
                    </div>
                    
                    <div 
                      onClick={() => alert('📍 Bản đồ GPS xác nhận xe đỗ tại khu vực Quận 7 trong giờ bàn giao.')}
                      className="w-16 h-16 rounded-lg bg-slate-100 flex flex-col items-center justify-center text-slate-500 border border-slate-200 shrink-0 cursor-pointer hover:bg-slate-200 hover:text-ink transition-colors"
                    >
                      <i className="ph ph-map-pin text-xl mb-0.5"></i>
                      <span className="text-[9px] font-bold">Bản đồ</span>
                    </div>
                    
                    <p className="text-xs text-slate-400 font-medium">Nhấp các biểu tượng để xem bằng chứng tự động từ hệ thống (GPS, Log chat, Lịch sử check-out)</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {activeCount === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-green-50 text-[#22c55e] rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
              <i className="ph ph-check-circle-fill"></i>
            </div>
            <h3 className="text-lg font-bold text-ink mb-1">Hoàn thành xuất sắc!</h3>
            <p className="text-sm text-slate-500">Tất cả các vụ tranh chấp trong hệ thống đã được phân giải xong.</p>
          </div>
        )}
      </div>

      {/* Resolved Disputes Section */}
      <div className="mt-12">
        <h2 className="text-base font-bold text-slate-500 mb-6 flex items-center gap-2">
          <i className="ph ph-check-circle"></i> Đã giải quyết gần đây
        </h2>
        
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400">
                  <th className="text-left py-3 px-6 text-xs font-semibold uppercase tracking-wide">Vụ việc</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold uppercase tracking-wide">Nhóm xe</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold uppercase tracking-wide">Kết quả phân giải</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold uppercase tracking-wide">Ngày đóng</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold uppercase tracking-wide">Staff xử lý</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-ink">
                {resolvedDisputes.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-bold">{res.title}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">#{res.id}</p>
                    </td>
                    <td className="py-4 px-6 font-medium">{res.car}</td>
                    <td className="py-4 px-6">
                      <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                        {res.result}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-500 font-medium">{res.date}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <img src={res.avatar} className="w-5 h-5 rounded-full object-cover" />
                        <span className="text-xs font-medium text-slate-700">{res.staff}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDisputes;
