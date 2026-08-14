import React, { useState } from 'react';
import BaseModal from '../../shared/BaseModal';
import FormField, { Input, Select } from '../../shared/FormField';
import { createServiceTemplate, deleteServiceTemplate } from '../../../services/api';

const TemplateManagerModal = ({ onClose, templatesList, onSuccess }) => {
  const [newTemplate, setNewTemplate] = useState({ name: '', description: '', estimatedCost: '' });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
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
      setNewTemplate({ name: '', description: '', estimatedCost: '' });
      onSuccess();
    } catch (e) {
      alert("❌ Có lỗi xảy ra khi tạo dịch vụ mẫu.");
    }
  };

  const handleDeleteTemplate = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa dịch vụ mẫu này không?")) {
      try {
        await deleteServiceTemplate(id);
        alert("Đã xóa dịch vụ mẫu!");
        onSuccess();
      } catch (err) {
        alert("Lỗi khi xóa dịch vụ mẫu.");
      }
    }
  };

  return (
    <BaseModal title="Quản lý Dịch vụ sẵn có" onClose={onClose} maxWidth="max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Create Form */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-brand-700 bg-brand-50 p-2 rounded-lg text-center">Thêm Dịch vụ mẫu</h4>
          <FormField label="Tên Dịch vụ">
            <Input 
              value={newTemplate.name}
              onChange={e => setNewTemplate({...newTemplate, name: e.target.value})}
              placeholder="VD: Rửa xe bọt tuyết" 
            />
          </FormField>
          <FormField label="Chi phí dự kiến (VNĐ)">
            <Input 
              type="number"
              value={newTemplate.estimatedCost}
              onChange={e => setNewTemplate({...newTemplate, estimatedCost: e.target.value})}
              placeholder="VD: 50000" 
            />
          </FormField>
          <FormField label="Mô tả">
            <Input 
              value={newTemplate.description}
              onChange={e => setNewTemplate({...newTemplate, description: e.target.value})}
              placeholder="Chi tiết công việc..." 
            />
          </FormField>
          <button 
            onClick={handleCreateTemplate}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 rounded-lg transition-colors shadow-sm"
          >
            Thêm mới
          </button>
        </div>

        {/* Right: List Templates */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-700 bg-slate-100 p-2 rounded-lg text-center">Danh sách Dịch vụ mẫu</h4>
          <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
            {templatesList.map(t => (
              <div key={t.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                <div>
                  <p className="font-bold text-sm text-ink">{t.name}</p>
                  <p className="text-xs text-slate-500">{formatCurrency(t.estimatedCost)}</p>
                </div>
                <button 
                  onClick={() => handleDeleteTemplate(t.id)}
                  className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors cursor-pointer"
                  title="Xóa dịch vụ này"
                >
                  <i className="ph ph-trash"></i>
                </button>
              </div>
            ))}
            {templatesList.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">Chưa có dịch vụ mẫu nào.</p>
            )}
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default TemplateManagerModal;
