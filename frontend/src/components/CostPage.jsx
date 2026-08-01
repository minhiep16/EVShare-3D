import React, { useState } from 'react';

const CostPage = ({ transactions: initialTransactions, coOwners, currentUser }) => {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [selectedMethod, setSelectedMethod] = useState('wallet'); // bank, wallet, qr
  const [filterType, setFilterType] = useState('Tất cả');

  // Find the pending transaction (Đăng kiểm)
  const pendingTx = transactions.find(t => t.status === 'PENDING' || t.title?.includes('Đăng kiểm'));
  const unpaidAmount = pendingTx ? pendingTx.amount * 0.4 : 0;

  const handlePayment = () => {
    if (!pendingTx) {
      alert('Không có khoản thanh toán nào đang chờ!');
      return;
    }
    
    // Update local state to simulate successful payment
    const updated = transactions.map(t => {
      if (t.id === pendingTx.id) {
        return { ...t, status: 'PAID' }; // Just mock updating local state
      }
      return t;
    });
    setTransactions(updated);
    alert('🎉 Thanh toán thành công! Trạng thái giao dịch đã được cập nhật.');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const getIconClassForCategory = (type) => {
    switch (type) {
      case 'CHARGE': return 'ph ph-lightning text-brand-500';
      case 'MAINTENANCE': return 'ph ph-wrench text-blue-500';
      case 'INSURANCE': return 'ph ph-shield-check text-amber-500';
      default: return 'ph ph-folder text-slate-400';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
  };

  // Filter transactions based on selected type
  const filteredTransactions = transactions.filter(t => {
    if (filterType === 'Tất cả') return true;
    const catName = t.categoryName || t.title;
    return catName === filterType || (catName && catName.includes(filterType));
  });

  // Calculate totals
  const totalCostQ2 = 7350000;
  const userShareQ2 = totalCostQ2 * 0.40;

  // Donut chart calculations
  const donutData = [
    { label: 'Sạc điện', value: 3307500, color: '#22c55e' },
    { label: 'Bảo dưỡng', value: 1837500, color: '#3b82f6' },
    { label: 'Bảo hiểm', value: 1470000, color: '#f59e0b' },
    { label: 'Khác', value: 735000, color: '#94a3b8' }
  ];

  // SVG parameters for donut
  let cumulativePercent = 0;
  const getCoordinatesForPercent = (percent) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

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
            <span className="text-xs font-medium text-red-500 bg-red-50 px-1.5 py-0.5 rounded-md">+12%</span>
          </div>
          <p className="text-2xl font-bold text-ink">{formatCurrency(totalCostQ2)}</p>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Tổng chi phí nhóm</p>
          <p className="text-[11px] text-slate-400 mt-1">Q2/2025</p>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#ecfdf5] flex items-center justify-center text-[#22c55e]">
              <i className="ph ph-user text-xl"></i>
            </div>
            <span className="text-xs font-medium text-[#16a34a] bg-[#ecfdf5] px-1.5 py-0.5 rounded-md">40%</span>
          </div>
          <p className="text-2xl font-bold text-ink">{formatCurrency(userShareQ2)}</p>
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
          <p className={`text-[11px] mt-1 ${unpaidAmount > 0 ? 'text-red-400 font-medium' : 'text-slate-400'}`}>
            {unpaidAmount > 0 ? 'Hạn: 15/06/2025' : 'Hóa đơn sạch'}
          </p>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#ecfdf5] flex items-center justify-center text-[#22c55e]">
              <i className="ph ph-piggy-bank text-xl"></i>
            </div>
            <span className="text-xs font-medium text-[#16a34a] bg-[#ecfdf5] px-1.5 py-0.5 rounded-md animate-pulse">Ổn định</span>
          </div>
          <p className="text-2xl font-bold text-ink">15,800,000₫</p>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Quỹ chung</p>
          <p className="text-[11px] text-slate-400 mt-1">Đủ cho 2 lần bảo dưỡng</p>
        </div>
      </div>

      {/* Charts + Breakdown */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        
        {/* Bar chart - 6 months */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold">Chi phí theo tháng</h3>
              <p className="text-xs text-slate-400 mt-0.5">6 tháng gần nhất (đơn vị: nghìn đồng)</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1.5 rounded bg-[#22c55e] inline-block"></span>Của bạn
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1.5 rounded bg-slate-200 inline-block"></span>Tổng nhóm
              </span>
            </div>
          </div>
          
          {/* Responsive SVG Bar Chart */}
          <div className="relative w-full h-[240px]">
            <svg viewBox="0 0 600 240" className="w-full h-full">
              {/* Grid Lines */}
              <line x1="50" y1="30" x2="570" y2="30" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="50" y1="80" x2="570" y2="80" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="50" y1="130" x2="570" y2="130" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="50" y1="180" x2="570" y2="180" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="50" y1="210" x2="570" y2="210" stroke="#cbd5e1" strokeWidth="1" />

              {/* Y Axis Labels */}
              <text x="40" y="34" textAnchor="end" className="text-[11px] fill-slate-400 font-medium">8k</text>
              <text x="40" y="84" textAnchor="end" className="text-[11px] fill-slate-400 font-medium">6k</text>
              <text x="40" y="134" textAnchor="end" className="text-[11px] fill-slate-400 font-medium">4k</text>
              <text x="40" y="184" textAnchor="end" className="text-[11px] fill-slate-400 font-medium">2k</text>
              <text x="40" y="214" textAnchor="end" className="text-[11px] fill-slate-400 font-medium">0</text>

              {/* Data Bars */}
              {/* T1 */}
              <rect x="80" y="105" width="36" height="105" rx="4" className="fill-slate-200" />
              <rect x="86" y="168" width="24" height="42" rx="4" className="fill-brand-500" />
              <text x="98" y="228" textAnchor="middle" className="text-xs font-semibold fill-slate-400">T1</text>
              
              {/* T2 */}
              <rect x="160" y="87.5" width="36" height="122.5" rx="4" className="fill-slate-200" />
              <rect x="166" y="161" width="24" height="49" rx="4" className="fill-brand-500" />
              <text x="178" y="228" textAnchor="middle" className="text-xs font-semibold fill-slate-400">T2</text>
              
              {/* T3 */}
              <rect x="240" y="93.8" width="36" height="116.2" rx="4" className="fill-slate-200" />
              <rect x="246" y="163" width="24" height="47" rx="4" className="fill-brand-500" />
              <text x="258" y="228" textAnchor="middle" className="text-xs font-semibold fill-slate-400">T3</text>
              
              {/* T4 */}
              <rect x="320" y="81.2" width="36" height="128.8" rx="4" className="fill-slate-200" />
              <rect x="326" y="159" width="24" height="51" rx="4" className="fill-brand-500" />
              <text x="338" y="228" textAnchor="middle" className="text-xs font-semibold fill-slate-400">T4</text>
              
              {/* T5 */}
              <rect x="400" y="70" width="36" height="140" rx="4" className="fill-slate-200" />
              <rect x="406" y="154" width="24" height="56" rx="4" className="fill-brand-500" />
              <text x="418" y="228" textAnchor="middle" className="text-xs font-semibold fill-slate-400">T5</text>
              
              {/* T6 */}
              <rect x="480" y="60.5" width="36" height="149.5" rx="4" className="fill-slate-200" />
              <rect x="486" y="150" width="24" height="60" rx="4" className="fill-brand-500" />
              <text x="498" y="228" textAnchor="middle" className="text-xs font-semibold fill-slate-400">T6</text>
            </svg>
          </div>
        </div>

        {/* Donut cost breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold mb-1">Phân loại chi phí</h3>
            <p className="text-xs text-slate-400 mb-3">Q2/2025</p>
          </div>
          
          <div className="flex-1 flex items-center justify-center py-1">
            <div className="relative w-44 h-44">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e2e8f0" strokeWidth="3"/>
                {/* Sạc điện: 45% (22c55e) */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#22c55e" strokeWidth="3" strokeDasharray="45 55" strokeLinecap="round"/>
                {/* Bảo dưỡng: 25% (3b82f6) */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#3b82f6" strokeWidth="3" strokeDasharray="25 75" strokeDashoffset="-45" strokeLinecap="round"/>
                {/* Bảo hiểm: 20% (f59e0b) */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="20 80" strokeDashoffset="-70" strokeLinecap="round"/>
                {/* Khác: 10% (94a3b8) */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#94a3b8" strokeWidth="3" strokeDasharray="10 90" strokeDashoffset="-90" strokeLinecap="round"/>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-lg font-bold tracking-tight">Q2</p>
                <p className="text-[10px] text-slate-400 font-medium">Phân chia</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2 mt-3">
            {donutData.map(d => (
              <div key={d.label} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: d.color }}></span>
                  {d.label}
                </span>
                <span className="font-semibold">{formatCurrency(d.value)}</span>
              </div>
            ))}
          </div>
        </div>
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
                  <th className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wide">Phần bạn (40%)</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wide">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-ink">
                {filteredTransactions.map((t) => {
                  const isPaid = t.status ? t.status === 'PAID' : true; // default paid for IN/OUT
                  const isPending = t.status === 'PENDING';
                  const userPart = t.amount * 0.4;
                  const catName = t.categoryName || t.title;
                  const tDate = t.date || t.transactionDate;
                  
                  return (
                    <tr 
                      key={t.id} 
                      className={`hover:bg-slate-50 transition-colors ${isPending ? 'bg-amber-50/40' : ''}`}
                    >
                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                        {tDate ? new Date(tDate).toLocaleDateString('vi-VN') : ''}
                      </td>
                      <td className="py-3 px-3">
                        <span className="flex items-center gap-2">
                          <i className={getIconClassForCategory(t.type)}></i>
                          {catName}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium">{formatCurrency(t.amount)}</td>
                      <td className={`py-3 px-3 font-semibold ${isPending ? 'text-amber-600' : 'text-[#16a34a]'}`}>
                        {formatCurrency(userPart)}
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
                <p className="text-xs text-amber-600 font-medium mb-1">Phí {pendingTx.categoryName}</p>
                <p className="text-2xl font-bold text-amber-700">{formatCurrency(unpaidAmount)}</p>
                <p className="text-xs text-amber-600 mt-1">
                  Hạn thanh toán: <span className="font-semibold">15/06/2025</span>
                </p>
              </div>

              {/* Payment Methods */}
              <div className="space-y-2 mb-4">
                {/* Method 1: Banking */}
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

                {/* Method 2: Wallet */}
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

                {/* Method 3: QR */}
                <div 
                  onClick={() => setSelectedMethod('qr')}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer hover:border-[#22c55e] transition-colors ${
                    selectedMethod === 'qr' ? 'border-2 border-[#22c55e] bg-[#ecfdf5]' : 'border-slate-200'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <i className="ph ph-qr-code text-slate-600"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">QR Code</p>
                    <p className="text-xs text-slate-400">Quét mã VietQR</p>
                  </div>
                  {selectedMethod === 'qr' ? (
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

          {/* Owner cost splitting */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-base font-semibold mb-4">Phân chia chi phí</h3>
            <div className="space-y-3">
              {/* Mai */}
              <div className="flex items-center gap-3">
                <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg" className="w-8 h-8 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-ink">Nguyễn Thị Mai</span>
                    <span className="font-semibold text-[#16a34a]">{formatCurrency(userShareQ2)}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#22c55e] rounded-full" style={{ width: '40%' }}></div>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">40% · Đã TT</p>
                </div>
              </div>

              {/* Binh */}
              <div className="flex items-center gap-3">
                <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg" className="w-8 h-8 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-ink">Trần Văn Bình</span>
                    <span className="font-semibold text-[#16a34a]">{formatCurrency(totalCostQ2 * 0.3)}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-400 rounded-full" style={{ width: '30%' }}></div>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">30% · Đã TT</p>
                </div>
              </div>

              {/* Tuan */}
              <div className="flex items-center gap-3">
                <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg" className="w-8 h-8 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-ink">Lê Minh Tuấn</span>
                    <span className={`font-semibold ${unpaidAmount > 0 ? 'text-amber-600' : 'text-[#16a34a]'}`}>{formatCurrency(totalCostQ2 * 0.3)}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${unpaidAmount > 0 ? 'bg-amber-400' : 'bg-brand-500'}`} style={{ width: '30%' }}></div>
                  </div>
                  <p className={`text-[11px] mt-0.5 ${unpaidAmount > 0 ? 'text-amber-500' : 'text-slate-400'}`}>
                    30% · {unpaidAmount > 0 ? 'Chờ TT' : 'Đã TT'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CostPage;
