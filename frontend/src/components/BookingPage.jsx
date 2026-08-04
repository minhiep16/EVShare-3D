import React, { useState, useEffect, useMemo } from "react";
import { createBooking, createDispute } from '../services/api';

const BookingPage = ({ bookings, coOwners, currentUser, onSubmitBooking }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("12:00");
  const [purpose, setPurpose] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeDesc, setDisputeDesc] = useState('');
  const [submittingDispute, setSubmittingDispute] = useState(false);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const startDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const prevMonthDays = Array.from({ length: startDayIndex }, (_, i) => daysInPrevMonth - startDayIndex + i + 1);
  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  const totalSlots = prevMonthDays.length + currentMonthDays.length;
  const nextMonthDaysCount = totalSlots % 7 === 0 ? 0 : 7 - (totalSlots % 7);
  const nextMonthDays = Array.from({ length: nextMonthDaysCount }, (_, i) => i + 1);

  const formatDateStr = (y, m, d) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const getDayBookings = (d) => {
    const dateStr = formatDateStr(year, month, d);
    return bookings.filter(b => b.startTime.startsWith(dateStr));
  };

  const getDayStatus = (d) => {
    const dayBookings = getDayBookings(d);
    if (dayBookings.length === 0) return "free";
    
    const myBooking = dayBookings.find(b => b.user?.id === currentUser?.id);
    if (myBooking) return "mine";
    
    const otherBooking = dayBookings[0];
    const userIndex = coOwners.findIndex(c => c.id === otherBooking.user?.id);
    return userIndex === 1 ? "other1" : "other2";
  };

  const getDayDotColor = (status) => {
    if (status === "other1") return "bg-blue-400";
    if (status === "other2") return "bg-yellow-400";
    if (status === "mine") return "bg-[#22c55e]";
    return null;
  };

  const selectDay = (d) => {
    setSelectedDate(new Date(year, month, d));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!purpose) {
      alert("Vui lòng điền mục đích sử dụng");
      return;
    }

    setLoading(true);
    try {
      const dateStr = formatDateStr(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      const startDateTime = `${dateStr}T${startTime}:00`;
      const endDateTime = `${dateStr}T${endTime}:00`;

      await onSubmitBooking({
        userId: currentUser?.id || 1,
        startTime: startDateTime,
        endTime: endDateTime,
        purpose: purpose
      });

      setPurpose("");
      alert("Đăng ký lịch đặt xe thành công!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data || "Đã xảy ra lỗi khi đăng ký lịch.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDispute = async (e) => {
    e.preventDefault();
    if (!disputeDesc.trim()) return;
    setSubmittingDispute(true);
    try {
      await createDispute({
        vehicleId: currentUser?.vehicle?.id,
        title: "Báo cáo: Trả xe quá giờ",
        description: disputeDesc,
        priority: "HIGH"
      });
      alert("Đã gửi khiếu nại thành công! Ban quản trị sẽ tiếp nhận và xử lý.");
      setShowDisputeModal(false);
      setDisputeDesc('');
    } catch (err) {
      alert("Lỗi gửi khiếu nại: " + (err.response?.data || err.message));
    } finally {
      setSubmittingDispute(false);
    }
  };

  const totalHours = useMemo(() => {
    const hours = {};
    coOwners.forEach(c => hours[c.id] = 0);
    bookings.forEach(b => {
      const start = new Date(b.startTime);
      const end = new Date(b.endTime);
      const h = (end - start) / (1000 * 60 * 60);
      if (b.user?.id && hours[b.user.id] !== undefined) {
        hours[b.user.id] += h;
      }
    });
    return hours;
  }, [bookings, coOwners]);

  const colors = [
    { text: "text-[#22c55e]", bg: "bg-[#22c55e]" },
    { text: "text-blue-400", bg: "bg-blue-400" },
    { text: "text-yellow-400", bg: "bg-yellow-400" }
  ];

  const selectedDateStr = formatDateStr(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
  
  const timeSlots = [];
  for (let h = 6; h <= 22; h++) {
    const hourStr = `${String(h).padStart(2, "0")}:00`;
    let slotStatus = "free";
    let slotOwner = null;
    let slotColor = "border-slate-200";
    
    const overlappingBooking = bookings.find(b => {
      if (!b.startTime.startsWith(selectedDateStr)) return false;
      const bStartH = new Date(b.startTime).getHours();
      const bEndH = new Date(b.endTime).getHours();
      return h >= bStartH && h < bEndH;
    });

    if (overlappingBooking) {
      const isMine = overlappingBooking.user?.id === currentUser?.id;
      if (isMine) {
        slotStatus = "mine";
        slotColor = "border-[#22c55e] border-2";
        slotOwner = "Của bạn";
      } else {
        slotStatus = "busy";
        slotColor = "border-blue-400 border-2";
        slotOwner = overlappingBooking.user?.name?.split(" ").pop() || "Khác";
      }
    }

    timeSlots.push({ hour: hourStr, status: slotStatus, owner: slotOwner, colorClass: slotColor });
  }

  const formatHour = (dt) => dt.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false });
  const formatMonth = (d) => `Tháng ${d.getMonth() + 1} – ${d.getFullYear()}`;
  
  const selectedDayOfWeek = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][selectedDate.getDay()];

  return (
    <div className="flex flex-col xl:flex-row gap-6">
      {/* Left: Calendar + Time slots */}
      <div className="flex-1 min-w-0 space-y-5">
        
        {/* Month nav + calendar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
              <i className="ph ph-caret-left text-slate-500"></i>
            </button>
            <h2 className="text-base font-semibold">{formatMonth(currentDate)}</h2>
            <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
              <i className="ph ph-caret-right text-slate-500"></i>
            </button>
          </div>

          <div className="grid grid-cols-7 mb-2">
            {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((h) => (
              <div key={h} className="text-center text-[11px] font-semibold text-slate-400 py-1">{h}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5" id="calGrid">
            {prevMonthDays.map((day, idx) => (
              <div key={`prev-${idx}`} className="cal-day rounded-lg border border-transparent p-1.5 text-center text-sm text-slate-300 pointer-events-none">
                {day}
              </div>
            ))}

            {currentMonthDays.map((day) => {
              const status = getDayStatus(day);
              const dotColor = getDayDotColor(status);
              const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
              const isToday = isCurrentMonth && today.getDate() === day;

              let cellClass = "cal-day rounded-lg border p-1.5 text-center text-sm text-ink cursor-pointer ";
              if (isSelected) {
                cellClass += "selected bg-[#22c55e] border-[#22c55e] text-white ";
              } else {
                if (status === "mine") cellClass += "border-[#22c55e] bg-[#ecfdf5] text-[#16a34a] ";
                else if (status === "other1") cellClass += "border-blue-400 bg-blue-50 text-blue-600 ";
                else if (status === "other2") cellClass += "border-yellow-400 bg-yellow-50 text-yellow-600 ";
                else cellClass += "border-slate-100 hover:bg-slate-50 ";
              }

              return (
                <div key={`day-${day}`} onClick={() => selectDay(day)} className={cellClass}>
                  <span className={`block ${isSelected ? "font-bold text-white" : "font-medium"}`}>{day}</span>
                  {isToday && !isSelected && (
                    <span className="block text-[8px] text-[#22c55e] font-semibold">Hôm nay</span>
                  )}
                  {isToday && isSelected && (
                    <span className="block text-[8px] text-green-100 font-semibold">Hôm nay</span>
                  )}
                  {dotColor && !isToday && (
                    <span className={`block w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : dotColor} mx-auto mt-0.5`}></span>
                  )}
                  {!dotColor && !isToday && <span className="block w-1.5 h-1.5 mx-auto mt-0.5"></span>}
                </div>
              );
            })}

            {nextMonthDays.map((day, idx) => (
              <div key={`next-${idx}`} className="cal-day rounded-lg border border-transparent p-1.5 text-center text-sm text-slate-300 pointer-events-none">
                {day}
              </div>
            ))}
          </div>
        </div>

        {/* Time slots */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold">Khung giờ – Thứ {selectedDayOfWeek}, {String(selectedDate.getDate()).padStart(2, "0")}/{String(selectedDate.getMonth() + 1).padStart(2, "0")}/{selectedDate.getFullYear()}</h3>
              <p className="text-xs text-slate-400 mt-0.5">Chọn khung giờ để đặt lịch</p>
            </div>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {timeSlots.map(slot => {
              const h = parseInt(slot.hour.split(":")[0]);
              return (
                <div 
                  key={slot.hour}
                  onClick={() => { 
                    if (slot.status === "free") {
                      setStartTime(slot.hour); 
                      setEndTime(`${String(h+2).padStart(2, "0")}:00`);
                    }
                  }}
                  className={`time-slot rounded-lg p-2 text-center transition-colors ${slot.colorClass} ${slot.status === "free" ? "cursor-pointer hover:border-[#22c55e] hover:bg-[#ecfdf5] border" : ""} ${startTime === slot.hour ? "border-[#22c55e] bg-[#ecfdf5] border" : ""}`}
                >
                  <p className={`text-xs font-semibold ${slot.status === "free" ? "text-ink" : (slot.status === "mine" ? "text-[#16a34a]" : "text-blue-600")}`}>{slot.hour}</p>
                  <p className={`text-[10px] mt-0.5 ${slot.status === "free" ? "text-slate-400" : (slot.status === "mine" ? "text-[#16a34a]" : "text-blue-500")}`}>{slot.owner || "Trống"}</p>
                </div>
              )
            })}
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
            Dựa trên tỷ lệ sở hữu {currentUser?.ownershipPercentage || 40}%, bạn có thể đặt thêm <span className="text-white font-semibold">~18 giờ</span> trong tháng này.
          </p>
          <div className="space-y-2">
            {coOwners.map((c, idx) => {
              const color = colors[idx % colors.length];
              const usedH = totalHours[c.id] || 0;
              const allowedH = (c.ownershipPercentage / 100) * 168; // mock 1 month = 168 for visual
              const pct = Math.min((usedH / (allowedH || 1)) * 100, 100).toFixed(0);
              return (
                <div key={c.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">{c.name}</span>
                    <span className={`${color.text} font-semibold`}>{c.ownershipPercentage}% · {usedH.toFixed(1)}h đã dùng</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full ${color.bg} rounded-full`} style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              )
            })}
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
                value={selectedDateStr}
                onChange={(e) => {
                   const d = new Date(e.target.value);
                   setCurrentDate(d);
                   setSelectedDate(d);
                }}
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
                  {timeSlots.map(t => (
                    <option key={t.hour} value={t.hour}>{t.hour}</option>
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
                  {timeSlots.map(t => (
                    <option key={`end-${t.hour}`} value={t.hour}>{t.hour}</option>
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
              {loading ? "Đang xử lý..." : "Xác nhận đặt lịch"}
            </button>
          </form>
        </div>

        {/* Upcoming bookings */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-semibold">Lịch sắp tới</h3>
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-md font-medium">
              {bookings.length} chuyến
            </span>
          </div>
          
          <button 
            onClick={() => setShowDisputeModal(true)}
            className="w-full mb-4 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <i className="ph ph-warning-circle text-base"></i>
            Khiếu nại (Xe chưa được trả)
          </button>
          
          <div className="space-y-3">
            {bookings.sort((a,b) => new Date(b.startTime) - new Date(a.startTime)).slice(0,5).map((b) => {
              const start = new Date(b.startTime);
              const end = new Date(b.endTime);
              const isConfirmed = b.status === "CONFIRMED" || b.status === "PENDING";
              
              const dayNum = start.getDate();
              const dayName = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][start.getDay()];

              let cardClass = "flex gap-3 p-3 rounded-xl border ";
              let dotClass = "";
              let statusLabel = "";
              let dateBgClass = "";

              if (b.purpose.includes("Khám xe")) {
                cardClass += "bg-slate-50 border-slate-200";
                dotClass = "bg-slate-500";
                dateBgClass = "bg-slate-500";
                statusLabel = "Bảo dưỡng";
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

      {/* Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="bg-red-500 p-4 text-white flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2"><i className="ph-fill ph-warning-circle text-xl"></i> Báo cáo Tranh chấp</h3>
              <button onClick={() => setShowDisputeModal(false)} className="hover:bg-red-600 p-1 rounded-lg transition-colors">
                <i className="ph ph-x"></i>
              </button>
            </div>
            <form onSubmit={handleCreateDispute} className="p-5">
              <p className="text-sm text-slate-600 mb-4">Sử dụng tính năng này nếu người đi trước đã quá giờ mà vẫn chưa trả xe (chưa Check-in) làm ảnh hưởng tới lịch đặt của bạn.</p>
              
              <label className="block text-xs font-bold text-slate-700 mb-2">Chi tiết sự việc</label>
              <textarea 
                className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all mb-5 h-24 resize-none"
                placeholder="Ví dụ: Đã lố 30 phút, gọi điện không bắt máy..."
                value={disputeDesc}
                onChange={(e) => setDisputeDesc(e.target.value)}
                required
              />
              
              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowDisputeModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  disabled={submittingDispute}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors flex justify-center items-center gap-2 disabled:bg-red-300"
                >
                  {submittingDispute ? <i className="ph ph-spinner animate-spin"></i> : <i className="ph ph-paper-plane-tilt"></i>}
                  Gửi báo cáo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default BookingPage;
