import React, { useState } from 'react';

const BookingForm = ({ currentUser, onSubmit, onCancel }) => {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startTime || !endTime || !purpose) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }
    setLoading(true);
    try {
      await onSubmit({
        userId: currentUser?.id || 1,
        startTime: new Date(startTime).toISOString().slice(0, 19), // ISO format without Z
        endTime: new Date(endTime).toISOString().slice(0, 19),
        purpose: purpose
      });
    } catch (err) {
      console.error(err);
      alert('Đã xảy ra lỗi khi đăng ký lịch đặt xe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-lg mx-auto">
      <h3 className="text-lg font-bold tracking-tight mb-4 text-ink flex items-center gap-2">
        <i className="ph ph-calendar-plus text-brand-500 text-xl"></i>
        Đặt lịch sử dụng xe điện
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Thời gian bắt đầu</label>
          <input 
            type="datetime-local" 
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:border-brand-500 text-sm text-ink"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Thời gian kết thúc</label>
          <input 
            type="datetime-local" 
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:border-brand-500 text-sm text-ink"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Mục đích sử dụng</label>
          <input 
            type="text" 
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="Ví dụ: Đi công tác Q.1, Đón con, Đi siêu thị..."
            className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:border-brand-500 text-sm text-ink"
            required
          />
        </div>
        
        <div className="flex justify-end gap-3 pt-2">
          <button 
            type="button" 
            onClick={onCancel}
            className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm hover:bg-slate-50 cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="px-4 py-2 bg-brand-500 text-white rounded-lg text-sm hover:bg-brand-600 font-medium cursor-pointer"
          >
            {loading ? 'Đang xử lý...' : 'Đăng ký đặt xe'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;
