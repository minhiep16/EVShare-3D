import React, { useState, useEffect } from 'react';
import { getNotifications, markNotificationRead } from '../../services/api';

const NotificationsTab = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const data = await getNotifications();
        setNotifications(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifs();
  }, []);

  const handleRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) return <div className="text-center py-10">Đang tải thông báo...</div>;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm min-h-[400px]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-ink">Thông báo của bạn</h2>
        {unreadCount > 0 && (
          <span className="bg-brand-100 text-brand-600 text-xs font-bold px-2 py-1 rounded-full">
            {unreadCount} chưa đọc
          </span>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-10 text-slate-500">
          <i className="ph ph-bell-slash text-4xl mb-3 text-slate-300 block"></i>
          Bạn không có thông báo nào.
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(notif => (
            <div 
              key={notif.id} 
              className={`p-4 rounded-xl border flex gap-4 transition-colors ${notif.isRead ? 'bg-slate-50 border-slate-100 opacity-70' : 'bg-white border-brand-200 shadow-sm cursor-pointer hover:border-brand-300'}`}
              onClick={() => !notif.isRead && handleRead(notif.id)}
            >
              <div className="mt-1">
                {notif.type === 'SUCCESS' ? <i className="ph-fill ph-check-circle text-green-500 text-xl"></i> :
                 notif.type === 'WARNING' ? <i className="ph-fill ph-warning-circle text-amber-500 text-xl"></i> :
                 <i className="ph-fill ph-info text-blue-500 text-xl"></i>}
              </div>
              <div className="flex-1">
                <h4 className={`text-sm ${notif.isRead ? 'font-medium text-slate-600' : 'font-bold text-ink'}`}>
                  {notif.title}
                </h4>
                <p className="text-sm text-slate-500 mt-1">{notif.message}</p>
                <span className="text-[11px] text-slate-400 block mt-2">
                  {new Date(notif.createdAt).toLocaleString('vi-VN')}
                </span>
              </div>
              {!notif.isRead && (
                <div className="w-2 h-2 rounded-full bg-brand-500 mt-2"></div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsTab;
