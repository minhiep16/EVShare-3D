import React, { useState, useEffect } from 'react';
import { useServices } from '../../hooks/useServices';
import ServiceBay3D from '../3d-architecture/ServiceBay3D';
import HistoryTable from './services/HistoryTable';
import TemplateManagerModal from './services/TemplateManagerModal';
import RecordFormModal from './services/RecordFormModal';
import CompleteServiceModal from './services/CompleteServiceModal';

const AdminServices = () => {
  const [filterCategory, setFilterCategory] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Single active modal state
  const [activeModal, setActiveModal] = useState(null); 
  // 'TEMPLATE' | 'CREATE_RECORD' | 'EDIT_RECORD' | 'COMPLETE_SERVICE'
  
  // Payload state for edit/complete
  const [modalPayload, setModalPayload] = useState(null);

  const {
    services,
    historyLogs,
    templatesList,
    vehicles,
    loading,
    fetchServicesAndVehicles
  } = useServices();

  useEffect(() => {
    fetchServicesAndVehicles();

    const handleOpenModal = () => setActiveModal('CREATE_RECORD');
    const handleSearch = (e) => setSearchQuery(e.detail || '');
    
    document.addEventListener('openCreateServiceModal', handleOpenModal);
    document.addEventListener('searchServices', handleSearch);
    
    return () => {
      document.removeEventListener('openCreateServiceModal', handleOpenModal);
      document.removeEventListener('searchServices', handleSearch);
    };
  }, [fetchServicesAndVehicles]);

  const filteredServices = services.filter(s => {
    const matchesCategory = filterCategory === 'Tất cả' || s.type === filterCategory;
    const matchesSearch = s.car.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const openEditModal = (service) => {
    setModalPayload({
      id: service.id,
      vehicleId: service.rawVehicleId?.toString() || '',
      serviceType: service.type,
      description: service.title,
      cost: service.cost,
      scheduledDate: service.rawScheduledDate || ''
    });
    setActiveModal('EDIT_RECORD');
  };

  const openCompleteModal = (serviceId) => {
    setModalPayload(serviceId);
    setActiveModal('COMPLETE_SERVICE');
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalPayload(null);
  };

  if (loading && services.length === 0) {
    return <div className="text-center py-10 text-slate-500">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Top Action Bar (Filters + Templates) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Segmented Control Filter */}
        <div className="flex p-1 bg-slate-100 rounded-xl overflow-x-auto custom-scrollbar shadow-inner">
          {['Tất cả', 'Bảo dưỡng', 'Đăng kiểm', 'Vệ sinh', 'Sửa chữa'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-5 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                filterCategory === cat
                  ? 'bg-white text-brand-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Template Button */}
        <button 
          onClick={() => setActiveModal('TEMPLATE')}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-50 hover:bg-brand-100 text-brand-600 rounded-xl transition-all cursor-pointer font-bold border border-brand-200/50"
        >
          <i className="ph ph-squares-four text-lg"></i> Quản lý Mẫu Dịch vụ
        </button>
      </div>

      {/* Main Content Area: Stacked vertically to avoid squishing */}
      <div className="space-y-8">
        
        {/* Top Block: Active Services */}
        <div className="space-y-4">
          <div className="flex justify-between items-end mb-2">
            <div>
              <h2 className="text-xl font-bold text-ink mb-1">Dịch vụ Đang chờ & Xử lý</h2>
              <p className="text-sm text-slate-500">Danh sách các yêu cầu dịch vụ hiện tại.</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> {services.length} Đang hoạt động
            </div>
          </div>

          <ServiceBay3D 
            services={filteredServices} 
            onComplete={openCompleteModal}
            onRefresh={fetchServicesAndVehicles}
          />
        </div>

        {/* Bottom Block: History */}
        <div className="space-y-4 pt-4 border-t border-slate-200/60">
          <div className="flex justify-between items-end mb-2">
            <div>
              <h2 className="text-xl font-bold text-ink mb-1">Lịch sử Dịch vụ</h2>
              <p className="text-sm text-slate-500">Các dịch vụ đã hoàn thành.</p>
            </div>
            <button 
              onClick={() => alert('📥 Xuất báo cáo công việc...')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer text-sm font-semibold border border-slate-200"
              title="Xuất báo cáo"
            >
              <i className="ph ph-download-simple text-lg"></i> Xuất báo cáo
            </button>
          </div>

          <HistoryTable historyLogs={historyLogs} />
        </div>
      </div>

      {/* Modals */}
      {activeModal === 'TEMPLATE' && (
        <TemplateManagerModal 
          onClose={closeModal} 
          templatesList={templatesList} 
          onSuccess={fetchServicesAndVehicles} 
        />
      )}
      
      {(activeModal === 'CREATE_RECORD' || activeModal === 'EDIT_RECORD') && (
        <RecordFormModal 
          onClose={closeModal} 
          onSuccess={fetchServicesAndVehicles}
          templatesList={templatesList}
          vehicles={vehicles}
          initialData={activeModal === 'EDIT_RECORD' ? modalPayload : null}
        />
      )}

      {activeModal === 'COMPLETE_SERVICE' && (
        <CompleteServiceModal 
          onClose={closeModal} 
          onSuccess={fetchServicesAndVehicles}
          serviceId={modalPayload}
        />
      )}
    </div>
  );
};

export default AdminServices;
