import React, { useState } from 'react';

const GroupPage = ({ coOwners, activeVotes: initialVotes, currentUser, onVoteCast }) => {
  const [votes, setVotes] = useState(initialVotes);
  const [fundBalance, setFundBalance] = useState(15800000);
  const [showAddMember, setShowAddMember] = useState(false);

  const handleVote = async (voteId, agree) => {
    // Call parents vote cast handler
    if (onVoteCast) {
      await onVoteCast(voteId);
    }
    
    // Locally simulate vote completion for immediate UI feedback
    const updated = votes.map(v => {
      if (v.id === voteId) {
        const newAgreed = agree ? Math.min(v.agreedCount + 1, v.totalCount) : v.agreedCount;
        const newStatus = newAgreed >= v.totalCount ? 'CLOSED' : 'OPEN';
        const newDesc = newAgreed >= v.totalCount 
          ? `Nâng cấp pin xe – ${newAgreed}/${v.totalCount} đồng ý (Hoàn thành)` 
          : `Nâng cấp pin xe – ${newAgreed}/${v.totalCount} đồng ý`;

        return {
          ...v,
          agreedCount: newAgreed,
          status: newStatus,
          description: newDesc
        };
      }
      return v;
    });
    setVotes(updated);
    alert(agree ? '🗳️ Bạn đã đồng ý đề xuất nâng cấp pin!' : '❌ Bạn đã từ chối đề xuất nâng cấp pin!');
  };

  const handleAddFund = () => {
    const contribution = 3000000;
    setFundBalance(prev => prev + contribution);
    alert(`💰 Đã đóng góp thêm ${formatCurrency(contribution)} vào quỹ chung thành công!`);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // Static fund history list matching mockup
  const fundHistory = [
    { type: 'IN', title: 'Nạp quỹ hàng tháng', desc: '3 thành viên · 01/06/2025', amount: 3000000 },
    { type: 'OUT', title: 'Bảo dưỡng định kỳ 6 tháng', desc: '05/06/2025', amount: -2400000 },
    { type: 'IN', title: 'Nạp quỹ hàng tháng', desc: '3 thành viên · 01/05/2025', amount: 3000000 },
    { type: 'OUT', title: 'Thay lốp xe', desc: '18/05/2025', amount: -1800000 }
  ];

  // Static past votes matching mockup
  const pastVotes = [
    { id: 101, title: 'Gia hạn bảo hiểm VBI', desc: '3/3 đồng ý · 01/05/2025', approved: true },
    { id: 102, title: 'Thêm dịch vụ vệ sinh hàng tháng', desc: '3/3 đồng ý · 15/04/2025', approved: true },
    { id: 103, title: 'Bán xe, mua xe mới', desc: '1/3 đồng ý · 20/03/2025', approved: false }
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Left Column: Members + Fund */}
      <div className="xl:col-span-2 space-y-5">
        
        {/* Members list card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-ink">Thành viên nhóm</h2>
            <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-lg font-medium">3/5 thành viên</span>
          </div>

          {/* Member list rendering */}
          {coOwners.map((owner) => {
            const isMai = owner.name.includes('Mai');
            const isBinh = owner.name.includes('Bình');
            const isTuan = owner.name.includes('Tuấn');

            // Render details from mock markup
            let km = "342 km";
            let cost = "2,940,000₫";
            let colorClass = "text-blue-500";
            let circleColor = "#3b82f6";
            let strokeDash = "30 70";

            if (isMai) {
              km = "342 km";
              cost = "2,940,000₫";
              colorClass = "text-[#22c55e]";
              circleColor = "#22c55e";
              strokeDash = "40 60";
            } else if (isBinh) {
              km = "428 km";
              cost = "2,205,000₫";
              colorClass = "text-blue-500";
              circleColor = "#3b82f6";
              strokeDash = "30 70";
            } else if (isTuan) {
              km = "285 km";
              cost = "2,205,000₫ ⚠️";
              colorClass = "text-amber-500";
              circleColor = "#f59e0b";
              strokeDash = "30 70";
            }

            return (
              <div 
                key={owner.id} 
                className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl border mb-3 last:mb-0 ${
                  isMai 
                    ? 'border-2 border-[#22c55e]/40 bg-[#ecfdf5]/50' 
                    : 'border-slate-200'
                }`}
              >
                <img 
                  src={owner.avatarUrl} 
                  alt={owner.name} 
                  className={`w-14 h-14 rounded-2xl object-cover shrink-0 ${isMai ? 'ring-2 ring-[#22c55e]/50' : ''}`}
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-semibold text-ink">{owner.name}</p>
                    {owner.ownershipPercentage >= 40 && (
                      <span className="text-[10px] font-semibold text-[#16a34a] bg-[#d1fae5] px-2 py-0.5 rounded-full">
                        Admin nhóm
                      </span>
                    )}
                    {isMai && (
                      <span className="text-[10px] font-semibold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
                        Bạn
                      </span>
                    )}
                  </div>
                  
                  <p className="text-xs text-slate-500 mb-2">
                    ID: {isMai ? 'NTM-001' : isBinh ? 'TVB-002' : 'LMT-003'} · Tham gia 01/01/2025
                  </p>
                  
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-[11px] text-slate-400">Tỉ lệ sở hữu</p>
                      <p className={`text-lg font-bold ${colorClass}`}>{owner.ownershipPercentage}%</p>
                    </div>
                    <div className="w-px h-8 bg-slate-200"></div>
                    <div>
                      <p className="text-[11px] text-slate-400">Km tháng này</p>
                      <p className="text-lg font-bold text-ink">{km}</p>
                    </div>
                    <div className="w-px h-8 bg-slate-200"></div>
                    <div>
                      <p className="text-[11px] text-slate-400">Chi phí TT</p>
                      <p className="text-lg font-bold text-[#16a34a]">{cost}</p>
                    </div>
                  </div>
                </div>

                {isMai ? (
                  <div className="shrink-0 flex items-center justify-center">
                    <div className="w-16 h-16 relative flex items-center justify-center">
                      <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="3"/>
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke={circleColor} strokeWidth="3" strokeDasharray={strokeDash} strokeLinecap="round"/>
                      </svg>
                      <span className="absolute text-sm font-bold text-ink">{owner.ownershipPercentage}%</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2 shrink-0 self-start sm:self-center">
                    <button className="text-xs border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 text-slate-600 font-medium transition-colors cursor-pointer">
                      <i className="ph ph-chat-circle mr-1"></i>Nhắn tin
                    </button>
                    <button className="text-xs border border-slate-200 px-2 py-1.5 rounded-lg hover:bg-red-50 hover:border-red-200 text-slate-400 hover:text-red-500 transition-colors cursor-pointer">
                      <i className="ph ph-user-minus"></i>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quỹ chung (Fund Card) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-ink">Quỹ chung</h2>
              <p className="text-xs text-slate-400 mt-0.5">Quỹ bảo dưỡng & dự phòng</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-[#22c55e]">{formatCurrency(fundBalance)}</p>
              <p className="text-xs text-slate-400 font-medium">Số dư hiện tại</p>
            </div>
          </div>

          {/* Contribution breakdown */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-[#ecfdf5] rounded-xl p-3 text-center">
              <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg" className="w-8 h-8 rounded-full mx-auto mb-2 object-cover" />
              <p className="text-xs font-medium text-slate-600 mb-1">N.T.Mai</p>
              <p className="text-sm font-bold text-[#16a34a]">{formatCurrency(fundBalance * 0.40)}</p>
              <p className="text-[10px] text-slate-400">40%</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg" className="w-8 h-8 rounded-full mx-auto mb-2 object-cover" />
              <p className="text-xs font-medium text-slate-600 mb-1">T.V.Bình</p>
              <p className="text-sm font-bold text-blue-600">{formatCurrency(fundBalance * 0.30)}</p>
              <p className="text-[10px] text-slate-400">30%</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 text-center">
              <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg" className="w-8 h-8 rounded-full mx-auto mb-2 object-cover" />
              <p class="text-xs font-medium text-slate-600 mb-1">L.M.Tuấn</p>
              <p className="text-sm font-bold text-amber-600">{formatCurrency(fundBalance * 0.30)}</p>
              <p className="text-[10px] text-slate-400">30%</p>
            </div>
          </div>

          {/* Fund transaction history */}
          <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Lịch sử quỹ gần đây</h4>
          <div className="space-y-2">
            {fundHistory.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 text-sm">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  item.type === 'IN' ? 'bg-[#ecfdf5]' : 'bg-red-50'
                }`}>
                  <i className={`ph ${
                    item.type === 'IN' ? 'ph-arrow-circle-up text-[#22c55e]' : 'ph-arrow-circle-down text-red-500'
                  }`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-ink truncate">{item.title}</p>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                </div>
                <span className={`font-semibold ${item.type === 'IN' ? 'text-[#16a34a]' : 'text-red-500'}`}>
                  {item.amount > 0 ? `+${formatCurrency(item.amount)}` : formatCurrency(item.amount)}
                </span>
              </div>
            ))}
          </div>
          
          <button 
            onClick={handleAddFund}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 border border-[#22c55e] text-[#16a34a] py-2 rounded-lg text-sm font-medium hover:bg-[#ecfdf5] transition-colors cursor-pointer font-semibold"
          >
            <i className="ph ph-plus-circle"></i>Nạp quỹ chung
          </button>
        </div>
      </div>

      {/* Right Column: Voting + AI */}
      <div className="space-y-5">
        
        {/* Active Vote Card */}
        {votes.map((vote) => {
          const isClosed = vote.status === 'CLOSED';
          const votePercentage = (vote.agreedCount / vote.totalCount) * 100;
          
          return (
            <div 
              key={vote.id} 
              className={`bg-white rounded-2xl border-2 shadow-sm p-5 ${isClosed ? 'border-slate-200' : 'border-amber-200'}`}
            >
              <div className="flex items-center gap-2 mb-4">
                <i className={`ph ${isClosed ? 'ph-check-circle text-brand-500' : 'ph-hand-pointing text-amber-500'} text-xl`}></i>
                <h3 className="text-base font-semibold text-ink">
                  {isClosed ? 'Biểu quyết hoàn thành' : 'Bỏ phiếu đang mở'}
                </h3>
                {!isClosed && (
                  <span className="ml-auto text-[11px] text-red-500 bg-red-50 px-2 py-0.5 rounded-full font-medium">3 ngày còn lại</span>
                )}
              </div>
              
              <div className={`${isClosed ? 'bg-slate-50' : 'bg-amber-50'} rounded-xl p-4 mb-4`}>
                <p className={`text-sm font-semibold mb-1 ${isClosed ? 'text-slate-700' : 'text-amber-800'}`}>🔋 {vote.title}</p>
                <p className={`text-xs leading-relaxed ${isClosed ? 'text-slate-500' : 'text-amber-700'}`}>
                  Đề xuất thay pin LFP thế hệ mới để tăng quãng đường lên ~600km. Chi phí ước tính: <strong>45,000,000₫</strong>
                </p>
              </div>

              {/* Vote status lists */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-3">
                  <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg" className="w-7 h-7 rounded-full object-cover shrink-0" />
                  <p className="text-sm flex-1 text-ink">Nguyễn Thị Mai</p>
                  <span className="text-xs font-semibold text-[#16a34a] bg-[#ecfdf5] px-2 py-0.5 rounded-full">✓ Đồng ý</span>
                </div>
                <div className="flex items-center gap-3">
                  <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg" className="w-7 h-7 rounded-full object-cover shrink-0" />
                  <p className="text-sm flex-1 text-ink">Trần Văn Bình</p>
                  <span className="text-xs font-semibold text-[#16a34a] bg-[#ecfdf5] px-2 py-0.5 rounded-full">✓ Đồng ý</span>
                </div>
                <div className="flex items-center gap-3">
                  <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg" className="w-7 h-7 rounded-full object-cover shrink-0" />
                  <p className="text-sm flex-1 text-ink">Lê Minh Tuấn</p>
                  {isClosed ? (
                    <span className="text-xs font-semibold text-[#16a34a] bg-[#ecfdf5] px-2 py-0.5 rounded-full">✓ Đồng ý</span>
                  ) : (
                    <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">⏳ Chưa bỏ phiếu</span>
                  )}
                </div>
              </div>

              <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
                <div 
                  className="h-full bg-[#22c55e] rounded-full transition-all duration-300" 
                  style={{ width: `${votePercentage}%` }}
                ></div>
              </div>
              
              <p className="text-xs text-slate-400 mb-4 font-medium">
                {vote.agreedCount}/{vote.totalCount} đồng ý · {isClosed ? 'Đã thông qua' : 'Cần đủ 3/3 để thông qua'}
              </p>
              
              {!isClosed && (
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => handleVote(vote.id, true)}
                    className="bg-[#22c55e] hover:bg-[#16a34a] text-white py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                  >
                    Đồng ý
                  </button>
                  <button 
                    onClick={() => handleVote(vote.id, false)}
                    className="border border-red-200 text-red-500 hover:bg-red-50 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                  >
                    Từ chối
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Past votes list card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-base font-semibold mb-4 text-ink">Biểu quyết đã kết thúc</h3>
          <div className="space-y-3">
            {pastVotes.map((v) => (
              <div 
                key={v.id} 
                className={`flex items-start gap-3 p-3 rounded-xl border ${
                  v.approved 
                    ? 'bg-[#ecfdf5] border-[#22c55e]/20' 
                    : 'bg-red-50 border-red-100'
                }`}
              >
                {v.approved ? (
                  <i className="ph ph-check-circle-fill text-[#22c55e] text-xl shrink-0 mt-0.5"></i>
                ) : (
                  <i className="ph ph-x-circle-fill text-red-400 text-xl shrink-0 mt-0.5"></i>
                )}
                <div>
                  <p className="text-sm font-medium text-ink">{v.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-3 w-full inline-flex items-center justify-center gap-2 border border-slate-200 text-slate-600 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors cursor-pointer">
            <i className="ph ph-plus"></i>Tạo biểu quyết mới
          </button>
        </div>

        {/* AI group insights card */}
        <div className="bg-gradient-to-br from-[#0f172a] to-slate-800 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-3">
            <i className="ph-fill ph-sparkle text-violet-400 text-lg"></i>
            <h3 className="text-sm font-semibold">AI – Phân tích nhóm</h3>
          </div>
          <div className="space-y-3">
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-xs text-slate-300 leading-relaxed">
                Trần Văn Bình đang <span className="text-white font-semibold">sử dụng vượt 28%</span> so với tỉ lệ sở hữu. Cân nhắc điều chỉnh lịch ưu tiên.
              </p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-xs text-slate-300 leading-relaxed">
                Quỹ chung đủ chi trả cho <span className="text-white font-semibold">2 lần bảo dưỡng</span> tiếp theo. Không cần nạp thêm trong tháng 7.
              </p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-xs text-slate-300 leading-relaxed">
                Lê Minh Tuấn chưa thanh toán chi phí đăng kiểm. Gợi ý <span className="text-white font-semibold">nhắc tự động</span> trước hạn 3 ngày.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default GroupPage;
