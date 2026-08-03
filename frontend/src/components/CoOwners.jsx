import React from 'react';

const CoOwners = ({ coOwners, activeVotes, onVoteClick }) => {
  const getProgressColor = (percentage) => {
    if (percentage >= 40) return 'bg-brand-500';
    if (percentage >= 30) return 'bg-blue-400';
    return 'bg-amber-400';
  };

  const getBorderColor = (percentage) => {
    if (percentage >= 40) return 'ring-2 ring-brand-500/50';
    return '';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <h3 className="text-base font-semibold mb-4">Nhóm đồng sở hữu</h3>
      
      {/* CoOwners List */}
      <div className="space-y-4 mb-5">
        {coOwners.map((owner) => (
          <div key={owner.id} className="flex items-center gap-3">
            <img 
              src={owner.avatarUrl} 
              alt={owner.name} 
              className={`w-10 h-10 rounded-full object-cover ${getBorderColor(owner.ownershipPercentage)}`}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {owner.name || owner.username} 
                <span className={`ml-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                  owner.ownershipPercentage >= 40 ? 'text-brand-600 bg-brand-50' : 'text-slate-500 bg-slate-100'
                }`}>
                  {owner.ownershipPercentage}%
                </span>
              </p>
              
              <div className="h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${getProgressColor(owner.ownershipPercentage)}`}
                  style={{ width: `${owner.ownershipPercentage}%` }}
                ></div>
              </div>
            </div>
            
            {owner.ownershipPercentage >= 40 && (
              <span className="text-[11px] text-brand-600 bg-brand-50 px-2 py-0.5 rounded font-medium">
                Admin nhóm
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Active Votes Section */}
      {activeVotes.map((vote) => (
        <div 
          key={vote.id} 
          className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-center justify-between gap-3"
        >
          <div>
            <p className="text-sm font-semibold text-amber-800">
              {vote.status === 'OPEN' ? '🗳️ Bỏ phiếu đang mở' : '✅ Bỏ phiếu đã đóng'}
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              {vote.description}
            </p>
          </div>
          {vote.status === 'OPEN' && (
            <button 
              onClick={() => onVoteClick(vote.id)}
              className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer"
            >
              Bỏ phiếu
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default CoOwners;
