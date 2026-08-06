import React from 'react';

const Sidebar = ({ 
  activeTab, 
  setActiveTab, 
  currentUser, 
  notificationCount,
  currentRole,
  hasVehicle = true,
  onLogout,
  onDepositWalletClick
}) => {

  const userMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'ph-squares-four' },
    { id: 'booking', label: 'Đặt lịch xe', icon: 'ph-calendar-blank' },
    { id: 'cost', label: 'Chi phí & Thanh toán', icon: 'ph-receipt' },
    { id: 'group', label: 'Nhóm sở hữu', icon: 'ph-users-three' }
  ];

  const userManageItems = [
    { id: 'history', label: 'Lịch sử sử dụng', icon: 'ph-clock-counter-clockwise' },
    { id: 'contract', label: 'Hợp đồng', icon: 'ph-file-text' }
  ];

  const adminMenuItems = [
    { id: 'admin_dashboard', label: 'Dashboard Admin', icon: 'ph-squares-four' },
    { id: 'admin_users', label: 'Duyệt tài khoản', icon: 'ph-shield-check' },
    { id: 'admin_vehicles', label: 'Quản lý nhóm xe', icon: 'ph-cars' },
    { id: 'admin_contracts', label: 'Hợp đồng pháp lý', icon: 'ph-file-text' },
    { id: 'admin_checkin', label: 'Check-in / Check-out', icon: 'ph-qr-code' }
  ];

  const adminManageItems = [
    { id: 'admin_services', label: 'Dịch vụ xe', icon: 'ph-wrench' },
    { id: 'admin_disputes', label: 'Tranh chấp', icon: 'ph-scales', badge: 2 },
    { id: 'admin_finance', label: 'Báo cáo tài chính', icon: 'ph-chart-bar' },
    { id: 'admin_staff', label: 'Quản lý Staff', icon: 'ph-users' }
  ];

  const isUserMode = currentRole === 'USER';
  const menuList = isUserMode 
    ? (hasVehicle ? userMenuItems : userMenuItems.filter(item => item.id === 'dashboard')) 
    : adminMenuItems;
  const manageList = isUserMode 
    ? (hasVehicle ? userManageItems : []) 
    : adminManageItems;

  return (
    <aside className="hidden lg:flex w-[260px] bg-ink text-white flex-col shrink-0 h-screen sticky top-0">
      {/* Brand Logo & Admin Badge */}
      <div className="h-[72px] flex items-center justify-between px-6 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <span className="text-brand-500">
            <i className="ph-fill ph-lightning text-2xl"></i>
          </span>
          <span className="text-xl font-semibold tracking-tight">EVShare</span>
        </div>
        {!isUserMode && (
          <span className="text-[9px] font-bold bg-violet-500 text-white px-1.5 py-0.5 rounded">ADMIN</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 pb-2 text-[11px] uppercase tracking-wider text-slate-500 font-medium">Tổng quan</p>
        
        {menuList.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left cursor-pointer ${
              activeTab === item.id 
                ? (isUserMode ? 'bg-brand-500 text-white font-semibold' : 'bg-violet-600 text-white font-semibold') 
                : 'text-slate-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            <i className={`ph ${item.icon} text-lg`}></i>
            {item.label}
          </button>
        ))}

        <p className="px-3 pt-5 pb-2 text-[11px] uppercase tracking-wider text-slate-500 font-medium">Quản lý</p>
        
        {manageList.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left cursor-pointer ${
              activeTab === item.id 
                ? (isUserMode ? 'bg-brand-500 text-white font-semibold' : 'bg-violet-600 text-white font-semibold') 
                : 'text-slate-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <i className={`ph ${item.icon} text-lg`}></i>
              <span>{item.label}</span>
            </div>
            {item.badge && (
              <span className="bg-red-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Current User Info & Logout */}
      <div className="p-3 border-t border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <img 
            src={currentUser?.avatarUrl} 
            alt={currentUser?.name} 
            className={`w-9 h-9 rounded-full object-cover ring-2 ${isUserMode ? 'ring-brand-500' : 'ring-violet-400'}`} 
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate">{currentUser?.name}</p>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-slate-400 truncate">{currentUser?.role}</span>
              {isUserMode && (
                <span className="text-[11px] text-[#22c55e] font-bold flex items-center gap-1">
                  Ví: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentUser?.walletBalance || 0)}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onDepositWalletClick) onDepositWalletClick();
                    }}
                    className="w-4 h-4 bg-[#22c55e] hover:bg-[#16a34a] text-white rounded flex items-center justify-center text-[10px] font-bold cursor-pointer transition-colors"
                    title="Nạp tiền ví cá nhân"
                  >
                    +
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          title="Đăng xuất"
        >
          <i className="ph ph-sign-out text-lg animate-pulse"></i>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
