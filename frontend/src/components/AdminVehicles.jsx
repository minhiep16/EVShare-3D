import React, { useState, useEffect } from 'react';
import { getVehicleGroups } from '../services/api';

const AdminVehicles = () => {
  const [vehicleGroups, setVehicleGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const groups = await getVehicleGroups();
      setVehicleGroups(groups || []);
    } catch (error) {
      console.error('Failed to fetch vehicle groups', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center shrink-0">
            <i className="ph ph-cars text-2xl"></i>
          </div>
          <div>
            <p className="text-3xl font-bold text-ink">{vehicleGroups.length}</p>
            <p className="text-sm font-medium text-slate-500">Tổng số xe nhóm</p>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-[#ecfdf5] text-[#22c55e] rounded-xl flex items-center justify-center shrink-0">
            <i className="ph ph-users-three text-2xl"></i>
          </div>
          <div>
            <p className="text-3xl font-bold text-ink">
              {vehicleGroups.reduce((acc, group) => acc + (group.members?.length || 0), 0)}
            </p>
            <p className="text-sm font-medium text-slate-500">Thành viên tham gia</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center shrink-0">
            <i className="ph ph-battery-charging text-2xl"></i>
          </div>
          <div>
            <p className="text-3xl font-bold text-ink">
              {vehicleGroups.length > 0 
                ? Math.round(vehicleGroups.reduce((acc, group) => acc + (group.vehicle?.batteryPercentage || 0), 0) / vehicleGroups.length) 
                : 0}%
            </p>
            <p className="text-sm font-medium text-slate-500">Pin trung bình hệ thống</p>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-ink">Danh sách nhóm xe</h3>
            <p className="text-sm text-slate-500 mt-1">Quản lý chi tiết phương tiện và thành viên đồng sở hữu</p>
          </div>
          <button 
            onClick={() => alert('Chức năng thêm xe mới đang mở ở màn hình Trang chủ (Dashboard).')}
            className="bg-[#22c55e] hover:bg-[#16a34a] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer flex items-center gap-2"
          >
            <i className="ph ph-plus-circle text-lg"></i>Thêm xe mới
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500">
                <th className="text-left py-4 px-6 font-semibold uppercase tracking-wider text-xs">Phương tiện</th>
                <th className="text-left py-4 px-6 font-semibold uppercase tracking-wider text-xs">Thành viên & Cổ phần</th>
                <th className="text-left py-4 px-6 font-semibold uppercase tracking-wider text-xs">Thông số & Quỹ chung</th>
                <th className="text-left py-4 px-6 font-semibold uppercase tracking-wider text-xs">Trạng thái</th>
                <th className="text-left py-4 px-6 font-semibold uppercase tracking-wider text-xs">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vehicleGroups.map((group) => {
                const v = group.vehicle;
                const members = group.members || [];
                return (
                  <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                    
                    {/* Vehicle Info */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <img 
                          src={v.imageUrl || "https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"} 
                          alt={v.model}
                          className="w-16 h-12 rounded-lg object-cover bg-slate-100 border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-ink text-base">{v.model}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-mono font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                              {v.licensePlate}
                            </span>
                            <span className="text-xs text-slate-400">ID: #{v.id.toString().padStart(3, '0')}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    {/* Members & Ownership */}
                    <td className="py-4 px-6">
                      {members.length > 0 ? (
                        <div className="space-y-2">
                          {members.map(m => (
                            <div key={m.id} className="flex items-center gap-2">
                              <img src={m.avatarUrl || "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg"} className="w-6 h-6 rounded-full object-cover" title={m.name || m.username} />
                              <span className="text-sm font-medium text-ink w-32 truncate">{m.name || m.username}</span>
                              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{m.ownershipPercentage}%</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-amber-600 bg-amber-50 px-3 py-1 rounded-full font-semibold border border-amber-100">
                          <i className="ph ph-warning-circle mr-1"></i>Chưa có thành viên
                        </span>
                      )}
                    </td>

                    {/* Stats & Fund */}
                    <td className="py-4 px-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <i className="ph ph-battery-charging text-green-500"></i> Pin: {v.batteryPercentage}%
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <i className="ph ph-speedometer text-blue-500"></i> ODO: {v.odometer || 0} km
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <i className="ph ph-vault text-amber-500"></i> Quỹ: <span className="font-semibold text-ink">{formatCurrency(v.jointFundBalance)}</span>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                        v.status === 'AVAILABLE' ? 'bg-[#ecfdf5] text-[#16a34a] border-[#22c55e]/20' :
                        v.status === 'IN_USE' ? 'bg-blue-50 text-blue-600 border-blue-500/20' :
                        v.status === 'MAINTENANCE' ? 'bg-amber-50 text-amber-600 border-amber-500/20' :
                        'bg-red-50 text-red-600 border-red-500/20'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          v.status === 'AVAILABLE' ? 'bg-[#22c55e]' :
                          v.status === 'IN_USE' ? 'bg-blue-500' :
                          v.status === 'MAINTENANCE' ? 'bg-amber-500' :
                          'bg-red-500'
                        }`}></span>
                        {v.status === 'AVAILABLE' ? 'Sẵn sàng' : v.status === 'IN_USE' ? 'Đang dùng' : v.status === 'MAINTENANCE' ? 'Bảo dưỡng' : 'Sự cố'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => alert('Đang mở form chỉnh sửa thông tin xe...')}
                          className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                          title="Sửa xe"
                        >
                          <i className="ph ph-pencil-simple text-base"></i>
                        </button>
                        <button 
                          onClick={() => alert('Đã sao chép liên kết chia sẻ nhóm xe!')}
                          className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                          title="Chia sẻ"
                        >
                          <i className="ph ph-share-network text-base"></i>
                        </button>
                      </div>
                    </td>
                    
                  </tr>
                );
              })}

              {vehicleGroups.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-3xl mx-auto mb-3">
                      <i className="ph ph-car-profile"></i>
                    </div>
                    <p className="text-base font-semibold text-ink mb-1">Chưa có nhóm xe nào</p>
                    <p className="text-sm">Hãy tạo xe mới để bắt đầu.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminVehicles;
