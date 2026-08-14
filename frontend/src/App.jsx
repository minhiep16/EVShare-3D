import React, { useState, useEffect } from 'react';
import Sidebar from './components/shared/Sidebar';
import Header from './components/shared/Header';
import ProfileModal from './components/shared/ProfileModal';
import UserDashboard3D from './components/dashboard/UserDashboard3D';
import ActiveTripBanner from './components/dashboard/ActiveTripBanner';
import BookingCalendar from './components/booking/BookingCalendar';
import BookingPage from './components/booking/BookingPage';
import NotificationsTab from './components/features/NotificationsTab';
import CostPage from './components/features/CostPage';
import GroupPage from './components/features/GroupPage';
import HistoryPage from './components/features/HistoryPage';
import ContractPage from './components/features/ContractPage';
import TransactionLedger from './components/features/TransactionLedger';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminDisputes from './components/admin/AdminDisputes';
import AdminFinance from './components/admin/AdminFinance';
import AdminServices from './components/admin/AdminServices';
import AdminVehicles from './components/admin/AdminVehicles';
import AdminContracts from './components/admin/AdminContracts';
import AdminUsers from './components/admin/AdminUsers';
import LoginPage from './components/auth/LoginPage';
import VehicleCheckin3D from './components/3d-models/VehicleCheckin3D';
import { getDashboardData, createBooking, castVote, createVehicle, getUnassignedUsers, addMemberToVehicle, requestJoinVehicle, approveJoinRequest, rejectJoinRequest, depositWallet } from './services/api';

