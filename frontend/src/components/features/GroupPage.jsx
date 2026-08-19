import React, { useState, useEffect } from 'react';
import { getVehicleTransactions, getServiceTemplates, proposeServiceVote, depositJointFund, proposeLeaderVote, allocateShares } from '../../services/api';
import GroupCouncil3D from '../3d-architecture/GroupCouncil3D';

const GroupPage = ({ coOwners, activeVotes, currentUser, onVoteCast, onDepositSuccess }) => {
  const [fundHistory, setFundHistory] = useState([]);
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [proposeReason, setProposeReason] = useState('');
  
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState(1000000);
  const [depositMethod, setDepositMethod] = useState('EVShare Wallet');

  const [isDepositing, setIsDepositing] = useState(false);
  
  // Group Leader Modals
  const [showLeaderModal, setShowLeaderModal] = useState(false);
  const [leaderNominee, setLeaderNominee] = useState('');
  
  const [showSharesModal, setShowSharesModal] = useState(false);
  const [sharesData, setSharesData] = useState({});
  const [recentDeposits, setRecentDeposits] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('evshare_recent_deposits')) || [];
      const now = new Date().getTime();
      return saved.filter(d => now - d.timestamp < 24 * 60 * 60 * 1000); // 1 day expiry
    } catch { return []; }
  });
  const [isAllocating, setIsAllocating] = useState(false);

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
    }
  };

  const handleAddFund = () => {
    setIsDepositModalOpen(true);
  };

  const submitDeposit = async () => {
    if (!currentUser?.vehicle?.id) return;
    try {
      setIsDepositing(true);
      const res = await depositJointFund(currentUser.vehicle.id, {
        amount: depositAmount,
        paymentMethod: depositMethod
      });
      setIsDepositModalOpen(false);
      const newDeposit = {
        id: Date.now(),
        amount: depositAmount,
        userName: currentUser.name || currentUser.username || 'Bạn',
        avatarUrl: currentUser.avatarUrl,
        timestamp: new Date().getTime()
      };
      const updatedDeposits = [...recentDeposits, newDeposit];
      setRecentDeposits(updatedDeposits);
      localStorage.setItem('evshare_recent_deposits', JSON.stringify(updatedDeposits));
      // Trigger a refresh from App.jsx so data updates
      if (onDepositSuccess) {
        onDepositSuccess();
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi nạp quỹ: ' + (err.response?.data || err.message));
    } finally {
      setIsDepositing(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
  };

  // Dynamically separate votes
  const openVotes = (activeVotes || []).filter(v => v.status === 'OPEN');
  const pastVotes = (activeVotes || []).filter(v => v.status === 'CLOSED');

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500">
      <GroupCouncil3D 
        vehicle={currentUser?.vehicle}
        coOwners={coOwners}
        activeVotes={activeVotes}
        currentUser={currentUser}
        fundBalance={fundBalance}
        onVoteCast={handleVote}
        onDepositClick={() => setIsDepositModalOpen(true)}
        onHistoryClick={() => setShowHistoryModal(true)}
        onProposeClick={() => setShowProposeModal(true)}
        onLeaderClick={() => setShowLeaderModal(true)}
        onSharesClick={() => {
          const initialShares = {};
          coOwners.forEach(o => initialShares[o.id] = o.ownershipPercentage || 0);
          setSharesData(initialShares);
          setShowSharesModal(true);
        }}
        recentDeposits={recentDeposits}
      />

      {/* Deposit Modal */}
      {isDepositModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-in">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#22c55e]/10 flex items-center justify-center text-[#22c55e]">
                  <i className="ph-fill ph-piggy-bank text-xl"></i>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-ink">Nạp quỹ xe</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Thêm ngân sách vào quỹ chung</p>
                </div>
              </div>
              <button 
                onClick={() => !isDepositing && setIsDepositModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-ink transition-colors"
                disabled={isDepositing}
              >
                <i className="ph ph-x"></i>
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-5">
                <label className="block text-xs font-semibold text-slate-700 mb-2">Số tiền nạp (VNĐ)</label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[1000000, 2000000, 5000000].map(amt => (
                    <button
                      key={amt}
                      onClick={() => setDepositAmount(amt)}
                      className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                        depositAmount === amt 
                        ? 'bg-[#22c55e]/10 border-[#22c55e] text-[#16a34a]' 
                        : 'bg-white border-slate-200 text-slate-600 hover:border-brand-300'
                      }`}
                    >
                      {amt / 1000000} Triệu
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">đ</span>
                  <input 
                    type="number" 
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-bold text-ink focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-xs font-semibold text-slate-700 mb-2">Phương thức thanh toán</label>
                <div className="space-y-2">
                  {[
                    { id: 'EVShare Wallet', name: `Ví EVShare (${(currentUser?.walletBalance || 0).toLocaleString('vi-VN')} ₫)`, icon: 'ph-wallet text-brand-500' },
                    { id: 'VNPay', name: 'Thanh toán qua VNPay', icon: 'ph-qr-code text-blue-500' },
                    { id: 'Momo', name: 'Ví điện tử Momo', icon: 'ph-wallet text-pink-500' },
                    { id: 'Bank Transfer', name: 'Chuyển khoản ngân hàng', icon: 'ph-bank text-indigo-500' }
                  ].map(method => (
                    <label 
                      key={method.id} 
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        depositMethod === method.id 
                        ? 'border-[#22c55e] bg-[#f0fdf4]' 
                        : 'border-slate-200 hover:border-brand-300'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="depositMethod" 
                        value={method.id}
                        checked={depositMethod === method.id}
                        onChange={() => setDepositMethod(method.id)}
                        className="hidden"
                      />
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        depositMethod === method.id ? 'border-[#22c55e]' : 'border-slate-300'
                      }`}>
                        {depositMethod === method.id && <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]"></div>}
                      </div>
                      <i className={`ph ${method.icon} text-lg`}></i>
                      <span className={`text-sm font-semibold ${depositMethod === method.id ? 'text-[#16a34a]' : 'text-slate-700'}`}>
                        {method.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <button 
                onClick={submitDeposit}
                disabled={isDepositing}
                className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold py-3.5 rounded-xl transition-all shadow-sm shadow-[#22c55e]/30 flex items-center justify-center gap-2"
              >
                {isDepositing ? (
                  <>
                    <i className="ph ph-spinner animate-spin text-lg"></i>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <i className="ph-fill ph-check-circle text-lg"></i>
                    Xác nhận thanh toán
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Group Leader Election Modal */}
      {showLeaderModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-amber-500 shrink-0">
                <i className="ph-fill ph-crown text-2xl"></i>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-ink mb-1">Bầu Nhóm trưởng</h3>
                <p className="text-sm text-amber-700/80">Chọn một thành viên để đề cử làm Nhóm trưởng. Nhóm trưởng sẽ có quyền quản lý và chia lại tỷ lệ sở hữu.</p>
              </div>
              <button 
                onClick={() => setShowLeaderModal(false)}
                className="w-8 h-8 rounded-full bg-white/50 hover:bg-white text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center shrink-0"
              >
                <i className="ph ph-x text-lg"></i>
              </button>
            </div>
            
            <div className="p-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Thành viên được đề cử</label>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {coOwners.map(owner => (
                  <label 
                    key={owner.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      leaderNominee === owner.id 
                      ? 'border-amber-400 bg-amber-50/50' 
                      : 'border-slate-200 hover:border-amber-200'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="leaderNominee" 
                      checked={leaderNominee === owner.id}
                      onChange={() => setLeaderNominee(owner.id)}
                      className="hidden"
                    />
                    <img 
                      src={owner.avatarUrl || "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg"} 
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-ink">{owner.name || owner.username || `Thành viên ${owner.id}`}</p>
                      <p className="text-xs text-slate-500">Tỷ lệ: {owner.ownershipPercentage || 0}%</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      leaderNominee === owner.id ? 'border-amber-500' : 'border-slate-300'
                    }`}>
                      {leaderNominee === owner.id && <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>}
                    </div>
                  </label>
                ))}
              </div>
              
              <button 
                onClick={async () => {
                  if (!leaderNominee) return alert('Vui lòng chọn 1 thành viên');
                  try {
                    await proposeLeaderVote(currentUser.vehicle.id, leaderNominee);
                    setShowLeaderModal(false);
                    if (onVoteCast) onVoteCast(null);
                  } catch (e) {
                    alert('Lỗi: ' + (e.response?.data || e.message));
                  }
                }}
                disabled={!leaderNominee}
                className="w-full mt-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-sm shadow-amber-500/30 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                Tạo biểu quyết đề cử
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Allocation Modal */}
      {showSharesModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-indigo-500 shrink-0">
                <i className="ph-fill ph-pie-chart text-2xl"></i>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-ink mb-1">Quản lý Cổ phần</h3>
                <p className="text-sm text-indigo-700/80">Là Nhóm trưởng, bạn có quyền phân bổ lại tỷ lệ sở hữu của các thành viên. Tổng tỷ lệ phải bằng 100%.</p>
              </div>
              <button 
                onClick={() => setShowSharesModal(false)}
                className="w-8 h-8 rounded-full bg-white/50 hover:bg-white text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center shrink-0"
              >
                <i className="ph ph-x text-lg"></i>
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
                {coOwners.map(owner => (
                  <div key={owner.id} className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <img 
                      src={owner.avatarUrl || "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg"} 
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-ink truncate">{owner.name || owner.username || `Thành viên ${owner.id}`}</p>
                      {owner.isGroupLeader && <span className="text-[10px] text-amber-600 font-semibold bg-amber-100 px-2 py-0.5 rounded-full">Nhóm trưởng</span>}
                    </div>
                    <div className="w-32 flex items-center gap-2">
                      <input 
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={sharesData[owner.id] !== undefined ? sharesData[owner.id] : ''}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setSharesData(prev => ({...prev, [owner.id]: val}));
                        }}
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-semibold"
                      />
                      <span className="text-slate-500 font-bold">%</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-semibold text-slate-600">Tổng tỷ lệ:</span>
                  <span className={`text-xl font-black ${
                    Math.abs(Object.values(sharesData).reduce((a,b)=>a+b, 0) - 100) < 0.01 ? 'text-[#16a34a]' : 'text-red-500'
                  }`}>
                    {Object.values(sharesData).reduce((a,b)=>a+b, 0).toFixed(1)}%
                  </span>
                </div>
                
                <button 
                  onClick={async () => {
                    const sum = Object.values(sharesData).reduce((a,b)=>a+b, 0);
                    if (Math.abs(sum - 100) >= 0.01) {
                      return alert('Tổng tỷ lệ phải bằng 100%!');
                    }
                    try {
                      setIsAllocating(true);
                      await allocateShares(currentUser.vehicle.id, sharesData);
                      alert('✅ Cập nhật cổ phần thành công!');
                      window.location.reload();
                    } catch (e) {
                      alert('Lỗi: ' + (e.response?.data || e.message));
                    } finally {
                      setIsAllocating(false);
                    }
                  }}
                  disabled={isAllocating}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-sm shadow-indigo-600/30 flex items-center justify-center gap-2"
                >
                  {isAllocating ? 'Đang cập nhật...' : 'Lưu tỷ lệ Cổ phần'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Propose Modal */}
      {showProposeModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-brand-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center text-brand-600">
                  <i className="ph-fill ph-hand-pointing text-xl"></i>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-ink">Đề xuất Dịch vụ</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Tạo biểu quyết cho dịch vụ mới</p>
                </div>
              </div>
              <button onClick={() => setShowProposeModal(false)} className="w-8 h-8 rounded-full bg-white hover:bg-slate-200 text-slate-500 transition-colors flex items-center justify-center shadow-sm">
                <i className="ph ph-x"></i>
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Loại dịch vụ</label>
                <select 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  value={selectedTemplateId} 
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                >
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name} (Tầm ~{new Intl.NumberFormat('vi-VN').format(t.estimatedCost)}đ)</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Lý do / Ghi chú</label>
                <textarea 
                  placeholder="Ví dụ: Xe đã đi được 5000km, cần thay nhớt..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  rows="3"
                  value={proposeReason}
                  onChange={(e) => setProposeReason(e.target.value)}
                ></textarea>
              </div>
              
              <button 
                onClick={handleProposeService}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-sm shadow-brand-500/30 flex items-center justify-center gap-2"
              >
                Đệ trình Biểu quyết
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center text-slate-600">
                  <i className="ph-fill ph-clock-counter-clockwise text-xl"></i>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-ink">Lịch sử Quỹ</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Các giao dịch gần đây</p>
                </div>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="w-8 h-8 rounded-full bg-white hover:bg-slate-200 text-slate-500 transition-colors flex items-center justify-center shadow-sm">
                <i className="ph ph-x"></i>
              </button>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {fundHistory.length > 0 ? (
                <div className="space-y-4">
                  {fundHistory.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        item.type === 'IN' ? 'bg-[#ecfdf5] text-[#22c55e]' : 'bg-red-50 text-red-500'
                      }`}>
                        <i className={`ph text-lg ${
                          item.type === 'IN' ? 'ph-arrow-down-left' : 'ph-arrow-up-right'
                        }`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-ink text-sm truncate">{item.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{item.desc}</p>
                      </div>
                      <span className={`font-black text-sm ${item.type === 'IN' ? 'text-[#16a34a]' : 'text-red-500'}`}>
                        {item.type === 'IN' ? '+' : ''}{formatCurrency(item.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <i className="ph ph-receipt text-4xl mb-3 opacity-50"></i>
                  <p className="text-sm font-medium">Chưa có giao dịch nào</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default GroupPage;
