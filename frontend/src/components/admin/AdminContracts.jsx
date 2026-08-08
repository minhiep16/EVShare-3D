import React, { useState, useEffect } from 'react';
import { getVehicleGroups, downloadContract } from '../../services/api';

const AdminContracts = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showViewer, setShowViewer] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const groups = await getVehicleGroups();
      // Map vehicle groups to simulated contracts
      const mappedContracts = groups.map(group => {
        const v = group.vehicle;
        const members = group.members || [];
        const totalMembers = members.length;
        const signedMembers = members.filter(m => m.isContractSigned).length;
        
        const isFullySigned = totalMembers > 0 && signedMembers === totalMembers;
        const isExpired = v.status === 'BROKEN';
        
        const progress = totalMembers > 0 ? Math.round((signedMembers / totalMembers) * 100) : 0;

        return {
          id: `EVC-${currentYear}-${v.id.toString().padStart(3, '0')}`,
          vehicle: v,
          members: members,
          startDate: `01/01/${currentYear}`,
          endDate: `01/01/${currentYear + 2}`,
          status: isExpired ? 'EXPIRED' : (isFullySigned ? 'ACTIVE' : 'PENDING'),
          progress: progress,
        };
      });
      setContracts(mappedContracts);
    } catch (error) {
      console.error('Failed to fetch contracts', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (contractId) => {
    try {
      const blob = await downloadContract();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${contractId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Download failed', error);
      alert('❌ Lỗi khi tải hợp đồng điện tử.');
    }
  };

  const handleViewContract = (contract) => {
    setSelectedContract(contract);
    setShowViewer(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const activeContracts = contracts.filter(c => c.status === 'ACTIVE').length;
  const pendingContracts = contracts.filter(c => c.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      
      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <i className="ph ph-files text-xl"></i>
            </div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Tổng Hợp Đồng</p>
          </div>
          <p className="text-3xl font-bold text-ink">{contracts.length}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#ecfdf5] flex items-center justify-center text-[#22c55e]">
              <i className="ph ph-file-text text-xl"></i>
            </div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Đang Hiệu Lực</p>
          </div>
          <p className="text-3xl font-bold text-ink">{activeContracts}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
              <i className="ph ph-file-dashed text-xl"></i>
            </div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Chờ Chữ Ký</p>
          </div>
          <p className="text-3xl font-bold text-ink">{pendingContracts}</p>
        </div>
      </div>

      {/* Contracts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {contracts.map(contract => (
          <div key={contract.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            
            <div className="p-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${
                  contract.status === 'ACTIVE' ? 'bg-[#ecfdf5] text-[#16a34a] border border-[#22c55e]/20' :
                  contract.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                  'bg-slate-100 text-slate-500 border border-slate-200'
                }`}>
                  {contract.status === 'ACTIVE' ? '● Đang hiệu lực' : contract.status === 'PENDING' ? '⏳ Chờ ký' : 'Hết hạn'}
                </span>
                <span className="text-xs font-semibold text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-sm">
                  {contract.id}
                </span>
              </div>
              <h3 className="text-base font-bold text-ink leading-tight mt-3">HĐ Đồng sở hữu {contract.vehicle.model}</h3>
              <p className="text-xs font-medium text-slate-500 mt-1.5 flex items-center gap-1.5">
                <i className="ph ph-calendar-blank"></i> Ký ngày {contract.startDate}
              </p>
            </div>

            <div className="p-5 flex-1">
              <div className="mb-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Bên Ký Kết ({contract.members.length} người)</p>
                {contract.members.length > 0 ? (
                  <div className="space-y-2.5">
                    {contract.members.map((m, idx) => (
                      <div key={m.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img src={m.avatarUrl || "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg"} className="w-6 h-6 rounded-full object-cover" />
                          <span className="text-sm font-medium text-ink truncate w-32">{m.name || m.username}</span>
                        </div>
                        <span className="text-[10px] font-semibold text-[#16a34a] bg-[#ecfdf5] px-2 py-0.5 rounded-full">
                          {m.ownershipPercentage}% ✓ Ký
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-amber-600 font-medium py-2 flex items-center gap-2">
                    <i className="ph ph-warning-circle"></i> Chưa có thành viên tham gia
                  </p>
                )}
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="text-slate-500">Tiến độ pháp lý</span>
                  <span className={contract.progress === 100 ? 'text-[#22c55e]' : 'text-amber-500'}>{contract.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${contract.progress === 100 ? 'bg-[#22c55e]' : 'bg-amber-400'}`} 
                    style={{width: `${contract.progress}%`}}
                  ></div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2">
              <button 
                onClick={() => handleViewContract(contract)}
                disabled={contract.members.length === 0}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                  contract.members.length > 0 ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer shadow-sm' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <i className="ph ph-eye"></i>Xem trước
              </button>
              <button 
                onClick={() => handleDownload(contract.id)}
                disabled={contract.members.length === 0}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                  contract.members.length > 0 ? 'bg-[#22c55e] hover:bg-[#16a34a] text-white cursor-pointer shadow-sm shadow-[#22c55e]/20' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <i className="ph ph-download-simple"></i>Tải PDF
              </button>
            </div>

          </div>
        ))}
        {contracts.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400">
            <p className="text-base font-semibold text-ink">Chưa có hợp đồng nào</p>
          </div>
        )}
      </div>

      {/* Mock Contract Document Viewer Overlay */}
      {showViewer && selectedContract && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl">
            <div className="h-14 border-b border-slate-100 px-6 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-ink text-base">{selectedContract.id}_{selectedContract.vehicle.model.toUpperCase().replace(/\s+/g, '_')}.pdf</h3>
              <button 
                onClick={() => setShowViewer(false)}
                className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 text-lg transition-colors cursor-pointer"
              >
                <i className="ph ph-x"></i>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-6 text-sm text-slate-600 bg-slate-50 select-none">
              <div className="bg-white border border-slate-200 shadow-sm p-10 max-w-2xl mx-auto space-y-6 font-serif">
                <h2 className="text-center font-bold text-lg text-slate-900 uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h2>
                <p className="text-center font-bold text-xs -mt-4">Độc lập - Tự do - Hạnh phúc</p>
                <div className="w-40 h-[1.5px] bg-slate-400 mx-auto -mt-4"></div>
                
                <h3 className="text-center font-bold text-base text-slate-900 uppercase pt-4">HỢP ĐỒNG ĐỒNG SỞ HỮU XE Ô TÔ ĐIỆN</h3>
                <p className="text-center text-xs text-slate-400 -mt-2">Số: {selectedContract.id}</p>
                
                <p className="indent-8 text-justify">
                  Hôm nay, ngày {new Date().getDate().toString().padStart(2, '0')} tháng {(new Date().getMonth() + 1).toString().padStart(2, '0')} năm {new Date().getFullYear()}, tại TP. Hồ Chí Minh, chúng tôi gồm có các bên cùng tham gia ký hợp đồng đồng sở hữu tài sản chung xe ô tô điện hiệu {selectedContract.vehicle.model} dưới sự hỗ trợ điều hành quản lý của nền tảng EVShare:
                </p>

                <div className="space-y-1">
                  {selectedContract.members.map((m, idx) => (
                    <p key={m.id}><strong>Bên {String.fromCharCode(65 + idx)} (Thành viên góp vốn):</strong> Ông/Bà {m.name || m.username} - Sở hữu {m.ownershipPercentage}%.</p>
                  ))}
                </div>

                <div className="space-y-2">
                  <p className="font-bold text-slate-900">ĐIỀU 1: TÀI SẢN ĐỒNG SỞ HỮU</p>
                  <p className="indent-8 text-justify">Tài sản đồng sở hữu là xe ô tô điện, nhãn hiệu {selectedContract.vehicle.model}. Biển kiểm soát đăng ký: {selectedContract.vehicle.licensePlate}. Giá trị tài sản góp vốn mua xe bao gồm cả chi phí lắp đặt cổng sạc.</p>
                </div>

                <div className="pt-8 flex justify-around text-xs text-slate-500 font-sans italic flex-wrap gap-4">
                  {selectedContract.members.map(m => (
                    <div key={m.id} className="text-center">
                      <p className="font-bold not-italic">Đã Ký eSign ✓</p>
                      <p className="mt-1">{m.name || m.username}</p>
                    </div>
                  ))}
                  <div className="text-center">
                    <p className="font-bold not-italic text-blue-600">Xác nhận EVShare</p>
                    <p className="mt-1">Admin Hệ Thống</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-16 border-t border-slate-100 px-6 flex items-center justify-end gap-3 shrink-0">
              <button 
                onClick={() => handleDownload(selectedContract.id)}
                className="bg-[#22c55e] hover:bg-[#16a34a] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
              >
                Tải xuống bản gốc
              </button>
              <button 
                onClick={() => setShowViewer(false)}
                className="border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm text-slate-600 font-medium transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminContracts;
