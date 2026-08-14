import React, { useState } from 'react';
import BaseModal from '../../shared/BaseModal';
import FormField, { Input } from '../../shared/FormField';
import { completeServiceRecord } from '../../../services/api';

const CompleteServiceModal = ({ onClose, onSuccess, serviceId }) => {
  const [actualCost, setActualCost] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCompleteService = async () => {
    if (!actualCost || actualCost < 0) {
      alert('Vui lòng nhập chi phí thực tế hợp lệ!');
      return;
    }
    try {
      setIsProcessing(true);
      const res = await completeServiceRecord(serviceId, parseFloat(actualCost));
      alert('✅ ' + res.message);
      onSuccess();
      onClose();
    } catch (err) {
      alert(err.response?.data || "Đã xảy ra lỗi");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <BaseModal title="Hoàn thành Dịch vụ" onClose={onClose} maxWidth="max-w-sm">
      <FormField label="Chi phí thực tế (VNĐ)">
        <Input 
          type="number"
          value={actualCost}
          onChange={(e) => setActualCost(e.target.value)}
          placeholder="Ví dụ: 1500000"
          className="font-bold text-ink"
        />
      </FormField>
      <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-100">
        Lưu ý: Hệ thống sẽ tự động trừ số tiền này vào <strong>Quỹ chung</strong> của Nhóm sở hữu chiếc xe tương ứng.
      </p>
      <button 
        onClick={handleCompleteService}
        disabled={isProcessing}
        className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {isProcessing ? 'Đang xử lý...' : (
          <><i className="ph-fill ph-check-circle text-lg"></i> Xác nhận Hoàn thành & Trừ Quỹ</>
        )}
      </button>
    </BaseModal>
  );
};

export default CompleteServiceModal;
