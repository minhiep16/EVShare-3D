import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import VehicleHero from './components/VehicleHero';
import KPICards from './components/KPICards';
import BookingCalendar from './components/BookingCalendar';
import CostChart from './components/CostChart';
import CoOwners from './components/CoOwners';
import AISuggestions from './components/AISuggestions';
import BookingPage from './components/BookingPage';
import CostPage from './components/CostPage';
import GroupPage from './components/GroupPage';
import HistoryPage from './components/HistoryPage';
import ContractPage from './components/ContractPage';
import AdminDashboard from './components/AdminDashboard';
import AdminDisputes from './components/AdminDisputes';
import AdminFinance from './components/AdminFinance';
import AdminServices from './components/AdminServices';
import LoginPage from './components/LoginPage';
import VehicleCheckin3D from './components/VehicleCheckin3D';
import AdminVehicles from './components/AdminVehicles';
import AdminContracts from './components/AdminContracts';
import AdminUsers from './components/AdminUsers';
import { getDashboardData, createBooking, castVote, createVehicle, getUnassignedUsers, addMemberToVehicle, requestJoinVehicle, approveJoinRequest, rejectJoinRequest } from './services/api';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('evshare_isAuthenticated') === 'true');
  const [currentUserInfo, setCurrentUserInfo] = useState(() => {
    const saved = localStorage.getItem('evshare_currentUserInfo');
    return saved ? JSON.parse(saved) : null;
  });
  const currentRole = currentUserInfo?.role || 'USER';
  
  const [isCreateVehicleModalOpen, setIsCreateVehicleModalOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ model: '', licensePlate: '', imageUrl: '' });
  const [creatingVehicle, setCreatingVehicle] = useState(false);
  
  // Add Member Modal State (for Group Leader)
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [unassignedUsers, setUnassignedUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Deposit Wallet Modal State
  const [showDepositWalletModal, setShowDepositWalletModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [isSubmittingWallet, setIsSubmittingWallet] = useState(false);

  const fetchDashboard = async (userId) => {
    try {
      setLoading(true);
      const res = await getDashboardData(userId);
      setData(res);
      setError(null);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 403 || err.response?.status === 401) {
        setIsAuthenticated(false);
        setCurrentUserInfo(null);
        localStorage.removeItem('evshare_isAuthenticated');
        localStorage.removeItem('evshare_currentUserInfo');
        localStorage.removeItem('evshare_jwt_token');
        return;
      }
      setError('Không thể kết nối đến máy chủ. Vui lòng đảm bảo backend đang chạy và cơ sở dữ liệu đã được khởi động.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && currentUserInfo?.id) {
      fetchDashboard(currentUserInfo.id);
    }
  }, [isAuthenticated, currentUserInfo]);

  const handleBookingSubmit = async (bookingRequest) => {
    await createBooking(bookingRequest);
    fetchDashboard();
  };

  const handleVoteClick = async (voteId, agree) => {
    try {
      if (voteId) {
        await castVote(voteId, agree);
      }
      fetchDashboard();
    } catch (err) {
      console.error(err);
      alert('Không thể thực hiện bỏ phiếu: ' + (err.response?.data?.message || err.response?.data || err.message));
    }
  };

  const handleAIChat = () => {
    alert('🤖 Tính năng Chat với AI đang được phát triển!');
  };

  const handleCreateVehicleSubmit = async (e) => {
    e.preventDefault();
    if (!newVehicle.model || !newVehicle.licensePlate) {
      alert('Vui lòng nhập đủ Model và Biển số xe');
      return;
    }
    try {
      setCreatingVehicle(true);
      await createVehicle({
        model: newVehicle.model,
        licensePlate: newVehicle.licensePlate,
        imageUrl: newVehicle.imageUrl || 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      });
      alert('✅ Tạo nhóm xe mới thành công!');
      setIsCreateVehicleModalOpen(false);
      setNewVehicle({ model: '', licensePlate: '', imageUrl: '' });
      // If admin, we should refresh the admin dashboard, but here we just fetchDashboard
      fetchDashboard(currentUserInfo?.id || 1);
    } catch (err) {
      console.error(err);
      alert('❌ Có lỗi xảy ra khi tạo nhóm xe');
    } finally {
      setCreatingVehicle(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <LoginPage 
        onLoginSuccess={(role, userInfo) => {
          const infoWithRole = { ...userInfo, role };
          setIsAuthenticated(true);
          localStorage.setItem('evshare_isAuthenticated', 'true');
          setCurrentUserInfo(infoWithRole);
          localStorage.setItem('evshare_currentUserInfo', JSON.stringify(infoWithRole));
          
          if (role === 'ADMIN') {
            setActiveTab('admin_dashboard');
          } else {
            setActiveTab('dashboard');
          }
        }} 
      />
    );
  }

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col gap-4">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-600">Đang tải bảng điều khiển...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md shadow-sm">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
            <i className="ph ph-warning-circle"></i>
          </div>
          <h2 className="text-lg font-bold text-ink mb-2">Lỗi Kết Nối</h2>
          <p className="text-sm text-slate-500 mb-6">{error}</p>
          <button 
            onClick={() => {
              let uid = 1;
              if (currentUserInfo) {
                if (currentUserInfo.fullName && currentUserInfo.fullName.includes('Bình')) uid = 2;
                else if (currentUserInfo.fullName && currentUserInfo.fullName.includes('Tuấn')) uid = 3;
                else if (currentUserInfo.id) uid = currentUserInfo.id;
              }
              fetchDashboard(uid);
            }}
            className="w-full bg-brand-500 hover:bg-brand-600 text-white font-medium py-2.5 px-4 rounded-lg transition-colors cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // User and Admin Profiles
  const activeUser = currentUserInfo ? {
    id: currentUserInfo.id,
    name: currentUserInfo.fullName,
    avatarUrl: currentUserInfo.avatarUrl || (currentRole === 'ADMIN' ? 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-9.jpg' : 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg'),
    role: currentRole === 'ADMIN' ? 'Administrator' : 'Co-owner'
  } : null;

  // Find the exact profile from the backend data using activeUser.id
  const userProfile = activeUser ? data?.coOwners?.find(u => u.id === activeUser.id) : data?.coOwners?.[0];

  const currentUserBase = activeUser || (currentRole === 'USER' ? {
    id: userProfile?.id || 1,
    name: userProfile?.name || 'Nguyễn Thị Mai',
    avatarUrl: userProfile?.avatarUrl || 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg',
    role: 'Co-owner'
  } : {
    id: 4,
    name: 'Phạm Quốc Hùng',
    avatarUrl: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-9.jpg',
    role: 'Administrator'
  });
  
  const currentUser = {
    ...currentUserBase,
    vehicle: data?.vehicle,
    isGroupLeader: userProfile?.isGroupLeader || false,
    ownershipPercentage: userProfile?.ownershipPercentage || 0,
    requestedVehicleId: userProfile?.requestedVehicleId || null,
    status: userProfile?.status || currentUserInfo?.status || 'PENDING_APPROVAL'
  };
  const ownershipPercentage = userProfile?.ownershipPercentage || 40;

  const handleRoleChange = (newRole) => {
    // Legacy mock function removed
  };

  return (
    <div className="bg-slate-50 text-ink font-sans antialiased min-h-screen flex">
      {/* Desktop Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentUser={currentUser}
        notificationCount={3}
        currentRole={currentRole}
        hasVehicle={!!data?.vehicle}
        onLogout={() => {
          setIsAuthenticated(false);
          setCurrentUserInfo(null);
          localStorage.removeItem('evshare_isAuthenticated');
          localStorage.removeItem('evshare_currentUserInfo');
          localStorage.removeItem('evshare_jwt_token');
        }}
        onDepositWalletClick={() => setShowDepositWalletModal(true)}
      />

      {/* Mobile Sidebar overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-slate-900/60 backdrop-blur-sm">
          <div className="w-[260px] bg-ink flex flex-col h-full animate-slide-in">
            <div className="h-[72px] flex items-center justify-between px-6 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <span className="text-brand-500"><i className="ph-fill ph-lightning text-2xl"></i></span>
                <span className="text-xl font-semibold tracking-tight text-white">EVShare</span>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <i className="ph ph-x text-2xl"></i>
              </button>
            </div>
            {/* Reuse navbar links in mobile sidebar */}
            <div className="flex-1 overflow-y-auto py-4">
              <Sidebar 
                activeTab={activeTab} 
                setActiveTab={(tab) => {
                  setActiveTab(tab);
                  setMobileMenuOpen(false);
                }} 
                currentUser={currentUser}
                notificationCount={3}
                currentRole={currentRole}
                hasVehicle={!!data?.vehicle}
                onLogout={() => {
                  setIsAuthenticated(false);
                  setCurrentUserInfo(null);
                  setMobileMenuOpen(false);
                  localStorage.removeItem('evshare_isAuthenticated');
                  localStorage.removeItem('evshare_currentUserInfo');
                  localStorage.removeItem('evshare_jwt_token');
                }}
                onDepositWalletClick={() => setShowDepositWalletModal(true)}
              />
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)}></div>
        </div>
      )}

      {/* Main content body */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        <Header 
          currentUser={currentUser} 
          activeTab={activeTab}
          coOwners={data?.coOwners || []}
          vehicle={data?.vehicle}
          onMenuToggle={() => setMobileMenuOpen(true)}
          onCreateVehicle={() => setIsCreateVehicleModalOpen(true)}
          onAddMemberClick={async () => {
            try {
              const users = await getUnassignedUsers();
              setUnassignedUsers(users);
              setShowAddMemberModal(true);
            } catch (e) {
              alert('Lỗi khi tải danh sách user trống: ' + e.message);
            }
          }}
        />

        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-[1400px] mx-auto space-y-6">
            
            {activeTab === 'dashboard' && (
              <>
                {data?.vehicle ? (
                  <>
                    {/* Row 1: Vehicle Hero */}
                    <VehicleHero 
                      vehicle={data?.vehicle}
                      coOwnersCount={data?.coOwners?.length || 3}
                      coOwners={data?.coOwners || []}
                      ownershipPercentage={ownershipPercentage}
                      onBookNow={() => setActiveTab('booking')}
                    />

                    {/* Row 2: KPI statistics */}
                    <KPICards kpi={data?.kpi} />

                    {/* Row 3: Calendar Scheduler + Cost Chart */}
                    <section className="grid grid-cols-1 xl:grid-cols-10 gap-6">
                      <BookingCalendar 
                        bookings={data?.bookings || []} 
                        onSelectAll={() => alert('Chi tiết toàn bộ lịch đặt xe sẽ được hiển thị!')}
                      />
                      
                      <CostChart transactions={data?.transactions || []} />
                    </section>

                    {/* Row 4: Owner Group + AI Suggestions */}
                    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <CoOwners 
                        coOwners={data?.coOwners || []}
                        activeVotes={data?.activeVotes || []}
                        onVoteClick={handleVoteClick}
                      />

                      <AISuggestions 
                        suggestions={data?.suggestions || []}
                        onAIChatClick={handleAIChat}
                      />
                    </section>
                  </>
                ) : currentUser.status === 'PENDING_APPROVAL' ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm max-w-2xl mx-auto mt-8 animate-fade-in">
                    <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 animate-pulse">
                      <i className="ph ph-shield-warning"></i>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Hồ sơ tài khoản chờ phê duyệt</h3>
                    <p className="text-sm text-slate-500 mb-6">
                      Tài khoản của bạn đang trong trạng thái chờ quản trị viên phê duyệt xác minh tài liệu (CCCD & GPLX). 
                      Chỉ sau khi hồ sơ được duyệt, bạn mới có thể thực hiện xin vào nhóm hoặc được các thành viên khác mời vào nhóm xe.
                    </p>
                    <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-600 inline-flex flex-col gap-1 text-left">
                      <div>• <strong>Họ tên:</strong> {currentUserInfo?.fullName}</div>
                      <div>• <strong>Số điện thoại:</strong> {currentUserInfo?.phone}</div>
                      <div>• <strong>Trạng thái:</strong> ⏳ Đang chờ xác minh</div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
                      <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 animate-pulse">
                        <i className="ph ph-hourglass-high"></i>
                      </div>
                      <h3 className="text-xl font-bold text-ink mb-2">Tài khoản đang chờ xử lý</h3>
                      <p className="text-sm text-slate-500 max-w-md mx-auto mb-2">
                        Tài khoản của bạn đã được ghi nhận. Vui lòng chọn một nhóm xe bên dưới để xin tham gia. 
                        Sau khi được Admin hoặc Nhóm trưởng duyệt, bạn sẽ có quyền truy cập đầy đủ.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {data?.availableVehicles?.map(v => (
                        <div key={v.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                          <img 
                            src={v.imageUrl || "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=400&q=80"} 
                            alt={v.model}
                            className="w-full h-32 object-cover rounded-xl mb-4"
                          />
                          <h4 className="font-bold text-lg mb-1">{v.model}</h4>
                          <p className="text-sm text-slate-500 font-medium mb-4">{v.licensePlate} • Nhóm #{v.id}</p>
                          
                          <div className="flex gap-2">
                            <button
                              disabled={currentUser.requestedVehicleId === v.id || isSubmitting}
                              onClick={async () => {
                                try {
                                  setIsSubmitting(true);
                                  await requestJoinVehicle(v.id);
                                  alert('✅ Đã gửi yêu cầu tham gia thành công! Vui lòng chờ phản hồi.');
                                  fetchDashboard(currentUser.id);
                                } catch (e) {
                                  alert('Lỗi: ' + (e.response?.data || e.message));
                                } finally {
                                  setIsSubmitting(false);
                                }
                              }}
                              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                currentUser.requestedVehicleId === v.id 
                                  ? 'bg-amber-100 text-amber-700 cursor-not-allowed'
                                  : 'bg-[#22c55e] hover:bg-[#16a34a] text-white cursor-pointer'
                              }`}
                            >
                              {currentUser.requestedVehicleId === v.id ? '⏳ Đang chờ duyệt...' : 'Xin vào nhóm'}
                            </button>
                            <button 
                              onClick={() => alert(`📑 Mở chi tiết hợp đồng cho xe ${v.model}`)}
                              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                            >
                              <i className="ph ph-file-text text-lg"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'booking' && (
              <BookingPage 
                bookings={data?.bookings || []}
                coOwners={data?.coOwners || []}
                currentUser={currentUser}
                onSubmitBooking={handleBookingSubmit}
              />
            )}

            {activeTab === 'cost' && (
              <CostPage 
                transactions={data?.transactions || []}
                coOwners={data?.coOwners || []}
                currentUser={currentUser}
              />
            )}

            {activeTab === 'group' && (
              <GroupPage 
                coOwners={data?.coOwners || []}
                activeVotes={data?.activeVotes || []}
                currentUser={currentUser}
                onVoteCast={handleVoteClick}
              />
            )}

            {activeTab === 'history' && (
              <HistoryPage 
                currentUser={currentUser}
                bookings={data?.bookings || []}
              />
            )}

            {activeTab === 'contract' && (
              <ContractPage 
                currentUser={currentUser}
                vehicle={data?.vehicle}
                coOwners={data?.coOwners || []}
              />
            )}

            {activeTab === 'admin_dashboard' && (
              <AdminDashboard />
            )}

            {activeTab === 'admin_checkin' && (
              <VehicleCheckin3D />
            )}

            {activeTab === 'admin_disputes' && (
              <AdminDisputes />
            )}

            {activeTab === 'admin_finance' && (
              <AdminFinance />
            )}

            {activeTab === 'admin_services' && (
              <AdminServices />
            )}

            {activeTab === 'admin_vehicles' && (
              <AdminVehicles />
            )}

            {activeTab === 'admin_users' && (
              <AdminUsers />
            )}

            {activeTab === 'admin_contracts' && (
              <AdminContracts />
            )}

            {['admin_staff'].includes(activeTab) && (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                <div className="w-16 h-16 bg-violet-50 text-violet-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                  <i className="ph ph-squares-four text-violet-600"></i>
                </div>
                <h3 className="text-lg font-bold text-ink mb-1">Chức năng Admin đang phát triển</h3>
                <p className="text-sm text-slate-500 mb-6">Trang này đang được phát triển trong phiên bản tiếp theo của phân hệ quản trị.</p>
                <button 
                  onClick={() => setActiveTab('admin_dashboard')}
                  className="bg-violet-600 hover:bg-violet-700 text-white font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer text-sm"
                >
                  Quay lại Admin Dashboard
                </button>
              </div>
            )}

            {['notifications'].includes(activeTab) && (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                  <i className="ph ph-folder-open"></i>
                </div>
                <h3 className="text-lg font-bold text-ink mb-1">Chức năng đang được cập nhật</h3>
                <p className="text-sm text-slate-500 mb-6">Trang này đang được phát triển trong phiên bản tiếp theo.</p>
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className="bg-brand-500 hover:bg-brand-600 text-white font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer text-sm"
                >
                  Quay lại Dashboard
                </button>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* Create Vehicle Modal */}
      {isCreateVehicleModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up border border-slate-100">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-brand-600 to-brand-500 p-6 flex items-start justify-between relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-white mb-1">Thêm Nhóm Xe Mới</h3>
                <p className="text-brand-100 text-xs">Khởi tạo và cấu hình phương tiện vào hệ thống</p>
              </div>
              <button 
                onClick={() => setIsCreateVehicleModalOpen(false)}
                className="relative z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <i className="ph ph-x"></i>
              </button>
            </div>
            
            <form onSubmit={handleCreateVehicleSubmit} className="p-6 space-y-5">
              {/* Form Body */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Dòng xe (Model) <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <i className="ph ph-car text-slate-400 text-lg"></i>
                    </div>
                    <input 
                      type="text"
                      required
                      placeholder="VD: VinFast VF8"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 focus:bg-white transition-all font-medium text-ink placeholder:font-normal"
                      value={newVehicle.model}
                      onChange={e => setNewVehicle({...newVehicle, model: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Biển số xe <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <i className="ph ph-tag text-slate-400 text-lg"></i>
                    </div>
                    <input 
                      type="text"
                      required
                      placeholder="VD: 51H-123.45"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 focus:bg-white transition-all font-mono font-bold text-ink placeholder:font-normal placeholder:font-sans"
                      value={newVehicle.licensePlate}
                      onChange={e => setNewVehicle({...newVehicle, licensePlate: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Hình ảnh xe (URL)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <i className="ph ph-image text-slate-400 text-lg"></i>
                    </div>
                    <input 
                      type="url"
                      placeholder="https://..."
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 focus:bg-white transition-all font-medium text-ink placeholder:font-normal"
                      value={newVehicle.imageUrl}
                      onChange={e => setNewVehicle({...newVehicle, imageUrl: e.target.value})}
                    />
                  </div>
                  {newVehicle.imageUrl && (
                    <div className="mt-3 rounded-lg overflow-hidden border border-slate-200 h-28 relative bg-slate-100">
                      <img src={newVehicle.imageUrl} className="w-full h-full object-cover" alt="Preview" onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&q=80"; }}/>
                      <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-md">Preview</div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-100">
                <button 
                  type="submit"
                  disabled={creatingVehicle}
                  className={`w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all shadow-lg shadow-brand-500/20 cursor-pointer flex items-center justify-center gap-2 ${
                    creatingVehicle ? 'bg-brand-400 cursor-not-allowed' : 'bg-brand-500 hover:bg-brand-600 hover:-translate-y-0.5'
                  }`}
                >
                  {creatingVehicle ? (
                    <><i className="ph ph-spinner animate-spin text-xl"></i> Đang khởi tạo...</>
                  ) : (
                    <><i className="ph ph-rocket-launch text-xl"></i> Khởi tạo Nhóm Xe</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal (Group Leader) */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-gradient-to-br from-[#ecfdf5] to-[#d1fae5] p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#22c55e] shrink-0">
                <i className="ph-fill ph-user-plus text-2xl"></i>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-ink mb-1">Thêm Thành Viên</h3>
                <p className="text-sm text-[#16a34a]/80">Mời người dùng vào nhóm xe. Thành viên mới sẽ có 0% cổ phần ban đầu.</p>
              </div>
              <button 
                onClick={() => setShowAddMemberModal(false)}
                className="w-8 h-8 rounded-full bg-white/50 hover:bg-white text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center shrink-0"
              >
                <i className="ph ph-x text-lg"></i>
              </button>
            </div>
            
            {(() => {
              const pendingRequests = unassignedUsers.filter(user => user.requestedVehicleId === data?.vehicle?.id);
              const otherUsers = unassignedUsers.filter(user => user.requestedVehicleId !== data?.vehicle?.id);
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
                                    await approveJoinRequest(data?.vehicle?.id, user.id);
                                    alert('✅ Đã duyệt và thêm thành viên vào xe!');
                                    const updated = await getUnassignedUsers();
                                    setUnassignedUsers(updated);
                                    fetchDashboard(currentUserInfo.id);
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
                                    await rejectJoinRequest(data?.vehicle?.id, user.id);
                                    alert('❌ Đã từ chối yêu cầu gia nhập.');
                                    const updated = await getUnassignedUsers();
                                    setUnassignedUsers(updated);
                                    fetchDashboard(currentUserInfo.id);
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
                          await addMemberToVehicle(data?.vehicle?.id, selectedUserId, 0); // 0% by default
                          alert('✅ Đã thêm thành viên thành công!');
                          setSelectedUserId('');
                          setShowAddMemberModal(false);
                          fetchDashboard(currentUserInfo.id); // reload dashboard
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

      {/* Deposit Personal Wallet Modal */}
      {showDepositWalletModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-gradient-to-br from-[#ecfdf5] to-[#d1fae5] p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#22c55e] shrink-0">
                <i className="ph-fill ph-wallet text-2xl"></i>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-ink mb-1">Nạp tiền Ví cá nhân</h3>
                <p className="text-sm text-[#16a34a]/80">Nạp số dư để tự động thanh toán khấu hao hành trình & các chi phí phát sinh.</p>
              </div>
              <button 
                onClick={() => {
                  setShowDepositWalletModal(false);
                  setDepositAmount('');
                }}
                className="w-8 h-8 rounded-full bg-white/50 hover:bg-white text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center shrink-0"
              >
                <i className="ph ph-x text-lg"></i>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Số tiền muốn nạp (VNĐ)</label>
                <input 
                  type="number" 
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Nhập số tiền..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e]/20 transition-all font-semibold text-ink"
                />
              </div>

              {/* Quick select buttons */}
              <div className="grid grid-cols-2 gap-2">
                {[100000, 200000, 500000, 1000000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setDepositAmount(val.toString())}
                    className="py-2 border border-slate-200 hover:border-[#22c55e] hover:bg-[#ecfdf5] rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)}
                  </button>
                ))}
              </div>
              
              <button 
                onClick={async () => {
                  if (!depositAmount || parseFloat(depositAmount) <= 0) {
                    return alert('Vui lòng nhập số tiền nạp hợp lệ!');
                  }
                  try {
                    setIsSubmittingWallet(true);
                    await depositWallet(parseFloat(depositAmount));
                    alert('🎉 Nạp tiền vào ví cá nhân thành công!');
                    setShowDepositWalletModal(false);
                    setDepositAmount('');
                    fetchDashboard(currentUserInfo.id); // reload dashboard
                  } catch (e) {
                    alert('Nạp tiền thất bại: ' + (e.response?.data?.message || e.response?.data || e.message));
                  } finally {
                    setIsSubmittingWallet(false);
                  }
                }}
                disabled={isSubmittingWallet || !depositAmount}
                className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold py-3.5 rounded-xl transition-all shadow-sm shadow-[#22c55e]/30 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isSubmittingWallet ? 'Đang xử lý...' : 'Xác nhận Nạp tiền'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
