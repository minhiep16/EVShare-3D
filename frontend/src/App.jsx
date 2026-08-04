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
import { getDashboardData, createBooking, castVote, createVehicle } from './services/api';

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

  const handleVoteClick = async (voteId) => {
    try {
      await castVote(voteId);
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
    role: currentRole === 'ADMIN' ? 'Administrator' : 'Co-owner'
  } : null;

  // Find the exact profile from the backend data using activeUser.id
  const userProfile = activeUser ? data?.coOwners?.find(u => u.id === activeUser.id) : data?.coOwners?.[0];

  const currentUser = activeUser || (currentRole === 'USER' ? {
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
          onMenuToggle={() => setMobileMenuOpen(true)}
          onCreateVehicle={() => setIsCreateVehicleModalOpen(true)}
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
    </div>
  );
}

export default App;
