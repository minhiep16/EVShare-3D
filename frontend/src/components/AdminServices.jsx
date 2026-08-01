import React, { useState, useEffect } from 'react';
import { getPendingServices } from '../services/api';

const AdminServices = () => {
  const [filterCategory, setFilterCategory] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Interactive states for card tasks
  const [service1Status, setService1Status] = useState('Sắp đến hạn');
  const [truckDispatched, setTruckDispatched] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const data = await getPendingServices();
        const mappedServices = data.map(s => ({
          id: s.id,
          type: s.serviceType,
          title: s.description,
          car: s.vehicle?.model || 'Unknown',
          plate: s.vehicle?.licensePlate || 'Unknown',
          iconClass: s.serviceType === 'Sửa chữa' ? 'ph ph-warning text-red-600 bg-red-50' : 'ph ph-wrench text-blue-600 bg-blue-50',
          status: s.status,
          statusClass: s.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-blue-100 text-blue-700',
          date: s.scheduledDate ? new Date(s.scheduledDate).toLocaleDateString('vi-VN') : 'N/A',
          location: 'Trạm EVShare',
          cost: s.cost || 0,
          images: [] // Mock for now
        }));
        setServices(mappedServices);
      } catch (err) {
        console.error("Failed to fetch pending services", err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };
  // Filter category processing
  const filteredServices = services.filter(s => {
    const matchesCategory = filterCategory === 'Tất cả' || s.type === filterCategory;
    const matchesSearch = s.car.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.plate.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleStartService1 = () => {
    if (service1Status === 'Đang thực hiện') {
      alert('⚙️ Dịch vụ bảo dưỡng đã bắt đầu và đang ghi nhận dữ liệu kỹ thuật từ trạm.');
      return;
    }
    setService1Status('Đang thực hiện');
    alert('🔧 Bắt đầu thực hiện bảo dưỡng xe Tesla Model 3. Hệ thống đã cập nhật trạng thái hoạt động.');
  };

  const handleDispatchRescue = () => {
    if (truckDispatched) {
      alert('🚒 Xe cứu hộ đang trên đường di chuyển đến vị trí BYD Atto 3.');
      return;
    }
    setTruckDispatched(true);
    alert('🚒 Đã điều phối xe cứu hộ chuyên dụng 24/7 đến Quốc lộ 1A để kéo xe BYD Atto 3 về trung tâm kỹ thuật.');
  };

  // Historic table logs
  const historyLogs = [
    { id: '#SRV-1092', car: 'Tesla Model 3', group: 'Nhóm #EV-2025-001', service: 'Bảo dưỡng 10,000km', date: '05/06/2025', cost: 2150000, staff: 'Staff: Minh Hoàng' },
    { id: '#SRV-1085', car: 'VinFast VF9', group: 'Nhóm #EV-2025-002', service: 'Thay lốp (2 bánh trước)', date: '01/06/2025', cost: 8400000, staff: 'Staff: Tuấn Anh' },
    { id: '#SRV-1081', car: 'Hyundai Ioniq 6', group: 'Nhóm #EV-2025-003', service: 'Vệ sinh hút bụi', date: '28/05/2025', cost: 200000, staff: 'Mobile Clean Sài Gòn' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Category filters & alerts status banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {['Tất cả', 'Bảo dưỡng', 'Đăng kiểm', 'Vệ sinh', 'Sửa chữa'].map((cat) => (
            <button 
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold shadow-sm cursor-pointer transition-colors ${
                filterCategory === cat 
                  ? 'bg-brand-500 text-white' 
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        
        {/* Simple indicators */}
        <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> 5 Sắp đến hạn
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500"></span> 2 Quá hạn
          </div>
        </div>
      </div>

      {/* Search Input for smaller viewports */}
      <div className="block sm:hidden">
        <div className="relative">
          <i className="ph ph-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm biển số, loại dịch vụ..." 
            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs w-full focus:outline-none focus:border-brand-500 text-ink"
          />
        </div>
      </div>

      {/* Service Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredServices.map((srv) => {
          const isUrgent = srv.type === 'Sửa chữa';
          
          return (
            <div 
              key={srv.id} 
              className={`bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col ${
                isUrgent ? 'border-red-200 ring-1 ring-red-500/10' : 'border-slate-200'
              }`}
            >
              <div className="p-5 flex-1 space-y-4">
                
                {/* Card Title Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0`}>
                      <i className={`${srv.iconClass} text-2xl p-2.5 rounded-xl`}></i>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 leading-tight">{srv.title}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{srv.car} · {srv.plate}</p>
                    </div>
                  </div>
                  
                  <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${srv.statusClass}`}>
                    {srv.status}
                  </span>
                </div>

                {/* Card Main Info */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-500 flex items-center gap-2">
                      <i className="ph ph-calendar text-slate-400 text-sm"></i>
                      {isUrgent ? 'Báo cáo lúc' : 'Ngày dự kiến'}
                    </span>
                    <span className="font-bold text-slate-900">{srv.date}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-500 flex items-center gap-2">
                      <i className="ph ph-map-pin text-slate-400 text-sm"></i>
                      Địa điểm
                    </span>
                    <span className="font-bold text-slate-900 truncate max-w-[180px]">{srv.location}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-500 flex items-center gap-2">
                      <i className={`ph ${isUrgent ? 'ph-wrench' : 'ph-currency-circle-dollar'} text-slate-400 text-sm`}></i>
                      {isUrgent ? 'Sự cố' : 'Dự chi'}
                    </span>
                    <span className={`font-bold ${isUrgent ? 'text-red-500' : 'text-slate-900'}`}>
                      {isUrgent ? srv.issueType : formatCurrency(srv.cost)}
                    </span>
                  </div>
                </div>

                {/* Sub info notifications inside card */}
                {srv.admin && (
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center gap-3">
                    <img src={srv.adminAvatar} className="w-8 h-8 rounded-full border border-white object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-slate-700 truncate">{srv.admin}</p>
                      <p className="text-[9px] text-[#22c55e] font-semibold truncate">{srv.adminStatus}</p>
                    </div>
                    <i className="ph ph-check-circle-fill text-[#22c55e] text-lg"></i>
                  </div>
                )}

                {srv.warningText && (
                  <div className="bg-amber-50 rounded-xl p-3 border border-amber-100 flex items-start gap-2.5">
                    <i className="ph ph-warning-circle text-amber-500 text-lg shrink-0 mt-0.5"></i>
                    <p className="text-[11px] text-amber-700 leading-relaxed font-medium">{srv.warningText}</p>
                  </div>
                )}

                {isUrgent && (
                  <div className="flex -space-x-2 pt-2">
                    {srv.images.map((imgUrl, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => alert('🖼️ Hiển thị phóng to ảnh chụp chi tiết sự cố tại trạm cứu hộ.')}
                        className="w-16 h-16 rounded-lg border-2 border-white overflow-hidden bg-slate-100 shadow-sm cursor-pointer hover:opacity-85 transition-opacity"
                      >
                        <img className="w-full h-full object-cover" src={imgUrl} alt="damage info" />
                      </div>
                    ))}
                    <div className="w-16 h-16 rounded-lg border-2 border-white bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400">
                      +1
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className={`p-3 flex gap-2 border-t ${
                isUrgent ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-200'
              }`}>
                {srv.id === 1 ? (
                  <>
                    <button 
                      onClick={() => alert('🔍 Xem chi tiết lịch trình bảo dưỡng...')}
                      className="flex-1 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Chi tiết
                    </button>
                    <button 
                      onClick={handleStartService1}
                      className="flex-1 py-2 text-xs font-bold text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors cursor-pointer"
                    >
                      {service1Status === 'Đang thực hiện' ? 'Đang xử lý...' : 'Bắt đầu thực hiện'}
                    </button>
                  </>
                ) : srv.id === 2 ? (
                  <>
                    <button 
                      onClick={() => alert('🔍 Xem chi tiết hồ sơ đăng kiểm...')}
                      className="flex-1 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Chi tiết
                    </button>
                    <button 
                      onClick={() => alert('📅 Đã gửi yêu cầu đặt lịch đăng kiểm online tới Trạm 50-03S.')}
                      className="flex-1 py-2 text-xs font-bold text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors cursor-pointer"
                    >
                      Đặt lịch trạm
                    </button>
                  </>
                ) : srv.id === 3 ? (
                  <>
                    <button 
                      onClick={() => alert('❌ Đã từ chối sự cố. Chuyển hồ sơ về cho Bảo hiểm làm việc.')}
                      className="flex-1 py-2 text-xs font-bold text-red-700 bg-white border border-red-200 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                    >
                      Từ chối
                    </button>
                    <button 
                      onClick={handleDispatchRescue}
                      className="flex-1 py-2 text-xs font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
                    >
                      {truckDispatched ? 'Đang điều cứu hộ...' : 'Điều xe cứu hộ'}
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => alert('🔍 Xem quy chuẩn vệ sinh chuyên sâu Ioniq 6...')}
                      className="flex-1 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Chi tiết
                    </button>
                    <button 
                      onClick={() => alert('🧼 Bắt đầu bàn giao xe cho đội vệ sinh Mobile Clean...')}
                      className="flex-1 py-2 text-xs font-bold text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors cursor-pointer"
                    >
                      Giao xe
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}

        {filteredServices.length === 0 && (
          <div className="col-span-3 text-center py-12 text-slate-400 bg-white rounded-2xl border border-slate-200">
            Không tìm thấy lịch dịch vụ nào phù hợp.
          </div>
        )}
      </div>

      {/* Service History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-ink">Lịch sử dịch vụ gần đây</h3>
          <button 
            onClick={() => alert('📥 Đang tải báo cáo tài chính & dịch vụ kỹ thuật tháng 5 dạng PDF...')}
            className="text-xs text-[#22c55e] font-semibold hover:text-[#16a34a] cursor-pointer"
          >
            Tải báo cáo tháng 5
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400">
                <th className="text-left py-3 px-6 text-xs font-semibold uppercase tracking-wide">ID</th>
                <th className="text-left py-3 px-6 text-xs font-semibold uppercase tracking-wide">Xe & Nhóm</th>
                <th className="text-left py-3 px-6 text-xs font-semibold uppercase tracking-wide">Loại dịch vụ</th>
                <th className="text-left py-3 px-6 text-xs font-semibold uppercase tracking-wide">Ngày hoàn tất</th>
                <th className="text-left py-3 px-6 text-xs font-semibold uppercase tracking-wide">Chi phí</th>
                <th className="text-left py-3 px-6 text-xs font-semibold uppercase tracking-wide">Người thực hiện</th>
                <th className="text-left py-3 px-6 text-xs font-semibold uppercase tracking-wide">Trạng thái</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-50 text-ink">
              {historyLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6 text-slate-400 font-semibold">{log.id}</td>
                  <td className="py-4 px-6">
                    <p className="font-bold">{log.car}</p>
                    <p className="text-xs text-slate-400 font-medium">{log.group}</p>
                  </td>
                  <td className="py-4 px-6 font-semibold">{log.service}</td>
                  <td className="py-4 px-6 text-slate-500 font-medium">{log.date}</td>
                  <td className="py-4 px-6 font-bold text-slate-900">{formatCurrency(log.cost)}</td>
                  <td className="py-4 px-6 text-slate-500 font-medium">{log.staff}</td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                      ✓ Hoàn tất
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination logs */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-400 font-medium">Hiển thị 3 / 48 dịch vụ</p>
          <div className="flex gap-2">
            <button className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 cursor-pointer" disabled>
              <i className="ph ph-caret-left"></i>
            </button>
            <button className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <i className="ph ph-caret-right"></i>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminServices;
