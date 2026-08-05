import React, { useState, useEffect } from 'react';
import { getVehicleTransactions, getServiceTemplates, proposeServiceVote } from '../services/api';

const GroupPage = ({ coOwners, activeVotes, currentUser, onVoteCast }) => {
  const [fundHistory, setFundHistory] = useState([]);
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [proposeReason, setProposeReason] = useState('');
  
  // Use actual joint fund balance from vehicle
  const fundBalance = currentUser?.vehicle?.jointFundBalance || 0;
  
  useEffect(() => {
    const fetchTransactions = async () => {
      if (currentUser?.vehicle?.id) {
        try {
          const data = await getVehicleTransactions(currentUser.vehicle.id);
          const history = data.map(t => ({
            type: t.type,
            title: t.title,
            desc: t.description || new Date(t.transactionDate).toLocaleDateString('vi-VN'),
            amount: t.type === 'OUT' ? -t.amount : t.amount
          }));
          setFundHistory(history.slice(0, 5));
        } catch (error) {
          console.error("Failed to fetch fund history", error);
        }
      }
    };
    fetchTransactions();

    const fetchTemplates = async () => {
      try {
        const data = await getServiceTemplates();
        setTemplates(data);
        if (data && data.length > 0) {
          setSelectedTemplateId(data[0].id.toString());
        }
      } catch (err) {
        console.error("Failed to fetch templates", err);
      }
    };
    fetchTemplates();
  }, [currentUser]);

  const handleProposeService = async () => {
    if (!selectedTemplateId) return;
    try {
      await proposeServiceVote(currentUser.vehicle.id, {
        templateId: selectedTemplateId,
        reason: proposeReason || 'Đến hạn'
      });
      alert('✅ Đã đệ trình biểu quyết thành công!');
      setShowProposeModal(false);
      setProposeReason('');
      // Ideally refresh votes here
      if (onVoteCast) onVoteCast(null); // trigger refresh
    } catch (e) {
      console.error(e);
      alert('❌ Có lỗi xảy ra khi tạo biểu quyết: ' + (e.response?.data?.message || e.response?.data || e.message));
    }
  };

  const handleVote = async (voteId, agree) => {
    if (onVoteCast) {
      await onVoteCast(voteId, agree);
      if (agree) {
        alert('🗳️ Đã ghi nhận phiếu đồng ý của bạn!');
      } else {
        alert('❌ Đã ghi nhận phiếu từ chối!');
      }
    }
  };

  const handleAddFund = () => {
    alert(`💰 Vui lòng liên hệ Admin hệ thống để nạp quỹ bảo dưỡng cho xe ${currentUser?.vehicle?.model}.`);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
  };

  // Dynamically separate votes
  const openVotes = (activeVotes || []).filter(v => v.status === 'OPEN');
  const pastVotes = (activeVotes || []).filter(v => v.status === 'CLOSED');

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Left Column: Members + Fund */}
      <div className="xl:col-span-2 space-y-5">
        
        {/* Members list card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-ink">Thành viên nhóm</h2>
            <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-lg font-medium">{coOwners.length} thành viên</span>
          </div>

          {/* Member list rendering */}
          {coOwners.map((owner, idx) => {
            const isCurrentUser = currentUser?.id === owner.id;
            
            const colors = [
              { colorClass: "text-[#22c55e]", circleColor: "#22c55e", strokeDash: "40 60" },
              { colorClass: "text-blue-500", circleColor: "#3b82f6", strokeDash: "30 70" },
              { colorClass: "text-amber-500", circleColor: "#f59e0b", strokeDash: "30 70" },
              { colorClass: "text-purple-500", circleColor: "#a855f7", strokeDash: "20 80" },
              { colorClass: "text-pink-500", circleColor: "#ec4899", strokeDash: "10 90" }
            ];
            
            const colorProps = colors[idx % colors.length];

            return (
              <div 
                key={owner.id} 
                className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl border mb-3 last:mb-0 ${
                  isCurrentUser 
                    ? 'border-2 border-[#22c55e]/40 bg-[#ecfdf5]/50' 
                    : 'border-slate-200'
                }`}
              >
                <img 
                  src={owner.avatarUrl || "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg"} 
                  alt={owner.name} 
                  className={`w-14 h-14 rounded-2xl object-cover shrink-0 ${isCurrentUser ? 'ring-2 ring-[#22c55e]/50' : ''}`}
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-semibold text-ink">{owner.name || owner.username}</p>
                    {owner.ownershipPercentage >= 40 && (
                      <span className="text-[10px] font-semibold text-[#16a34a] bg-[#d1fae5] px-2 py-0.5 rounded-full">
                        Admin nhóm
                      </span>
                    )}
                    {isCurrentUser && (
                      <span className="text-[10px] font-semibold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
                        Bạn
                      </span>
                    )}
                  </div>
                  
                  <p className="text-xs text-slate-500 mb-2">
                    ID: MEM-{owner.id.toString().padStart(3, '0')} · Số điện thoại: {owner.phone || 'Chưa cập nhật'}
                  </p>
                  
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-[11px] text-slate-400">Tỉ lệ sở hữu</p>
                      <p className={`text-lg font-bold ${colorProps.colorClass}`}>{owner.ownershipPercentage}%</p>
                    </div>
                  </div>
                </div>

                {isCurrentUser ? (
                  <div className="shrink-0 flex items-center justify-center">
                    <div className="w-16 h-16 relative flex items-center justify-center">
                      <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="3"/>
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke={colorProps.circleColor} strokeWidth="3" strokeDasharray={colorProps.strokeDash} strokeLinecap="round"/>
                      </svg>
                      <span className="absolute text-sm font-bold text-ink">{owner.ownershipPercentage}%</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2 shrink-0 self-start sm:self-center">
                    <button className="text-xs border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 text-slate-600 font-medium transition-colors cursor-pointer">
                      <i className="ph ph-chat-circle mr-1"></i>Nhắn tin
                    </button>
                    {currentUser?.ownershipPercentage >= 40 && (
                      <button className="text-xs border border-slate-200 px-2 py-1.5 rounded-lg hover:bg-red-50 hover:border-red-200 text-slate-400 hover:text-red-500 transition-colors cursor-pointer">
                        <i className="ph ph-user-minus"></i>
                      </button>
                    )}
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
            {coOwners.slice(0,3).map((m, idx) => {
              const bgColors = ["bg-[#ecfdf5]", "bg-blue-50", "bg-amber-50"];
              const textColors = ["text-[#16a34a]", "text-blue-600", "text-amber-600"];
              return (
                <div key={m.id} className={`${bgColors[idx % 3]} rounded-xl p-3 text-center`}>
                  <img src={m.avatarUrl || "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg"} className="w-8 h-8 rounded-full mx-auto mb-2 object-cover" />
                  <p className="text-xs font-medium text-slate-600 mb-1">{(m.name || m.username).split(' ').pop()}</p>
                  <p className={`text-sm font-bold ${textColors[idx % 3]}`}>{formatCurrency(fundBalance * (m.ownershipPercentage/100))}</p>
                  <p className="text-[10px] text-slate-400">{m.ownershipPercentage}%</p>
                </div>
              );
            })}
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
            {fundHistory.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-4">Chưa có giao dịch quỹ nào.</p>
            )}
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
        
        {/* Propose Action */}
        <button 
          onClick={() => setShowProposeModal(true)}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-2xl shadow-sm transition-colors flex items-center justify-center gap-2"
        >
          <i className="ph ph-plus-circle text-lg"></i>
          Đề xuất Dịch vụ Xe
        </button>

        {showProposeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-ink text-lg">Đề xuất Dịch vụ mới</h3>
                <button onClick={() => setShowProposeModal(false)} className="text-slate-400 hover:text-slate-600">
                  <i className="ph ph-x text-lg"></i>
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Chọn dịch vụ sẵn có</label>
                  <select 
                    value={selectedTemplateId} 
                    onChange={e => setSelectedTemplateId(e.target.value)}
                    className="w-full border-slate-200 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
                  >
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} - {formatCurrency(t.estimatedCost)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Lý do đề xuất</label>
                  <textarea 
                    value={proposeReason}
                    onChange={e => setProposeReason(e.target.value)}
                    placeholder="VD: Gần đến lễ cần dọn xe..."
                    className="w-full border-slate-200 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border min-h-[80px]"
                  ></textarea>
                </div>
                <button 
                  onClick={handleProposeService}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg shadow-sm transition-colors"
                >
                  Tạo biểu quyết
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Active Vote Card */}
        {openVotes.map((vote) => {
          const agreedCount = vote.agreedPercentage || 0;
          const totalMembers = vote.totalPercentage || 100;
          const requiredVotes = totalMembers <= 3 ? totalMembers : (totalMembers === 4 ? 3 : (totalMembers === 5 ? 4 : Math.ceil(totalMembers * 0.8)));
          const fillPercentage = Math.min((agreedCount / requiredVotes) * 100, 100);
          
          return (
            <div 
              key={vote.id} 
              className={`bg-white rounded-2xl border-2 shadow-sm p-5 border-amber-200`}
            >
              <div className="flex items-center gap-2 mb-4">
                <i className={`ph ph-hand-pointing text-amber-500 text-xl`}></i>
                <h3 className="text-base font-semibold text-ink">
                  Bỏ phiếu đang mở
                </h3>
                <span className="ml-auto text-[11px] text-red-500 bg-red-50 px-2 py-0.5 rounded-full font-medium">Cần xử lý</span>
              </div>
              
              <div className={`bg-amber-50 rounded-xl p-4 mb-4`}>
                <p className={`text-sm font-semibold mb-1 text-amber-800`}>🗳️ {vote.title}</p>
                <p className={`text-xs leading-relaxed text-amber-700`}>
                  {vote.description}
                </p>
              </div>

              {/* Vote status lists */}
              <div className="space-y-2 mb-4">
                {coOwners.map((m) => {
                  return (
                    <div key={m.id} className="flex items-center gap-3">
                      <img src={m.avatarUrl || "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg"} className="w-7 h-7 rounded-full object-cover shrink-0" />
                      <p className="text-sm flex-1 text-ink">{m.name || m.username}</p>
                    </div>
                  );
                })}
              </div>

              <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
                <div 
                  className="h-full bg-[#22c55e] rounded-full transition-all duration-300" 
                  style={{ width: `${fillPercentage}%` }}
                ></div>
              </div>
              
              <p className="text-xs text-slate-400 mb-4 font-medium">
                {agreedCount}/{totalMembers} đồng ý · Cần {requiredVotes} phiếu để thông qua
              </p>
              
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
            </div>
          );
        })}

        {/* Past votes list card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-base font-semibold mb-4 text-ink">Biểu quyết đã kết thúc</h3>
          <div className="space-y-3">
            {pastVotes.map((v) => {
              const isApproved = v.agreedPercentage >= 50.0;
              return (
                <div 
                  key={v.id} 
                  className={`flex items-start gap-3 p-3 rounded-xl border ${
                    isApproved 
                      ? 'bg-[#ecfdf5] border-[#22c55e]/20' 
                      : 'bg-red-50 border-red-100'
                  }`}
                >
                  {isApproved ? (
                    <i className="ph ph-check-circle-fill text-[#22c55e] text-xl shrink-0 mt-0.5"></i>
                  ) : (
                    <i className="ph ph-x-circle-fill text-red-400 text-xl shrink-0 mt-0.5"></i>
                  )}
                  <div>
                    <p className="text-sm font-medium text-ink">{v.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{v.description}</p>
                  </div>
                </div>
              );
            })}
            {pastVotes.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-4">Chưa có biểu quyết nào.</p>
            )}
          </div>
          {currentUser?.ownershipPercentage >= 40 && (
            <button 
              onClick={() => alert("Chức năng tạo biểu quyết mới đang được cập nhật.")}
              className="mt-3 w-full inline-flex items-center justify-center gap-2 border border-slate-200 text-slate-600 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <i className="ph ph-plus"></i>Tạo biểu quyết mới
            </button>
          )}
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
                Quỹ chung hiện tại là <span className="text-white font-semibold">{formatCurrency(fundBalance)}</span>, đủ chi trả cho đợt bảo dưỡng kế tiếp. Không cần nạp thêm trong tháng tới.
              </p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-xs text-slate-300 leading-relaxed">
                Hãy duy trì tương tác và bỏ phiếu đúng hạn để giữ quyền lợi sử dụng ưu tiên cho mình.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default GroupPage;
