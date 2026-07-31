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
import { getDashboardData, createBooking, castVote } from './services/api';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState(() => localStorage.getItem('evshare_currentRole') || 'USER');
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('evshare_isAuthenticated') === 'true');
  const [currentUserInfo, setCurrentUserInfo] = useState(() => {
    const saved = localStorage.getItem('evshare_currentUserInfo');
    return saved ? JSON.parse(saved) : null;
  });

  const fetchDashboard = async (userId) => {
    try {
      setLoading(true);
      const res = await getDashboardData(userId);
      setData(res);
      setError(null);
    } catch (err) {
      console.error(err);
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

  if (!isAuthenticated) {
    return (
      <LoginPage 
        onLoginSuccess={(role, userInfo) => {
          setIsAuthenticated(true);
          localStorage.setItem('evshare_isAuthenticated', 'true');
          if (role) {
            setCurrentRole(role);
            localStorage.setItem('evshare_currentRole', role);
            setCurrentUserInfo(userInfo);
            localStorage.setItem('evshare_currentUserInfo', JSON.stringify(userInfo));
            if (role === 'ADMIN') {
              setActiveTab('admin_dashboard');
            } else {
              setActiveTab('dashboard');
            }
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
  const userProfile = data?.coOwners?.find(u => u.name.includes('Mai')) || data?.coOwners?.[0];
  const activeUser = currentUserInfo ? {
    id: currentUserInfo.id || (currentUserInfo.fullName?.includes('Bình') ? 2 : (currentUserInfo.fullName?.includes('Tuấn') ? 3 : 1)),
    name: currentUserInfo.fullName,
    avatarUrl: currentUserInfo.avatarUrl || (currentRole === 'ADMIN' ? 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-9.jpg' : 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg'),
    role: currentRole === 'ADMIN' ? 'Administrator' : 'Co-owner'
  } : null;

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
    setCurrentRole(newRole);
    if (newRole === 'ADMIN') {
      setActiveTab('admin_dashboard');
    } else {
      setActiveTab('dashboard');
    }
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
          localStorage.removeItem('evshare_currentRole');
          localStorage.removeItem('evshare_currentUserInfo');
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
                  localStorage.removeItem('evshare_currentRole');
                  localStorage.removeItem('evshare_currentUserInfo');
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
                        onClick={() => alert('➕ Tính năng tự tạo nhóm co-owning mới đang được kết nối với ban quản trị.')}
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
              />
            )}

            {activeTab === 'contract' && (
              <ContractPage 
                currentUser={currentUser}
              />
            )}

            {activeTab === 'admin_dashboard' && (
              <AdminDashboard />
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

            {['admin_vehicles', 'admin_contracts', 'admin_checkin', 'admin_staff'].includes(activeTab) && (
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
    </div>
  );
}

export default App;
