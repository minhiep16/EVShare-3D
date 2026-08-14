import React, { useEffect } from 'react';
import BaseModal from '../../shared/BaseModal';
import FormField, { Input, Select, TextArea } from '../../shared/FormField';
import { createServiceRecord, updateServiceRecord } from '../../../services/api';

const RecordFormModal = ({ onClose, onSuccess, templatesList, vehicles, initialData }) => {
  const isEditing = !!initialData?.id;
  const [recordData, setRecordData] = React.useState({
    vehicleId: '',
    serviceType: 'Bảo dưỡng',
    description: '',
    cost: '',
    scheduledDate: ''
  });

  useEffect(() => {
    if (initialData) {
      setRecordData(initialData);
    } else if (vehicles && vehicles.length > 0) {
      setRecordData(prev => ({ ...prev, vehicleId: vehicles[0].id.toString() }));
    }
  }, [initialData, vehicles]);

  const handleSubmit = async () => {
    if (!recordData.vehicleId || !recordData.description || !recordData.cost || !recordData.scheduledDate) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }
    
    try {
      const payload = {
        vehicleId: parseInt(recordData.vehicleId),
        serviceType: recordData.serviceType,
        description: recordData.description,
        cost: parseFloat(recordData.cost),
        scheduledDate: recordData.scheduledDate
      };

      if (isEditing) {
        await updateServiceRecord(initialData.id, payload);
        alert("Cập nhật dịch vụ thành công!");
      } else {
        await createServiceRecord(payload);
        alert("✅ Đã tạo lịch dịch vụ mới thành công!");
      }
      onSuccess();
      onClose();
    } catch (e) {
      console.error(e);
      alert(`❌ Có lỗi xảy ra khi ${isEditing ? 'cập nhật' : 'tạo'} lịch dịch vụ.`);
    }
  };

  const handleTemplateChange = (e) => {
    const selectedName = e.target.value;
    const template = templatesList.find(t => t.name === selectedName);
    if (template) {
      setRecordData({ 
        ...recordData, 
        serviceType: template.name,
        cost: template.estimatedCost,
        description: template.description || ''
      });
    } else {
      setRecordData({ ...recordData, serviceType: selectedName });
    }
  };

  return (
    <BaseModal title={isEditing ? "Cập nhật Lịch Dịch Vụ" : "Tạo Lịch Dịch Vụ Xe"} onClose={onClose}>
      <FormField label="Chọn Xe">
        <Select
          value={recordData.vehicleId}
          onChange={e => setRecordData({ ...recordData, vehicleId: e.target.value })}
        >
          {vehicles.map(v => (
            <option key={v.id} value={v.id}>
              Xe #{v.id} - {v.licensePlate} ({v.model})
            </option>
          ))}
        </Select>
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Loại dịch vụ">
          <Select
            value={recordData.serviceType}
            onChange={handleTemplateChange}
          >
            <option value="">-- Chọn dịch vụ --</option>
            {templatesList.map(t => (
              <option key={t.id} value={t.name}>{t.name}</option>
            ))}
            <option value="Bảo dưỡng">Bảo dưỡng</option>
            <option value="Đăng kiểm">Đăng kiểm</option>
            <option value="Vệ sinh">Vệ sinh</option>
            <option value="Sửa chữa">Sửa chữa</option>
            <option value="Khác">Khác...</option>
          </Select>
        </FormField>

        <FormField label="Chi phí dự kiến (VNĐ)">
          <Input
            type="number"
            value={recordData.cost}
            onChange={e => setRecordData({ ...recordData, cost: e.target.value })}
            placeholder="VNĐ"
          />
        </FormField>
      </div>

      <FormField label="Mô tả (Nội dung chi tiết)">
        <TextArea
          value={recordData.description}
          onChange={e => setRecordData({ ...recordData, description: e.target.value })}
          placeholder="Ví dụ: Thay dầu động cơ, lọc gió..."
        />
      </FormField>

      <FormField label="Ngày giờ dự kiến">
        <Input
          type="datetime-local"
          value={recordData.scheduledDate}
          onChange={e => setRecordData({ ...recordData, scheduledDate: e.target.value })}
        />
      </FormField>

      <button
        onClick={handleSubmit}
        className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-white font-semibold py-2.5 rounded-lg shadow-sm transition-colors mt-2"
      >
        {isEditing ? "Cập nhật dịch vụ" : "Xác nhận tạo lịch"}
      </button>
    </BaseModal>
  );
};

export default RecordFormModal;
