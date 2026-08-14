import { useState, useCallback } from 'react';
import { 
  getPendingServices, 
  getCompletedServices, 
  getServiceTemplates, 
  getAllVehicles 
} from '../services/api';

export const useServices = () => {
  const [services, setServices] = useState([]);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [templatesList, setTemplatesList] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchServicesAndVehicles = useCallback(async () => {
    try {
      setLoading(true);
      const [pendingData, completedData, vehiclesData, templatesData] = await Promise.all([
        getPendingServices(),
        getCompletedServices(),
        getAllVehicles(),
        getServiceTemplates()
      ]);

      setTemplatesList(templatesData || []);
      setVehicles(vehiclesData || []);

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
  }, []);

  return {
    services,
    historyLogs,
    templatesList,
    vehicles,
    loading,
    fetchServicesAndVehicles
  };
};
