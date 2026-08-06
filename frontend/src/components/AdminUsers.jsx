import React, { useState, useEffect } from 'react';
import { getPendingApprovalUsers, approveUser, rejectUser } from '../services/api';

const AdminUsers = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getPendingApprovalUsers();
      setPendingUsers(data || []);
    } catch (err) {
      console.error('Failed to fetch pending approval users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId, name) => {
    if (!window.confirm(`Bạn có chắc chắn muốn PHÊ DUYỆT tài khoản của "${name}"?`)) {
      return;
    }
    try {
      await approveUser(userId);
      alert(`🎉 Đã phê duyệt kích hoạt tài khoản của "${name}"!`);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert('Phê duyệt tài khoản thất bại: ' + (err.response?.data || err.message));
    }
  };

  const handleReject = async (userId, name) => {
    if (!window.confirm(`Bạn có chắc chắn muốn TỪ CHỐI tài khoản của "${name}"?`)) {
      return;
    }
    try {
      await rejectUser(userId);
      alert(`❌ Đã từ chối và vô hiệu hóa tài khoản của "${name}".`);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert('Từ chối tài khoản thất bại: ' + (err.response?.data || err.message));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-medium">Đang tải danh sách hồ sơ...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Duyệt Hồ Sơ Người Dùng</h2>
          <p className="text-xs text-slate-500">Phê duyệt CCCD và GPLX của chủ xe mới đăng ký trước khi họ xin gia nhập nhóm sở hữu xe điện.</p>
        </div>
        <div className="bg-violet-50 border border-violet-100 text-violet-700 px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0">
          <i className="ph ph-shield-check text-base"></i>
          <span>{pendingUsers.length} hồ sơ chờ duyệt</span>
        </div>
      </div>

      {pendingUsers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
            <i className="ph ph-check-circle"></i>
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">Tất cả sạch sẽ!</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Không có tài khoản nào đang chờ phê duyệt vào lúc này. Tất cả thành viên mới đều đã được kích hoạt.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {pendingUsers.map(user => (
            <div key={user.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col xl:flex-row">
              {/* Left Column: User details */}
              <div className="p-6 xl:w-96 border-b xl:border-b-0 xl:border-r border-slate-200 bg-slate-50/50 shrink-0">
                <div className="flex items-center gap-3.5 mb-5">
                  <img 
                    src={user.avatarUrl || 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg'} 
                    alt="Avatar" 
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900">{user.name}</h4>
                    <span className="text-[10px] bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Chờ xác minh</span>
                  </div>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <span className="block text-slate-400 font-medium mb-0.5">Số điện thoại</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      <i className="ph ph-phone text-slate-400"></i> {user.phone}
                    </span>
                  </div>
                  <div>
                    <span className="block text-slate-400 font-medium mb-0.5">Email</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      <i className="ph ph-envelope text-slate-400"></i> {user.email}
                    </span>
                  </div>
                  <div>
                    <span className="block text-slate-400 font-medium mb-0.5">Số CCCD</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      <i className="ph ph-identification-card text-slate-400"></i> {user.cccd || 'Chưa trích xuất'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-slate-400 font-medium mb-0.5">Số GPLX</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      <i className="ph ph-cardholder text-slate-400"></i> {user.gplx || 'Chưa trích xuất'}
                    </span>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button
                    onClick={() => handleApprove(user.id, user.name)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer shadow-sm shadow-green-600/10 flex items-center justify-center gap-1"
                  >
                    <i className="ph ph-check-bold"></i> Phê duyệt
                  </button>
                  <button
                    onClick={() => handleReject(user.id, user.name)}
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <i className="ph ph-x-bold"></i> Từ chối
                  </button>
                </div>
              </div>

              {/* Right Column: Documents Images Previews */}
              <div className="p-6 flex-1">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Hình ảnh hồ sơ đính kèm (Nhấp vào ảnh để phóng to)</h5>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* CCCD Front Image */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-600">CCCD (Mặt trước)</span>
                    <div 
                      onClick={() => setSelectedImage(user.cccdImageUrl || 'https://via.placeholder.com/300x200?text=CCCD+Mat+truoc')}
                      className="border border-slate-200 rounded-xl overflow-hidden cursor-pointer hover:border-violet-500 transition-colors aspect-[3/2] bg-slate-100 relative group"
                    >
                      <img 
                        src={user.cccdImageUrl || 'https://via.placeholder.com/300x200?text=CCCD+Mat+truoc'} 
                        alt="CCCD Front" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <i className="ph ph-magnifying-glass-plus text-xl"></i>
                      </div>
                    </div>
                  </div>

                  {/* CCCD Back Image */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-600">CCCD (Mặt sau)</span>
                    <div 
                      onClick={() => setSelectedImage(user.cccdBackImageUrl || 'https://via.placeholder.com/300x200?text=CCCD+Mat+sau')}
                      className="border border-slate-200 rounded-xl overflow-hidden cursor-pointer hover:border-violet-500 transition-colors aspect-[3/2] bg-slate-100 relative group"
                    >
                      <img 
                        src={user.cccdBackImageUrl || 'https://via.placeholder.com/300x200?text=CCCD+Mat+sau'} 
                        alt="CCCD Back" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <i className="ph ph-magnifying-glass-plus text-xl"></i>
                      </div>
                    </div>
                  </div>

                  {/* GPLX Image */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-600">Giấy phép lái xe (GPLX)</span>
                    <div 
                      onClick={() => setSelectedImage(user.gplxImageUrl || 'https://via.placeholder.com/300x200?text=GPLX')}
                      className="border border-slate-200 rounded-xl overflow-hidden cursor-pointer hover:border-violet-500 transition-colors aspect-[3/2] bg-slate-100 relative group"
                    >
                      <img 
                        src={user.gplxImageUrl || 'https://via.placeholder.com/300x200?text=GPLX'} 
                        alt="GPLX" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <i className="ph ph-magnifying-glass-plus text-xl"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Zoom Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[85vh] overflow-hidden rounded-2xl bg-slate-900 flex items-center justify-center">
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute right-4 top-4 text-white hover:text-slate-300 z-10 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center"
            >
              <i className="ph ph-x text-lg"></i>
            </button>
            <img 
              src={selectedImage} 
              alt="Zoomed Document" 
              className="max-w-full max-h-[85vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
