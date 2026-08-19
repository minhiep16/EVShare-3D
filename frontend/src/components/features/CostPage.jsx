import React, { useState, useMemo } from 'react';
import FinanceHologram3D from '../3d-architecture/FinanceHologram3D';

const CostPage = ({ transactions: initialTransactions, coOwners, currentUser }) => {
  const [transactions, setTransactions] = useState(initialTransactions || []);
  const [selectedMethod, setSelectedMethod] = useState('wallet');
  const [filterType, setFilterType] = useState('Tất cả');

  // Helper to calculate cost share for a transaction for a given member
  const getTransactionShare = (tx, member) => {
    if (!tx || !member) return 0;
    
    // If the transaction is specifically assigned to a user
    if (tx.userId !== null && tx.userId !== undefined) {
      return String(tx.userId) === String(member.id) ? tx.amount : 0;
    }
    
    // If the transaction is a general group transaction (userId is null)
    const isMaintenance = tx.type === 'MAINTENANCE' || 
                          (tx.categoryName && (tx.categoryName.includes('Bảo dưỡng') || tx.categoryName.includes('Sửa chữa') || tx.categoryName.includes('pin')));
                          
    if (isMaintenance) {
      // Calculate weights: W_i = 1 / P_i
      const weights = coOwners.map(owner => {
        const pct = owner.ownershipPercentage || 0;
        return {
          id: owner.id,
          weight: pct > 0 ? (1.0 / pct) : 0.0
        };
      });
      
      const sumWeights = weights.reduce((sum, w) => sum + w.weight, 0);
      if (sumWeights === 0) return 0;
      
      const userWeight = weights.find(w => w.id === member.id)?.weight || 0;
      return tx.amount * (userWeight / sumWeights);
    } else {
      // Regular cost split directly by ownership percentage
      return tx.amount * (member.ownershipPercentage || 0) / 100;
    }
  };

  // Find all pending transactions where this user owes money
  const pendingTxList = transactions.filter(t => t.status === 'PENDING' && getTransactionShare(t, currentUser) > 0);
  const pendingTx = pendingTxList[0] || null;
  const unpaidAmount = pendingTx ? getTransactionShare(pendingTx, currentUser) : 0;

  const handlePayment = async () => {
    if (!pendingTx) {
      alert('Không có khoản thanh toán nào đang chờ!');
      return;
    }
    
    if (!pendingTx.id) {
      alert('Lỗi dữ liệu: Giao dịch này chưa có ID hợp lệ trên hệ thống. Vui lòng tải lại trang!');
      return;
    }
    
    try {
      // Call actual backend API
      const token = localStorage.getItem('evshare_jwt_token');
      const response = await fetch(`http://localhost:8080/api/transactions/${pendingTx.id}/pay`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Thanh toán thất bại từ máy chủ!');
      }
      
      const updated = transactions.map(t => {
        if (t.id === pendingTx.id) {
          return { ...t, status: 'PAID' };
        }
        return t;
      });
      setTransactions(updated);
      alert('🎉 Thanh toán thành công! Trạng thái giao dịch đã được cập nhật.');
    } catch (err) {
      alert("Lỗi khi thanh toán: " + err.message);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
  };

  const getIconClassForCategory = (type) => {
    switch (type) {
      case 'CHARGE': return 'ph ph-lightning text-brand-500';
      case 'MAINTENANCE': return 'ph ph-wrench text-blue-500';
      case 'INSURANCE': return 'ph ph-shield-check text-amber-500';
      default: return 'ph ph-folder text-slate-400';
    }
  };

  const filteredTransactions = transactions.filter(t => {
    if (filterType === 'Tất cả') return true;
    const catName = t.categoryName || t.title;
    return catName === filterType || (catName && catName.includes(filterType));
  });

  // Calculate totals dynamically (group costs only)
  const groupTransactions = transactions.filter(t => t.type !== 'TRIP_FEE');
  
  const totalCost = useMemo(() => {
    const groupTotalCost = transactions.filter(t => t.type !== 'TRIP_FEE').reduce((sum, t) => sum + t.amount, 0);
    return groupTotalCost;
  }, [transactions]);

  const userShare = totalCost * (currentUser?.ownershipPercentage || 0) / 100;
  const jointFund = currentUser?.vehicle?.jointFundBalance || 0;

  // Donut chart calculations
  const donutData = useMemo(() => {
    const categories = {
      'Sạc điện': 0,
      'Bảo dưỡng': 0,
      'Bảo hiểm': 0,
      'Khác': 0
    };

    groupTransactions.forEach(t => {
      const cat = t.categoryName || t.title || '';
      if (cat.includes('Sạc')) categories['Sạc điện'] += t.amount;
      else if (cat.includes('Bảo dưỡng')) categories['Bảo dưỡng'] += t.amount;
      else if (cat.includes('Bảo hiểm')) categories['Bảo hiểm'] += t.amount;
      else categories['Khác'] += t.amount;
    });

    return [
      { label: 'Sạc điện', value: categories['Sạc điện'], color: '#22c55e' },
      { label: 'Bảo dưỡng', value: categories['Bảo dưỡng'], color: '#3b82f6' },
      { label: 'Bảo hiểm', value: categories['Bảo hiểm'], color: '#f59e0b' },
      { label: 'Khác', value: categories['Khác'], color: '#94a3b8' }
    ].filter(d => d.value > 0);
  }, [groupTransactions]);

  // If no data, use some default for donut visual
  const safeDonutData = donutData.length > 0 ? donutData : [
    { label: 'Chưa có dữ liệu', value: 1, color: '#e2e8f0' }
  ];

  let cumulativePercent = 0;
  const svgCircles = safeDonutData.map(d => {
    const total = donutData.reduce((s, x) => s + x.value, 0) || 1;
    const percent = (d.value / total) * 100;
    const strokeDasharray = `${percent} ${100 - percent}`;
    const strokeDashoffset = -cumulativePercent;
    cumulativePercent += percent;

    return (
      <circle 
        key={d.label}
        cx="18" cy="18" r="15.915" 
        fill="none" 
        stroke={d.color} 
        strokeWidth="3" 
        strokeDasharray={strokeDasharray} 
        strokeDashoffset={strokeDashoffset} 
        strokeLinecap="round"
      />
    );
  });

  const colors = [
    { text: 'text-[#16a34a]', bg: 'bg-[#22c55e]' },
    { text: 'text-blue-600', bg: 'bg-blue-400' },
    { text: 'text-yellow-600', bg: 'bg-yellow-400' },
    { text: 'text-purple-600', bg: 'bg-purple-400' },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
              <i className="ph ph-money text-xl"></i>
            </div>
          </div>
          <p className="text-2xl font-bold text-ink">{formatCurrency(totalCost)}</p>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Tổng chi phí nhóm</p>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#ecfdf5] flex items-center justify-center text-[#22c55e]">
              <i className="ph ph-user text-xl"></i>
            </div>
            <span className="text-xs font-medium text-[#16a34a] bg-[#ecfdf5] px-1.5 py-0.5 rounded-md">{currentUser?.ownershipPercentage || 0}%</span>
          </div>
          <p className="text-2xl font-bold text-ink">{formatCurrency(userShare)}</p>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Phần của bạn</p>
          <p className="text-[11px] text-slate-400 mt-1">Theo tỉ lệ sở hữu</p>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
              <i className="ph ph-warning-circle text-xl"></i>
            </div>
            <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md ${unpaidAmount > 0 ? 'text-amber-600 bg-amber-50' : 'text-green-600 bg-green-50'}`}>
              {unpaidAmount > 0 ? 'Chờ TT' : 'Đã thanh toán'}
            </span>
          </div>
          <p className="text-2xl font-bold text-ink">{formatCurrency(unpaidAmount)}</p>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Chưa thanh toán</p>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#ecfdf5] flex items-center justify-center text-[#22c55e]">
              <i className="ph ph-piggy-bank text-xl"></i>
            </div>
          </div>
          <p className="text-2xl font-bold text-ink">{formatCurrency(jointFund)}</p>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Quỹ chung</p>
        </div>
      </div>

      {/* Charts + Breakdown */}
      <div className="w-full relative rounded-2xl overflow-hidden shadow-sm mt-6 mb-8 border border-slate-700 bg-slate-900">
        <FinanceHologram3D type="donut" data={safeDonutData} title="Chi Phí Nhóm" />
      </div>

      {/* Transaction table + payment panel */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        
        {/* Transaction list */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold">Lịch sử giao dịch</h3>
            <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-500 bg-slate-50">
              <i className="ph ph-funnel text-sm"></i>
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-transparent border-none outline-none text-sm cursor-pointer font-medium"
              >
                <option>Tất cả</option>
                <option>Sạc điện</option>
                <option>Bảo dưỡng</option>
                <option>Bảo hiểm</option>
                <option>Đăng kiểm</option>
                <option>Vệ sinh xe</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400">
                  <th className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wide">Ngày</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wide">Loại chi phí</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wide">Tổng</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wide">Người chịu phí</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wide">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-ink">
                {filteredTransactions.map((t) => {
                  const isPaid = t.status ? t.status === 'PAID' : true;
                  const isPending = t.status === 'PENDING';
                  const isPersonal = t.type === 'TRIP_FEE';
                  const userPart = isPersonal ? (t.amount || 0) : (t.amount || 0) * (currentUser?.ownershipPercentage || 0) / 100;
                  const catName = t.categoryName || t.title;
                  const tDate = t.date || t.transactionDate || t.createdAt;
                  
                  return (
                    <tr 
                      key={t.id} 
                      className={`hover:bg-slate-50 transition-colors ${isPending ? 'bg-amber-50/40' : ''}`}
                    >
                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                        {tDate ? new Date(tDate).toLocaleDateString('vi-VN') : ''}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-col">
                          <span className="flex items-center gap-2 font-medium">
                            <i className={getIconClassForCategory(t.type)}></i>
                            {catName}
                          </span>
                          {t.description && (
                            <span className="text-[10px] text-slate-400 mt-1 max-w-[200px] truncate" title={t.description}>
                              {t.description}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-medium">{formatCurrency(t.amount)}</td>
                      <td className={`py-3 px-3 font-semibold ${isPersonal ? 'text-amber-600' : 'text-slate-600'}`}>
                        {isPersonal ? (
                          <div className="flex flex-col">
                            <span>{t.userName || currentUser?.name}</span>
                            <span className="text-[10px] text-slate-400 font-normal">Cá nhân</span>
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            <span>Quỹ chung</span>
                            <span className="text-[10px] text-slate-400 font-normal">Tất cả thành viên</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                          isPaid ? 'text-[#16a34a] bg-[#ecfdf5]' : 'text-amber-600 bg-amber-50'
                        }`}>
                          {isPaid ? '✓ Đã TT' : '⏳ Chờ TT'}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-400">Không có giao dịch nào phù hợp</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Unpaid Card + Owner Split Summary */}
        <div className="space-y-4">
          {/* Pending Payment Card */}
          {pendingTx && unpaidAmount > 0 ? (
            <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <i className="ph ph-warning-circle text-amber-500 text-xl animate-bounce"></i>
                <h3 className="text-base font-semibold">Thanh toán chờ</h3>
              </div>
              
              <div className="bg-amber-50 rounded-xl p-4 mb-4">
                <p className="text-xs text-amber-600 font-medium mb-1">Phí {pendingTx.categoryName || pendingTx.title}</p>
                <p className="text-2xl font-bold text-amber-700 mb-2">{formatCurrency(unpaidAmount)}</p>
                {pendingTx.description && (
                  <p className="text-[11px] text-amber-600/80 bg-amber-100/50 p-2 rounded-lg border border-amber-200/50 italic leading-relaxed">
                    Chi tiết: {pendingTx.description}
                  </p>
                )}
              </div>

              {/* Payment Methods */}
              <div className="space-y-2 mb-4">
                <div 
                  onClick={() => setSelectedMethod('bank')}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer hover:border-[#22c55e] transition-colors ${
                    selectedMethod === 'bank' ? 'border-2 border-[#22c55e] bg-[#ecfdf5]' : 'border-slate-200'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <i className="ph ph-bank text-blue-600"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Internet Banking</p>
                    <p className="text-xs text-slate-400">Vietcombank, MB Bank...</p>
                  </div>
                  {selectedMethod === 'bank' ? (
                    <i className="ph ph-check-circle-fill text-[#22c55e] text-lg"></i>
                  ) : (
                    <i className="ph ph-circle text-slate-300"></i>
                  )}
                </div>

                <div 
                  onClick={() => setSelectedMethod('wallet')}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer hover:border-[#22c55e] transition-colors ${
                    selectedMethod === 'wallet' ? 'border-2 border-[#22c55e] bg-[#ecfdf5]' : 'border-slate-200'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-[#22c55e]/10 flex items-center justify-center">
                    <i className="ph ph-wallet text-[#22c55e]"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Ví điện tử</p>
                    <p className="text-xs text-slate-400">Momo, ZaloPay, VNPay</p>
                  </div>
                  {selectedMethod === 'wallet' ? (
                    <i className="ph ph-check-circle-fill text-[#22c55e] text-lg"></i>
                  ) : (
                    <i className="ph ph-circle text-slate-300"></i>
                  )}
                </div>
              </div>

              <button 
                onClick={handlePayment}
                className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-white py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
              >
                Thanh toán ngay
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 text-center py-8">
              <div className="w-12 h-12 rounded-full bg-green-50 text-brand-600 flex items-center justify-center text-2xl mx-auto mb-3">
                <i className="ph ph-check-circle-fill"></i>
              </div>
              <h3 className="text-sm font-bold text-ink mb-1">Không có hóa đơn</h3>
              <p className="text-xs text-slate-500">Bạn đã thanh toán đầy đủ các khoản chi phí!</p>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-base font-semibold mb-4">
              {pendingTx ? "Phân chia chi phí chờ thanh toán" : "Phân chia chi phí tích lũy"}
            </h3>
            <div className="space-y-3">
              {coOwners.map((owner, idx) => {
                const ownerShare = pendingTx 
                  ? getTransactionShare(pendingTx, owner)
                  : (totalCost * (owner.ownershipPercentage || 0) / 100);

                const color = colors[idx % colors.length];
                const owesThisTx = pendingTx && getTransactionShare(pendingTx, owner) > 0;
                
                return (
                  <div key={owner.id} className="flex items-center gap-3">
                    <img src={owner.avatarUrl || "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg"} className="w-8 h-8 rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-ink">{owner.name || owner.username || `Thành viên ${owner.id}`}</span>
                        <span className={`font-semibold ${owesThisTx ? 'text-amber-600' : 'text-[#16a34a]'}`}>
                          {formatCurrency(ownerShare)}
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${owesThisTx ? 'bg-amber-400' : color.bg}`} 
                          style={{ 
                            width: pendingTx 
                              ? `${pendingTx.amount > 0 ? (ownerShare / pendingTx.amount) * 100 : 0}%` 
                              : `${owner.ownershipPercentage}%` 
                          }}
                        ></div>
                      </div>
                      <p className={`text-[11px] mt-0.5 ${owesThisTx ? 'text-amber-500' : 'text-slate-400'}`}>
                        {pendingTx 
                          ? `Tỉ lệ đóng góp: ${pendingTx.amount > 0 ? ((ownerShare / pendingTx.amount) * 100).toFixed(1) : 0}% · ${owesThisTx ? 'Chờ TT' : 'Đã TT'}`
                          : `${owner.ownershipPercentage}% cổ phần`
                        }
                      </p>
                    </div>
                  </div>
                );
              })}
              {coOwners.length === 0 && (
                <div className="text-center text-xs text-slate-400">Chưa có thành viên</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostPage;
