import React, { useState, useEffect } from 'react';
import { getMyTransactions } from '../../services/api';

const TransactionLedger = ({ refreshKey }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, [refreshKey]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await getMyTransactions();
      setTransactions(data || []);
    } catch (err) {
      console.error('Failed to load transaction history', err);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionStyle = (type) => {
    switch (type) {
      case 'IN':
      case 'DEPOSIT':
        return { icon: 'ph-wallet', color: 'text-emerald-600', bg: 'bg-emerald-100/60' };
      case 'OUT':
      case 'TRIP_FEE':
        return { icon: 'ph-car-profile', color: 'text-rose-600', bg: 'bg-rose-100/60' };
      case 'MAINTENANCE':
        return { icon: 'ph-wrench', color: 'text-amber-600', bg: 'bg-amber-100/60' };
      case 'PENALTY':
        return { icon: 'ph-warning-circle', color: 'text-red-600', bg: 'bg-red-100/60' };
      default:
        return { icon: 'ph-arrows-left-right', color: 'text-indigo-600', bg: 'bg-indigo-100/60' };
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-500 font-medium">Đang tải lịch sử giao dịch...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 relative">
      <div className="flex items-center justify-between px-1 mb-2">
        <h3 className="font-extrabold text-slate-900 tracking-tight text-lg">Lịch sử giao dịch</h3>
        <button onClick={fetchTransactions} className="w-8 h-8 rounded-full bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 shadow-sm flex items-center justify-center text-slate-500 transition-all active:scale-95">
          <i className="ph ph-arrows-clockwise text-sm"></i>
        </button>
      </div>
      
      {transactions.length === 0 ? (
        <div className="py-12 bg-white rounded-2xl border border-slate-100 shadow-sm text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <i className="ph ph-receipt text-3xl text-slate-300"></i>
          </div>
          <h4 className="text-base font-bold text-slate-800 mb-1">Chưa có giao dịch</h4>
          <p className="text-sm text-slate-500 font-medium">Các giao dịch nạp, rút hoặc trả phí sẽ hiện ở đây.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map(tx => {
            const isIncome = tx.type === 'IN' || tx.type === 'DEPOSIT';
            const sign = isIncome ? '+' : '-';
            const style = getTransactionStyle(tx.type);
            const dateObj = new Date(tx.date || tx.createdAt);
            
            return (
              <div 
                key={tx.id} 
                className="group relative bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-300 overflow-hidden flex items-center gap-4 cursor-default"
              >
                {/* Decorative side border on hover */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${isIncome ? 'bg-emerald-500' : 'bg-rose-500'} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${style.bg} ${style.color} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                  <i className={`ph-fill ${style.icon} text-xl`}></i>
                </div>
                
                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {tx.categoryName || tx.type}
                    </p>
                    {tx.status === 'PENDING' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">CHỜ TT</span>
                    )}
                  </div>
                  <p className="text-[12px] text-slate-500 line-clamp-2 leading-relaxed">
                    {tx.description || 'Giao dịch hệ thống'}
                  </p>
                </div>
                
                {/* Amount & Date */}
                <div className="text-right shrink-0 flex flex-col items-end">
                  <p className={`text-base font-black tracking-tight ${isIncome ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {sign}{formatCurrency(tx.amount)}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 font-medium bg-slate-50 px-2 py-0.5 rounded-full">
                    {dateObj.toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TransactionLedger;
