import React from 'react';
import Tilt3DCard from '../shared/Tilt3DCard';

const BookingCalendar = ({ bookings, onSelectAll }) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const startOffset = (firstDay === 0 ? 6 : firstDay - 1);

  const displayDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingDays = Array.from({ length: startOffset }, (_, i) => i);

  const getBookingForDay = (day) => {
    return bookings.find(b => {
      const dt = new Date(b.startTime);
      return dt.getDate() === day && dt.getMonth() === currentMonth && dt.getFullYear() === currentYear;
    });
  };

  const getSkinClass = (user) => {
    if (!user) return 'bg-slate-100 text-slate-500';
    const id = user.id || 0;
    const colors = [
      'bg-brand-500 text-white', 
      'bg-blue-500 text-white', 
      'bg-amber-500 text-white', 
      'bg-indigo-500 text-white', 
      'bg-[#22c55e] text-white', 
      'bg-purple-500 text-white'
    ];
    return colors[id % colors.length];
  };

  const getDisplayName = (user) => {
    if (!user) return '';
    const name = user.name || user.username || `TV ${user.id || ''}`;
    return name.trim().split(' ').pop();
  };

  const formatBookingTime = (booking) => {
    const start = new Date(booking.startTime);
    const end = new Date(booking.endTime);
    
    const pad = (n) => n.toString().padStart(2, '0');
    const startStr = `${pad(start.getHours())}:${pad(start.getMinutes())}`;
    const endStr = `${pad(end.getHours())}:${pad(end.getMinutes())}`;
    const dateStr = `${start.getDate()}/${start.getMonth() + 1}`;

    const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const dayOfWeek = daysOfWeek[start.getDay()];

    return {
      timeRange: `${startStr} – ${endStr}`,
      dateLabel: `${dayOfWeek}, ${dateStr}`,
      dayNum: start.getDate(),
      dayOfWeek: dayOfWeek.toUpperCase()
    };
  };

  // Filter bookings that have a purpose and are upcoming (from today onwards)
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today
  
  const upcomingBookings = bookings
    .filter(b => b.purpose && new Date(b.startTime) >= today)
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  return (
    <Tilt3DCard className="xl:col-span-6 h-full">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-full flex flex-col transform-style-3d">
        <div className="flex items-center justify-between mb-5" style={{ transform: 'translateZ(20px)' }}>
          <h3 className="text-base font-semibold drop-shadow-sm">Lịch đặt xe tháng {new Date().getMonth() + 1}</h3>
        <button 
          onClick={onSelectAll}
          className="text-sm text-brand-600 font-medium hover:text-brand-500 cursor-pointer"
        >
          Xem tất cả
        </button>
      </div>
      
      {/* Calendar Header */}
      <div className="grid grid-cols-7 gap-1.5 mb-6 text-center text-[11px] text-slate-400 font-medium" style={{ transform: 'translateZ(10px)' }}>
        <div>T2</div><div>T3</div><div>T4</div><div>T5</div><div>T6</div><div>T7</div><div>CN</div>
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1.5" style={{ transform: 'translateZ(15px)' }}>
        {paddingDays.map(k => <div key={`pad-${k}`}></div>)}
        {displayDays.map((day) => {
          const booking = getBookingForDay(day);
          const user = booking?.user;
          const skin = getSkinClass(user);
          const name = getDisplayName(user);

          return (
            <div 
              key={day}
              className={`cal-cell rounded-xl ${skin} flex flex-col items-center justify-center cursor-pointer py-1.5`}
              title={booking ? `${user?.name || user?.username}: ${booking.purpose}` : ''}
            >
              <span className="text-sm font-semibold">{day}</span>
              {name && (
                <span className="text-[9px] opacity-90 font-medium px-1 truncate w-full text-center">{name}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Upcoming Bookings list */}
      <div className="mt-6 pt-5 border-t border-slate-100 flex-1" style={{ transform: 'translateZ(25px)' }}>
        <h4 className="text-sm font-semibold mb-3 drop-shadow-sm">Lịch đặt sắp tới</h4>
        {upcomingBookings.length === 0 ? (
          <div className="text-center text-sm text-slate-500 py-4">Chưa có lịch đặt sắp tới</div>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {upcomingBookings.map((b) => {
              const info = formatBookingTime(b);
              const isConfirmed = b.status === 'CONFIRMED';
              const userName = b.user?.name || b.user?.username || 'Người dùng Ẩn';
              
              return (
                <div 
                  key={b.id || b.startTime} 
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/60"
                >
                  <div 
                    className={`w-10 h-10 rounded-lg text-white flex flex-col items-center justify-center text-xs font-bold shrink-0 ${
                      isConfirmed ? 'bg-brand-500' : 'bg-amber-400'
                    }`}
                  >
                    <span>{info.dayNum}</span>
                    <span className="font-normal text-[9px]">{info.dayOfWeek}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {userName}
                    </p>
                    <p className="text-xs font-medium text-slate-600 mt-0.5 truncate">
                      {info.dateLabel} | {info.timeRange}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{b.purpose}</p>
                  </div>

                  <span 
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-md whitespace-nowrap ${
                      isConfirmed 
                        ? 'text-brand-600 bg-brand-50 border border-brand-100' 
                        : 'text-amber-600 bg-amber-50 border border-amber-100'
                    }`}
                  >
                    {isConfirmed ? '✓ ĐÃ DUYỆT' : '⏳ CHỜ DUYỆT'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
      </div>
    </Tilt3DCard>
  );
};

export default BookingCalendar;
