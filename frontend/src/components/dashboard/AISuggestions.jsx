import React from 'react';

const AISuggestions = ({ suggestions, onAIChatClick }) => {
  const getIconColorClass = (type) => {
    switch (type) {
      case 'WARNING': return 'text-amber-500';
      case 'SUCCESS': return 'text-blue-500';
      default: return 'text-brand-500';
    }
  };

  return (
    <div className="bg-[#f4f4f8] rounded-2xl p-6 flex flex-col">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-violet-500">
          <i className="ph-fill ph-sparkle text-xl"></i>
        </span>
        <h3 className="text-base font-semibold">Gợi ý AI 🤖</h3>
      </div>
      
      <div className="space-y-3 flex-1">
        {suggestions.map((s) => (
          <div 
            key={s.id} 
            className="flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-200/60 shadow-sm"
          >
            <i className={`ph ${s.iconClass} ${getIconColorClass(s.type)} text-lg mt-0.5 shrink-0`}></i>
            <p className="text-sm text-slate-600 leading-snug">
              {/* Process bold text formatting if needed, but standard text is fine */}
              {s.content.includes("12% ít hơn") ? (
                <>
                  Bạn đang sử dụng <span className="font-semibold text-ink">12% ít hơn</span> tỉ lệ sở hữu (40%). Bạn có thể đặt thêm 2 chuyến trong tháng này.
                </>
              ) : s.content.includes("15%") ? (
                <>
                  Chi phí sạc điện tháng này cao hơn <span className="font-semibold text-ink">15%</span> so với tháng trước. Cân nhắc sạc vào khung giờ thấp điểm.
                </>
              ) : s.content.includes("đủ cho 2 lần") ? (
                <>
                  Quỹ bảo dưỡng đang <span className="font-semibold text-ink">đủ cho 2 lần</span> bảo dưỡng tới. Nhắc nhở ngày hạn để tránh phí phạt.
                </>
              ) : (
                s.content
              )}
            </p>
          </div>
        ))}
      </div>
      
      <button 
        onClick={onAIChatClick}
        className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-ink hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
      >
        <i className="ph ph-chat-teardrop-text"></i>
        Chat với AI
      </button>
    </div>
  );
};

export default AISuggestions;
