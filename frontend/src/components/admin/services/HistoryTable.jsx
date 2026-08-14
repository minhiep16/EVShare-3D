import React from 'react';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const HistoryTable = ({ historyLogs }) => {
  if (historyLogs.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
        <p className="text-sm text-slate-500">Chưa có lịch sử bảo dưỡng nào.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
      <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
        <table className="w-full text-left border-collapse relative">
          <thead className="sticky top-0 z-10 backdrop-blur-md bg-white/90 shadow-sm">
            <tr>
              <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Mã DV</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Xe & Nhóm</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Nội dung</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Hoàn thành</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Chi phí</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {historyLogs.map((log, idx) => (
              <tr key={idx} className="hover:bg-slate-50/80 transition-colors duration-200 group">
                <td className="py-4 px-6">
                  <span className="text-xs font-extrabold text-slate-600 bg-slate-100 group-hover:bg-brand-50 group-hover:text-brand-700 transition-colors px-2.5 py-1.5 rounded-lg border border-slate-200 group-hover:border-brand-100">
                    {log.id}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <p className="font-extrabold text-sm text-slate-800">{log.car}</p>
                  <p className="text-xs font-bold text-brand-500">{log.group}</p>
                </td>
                <td className="py-4 px-6">
                  <p className="text-sm text-slate-700 font-medium">{log.service}</p>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <i className="ph-fill ph-check-circle text-green-500 text-lg"></i>
                    <p className="text-sm text-slate-600 font-bold">{log.date}</p>
                  </div>
                </td>
                <td className="py-4 px-6 text-right">
                  <span className="inline-flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 px-3 py-1.5 rounded-xl text-sm font-extrabold shadow-sm">
                    {formatCurrency(log.cost)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoryTable;
