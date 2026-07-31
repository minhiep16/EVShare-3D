import React, { useState, useEffect } from 'react';

const BookingPage = ({ bookings, coOwners, currentUser, onSubmitBooking }) => {
  const [selectedDay, setSelectedDay] = useState(10);
  const [bookingDate, setBookingDate] = useState('2025-06-10');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('12:00');
  const [purpose, setPurpose] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto update date input when calendar day changes
  const selectDay = (day) => {
    setSelectedDay(day);
    const dayStr = day.toString().padStart(2, '0');
    setBookingDate(`2025-06-${dayStr}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!purpose) {
      alert('Vui lòng điền mục đích sử dụng');
      return;
    }

    setLoading(true);
    try {
      // Format to ISO LocalDateTime string without timezone
      const startDateTime = `${bookingDate}T${startTime}:00`;
      const endDateTime = `${bookingDate}T${endTime}:00`;

      await onSubmitBooking({
        userId: currentUser?.id || 1,
        startTime: startDateTime,
        endTime: endDateTime,
        purpose: purpose
      });

      setPurpose('');
      alert('Đăng ký lịch đặt xe thành công!');
    } catch (err) {
      console.error(err);
      alert('Đã xảy ra lỗi khi đăng ký lịch.');
    } finally {
      setLoading(false);
    }
  };

  // Define static calendar days for June 2025
  // Previous month offset (May): 27, 28, 29, 30, 31 (greyed out)
  const prevMonthDays = [27, 28, 29, 30, 31];
  // Next month offset (July): 1, 2, 3, 4, 5, 6 (greyed out)
  const nextMonthDays = [1, 2, 3, 4, 5, 6];

  // Current month days (June 2025)
  const juneDays = Array.from({ length: 30 }, (_, i) => i + 1);

  // Status mapping for June days (Mock data mapping to match HTML screenshot)
  const getDayStatus = (day) => {
    // Other1 (Binh - Blue): 1, 7, 17, 21, 27
    if ([1, 7, 17, 21, 27].includes(day)) return 'other1';
    // Other2 (Tuan - Yellow): 5, 12, 19, 24, 30
    if ([5, 12, 19, 24, 30].includes(day)) return 'other2';
    // Mine (Mai - Green): 3, 6, 13, 16, 20, 25
    if ([3, 6, 13, 16, 20, 25].includes(day)) return 'mine';
    return 'free';
  };

  const getDayDotColor = (status) => {
    if (status === 'other1') return 'bg-blue-400';
    if (status === 'other2') return 'bg-yellow-400';
    if (status === 'mine') return 'bg-[#22c55e]';
    return null;
  };

  // Dynamic calculations for AI fairness indicator
  const totalHours = {
    Mai: 22,
    Binh: 28,
    Tuan: 18
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6">
      {/* Left: Calendar + Time slots */}
      <div className="flex-1 min-w-0 space-y-5">
        
        {/* Month nav + calendar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
              <i className="ph ph-caret-left text-slate-500"></i>
            </button>
            <h2 className="text-base font-semibold">Tháng 6 – 2025</h2>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
              <i className="ph ph-caret-right text-slate-500"></i>
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((h) => (
              <div key={h} className="text-center text-[11px] font-semibold text-slate-400 py-1">{h}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1.5" id="calGrid">
            {/* May overflow */}
            {prevMonthDays.map((day, idx) => (
              <div key={`prev-${idx}`} className="cal-day rounded-lg border border-transparent p-1.5 text-center text-sm text-slate-300 pointer-events-none">
                {day}
              </div>
            ))}

            {/* June days */}
            {juneDays.map((day) => {
              const status = getDayStatus(day);
              const dotColor = getDayDotColor(status);
              const isSelected = selectedDay === day;
              const isToday = day === 10;

              let cellClass = 'cal-day rounded-lg border p-1.5 text-center text-sm text-ink ';
              if (isSelected) {
                cellClass += 'selected ';
              } else {
                if (status === 'mine') cellClass += 'mine ';
                if (status === 'other1') cellClass += 'other1 ';
                if (status === 'other2') cellClass += 'other2 ';
                if (status === 'free') cellClass += 'border-slate-100 ';
              }

              return (
                <div 
                  key={`day-${day}`}
                  onClick={() => selectDay(day)}
                  className={cellClass}
                >
                  <span className={`block ${isSelected ? 'font-bold text-white' : 'font-medium'}`}>{day}</span>
                  {isToday && !isSelected && (
                    <span className="block text-[8px] text-brand-600 font-semibold">Hôm nay</span>
                  )}
                  {isToday && isSelected && (
                    <span className="block text-[8px] text-green-100 font-semibold">Hôm nay</span>
                  )}
                  {dotColor && !isToday && (
                    <span className={`block w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : dotColor} mx-auto mt-0.5`}></span>
                  )}
                  {!dotColor && !isToday && <span className="block w-1.5 h-1.5 mx-auto mt-0.5"></span>}
                </div>
              );
            })}

            {/* July overflow */}
            {nextMonthDays.map((day, idx) => (
              <div key={`next-${idx}`} className="cal-day rounded-lg border border-transparent p-1.5 text-center text-sm text-slate-300 pointer-events-none">
                {day}
              </div>
            ))}
          </div>
        </div>

        {/* Time slots for selected day */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold">Khung giờ – Thứ {selectedDay === 10 ? '3' : 'X'}, {selectedDay.toString().padStart(2, '0')}/06/2025</h3>
              <p className="text-xs text-slate-400 mt-0.5">Chọn khung giờ để đặt lịch</p>
            </div>
            <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg font-medium">5/8 khung trống</span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {/* 06:00 - Busy */}
            <div className="time-slot busy rounded-lg border border-slate-200 p-2 text-center">
              <p className="text-xs font-medium text-slate-400">06:00</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Bận</p>
            </div>
            {/* 07:00 - Busy */}
            <div className="time-slot busy rounded-lg border border-slate-200 p-2 text-center">
              <p className="text-xs font-medium text-slate-400">07:00</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Bận</p>
            </div>
            {/* 08:00 - Mine */}
            <div className="time-slot mine-slot rounded-lg border-2 p-2 text-center">
              <p className="text-xs font-semibold text-[#16a34a]">08:00</p>
              <p className="text-[10px] text-[#16a34a] mt-0.5">Của bạn</p>
            </div>
            {/* 09:00 - Mine */}
            <div className="time-slot mine-slot rounded-lg border-2 p-2 text-center">
              <p className="text-xs font-semibold text-[#16a34a]">09:00</p>
              <p className="text-[10px] text-[#16a34a] mt-0.5">Của bạn</p>
            </div>
            {/* 10:00 - Free */}
            <div 
              onClick={() => { setStartTime('10:00'); setEndTime('12:00'); }}
              className={`time-slot rounded-lg border p-2 text-center hover:border-[#22c55e] hover:bg-[#ecfdf5] ${startTime === '10:00' ? 'border-[#22c55e] bg-[#ecfdf5]' : 'border-slate-200'}`}
            >
              <p className="text-xs font-medium text-ink">10:00</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Trống</p>
            </div>
            {/* 11:00 - Free */}
            <div 
              onClick={() => { setStartTime('11:00'); setEndTime('13:00'); }}
              className={`time-slot rounded-lg border p-2 text-center hover:border-[#22c55e] hover:bg-[#ecfdf5] ${startTime === '11:00' ? 'border-[#22c55e] bg-[#ecfdf5]' : 'border-slate-200'}`}
            >
              <p className="text-xs font-medium text-ink">11:00</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Trống</p>
            </div>
            {/* 12:00 - Free */}
            <div 
              onClick={() => { setStartTime('12:00'); setEndTime('14:00'); }}
              className={`time-slot rounded-lg border p-2 text-center hover:border-[#22c55e] hover:bg-[#ecfdf5] ${startTime === '12:00' ? 'border-[#22c55e] bg-[#ecfdf5]' : 'border-slate-200'}`}
            >
              <p className="text-xs font-medium text-ink">12:00</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Trống</p>
            </div>
            {/* 13:00 - Other (T.Binh) */}
            <div className="time-slot other-slot rounded-lg border-2 p-2 text-center">
              <p className="text-xs font-semibold text-blue-600">13:00</p>
              <p className="text-[10px] text-blue-500 mt-0.5">T.Bình</p>
            </div>
            {/* 14:00 - Other (T.Binh) */}
            <div className="time-slot other-slot rounded-lg border-2 p-2 text-center">
              <p class="text-xs font-semibold text-blue-600">14:00</p>
              <p className="text-[10px] text-blue-500 mt-0.5">T.Bình</p>
            </div>
            {/* 15:00 - Free */}
            <div 
              onClick={() => { setStartTime('15:00'); setEndTime('17:00'); }}
              className={`time-slot rounded-lg border p-2 text-center hover:border-[#22c55e] hover:bg-[#ecfdf5] ${startTime === '15:00' ? 'border-[#22c55e] bg-[#ecfdf5]' : 'border-slate-200'}`}
            >
              <p className="text-xs font-medium text-ink">15:00</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Trống</p>
            </div>
            {/* 16:00 - Free */}
            <div 
              onClick={() => { setStartTime('16:00'); setEndTime('18:00'); }}
              className={`time-slot rounded-lg border p-2 text-center hover:border-[#22c55e] hover:bg-[#ecfdf5] ${startTime === '16:00' ? 'border-[#22c55e] bg-[#ecfdf5]' : 'border-slate-200'}`}
            >
              <p className="text-xs font-medium text-ink">16:00</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Trống</p>
            </div>
            {/* 17:00 - Free */}
            <div 
              onClick={() => { setStartTime('17:00'); setEndTime('19:00'); }}
              className={`time-slot rounded-lg border p-2 text-center hover:border-[#22c55e] hover:bg-[#ecfdf5] ${startTime === '17:00' ? 'border-[#22c55e] bg-[#ecfdf5]' : 'border-slate-200'}`}
            >
              <p className="text-xs font-medium text-ink">17:00</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Trống</p>
            </div>
            {/* 18:00 - Busy */}
            <div className="time-slot busy rounded-lg border border-slate-200 p-2 text-center">
              <p className="text-xs font-medium text-slate-400">18:00</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Bận</p>
            </div>
            {/* 19:00 - Busy */}
            <div className="time-slot busy rounded-lg border border-slate-200 p-2 text-center">
              <p className="text-xs font-medium text-slate-400">19:00</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Bận</p>
            </div>
            {/* 20:00 - Free */}
            <div 
              onClick={() => { setStartTime('20:00'); setEndTime('22:00'); }}
              className={`time-slot rounded-lg border p-2 text-center hover:border-[#22c55e] hover:bg-[#ecfdf5] ${startTime === '20:00' ? 'border-[#22c55e] bg-[#ecfdf5]' : 'border-slate-200'}`}
            >
              <p className="text-xs font-medium text-ink">20:00</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Trống</p>
            </div>
            {/* 21:00 - Free */}
            <div 
              onClick={() => { setStartTime('21:00'); setEndTime('23:00'); }}
              className={`time-slot rounded-lg border p-2 text-center hover:border-[#22c55e] hover:bg-[#ecfdf5] ${startTime === '21:00' ? 'border-[#22c55e] bg-[#ecfdf5]' : 'border-slate-200'}`}
            >
              <p className="text-xs font-medium text-ink">21:00</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Trống</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Booking panel + upcoming */}
      <div className="w-full xl:w-[340px] space-y-5 shrink-0">
        
        {/* AI fairness indicator */}
        <div className="bg-gradient-to-br from-[#0f172a] to-slate-800 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-3">
            <i className="ph-fill ph-sparkle text-violet-400 text-lg"></i>
            <p className="text-sm font-semibold">AI Phân tích công bằng</p>
          </div>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Dựa trên tỉ lệ sở hữu {currentUser?.ownershipPercentage || 40}%, bạn có thể đặt thêm <span className="text-white font-semibold">~18 giờ</span> trong tháng này.
          </p>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Nguyễn Thị Mai</span>
                <span className="text-[#22c55e] font-semibold">40% · {totalHours.Mai}h đã dùng</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#22c55e] rounded-full" style={{ width: '55%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Trần Văn Bình</span>
                <span className="text-blue-400 font-semibold">30% · {totalHours.Binh}h đã dùng</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-blue-400 rounded-full" style={{ width: '93%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Lê Minh Tuấn</span>
                <span className="text-yellow-400 font-semibold">30% · {totalHours.Tuan}h đã dùng</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-400 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick booking form */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-base font-semibold mb-4">Đặt lịch nhanh</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Ngày sử dụng</label>
              <input 
                type="date" 
                value={bookingDate} 
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-[#22c55e]/30 focus:border-[#22c55e]"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Giờ bắt đầu</label>
                <select 
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-[#22c55e]/30 focus:border-[#22c55e]"
                >
                  {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '20:00', '21:00'].map(t => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Giờ kết thúc</label>
                <select 
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-[#22c55e]/30 focus:border-[#22c55e]"
                >
                  {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '21:00', '22:00'].map(t => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Mục đích sử dụng</label>
              <input 
                type="text" 
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="VD: Đi công tác, đón con..." 
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-ink placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#22c55e]/30 focus:border-[#22c55e]"
                required
              />
            </div>
            
            <div className="bg-[#ecfdf5] border border-[#22c55e]/30 rounded-xl p-3 flex items-center gap-3">
              <i className="ph ph-check-circle text-[#22c55e] text-xl shrink-0"></i>
              <div>
                <p className="text-xs font-semibold text-[#16a34a]">Khung giờ này trống</p>
                <p className="text-[11px] text-[#16a34a]/70 mt-0.5">Không có xung đột lịch trình</p>
              </div>
            </div>
            
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-white py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
            >
              {loading ? 'Đang xử lý...' : 'Xác nhận đặt lịch'}
            </button>
          </form>
        </div>

        {/* Upcoming bookings */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold">Lịch sắp tới</h3>
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-md font-medium">
              {bookings.length} chuyến
            </span>
          </div>
          
          <div className="space-y-3">
            {bookings.map((b) => {
              const start = new Date(b.startTime);
              const end = new Date(b.endTime);
              const isConfirmed = b.status === 'CONFIRMED';
              
              const formatHour = (dt) => dt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
              const dayNum = start.getDate();
              const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
              const dayName = daysOfWeek[start.getDay()];

              let cardClass = "flex gap-3 p-3 rounded-xl border ";
              let dotClass = "";
              let statusLabel = "";
              let dateBgClass = "";

              if (b.purpose.includes('Khám xe')) {
                cardClass += "bg-slate-50 border-slate-200";
                dotClass = "bg-slate-500";
                dateBgClass = "bg-slate-500";
                statusLabel = "Đã xác nhận";
              } else if (isConfirmed) {
                cardClass += "bg-[#ecfdf5] border-[#22c55e]/30";
                dotClass = "bg-[#22c55e]";
                dateBgClass = "bg-[#22c55e]";
                statusLabel = "Đã xác nhận";
              } else {
                cardClass += "bg-amber-50 border-amber-200";
                dotClass = "bg-amber-400";
                dateBgClass = "bg-amber-400";
                statusLabel = "Chờ duyệt";
              }

              return (
                <div key={b.id} className={cardClass}>
                  <div className={`w-10 h-10 rounded-lg text-white flex flex-col items-center justify-center text-xs font-bold shrink-0 ${dateBgClass}`}>
                    <span>{dayNum}</span>
                    <span className="text-[9px] font-normal">{dayName}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">
                      {formatHour(start)} – {formatHour(end)}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{b.purpose}</p>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-medium mt-1`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`}></span>
                      {statusLabel}
                    </span>
                  </div>
                  
                  <button className="text-slate-400 hover:text-red-500 transition-colors self-start cursor-pointer">
                    <i className="ph ph-x-circle text-lg"></i>
                  </button>
                </div>
              );
            })}

            {bookings.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-4">Chưa có lịch đặt nào</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default BookingPage;
