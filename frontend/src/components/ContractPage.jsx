import React, { useState } from 'react';

const ContractPage = ({ currentUser }) => {
  const [appendixSigned, setAppendixSigned] = useState(false);
  const [showViewer, setShowViewer] = useState(false);

  const handleSignAppendix = () => {
    if (appendixSigned) {
      alert('Phụ lục A1 đã được bạn ký điện tử thành công trước đó!');
      return;
    }
    const pin = prompt('Vui lòng nhập mã PIN ký số (mặc định: 1234):');
    if (pin === '1234') {
      setAppendixSigned(true);
      alert('🎉 Ký số thành công! Phụ lục HĐ đã chuyển trạng thái sang "Đang chờ thành viên tiếp theo".');
    } else if (pin !== null) {
      alert('❌ Mã PIN không đúng. Giao dịch ký số bị từ chối.');
    }
  };

  const handleDownload = () => {
    alert('📥 Tải hợp đồng điện tử thành công dưới dạng PDF!');
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6">
      
      {/* Left side: Contracts list */}
      <div className="flex-1 min-w-0 space-y-4">
        
        {/* Active Contract */}
        <div className="bg-gradient-to-br from-[#0f172a] to-slate-800 rounded-2xl p-6 text-white shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="text-xs font-semibold text-[#22c55e] bg-[#22c55e]/20 px-2.5 py-1 rounded-full">
                ● Đang hiệu lực
              </span>
              <h2 className="text-xl font-bold mt-2">HĐ Đồng sở hữu Tesla Model 3</h2>
              <p className="text-slate-400 text-sm mt-1">Số HĐ: EVC-2025-001 · Ký ngày 01/01/2025</p>
            </div>
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
              <i className="ph ph-file-text text-3xl text-[#22c55e]"></i>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-xs text-slate-400 mb-1">Hiệu lực đến</p>
              <p className="font-semibold text-sm sm:text-base">01/01/2027</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-xs text-slate-400 mb-1">Biển số xe</p>
              <p className="font-semibold text-sm sm:text-base">51G-888.99</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-xs text-slate-400 mb-1">Số thành viên</p>
              <p className="font-semibold text-sm sm:text-base">3 người</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-xs text-slate-400 mb-1">Loại hợp đồng</p>
              <p className="font-semibold text-sm sm:text-base">Đồng sở hữu</p>
            </div>
          </div>

          <div className="mb-5">
            <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-3">Bên ký kết</p>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
                <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg" className="w-7 h-7 rounded-full object-cover" />
                <div>
                  <p className="text-xs font-semibold">Nguyễn Thị Mai</p>
                  <p className="text-[10px] text-[#22c55e] font-semibold">✓ Đã ký · 40%</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
                <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg" className="w-7 h-7 rounded-full object-cover" />
                <div>
                  <p className="text-xs font-semibold">Trần Văn Bình</p>
                  <p className="text-[10px] text-[#22c55e] font-semibold">✓ Đã ký · 30%</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
                <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg" className="w-7 h-7 rounded-full object-cover" />
                <div>
                  <p className="text-xs font-semibold">Lê Minh Tuấn</p>
                  <p className="text-[10px] text-[#22c55e] font-semibold">✓ Đã ký · 30%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => setShowViewer(true)}
              className="inline-flex items-center gap-2 bg-[#22c55e] hover:bg-[#16a34a] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              <i className="ph ph-eye"></i>Xem hợp đồng
            </button>
            <button 
              onClick={handleDownload}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              <i className="ph ph-download-simple"></i>Tải về PDF
            </button>
            <button 
              onClick={() => alert('🔗 Đã sao chép liên kết chia sẻ hợp đồng!')}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              <i className="ph ph-share-network"></i>Chia sẻ
            </button>
          </div>
        </div>

        {/* Amendment contract */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
              <i className="ph ph-file-plus text-2xl text-amber-500"></i>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-ink">Phụ lục HĐ – Điều chỉnh tỉ lệ</h3>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      appendixSigned ? 'text-green-600 bg-green-50' : 'text-amber-600 bg-amber-50'
                    }`}>
                      {appendixSigned ? '✓ Đã ký' : '⏳ Chờ ký'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">Số: EVC-2025-001-A1 · Tạo ngày 05/06/2025</p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Điều chỉnh tỉ lệ sở hữu sau khi T.V.Bình chuyển nhượng 5% cho L.M.Tuấn. Tỉ lệ mới: Mai 40%, Bình 25%, Tuấn 35%.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 mt-4 flex-wrap">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg" className="w-6 h-6 rounded-full object-cover ring-2 ring-[#22c55e]" />
                    <span className="text-[11px] text-[#16a34a] font-semibold">✓ Ký rồi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg" className={`w-6 h-6 rounded-full object-cover ring-2 ${appendixSigned ? 'ring-[#22c55e]' : 'ring-amber-400'}`} />
                    <span className={`text-[11px] font-semibold ${appendixSigned ? 'text-[#16a34a]' : 'text-amber-600'}`}>
                      {appendixSigned ? '✓ Ký rồi' : '⏳ Chờ'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg" className="w-6 h-6 rounded-full object-cover ring-2 ring-slate-300" />
                    <span className="text-[11px] text-slate-400 font-semibold">Chưa xem</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowViewer(true)}
                    className="text-xs border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 text-slate-600 font-medium transition-colors cursor-pointer"
                  >
                    <i className="ph ph-eye mr-1"></i>Xem
                  </button>
                  
                  {!appendixSigned && (
                    <button 
                      onClick={handleSignAppendix}
                      className="text-xs bg-[#22c55e] hover:bg-[#16a34a] text-white px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer"
                    >
                      <i className="ph ph-pen-nib mr-1"></i>Ký ngay
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Expired contract */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 opacity-70">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
              <i className="ph ph-file text-2xl text-slate-400"></i>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-ink">HĐ Đồng sở hữu VinFast VF8</h3>
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Hết hạn</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">Số: EVC-2023-005 · 01/01/2023 – 31/12/2024</p>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Hợp đồng đồng sở hữu xe VinFast VF8 đã kết thúc theo thỏa thuận của các bên sở hữu.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <button 
                  onClick={() => alert('📄 Đang tải hợp đồng cũ từ lưu trữ lịch sử...')}
                  className="text-xs border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 text-slate-500 font-medium transition-colors cursor-pointer"
                >
                  <i className="ph ph-eye mr-1"></i>Xem
                </button>
                <button 
                  onClick={handleDownload}
                  className="text-xs border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 text-slate-500 font-medium transition-colors cursor-pointer"
                >
                  <i className="ph ph-download-simple mr-1"></i>Tải PDF
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Right Column: Identity Verification, Timeline and Quick Actions */}
      <div className="w-full xl:w-[340px] space-y-5 shrink-0">
        
        {/* Identity Verification */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-base font-semibold mb-4 text-ink">Xác thực danh tính</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#ecfdf5] border border-[#22c55e]/30">
              <div className="w-10 h-10 rounded-xl bg-[#22c55e] flex items-center justify-center shrink-0">
                <i className="ph ph-identification-card text-white text-xl"></i>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#16a34a]">CCCD đã xác minh ✓</p>
                <p className="text-xs text-slate-500 truncate">079xxxxxxxx · Nguyễn Thị Mai</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#ecfdf5] border border-[#22c55e]/30">
              <div className="w-10 h-10 rounded-xl bg-[#22c55e] flex items-center justify-center shrink-0">
                <i className="ph ph-steering-wheel text-white text-xl"></i>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#16a34a]">GPLX đã xác minh ✓</p>
                <p className="text-xs text-slate-500">Hạng B2 · Cấp 15/03/2020</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#ecfdf5] border border-[#22c55e]/30">
              <div className="w-10 h-10 rounded-xl bg-[#22c55e] flex items-center justify-center shrink-0">
                <i className="ph ph-pen-nib text-white text-xl"></i>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#16a34a]">Chữ ký số ✓</p>
                <p className="text-xs text-slate-500">eSign ID: SIG-NTM-2025</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contract History Timeline */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-base font-semibold mb-4 text-ink">Lịch sử hợp đồng</h3>
          <div className="relative pl-5 space-y-4">
            <div className="absolute left-0 top-2 bottom-2 w-px bg-slate-200"></div>

            <div className="relative">
              <div className="absolute -left-[23px] top-1 w-4 h-4 rounded-full bg-[#22c55e] border-2 border-white shadow-sm"></div>
              <p className="text-xs font-semibold text-[#16a34a]">
                {appendixSigned ? 'Phụ lục A1 đã ký đầy đủ' : 'Phụ lục A1 đang chờ ký'}
              </p>
              <p className="text-[11px] text-slate-400">
                {appendixSigned ? '05/06/2025 · 2/3 đã ký' : '05/06/2025 · 1/3 đã ký'}
              </p>
            </div>

            <div className="relative">
              <div className="absolute -left-[23px] top-1 w-4 h-4 rounded-full bg-slate-300 border-2 border-white shadow-sm"></div>
              <p className="text-xs font-semibold text-ink">HĐ chính thức có hiệu lực</p>
              <p className="text-[11px] text-slate-400">01/01/2025 · Cả 3 bên đã ký</p>
            </div>

            <div className="relative">
              <div className="absolute -left-[23px] top-1 w-4 h-4 rounded-full bg-slate-300 border-2 border-white shadow-sm"></div>
              <p className="text-xs font-semibold text-ink">Lê Minh Tuấn ký</p>
              <p className="text-[11px] text-slate-400">31/12/2024 · eSign xác nhận</p>
            </div>

            <div className="relative">
              <div className="absolute -left-[23px] top-1 w-4 h-4 rounded-full bg-slate-300 border-2 border-white shadow-sm"></div>
              <p className="text-xs font-semibold text-ink">Trần Văn Bình ký</p>
              <p className="text-[11px] text-slate-400">30/12/2024 · eSign xác nhận</p>
            </div>

            <div className="relative">
              <div className="absolute -left-[23px] top-1 w-4 h-4 rounded-full bg-slate-300 border-2 border-white shadow-sm"></div>
              <p className="text-xs font-semibold text-ink">Nguyễn Thị Mai ký (Admin)</p>
              <p className="text-[11px] text-slate-400">29/12/2024 · eSign xác nhận</p>
            </div>

            <div className="relative">
              <div className="absolute -left-[23px] top-1 w-4 h-4 rounded-full bg-slate-200 border-2 border-white shadow-sm"></div>
              <p className="text-xs font-semibold text-ink font-medium">HĐ được tạo & gửi</p>
              <p className="text-[11px] text-slate-400">15/12/2024 · EVShare Staff</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-base font-semibold mb-3 text-ink">Thao tác</h3>
          <div className="space-y-2">
            <button 
              onClick={handleSignAppendix}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-[#22c55e] hover:bg-[#ecfdf5] text-sm text-slate-700 transition-colors cursor-pointer"
            >
              <i className="ph ph-pen-nib text-[#22c55e] text-lg"></i>Ký phụ lục A1
            </button>
            <button 
              onClick={() => alert('📝 Hãy nhập nội dung đề xuất sửa đổi hợp đồng của bạn...')}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm text-slate-700 transition-colors cursor-pointer"
            >
              <i className="ph ph-file-plus text-blue-500 text-lg"></i>Yêu cầu sửa đổi hợp đồng
            </button>
            <button 
              onClick={handleDownload}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm text-slate-700 transition-colors cursor-pointer"
            >
              <i className="ph ph-file-pdf text-red-500 text-lg"></i>Tải toàn bộ hợp đồng (PDF)
            </button>
            <button 
              onClick={() => {
                if (confirm('⚠️ Bạn có chắc chắn muốn yêu cầu chấm dứt hợp đồng đồng sở hữu xe này không?')) {
                  alert('📩 Yêu cầu của bạn đã được ghi nhận và gửi thông báo biểu quyết tới 2 thành viên còn lại.');
                }
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-red-100 hover:bg-red-50 text-sm text-red-500 transition-colors cursor-pointer"
            >
              <i className="ph ph-x-circle text-red-400 text-lg"></i>Yêu cầu chấm dứt hợp đồng
            </button>
          </div>
        </div>

      </div>

      {/* Mock Contract Document Viewer Overlay */}
      {showViewer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl">
            <div className="h-14 border-b border-slate-100 px-6 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-ink text-base">HĐ_DONG_SO_HUU_TESLA_MODEL_3.pdf</h3>
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
                <p className="text-center text-xs text-slate-400 -mt-2">Số: EVC-2025-001</p>
                
                <p className="indent-8 text-justify">
                  Hôm nay, ngày 01 tháng 01 năm 2025, tại TP. Hồ Chí Minh, chúng tôi gồm có các bên cùng tham gia ký hợp đồng đồng sở hữu tài sản chung xe ô tô điện hiệu Tesla Model 3 dưới sự hỗ trợ điều hành quản lý của nền tảng EVShare:
                </p>

                <div className="space-y-1">
                  <p><strong>Bên A (Thành viên sáng lập):</strong> Bà Nguyễn Thị Mai - CMND/CCCD: 079xxxxxxxxx - Sở hữu 40%.</p>
                  <p><strong>Bên B (Thành viên góp vốn):</strong> Ông Trần Văn Bình - CMND/CCCD: 082xxxxxxxxx - Sở hữu 30%.</p>
                  <p><strong>Bên C (Thành viên góp vốn):</strong> Ông Lê Minh Tuấn - CMND/CCCD: 091xxxxxxxxx - Sở hữu 30%.</p>
                </div>

                <div className="space-y-2">
                  <p className="font-bold text-slate-900">ĐIỀU 1: TÀI SẢN ĐỒNG SỞ HỮU</p>
                  <p className="indent-8 text-justify">Tài sản đồng sở hữu là xe ô tô điện 5 chỗ ngồi, nhãn hiệu TESLA Model 3, màu sơn Xanh lục metallic. Biển kiểm soát đăng ký: 51G-888.99. Giá trị tài sản góp vốn mua xe bao gồm cả chi phí lắp đặt cổng sạc.</p>
                </div>

                <div className="space-y-2">
                  <p className="font-bold text-slate-900">ĐIỀU 2: TỈ LỆ SỬ DỤNG VÀ CHI PHÍ</p>
                  <p className="indent-8 text-justify">Các bên thống nhất phân bổ giờ đặt lịch và quãng đường di chuyển mỗi tháng tương ứng chính xác theo tỉ lệ sở hữu cổ phần của từng thành viên. Chi phí vận hành phát sinh (sạc điện, rửa xe) tự chi trả theo quãng đường đi thực tế. Chi phí cố định (bảo hiểm xe, đăng kiểm định kỳ, khấu hao pin) chia sẻ tương ứng với tỉ lệ 40% - 30% - 30% đóng vào Quỹ chung định kỳ.</p>
                </div>

                <div className="pt-8 flex justify-between text-xs text-slate-500 font-sans italic">
                  <div className="text-center">
                    <p className="font-bold not-italic">Đã Ký eSign ✓</p>
                    <p className="mt-1">Nguyễn Thị Mai</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold not-italic">Đã Ký eSign ✓</p>
                    <p className="mt-1">Trần Văn Bình</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold not-italic">Đã Ký eSign ✓</p>
                    <p className="mt-1">Lê Minh Tuấn</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-16 border-t border-slate-100 px-6 flex items-center justify-end gap-3 shrink-0">
              <button 
                onClick={handleDownload}
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

export default ContractPage;
