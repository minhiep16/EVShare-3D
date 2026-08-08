import React, { useState, useEffect } from 'react';
import { getPendingServices, getCompletedServices, createServiceTemplate, getAllVehicles, createServiceRecord, startServiceRecord, completeServiceRecord, updateServiceRecord, deleteServiceRecord } from '../../services/api';

const AdminServices = () => {
  const [filterCategory, setFilterCategory] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [services, setServices] = useState([]);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Template Creation Modal
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: '', description: '', estimatedCost: '' });

  // Service Record Modal
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [newRecord, setNewRecord] = useState({ vehicleId: '', serviceType: 'Bảo dưỡng', description: '', cost: '', scheduledDate: '' });

  // Edit Service Record Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState({ id: null, vehicleId: '', serviceType: 'Bảo dưỡng', description: '', cost: '', scheduledDate: '' });

  // Service Completion Modal
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completingServiceId, setCompletingServiceId] = useState(null);
  const [actualCost, setActualCost] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchServicesAndVehicles = async () => {
    try {
      setLoading(true);
      const [pendingData, completedData, vehiclesData] = await Promise.all([
        getPendingServices(),
        getCompletedServices(),
        getAllVehicles()
      ]);

      setVehicles(vehiclesData || []);
      if (vehiclesData && vehiclesData.length > 0) {
        setNewRecord(prev => ({ ...prev, vehicleId: vehiclesData[0].id.toString() }));
      }

      const mappedServices = (pendingData || []).map(s => ({
        id: s.id,
        type: s.serviceType,
        title: s.description,
        car: s.vehicle?.model || 'Unknown',
        plate: s.vehicle?.licensePlate || 'Unknown',
        iconClass: s.serviceType === 'Sửa chữa' ? 'ph ph-warning text-red-600 bg-red-50' : 'ph ph-wrench text-blue-600 bg-blue-50',
        status: s.status,
        statusClass: s.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : (s.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'),
        date: s.scheduledDate ? new Date(s.scheduledDate).toLocaleDateString('vi-VN') : 'N/A',
        location: 'Trạm EVShare',
        cost: s.cost || 0,
        rawScheduledDate: s.scheduledDate,
        rawVehicleId: s.vehicle?.id,
        images: []
      }));
      setServices(mappedServices);

      const mappedHistory = (completedData || []).map(s => ({
        id: `#SRV-${s.id.toString().padStart(4, '0')}`,
        car: s.vehicle?.model || 'Unknown',
        group: `Nhóm #EV-${s.vehicle?.id?.toString().padStart(3, '0')}`,
        service: s.description,
        date: (s.completedDate || s.scheduledDate) ? new Date(s.completedDate || s.scheduledDate).toLocaleDateString('vi-VN') : 'N/A',
        cost: s.cost || 0,
        staff: 'Hệ thống EVShare'
      }));
      setHistoryLogs(mappedHistory);
    } catch (err) {
      console.error("Failed to fetch services", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServicesAndVehicles();

    // Listen for custom event from Header
    const handleOpenModal = () => setShowRecordModal(true);
    document.addEventListener('openCreateServiceModal', handleOpenModal);
    return () => document.removeEventListener('openCreateServiceModal', handleOpenModal);
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const filteredServices = services.filter(s => {
    const matchesCategory = filterCategory === 'Tất cả' || s.type === filterCategory;
    const matchesSearch = s.car.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleStartService = async (id) => {
    try {
      const res = await startServiceRecord(id);
      alert('⚙️ ' + res.message);
      fetchServicesAndVehicles();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data || err.message));
    }
  };

  const handleCompleteService = async () => {
    if (!actualCost || actualCost < 0) {
      alert('Vui lòng nhập chi phí thực tế hợp lệ!');
      return;
    }
    try {
      setIsProcessing(true);
      const res = await completeServiceRecord(completingServiceId, parseFloat(actualCost));
      alert('✅ ' + res.message);
      setShowCompleteModal(false);
      setActualCost('');
      fetchServicesAndVehicles();
    } catch (err) {
      alert(err.response?.data || "Đã xảy ra lỗi");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateRecord = async () => {
    if (!editingRecord.vehicleId || !editingRecord.description || !editingRecord.cost) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    try {
      await updateServiceRecord(editingRecord.id, editingRecord);
      alert("Cập nhật dịch vụ thành công!");
      setShowEditModal(false);
      fetchServicesAndVehicles();
    } catch (err) {
      console.error(err);
      alert("Lỗi khi cập nhật dịch vụ!");
    }
  };

  const handleDeleteRecord = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa dịch vụ này không?")) {
      try {
        await deleteServiceRecord(id);
        alert("Xóa dịch vụ thành công!");
        fetchServicesAndVehicles();
      } catch (err) {
        console.error(err);
        alert("Lỗi khi xóa dịch vụ!");
      }
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplate.name || !newTemplate.estimatedCost) {
      alert("Vui lòng nhập Tên dịch vụ và Chi phí dự kiến!");
      return;
    }
    try {
      await createServiceTemplate({
        name: newTemplate.name,
        description: newTemplate.description,
        estimatedCost: parseFloat(newTemplate.estimatedCost)
      });
      alert("✅ Tạo dịch vụ mẫu thành công!");
      setShowTemplateModal(false);
      setNewTemplate({ name: '', description: '', estimatedCost: '' });
    } catch (e) {
      alert("❌ Có lỗi xảy ra khi tạo dịch vụ mẫu.");
    }
  };

  const handleCreateRecord = async () => {
    if (!newRecord.vehicleId || !newRecord.description || !newRecord.cost || !newRecord.scheduledDate) {
      alert("Vui lòng nhập đủ thông tin bắt buộc!");
      return;
    }
    try {
      await createServiceRecord({
        vehicleId: parseInt(newRecord.vehicleId),
        serviceType: newRecord.serviceType,
        description: newRecord.description,
        cost: parseFloat(newRecord.cost),
        scheduledDate: newRecord.scheduledDate
      });
      alert("✅ Đã tạo lịch dịch vụ mới thành công!");
      setShowRecordModal(false);
      // Reload services (a full page reload is simplest for now, or just re-fetch)
      window.location.reload();
    } catch (e) {
      alert("❌ Có lỗi xảy ra khi tạo lịch dịch vụ.");
    }
  };

  return (
    <div className="space-y-6">

      {/* Category filters & alerts status banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {['Tất cả', 'Bảo dưỡng', 'Đăng kiểm', 'Vệ sinh', 'Sửa chữa'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold shadow-sm cursor-pointer transition-colors ${filterCategory === cat
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
          {/* <button 
            onClick={() => setShowTemplateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer"
          >
            <i className="ph ph-plus-circle text-lg"></i> Thêm Dịch vụ mẫu
          </button> */}
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> {services.length} Đang chờ
          </div>
        </div>
      </div>

      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-ink text-lg">Tạo Dịch vụ Mẫu mới</h3>
              <button onClick={() => setShowTemplateModal(false)} className="text-slate-400 hover:text-slate-600">
                <i className="ph ph-x text-lg"></i>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Tên Dịch vụ</label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={e => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  placeholder="VD: Thay lọc gió điều hòa"
                  className="w-full border-slate-200 rounded-lg text-sm p-2 border"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Mô tả chi tiết</label>
                <textarea
                  value={newTemplate.description}
                  onChange={e => setNewTemplate({ ...newTemplate, description: e.target.value })}
                  className="w-full border-slate-200 rounded-lg text-sm p-2 border min-h-[60px]"
                ></textarea>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Chi phí dự kiến (VNĐ)</label>
                <input
                  type="number"
                  value={newTemplate.estimatedCost}
                  onChange={e => setNewTemplate({ ...newTemplate, estimatedCost: e.target.value })}
                  placeholder="VD: 500000"
                  className="w-full border-slate-200 rounded-lg text-sm p-2 border"
                />
              </div>
              <button
                onClick={handleCreateTemplate}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg shadow-sm transition-colors"
              >
                Lưu dịch vụ
              </button>
            </div>
          </div>
        </div>
      )}

      {showRecordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-ink text-lg">Tạo Lịch Dịch Vụ Xe</h3>
              <button onClick={() => setShowRecordModal(false)} className="text-slate-400 hover:text-slate-600">
                <i className="ph ph-x text-lg"></i>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Chọn Xe</label>
                <select
                  value={newRecord.vehicleId}
                  onChange={e => setNewRecord({ ...newRecord, vehicleId: e.target.value })}
                  className="w-full border-slate-200 rounded-lg text-sm focus:ring-brand-500 focus:border-brand-500 p-2 border"
                >
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      Xe #{v.id} - {v.licensePlate} ({v.model})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Loại dịch vụ</label>
                  <select
                    value={newRecord.serviceType}
                    onChange={e => setNewRecord({ ...newRecord, serviceType: e.target.value })}
                    className="w-full border-slate-200 rounded-lg text-sm p-2 border"
                  >
                    <option value="Bảo dưỡng">Bảo dưỡng</option>
                    <option value="Đăng kiểm">Đăng kiểm</option>
                    <option value="Vệ sinh">Vệ sinh</option>
                    <option value="Sửa chữa">Sửa chữa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Chi phí dự kiến</label>
                  <input
                    type="number"
                    value={newRecord.cost}
                    onChange={e => setNewRecord({ ...newRecord, cost: e.target.value })}
                    placeholder="VNĐ"
                    className="w-full border-slate-200 rounded-lg text-sm p-2 border"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Mô tả (Nội dung chi tiết)</label>
                <textarea
                  value={newRecord.description}
                  onChange={e => setNewRecord({ ...newRecord, description: e.target.value })}
                  placeholder="Ví dụ: Thay dầu động cơ, lọc gió..."
                  className="w-full border-slate-200 rounded-lg text-sm p-2 border min-h-[60px]"
                ></textarea>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Ngày giờ dự kiến</label>
                <input
                  type="datetime-local"
                  value={newRecord.scheduledDate}
                  onChange={e => setNewRecord({ ...newRecord, scheduledDate: e.target.value })}
                  className="w-full border-slate-200 rounded-lg text-sm p-2 border"
                />
              </div>
              <button
                onClick={handleCreateRecord}
                className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-white font-semibold py-2.5 rounded-lg shadow-sm transition-colors mt-2"
              >
                Xác nhận tạo lịch
              </button>
            </div>
          </div>
        </div>
      )}

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
              className={`bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col ${isUrgent ? 'border-red-200 ring-1 ring-red-500/10' : 'border-slate-200'
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
                      {formatCurrency(srv.cost)}
                    </span>
                  </div>
                </div>

              </div>

              {/* Card Footer Actions */}
              <div className={`p-3 flex gap-2 border-t ${isUrgent ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-200'
                }`}>
                {srv.status === 'PENDING' ? (
                  <>
                    <button
                      onClick={() => {
                        setEditingRecord({
                          id: srv.id,
                          vehicleId: srv.rawVehicleId?.toString() || '',
                          serviceType: srv.type,
                          description: srv.title,
                          cost: srv.cost,
                          scheduledDate: srv.rawScheduledDate || ''
                        });
                        setShowEditModal(true);
                      }}
                      className="px-3 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <i className="ph ph-pencil-simple text-sm"></i>
                    </button>
                    <button
                      onClick={() => handleDeleteRecord(srv.id)}
                      className="px-3 py-2 text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                    >
                      <i className="ph ph-trash text-sm"></i>
                    </button>
                    <button
                      onClick={() => handleStartService(srv.id)}
                      className="flex-1 py-2 text-xs font-bold text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors cursor-pointer"
                    >
                      Bắt đầu thực hiện
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setCompletingServiceId(srv.id);
                      setActualCost(srv.cost || '');
                      setShowCompleteModal(true);
                    }}
                    className="w-full py-2 text-xs font-bold text-white bg-[#22c55e] rounded-lg hover:bg-[#16a34a] transition-colors cursor-pointer"
                  >
                    Hoàn thành & Khấu trừ quỹ
                  </button>
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

      {/* Completion Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-ink text-lg">Hoàn thành Dịch vụ</h3>
              <button
                onClick={() => setShowCompleteModal(false)}
                className="text-slate-400 hover:text-slate-600"
                disabled={isProcessing}
              >
                <i className="ph ph-x text-lg"></i>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-slate-600">Vui lòng nhập tổng chi phí thực tế cho dịch vụ này. Hệ thống sẽ tự động trừ số tiền này từ Quỹ chung của xe.</p>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Chi phí thực tế (VNĐ)</label>
                <input
                  type="number"
                  value={actualCost}
                  onChange={e => setActualCost(e.target.value)}
                  placeholder="Ví dụ: 1500000"
                  className="w-full border-slate-200 rounded-lg text-sm p-3 border font-bold text-ink focus:ring-brand-500 focus:border-brand-500"
                  disabled={isProcessing}
                />
              </div>
              <button
                onClick={handleCompleteService}
                disabled={isProcessing}
                className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-white font-semibold py-3 rounded-lg shadow-sm transition-colors mt-2"
              >
                {isProcessing ? 'Đang xử lý...' : 'Hoàn thành & Trừ Quỹ chung'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-ink">Lịch sử dịch vụ gần đây</h3>
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

              {historyLogs.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">Không có lịch sử dịch vụ.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Service Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-ink text-lg">Cập nhật Dịch vụ</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                <i className="ph ph-x text-lg"></i>
              </button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Chọn Xe</label>
                <select
                  value={editingRecord.vehicleId}
                  onChange={e => setEditingRecord({ ...editingRecord, vehicleId: e.target.value })}
                  className="w-full border-slate-200 rounded-lg text-sm focus:ring-brand-500 focus:border-brand-500 p-2 border"
                >
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.model} - {v.licensePlate}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Loại dịch vụ</label>
                  <select
                    value={editingRecord.serviceType}
                    onChange={e => setEditingRecord({ ...editingRecord, serviceType: e.target.value })}
                    className="w-full border-slate-200 rounded-lg text-sm p-2 border"
                  >
                    <option value="Bảo dưỡng">Bảo dưỡng</option>
                    <option value="Sửa chữa">Sửa chữa</option>
                    <option value="Đăng kiểm">Đăng kiểm</option>
                    <option value="Vệ sinh">Vệ sinh</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Chi phí dự kiến</label>
                  <input
                    type="number"
                    value={editingRecord.cost}
                    onChange={e => setEditingRecord({ ...editingRecord, cost: e.target.value })}
                    placeholder="VNĐ"
                    className="w-full border-slate-200 rounded-lg text-sm p-2 border"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Mô tả (Nội dung chi tiết)</label>
                <textarea
                  value={editingRecord.description}
                  onChange={e => setEditingRecord({ ...editingRecord, description: e.target.value })}
                  className="w-full border-slate-200 rounded-lg text-sm p-2 border min-h-[60px]"
                ></textarea>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Ngày giờ dự kiến</label>
                <input
                  type="datetime-local"
                  value={editingRecord.scheduledDate}
                  onChange={e => setEditingRecord({ ...editingRecord, scheduledDate: e.target.value })}
                  className="w-full border-slate-200 rounded-lg text-sm p-2 border"
                />
              </div>
              <button
                onClick={handleUpdateRecord}
                className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-white font-semibold py-2.5 rounded-lg shadow-sm transition-colors mt-2"
              >
                Lưu Thay Đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServices;
