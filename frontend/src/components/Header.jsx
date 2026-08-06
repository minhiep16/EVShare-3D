import React from 'react';

const Header = ({ currentUser, activeTab, coOwners, vehicle, onMenuToggle, onCreateVehicle, onAddMemberClick }) => {
  const getFormattedDate = () => {
    const days = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const now = new Date();
    const dayName = days[now.getDay()];
    return `${dayName}, ${now.getDate()} tháng ${now.getMonth() + 1}, ${now.getFullYear()}`;
  };

  const handleScrollToBooking = () => {
    const element = document.querySelector('form');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      const input = element.querySelector('input[type="text"]');
      if (input) input.focus();
    }
  };

  if (activeTab === 'admin_disputes') {
    return (
      <header className="h-[72px] bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={onMenuToggle}
            className="lg:hidden text-slate-500 hover:text-ink mr-1"
          >
            <i className="ph ph-list text-2xl"></i>
          </button>
          <div>
            <h1 className="text-lg font-bold text-red-600">Giải quyết tranh chấp</h1>
            <p className="text-xs text-slate-400 font-medium">Theo dõi & xử lý các vấn đề phát sinh trong nhóm đồng sở hữu</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => alert('🔍 Mở bộ lọc danh sách tranh chấp theo mức độ ưu tiên...')}
            className="inline-flex items-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            <i className="ph ph-funnel text-slate-500"></i>Bộ lọc
          </button>
          
          <button 
            onClick={() => alert('🗄️ Đang tải lịch sử các vụ tranh chấp cũ đã đóng...')}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            <i className="ph ph-archive"></i>Lịch sử xử lý
          </button>
        </div>
      </header>
    );
  }

  if (activeTab === 'admin_finance') {
    return (
      <header className="h-[72px] bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={onMenuToggle}
            className="lg:hidden text-slate-500 hover:text-ink mr-1"
          >
            <i className="ph ph-list text-2xl"></i>
          </button>
          <div>
            <h1 className="text-lg font-bold text-ink">Báo cáo tài chính & Vận hành</h1>
            <p className="text-xs text-slate-400 font-medium">Phân tích dòng tiền, chi phí & hiệu suất hệ thống</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Period selector */}
          <div className="flex items-center bg-slate-100 rounded-lg p-1 text-xs font-medium gap-0.5 mr-2">
            <button className="px-3 py-1.5 rounded-md bg-white text-[#0f172a] shadow-sm cursor-pointer font-medium">Tháng này</button>
            <button className="px-3 py-1.5 rounded-md text-slate-500 hover:bg-white transition-colors cursor-pointer font-medium">Quý này</button>
            <button className="px-3 py-1.5 rounded-md text-slate-500 hover:bg-white transition-colors cursor-pointer font-medium">Năm nay</button>
          </div>
          
          <button 
            onClick={() => alert('📥 Đang chuẩn bị xuất dữ liệu báo cáo tài chính sang Excel...')}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
          >
            <i className="ph ph-download-simple"></i>Xuất Excel
          </button>
        </div>
      </header>
    );
  }

  if (activeTab === 'admin_services') {
    return (
      <header className="h-[72px] bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={onMenuToggle}
            className="lg:hidden text-slate-500 hover:text-ink mr-1"
          >
            <i className="ph ph-list text-2xl"></i>
          </button>
          <div>
            <h1 className="text-lg font-bold text-ink">Dịch vụ xe</h1>
            <p className="text-xs text-slate-400 font-medium">Quản lý bảo dưỡng, đăng kiểm & vệ sinh xe</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <i className="ph ph-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input 
              type="text" 
              placeholder="Tìm biển số, loại dịch vụ..." 
              className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-ink"
            />
          </div>
          
          <button 
            onClick={() => document.dispatchEvent(new Event('openCreateServiceModal'))}
            className="inline-flex items-center gap-2 bg-[#22c55e] hover:bg-[#16a34a] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
          >
            <i className="ph ph-plus"></i>Tạo lịch dịch vụ
          </button>
        </div>
      </header>
    );
  }

  if (activeTab.startsWith('admin_')) {
    return (
      <header className="h-[72px] bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={onMenuToggle}
            className="lg:hidden text-slate-500 hover:text-ink mr-1"
          >
            <i className="ph ph-list text-2xl"></i>
          </button>
          <div>
            <h1 className="text-lg font-semibold text-ink">Bảng điều khiển Admin</h1>
            <p className="text-xs text-slate-400 font-medium">EVShare Operations · Thứ 3, 10/06/2025</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => alert('🔔 Có 5 thông báo vận hành mới đang chờ phê duyệt!')}
            className="relative inline-flex items-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            <i className="ph ph-bell text-slate-500 text-lg"></i>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">5</span>
          </button>
          
          <button 
            onClick={onCreateVehicle || (() => alert('➕ Mở form thiết lập nhóm xe co-owning mới...'))}
            className="inline-flex items-center gap-2 bg-[#22c55e] hover:bg-[#16a34a] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
          >
            <i className="ph ph-plus"></i>Tạo nhóm xe mới
          </button>
          
          <img 
            src={currentUser?.avatarUrl || "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-9.jpg"} 
            alt={currentUser?.name || "Admin"} 
            className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 cursor-pointer"
          />
        </div>
      </header>
    );
  }

  if (activeTab === 'booking') {
    return (
      <header className="h-[72px] bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={onMenuToggle}
            className="lg:hidden text-slate-500 hover:text-ink mr-1"
          >
            <i className="ph ph-list text-2xl"></i>
          </button>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Đặt lịch xe</h1>
            <p className="text-xs text-slate-400 font-medium">{vehicle ? `${vehicle.model} · ${vehicle.licensePlate}` : 'Chưa có xe'}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Legend */}
          <div className="hidden md:flex items-center gap-4 text-xs text-slate-500 font-medium mr-2">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#22c55e]/40 border border-[#22c55e]"></span>Của bạn
            </span>
            {coOwners && coOwners.filter(o => o.id !== currentUser?.id).map((owner, idx) => {
              const colors = [
                { bg: 'bg-blue-100', border: 'border-blue-300' },
                { bg: 'bg-amber-100', border: 'border-amber-300' },
                { bg: 'bg-purple-100', border: 'border-purple-300' },
                { bg: 'bg-pink-100', border: 'border-pink-300' }
              ];
              const c = colors[idx % colors.length];
              return (
                <span key={owner.id} className="flex items-center gap-1.5">
                  <span className={`w-3 h-3 rounded ${c.bg} border ${c.border}`}></span>{owner.name || owner.username}
                </span>
              );
            })}
          </div>
          
          <button 
            onClick={handleScrollToBooking}
            className="inline-flex items-center gap-2 bg-[#22c55e] hover:bg-[#16a34a] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            <i className="ph ph-calendar-plus"></i>Đặt lịch mới
          </button>
          
          <img 
            src={currentUser?.avatarUrl || "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg"} 
            alt={currentUser?.name || "User"} 
            className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 cursor-pointer"
          />
        </div>
      </header>
    );
  }

  if (activeTab === 'group') {
    return (
      <header className="h-[72px] bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={onMenuToggle}
            className="lg:hidden text-slate-500 hover:text-ink mr-1"
          >
            <i className="ph ph-list text-2xl"></i>
          </button>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Nhóm sở hữu</h1>
            <p className="text-xs text-slate-400 font-medium">{vehicle ? `${vehicle.model} – Nhóm #EV-2026-${vehicle.id.toString().padStart(3, '0')}` : 'Chưa có nhóm'}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => alert('💬 Tính năng Chat Nhóm đang được phát triển!')}
            className="inline-flex items-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            <i className="ph ph-chat-circle text-slate-500"></i>Nhắn tin nhóm
          </button>
          
          {currentUser?.isGroupLeader && (
            <button 
              onClick={onAddMemberClick}
              className="inline-flex items-center gap-2 bg-[#22c55e] hover:bg-[#16a34a] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              <i className="ph ph-user-plus"></i>Thêm thành viên
            </button>
          )}
          
          <img 
            src={currentUser?.avatarUrl || "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg"} 
            alt={currentUser?.name || "User"} 
            className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 cursor-pointer"
          />
        </div>
      </header>
    );
  }

  if (activeTab === 'history') {
    return (
      <header className="h-[72px] bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={onMenuToggle}
            className="lg:hidden text-slate-500 hover:text-ink mr-1"
          >
            <i className="ph ph-list text-2xl"></i>
          </button>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Lịch sử sử dụng</h1>
            <p className="text-xs text-slate-400 font-medium">Tesla Model 3 – 51G-888.99</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Period selector */}
          <div className="flex items-center bg-slate-100 rounded-lg p-1 text-xs font-medium gap-0.5 mr-2">
            <button className="px-3 py-1.5 rounded-md bg-white text-[#0f172a] shadow-sm cursor-pointer font-medium">Tháng</button>
            <button className="px-3 py-1.5 rounded-md text-slate-500 hover:bg-white transition-colors cursor-pointer font-medium">Quý</button>
            <button className="px-3 py-1.5 rounded-md text-slate-500 hover:bg-white transition-colors cursor-pointer font-medium">Năm</button>
          </div>
          
          <button 
            onClick={() => alert('📥 Đang xuất dữ liệu lịch trình chuyến đi dạng CSV...')}
            className="inline-flex items-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer font-medium"
          >
            <i className="ph ph-export text-slate-500"></i>Xuất dữ liệu
          </button>
          
          <img 
            src={currentUser?.avatarUrl || "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg"} 
            alt={currentUser?.name || "User"} 
            className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 cursor-pointer"
          />
        </div>
      </header>
    );
  }

  if (activeTab === 'contract') {
    return (
      <header className="h-[72px] bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={onMenuToggle}
            className="lg:hidden text-slate-500 hover:text-ink mr-1"
          >
            <i className="ph ph-list text-2xl"></i>
          </button>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Hợp đồng điện tử</h1>
            <p className="text-xs text-slate-400 font-medium">Quản lý & ký kết hợp đồng đồng sở hữu</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => alert('🔍 Tìm kiếm hợp đồng...')}
            className="inline-flex items-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer font-medium"
          >
            <i className="ph ph-magnifying-glass text-slate-500"></i>Tìm kiếm
          </button>
          
          <img 
            src={currentUser?.avatarUrl || "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg"} 
            alt={currentUser?.name || "User"} 
            className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 cursor-pointer"
          />
        </div>
      </header>
    );
  }

  // Default Dashboard Header
  return (
    <header className="h-[72px] bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8 shrink-0 z-10 relative">
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuToggle}
          className="lg:hidden text-slate-500 hover:text-ink mr-1"
        >
          <i className="ph ph-list text-2xl"></i>
        </button>
        <h1 className="text-lg font-semibold tracking-tight">
          Xin chào, {currentUser?.name || 'Nguyễn Thị Mai'} 👋
        </h1>
        <span className="hidden md:inline text-sm text-slate-500 font-medium ml-1">
          {getFormattedDate()}
        </span>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Search bar */}
        <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 w-64 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500 transition-all">
          <i className="ph ph-magnifying-glass text-slate-400"></i>
          <input 
            type="text" 
            placeholder="Tìm kiếm..." 
            className="bg-transparent border-none outline-none text-sm text-ink placeholder-slate-400 w-full"
          />
        </div>
        
        {/* Notification Bell */}
        <button className="relative p-2 rounded-full hover:bg-slate-50 text-slate-500 transition-colors">
          <i className="ph ph-bell text-xl"></i>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full ring-2 ring-white"></span>
        </button>
        
        {/* Avatar */}
        <img 
          src={currentUser?.avatarUrl || "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg"} 
          alt={currentUser?.name || "User"} 
          className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 cursor-pointer"
        />
      </div>
    </header>
  );
};

export default Header;
