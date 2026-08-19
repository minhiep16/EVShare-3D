import React, { useState, useEffect } from 'react';
import { getVehicleGroups, getUnassignedUsers, addMemberToVehicle, approveJoinRequest, rejectJoinRequest } from '../../services/api';
import VehicleShowroom3D from '../3d-architecture/VehicleShowroom3D';

const AdminVehicles = () => {
  const [vehicleGroups, setVehicleGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [unassignedUsers, setUnassignedUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      {/* 3D Vehicle Showroom */}
      <div className="mt-8">
        <VehicleShowroom3D 
          vehicles={vehicleGroups} 
          onAddMember={async (groupId) => {
            setSelectedVehicleId(groupId);
            try {
              const users = await getUnassignedUsers();
              setUnassignedUsers(users);
              setShowAddMemberModal(true);
            } catch (e) {
              alert('Lỗi khi tải danh sách user trống: ' + e.message);
            }
          }}
        />
      </div>

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-gradient-to-br from-[#ecfdf5] to-[#d1fae5] p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#22c55e] shrink-0">
                <i className="ph-fill ph-user-plus text-2xl"></i>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-ink mb-1">Thêm Thành Viên</h3>
                <p className="text-sm text-[#16a34a]/80">Gán người dùng vào nhóm xe. Người này sẽ mặc định có 0% cổ phần ban đầu.</p>
              </div>
              <button 
                onClick={() => setShowAddMemberModal(false)}
                className="w-8 h-8 rounded-full bg-white/50 hover:bg-white text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center shrink-0"
              >
                <i className="ph ph-x text-lg"></i>
              </button>
            </div>
            
            {(() => {
              const pendingRequests = unassignedUsers.filter(user => user.requestedVehicleId === selectedVehicleId);
              const otherUsers = unassignedUsers.filter(user => user.requestedVehicleId !== selectedVehicleId);
              return (
                <div className="p-6 space-y-6">
                  {/* Section 1: Pending Join Requests */}
                  {pendingRequests.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-slate-700 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                        Yêu cầu gia nhập xe này ({pendingRequests.length})
                      </h4>
                      <div className="max-h-48 overflow-y-auto space-y-2.5 pr-1">
                        {pendingRequests.map(user => (
                          <div key={user.id} className="flex items-center justify-between p-3 bg-amber-50/50 rounded-xl border border-amber-100/50">
                            <div className="flex items-center gap-2">
                              <img src={user.avatarUrl || "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg"} className="w-8 h-8 rounded-full object-cover shrink-0" />
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-ink truncate">{user.name || user.username}</p>
                                <p className="text-[11px] text-slate-400">ID: {user.id} · {user.phone}</p>
                              </div>
                            </div>
                            <div className="flex gap-1.5 shrink-0">
                              <button
                                disabled={isSubmitting}
                                onClick={async () => {
                                  try {
                                    setIsSubmitting(true);
                                    await approveJoinRequest(selectedVehicleId, user.id);
                                    alert('✅ Đã duyệt và thêm thành viên vào xe!');
                                    const updated = await getUnassignedUsers();
                                    setUnassignedUsers(updated);
                                    fetchData();
                                  } catch (e) {
                                    alert('Duyệt thất bại: ' + (e.response?.data?.message || e.response?.data || e.message));
                                  } finally {
                                    setIsSubmitting(false);
                                  }
                                }}
                                className="text-xs bg-[#22c55e] hover:bg-[#16a34a] text-white px-2.5 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer"
                              >
                                Duyệt
                              </button>
                              <button
                                disabled={isSubmitting}
                                onClick={async () => {
                                  try {
                                    setIsSubmitting(true);
                                    await rejectJoinRequest(selectedVehicleId, user.id);
                                    alert('❌ Đã từ chối yêu cầu gia nhập.');
                                    const updated = await getUnassignedUsers();
                                    setUnassignedUsers(updated);
                                    fetchData();
                                  } catch (e) {
                                    alert('Từ chối thất bại: ' + (e.response?.data?.message || e.response?.data || e.message));
                                  } finally {
                                    setIsSubmitting(false);
                                  }
                                }}
                                className="text-xs border border-slate-200 text-slate-600 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer"
                              >
                                Từ chối
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Section 2: Add Direct / Other unassigned users */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-700 border-b border-slate-100 pb-2">
                      Thêm trực tiếp thành viên khác
                    </h4>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5">Chọn người dùng</label>
                      {otherUsers.length === 0 ? (
                        <div className="p-3 bg-slate-50 text-slate-500 rounded-lg text-xs text-center border border-slate-200">
                          Không có người dùng trống nào khác.
                        </div>
                      ) : (
                        <select 
                          value={selectedUserId}
                          onChange={(e) => setSelectedUserId(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e]/20 transition-all font-medium text-ink"
                        >
                          <option value="">-- Chọn thành viên --</option>
                          {otherUsers.map(user => (
                            <option key={user.id} value={user.id}>
                              {user.name || user.username} (ID: {user.id}) {user.phone ? `· ${user.phone}` : ''}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    
                    <button 
                      onClick={async () => {
                        if (!selectedUserId) return alert('Vui lòng chọn người dùng!');
                        try {
                          setIsSubmitting(true);
                          await addMemberToVehicle(selectedVehicleId, selectedUserId, 0); // 0% by default
                          alert('✅ Đã thêm thành viên thành công!');
                          setSelectedUserId('');
                          setShowAddMemberModal(false);
                          fetchData(); // reload table
                        } catch (e) {
                          alert('Lỗi: ' + (e.response?.data || e.message));
                        } finally {
                          setIsSubmitting(false);
                        }
                      }}
                      disabled={isSubmitting || !selectedUserId}
                      className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold py-3.5 rounded-xl transition-all shadow-sm shadow-[#22c55e]/30 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmitting ? 'Đang thêm...' : 'Xác nhận Thêm'}
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminVehicles;
