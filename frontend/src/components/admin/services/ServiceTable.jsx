import React from 'react';
import { startServiceRecord, deleteServiceRecord } from '../../../services/api';
import Tilt3DCard from '../../shared/Tilt3DCard';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const ServiceTable = ({ services, onEdit, onComplete, onRefresh }) => {
  const handleStartService = async (id) => {
    try {
      const res = await startServiceRecord(id);
      alert('⚙️ ' + res.message);
      onRefresh();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data || err.message));
    }
  };

  const handleDeleteRecord = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa dịch vụ này không?")) {
      try {
        await deleteServiceRecord(id);
        alert("Xóa dịch vụ thành công!");
        onRefresh();
      } catch (err) {
        console.error(err);
        alert("Lỗi khi xóa dịch vụ!");
      }
    }
  };

  if (services.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
        <i className="ph ph-wrench text-4xl text-slate-300 mb-3"></i>
        <h3 className="text-sm font-bold text-slate-700 mb-1">Không có dịch vụ nào</h3>
        <p className="text-xs text-slate-500">Thử thay đổi bộ lọc hoặc thêm mới.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {services.map((srv) => (
        <Tilt3DCard key={srv.id} maxTilt={12} scale={1.02} perspective={1200} className="rounded-2xl h-full">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-xl hover:border-brand-100 transition-all duration-300 group relative overflow-hidden h-full flex flex-col">
            
            {/* Subtle background glow on hover */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-full mix-blend-multiply filter blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="relative z-10 flex justify-between items-start mb-5" style={{ transform: 'translateZ(20px)' }}>
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${srv.iconClass}`}>
                  <i className="text-2xl"></i>
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-lg mb-0.5 group-hover:text-brand-700 transition-colors">{srv.title}</h3>
                  <p className="text-xs text-slate-500 font-medium">Mã DV: <span className="text-slate-700">#{srv.id}</span> • {srv.type}</p>
                </div>
              </div>
              <div className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold border ${srv.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-200' : (srv.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-green-50 text-green-600 border-green-200')}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${srv.status === 'PENDING' ? 'bg-amber-500 animate-pulse' : (srv.status === 'IN_PROGRESS' ? 'bg-blue-500 animate-pulse' : 'bg-green-500')}`}></span>
                {srv.status === 'PENDING' ? 'Đang chờ' : (srv.status === 'IN_PROGRESS' ? 'Đang xử lý' : 'Hoàn thành')}
              </div>
            </div>

            <div className="relative z-10 grid grid-cols-2 gap-4 mb-6 p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl border border-slate-100/50 flex-1" style={{ transform: 'translateZ(10px)' }}>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Phương tiện</p>
                <p className="text-sm font-extrabold text-slate-700">{srv.car}</p>
                <p className="text-xs font-semibold text-brand-500">{srv.plate}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Dự kiến chi phí</p>
                <p className="text-sm font-extrabold text-slate-700">{srv.date}</p>
                <p className="text-xs font-extrabold text-[#16a34a]">{formatCurrency(srv.cost)}</p>
              </div>
            </div>

            <div className="relative z-10 flex gap-3 mt-auto" style={{ transform: 'translateZ(30px)' }}>
              {srv.status === 'PENDING' && (
                <button 
                  onClick={() => handleStartService(srv.id)}
                  className="flex-1 bg-brand-50 hover:bg-brand-600 text-brand-600 hover:text-white py-2.5 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer"
                >
                  Bắt đầu xử lý
                </button>
              )}
              
              {srv.status === 'IN_PROGRESS' && (
                <button 
                  onClick={() => onComplete(srv.id)}
                  className="flex-1 bg-[#22c55e] hover:bg-[#16a34a] text-white py-2.5 rounded-xl text-sm font-bold transition-all duration-300 shadow-md shadow-[#22c55e]/30 hover:shadow-[#22c55e]/50 cursor-pointer"
                >
                  Hoàn thành
                </button>
              )}

              <button 
                onClick={() => onEdit(srv)}
                className="px-4 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 rounded-xl font-medium transition-all duration-300 cursor-pointer flex items-center justify-center shadow-sm"
                title="Sửa thông tin"
              >
                <i className="ph ph-pencil-simple text-lg"></i>
              </button>
              
              {srv.status === 'PENDING' && (
                <button 
                  onClick={() => handleDeleteRecord(srv.id)}
                  className="px-4 bg-white border border-red-100 hover:border-red-200 hover:bg-red-50 text-red-500 rounded-xl font-medium transition-all duration-300 cursor-pointer flex items-center justify-center shadow-sm"
                  title="Xóa lịch"
                >
                  <i className="ph ph-trash text-lg"></i>
                </button>
              )}
            </div>
          </div>
        </Tilt3DCard>
      ))}
    </div>
  );
};

export default ServiceTable;