function App() {
  const [currentUserInfo, setCurrentUserInfo] = useState(() => {
    const saved = localStorage.getItem('evshare_currentUserInfo');
    return saved ? JSON.parse(saved) : null;
  });
  const currentRole = currentUserInfo?.role || 'USER';
  
  const [activeTab, setActiveTab] = useState(() => {
    return currentRole === 'ADMIN' ? 'admin_dashboard' : 'dashboard';
  });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('evshare_isAuthenticated') === 'true');

  const [isCreateVehicleModalOpen, setIsCreateVehicleModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ model: '', licensePlate: '', imageUrl: '' });
  const [creatingVehicle, setCreatingVehicle] = useState(false);

  // Add Member Modal State (for Group Leader)
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [unassignedUsers, setUnassignedUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
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

  const handleVoteClick = async (voteId, agree = true) => {
    try {
      if (voteId) {
        await castVote(voteId, agree);
      }
      fetchDashboard();
    } catch (err) {
      console.error(err);
      alert('Không thể thực hiện bỏ phiếu.');
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
    role: currentRole === 'ADMIN' ? 'Administrator' : 'Co-owner',
    walletBalance: currentUserInfo.walletBalance || 0
  } : null;

  // Find the exact profile from the backend data using activeUser.id
  const userProfile = activeUser ? data?.coOwners?.find(u => u.id === activeUser.id) : data?.coOwners?.[0];

  const currentUserBase = activeUser || (currentRole === 'USER' ? {
    id: userProfile?.id || 1,
    name: userProfile?.name || 'Nguyễn Thị Mai',
    avatarUrl: userProfile?.avatarUrl || 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg',
    role: 'Co-owner',
    walletBalance: userProfile?.walletBalance || 0
  } : {
    id: 4,
    name: 'Phạm Quốc Hùng',
    avatarUrl: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-9.jpg',
    role: 'Administrator',
    walletBalance: 0
  });
  
  const currentUser = {
    ...currentUserBase,
    vehicle: data?.vehicle,
    isGroupLeader: userProfile?.isGroupLeader || false,
    ownershipPercentage: userProfile?.ownershipPercentage || 0,
    requestedVehicleId: userProfile?.requestedVehicleId || null,
    status: userProfile?.status || currentUserInfo?.status || 'PENDING_APPROVAL',
    walletBalance: currentUserInfo?.walletBalance || userProfile?.walletBalance || currentUserBase?.walletBalance || 0
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
                <span className="text-xl font-semibold tracking-tight text-white">EVShare 3D</span>
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
                onDepositWalletClick={() => {
                  setMobileMenuOpen(false);
                  setShowDepositWalletModal(true);
                }}
              />
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)}></div>
        </div>
      )}

      {/* Main content body */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden relative">
        <Header
          currentUser={currentUser}
          activeTab={activeTab}
          onMenuToggle={() => setMobileMenuOpen(true)}
          onCreateVehicle={() => setIsCreateVehicleModalOpen(true)}
          onProfileClick={() => setIsProfileModalOpen(true)}
        />

        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-[1400px] mx-auto space-y-6">

            {activeTab === 'dashboard' && (
              <>
                {data?.vehicle ? (
                  <>
                    <UserDashboard3D
                      vehicle={data?.vehicle}
                      kpi={data?.kpi}
                      bookings={data?.bookings || []}
                      transactions={data?.transactions || []}
                      coOwners={data?.coOwners || []}
                      activeVotes={data?.activeVotes || []}
                      suggestions={data?.suggestions || []}
                      ownershipPercentage={ownershipPercentage}
                      onBookNow={() => setActiveTab('booking')}
                      onSelectAllBookings={() => alert('Chi tiết toàn bộ lịch đặt xe sẽ được hiển thị!')}
                      onVoteClick={handleVoteClick}
                      onAIChatClick={handleAIChat}
                    />
                  </>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 animate-bounce">
                      <i className="ph ph-car-profile"></i>
                    </div>
                    <h3 className="text-xl font-bold text-ink mb-2">Chào mừng thành viên mới!</h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                      Tài khoản của bạn đã được đăng ký thành công trên database. Hiện tại bạn chưa tham gia nhóm đồng sở hữu xe nào trong hệ thống EVShare.
                    </p>
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => setIsCreateVehicleModalOpen(true)}
                        className="bg-[#22c55e] hover:bg-[#16a34a] text-white font-semibold py-2 px-4 rounded-lg transition-colors cursor-pointer text-sm font-semibold"
                      >
                        Tạo nhóm xe mới
                      </button>
                      <button
                        onClick={() => alert('📞 Hotline hỗ trợ gia nhập nhóm xe: 1900-xxxx')}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-lg transition-colors cursor-pointer text-sm font-semibold"
                      >
                        Liên hệ hỗ trợ
                      </button>
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

            {activeTab === 'admin_contracts' && (
              <AdminContracts />
            )}

            {activeTab === 'admin_users' && (
              <AdminUsers />
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
              <NotificationsTab />
            )}

          </div>
        </div>
      </main>

      {/* Create Vehicle Modal */}
      {isCreateVehicleModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-fade-in-up">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-ink flex items-center gap-2">
                <i className="ph ph-car-profile text-brand-500"></i>Tạo nhóm xe mới
              </h3>
              <button
                onClick={() => setIsCreateVehicleModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
              >
                <i className="ph ph-x"></i>
              </button>
            </div>

            <form onSubmit={handleCreateVehicleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Dòng xe (Model) <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="VD: VinFast VF8"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  value={newVehicle.model}
                  onChange={e => setNewVehicle({ ...newVehicle, model: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Biển số xe <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="VD: 51H-123.45"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  value={newVehicle.licensePlate}
                  onChange={e => setNewVehicle({ ...newVehicle, licensePlate: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Hình ảnh (URL)</label>
                <input
                  type="url"
                  placeholder="Để trống sẽ dùng ảnh mặc định"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  value={newVehicle.imageUrl}
                  onChange={e => setNewVehicle({ ...newVehicle, imageUrl: e.target.value })}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={creatingVehicle}
                  className={`w-full py-2.5 rounded-lg text-sm font-bold text-white transition-colors cursor-pointer flex items-center justify-center gap-2 ${creatingVehicle ? 'bg-brand-400 cursor-not-allowed' : 'bg-brand-500 hover:bg-brand-600'
                    }`}
                >
                  {creatingVehicle ? (
                    <><i className="ph ph-spinner animate-spin text-lg"></i>Đang khởi tạo...</>
                  ) : (
                    <><i className="ph ph-plus-circle text-lg"></i>Tạo Nhóm Xe</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit Wallet Modal */}
      {showDepositWalletModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden animate-scale-in flex flex-col border border-white/20">
            {/* Header with Gradient */}
            <div className="px-6 py-5 bg-gradient-to-r from-brand-600 to-indigo-600 flex items-center justify-between shrink-0">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <i className="ph-fill ph-wallet text-2xl text-white/90"></i>
                Nạp tiền vào ví
              </h3>
              <button 
                onClick={() => setShowDepositWalletModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
              >
                <i className="ph ph-x text-lg"></i>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50 relative">
              {/* Current Balance Card */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 mb-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-brand-100/50 to-transparent rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                <p className="text-sm text-slate-500 font-medium mb-1 relative z-10">Số dư hiện tại</p>
                <p className="text-3xl font-black text-slate-900 tracking-tight relative z-10">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentUser.walletBalance || 0)}
                </p>
              </div>

              {/* Transaction Ledger Component Embedded Here */}
              <TransactionLedger userId={currentUserInfo?.id} currentBalance={currentUser.walletBalance} />
            </div>
            
            <div className="px-6 py-5 border-t border-slate-100 bg-white shrink-0 shadow-[0_-4px_15px_-5px_rgba(0,0,0,0.05)] z-20">
              <form onSubmit={async (e) => {
                e.preventDefault();
                const amt = parseFloat(depositAmount);
                if (isNaN(amt) || amt < 10000) {
                  alert("Số tiền nạp tối thiểu là 10,000đ");
                  return;
                }
                setIsSubmittingWallet(true);
                try {
                  // CORRECT API CALL: only pass amt (id is derived from token in backend)
                  await depositWallet(amt);
                  alert(`Đã nạp thành công ${amt.toLocaleString()}đ vào ví!`);
                  setDepositAmount('');
                  // Force a refresh of the dashboard to update balance
                  await fetchDashboard(currentUserInfo?.id);
                  // Auto close
                  setShowDepositWalletModal(false);
                } catch(err) {
                  console.error(err);
                  alert("Lỗi khi nạp tiền: " + (err.response?.data || err.message));
                } finally {
                  setIsSubmittingWallet(false);
                }
              }}>
                <div className="mb-4">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Chọn số tiền nhanh</label>
                  <div className="flex flex-wrap gap-2">
                    {[50000, 100000, 200000, 500000].map(amount => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => setDepositAmount(amount.toString())}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          depositAmount === amount.toString()
                            ? 'bg-brand-50 text-brand-600 border border-brand-200'
                            : 'bg-white text-slate-600 border border-slate-200 hover:border-brand-300 hover:bg-slate-50'
                        }`}
                      >
                        {amount / 1000}k
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-1 relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <span className="text-slate-400 group-focus-within:text-brand-500 transition-colors font-medium">₫</span>
                    </div>
                    <input 
                      type="number" 
                      min="10000"
                      step="10000"
                      required
                      placeholder="Nhập số tiền khác..."
                      className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all focus:bg-white"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={isSubmittingWallet}
                    className={`px-5 py-3 rounded-xl text-sm font-bold text-white transition-all shadow-md shadow-brand-500/20 flex items-center gap-2 shrink-0
                      ${isSubmittingWallet ? 'bg-brand-400 cursor-not-allowed' : 'bg-gradient-to-r from-brand-500 to-indigo-500 hover:from-brand-600 hover:to-indigo-600 hover:shadow-lg hover:-translate-y-0.5'}`}
                  >
                    {isSubmittingWallet ? (
                      <><i className="ph ph-spinner animate-spin text-lg"></i> Đang xử lý</>
                    ) : (
                      <><i className="ph-fill ph-check-circle text-lg"></i> Nạp Ngay</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        onProfileUpdated={(newAvatarUrl) => {
          if (currentUserInfo) {
            setCurrentUserInfo({ ...currentUserInfo, avatarUrl: newAvatarUrl });
            localStorage.setItem('evshare_currentUserInfo', JSON.stringify({ ...currentUserInfo, avatarUrl: newAvatarUrl }));
          }
        }}
      />
    </div>
  );
}

export default App;